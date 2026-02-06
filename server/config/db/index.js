import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function connect() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    console.error("❌ Kết nối MongoDB thất bại");
    console.error(error);
    process.exit(1);
  }
}

export default { connect };