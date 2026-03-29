const File = require('../models/File');
const Sale = require('../models/Sale');
const path = require('path');
const fs = require('fs');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let expiresAt;
    if (req.body.expiry) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(req.body.expiry));
    }

    const newFile = await File.create({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      user: req.user.id,
      expiresAt
    });

    res.status(201).json({
      status: 'success',
      data: {
        file: newFile
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: files.length,
      data: {
        files
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ status: 'fail', message: 'File not found' });
    }

    // Verify ownership
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ status: 'fail', message: 'File not found on server' });
    }

    res.download(file.path, file.name);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ status: 'fail', message: 'File not found' });
    }

    // Verify ownership
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
    }

    // Delete from disk if exists
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete associated sales
    await Sale.deleteMany({ file: file._id });

    // Delete from DB
    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'File and associated data deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
