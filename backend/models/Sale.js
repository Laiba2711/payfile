const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'Sale must belong to a file']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sale must belong to a seller']
  },
  price: {
    type: Number,
    required: [true, 'Sale must have a price']
  },
  currency: {
    type: String,
    enum: ['BTC', 'USDT'],
    default: 'BTC'
  },
  network: {
    type: String,
    enum: ['', 'TRC20'],
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Sale must have a payment address']
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'sold'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;

