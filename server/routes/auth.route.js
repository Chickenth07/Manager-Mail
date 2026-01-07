import express from "express";
import User from "../models/User.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Email không tồn tại" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Sai mật khẩu" });
  }

  res.json({
    message: "Login thành công",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export default router;
