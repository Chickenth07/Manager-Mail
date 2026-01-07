import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email không được để trống")
    .email("Email không đúng định dạng"),
  password: yup
    .string()
    .required("Mật khẩu không được để trống")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});