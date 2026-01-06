import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  // 👉 Login xong → vào customers
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/customers");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="flex flex-column gap-3">
        {/* EMAIL */}
        <div className="flex flex-column gap-1">
          <InputText
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "p-invalid" : ""}
          />
        </div>

        {/* PASSWORD */}
        <div className="flex flex-column gap-1">
          <InputText
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? "p-invalid" : ""}
          />
        </div>

        {/* ERROR */}
        <div>{error && <small className="p-error">{error}</small>}</div>

        {/* BUTTON */}
        <Button
          type="submit"
          label={loading ? "Logging in..." : "Login"}
          loading={loading}
          disabled={loading}
          className="mt-2"
        />
      </form>
    </div>
  );
}
