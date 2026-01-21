import express from "express";
import MailLog from "../models/MailLog.js";

const router = express.Router();

/* ================= LỊCH SỬ GỬI MAIL (CÓ PHÂN TRANG) ================= */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MailLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MailLog.countDocuments(),
    ]);

    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= DANH SÁCH MAIL THẤT BẠI ================= */
router.get("/:id/failures", async (req, res) => {
  try {
    const mail = await MailLog.findById(req.params.id).lean();

    if (!mail) {
      return res.status(404).json({ message: "Không tìm thấy mail" });
    }

    res.json(mail.failures || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
