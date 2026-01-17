import express from "express";
import mongoose from "mongoose";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";

const router = express.Router();

/* ================= SEND MAIL ================= */
router.post("/send", express.json({ limit: "50mb" }), async (req, res) => {
  try {
    const {
      subject,
      content,
      sendToAll,
      externalEmails = [],
      customerIds = [],
      excludedIds = [],
      editorImages = [], // Array of { filename, base64, contentType }
      attachments = [], // Array of { filename, base64, contentType }
    } = req.body;

    // Validation
    if (!subject || !content) {
      return res.status(400).json({ message: "Thiếu subject hoặc content" });
    }

    const sendAll = sendToAll === true || sendToAll === "true";

    let emails = [];

    /* ================= SEND TO ALL ================= */
    if (sendAll) {
      const excludedSet = new Set(
        Array.isArray(excludedIds) ? excludedIds : [excludedIds]
      );

      const customers = await Customer.find({}, "email _id");

      emails = customers
        .filter((c) => !excludedSet.has(String(c._id)))
        .map((c) => c.email)
        .filter((email) => email); // Remove empty emails
    } else {
      /* ================= SEND TO SELECTED ================= */
      const ids = Array.isArray(customerIds) ? customerIds : [customerIds];

      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

      if (!validIds.length && (!externalEmails || externalEmails.length === 0)) {
        return res.status(400).json({ message: "Không có người nhận hợp lệ" });
      }

      const customers = await Customer.find({
        where: { _id: { $in: validIds } },
        attr: "email",
      });

      emails = customers.map((c) => c.email).filter((email) => email); // Remove empty emails

      /* ================= ADD EXTERNAL EMAILS ================= */
      if (Array.isArray(externalEmails) && externalEmails.length > 0) {
        emails.push(
          ...externalEmails.filter(
            (email) => typeof email === "string" && email.trim()
          )
        );
      }
    }

    emails = [...new Set(emails.map((e) => e.toLowerCase()))];

    if (!emails.length) {
      return res.status(400).json({ message: "Không tìm thấy email hợp lệ" });
    }

    /* ================= PROCESS ATTACHMENTS ================= */
    const mailAttachments = [];

    // File attachments thông thường
    if (Array.isArray(attachments)) {
      attachments.forEach((file) => {
        if (file.base64 && file.filename) {
          mailAttachments.push({
            filename: file.filename,
            content: file.base64.split(",")[1] || file.base64, // Remove data:image/...;base64,
            encoding: "base64",
          });
        }
      });
    }

    // Ảnh từ editor - embed vào HTML với CID
    let finalHtml = content;

    if (Array.isArray(editorImages) && editorImages.length > 0) {
      const imageMap = new Map();

      editorImages.forEach((img, index) => {
        if (img.base64 && img.filename) {
          const cid = `editor-image-${Date.now()}-${index}@nodemailer`;
          imageMap.set(index, cid);

          // Thêm vào attachments với cid
          mailAttachments.push({
            filename: img.filename,
            content: img.base64.split(",")[1] || img.base64,
            encoding: "base64",
            cid: cid,
          });
        }
      });

      // Thay thế base64 images trong HTML bằng cid references
      let imageIndex = 0;
      finalHtml = content.replace(
        /<img([^>]+)src="data:image\/[^;]+;base64,[^"]*"([^>]*)>/gi,
        (match, before, after) => {
          const cid = imageMap.get(imageIndex);
          imageIndex++;

          if (cid) {
            return `<img${before}src="cid:${cid}"${after}>`;
          }
          return match;
        }
      );
    }

    /* ================= SEND MAIL ================= */
    const mailOptions = {
      from: `"Mail Manager" <${process.env.MAIL_USER}>`,
      bcc: emails.join(","), // Dùng BCC để ẩn danh sách người nhận
      subject: subject,
      html: finalHtml,
    };

    // Chỉ thêm attachments nếu có
    if (mailAttachments.length > 0) {
      mailOptions.attachments = mailAttachments;
    }

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      count: emails.length,
      message: `Đã gửi email đến ${emails.length} khách hàng`,
    });
  } catch (err) {
    console.error("❌ SEND MAIL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Có lỗi xảy ra khi gửi email",
    });
  }
});

/* ================= TEST MAIL CONNECTION ================= */
router.get("/test", async (req, res) => {
  try {
    await transporter.verify();
    res.json({
      success: true,
      message: "Mail server connection successful",
    });
  } catch (err) {
    console.error("Mail connection error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
