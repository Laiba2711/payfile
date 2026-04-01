const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../controllers/fileController');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Auth Middleware (Refactoring to a separate middleare soon if needed)
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token. Please log in again.' });
  }
};

// Multer Storage Configuration
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

const upload = multer({ storage: storage });

router.get('/public/download/:id', fileController.publicDownloadFile);

router.use(protect); // Apply protection to all other file routes

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/download/:id', fileController.downloadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
