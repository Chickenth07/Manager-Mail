import MailLog from "../models/MailLog.js";
import { io } from "../server.js";

/* ===== CREATE ===== */
export const createMailLog = async (data) => {
  const mail = await MailLog.create({
    subject: data.subject,
    content: data.content,
    recipients: data.recipients,
    successCount: 0,
    failCount: 0,
    status: "processing",
  });

  io.emit("mail:created", {
    _id: mail._id,
    subject: mail.subject,
    successCount: 0,
    failCount: 0,
    status: mail.status,
    createdAt: mail.createdAt,
  });

  return mail;
};

/* ===== UPDATE ===== */
export const updateMailLog = async (mailLogId, data) => {
  const updated = await MailLog.findByIdAndUpdate(
    mailLogId,
    data,
    { new: true }
  );

  if (!updated) return null;

  io.emit("mail:progress", {
    mailLogId: updated._id,
    successCount: updated.successCount,
    failCount: updated.failCount,
    status: updated.status,
  });

  return updated;
};