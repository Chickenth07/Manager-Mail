import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import useCustomerStore from "../store/useCustomerStore";
import AppSidebar from "../components/AppSidebar";

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

  /* ================= Validate ================= */
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // NAME
    if (!form.name || !form.name.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    // EMAIL
    if (!form.email || !form.email.trim()) {
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

  /* ================= STATE ================= */
  const [visible, setVisible] = useState(false);

  const [visibleLeft, setVisibleLeft] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* ================= GUARD LOGIN ================= */
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (isLoggedIn) {
      fetchCustomers(page + 1, rows);
    }
  }, [isLoggedIn, page, rows, fetchCustomers]);

  /* ================= HANDLERS ================= */
  const openAdd = () => {
    setEditingCustomer(null);
    setForm({ name: "", email: "", phone: "" });
    setVisible(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
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
    setErrors({});
    setPage(0);
    // fetchCustomers(1, rows);
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
        setPage(0);
        // fetchCustomers(1, rows);
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
      {/* ================= Sidebar ================= */}

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
      <DataTable
        value={customers}
        lazy
        paginator
        totalRecords={total}
        rows={rows}
        first={page * rows}
        onPage={(e) => {
          setPage(e.page);
          setRows(e.rows);
        }}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="Chưa có khách hàng"
      >
        <Column
          header="STT"
          body={(_, options) => page * rows + options.rowIndex + 1}
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
      {/* ===== Dialog Add / Edit ===== */}
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
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors({ ...errors, name: null });
              }}
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field mb-3">
            <label>Email</label>
            <InputText
              value={form.email}
              className={errors.email ? "p-invalid" : ""}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors({ ...errors, email: null });
              }}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="field mb-3">
            <label>Phone</label>
            <InputText
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>
      {/* ===== Confirm Delete ===== */}
      <ConfirmDialog />
    </div>
  );
}
