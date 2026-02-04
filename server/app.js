import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db/index.js";

import authRoute from "./routes/auth.route.js";
import customerRoute from "./routes/customer.route.js";
import uploadRoute from "./routes/upload.route.js";
import mailRoutes from "./routes/mail.route.js";
import mailHistoryRoute from "./routes/mailHistory.route.js"
import templateRouter from "./routes/mailTemplate.js"
import folderRoute from "./modules/folder/folder.route.js";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

db.connect();

/* ===== ROUTES ===== */
app.use("/api", authRoute);
app.use("/api/customers", customerRoute);
app.use("/api/mail", mailRoutes);
app.use("/api/mail-history", mailHistoryRoute);
app.use("/api", uploadRoute);
app.use("/api/folders", folderRoute);
// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "public/uploads"))
// );
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/api/templates", templateRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;