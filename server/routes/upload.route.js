import express from "express";
import upload from "../middlewares/upload.js";
import Customer from "../models/Customer.js";

const router = express.Router();

router.post(
  "/customers/:id/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const imagePath = `/uploads/customers/${req.file.filename}`;

      // ⚠️ DÙNG ĐÚNG API CỦA MongooseBase
      const updated = await Customer.update({
        where: { _id: id },
        attr: {
          image: imagePath,
        },
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.json({
        success: true,
        image: imagePath,
      });
    } catch (err) {
      console.error("UPLOAD IMAGE ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;
