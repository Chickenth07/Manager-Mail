import { FolderService } from "./folder.service.js";

export const FolderController = {
  async create(req, res) {
    console.log("===== CONTROLLER CREATE =====");
    console.log("QUERY:", req.query);
    console.log("BODY:", req.body);
    console.log("FILES:", req.files?.length);

    const folderName = req.query.folderName;

    if (!folderName) {
      return res.status(400).json({
        success: false,
        message: "folderName is required",
      });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({
        success: false,
        message: "Images are required",
      });
    }

    const folder = await FolderService.createFolder({
      folderName,
      files: req.files,
    });

    return res.json({
      success: true,
      data: folder,
    });
  },

  async list(req, res) {
    const data = await FolderService.getFolders();
    res.json(data); // array
  },

  async detail(req, res) {
    const data = await FolderService.getFolderDetail(req.params.id);
    res.json(data);
  },

  async remove(req, res) {
    await FolderService.deleteFolder(req.params.id);
    res.json({ success: true });
  },
};