import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

import { hasMxRecord } from "../utils/emailMxCheck.js";
import { transporter } from "../utils/mailer.js";
import { FolderModel } from "../modules/folder/folder.model.js";
import { classifyMailError } from "../utils/mailErrorClassifier.js";
import { createMailLog, updateMailLog } from "../services/mail.service.js";

import Customer from "../models/Customer.js";

const router = express.Router();

const HTML_KEYS = ["image"];

const normalizeGender = (value) => {
  if (value === null || value === undefined) return "Anh/Chị";

  const v = value.toString().trim().toLowerCase();

  if (v === "") return "Anh/Chị";
  if (["nam", "male", "m"].includes(v)) return "Anh";
  if (["nữ", "nu", "female", "f"].includes(v)) return "Chị";
  if (["other"].includes(v)) return "Anh/Chị";

  return value;
};

const renderTemplate = (template, data) => {

  template = template.replace(
    /\$\{(\w+):([^}]+)\}/g,
    (_, key, content) => {
      if (!data[key]) return "";
      return content.replace(
        new RegExp(`\\$${key}`, "g"),
        escapeHtml(data[key])
      );
    }
  );
  
  // $key$ → in đậm (text)
  template = template.replace(/\$(\w+)\$/g, (_, key) => {
    if (HTML_KEYS.includes(key)) return data[key] ?? "";
    return `<strong>${escapeHtml(data[key] ?? "")}</strong>`;
  });

  // $key → thường (text)
  template = template.replace(/\$(\w+)/g, (_, key) => {
    if (HTML_KEYS.includes(key)) return data[key] ?? "";
    return escapeHtml(data[key] ?? "");
  });

  return template;
};

