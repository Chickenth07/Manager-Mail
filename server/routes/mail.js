import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function: Chuyển đổi HTML content và nhúng ảnh
function processHTMLWithImages(htmlContent) {
  const attachments = [];
  const imageMap = new Map();
  let cid = 0;

  console.log("🔧 Processing HTML for images...");

  // Regex tìm tất cả thẻ img
  const processedHTML = htmlContent.replace(
    /<img[^>]+src="([^">]+)"[^>]*>/g,
    (match, src) => {
      console.log("🖼️ Found image src:", src);
      
      try {
        // Kiểm tra nếu là URL localhost
        if (src.includes('localhost') || src.includes('/uploads/')) {
          // Lấy tên file từ URL
          const filename = src.split('/').pop().split('?')[0];
          const filepath = path.join(__dirname, '../uploads', filename);

          console.log("📂 Looking for file:", filepath);
          console.log("📁 File exists:", fs.existsSync(filepath));

          // Kiểm tra file có tồn tại không
          if (fs.existsSync(filepath)) {
            // Tạo CID duy nhất cho mỗi file
            if (!imageMap.has(filepath)) {
              const cidValue = `image${cid++}@ckeditor`;
              imageMap.set(filepath, cidValue);

              // Thêm vào attachments
              attachments.push({
                filename: filename,
                path: filepath,
                cid: cidValue,
              });

              console.log(`✅ Added attachment: ${filename} with CID: ${cidValue}`);
            }

            // Thay thế src bằng cid
            const cidValue = imageMap.get(filepath);
            const newMatch = match.replace(src, `cid:${cidValue}`);
            console.log("🔄 Replaced src with CID:", cidValue);
            return newMatch;
          } else {
            console.warn(`⚠️ File not found: ${filepath}`);
          }
        } else {
          console.log("🌐 External URL, keeping as is");
        }
        
        // Nếu là URL external, giữ nguyên
        return match;
      } catch (error) {
        console.error('❌ Error processing image:', error);
        return match;
      }
    }
  );

  console.log(`✅ Processing complete. Found ${attachments.length} images`);

  return { html: processedHTML, attachments };
}

router.post("/send", async (req, res) => {
  try {
    const { subject, content, sendToAll, customerIds } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: "Thiếu subject hoặc content" });
    }

    const sendAll = sendToAll === true || sendToAll === "true";

    console.log("📧 ===== SEND MAIL REQUEST =====");
    console.log("Subject:", subject);
    console.log("SendAll:", sendAll);
    console.log("CustomerIds raw:", customerIds);
    console.log("CustomerIds length:", customerIds?.length);

    console.log("TYPE customerIds:", typeof customerIds);
    console.log("IS ARRAY:", Array.isArray(customerIds));
    console.log("RAW customerIds:", customerIds);

    let emails = [];

    
    /* ================= SEND TO ALL ================= */
    if (sendAll) {
      console.log("🌐 MODE: SEND TO ALL CUSTOMERS");

      const customers = await Customer.find({}, "email");
      emails = customers.map((c) => c.email);
    } else {
      /* ================= SEND TO SELECTED ================= */
      console.log("👥 MODE: SEND TO SELECTED CUSTOMERS");

      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({
          message: "Không có khách hàng nào được chọn",
        });
      }

      // 🔥 VALIDATE: Kiểm tra ObjectId hợp lệ
      const validIds = customerIds.filter((id) => {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) {
          console.warn("⚠️ Invalid ObjectId:", id);
        }
        return isValid;
      });

      console.log("✅ Valid IDs:", validIds);

      if (validIds.length === 0) {
        return res.status(400).json({
          message: "Không có ID hợp lệ",
        });
      }

      const objectIds = validIds.map((id) => new mongoose.Types.ObjectId(id));

      console.log("🔍 Querying with ObjectIds:", objectIds);

      const customers = await Customer.find({
        where: { _id: { $in: objectIds } },
        attr: "email"
      });

      console.log("📦 Found customers:", customers.length);
      console.log(
        "📧 Found emails:",
        customers.map((c) => c.email)
      );

      emails = customers.map((c) => c.email);
    }

    /* ================= SAFE GUARD ================= */
    if (!emails.length) {
      return res.status(400).json({
        message: "Không tìm thấy email hợp lệ",
      });
    }

    /* ================= PROCESS HTML WITH IMAGES ================= */
    const { html, attachments } = processHTMLWithImages(content);

    console.log(`📧 Sending to ${emails.length} customers...`);
    console.log(`🖼️ Attachments: ${attachments.length}`);
    
    if (attachments.length > 0) {
      console.log("📎 Attachment details:");
      attachments.forEach((att, i) => {
        console.log(`  ${i + 1}. ${att.filename} (CID: ${att.cid})`);
      });
    }

    /* ================= SEND EMAIL WITH INLINE IMAGES ================= */
    await transporter.sendMail({
      from: `"Mail Manager" <${process.env.MAIL_USER || "mail@gmail.com"}>`,
      to: emails.join(","),
      subject,
      html: html, // Sử dụng HTML đã được xử lý
      attachments: attachments, // Thêm attachments
    });

    console.log("✅ EMAIL SENT SUCCESSFULLY");

    res.json({
      success: true,
      count: emails.length,
    });
  } catch (err) {
    console.error("❌ SEND MAIL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;