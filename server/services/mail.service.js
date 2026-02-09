import MailLog from "../models/MailLog.js";
import { io } from "../server.js";

const computeMailStatus = (mail) => {
  const total = mail.recipients.length;
  const success = mail.successDetails.length;
  const failed = mail.failDetails.length;

  const sending = Math.max(total - success - failed, 0);

  if (sending > 0) return "processing";
  if (failed === 0) return "success";
  if (success === 0) return "failed";
  return "partial";
};

/* ===== CREATE ===== */
export const createMailLog = async (data) => {
  const mail = await MailLog.create({
    subject: data.subject,
    content: data.content,
    recipients: data.recipients,
    successDetails: [],
    failDetails: [],
    status: "processing",
  });

  io.emit("mail:created", {
    _id: mail._id,
    subject: mail.subject,
    successCount: 0,
    failCount: 0,
    sendingCount: mail.recipients.length,
    status: mail.status,
    createdAt: mail.createdAt,
  });

  return mail;
};

/* ===== UPDATE ===== */
export const updateMailLog = async (mailLogId, data) => {
  const update = { $push: {} };

  if (data.success) {
    update.$push.successDetails = {
      email: data.success.email,
      at: new Date(),
    };
  }

  if (data.fail) {
    update.$push.failDetails = {
      email: data.fail.email,
      reason: data.fail.reason,
      at: new Date(),
    };
  }

  await MailLog.updateOne({ _id: mailLogId }, update);

  // ⬅️ FETCH LẠI SAU KHI PUSH
  const mail = await MailLog.findById(mailLogId).lean();
  if (!mail) return null;

  const status = computeMailStatus(mail);

  await MailLog.updateOne(
    { _id: mailLogId },
    { status }
  );

  const successCount = mail.successDetails.length;
  const failCount = mail.failDetails.length;
  const sendingCount =
    mail.recipients.length - successCount - failCount;

  io.emit("mail:progress", {
    mailLogId: mail._id,
    successCount,
    failCount,
    sendingCount,
    status,
  });

  console.log("📡 SOCKET EMIT:", {
    id: mail._id.toString(),
    successCount,
    failCount,
    sendingCount,
    status,
  });

  return mail;
};

