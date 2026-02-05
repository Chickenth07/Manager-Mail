export function classifyMailError(error) {
    const msg = (error.response || error.message || "").toLowerCase();
  
    // (1) Email không tồn tại
    if (
      msg.includes("5.1.1") ||
      msg.includes("user unknown") ||
      msg.includes("no such user")
    ) {
      return {
        type: "INVALID_EMAIL",
        reason: "Email không tồn tại",
        permanent: true,
      };
    }
  
    // (3) Mailbox đầy
    if (
      msg.includes("5.2.2") ||
      msg.includes("mailbox full") ||
      msg.includes("quota exceeded")
    ) {
      return {
        type: "MAILBOX_FULL",
        reason: "Hộp thư đầy",
        permanent: true,
      };
    }
  
    // (4) Spam / bị từ chối
    if (
      msg.includes("spam") ||
      msg.includes("rejected") ||
      msg.includes("5.7.1") ||
      msg.includes("blocked")
    ) {
      return {
        type: "SPAM_REJECTED",
        reason: "Mail bị từ chối (spam / nội dung)",
        permanent: true,
      };
    }
  
    // mặc định: lỗi khác
    return {
      type: "UNKNOWN",
      reason: "Lỗi gửi mail",
      permanent: false,
    };
  }
  