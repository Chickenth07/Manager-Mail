import mongoose from "mongoose";

const MailLogSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    recipients: {
      type: [String],
      default: [],
    },

    successCount: {
      type: Number,
      default: 0,
    },

    failCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      required: true,
    },

    failures: [
      {
        email: String,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MailLog", MailLogSchema);
