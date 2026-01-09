import { NavLink } from "react-router-dom";

export default function Sidebar({ collapsed }) {
  return (
    <aside
      className={`bg-slate-900 text-slate-100 transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >

      <div className="h-16 flex items-center justify-center border-b border-slate-700 font-bold">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
          <span className="text-purple-600 font-bold text-2xl">S</span>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <span className="text-white text-2xl font-bold"> -Tech</span>
          </div>
        )}
      </div>

      <nav className="p-2 space-y-1 text-sm">
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded
            ${isActive ? "bg-slate-800" : "hover:bg-slate-800"}`
          }
        >
          👤 {!collapsed && "Khách hàng"}
        </NavLink>

        <NavLink
          to="/send-mail"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded
            ${isActive ? "bg-slate-800" : "hover:bg-slate-800"}`
          }
        >
          ✉️ {!collapsed && "Gửi Mail"}
        </NavLink>
      </nav>
    </aside>
  );
}
