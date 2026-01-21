import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

const handleDuplicateError = (err, res) => {
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    return res.status(400).json({
      field,
      message:
        field === "email"
          ? "Email đã tồn tại trong hệ thống"
          : "Số điện thoại đã tồn tại trong hệ thống",
    });
  }

  return res.status(500).json({ message: err.message });
};

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

    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, phone } = req.body;

    const existedEmail = await Customer.findOne({
      where: { email },
    });

    if (existedEmail) {
      return res.status(400).json({
        field: "email",
        message: "Email đã tồn tại trong hệ thống",
      });
    }

    const customer = await Customer.create({
      attr: req.body,
    });

    res.status(201).json(customer);
  } catch (err) {
    return handleDuplicateError(err, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const id = req.params.id;

    if (email) {
      const existedEmail = await Customer.findOne({
        where: {
          _id: { $ne: id },
          email,
        },
      });

      if (existedEmail) {
        return res.status(400).json({
          field: "email",
          message: "Email đã tồn tại trong hệ thống",
        });
      }
    }

    await Customer.update({
      where: { _id: id },
      attr: req.body,
    });

    res.json({ message: "Updated" });
  } catch (err) {
    return handleDuplicateError(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  await Customer.softDelete({
    where: { _id: req.params.id },
  });
  res.json({ message: "Deleted" });
});

export default router;
