const User = require('../models/User');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Settings = require('../models/Settings');
const Income = require('../models/Income');
const { generatePDFReport } = require('../utils/reportGenerator');
const { triggerPurchasePayouts } = require('./purchaseController');
const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// ── Helper: load dynamic commission rate ──────────────────────────────────────
const getCommissionRate = async () => {
  const settings = await Settings.findOne();
  return parseFloat((settings && settings.commissionRate) || process.env.COMMISSION_RATE || 0.05);
};

// ── Get Admin Statistics ──────────────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  
  // Load dynamic commission rate — NOT hard-coded 0.05
  const commissionRate = await getCommissionRate();
  
  const confirmedPurchases = await Purchase.find({ status: 'confirmed' }).populate('sale');
  
  let totalBtcRevenue = 0;
  let totalUsdtRevenue = 0;
  let totalBtcCommission = 0;
  let totalUsdtCommission = 0;
  
  confirmedPurchases.forEach(purchase => {
    if (purchase.sale) {
      const price = parseFloat(purchase.sale.price);
      const commission = price * commissionRate;
      if (purchase.sale.currency === 'USDT') {
        totalUsdtRevenue += price;
        totalUsdtCommission += commission;
      } else {
        totalBtcRevenue += price;
        totalBtcCommission += commission;
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalSales: confirmedPurchases.length,
      totalBtcRevenue: totalBtcRevenue.toFixed(8),
      totalUsdtRevenue: totalUsdtRevenue.toFixed(2),
      totalBtcCommission: totalBtcCommission.toFixed(8),
      totalUsdtCommission: totalUsdtCommission.toFixed(2),
      commissionRate
    }
  });
});


// ── Get All Users ─────────────────────────────────────────────────────────────
exports.getUsers = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const users = await User.find(query).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

// ── Get Commission History ────────────────────────────────────────────────────
exports.getHistory = catchAsync(async (req, res, next) => {
  const commissionRate = await getCommissionRate();

  const history = await Purchase.find({ status: 'confirmed' })
    .populate('sale')
    .populate('seller', 'firstName lastName email')
    .sort('-updatedAt');

  const formattedHistory = history.map(item => {
    const currency = item.sale ? item.sale.currency : 'BTC';
    const dp = currency === 'BTC' ? 8 : 2;
    const price = item.sale ? parseFloat(item.sale.price) : 0;
    return {
      id: item._id,
      tokenId: item.tokenId,
      seller: item.seller,
      price,
      currency,
      network: item.sale ? item.sale.network : '',
      commission: (price * commissionRate).toFixed(dp),
      date: item.updatedAt,
      payoutsProcessed: item.payoutsProcessed,
      sellerPayoutProcessed: item.sellerPayoutProcessed,
      adminPayoutProcessed: item.adminPayoutProcessed,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { history: formattedHistory }
  });
});


// ── Settings ──────────────────────────────────────────────────────────────────
exports.getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json({ status: 'success', data: { settings } });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const { 
    adminBtcAddress, 
    adminUsdtAddress, 
    adminUsdtTrc20Address, 
    adminUsdtErc20Address, 
    commissionRate,
    btcWalletId,
    usdtTrc20WalletId,
    usdtErc20WalletId
  } = req.body;
  
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }
  
  const bitcartChanges = [];
  const BITCART_HOST = process.env.BITCART_HOST;
  const BITCART_API_KEY = process.env.BITCART_API_KEY;

  // Sync wallet address to Bitcart
  const syncWallet = async (id, address, label) => {
    if (!id || !address || !BITCART_HOST || !BITCART_API_KEY) return;
    try {
      const response = await fetch(`${BITCART_HOST}/wallets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BITCART_API_KEY}`
        },
        body: JSON.stringify({ address })
      });
      if (!response.ok) {
        const errData = await response.json();
        bitcartChanges.push({ label, status: 'error', message: errData.detail || 'Sync failed' });
      } else {
        bitcartChanges.push({ label, status: 'success' });
      }
    } catch (err) {
      bitcartChanges.push({ label, status: 'error', message: err.message });
    }
  };

  // Detect changes and sync if IDs exist
  if (adminBtcAddress && adminBtcAddress !== settings.adminBtcAddress) {
    settings.adminBtcAddress = adminBtcAddress;
    await syncWallet(btcWalletId || settings.btcWalletId || process.env.BITCART_WALLET_ID, adminBtcAddress, 'BTC');
  }
  
  if (adminUsdtTrc20Address && adminUsdtTrc20Address !== settings.adminUsdtTrc20Address) {
    settings.adminUsdtTrc20Address = adminUsdtTrc20Address;
    await syncWallet(usdtTrc20WalletId || settings.usdtTrc20WalletId || process.env.BITCART_USDT_TRC20_WALLET_ID, adminUsdtTrc20Address, 'USDT TRC20');
  }

  if (adminUsdtErc20Address && adminUsdtErc20Address !== settings.adminUsdtErc20Address) {
    settings.adminUsdtErc20Address = adminUsdtErc20Address;
    await syncWallet(usdtErc20WalletId || settings.usdtErc20WalletId || process.env.BITCART_USDT_ERC20_WALLET_ID, adminUsdtErc20Address, 'USDT ERC20');
  }

  // Update other fields
  if (adminUsdtAddress)    settings.adminUsdtAddress   = adminUsdtAddress;
  if (commissionRate !== undefined) {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return next(new AppError('Commission rate must be a number between 0 and 1', 400));
    }
    settings.commissionRate = rate;
  }
  if (btcWalletId)         settings.btcWalletId        = btcWalletId;
  if (usdtTrc20WalletId)   settings.usdtTrc20WalletId  = usdtTrc20WalletId;
  if (usdtErc20WalletId)   settings.usdtErc20WalletId  = usdtErc20WalletId;
  
  await settings.save();

  res.status(200).json({
    status: 'success',
    data: { settings, bitcartSync: bitcartChanges }
  });
});


