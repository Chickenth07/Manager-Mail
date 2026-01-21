import express from "express";
import MailTemplate from "../models/MailTemplate.js";

const router = express.Router();

/* GET ALL */
router.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MailTemplate.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MailTemplate.countDocuments({ deletedAt: null }),
  ]);

  res.json({ items, total });
});

/* CREATE */
router.post("/", async (req, res) => {
  try {
    const { name, subject, html, description } = req.body;

    if (!name || !subject || !html) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const template = await MailTemplate.create({
      name,
      subject,
      html,
      description,
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE */
router.put("/:id", async (req, res) => {
  try {
    const template = await MailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE (SOFT) */
router.delete("/:id", async (req, res) => {
  try {
    const template = await MailTemplate.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
