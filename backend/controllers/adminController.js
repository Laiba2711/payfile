const User = require('../models/User');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Settings = require('../models/Settings');
const Income = require('../models/Income');
const { generatePDFReport } = require('../utils/reportGenerator');
const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');



// Get Admin Statistics
exports.getStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  
  // Total Sales (only confirmed ones)
  const confirmedPurchases = await Purchase.find({ status: 'confirmed' }).populate('sale');
  
  let totalBtcRevenue = 0;
  let totalUsdtRevenue = 0;
  let totalBtcCommission = 0;
  let totalUsdtCommission = 0;
  
  confirmedPurchases.forEach(purchase => {
    if (purchase.sale) {
      const price = parseFloat(purchase.sale.price);
      const commission = price * 0.05;
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
      totalUsdtCommission: totalUsdtCommission.toFixed(2)
    }
  });
});


// Get All Users
exports.getUsers = async (req, res) => {
  try {
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
      data: {
        users
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Get Commission History
exports.getHistory = catchAsync(async (req, res, next) => {
  const history = await Purchase.find({ status: 'confirmed' })
    .populate('sale')
    .populate('seller', 'firstName lastName email')
    .sort('-updatedAt');

  const formattedHistory = history.map(item => {
    const currency = item.sale ? item.sale.currency : 'BTC';
    const dp = currency === 'BTC' ? 8 : 2;
    return {
      id: item._id,
      tokenId: item.tokenId,
      seller: item.seller,
      price: item.sale ? item.sale.price : 0,
      currency,
      network: item.sale ? item.sale.network : '',
      commission: item.sale ? (item.sale.price * 0.05).toFixed(dp) : 0,
      date: item.updatedAt
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      history: formattedHistory
    }
  });
});


// Settings (BTC/USDT Addresses)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

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

  // Sync function helper
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
  if (adminUsdtAddress) settings.adminUsdtAddress = adminUsdtAddress;
  if (commissionRate !== undefined) settings.commissionRate = commissionRate;
  if (btcWalletId) settings.btcWalletId = btcWalletId;
  if (usdtTrc20WalletId) settings.usdtTrc20WalletId = usdtTrc20WalletId;
  if (usdtErc20WalletId) settings.usdtErc20WalletId = usdtErc20WalletId;
  
  settings.updatedAt = Date.now();
  await settings.save();

  res.status(200).json({
    status: 'success',
    data: {
      settings,
      bitcartSync: bitcartChanges
    }
  });
});


// Get Income Stats for Chart (last 14 days)
exports.getIncomeStats = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const stats = await Income.aggregate([
      {
        $match: {
          createdAt: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            currency: "$currency"
          },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Format for frontend grouping by date
    const formattedStats = {};
    stats.forEach(item => {
      const date = item._id.date;
      if (!formattedStats[date]) {
        formattedStats[date] = { date, btc: 0, usdt: 0, amount: 0 }; // 'amount' kept for backward compatibility if needed
      }
      if (item._id.currency === 'USDT') {
        formattedStats[date].usdt = parseFloat(item.amount.toFixed(2));
      } else {
        formattedStats[date].btc = parseFloat(item.amount.toFixed(8));
        formattedStats[date].amount = formattedStats[date].btc; // BTC is default 'amount'
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: Object.values(formattedStats)
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Download PDF Report
exports.downloadReport = async (req, res) => {
  try {
    // 1. Get Statistical Summary
    const totalUsers = await User.countDocuments();
    const confirmedPurchases = await Purchase.find({ status: 'confirmed' }).populate('sale');
    
    let totalBtcRevenue = 0;
    let totalUsdtRevenue = 0;
    let totalBtcCommission = 0;
    let totalUsdtCommission = 0;
    
    confirmedPurchases.forEach(purchase => {
      if (purchase.sale) {
        const price = parseFloat(purchase.sale.price);
        const commission = price * 0.05;
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
      totalUsdtCommission: totalUsdtCommission.toFixed(2)
    };

    // 2. Get Transaction Ledger
    const historyData = await Purchase.find({ status: 'confirmed' })
      .populate('sale')
      .populate('seller', 'firstName lastName email')
      .sort('-updatedAt');

    const history = historyData.map(item => {
      const currency = item.sale ? item.sale.currency : 'BTC';
      const dp = currency === 'BTC' ? 8 : 2;
      return {
        date: item.updatedAt,
        tokenId: item.tokenId,
        seller: item.seller,
        price: item.sale ? item.sale.price : 0,
        currency,
        network: item.sale ? item.sale.network : '',
        commission: item.sale ? (item.sale.price * 0.05).toFixed(dp) : 0
      };
    });

    // 3. Set Headers and Generate PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payfile-report-${new Date().toISOString().split('T')[0]}.pdf`);

    generatePDFReport({ stats, history }, res);

  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Admin Purchase Management
exports.verifyPurchaseAdmin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.params;
  const purchase = await Purchase.findOne({ tokenId }).populate('sale').populate('file').populate('seller', 'firstName lastName email');
  
  if (!purchase) {
    return next(new AppError('Purchase token not found', 404));
  }

  // Smart Sync: If pending, check BitCart API
  if (purchase.status === 'pending' && purchase.bitcartId) {
    const BITCART_HOST = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;

    const response = await fetch(`${BITCART_HOST}/invoices/${purchase.bitcartId}`, {
      headers: { 'Authorization': `Bearer ${BITCART_API_KEY}` }
    });
    const data = await response.json();

    if (response.ok && (data.status === 'complete' || data.status === 'paid')) {
      const dp = (purchase.sale?.currency === 'USDT') ? 2 : 8;
      purchase.status = 'confirmed';
      await purchase.save();

      // Record Income
      await Income.create({
        amount: (parseFloat(purchase.sale.price) * 0.05).toFixed(dp),
        currency: purchase.sale.currency || 'BTC',
        purchase: purchase._id,
        tokenId: purchase.tokenId
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: { purchase }
  });
});


exports.confirmPurchaseAdmin = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const purchase = await Purchase.findOne({ tokenId }).populate('sale');
    
    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase token not found' });
    }

    if (purchase.status !== 'confirmed') {
      purchase.status = 'confirmed';
      await purchase.save();

      // Record Admin Income
      if (purchase.sale) {
        const dp = (purchase.sale.currency === 'USDT') ? 2 : 8;
        await Income.create({
          amount: (parseFloat(purchase.sale.price) * 0.05).toFixed(dp),
          currency: purchase.sale.currency || 'BTC',
          purchase: purchase._id,
          tokenId: purchase.tokenId
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { purchase }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
