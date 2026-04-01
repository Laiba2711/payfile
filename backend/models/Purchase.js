const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
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
    default: 'pending'
  },
  bitcartId: {
    type: String,
    sparse: true
  },
  bitcartPayoutId: {
    type: String,
    sparse: true
  },
  checkoutUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 * 48 // Tokens expire after 48 hours for security
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
