import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function MailSuccessDialog({ mailId, onHide }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mailId) return;

    setLoading(true);

    fetch(`${API_URL}/mail-history/${mailId}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [mailId]);

  if (!data) return null;

  return (
    <Dialog
      header="Danh sách email gửi thành công"
      visible
      style={{ width: "60vw" }}
      onHide={onHide}
    >
      <div className="mb-3">
        <strong>Tiêu đề:</strong> {data.subject}
      </div>

      <DataTable
        value={data.successEmails || []}
        loading={loading}
        emptyMessage="Không có email thành công"
        showGridlines
      >
        <Column header="Email" body={(email) => email} />
      </DataTable>
    </Dialog>
  );
}
