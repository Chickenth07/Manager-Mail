import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function MailFailDialog({ mailId, onHide }) {
  const [failures, setFailures] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/mail-history/${mailId}/failures`)
      .then((res) => res.json())
      .then(setFailures);
  }, [mailId]);

  return (
    <Dialog
      header="Danh sách email gửi thất bại"
      visible
      style={{ width: "50vw" }}
      onHide={onHide}
    >
      <DataTable value={failures}>
        <Column field="email" header="Email" />
        <Column field="error" header="Lỗi" />
      </DataTable>
    </Dialog>
  );
}
