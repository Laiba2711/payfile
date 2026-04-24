const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Client-legacy: expose `_id` alongside `id` so frontend keeps working.
const withLegacyId = (file) => (file ? { ...file, _id: file.id } : file);

exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded', 400));

  let expiresAt;
  if (req.body.expiry) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(req.body.expiry));
  }

  let previewPath = null;
  if (req.file.mimetype.startsWith('image/')) {
    try {
      const sharp = require('sharp');
      const uploadDir = path.dirname(req.file.path);
      const previewFilename = 'preview-' + path.basename(req.file.path);
      const destination = path.join(uploadDir, previewFilename);
      await sharp(req.file.path)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .blur(20)
        .toFile(destination);
      previewPath = destination;
    } catch (err) {
      console.error('Error generating image preview:', err);
    }
  }

  const newFile = await prisma.file.create({
    data: {
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      userId: req.user.id,
      expiresAt,
      previewPath,
    },
  });

  res.status(201).json({ status: 'success', data: { file: withLegacyId(newFile) } });
});

exports.getFiles = catchAsync(async (req, res, next) => {
  const files = await prisma.file.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({
    status: 'success',
    results: files.length,
    data: { files: files.map(withLegacyId) },
  });
});

exports.downloadFile = catchAsync(async (req, res, next) => {
  const file = await prisma.file.findUnique({ where: { id: req.params.id } });
  if (!file) return next(new AppError('File not found', 404));
  if (file.userId !== req.user.id) return next(new AppError('Unauthorized access', 403));
  if (!fs.existsSync(file.path)) return next(new AppError('File missing on server', 404));
  res.download(file.path, file.name);
});

exports.deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ status: 'fail', message: 'File not found' });
    if (file.userId !== req.user.id) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Cascade: remove sales tied to this file first so FK doesn't block the delete.
    await prisma.sale.deleteMany({ where: { fileId: file.id } });
    await prisma.file.delete({ where: { id: file.id } });

    res.status(200).json({
      status: 'success',
      message: 'File and associated data deleted successfully',
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.publicDownloadFile = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(401).json({ status: 'fail', message: 'Purchase token required' });

    const purchase = await prisma.purchase.findUnique({ where: { tokenId: token } });
    if (!purchase || purchase.status !== 'confirmed') {
      return res.status(403).json({ status: 'fail', message: 'Invalid or unconfirmed purchase token' });
    }

    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file || file.id !== purchase.fileId) {
      return res.status(404).json({ status: 'fail', message: 'File not matched' });
    }
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ status: 'fail', message: 'File not found on server' });
    }
    res.download(file.path, file.name);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.shareFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ status: 'fail', message: 'File not found' });
    if (file.userId !== req.user.id) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    let shareExpiresAt = null;
    if (req.body.days) {
      shareExpiresAt = new Date();
      shareExpiresAt.setDate(shareExpiresAt.getDate() + parseInt(req.body.days));
    }

    let sharePassword = null;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      sharePassword = await bcrypt.hash(req.body.password, salt);
    }

    await prisma.file.update({
      where: { id: file.id },
      data: {
        shareExpiresAt,
        // Empty password clears it; set password rewrites it.
        sharePassword: sharePassword ?? null,
      },
    });

    res.status(200).json({ status: 'success', message: 'Share link configured' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getSharedFileInfo = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ status: 'fail', message: 'File not found' });
    if (file.shareExpiresAt && new Date(file.shareExpiresAt) < new Date()) {
      return res.status(404).json({ status: 'fail', message: 'Share link expired' });
    }
    res.status(200).json({
      status: 'success',
      data: { name: file.name, size: file.size, requiresPassword: !!file.sharePassword },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.sharedDownloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ status: 'fail', message: 'File not found' });
    if (file.shareExpiresAt && new Date(file.shareExpiresAt) < new Date()) {
      return res.status(404).json({ status: 'fail', message: 'Share link expired' });
    }
    if (file.sharePassword) {
      const { password } = req.body;
      if (!password) return res.status(401).json({ status: 'fail', message: 'Password required' });
      const isMatch = await bcrypt.compare(password, file.sharePassword);
      if (!isMatch) return res.status(401).json({ status: 'fail', message: 'Incorrect password' });
    }
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ status: 'fail', message: 'File not found on server' });
    }
    res.download(file.path, file.name);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getPreviewFile = catchAsync(async (req, res, next) => {
  const file = await prisma.file.findUnique({ where: { id: req.params.id } });
  if (!file || !file.previewPath || !fs.existsSync(file.previewPath)) {
    return next(new AppError('Preview not available', 404));
  }
  res.sendFile(file.previewPath);
});
