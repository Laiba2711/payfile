const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  adminBtcAddress: {
    type: String,
    default: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  },
  // Generic USDT address (kept for backward compatibility)
  adminUsdtAddress: {
    type: String,
    default: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  adminUsdtTrc20Address: {
    type: String,
    default: ''
  },

  commissionRate: {
    type: Number,
    default: 0.05
  },
  btcWalletId: {
    type: String,
    default: ""
  },
  usdtTrc20WalletId: {
    type: String,
    default: ""
  },


  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;