// ── Get Income Stats for Chart (last 14 days) ─────────────────────────────────
exports.getIncomeStats = catchAsync(async (req, res, next) => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const stats = await Income.aggregate([
    {
      $match: { createdAt: { $gte: fourteenDaysAgo } }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          currency: '$currency'
        },
        amount: { $sum: '$amount' }   // Works correctly because amount is stored as Number
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Format for frontend grouping by date
  const formattedStats = {};
  stats.forEach(item => {
    const date = item._id.date;
    if (!formattedStats[date]) {
      formattedStats[date] = { date, btc: 0, usdt: 0 };
    }
    if (item._id.currency === 'USDT') {
      formattedStats[date].usdt = parseFloat(item.amount.toFixed(2));
    } else {
      formattedStats[date].btc = parseFloat(item.amount.toFixed(8));
    }
  });

  res.status(200).json({
    status: 'success',
    data: { stats: Object.values(formattedStats) }
  });
});

// ── Download PDF Report ───────────────────────────────────────────────────────
exports.downloadReport = catchAsync(async (req, res, next) => {
  // Load dynamic commission rate
  const commissionRate = await getCommissionRate();

  const totalUsers = await User.countDocuments();
  const confirmedPurchases = await Purchase.find({ status: 'confirmed' }).populate('sale');
  
  let totalBtcRevenue = 0;
  let totalUsdtRevenue = 0;
  let totalBtcCommission = 0;
  let totalUsdtCommission = 0;
  
  confirmedPurchases.forEach(purchase => {
    if (purchase.sale) {
      const price = parseFloat(purchase.sale.price);
      const commission = price * commissionRate;
      if (purchase.sale.currency === 'USDT') {
        totalUsdtRevenue += price;
        totalUsdtCommission += commission;
      } else {
        totalBtcRevenue += price;
        totalBtcCommission += commission;
      }
    }
  });

  const stats = {
    totalUsers,
    totalSales: confirmedPurchases.length,
    totalBtcRevenue: totalBtcRevenue.toFixed(8),
    totalUsdtRevenue: totalUsdtRevenue.toFixed(2),
    totalBtcCommission: totalBtcCommission.toFixed(8),
    totalUsdtCommission: totalUsdtCommission.toFixed(2),
    commissionRate: `${(commissionRate * 100).toFixed(1)}%`
  };

  const historyData = await Purchase.find({ status: 'confirmed' })
    .populate('sale')
    .populate('seller', 'firstName lastName email')
    .sort('-updatedAt');

  const history = historyData.map(item => {
    const currency = item.sale ? item.sale.currency : 'BTC';
    const dp = currency === 'BTC' ? 8 : 2;
    const price = item.sale ? parseFloat(item.sale.price) : 0;
    return {
      date: item.updatedAt,
      tokenId: item.tokenId,
      seller: item.seller,
      price,
      currency,
      network: item.sale ? item.sale.network : '',
      commission: (price * commissionRate).toFixed(dp)
    };
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=satoshibin-report-${new Date().toISOString().split('T')[0]}.pdf`);

  generatePDFReport({ stats, history }, res);
});

// ── Admin Purchase Management ─────────────────────────────────────────────────
exports.verifyPurchaseAdmin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.params;
  const purchase = await Purchase.findOne({ tokenId })
    .populate('sale')
    .populate('file')
    .populate('seller', 'firstName lastName email');
  
  if (!purchase) {
    return next(new AppError('Purchase token not found', 404));
  }

  // Smart Sync: If pending, check Bitcart for live status
  if (purchase.status === 'pending' && purchase.bitcartId) {
    const BITCART_HOST = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;

    if (BITCART_HOST && BITCART_API_KEY) {
      try {
        const response = await fetch(`${BITCART_HOST}/invoices/${purchase.bitcartId}`, {
          headers: { 'Authorization': `Bearer ${BITCART_API_KEY}` }
        });
        const data = await response.json();

        if (response.ok && (data.status === 'complete' || data.status === 'paid')) {
          purchase.status = 'confirmed';
          purchase.pendingExpiresAt = undefined;
          await purchase.save();

          // Trigger payouts in background
          triggerPurchasePayouts(purchase._id).catch(e =>
            console.error('[Admin Verify] Payout error:', e)
          );
        }
      } catch (err) {
        console.error('[Admin Verify] Bitcart fetch error:', err.message);
      }
    }
  }

  res.status(200).json({ status: 'success', data: { purchase } });
});


exports.confirmPurchaseAdmin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.params;
  const purchase = await Purchase.findOne({ tokenId }).populate('sale');
  
  if (!purchase) {
    return next(new AppError('Purchase token not found', 404));
  }

  if (purchase.status !== 'confirmed') {
    purchase.status = 'confirmed';
    purchase.pendingExpiresAt = undefined;
    await purchase.save();

    // Trigger payouts — this was missing before and is the root cause of seller
    // never receiving funds after an admin manual confirm
    triggerPurchasePayouts(purchase._id).catch(e =>
      console.error('[Admin Confirm] Payout error:', e)
    );
  } else if (!purchase.payoutsProcessed) {
    // Already confirmed but payouts may have failed — retry
    triggerPurchasePayouts(purchase._id).catch(e =>
      console.error('[Admin Confirm] Payout retry error:', e)
    );
  }

  res.status(200).json({ status: 'success', data: { purchase } });
});
