import express from "express";
import mongoose from "mongoose";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";

const router = express.Router();

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

      // 🔥 FIX: Ép STRING → ObjectId
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

    await transporter.sendMail({
      from: `"Mail Manager" <${process.env.MAIL_USER || "mail@gmail.com"}>`,
      to: emails.join(","),
      subject,
      html: `<p>${content}</p>`,
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
