const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['BTC', 'USDT'],
    default: 'BTC'
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  tokenId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Optimization for Admin Dashboard Stats
incomeSchema.index({ createdAt: 1, currency: 1 });


const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
