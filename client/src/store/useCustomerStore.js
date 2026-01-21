import { create } from "zustand";

const API_URL = "http://localhost:3000/api";

const useCustomerStore = create((set) => ({
  customers: [],
  total: 0,
  loading: false,

  fetchCustomers: async (page = 1, limit = 5) => {
    try {
      set({ loading: true });

      const res = await fetch(
        `${API_URL}/customers?page=${page}&limit=${limit}`
      );

      if (!res.ok) {
        throw new Error("Fetch customers failed");
      }

      const json = await res.json();

      set({
        customers: json.data,
        total: json.total,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  addCustomer: async (data) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    const result = await res.json();
  
    if (!res.ok) {
      throw result;
    }
    return result;
  },

  updateCustomer: async (id, data) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    const result = await res.json();
  
    if (!res.ok) {
      throw result;
    }
  
    return result;
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Delete customer failed");
    }

    return true;
  },

  uploadCustomerImage: async (id, file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/customers/${id}/image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let message = "Upload image failed";
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (_) {}
      throw new Error(message);
    }

    return await res.json();
  },
}));

export default useCustomerStore;
