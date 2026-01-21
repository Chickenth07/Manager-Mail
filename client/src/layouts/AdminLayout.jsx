import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import useAuthStore from "../store/useAuthStore";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  /* ===== GLOBAL AUTH GUARD ===== */
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} />

      {/* MAIN */}
      <div className="flex flex-col flex-1">
        {/* HEADER */}
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
