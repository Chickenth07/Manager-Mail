import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";
import MailLog from "../models/MailLog.js";

const router = express.Router();

/* ================= TEMPLATE RENDER ================= */
// const renderTemplate = (template, data) => {
//   return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
//     return data[key] ?? "";
//   });
// };

const renderTemplate = (template, data) => {
  // 1. In đậm: $name$
  template = template.replace(/\$(\w+)\$/g, (_, key) => {
    const value = data[key] ?? "";
    return `<strong>${escapeHtml(value)}</strong>`;
  });

  // 2. In thường: $name
  template = template.replace(/\$(\w+)/g, (_, key) => {
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

/* ================= SEND MAIL ================= */
router.post("/send", async (req, res) => {
  let customers = [];
  let emails = [];

  try {
    const {
      subject,
      content,
      sendToAll,
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

    const customerEmails = customers.map((c) => c.email.toLowerCase());

    const externalOnlyEmails = externalEmails
      .map((e) => e.toLowerCase())
      .filter((e) => !customerEmails.includes(e));


    /* ================= GET CUSTOMERS ================= */
    if (sendAll) {
      customers = await Customer.find({
        where: {
          _id: { $nin: excludedIds },
          email: { $ne: "" },
        },
        attr: "name company email image",
      });
    } else {
      const ids = Array.isArray(customerIds) ? customerIds : [customerIds];
      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

      customers = await Customer.find({
        where: { _id: { $in: validIds }, email: { $ne: "" } },
        attr: "name company email image",
      });
    }

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

    const needAvatar =
      finalHtml.includes("{{imageTag}}") || finalHtml.includes("cid:avatar-");

    for (const customer of customers) {
      const perMailAttachments = mailAttachments.map((a) => ({ ...a }));

      /* ===== AVATAR CUSTOMER (CID) ===== */
      let avatarCid = null;

      console.log("Customer image field:", customer.image);

      // if (customer.image) {
      //   const relativePath = customer.image.replace(/^\/+/, "");

      //   const filePath = path.join(process.cwd(), "public", relativePath);

      //   console.log("Resolved filePath:", filePath);
      //   console.log("File exists:", fs.existsSync(filePath));

      //   if (fs.existsSync(filePath)) {
      //     avatarCid = `avatar-${customer._id}@mail`;

      //     perMailAttachments.push({
      //       filename: path.basename(filePath),
      //       path: filePath,
      //       cid: avatarCid,
      //       contentDisposition: "inline",
      //     });
      //   }
      // }

      if (needAvatar && customer.image) {
        const relativePath = customer.image.replace(/^\/+/, "");
        const filePath = path.join(process.cwd(), "public", relativePath);

        if (fs.existsSync(filePath)) {
          avatarCid = `avatar-${customer._id}@mail`;

          perMailAttachments.push({
            filename: path.basename(filePath),
            path: filePath,
            cid: avatarCid,
            contentDisposition: "inline",
          });
        }
      }

      // const data = {
      //   name: customer.name,
      //   email: customer.email,

      //   // HTML IMG – CHỈ CID
      //   imageTag: `
      //     <img
      //       src="cid:${avatarCid}"
      //       alt="${customer.name}"
      //       width="600"
      //       style="width:640px; max-width:100%; height:auto; display:block; margin:0 auto;"
      //     />
      //   `,
      // };

      const data = {
        name: customer.name,
        company: customer.company,
        email: customer.email,
        imageTag: avatarCid
          ? `
            <img
              src="cid:${avatarCid}"
              alt="${customer.name}"
              width="640"
              style="width:640px; max-width:100%; height:auto; display:block; margin:0 auto;"
            />
          `
          : "",
      };

      const personalizedSubject = renderTemplate(subject, data);
      const personalizedHtml = renderTemplate(finalHtml, data);

      console.log("HTML AFTER RENDER:", personalizedHtml);
      console.log("CID:", avatarCid);
      console.log(
        "Attachments:",
        perMailAttachments.map((a) => a.cid)
      );

      await transporter.sendMail({
        from: `"S-Tech" <${process.env.MAIL_USER}>`,
        to: customer.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        attachments: perMailAttachments,
      });
      successCount++;
    }

    for (const email of externalOnlyEmails) {
      await transporter.sendMail({
        from: `"S-Tech" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html: finalHtml.replace(/{{\s*imageTag\s*}}/g, ""),
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
