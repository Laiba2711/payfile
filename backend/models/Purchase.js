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
    sparse: true,
    index: true   // Indexed for fast webhook lookups
  },
  bitcartPayoutId: {
    type: String,
    sparse: true
  },
  adminBitcartPayoutId: {
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
  // TTL for PENDING-only cleanup: automatically expire invoices that were never paid.
  // This field is only set for pending purchases; confirmed ones are never deleted.
  pendingExpiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }  // MongoDB removes when Date is reached
  }
}, { timestamps: true });   // Adds createdAt + updatedAt automatically

// Compound indexes for common admin/seller queries
purchaseSchema.index({ seller: 1, status: 1 });
purchaseSchema.index({ createdAt: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
