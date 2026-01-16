import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db/index.js";

import authRoute from "./routes/auth.route.js";
import customerRoute from "./routes/customer.route.js";
import mailRoutes from "./routes/mail.route.js";

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