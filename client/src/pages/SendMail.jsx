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

  /* ================= PAGINATION (THEO MONGOOSEBASE) ================= */
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
    fetchCustomers(page, rows); // Mongo quyết định data
  }, [page, rows, fetchCustomers]);

  /* ================= MAP SELECTION CHO TABLE ================= */
  const selectedRows = useMemo(() => {
    if (sendToAll) return customers;
    return customers.filter((c) => selectedIds.includes(c._id));
  }, [customers, selectedIds, sendToAll]);

  /* ================= HANDLE SELECT IN TABLE ================= */
  const handleSelectionChange = (e) => {
    const pageIds = customers.map((c) => c._id);
    const newIdsInPage = e.value.map((c) => c._id);

    setSelectedIds((prev) => {
      const keepIds = prev.filter((id) => !pageIds.includes(id));
      return Array.from(new Set([...keepIds, ...newIdsInPage]));
    });
  };

  /* ================= SELECT ALL DB ================= */
  const toggleSelectAllDB = () => {
    setSendToAll((prev) => !prev);
    setSelectedIds([]);
  };

  /* ================= SEND MAIL (MOCK) ================= */
  const handleSend = () => {
    if (!subject || !content) {
      alert("Vui lòng nhập đầy đủ Subject và Content");
      return;
    }

    if (!sendToAll && selectedIds.length === 0) {
      alert("Vui lòng chọn khách hàng hoặc chọn gửi cho tất cả");
      return;
    }

    alert(
      sendToAll
        ? `Đã gửi email đến TOÀN BỘ ${total} khách hàng`
        : `Đã gửi email đến ${selectedIds.length} khách hàng`
    );

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

      {/* ===== SELECT ALL DB ===== */}
      <div className="mb-3 flex align-items-center gap-2">
        <Checkbox
          inputId="sendAll"
          checked={sendToAll}
          onChange={toggleSelectAllDB}
        />
        <label htmlFor="sendAll" className="cursor-pointer">
          Gửi email cho <b>tất cả {total} khách hàng</b>
        </label>
      </div>

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

        <Button label="Send Email" icon="pi pi-send" onClick={handleSend} />
      </div>

      {/* ===== TABLE ===== */}
      {!sendToAll && (
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
            body={(_, options) =>
              (page - 1) * (rows - 5) + options.rowIndex + 1
            }
            style={{ width: "80px", textAlign: "center" }}
          />

          <Column field="name" header="Name" />
          <Column field="email" header="Email" />
          <Column field="phone" header="Số điện thoại" />
        </DataTable>
      )}
    </div>
  );
}
