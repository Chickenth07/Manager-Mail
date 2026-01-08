import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

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
          {children}
        </main>
      </div>
    </div>
  );
}
