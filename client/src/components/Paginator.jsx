import { Dropdown } from "primereact/dropdown";

export default function Paginator({
  page,
  rows,
  total,
  onChange,
  rowOptions = [5, 10, 20, 50],
}) {
  const options = rowOptions.map((v) => ({
    label: v,
    value: v,
  }));

  return {
    /* ===== PROPS CHO DATATABLE ===== */
    lazy: true,
    paginator: true,
    totalRecords: total,
    rows,
    first: (page - 1) * rows,
    onPage: (e) => {
      onChange({
        page: e.page + 1, // PrimeReact 0-based → mình dùng 1-based
        rows: e.rows,
      });
    },

    /* ===== UI HEADER / FOOTER ===== */
    paginatorTemplate: {
      layout:
        "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
      RowsPerPageDropdown: (optionsRender) => (
        <div className="flex align-items-center gap-2">
          <span>Tổng số: <b>{total}</b></span>

          <Dropdown
            value={rows}
            options={options}
            onChange={(e) =>
              onChange({
                page: 1,       // 🔥 đổi rows thì quay về trang 1
                rows: e.value,
              })
            }
            style={{ width: 100 }}
          />
        </div>
      ),
    },
  };
}
