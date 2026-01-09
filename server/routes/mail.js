import express from "express";
import { transporter } from "../utils/mailer.js";
import Customer from "../models/Customer.js";

const router = express.Router();

router.post("/send", async (req, res) => {
    try {
      const { subject, content, sendToAll, customerIds } = req.body;
  
      let emails = [];
  
      if (sendToAll) {
        const customers = await Customer.find({}, "email");
        emails = customers.map((c) => c.email);
      } else {
        const customers = await Customer.find(
          { _id: { $in: customerIds } },
          "email"
        );
        emails = customers.map((c) => c.email);
      }
  
      if (!emails.length) {
        return res.status(400).json({ message: "Không có email nào để gửi" });
      }
  
      console.log("📧 Sending to:", emails); // Debug log
  
      // GỬI HÀNG LOẠT
      const info = await transporter.sendMail({
        from: `"Mail Manager" <${process.env.MAIL_USER}>`,
        to: emails.join(","),
        subject,
        html: `<p>${content}</p>`,
      });
  
      console.log("✅ Email sent:", info.messageId); // Debug log
  
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
