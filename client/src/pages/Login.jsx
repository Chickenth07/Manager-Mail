import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import useAuthStore from "../store/useAuthStore";
import { loginSchema } from "../schemas/loginSchema";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
  
    if (!result?.success) {
      const msg = result?.message?.toLowerCase() || "";
  
      if (msg.includes("email")) {
        setError("email", { message: result.message });
      } else if (msg.includes("mật khẩu") || msg.includes("password")) {
        setError("password", { message: result.message });
      } else {
        // fallback (hiếm)
        setError("root", { message: result.message });
      }
    }
  };
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/customers");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
        {/* EMAIL */}
        <div className="flex flex-column gap-1">
          <InputText
            placeholder="Email"
            {...register("email")}
            className={errors.email ? "p-invalid" : ""}
          />
          <div>
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="flex flex-column gap-1">
          <InputText
            type="password"
            placeholder="Password"
            {...register("password")}
            className={errors.password ? "p-invalid" : ""}
          />
          <div>
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>
        </div>

        <Button
          type="submit"
          label={loading ? "Logging in..." : "Login"}
          loading={loading}
          disabled={loading}
        />
      </form>
    </div>
  );
}
