const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  // Store as Number — NEVER as a .toFixed() string, which breaks $sum aggregation.
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
  // Extra audit fields
  adminAddress: {
    type: String,
    default: ''
  },
  payoutSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for Admin Dashboard income-stats aggregation
incomeSchema.index({ createdAt: 1, currency: 1 });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
