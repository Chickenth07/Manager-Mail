import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const [data, total] = await Promise.all([
      Customer.find({
        where: {},
        page,
        limit,
        sort: { createdAt: -1 },
      }),
      Customer.count({ where: {} }),
    ]);

    res.json({
      data,
      total,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const customer = await Customer.create({
    attr: req.body,
  });
  res.status(201).json(customer);
});

router.put("/:id", async (req, res) => {
  await Customer.update({
    where: { _id: req.params.id },
    attr: req.body,
  });
  res.json({ message: "Updated" });
});

router.delete("/:id", async (req, res) => {
  await Customer.softDelete({
    where: { _id: req.params.id },
  });
  res.json({ message: "Deleted" });
});

export default router;
