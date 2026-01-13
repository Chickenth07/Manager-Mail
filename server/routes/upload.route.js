import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Không có file nào được upload" 
      });
    }

    // Sử dụng biến môi trường cho base URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    res.json({
      success: true,
      url: `${baseUrl}/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi khi upload file" 
    });
  }
});

// Error handling middleware cho multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
});

export default router;