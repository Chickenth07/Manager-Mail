import { useCustomerStore } from "@/store/customerStore";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { emailSendSchema } from "@/validators/email.schema";

export default function SendEmail() {
  const { customers } = useCustomerStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const toast = useRef(null);

  /* ================= FORM ================= */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(emailSendSchema),
  });

  /* ================= CHỌN KHÁCH ================= */
  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (customers.length === 0) return;

    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const headerCheckbox = (
    <Checkbox
      binary
      checked={
        customers.length > 0 &&
        selectedIds.length === customers.length
      }
      indeterminate={
        selectedIds.length > 0 &&
        selectedIds.length < customers.length
      }
      onChange={(e) => {
        if (e.checked) {
          setSelectedIds(customers.map((c) => c.id));
        } else {
          setSelectedIds([]);
        }
      }}
    />
  );

  /* ================= SUBMIT ================= */
  const onSubmit = () => {
    toast.current.show({
      severity: "success",
      summary: "Thành công",
      detail: `Đã gửi email đến ${selectedIds.length} khách hàng`,
      life: 3000,
    });

    reset();
    setSelectedIds([]);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <Toast ref={toast} />

      <h1 className="text-xl font-bold">Gửi Email</h1>

      {/* ====== TABLE KHÁCH HÀNG ====== */}
      <div>
        <h2 className="font-semibold mb-3">Danh sách khách hàng</h2>

        <DataTable
          value={customers}
          stripedRows
          emptyMessage="Chưa có khách hàng"
          rowClassName={(row) =>
            selectedIds.includes(row.id)
              ? "bg-indigo-50 cursor-pointer"
              : "cursor-pointer"
          }
          onRowClick={(e) => toggleOne(e.data.id)}
        >
          <Column
            header={headerCheckbox}
            body={(row) => (
              <Checkbox
                binary
                checked={selectedIds.includes(row.id)}
                onChange={(e) => {
                  e.originalEvent.stopPropagation();
                  toggleOne(row.id);
                }}
              />
            )}
            style={{ width: "3rem" }}
          />
          <Column field="name" header="Tên khách hàng" />
          <Column field="email" header="Email" />
          <Column field="phone" header="Số điện thoại" />
        </DataTable>
      </div>

      {/* ====== FORM GỬI EMAIL (DỌC) ====== */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-2xl"
      >
        <div>
          <label className="block font-medium mb-1">
            Tiêu đề email
          </label>
          <InputText
            {...register("subject")}
            className="w-full"
            placeholder="Nhập tiêu đề email"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">
            Nội dung email
          </label>
          <InputTextarea
            {...register("content")}
            rows={6}
            className="w-full"
            placeholder="Nhập nội dung email"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <Button
          label={`Gửi email (${selectedIds.length})`}
          icon="pi pi-send"
          severity="success"
          type="submit"
          disabled={selectedIds.length === 0}
          className="flex w-full justify-center h-12"
        />
      </form>
    </div>
  );
}
