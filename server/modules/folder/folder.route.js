// src/modules/folder/folder.route.js
import express from "express";
import { uploadImages } from "../../middlewares/upload.middleware.js";
import { FolderController } from "./folder.controller.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    console.log("===== BEFORE MULTER =====");
    console.log("QUERY:", req.query);
    console.log("HEADERS content-type:", req.headers["content-type"]);
    next();
  },
  uploadImages,
  FolderController.create
);
router.get("/", FolderController.list);
router.get("/:id", FolderController.detail);
router.delete("/:id", FolderController.remove);

export default router;
