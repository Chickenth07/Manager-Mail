import useAuthStore from "../store/useAuthStore";

export default function Header({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="px-2 py-1 rounded hover:bg-slate-200"
        >
          ☰
        </button>
        <h1 className="font-semibold">Hệ thống gửi mail</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          {user?.name}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-red-500 text-white text-sm"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
