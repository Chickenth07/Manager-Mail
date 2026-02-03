import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { transporter } from "../utils/mailer.js";
import { FolderModel } from "../modules/folder/folder.model.js";
import Customer from "../models/Customer.js";
import MailLog from "../models/MailLog.js";

const router = express.Router();

const HTML_KEYS = ["image"];

const renderTemplate = (template, data) => {
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

const GENDER_LABEL_MAP = {
  male: "Ông",
  female: "Bà",
  other: "Ông/Bà",
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

/* ================= SEND MAIL ================= */
router.post("/send", async (req, res) => {
  let customers = [];
  let emails = [];

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
          gender: r.gender || "",
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

    /* ================= EMAIL LIST ================= */
    emails = customers.map((c) => c.email);

    if (Array.isArray(externalEmails)) {
      emails.push(...externalEmails.filter(Boolean));
    }

    emails = [...new Set(emails.map((e) => e.toLowerCase()))];

    if (!emails.length) {
      return res.status(400).json({ message: "Không có email hợp lệ" });
    }

    /* ================= ATTACHMENTS ================= */
    const mailAttachments = [];

    attachments.forEach((file) => {
      if (file.base64 && file.filename) {
        mailAttachments.push({
          filename: file.filename,
          content: file.base64.split(",")[1] || file.base64,
          encoding: "base64",
        });
      }
    });

    let finalHtml = content;

    editorImages.forEach((img, index) => {
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

    for (const customer of customers) {
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
        gender: GENDER_LABEL_MAP[customer.gender] ?? "",
        company: customer.company,
        title: customer.title,
        email: customer.email,
        image: imageHtml,
      };

      const personalizedSubject = renderTemplate(subject, data);
      const personalizedHtml = renderTemplate(finalHtml, data);

      await transporter.sendMail({
        from: `"S-Tech" <${process.env.MAIL_USER}>`,
        to: customer.email,
        subject: personalizedSubject,
        html: personalizedHtml.replace(/\n+/g, "").replace(/>\s+</g, "><"),
        attachments: perMailAttachments,
      });
      successCount++;
    }

    for (const email of externalOnlyEmails) {
      await transporter.sendMail({
        from: `"S-Tech" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html: finalHtml.replace(/\$image/g, ""),
        attachments: mailAttachments,
      });

      successCount++;
    }

    /* ================= LOG ================= */
    await MailLog.create({
      subject,
      content: finalHtml,
      recipients: emails,
      successCount,
      failCount: 0,
      status: "success",
    });

    res.json({
      success: true,
      count: successCount,
      message: `Đã gửi ${successCount} email`,
    });
  } catch (err) {
    console.error("SEND MAIL ERROR:", err);

    await MailLog.create({
      subject: req.body?.subject,
      content: req.body?.content,
      recipients: emails,
      successCount: 0,
      failCount: emails.length,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
