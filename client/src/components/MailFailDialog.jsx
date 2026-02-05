import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function MailFailDialog({ mailId, onHide }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mailId) return;

    setLoading(true);

    fetch(`${API_URL}/mail-history/${mailId}/fails`)
      .then((res) => res.json())
      .then((data) => {
        setFailures(data.items || []);
      })
      .catch(() => setFailures([]))
      .finally(() => setLoading(false));
  }, [mailId]);

  return (
    <Dialog
      header="Danh sách email gửi thất bại"
      visible
      style={{ width: "60vw" }}
      onHide={onHide}
    >
      <DataTable
        value={failures}
        loading={loading}
        emptyMessage="Không có email thất bại"
        showGridlines
      >
        <Column field="email" header="Email" style={{ width: "40%" }} />
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
