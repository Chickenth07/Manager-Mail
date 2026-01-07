import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isLoggedIn: !!localStorage.getItem("user"),
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ❗ login sai → trả lỗi về cho component
        return {
          success: false,
          message: data.message || "Login failed",
          errors: data.errors,
        };
      }

      // 👉 Login thành công
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        isLoggedIn: true,
        loading: false,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({
      user: null,
      isLoggedIn: false,
    });
  },
}));

export default useAuthStore;
