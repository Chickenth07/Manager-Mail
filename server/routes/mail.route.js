import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";

const router = express.Router();

/* ================= PATH ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= MULTER ================= */
const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/* ================= HELPER: INLINE IMAGES ================= */
function processHTMLWithImages(htmlContent) {
  const attachments = [];
  const imageMap = new Map();
  let cid = 0;

  const processedHTML = htmlContent.replace(
    /<img[^>]+src="([^">]+)"[^>]*>/g,
    (match, src) => {
      try {
        if (src.includes("localhost") || src.includes("/uploads")) {
          const filename = src.split("/").pop().split("?")[0];
          const filepath = path.join(__dirname, "../uploads", filename);

          if (fs.existsSync(filepath)) {
            if (!imageMap.has(filepath)) {
              const cidValue = `image${cid++}@ckeditor`;
              imageMap.set(filepath, cidValue);

              attachments.push({
                filename,
                path: filepath,
                cid: cidValue,
              });
            }

            return match.replace(src, `cid:${imageMap.get(filepath)}`);
          }
        }
        return match;
      } catch {
        return match;
      }
    }
  );

  return { html: processedHTML, attachments };
}

/* ================= SEND MAIL ================= */
router.post(
  "/send",
  upload.array("attachments"),
  async (req, res) => {
    try {
      const {
        subject,
        content,
        sendToAll,
        customerIds = [],
        excludedIds = [],
      } = req.body;

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
          .map((c) => c.email);
      } else {
        /* ================= SEND TO SELECTED ================= */
        const ids = Array.isArray(customerIds)
          ? customerIds
          : [customerIds];

        const validIds = ids.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );

        if (!validIds.length) {
          return res
            .status(400)
            .json({ message: "Không có khách hàng hợp lệ" });
        }

        const customers = await Customer.find({
          where: { _id: { $in: validIds  } },
          attr: "email"
        });

        emails = customers.map((c) => c.email);
      }

      if (!emails.length) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy email hợp lệ" });
      }

      /* ================= PROCESS HTML IMAGES ================= */
      const { html, attachments: inlineImages } =
        processHTMLWithImages(content);

      /* ================= FILE ATTACHMENTS ================= */
      const fileAttachments = (req.files || []).map((file) => ({
        filename: file.originalname,
        path: file.path,
      }));

      /* ================= SEND MAIL ================= */
      await transporter.sendMail({
        from: `"Mail Manager" <${process.env.MAIL_USER}>`,
        to: emails.join(","),
        subject,
        html,
        attachments: [...inlineImages, ...fileAttachments],
      });

      res.json({
        success: true,
        count: emails.length,
      });
    } catch (err) {
      console.error("❌ SEND MAIL ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
