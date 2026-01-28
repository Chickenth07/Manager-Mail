import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import useCustomerStore from "../store/useCustomerStore";
import Paginator from "../components/Paginator";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function Customers() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();

  const { isLoggedIn } = useAuthStore();

  const {
    customers,
    total,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    uploadCustomerImage,
    deleteCustomer,
  } = useCustomerStore();

  /* ================= PAGINATION (1-BASED) ================= */
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
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "", 
    company: "",
    email: "",
    phone: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ================= GUARD LOGIN ================= */
  useEffect(() => {
    if (!isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchCustomers(page, rows);
  }, [isLoggedIn, page, rows, fetchCustomers]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!form.email.trim()) {
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
    setForm({ name: "", company: "", email: "", phone: "" });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setVisible(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setImageFile(null);
    setImagePreview(
      customer.image ? `${BASE_URL}${customer.image}` : null
    );
    setErrors({});
    setVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      setSaving(true);
  
      let customerId;
  
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, form);
        customerId = editingCustomer._id;
      } else {
        const created = await addCustomer(form);
        customerId = created._id;
      }
  
      if (imageFile && customerId) {
        await uploadCustomerImage(customerId, imageFile);
      }
  
      await fetchCustomers(1, rows);
      setVisible(false);
      setPage(1);
    } catch (err) {
      if (err?.field) {
        setErrors({ [err.field]: err.message });
        return; 
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
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
        await fetchCustomers(page, rows);
      },
    });
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý khách hàng</h2>

        <Button label="Thêm khách hàng" icon="pi pi-plus" onClick={openAdd} />
      </div>

      <DataTable
        value={customers}
        loading={loading}
        {...paginatorProps}
        emptyMessage="Chưa có khách hàng"
        showGridlines
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          header="STT"
          body={(_, options) => {
            if (rows === 5) {
              return (page - 1) * (rows - 5) + options.rowIndex + 1;
            }
            if (rows === 10) {
              return (page - 1) * (rows - 10) + options.rowIndex + 1;
            }
            if (rows === 20) {
              return (page - 1) * (rows - 20) + options.rowIndex + 1;
            } else {
              return (page - 1) * (rows - 50) + options.rowIndex + 1;
            }
          }}
          style={{ width: "80px", textAlign: "center" }}
          bodyStyle={{ textAlign: "center" }}
        />

        <Column field="name" header="Tên" />
        <Column field="company" header="Công ty" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Số điện thoại" />
        <Column
          header="Ảnh"
          body={(row) =>
            row.image ? (
              <img
                src={`${BASE_URL}${row.image}`}
                className="w-10 h-10 object-cover border"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span className="text-gray-400 italic text-sm">Chưa có</span>
            )
          }
          style={{ width: "100px", textAlign: "center" }}
        />

        <Column
          header="Tính năng"
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
        header={editingCustomer ? "Cập nhật thông tin" : "Thêm khách hàng"}
        visible={visible}
        onHide={() => {
          setVisible(false);
          setEditingCustomer(null);
          setImageFile(null);
          setImagePreview(null);
          setErrors({});
        }}
        style={{ width: "30rem" }}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Tên</label>
            <InputText
              value={form.name}
              className={errors.name ? "p-invalid" : ""}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: null });
                }
              }}
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field mb-3">
            <label>Công ty</label>
            <InputText
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <div className="field mb-3">
            <label>Email</label>
            <InputText
              value={form.email}
              className={errors.email ? "p-invalid" : ""}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="field mb-3">
            <label>Số điện thoại</label>
            <InputText
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="field mb-3">
            <label>Ảnh khách hàng</label>

            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-32 h-32 object-cover border"
              />
            ) : (
              <div className="text-sm text-gray-400 italic">Chưa có ảnh</div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </div>

          <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>

      <ConfirmDialog />
    </>
  );
}
