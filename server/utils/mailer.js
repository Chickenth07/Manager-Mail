import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "he181679nguyenvansang@gmail.com", // Hardcode tạm
    pass: "tnmlducvburiqwao", // App Password không có khoảng trắng
  },
  family: 4
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mailer error:", err);
  } else {
    console.log("✅ Mail server ready");
  }
});