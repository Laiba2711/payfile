const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── Multer Storage Configuration ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Block obviously dangerous file types (executables, scripts)
const BLOCKED_MIME_TYPES = new Set([
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'text/x-sh',
  'application/x-dosexec',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdos-program',
]);

const fileFilter = (req, file, cb) => {
  if (BLOCKED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB max per file (supports larger videos)
  }
});

// ── Public routes (no auth required) ─────────────────────────────────────────
router.get('/public/download/:id', fileController.publicDownloadFile);
router.get('/shared/info/:id', fileController.getSharedFileInfo);
router.post('/shared/download/:id', fileController.sharedDownloadFile);
router.get('/public/preview/:id', fileController.getPreviewFile);

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(authMiddleware.protect);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/download/:id', fileController.downloadFile);
router.post('/:id/share', fileController.shareFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