const escapeHtml = (text) => {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const calcStatus = (success, fail, total) => {
  if (success === total) return "success";
  if (fail === total) return "failed";
  if (success + fail === total) return "partial";
  return "processing";
};

/* ================= SEND MAIL ================= */
router.post("/send", async (req, res) => {
  let customers = [];
  let emails = [];
  let mailLog = null;

  try {
    const {
      subject,
      content,
      sendToAll,
      excelRows = [],
      externalEmails = [],
      customerIds = [],
      excludedIds = [],
      editorImages = [],
      attachments = [],
    } = req.body;

    console.log("EXCEL ROW SAMPLE:", excelRows[0]);

    if (!subject || !content) {
      return res.status(400).json({ message: "Thiếu subject hoặc content" });
    }

    const sendAll = sendToAll === true || sendToAll === "true";

    if (excelRows.length > 0 && sendAll) {
      return res.status(400).json({
        message: "Không thể gửi Excel và gửi toàn bộ khách hàng cùng lúc",
      });
    }

    /* ================= GET CUSTOMERS ================= */
    if (Array.isArray(excelRows) && excelRows.length > 0) {
      customers = excelRows
        .filter((r) => typeof r.email === "string" && r.email.includes("@"))
        .map((r, index) => ({
          _id: `excel-${index}`,
          name: r.name || "",
          gender: normalizeGender(r.gender) || "",
          company: r.company || "",
          title: r.title || "",
          email: r.email,
          image: r.image || "",
          __fromExcel: true,
        }));
    } else {
      if (sendAll) {
        customers = await Customer.find({
          where: {
            _id: { $nin: excludedIds },
            email: { $ne: "" },
          },
          attr: "name gender company email image",
        });
      } else {
        const ids = Array.isArray(customerIds) ? customerIds : [customerIds];
        const validIds = ids.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );

        customers = await Customer.find({
          where: { _id: { $in: validIds }, email: { $ne: "" } },
          attr: "name gender company email image",
        });
      }
    }

    const customerEmails = customers
      .map((c) => c.email)
      .filter(Boolean)
      .map((e) => e.toLowerCase());

    const externalOnlyEmails = externalEmails
      .filter(Boolean)
      .map((e) => e.toLowerCase())
      .filter((e) => !customerEmails.includes(e));

    const totalCustomers = customers.length;
    const totalAll = customers.length + externalOnlyEmails.length;

    /* ================= EMAIL LIST ================= */
    emails = customers.map((c) => c.email).filter(Boolean);

    if (Array.isArray(externalEmails)) {
      emails.push(...externalEmails.filter(Boolean));
    }

    emails = [...new Set(emails.map((e) => e.toLowerCase()))];

    if (!emails.length) {
      return res.status(400).json({ message: "Không có email hợp lệ" });
    }

    let finalHtml = content;

    mailLog = await createMailLog({
      subject,
      content: finalHtml,
      recipients: emails,
    });

    /* ================= ATTACHMENTS ================= */
    const mailAttachments = [];

    attachments.forEach((file) => {
      if (typeof file?.base64 === "string" && file.filename) {
        const base64 = file.base64.includes(",")
          ? file.base64.split(",")[1]
          : file.base64;

        mailAttachments.push({
          filename: file.filename,
          content: base64,
          encoding: "base64",
        });
      }
    });

    editorImages.forEach((img, index) => {
      if (!img?.base64) return;

      const cid = `editor-${index}@mail`;

      mailAttachments.push({
        filename: img.filename || `editor-${index}.png`,
        content: img.base64.split(",")[1],
        encoding: "base64",
        cid,
      });

      finalHtml = finalHtml.replace(img.base64, `cid:${cid}`);
    });

    /* ================= SEND MAIL (ONE BY ONE) ================= */
    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      const validMx = await hasMxRecord(customer.email);

      if (!validMx) {
        failCount++;

        await updateMailLog(mailLog._id, {
          fail: {
            email: customer.email,
            reason: "Domain email không tồn tại",
          },
        });

        continue;
      }

      try {
        const perMailAttachments = mailAttachments.map((a) => ({ ...a }));

        /* ===== RESOLVE IMAGE BY KEY ($image) ===== */
        let imageHtml = "";
        let imagePath = null;

        if (customer.image) {
          const imgKey = customer.image.trim();

          const folderDoc = await FolderModel.findOne({
            deletedAt: null,
            "images.key": imgKey,
          });

          if (folderDoc) {
            const img = folderDoc.images.find((i) => i.key === imgKey);

            if (img?.path) {
              imagePath = path.join(process.cwd(), img.path);
            }
          }
        }

        /* ===== ATTACH CID ===== */
        if (imagePath && fs.existsSync(imagePath)) {
          const cid = `image-${customer._id}@mail`;

          perMailAttachments.push({
            filename: path.basename(imagePath),
            path: imagePath,
            cid,
            contentDisposition: "inline",
          });

          imageHtml = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:0; line-height:0; font-size:0;">
                    <img
                      src="cid:${cid}"
                      alt=""
                      style="
                        display:block;
                        max-width:100%;
                        height:600px;
                        width:auto;
                        border:0;
                        outline:none;
                        text-decoration:none;
                      "
                    />
                  </td>
                </tr>
              </table>
              `;
        }

        const data = {
          name: customer.name,
          gender: customer.gender,
          company: customer.company,
          title: customer.title,
          email: customer.email,
          image: imageHtml,
        };

        const personalizedSubject = renderTemplate(subject, data);
        const personalizedHtml = renderTemplate(finalHtml, data);

        const info = await transporter.sendMail({
          from: `"S-Tech" <${process.env.MAIL_USER}>`,
          to: customer.email,
          subject: personalizedSubject,
          html: personalizedHtml.replace(/\n+/g, "").replace(/>\s+</g, "><"),
          attachments: perMailAttachments,
        });

        successCount++;

        await updateMailLog(mailLog._id, {
          success: {
            email: customer.email,
          },
        });
      } catch (error) {
        const errorInfo = classifyMailError(error);

        failCount++;

        await updateMailLog(mailLog._id, {
          fail: {
            email: customer.email,
            reason: errorInfo.reason,
          },
        });
      }
    }

    for (const email of externalOnlyEmails) {
      const validMx = await hasMxRecord(email);

      if (!validMx) {
        failCount++;

        await updateMailLog(mailLog._id, {
          $push: {
            failDetails: {
              email,
              reason: "Domain email không tồn tại",
            },
          },
        });

        continue;
      }

      try {
        await transporter.sendMail({
          from: `"S-Tech" <${process.env.MAIL_USER}>`,
          to: email,
          subject,
          html: finalHtml.replace(/\$image/g, ""),
          attachments: mailAttachments,
        });
        successCount++;

        await updateMailLog(mailLog._id, {
          success: {
            email: customer.email,
          },
        });
      } catch (error) {
        const errorInfo = classifyMailError(error);

        if (errorInfo.permanent) {
          failCount++;

          await updateMailLog(mailLog._id, {
            $push: {
              failDetails: {
                email,
                reason: errorInfo.reason,
              },
            },
          });
        }
      }
    }

    const finalStatus = calcStatus(successCount, failCount, totalAll);

    res.json({
      success: finalStatus !== "failed",
      status: finalStatus,
      successCount,
      failCount,
    });
  } catch (err) {
    if (mailLog?._id) {
      await updateMailLog(mailLog._id, {
        status: "failed",
        failCount: emails.length,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
