import express from "express";
import MailLog from "../models/MailLog.js";

const router = express.Router();

/* ================= LỊCH SỬ GỬI MAIL (CÓ PHÂN TRANG) ================= */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      MailLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("subject recipients successDetails failDetails status createdAt")
        .lean(),
      MailLog.countDocuments(),
    ]);

    const items = rawItems.map((mail) => {
      const totalCount = mail.recipients.length;
      const successCount = mail.successDetails.length;
      const failCount = mail.failDetails.length;

      const sendingCount = Math.max(
        totalCount - successCount - failCount,
        0
      );

      return {
        _id: mail._id,
        subject: mail.subject,

        successCount,
        failCount,
        sendingCount,

        status: mail.status,
        createdAt: mail.createdAt,
      };
    });

    rawItems.forEach((mail) => {
      console.log("📦 HISTORY ITEM:", {
        id: mail._id.toString(),
        recipients: mail.recipients.length,
        successDetails: mail.successDetails.length,
        failDetails: mail.failDetails.length,
      });
    });

    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const mailLog = await MailLog.findById(req.params.id)
      .select(
        "subject content recipients successDetails failDetails status createdAt"
      )
      .lean();

    if (!mailLog) {
      return res.status(404).json({ message: "Mail log không tồn tại" });
    }

    const totalCount = mailLog.recipients.length;
    const successCount = mailLog.successDetails.length;
    const failCount = mailLog.failDetails.length;
    const sendingCount = Math.max(
      totalCount - successCount - failCount,
      0
    );

    console.log("➡️ MAIL LOG DETAIL:", {
      id: mailLog._id.toString(),
      totalCount,
      successCount,
      failCount,
      sendingCount,
      status: mailLog.status,
    });

    res.json({
      _id: mailLog._id,
      subject: mailLog.subject,
      htmlContent: mailLog.content,

      successEmails: mailLog.successDetails.map((x) => x.email),
      failEmails: mailLog.failDetails, // giữ nguyên để xem error reason

      totalCount,
      successCount,
      failCount,
      sendingCount,

      status: mailLog.status,
      createdAt: mailLog.createdAt,
    });
  } catch (err) {
    console.error("❌ GET MAIL LOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
