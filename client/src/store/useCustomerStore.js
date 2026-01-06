import { create } from "zustand";

const useCustomerStore = create((set) => ({
  customers: [],
  total: 0,
  loading: false,

  fetchCustomers: async (page = 0, limit = 5) => {
    set({ loading: true });

    const res = await fetch(
      `http://localhost:3000/api/customers?page=${page}&limit=${limit}`
    );
    const json = await res.json();

    set({
      customers: json.data,
      total: json.total,
      loading: false,
    });
  },

  addCustomer: async (data) => {
    await fetch("http://localhost:3000/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  updateCustomer: async (id, data) => {
    await fetch(`http://localhost:3000/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  deleteCustomer: async (id) => {
    await fetch(`http://localhost:3000/api/customers/${id}`, {
      method: "DELETE",
    });
  },
}));

export default useCustomerStore;
