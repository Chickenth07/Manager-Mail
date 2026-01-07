import { useEffect, useMemo, useState } from "react";
import useCustomerStore from "../store/useCustomerStore";
import AppSidebar from "../components/AppSidebar";
import Paginator from "../components/Paginator";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";

export default function SendMail() {
  const { customers, total, loading, fetchCustomers } = useCustomerStore();

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1); // 1-based
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

  /* ================= GLOBAL SELECTION ================= */
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  /* ================= FORM ================= */
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const [visibleLeft, setVisibleLeft] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchCustomers(page, rows);
  }, [page, rows, fetchCustomers]);

  /* ================= MAP SELECTION FOR TABLE ================= */
  const selectedRows = useMemo(() => {
    return customers.filter((c) => selectedIds.includes(c._id));
  }, [customers, selectedIds]);

  /* ================= HANDLE SELECTION ================= */
  const handleSelectionChange = (e) => {
    const pageIds = customers.map((c) => c._id);
    const newIdsInPage = e.value.map((c) => c._id);

    setSelectedIds((prev) => {
      const keepIds = prev.filter((id) => !pageIds.includes(id));
      return Array.from(new Set([...keepIds, ...newIdsInPage]));
    });
  };

  /* ================= COUNT ================= */
  const selectedCount = useMemo(() => {
    return sendToAll ? total : selectedIds.length;
  }, [sendToAll, selectedIds, total]);

  /* ================= SELECT ALL ================= */
  const toggleSelectAllDB = () => {
    setSendToAll((prev) => {
      const next = !prev;

      if (next) {
        setSelectedIds(customers.map((c) => c._id));
      } else {
        setSelectedIds([]);
      }

      return next;
    });
  };

  /* ================= SEND MAIL (MOCK) ================= */
  const handleSend = () => {
    if (!subject || !content) {
      alert("Vui lòng nhập đầy đủ Subject và Content");
      return;
    }

    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất 1 khách hàng");
      return;
    }

    alert(`Đã gửi email đến ${selectedCount} khách hàng`);

    setSubject("");
    setContent("");
    setSelectedIds([]);
    setSendToAll(false);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20 }}>
      <Button icon="pi pi-bars" onClick={() => setVisibleLeft(true)} />
      <AppSidebar visible={visibleLeft} onHide={() => setVisibleLeft(false)} />

      <h2>Gửi email cho khách hàng</h2>

      {/* ===== FORM ===== */}
      <div className="mb-4">
        <div className="field mb-3">
          <label>Tiêu đề email</label>
          <InputText
            value={subject}
            placeholder="Tiêu đề"
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field mb-3">
          <label>Nội dung email</label>
          <InputTextarea
            rows={5}
            value={content}
            placeholder="Nội dung"
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <Button
          label={`Send Email (${selectedCount})`}
          icon="pi pi-send"
          disabled={selectedCount === 0}
          onClick={handleSend}
        />
      </div>

      {/* ===== SELECT ALL ===== */}
      <div className="mb-2 flex align-items-center gap-2">
        <Checkbox
          inputId="sendAll"
          checked={sendToAll}
          onChange={toggleSelectAllDB}
        />
        <label htmlFor="sendAll" className="cursor-pointer">
          Gửi email cho tất cả khách hàng
        </label>
      </div>

      <div className="mb-3">
        <span className="p-tag p-tag-success">
          Đã chọn {selectedCount} khách hàng
        </span>
      </div>

      {/* ===== TABLE ===== */}
      <DataTable
        value={customers}
        dataKey="_id"
        loading={loading}
        {...paginatorProps}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
      >
        <Column selectionMode="multiple" style={{ width: "3rem" }} />

        <Column
          header="STT"
          body={(_, options) =>{
            if (rows === 5){
              return (page - 1) * (rows - 5) + options.rowIndex + 1
            } if (rows === 10) {
              return (page - 1) * (rows - 10) + options.rowIndex + 1
            } if (rows === 20) {
              return (page - 1) * (rows - 20) + options.rowIndex + 1
            } else {
              return (page - 1) * (rows - 50) + options.rowIndex + 1
            }
          }}
          style={{ width: "80px", textAlign: "center" }}
        />

        <Column field="name" header="Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Số điện thoại" />
      </DataTable>
    </div>
  );
}
