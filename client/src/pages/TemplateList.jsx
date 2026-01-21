import Paginator from "../components/Paginator";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function TemplateList() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [viewTemplate, setViewTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [total, setTotal] = useState(0);

  const paginatorProps = Paginator({
    page,
    rows,
    total,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });

  const [form, setForm] = useState({
    name: "",
    subject: "",
    html: "",
    description: "",
  });

  useEffect(() => {
    fetchTemplates(page, rows);
  }, [page, rows]);

  const validateForm = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Tên template không được để trống";
    if (!form.subject.trim()) e.subject = "Tiêu đề không được để trống";
    if (!form.html.trim()) e.html = "Nội dung email không được để trống";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/templates/${editingId}`
        : `${API_URL}/templates`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Save template failed");
      }

      setVisible(false);
      setEditingId(null);
      setForm({ name: "", subject: "", html: "", description: "" });

      setPage(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa template này?")) return;

    try {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setPage(1);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchTemplates = async (pageIndex = page, pageSize = rows) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/templates?page=${pageIndex}&limit=${pageSize}`
      );

      const data = await res.json();

      setTemplates(data.items);
      setTotal(data.total);
    } catch (err) {
      alert("Không thể tải danh sách template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách Template Email</h1>

        <Button
          label="Thêm Template"
          icon="pi pi-plus"
          onClick={() => {
            setForm({ name: "", subject: "", html: "", description: "" });
            setErrors({});
            setEditingId(null);
            setVisible(true);
          }}
        />
      </div>

      <div className="bg-white rounded shadow">
        <DataTable
          value={templates}
          loading={loading}
          {...paginatorProps}
          showGridlines
          emptyMessage="Chưa có template nào"
          className="text-sm"
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

          <Column field="name" header="Tên" />
          <Column field="subject" header="Tiêu đề" />

          <Column
            field="description"
            header="Mô tả"
            body={(row) =>
              row.description ? (
                row.description
              ) : (
                <span className="text-slate-400 italic">—</span>
              )
            }
          />

          <Column
            header="Hành động"
            body={(row) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  severity="info"
                  aria-label="Favorite"
                  onClick={() => setViewTemplate(row)}
                />
                <Button
                  icon="pi pi-pencil"
                  severity="help"
                  aria-label="Edit"
                  onClick={() => {
                    setForm({
                      name: row.name,
                      subject: row.subject,
                      html: row.html,
                      description: row.description || "",
                    });
                    setErrors({});
                    setEditingId(row._id);
                    setVisible(true);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  aria-label="Cancel"
                  onClick={() => handleDelete(row._id)}
                />
              </div>
            )}
            style={{ width: "200px" }}
          />
        </DataTable>
      </div>

      {/* ===== DIALOG THÊM TEMPLATE ===== */}
      <Dialog
        header={editingId ? "Sửa Template Email" : "Thêm Template Email"}
        visible={visible}
        style={{ width: "40rem" }}
        onHide={() => setVisible(false)}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Tên Template</label>
            <InputText
              value={form.name}
              className={errors.name ? "p-invalid" : ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field mb-3">
            <label>Tiêu đề Email</label>
            <InputText
              value={form.subject}
              className={errors.subject ? "p-invalid" : ""}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            {errors.subject && (
              <small className="p-error">{errors.subject}</small>
            )}
          </div>

          <div className="field mb-3">
            <label>Mô tả</label>
            <InputText
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="field mb-3">
            <label>Nội dung HTML</label>
            <InputTextarea
              rows={8}
              value={form.html}
              className={errors.html ? "p-invalid" : ""}
              onChange={(e) => setForm({ ...form, html: e.target.value })}
            />
            {errors.html && <small className="p-error">{errors.html}</small>}
          </div>

          <Button
            label="Lưu Template"
            icon="pi pi-check"
            loading={saving}
            onClick={handleSubmit}
          />
        </div>
      </Dialog>

      {/* ===== DIALOG XEM TEMPLATE ===== */}
      <Dialog
        header={viewTemplate?.name}
        visible={!!viewTemplate}
        style={{ width: "50rem" }}
        onHide={() => setViewTemplate(null)}
      >
        {viewTemplate && (
          <>
            <div className="mb-3">
              <strong>Tiêu đề:</strong> {viewTemplate.subject}
            </div>

            <div className="border p-3 rounded bg-slate-50">
              <div dangerouslySetInnerHTML={{ __html: viewTemplate.html }} />
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
