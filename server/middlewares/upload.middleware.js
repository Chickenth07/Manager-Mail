import multer from "multer";
import fs from "fs";
import path from "path";
import { slugify } from "../utils/slugify.js";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const rawName = req.body.folderName || req.query.folderName;

    if (!rawName) {
      return cb(new Error("folderName is required"));
    }

    const safeFolderName = slugify(rawName);

    // lưu lại để controller dùng
    req.safeFolderName = safeFolderName;

    const uploadPath = path.join("uploads", safeFolderName);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const safeFolderName = req.safeFolderName;
    const ext = path.extname(file.originalname);

    const unique =
      Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    cb(null, `${safeFolderName}_${unique}${ext}`);
  },
});

export const uploadImages = multer({
    storage,
    fileFilter(req, file, cb) {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only images allowed"), false);
      }
      cb(null, true);
    },
  }).array("images", 1000);