const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'expired'],
    default: 'pending',
    index: true
  },
  bitcartId: {
    type: String,
    sparse: true
  },
  bitcartPayoutId: {
    type: String,
    sparse: true
  },
  sellerPayoutProcessed: {
    type: Boolean,
    default: false
  },
  adminPayoutProcessed: {
    type: Boolean,
    default: false
  },
  payoutsProcessed: {
    type: Boolean,
    default: false
  },
  checkoutUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 * 48, // Tokens expire after 48 hours for security
    index: true
  }
});

// Compound indexes for common admin queries
purchaseSchema.index({ seller: 1, status: 1 });
purchaseSchema.index({ createdAt: -1 });


const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
