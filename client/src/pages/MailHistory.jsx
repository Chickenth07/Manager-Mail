import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import MailFailDialog from "../components/MailFailDialog";
import AdminLayout from "../layouts/AdminLayout";

export default function MailHistory() {
  const [mails, setMails] = useState([]);
  const [selectedMailId, setSelectedMailId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/mail-history")
      .then((res) => res.json())
      .then(setMails);
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Lịch sử gửi mail</h2>

      <DataTable value={mails}>
        <Column field="subject" header="Tiêu đề" />
        <Column field="successCount" header="Thành công" />
        <Column
          header="Thất bại"
          body={(row) =>
            row.failCount > 0 ? (
              <Button
                label={row.failCount}
                severity="danger"
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
          body={(row) =>
            new Date(row.createdAt).toLocaleString()
          }
        />
      </DataTable>

      {selectedMailId && (
        <MailFailDialog
          mailId={selectedMailId}
          onHide={() => setSelectedMailId(null)}
        />
      )}
    </AdminLayout>
  );
}
