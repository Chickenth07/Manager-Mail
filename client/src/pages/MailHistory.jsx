import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import MailFailDialog from "../components/MailFailDialog";
import Paginator from "../components/Paginator";

export default function MailHistory() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [mails, setMails] = useState([]);
  const [selectedMailId, setSelectedMailId] = useState(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
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

  useEffect(() => {
    fetchMailHistory(page, rows);
  }, [page, rows]);

  const fetchMailHistory = async (pageIndex, pageSize) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/mail-history?page=${pageIndex}&limit=${pageSize}`
      );

      const data = await res.json();

      setMails(data.items);
      setTotal(data.total);
    } catch (err) {
      alert("Không thể tải lịch sử gửi mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Lịch sử gửi mail</h2>

      <DataTable
        value={mails}
        loading={loading}
        {...paginatorProps}
        emptyMessage="Chưa có lịch sử gửi mail"
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
        />

        <Column field="subject" header="Tiêu đề" />

        <Column field="successCount" header="Thành công" />

        <Column
          header="Thất bại"
          body={(row) =>
            row.failCount > 0 ? (
              <Button
                label={row.failCount}
                severity="danger"
                size="small"
                onClick={() => setSelectedMailId(row._id)}
              />
            ) : (
              0
            )
          }
        />

        <Column field="status" header="Trạng thái" />

        <Column
          header="Thời điểm gửi"
          body={(row) => new Date(row.createdAt).toLocaleString()}
        />
      </DataTable>

      {selectedMailId && (
        <MailFailDialog
          mailId={selectedMailId}
          onHide={() => setSelectedMailId(null)}
        />
      )}
    </>
  );
}
