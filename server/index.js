import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db/index.js";

import authRoute from "./routes/auth.route.js";
import customerRoute from "./routes/customer.route.js";
import mailRoutes from "./routes/mail.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

db.connect();

/* ===== ROUTES ===== */
app.use("/api", authRoute);
app.use("/api/customers", customerRoute);
app.use("/api/mail", mailRoutes);

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
