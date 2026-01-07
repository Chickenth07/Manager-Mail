import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Email không đúng định dạng"),
  password: yup
    .string()
    .required("Password là bắt buộc")
    .min(6, "Password tối thiểu 6 ký tự"),
});
