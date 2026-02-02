export function slugify(str = "") {
    return str
      .toLowerCase()
      .normalize("NFD")                 // tách dấu
      .replace(/[\u0300-\u036f]/g, "")  // xoá dấu
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")     // bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, "-")             // space → -
      .replace(/-+/g, "-");             // gộp --
  }