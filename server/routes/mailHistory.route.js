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
        .lean(),
      MailLog.countDocuments(),
    ]);

    const items = rawItems.map((mail) => {
      const totalCount = mail.recipients.length;
      const successCount = mail.successCount || 0;
      const failCount = mail.failCount || 0;

      const sendingCount = Math.max(
        totalCount - successCount - failCount,
        0
      );

      // chuẩn hoá status theo dữ liệu thực
      let status = "processing";

      if (sendingCount === 0) {
        if (failCount === 0) status = "success";
        else if (successCount === 0) status = "failed";
        else status = "partial";
      }

      return {
        ...mail,
        totalCount,
        sendingCount,
        status,
      };
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
        "subject htmlContent recipients successEmails failDetails successCount failCount createdAt"
      )
      .lean();

    if (!mailLog) {
      return res.status(404).json({ message: "Mail log không tồn tại" });
    }

    res.json({
      _id: mailLog._id,
      subject: mailLog.subject,
      htmlContent: mailLog.htmlContent,

      successEmails: mailLog.successEmails || [],
      failEmails: mailLog.failDetails || [],

      successCount: mailLog.successCount || 0,
      failCount: mailLog.failCount || 0,
      totalCount: mailLog.recipients.length,

      createdAt: mailLog.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= DANH SÁCH MAIL THẤT BẠI ================= */
// router.get("/:id/fails", async (req, res) => {
//   const { id } = req.params;

//   const mailLog = await MailLog.findById(id).select("failDetails");

//   if (!mailLog) {
//     return res.status(404).json({ message: "Mail log không tồn tại" });
//   }

//   res.json({
//     items: mailLog.failDetails || [],
//   });
// });

export default router;
