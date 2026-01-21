import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

const useTemplateStore = create((set) => ({
  templates: [],
  total: 0,
  loading: false,

  fetchTemplates: async (page = 1, limit = 5) => {
    set({ loading: true });
    try {
      const res = await fetch(
        `${API_URL}/templates?page=${page}&limit=${limit}`
      );
      const data = await res.json();

      set({
        templates: data.items || data,
        total: data.total || data.length,
      });
    } finally {
      set({ loading: false });
    }
  },

  addTemplate: async (payload) => {
    const res = await fetch(`${API_URL}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  updateTemplate: async (id, payload) => {
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  deleteTemplate: async (id) => {
    await fetch(`${API_URL}/templates/${id}`, { method: "DELETE" });
  },
}));

export default useTemplateStore;
