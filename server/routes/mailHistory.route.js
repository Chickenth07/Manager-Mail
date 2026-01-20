import express from "express";
import MailLog from "../models/MailLog.js";

const router = express.Router();

/* Lấy toàn bộ lịch sử */
router.get("/", async (req, res) => {
  const data = await MailLog.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json(data);
});

/* Lấy danh sách mail thất bại */
router.get("/:id/failures", async (req, res) => {
  const mail = await MailLog.findById(req.params.id).lean();

  if (!mail) {
    return res.status(404).json({ message: "Không tìm thấy mail" });
  }

  res.json(mail.failures || []);
});

export default router;
