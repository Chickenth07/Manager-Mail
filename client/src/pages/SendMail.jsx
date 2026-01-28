import { useEffect, useMemo, useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import useCustomerStore from "../store/useCustomerStore";
import Paginator from "../components/Paginator";

import "ckeditor5/ckeditor5.css";
import Editor from "../ckeditor/editor";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { useLocation } from "react-router-dom";

export default function SendMail() {
  
  const API_URL = import.meta.env.VITE_API_URL;

  const { customers, total, loading, fetchCustomers } = useCustomerStore();

  /* ================= PAGINATION (1-BASED) ================= */
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);

  const [externalEmails, setExternalEmails] = useState([]);
  const [externalInput, setExternalInput] = useState("");

  const location = useLocation();
  const templateData = location.state;

  const splitEmails = (input = "") => {
    return input
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  };

  const plainTextToHtml = (text = "") => text.replace(/\n/g, "<br />");

  const paginatorProps = Paginator({
    page,
    rows,
    total,
    onChange: ({ page, rows }) => {
      setPage(page);
      setRows(rows);
    },
  });
  const normalizeEmailTable = (html = "") => {
    let result = html;
  
    // Fix table
    result = result.replace(
      /<table(?![^>]*width)/g,
      '<table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; table-layout:fixed;"'
    );
  
    // Fix th
    result = result.replace(
      /<th/g,
      '<th style="border:1px solid #ccc; font-weight:bold; text-align:left;"'
    );
  
    // Fix td
    result = result.replace(
      /<td/g,
      '<td style="border:1px solid #ccc; word-break:break-word;"'
    );
  
    return result;
  };
  

  /* ================= SELECTION ================= */
  const [sendToAll, setSendToAll] = useState(false);
  const [excludedIds, setExcludedIds] = useState([]); // Danh sách loại trừ khi sendToAll = true
  const [selectedIds, setSelectedIds] = useState([]); // Danh sách chọn khi sendToAll = false

  /* ================= FORM ================= */
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]); // { filename, base64, contentType }
  const [editorImages, setEditorImages] = useState([]); // { filename, base64, contentType }

  const [sending, setSending] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchCustomers(page, rows);
  }, [page, rows, fetchCustomers]);

  useEffect(() => {
    if (templateData) {
      setSubject(templateData.subject || "");
      setContent(plainTextToHtml(templateData.html || ""));
    }
  }, [templateData]);

  //=======Validate=======//
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addExternalEmail = () => {
    const emails = splitEmails(externalInput);

    if (emails.length === 0) return;

    const validEmails = [];
    const invalidEmails = [];

    emails.forEach((email) => {
      if (isValidEmail(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      alert(`Email không hợp lệ:\n${invalidEmails.join("\n")}`);
    }

    setExternalEmails((prev) => {
      const merged = [...prev, ...validEmails];
      return Array.from(new Set(merged)); // loại trùng
    });

    setExternalInput("");
  };

  /* ================= MAP IDS -> ROWS ================= */
  const selectedRows = useMemo(() => {
    if (sendToAll) {
      // Khi sendToAll = true, chọn tất cả TRỪ excludedIds
      return customers.filter((c) => !excludedIds.includes(c._id));
    } else {
      // Khi sendToAll = false, chỉ chọn selectedIds
      return customers.filter((c) => selectedIds.includes(c._id));
    }
  }, [customers, sendToAll, excludedIds, selectedIds]);

  /* ================= HANDLE ROW SELECTION ================= */
  const handleSelectionChange = (e) => {
    const selectedInPage = e.value.map((c) => c._id);
    const pageIds = customers.map((c) => c._id);

    if (sendToAll) {
      // Chế độ "Gửi cho tất cả": cập nhật danh sách loại trừ
      const newExcluded = pageIds.filter((id) => !selectedInPage.includes(id));

      setExcludedIds((prev) => {
        const keep = prev.filter((id) => !pageIds.includes(id));
        return Array.from(new Set([...keep, ...newExcluded]));
      });
    } else {
      // Chế độ thường: cập nhật danh sách chọn
      setSelectedIds((prev) => {
        const keep = prev.filter((id) => !pageIds.includes(id));
        return Array.from(new Set([...keep, ...selectedInPage]));
      });
    }
  };

  /* ================= COUNT ================= */
  const selectedCount = useMemo(() => {
    const dbCount = sendToAll ? total - excludedIds.length : selectedIds.length;

    return dbCount + externalEmails.length;
  }, [sendToAll, selectedIds, excludedIds, total, externalEmails]);

  /* ================= TOGGLE SELECT ALL (DB) ================= */
  const toggleSelectAllDB = () => {
    const newSendToAll = !sendToAll;
    setSendToAll(newSendToAll);

    if (newSendToAll) {
      // Chuyển sang chế độ "Gửi cho tất cả"
      setExcludedIds([]);
      setSelectedIds([]);
    } else {
      // Chuyển về chế độ thường
      setSelectedIds([]);
      setExcludedIds([]);
    }
  };

  /* ================= HANDLE EDITOR IMAGE UPLOAD ================= */
  const handleEditorImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setEditorImages((prev) => [
        ...prev,
        {
          filename: file.name,
          base64: reader.result,
          contentType: file.type,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  /* ================= HANDLE ATTACHMENT FILES ================= */
  const handleAttachmentFiles = (files) => {
    console.log("ATTACH FILES:", files);
    if (!Array.isArray(files)) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            base64: reader.result,
            contentType: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!subject || !content) {
      alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung");
      return;
    }

    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất 1 khách hàng");
      return;
    }

    const safeContent = normalizeEmailTable(content);

    const payload = {
      subject,
      content: safeContent,
      sendToAll,
      customerIds: sendToAll ? [] : selectedIds,
      excludedIds: sendToAll ? excludedIds : [],
      externalEmails,
      editorImages,
      attachments,
    };

    console.log("📢 Count:", selectedCount);

    try {
      setSending(true);

      const res = await fetch(`${API_URL}/mail/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(`Đã gửi email đến ${data.count} khách hàng`);

      // Reset form
      setSubject("");
      setContent("");
      setAttachments([]);
      setEditorImages([]);
      setSelectedIds([]);
      setExcludedIds([]);
      setSendToAll(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Gửi email cho khách hàng</h2>

      {/* ===== FORM ===== */}
      <div className="mb-6 max-w-2xl">
        <div className="mb-4 max-w-2xl">
          <label className="block mb-2 font-medium">
            Gửi thêm cho email bên ngoài
          </label>

          <div className="flex gap-2">
            <InputText
              placeholder="Nhập email (cách nhau bằng , ; hoặc Enter)"
              value={externalInput}
              onChange={(e) => setExternalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addExternalEmail();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text");
                setExternalInput(pasted);
                setTimeout(addExternalEmail, 0);
              }}
              className="flex-1"
            />
            <Button label="Thêm" icon="pi pi-plus" onClick={addExternalEmail} />
          </div>

          {externalEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {externalEmails.map((email, idx) => (
                <div
                  key={idx}
                  className="p-tag p-tag-secondary flex items-center gap-2"
                >
                  <span>{email}</span>
                  <i
                    className="pi pi-times cursor-pointer"
                    onClick={() =>
                      setExternalEmails((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field mb-3">
          <label>Tiêu đề email</label>
          <InputText
            value={subject}
            placeholder="Tiêu đề"
            onChange={(e) => setSubject(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Nội dung email</label>

          <div className="email-editor-wrapper">
            <CKEditor
              editor={Editor}
              data={content}
              config={{
                extraPlugins: [
                  function (editor) {
                    editor.plugins.get("FileRepository").createUploadAdapter = (
                      loader
                    ) => {
                      return {
                        upload: () => {
                          return loader.file.then((file) => {
                            const maxSize = 5 * 1024 * 1024; // 5MB
                            if (file.size > maxSize) {
                              throw new Error(
                                "File quá lớn. Kích thước tối đa là 5MB"
                              );
                            }

                            if (!file.type.startsWith("image/")) {
                              throw new Error("Chỉ chấp nhận file ảnh");
                            }

                            handleEditorImageUpload(file);

                            return new Promise((resolve, reject) => {
                              const reader = new FileReader();

                              reader.onload = () => {
                                resolve({
                                  default: reader.result,
                                });
                              };

                              reader.onerror = () => {
                                reject(new Error("Không thể đọc file"));
                              };

                              reader.readAsDataURL(file);
                            });
                          });
                        },
                        abort: () => {},
                      };
                    };
                  },
                ],
              }}
              onReady={(editor) => {
                editor.on("attach-files", (evt, files) => {
                  if (!Array.isArray(files)) return;
                  handleAttachmentFiles(files);
                });
              }}
              onChange={(event, editor) => {
                setContent(editor.getData());
              }}
            />
          </div>
        </div>

        {/* Hiển thị danh sách attachments */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <label className="block mb-2">
              File đính kèm ({attachments.length}):
            </label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="p-tag p-tag-info flex items-center gap-2"
                >
                  <span>{file.filename}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="pi pi-times cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị danh sách ảnh trong editor */}
        {editorImages.length > 0 && (
          <div className="mb-3">
            <label className="block mb-2">
              Ảnh trong nội dung ({editorImages.length}):
            </label>
            <div className="flex flex-wrap gap-2">
              {editorImages.map((img, idx) => (
                <div
                  key={idx}
                  className="p-tag p-tag-success flex items-center gap-2"
                >
                  <span>{img.filename}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorImages((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="pi pi-times cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          label={sending ? "Đang gửi email..." : `Gửi Email (${selectedCount})`}
          icon={sending ? "pi pi-spin pi-spinner" : "pi pi-send"}
          disabled={sending || selectedCount === 0}
          onClick={handleSend}
        />
      </div>

      {/* ===== SELECT ALL ===== */}
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            inputId="sendAll"
            checked={sendToAll}
            onChange={toggleSelectAllDB}
          />
          <label htmlFor="sendAll" className="cursor-pointer">
            Gửi email cho tất cả khách hàng
          </label>
        </div>

        {sendToAll && excludedIds.length > 0 && (
          <span className="p-tag p-tag-warning">
            Đã loại trừ {excludedIds.length} khách hàng
          </span>
        )}

        {!sendToAll && selectedIds.length > 0 && (
          <span className="p-tag p-tag-success">
            Đã chọn {selectedIds.length} khách hàng
          </span>
        )}
      </div>

      {/* ===== TABLE ===== */}
      <DataTable
        value={customers}
        dataKey="_id"
        loading={loading}
        {...paginatorProps}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        emptyMessage="Chưa có khách hàng"
        showGridlines
      >
        <Column selectionMode="multiple" style={{ width: "3rem" }} />

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
        <Column field="company" header="Công ty" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Số điện thoại" />
      </DataTable>
    </>
  );
}
