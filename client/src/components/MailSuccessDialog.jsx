import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import Paginator from "../components/Paginator";

export default function MailSuccessDialog({ mailId, onHide }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const paginatorProps = Paginator({
    page,
    rows,
    total,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });

  /* ===== LOAD MAIL INFO (ONCE) ===== */
  useEffect(() => {
    if (!mailId) return;

    fetch(`${API_URL}/mail-history/${mailId}`)
      .then((res) => res.json())
      .then((res) => {
        setSubject(res.subject);
        setHtmlContent(res.htmlContent);
      });
  }, [mailId]);

  /* ===== LOAD SUCCESS EMAILS (PAGINATED) ===== */
  useEffect(() => {
    if (!mailId) return;

    setLoading(true);

    fetch(
      `${API_URL}/mail-history/${mailId}/success?page=${page}&limit=${rows}`
    )
      .then((res) => res.json())
      .then((res) => {
        setEmails(res.items || []);
        setTotal(res.total || 0);
      })
      .finally(() => setLoading(false));
  }, [mailId, page, rows]);

  return (
    <Dialog
      header="Danh sách email gửi thành công"
      visible
      style={{ width: "70vw" }}
      onHide={onHide}
    >
      {/* SUBJECT */}
      <div className="mb-3">
        <strong>Tiêu đề:</strong> {subject}
      </div>

      {/* CONTENT PREVIEW */}
      <div className="mb-4">
        <strong>Nội dung email:</strong>
        <div
          className="mt-2 p-3 border rounded bg-white"
          style={{ maxHeight: 300, overflow: "auto" }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* SUCCESS EMAILS */}
      <DataTable
        value={emails}
        loading={loading}
        emptyMessage="Không có email thành công"
        showGridlines
        {...paginatorProps}
      >
        <Column header="Email" body={(email) => email} />
      </DataTable>
    </Dialog>
  );
}
