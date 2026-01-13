import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db/index.js";

import authRoute from "./routes/auth.route.js";
import customerRoute from "./routes/customer.route.js";
import mailRoutes from "./routes/mail.js";
import uploadRouter from "./routes/upload.route.js";

dotenv.config();

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

db.connect();

/* ===== ROUTES ===== */
app.use("/api", authRoute);
app.use("/api/customers", customerRoute);
app.use("/api/mail", mailRoutes);
app.use("/api/uploads", uploadRouter);

// Serve static files - đường dẫn phải khớp với folder uploads/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});