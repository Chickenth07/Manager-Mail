import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import useCustomerStore from "../store/useCustomerStore";
import AppSidebar from "../components/AppSidebar";
import Paginator from "../components/Paginator";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function Customers() {
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const { isLoggedIn, user, logout } = useAuthStore();

  /* ================= STORE ================= */
  const {
    customers,
    total,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore();

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);

  const paginatorProps = Paginator({
    page,
    rows,
    total,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });

  /* ================= UI STATE ================= */
  const [visible, setVisible] = useState(false);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* ================= GUARD LOGIN ================= */
  useEffect(() => {
    if (!isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchCustomers(page, rows); // ⬅️ Mongo quyết định dữ liệu
  }, [isLoggedIn, page, rows, fetchCustomers]);

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!form.email?.trim()) {
      newErrors.email = "Email không được để trống";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Email không đúng định dạng";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= HANDLERS ================= */
  const openAdd = () => {
    setEditingCustomer(null);
    setForm({ name: "", email: "", phone: "" });
    setErrors({});
    setVisible(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setErrors({});
    setVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingCustomer) {
      await updateCustomer(editingCustomer._id, form);
    } else {
      await addCustomer(form);
    }

    setVisible(false);
    setPage(1); // quay về trang đầu
  };

  const confirmDelete = (customer) => {
    confirmDialog({
      message: `Xóa khách hàng "${customer.name}"?`,
      header: "Xác nhận",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",
      accept: async () => {
        await deleteCustomer(customer._id);
        setPage(1);
      },
    });
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý khách hàng</h2>
      <p>
        Xin chào: <b>{user?.email}</b>
      </p>

      <Button
        icon="pi pi-bars"
        className="mb-3"
        onClick={() => setVisibleLeft(true)}
      />
      <AppSidebar visible={visibleLeft} onHide={() => setVisibleLeft(false)} />

      <Button
        label="Logout"
        icon="pi pi-sign-out"
        className="p-button-text mb-3"
        onClick={logout}
      />

      <div className="mb-3">
        <Button label="Add Customer" icon="pi pi-plus" onClick={openAdd} />
      </div>

      {/* ================= TABLE ================= */}
      <DataTable
        value={customers}
        loading={loading}
        {...paginatorProps}
        emptyMessage="Chưa có khách hàng"
      >
        <Column
          header="STT"
          body={(_, options) =>
            (page - 1) * (rows - 5) + options.rowIndex + 1
          }
          style={{ width: "80px", textAlign: "center" }}
        />

        <Column field="name" header="Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Phone" />

        <Column
          header="Action"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                size="small"
                onClick={() => openEdit(row)}
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                onClick={() => confirmDelete(row)}
              />
            </div>
          )}
        />
      </DataTable>

      {/* ================= DIALOG ================= */}
      <Dialog
        header={editingCustomer ? "Edit Customer" : "Add Customer"}
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "30rem" }}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Name</label>
            <InputText
              value={form.name}
              className={errors.name ? "p-invalid" : ""}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            {errors.name && (
              <small className="p-error">{errors.name}</small>
            )}
          </div>

          <div className="field mb-3">
            <label>Email</label>
            <InputText
              value={form.email}
              className={errors.email ? "p-invalid" : ""}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            {errors.email && (
              <small className="p-error">{errors.email}</small>
            )}
          </div>

          <div className="field mb-3">
            <label>Phone</label>
            <InputText
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>

      <ConfirmDialog />
    </div>
  );
}
