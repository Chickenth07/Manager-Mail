import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { emailRule, passwordRule } from "@/validators/common.schema";

import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";

const schema = yup.object({
  email: emailRule,
  password: passwordRule,
});

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    control,          // 👈 BẮT BUỘC
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        {/* Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-purple-600 font-bold text-2xl">S</span>
            </div>
            <span className="text-white text-2xl font-bold">Tech</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Chào mừng trở lại!
          </h1>
          <p className="text-purple-100 text-lg">
            Đăng nhập để quản lý khách hàng và phát triển doanh nghiệp của bạn
          </p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <p className="text-white mb-4 italic">
            "Hệ thống Manager Mail giúp bạn quản lý khách hàng hiệu quả hơn 200%"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">S</span>
            </div>
            <div>
              <p className="text-white font-semibold">Nguyễn Văn Sáng</p>
              <p className="text-purple-200 text-sm">CEO, S-Tech</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="flex w-full justify-center text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
              <p className="flex w-full justify-center text-gray-500">Nhập thông tin để tiếp tục</p>
            </div>

            <form
              onSubmit={handleSubmit(() => {
                login();
                navigate("/customers");
              })}
              className="space-y-5"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <i className="pi pi-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    {...register("email")}
                    placeholder="example@email.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <i className="pi pi-exclamation-circle text-xs"></i>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <i className="pi pi-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
                      <Password
                        {...field}
                        feedback={false}
                        placeholder="••••••••"
                        toggleMask
                        inputClassName="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                        className="w-full"
                      />
                    </div>
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <i className="pi pi-exclamation-circle text-xs"></i>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    inputId="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.checked)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <Button 
                label="Đăng nhập" 
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  outlined
                  className="py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex w-full items-center justify-center gap-2">
                    <i className="pi pi-google text-red-500 "></i>
                    <span className="text-gray-700 font-medium">Google</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  outlined
                  className="py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex w-full items-center justify-center gap-2">
                    <i className="pi pi-facebook text-blue-600"></i>
                    <span className="text-gray-700 font-medium">Facebook</span>
                  </div>
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="#" className="font-semibold text-purple-600 hover:text-purple-700">
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 S-Tech. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}