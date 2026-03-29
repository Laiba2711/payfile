const Sale = require('../models/Sale');

exports.createSale = async (req, res) => {
  try {
    const { fileId, price, currency, address, expiry } = req.body;

    let expiresAt;
    if (expiry) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));
    }

    const newSale = await Sale.create({
      file: fileId,
      seller: req.user.id,
      price,
      currency,
      address,
      expiresAt
    });

    res.status(201).json({
      status: 'success',
      data: {
        sale: newSale
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ seller: req.user.id }).populate('file').sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: {
        sales
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getPublicSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate({
        path: 'file',
        select: 'name size mimeType createdAt expiresAt'
      });

    if (!sale) {
      return res.status(404).json({ status: 'fail', message: 'Sale listing not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        sale
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
