import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Paginator from "../components/Paginator";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function ImageFolders() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL;

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [total, setTotal] = useState(0);

  const [imagePage, setImagePage] = useState(0);
  const [imageRows, setImageRows] = useState(5);

  const paginatorProps = Paginator({
    page,
    rows,
    total,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });

  /* ================= DATA ================= */
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= UI STATE ================= */
  const [visible, setVisible] = useState(false);
  const [viewFolder, setViewFolder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchFolders(page, rows);
  }, [page, rows]);

  useEffect(() => {
    if (viewFolder) {
      setImagePage(0);
    }
  }, [viewFolder]);

  const fetchFolders = async (pageIndex, pageSize) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/folders?page=${pageIndex}&limit=${pageSize}`
      );
      const data = await res.json();

      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setFolders(items);
      setTotal(data?.total ?? items.length);
    } catch (err) {
      alert("Không thể tải danh sách folder");
      setFolders([]); // 🔒 đảm bảo DataTable không crash
    } finally {
      setLoading(false);
    }
  };

  /* ================= VALIDATE ================= */
  const validate = () => {
    const e = {};
    if (!folderName.trim()) e.folderName = "Tên folder không được để trống";
    if (!files.length) e.files = "Vui lòng chọn ít nhất 1 ảnh";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= HANDLERS ================= */
  const openAdd = () => {
    setFolderName("");
    setFiles([]);
    setErrors({});
    setVisible(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("folderName", folderName);
      files.forEach((f) => formData.append("images", f));

      const res = await fetch(
        `${API_URL}/folders?folderName=${encodeURIComponent(folderName)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setVisible(false);
      fetchFolders(1, rows);
      setPage(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (folder) => {
    confirmDialog({
      message: `Xóa folder "${folder.folderName}" và toàn bộ ảnh bên trong?`,
      header: "Xác nhận",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",
      accept: async () => {
        await fetch(`${API_URL}/folders/${folder._id}`, {
          method: "DELETE",
        });
        fetchFolders(page, rows);
      },
    });
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý folder ảnh</h2>

        <Button label="Thêm folder ảnh" icon="pi pi-plus" onClick={openAdd} />
      </div>

      <DataTable
        value={folders}
        loading={loading}
        {...paginatorProps}
        emptyMessage="Chưa có folder"
        showGridlines
      >
        <Column
          header="STT"
          body={(_, options) => (page - 1) * rows + options.rowIndex + 1}
          style={{ width: "80px", textAlign: "center" }}
        />

        <Column field="folderName" header="Tên folder" />

        <Column
          header="Số ảnh"
          body={(row) => row.images?.length || 0}
          style={{ width: "120px", textAlign: "center" }}
        />

        <Column
          header="Ngày tạo"
          body={(row) => new Date(row.createdAt).toLocaleDateString("vi-VN")}
        />

        <Column
          header="Tính năng"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-eye"
                size="small"
                onClick={() => setViewFolder(row)}
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                onClick={() => confirmDelete(row)}
              />
            </div>
          )}
          style={{ width: "160px" }}
        />
      </DataTable>

      {/* ================= ADD DIALOG ================= */}
      <Dialog
        header="Thêm folder ảnh"
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "30rem" }}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Tên folder</label>
            <InputText
              value={folderName}
              className={errors.folderName ? "p-invalid" : ""}
              onChange={(e) => setFolderName(e.target.value)}
            />
            {errors.folderName && (
              <small className="p-error">{errors.folderName}</small>
            )}
          </div>

          <div className="field mb-3">
            <label>Ảnh</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles([...e.target.files])}
            />
            {errors.files && <small className="p-error">{errors.files}</small>}
          </div>

          <Button
            label="Lưu"
            icon="pi pi-check"
            loading={saving}
            onClick={handleSubmit}
          />
        </div>
      </Dialog>

      {/* ================= VIEW DIALOG ================= */}
      <Dialog
        header={viewFolder?.folderName}
        visible={!!viewFolder}
        onHide={() => setViewFolder(null)}
        style={{ width: "60rem" }}
      >
        <div className="flex justify-end mb-2">
          <Button
            label="Copy tất cả tên ảnh"
            icon="pi pi-copy"
            size="small"
            onClick={() => {
              if (!viewFolder?.images?.length) {
                alert("Không có ảnh để copy");
                return;
              }

              const text = viewFolder.images.map((i) => i.key).join("\n");

              navigator.clipboard.writeText(text);
            }}
          />
        </div>

        <DataTable
          value={viewFolder?.images || []}
          paginator
          first={imagePage}
          rows={imageRows}
          rowsPerPageOptions={[5, 10, 15, 20]}
          onPage={(e) => {
            setImagePage(e.first);
            setImageRows(e.rows);
          }}
          showGridlines
          stripedRows
          responsiveLayout="scroll"
        >
          <Column
            header="Ảnh"
            body={(img) => (
              <img
                src={`${BASE_URL}/${img.path}`}
                alt={img.key}
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}
            style={{ width: "120px", textAlign: "center" }}
          />

          <Column
            field="key"
            header="Tên ảnh"
            body={(img) => (
              <span style={{ userSelect: "text" }}>{img.key}</span>
            )}
          />
        </DataTable>
      </Dialog>
      <ConfirmDialog />
    </>
  );
}
