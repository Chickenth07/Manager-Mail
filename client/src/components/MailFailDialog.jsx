import { useEffect, useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import Paginator from "../components/Paginator";

export default function MailFailDialog({ mailId, onHide }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    if (!mailId) return;

    setLoading(true);

    fetch(`${API_URL}/mail-history/${mailId}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [mailId]);

  const paginatorProps = Paginator({
    page,
    rows,
    total: data?.failEmails?.length || 0,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });

  // slice data theo trang (KHÔNG đổi logic)
  const pagedFailEmails = useMemo(() => {
    if (!data?.failEmails) return [];
    const start = (page - 1) * rows;
    return data.failEmails.slice(start, start + rows);
  }, [data, page, rows]);

  if (!data) return null;

  return (
    <Dialog
      header="Danh sách email gửi thất bại"
      visible
      style={{ width: "65vw" }}
      onHide={onHide}
    >
      <div className="mb-3">
        <strong>Tiêu đề:</strong> {data.subject}
      </div>

      <DataTable
        value={pagedFailEmails}
        loading={loading}
        emptyMessage="Không có email thất bại"
        showGridlines
        {...paginatorProps}
      >
        <Column field="email" header="Email" style={{ width: "35%" }} />
        <Column field="reason" header="Lý do thất bại" />
        <Column
          field="at"
          header="Thời gian"
          body={(row) => new Date(row.at).toLocaleString()}
          style={{ width: "180px" }}
        />
      </DataTable>
    </Dialog>
  );
}
