import { create } from "zustand";

export const useCustomerStore = create((set) => ({
  customers: JSON.parse(localStorage.getItem("customers")) || [],

  addCustomer: (c) =>
    set((state) => {
      const list = [...state.customers, c];
      localStorage.setItem("customers", JSON.stringify(list));
      return { customers: list };
    }),

  updateCustomer: (c) =>
    set((state) => {
      const list = state.customers.map((x) => (x.id === c.id ? c : x));
      localStorage.setItem("customers", JSON.stringify(list));
      return { customers: list };
    }),

  deleteCustomer: (id) =>
    set((state) => {
      const list = state.customers.filter((x) => x.id !== id);
      localStorage.setItem("customers", JSON.stringify(list));
      return { customers: list };
    }),
}));
