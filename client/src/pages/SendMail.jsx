import { useEffect, useMemo, useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import useCustomerStore from "../store/useCustomerStore";
import AdminLayout from "../layouts/AdminLayout";
import Paginator from "../components/Paginator";

import 'ckeditor5/ckeditor5.css';
import Editor from "../ckeditor/editor";
import MyUploadAdapterPlugin from "../ckeditor/MyUploadAdapterPlugin";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

export default function SendMail() {
  const { customers, total, loading, fetchCustomers } = useCustomerStore();

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

  /* ================= SELECTION ================= */
  const [sendToAll, setSendToAll] = useState(false);
  const [excludedIds, setExcludedIds] = useState([]); // Danh sách loại trừ khi sendToAll = true
  const [selectedIds, setSelectedIds] = useState([]); // Danh sách chọn khi sendToAll = false

  /* ================= FORM ================= */
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchCustomers(page, rows);
  }, [page, rows, fetchCustomers]);

  /* ================= MAP IDS -> ROWS ================= */
  const selectedRows = useMemo(() => {
    if (sendToAll) {
      // Khi sendToAll = true, chọn tất cả TRỪ excludedIds
      return customers.filter((c) => !excludedIds.includes(c._id));
    } else {
      // Khi sendToAll = false, chỉ chọn selectedIds
      return customers.filter((c) => selectedIds.includes(c._id));
    }
  }, [customers, sendToAll, excludedIds, selectedIds]);

  /* ================= HANDLE ROW SELECTION ================= */
  const handleSelectionChange = (e) => {
    const selectedInPage = e.value.map((c) => c._id);
    const pageIds = customers.map((c) => c._id);

    if (sendToAll) {
      // Chế độ "Gửi cho tất cả": cập nhật danh sách loại trừ
      const newExcluded = pageIds.filter((id) => !selectedInPage.includes(id));
      
      setExcludedIds((prev) => {
        const keep = prev.filter((id) => !pageIds.includes(id));
        return Array.from(new Set([...keep, ...newExcluded]));
      });
    } else {
      // Chế độ thường: cập nhật danh sách chọn
      setSelectedIds((prev) => {
        const keep = prev.filter((id) => !pageIds.includes(id));
        return Array.from(new Set([...keep, ...selectedInPage]));
      });
    }
  };

  /* ================= COUNT ================= */
  const selectedCount = useMemo(() => {
    return sendToAll ? total - excludedIds.length : selectedIds.length;
  }, [sendToAll, selectedIds, excludedIds, total]);

  /* ================= TOGGLE SELECT ALL (DB) ================= */
  const toggleSelectAllDB = () => {
    const newSendToAll = !sendToAll;
    setSendToAll(newSendToAll);

    if (newSendToAll) {
      // Chuyển sang chế độ "Gửi cho tất cả"
      setExcludedIds([]);
      setSelectedIds([]);
    } else {
      // Chuyển về chế độ thường
      setSelectedIds([]);
      setExcludedIds([]);
    }
  };

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!subject || !content) {
      alert("Vui lòng nhập đầy đủ Subject và Content");
      return;
    }

    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất 1 khách hàng");
      return;
    }

    const payload = {
      subject,
      content,
      sendToAll,
      customerIds: sendToAll ? [] : selectedIds,
      excludedIds: sendToAll ? excludedIds : [],
    };

    console.log("🚀 Sending payload:", payload);
    console.log("🔢 Count:", selectedCount);

    try {
      const res = await fetch("http://localhost:3000/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(`Đã gửi email đến ${data.count} khách hàng`);

      // Reset form
      setSubject("");
      setContent("");
      setSelectedIds([]);
      setExcludedIds([]);
      setSendToAll(false);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Gửi email cho khách hàng</h2>

      {/* ===== FORM ===== */}
      <div className="mb-6 max-w-2xl">
        <div className="field mb-3">
          <label>Tiêu đề email</label>
          <InputText
            value={subject}
            placeholder="Tiêu đề"
            onChange={(e) => setSubject(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Nội dung email</label>
          <CKEditor
            editor={Editor}
            data={content}
            config={{
              extraPlugins: [MyUploadAdapterPlugin],
            }}
            onChange={(event, editor) => {
              setContent(editor.getData());
            }}
          />
        </div>

        <Button
          label={`Gửi Email (${selectedCount})`}
          icon="pi pi-send"
          disabled={selectedCount === 0}
          onClick={handleSend}
        />
      </div>

      {/* ===== SELECT ALL ===== */}
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            inputId="sendAll"
            checked={sendToAll}
            onChange={toggleSelectAllDB}
          />
          <label htmlFor="sendAll" className="cursor-pointer">
            Gửi email cho tất cả khách hàng
          </label>
        </div>

        {sendToAll && excludedIds.length > 0 && (
          <span className="p-tag p-tag-warning">
            Đã loại trừ {excludedIds.length} khách hàng
          </span>
        )}

        {!sendToAll && selectedIds.length > 0 && (
          <span className="p-tag p-tag-success">
            Đã chọn {selectedIds.length} khách hàng
          </span>
        )}
      </div>

      {/* ===== TABLE ===== */}
      <DataTable
        value={customers}
        dataKey="_id"
        loading={loading}
        {...paginatorProps}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        emptyMessage="Chưa có khách hàng"
      >
        <Column
          selectionMode="multiple"
          style={{ width: "3rem" }}
        />

        <Column
          header="STT"
          body={(_, options) => {
            return (page - 1) * rows + options.rowIndex + 1;
          }}
          style={{ width: "80px", textAlign: "center" }}
        />

        <Column field="name" header="Tên" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Số điện thoại" />
      </DataTable>
    </AdminLayout>
  );
}