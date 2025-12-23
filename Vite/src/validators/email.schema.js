import * as yup from "yup";

export const emailSendSchema = yup.object({
  subject: yup
    .string()
    .required("Tiêu đề email bắt buộc"),
  content: yup
    .string()
    .required("Nội dung email bắt buộc"),
});
