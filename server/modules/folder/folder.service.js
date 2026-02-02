// src/modules/folder/folder.service.js
import fs from "fs";
import path from "path";
import { FolderModel } from "./folder.model.js";

export const FolderService = {
  async createFolder({ folderName, files }) {
    const exists = await FolderModel.findOne({ folderName });

    if (exists) {
      throw new Error("Folder already exists");
    }

    const images = files.map(file => ({
      key: file.filename,
      path: file.path.replace(/\\/g, "/"),
      uploadedAt: new Date(),
    }));

    return FolderModel.create({
      folderName,
      images,
    });
  },

  async getFolders() {
    // ⚠️ PHẢI trả về ARRAY
    return FolderModel.find({ deletedAt: null }).lean();
  },

  async getFolderDetail(id) {
    return FolderModel.findById(id);
  },

  async deleteFolder(id) {
    const folder = await FolderModel.findById(id);
    if (!folder) return;

    const folderPath = path.join("uploads", folder.folderName);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    // soft delete
    folder.deletedAt = new Date();
    await folder.save();
  },
};