import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { io } from "socket.io-client";

import MailFailDialog from "../components/MailFailDialog";
import MailSuccessDialog from "../components/MailSuccessDialog";
import Paginator from "../components/Paginator";

export default function MailHistory() {
  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [mails, setMails] = useState([]);

  const [successMailId, setSuccessMailId] = useState(null);
  const [failMailId, setFailMailId] = useState(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

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
    const socket = io(BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {});

    socket.on("disconnect", (reason) => {});

    socket.on("mail:progress", (payload) => {
      const { mailLogId, successCount, failCount, sendingCount, status } =
        payload;

      console.log("📡 SOCKET PAYLOAD:", payload);

      setMails((prev) => {
        console.log("📄 BEFORE UPDATE:", prev);

        const next = prev.map((mail) =>
          mail._id === mailLogId
            ? {
                ...mail,
                successCount,
                failCount,
                sendingCount,
                status,
              }
            : mail
        );

        console.log("📄 AFTER UPDATE:", next);
        return next;
      });
    });

    return () => {
      socket.off("mail:progress");
      socket.disconnect();
    };
  }, []);

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

  const renderStatus = (row) => {
    switch (row.status) {
      case "processing":
        return <Button label="Đang gửi" severity="warning" size="small" />;

      case "success":
        return <Button label="Thành công" severity="success" size="small" />;

      case "partial":
        return (
          <Button
            label="Có mail lỗi"
            severity="warning"
            size="small"
            outlined
          />
        );

      case "failed":
        return <Button label="Thất bại" severity="danger" size="small" />;

      default:
        return row.status;
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
        showGridlines
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

        <Column
          header="Thành công"
          body={(row) =>
            row.successCount > 0 ? (
              <Button
                label={row.successCount}
                severity="success"
                size="small"
                onClick={() => setSuccessMailId(row._id)}
              />
            ) : (
              0
            )
          }
          style={{ textAlign: "center", width: "120px" }}
        />

        <Column
          header="Đang gửi"
          body={(row) =>
            row.sendingCount > 0 ? (
              <Button
                label={row.sendingCount}
                severity="warning"
                size="small"
                text
              />
            ) : (
              0
            )
          }
          style={{ textAlign: "center", width: "120px" }}
        />

        <Column
          header="Thất bại"
          body={(row) =>
            row.failCount > 0 ? (
              <Button
                label={row.failCount}
                severity="danger"
                size="small"
                onClick={() => setFailMailId(row._id)}
              />
            ) : (
              0
            )
          }
          style={{ textAlign: "center", width: "120px" }}
        />

        <Column
          header="Trạng thái"
          body={renderStatus}
          style={{ textAlign: "center", width: "140px" }}
        />

        <Column
          header="Thời điểm gửi"
          body={(row) => new Date(row.createdAt).toLocaleString()}
        />
      </DataTable>

      {successMailId && (
        <MailSuccessDialog
          mailId={successMailId}
          onHide={() => setSuccessMailId(null)}
        />
      )}

      {failMailId && (
        <MailFailDialog
          mailId={failMailId}
          onHide={() => setFailMailId(null)}
        />
      )}
    </>
  );
}
