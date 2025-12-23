import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

export default function MainLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`
          bg-indigo-600 text-white transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-purple-600 font-bold text-2xl">S</span>
              </div>
              <span className="text-white text-2xl font-bold">Tech</span>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white ml-auto"
          >
            <i
              className={`pi ${
                collapsed ? "pi-angle-right" : "pi-angle-left"
              }`}
            />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 space-y-2 px-2">
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2 rounded
              hover:bg-indigo-500
              ${isActive ? "bg-indigo-500" : ""}
            `
            }
          >
            <i className="pi pi-users" />
            {!collapsed && <span>Khách hàng</span>}
          </NavLink>

          <NavLink
            to="/email"
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2 rounded
              hover:bg-indigo-500
              ${isActive ? "bg-indigo-500" : ""}
            `
            }
          >
            <i className="pi pi-envelope" />
            {!collapsed && <span>Gửi mail</span>}
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-white shadow flex items-center px-6">
          {/* left placeholder (sau này gắn breadcrumb / title) */}
          <div />

          {/* RIGHT ACTION */}
          <div className="ml-auto">
            <Button
              label="Đăng xuất"
              icon="pi pi-sign-out"
              severity="danger"
              size="small"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
