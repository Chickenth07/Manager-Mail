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

    status: {
      type: String,
      enum: ["processing", "success", "failed", "partial"],
      default: "processing",
    },

    // successCount: {
    //   type: Number,
    //   default: 0,
    // },

    // failCount: {
    //   type: Number,
    //   default: 0,
    // },

    successDetails: [
      {
        email: String,
        at: { type: Date, default: Date.now },
      },
    ],

    failDetails: [
      {
        email: String,
        reason: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MailLog", MailLogSchema);
