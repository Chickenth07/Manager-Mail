import { useCustomerStore } from "@/store/customerStore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { customerSchema } from "@/validators/customer.schema";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { useState, useRef } from "react";
import FormInput from "@/components/FormInput";

export default function Customers() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const toast = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerSchema),
  });

  // 👉 Thêm / Sửa
  const onSubmit = (data) => {
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...data });
      toast.current.show({
        severity: "success",
        summary: "Thành công",
        detail: "Đã cập nhật khách hàng",
      });
    } else {
      addCustomer({ id: Date.now(), ...data });
      toast.current.show({
        severity: "success",
        summary: "Thành công",
        detail: "Đã thêm khách hàng",
      });
    }

    reset();
    setEditingCustomer(null);
    setOpen(false);
  };

  // 👉 Xác nhận xóa
  const confirmDelete = (customer) => {
    confirmDialog({
      header: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa khách hàng "${customer.name}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",

      accept: () => {
        deleteCustomer(customer.id);
        toast.current.show({
          severity: "success",
          summary: "Đã xóa",
          detail: "Khách hàng đã được xóa",
        });
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Toast & Confirm */}
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Quản lý khách hàng</h1>
        <Button
          label="Thêm khách hàng"
          icon="pi pi-plus"
          onClick={() => {
            reset();
            setEditingCustomer(null);
            setOpen(true);
          }}
        />
      </div>

      {/* Table */}
      <DataTable value={customers} stripedRows>
        <Column field="name" header="Tên" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Số điện thoại" />
        <Column
          header="Hành động"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                severity="info"
                rounded
                onClick={() => {
                  setEditingCustomer(row);
                  reset(row);
                  setOpen(true);
                }}
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                onClick={() => confirmDelete(row)}
              />
            </div>
          )}
        />
      </DataTable>

      {/* Dialog Add / Edit */}
      <Dialog
        header={editingCustomer ? "Sửa khách hàng" : "Thêm khách hàng"}
        visible={open}
        onHide={() => {
          setOpen(false);
          setEditingCustomer(null);
          reset();
        }}
        style={{ width: "30rem" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormInput
            name="name"
            placeholder="Tên"
            register={register}
            error={errors.name}
          />
          <FormInput
            name="email"
            placeholder="Email"
            register={register}
            error={errors.email}
          />
          <FormInput
            name="phone"
            placeholder="Số điện thoại"
            register={register}
            error={errors.phone}
          />

          <Button
            label={editingCustomer ? "Cập nhật" : "Lưu"}
            type="submit"
            className="w-full"
          />
        </form>
      </Dialog>
    </div>
  );
}
