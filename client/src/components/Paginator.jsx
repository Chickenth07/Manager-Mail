export default function Paginator({
    page,
    rows,
    total,
    onChange,
  }) {
    return {
      lazy: true,
      paginator: true,
      totalRecords: total,
      rows,
      first: (page - 1) * rows, // 🔑 chỉ sync UI
      onPage: (e) => {
        onChange({
          page: e.page + 1, // PrimeReact 0-based → Mongo 1-based
          rows: e.rows,
        });
      },
    };
  }