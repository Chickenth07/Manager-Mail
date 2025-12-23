import * as yup from "yup";
import { emailRule, phoneRule } from "./common.schema";

export const customerSchema = yup.object({
  name: yup.string().required("Tên bắt buộc"),
  email: emailRule,
  phone: phoneRule,
});
