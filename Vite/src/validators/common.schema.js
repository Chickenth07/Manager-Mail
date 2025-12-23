import * as yup from "yup";

export const emailRule = yup
  .string()
  .email("Email không hợp lệ")
  .required("Email bắt buộc");

export const phoneRule = yup
  .string()
  .matches(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
  .required("Số điện thoại bắt buộc");

export const passwordRule = yup
  .string()
  .min(6, "Mật khẩu phải có it nhất 6 kí tự")
  .required("Mật khẩu bắt buộc");
