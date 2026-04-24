const fetch = require('node-fetch');
const prisma = require('../prisma/client');
const { networkFromDb } = require('../utils/enumMap');
const { generatePDFReport } = require('../utils/reportGenerator');
const { triggerPurchasePayouts } = require('./purchaseController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getCommissionRate = async () => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return parseFloat((settings && settings.commissionRate) || process.env.COMMISSION_RATE || 0.05);
};

// ── Admin stats ──────────────────────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res) => {
  const totalUsers = await prisma.user.count();
  const commissionRate = await getCommissionRate();

  const confirmedPurchases = await prisma.purchase.findMany({
    where: { status: 'confirmed' },
    include: { sale: true },
  });

  let totalBtcRevenue = 0;
  let totalUsdtRevenue = 0;
  let totalBtcCommission = 0;
  let totalUsdtCommission = 0;
  for (const p of confirmedPurchases) {
    if (!p.sale) continue;
    const price = parseFloat(p.sale.price);
    const commission = price * commissionRate;
    if (p.sale.currency === 'USDT') {
      totalUsdtRevenue += price;
      totalUsdtCommission += commission;
    } else {
      totalBtcRevenue += price;
      totalBtcCommission += commission;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalSales: confirmedPurchases.length,
      totalBtcRevenue: totalBtcRevenue.toFixed(8),
      totalUsdtRevenue: totalUsdtRevenue.toFixed(6),
      totalBtcCommission: totalBtcCommission.toFixed(8),
      totalUsdtCommission: totalUsdtCommission.toFixed(6),
      commissionRate,
    },
  });
});

// ── Users list with optional search ──────────────────────────────────────────
exports.getUsers = catchAsync(async (req, res) => {
  const { search } = req.query;
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users: users.map((u) => ({ ...u, _id: u.id })) },
  });
});

// ── Commission history ──────────────────────────────────────────────────────
exports.getHistory = catchAsync(async (req, res) => {
  const commissionRate = await getCommissionRate();

  const history = await prisma.purchase.findMany({
    where: { status: 'confirmed' },
    include: {
      sale: true,
      seller: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const formattedHistory = history.map((item) => {
    const currency = item.sale ? item.sale.currency : 'BTC';
    const dp = currency === 'BTC' ? 8 : 6;
    const price = item.sale ? parseFloat(item.sale.price) : 0;
    return {
      id: item.id,
      tokenId: item.tokenId,
      seller: item.seller,
      price,
      currency,
      network: item.sale ? networkFromDb(item.sale.network) : '',
      commission: (price * commissionRate).toFixed(dp),
      date: item.updatedAt,
      payoutsProcessed: item.payoutsProcessed,
      sellerPayoutProcessed: item.sellerPayoutProcessed,
      adminPayoutProcessed: item.adminPayoutProcessed,
    };
  });

  res.status(200).json({ status: 'success', data: { history: formattedHistory } });
});

// ── Settings (singleton upsert) ──────────────────────────────────────────────
exports.getSettings = catchAsync(async (req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  res.status(200).json({ status: 'success', data: { settings } });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const { adminBtcAddress, adminUsdtAddress, adminUsdtTrc20Address, commissionRate, btcWalletId, usdtTrc20WalletId } = req.body;

  const current = await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const bitcartChanges = [];
  const BITCART_HOST = process.env.BITCART_HOST;
  const BITCART_API_KEY = process.env.BITCART_API_KEY;

  const syncWallet = async (id, address, label) => {
    if (!id || !address || !BITCART_HOST || !BITCART_API_KEY) return;
    try {
      const response = await fetch(`${BITCART_HOST}/wallets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BITCART_API_KEY}` },
        body: JSON.stringify({ address }),
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

  const updateData = {};
  if (adminBtcAddress && adminBtcAddress !== current.adminBtcAddress) {
    updateData.adminBtcAddress = adminBtcAddress;
    await syncWallet(btcWalletId || current.btcWalletId || process.env.BITCART_WALLET_ID, adminBtcAddress, 'BTC');
  }
  if (adminUsdtTrc20Address && adminUsdtTrc20Address !== current.adminUsdtTrc20Address) {
    updateData.adminUsdtTrc20Address = adminUsdtTrc20Address;
    await syncWallet(
      usdtTrc20WalletId || current.usdtTrc20WalletId || process.env.BITCART_USDT_TRC20_WALLET_ID,
      adminUsdtTrc20Address,
      'USDT TRC20'
    );
  }
  if (adminUsdtAddress) updateData.adminUsdtAddress = adminUsdtAddress;
  if (commissionRate !== undefined) {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return next(new AppError('Commission rate must be a number between 0 and 1', 400));
    }
    updateData.commissionRate = rate;
  }
  if (btcWalletId) updateData.btcWalletId = btcWalletId;
  if (usdtTrc20WalletId) updateData.usdtTrc20WalletId = usdtTrc20WalletId;

  const settings = await prisma.settings.update({ where: { id: 1 }, data: updateData });
  res.status(200).json({ status: 'success', data: { settings, bitcartSync: bitcartChanges } });
});

// ── Income stats (last 14 days, grouped by date + currency) ─────────────────
// Mongo used $dateToString aggregation. Postgres equivalent: raw SQL on date_trunc.
exports.getIncomeStats = catchAsync(async (req, res) => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // $queryRaw — Prisma.raw-safe: fourteenDaysAgo is a Date parameter, NOT string-interpolated.
  const rows = await prisma.$queryRaw`
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
      currency,
      SUM(amount)::float AS amount
    FROM "Income"
    WHERE "createdAt" >= ${fourteenDaysAgo}
    GROUP BY date, currency
    ORDER BY date ASC
  `;

  const formattedStats = {};
  for (const item of rows) {
    const date = item.date;
    if (!formattedStats[date]) formattedStats[date] = { date, btc: 0, usdt: 0 };
    if (item.currency === 'USDT') {
      formattedStats[date].usdt = parseFloat(Number(item.amount).toFixed(6));
    } else {
      formattedStats[date].btc = parseFloat(Number(item.amount).toFixed(8));
    }
  }

  res.status(200).json({ status: 'success', data: { stats: Object.values(formattedStats) } });
});

// ── Download PDF Report ─────────────────────────────────────────────────────
exports.downloadReport = catchAsync(async (req, res) => {
  const commissionRate = await getCommissionRate();

  const totalUsers = await prisma.user.count();
  const confirmedPurchases = await prisma.purchase.findMany({
    where: { status: 'confirmed' },
    include: { sale: true },
  });

  let totalBtcRevenue = 0;
  let totalUsdtRevenue = 0;
  let totalBtcCommission = 0;
  let totalUsdtCommission = 0;
  for (const p of confirmedPurchases) {
    if (!p.sale) continue;
    const price = parseFloat(p.sale.price);
    const commission = price * commissionRate;
    if (p.sale.currency === 'USDT') {
      totalUsdtRevenue += price;
      totalUsdtCommission += commission;
    } else {
      totalBtcRevenue += price;
      totalBtcCommission += commission;
    }
  }

  const stats = {
    totalUsers,
    totalSales: confirmedPurchases.length,
    totalBtcRevenue: totalBtcRevenue.toFixed(8),
    totalUsdtRevenue: totalUsdtRevenue.toFixed(6),
    totalBtcCommission: totalBtcCommission.toFixed(8),
    totalUsdtCommission: totalUsdtCommission.toFixed(6),
    commissionRate: `${(commissionRate * 100).toFixed(1)}%`,
  };

  const historyData = await prisma.purchase.findMany({
    where: { status: 'confirmed' },
    include: {
      sale: true,
      seller: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const history = historyData.map((item) => {
    const currency = item.sale ? item.sale.currency : 'BTC';
    const dp = currency === 'BTC' ? 8 : 6;
    const price = item.sale ? parseFloat(item.sale.price) : 0;
    return {
      date: item.updatedAt,
      tokenId: item.tokenId,
      seller: item.seller,
      price,
      currency,
      network: item.sale ? networkFromDb(item.sale.network) : '',
      commission: (price * commissionRate).toFixed(dp),
    };
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=satoshibin-report-${new Date().toISOString().split('T')[0]}.pdf`);

  generatePDFReport({ stats, history }, res);
});

// ── Admin purchase management ───────────────────────────────────────────────
exports.verifyPurchaseAdmin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.params;
  let purchase = await prisma.purchase.findUnique({
    where: { tokenId },
    include: {
      sale: true,
      file: true,
      seller: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  if (!purchase) return next(new AppError('Purchase token not found', 404));

  if (purchase.status === 'pending' && purchase.bitcartId) {
    const BITCART_HOST = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;

    if (BITCART_HOST && BITCART_API_KEY) {
      try {
        const response = await fetch(`${BITCART_HOST}/invoices/${purchase.bitcartId}`, {
          headers: { Authorization: `Bearer ${BITCART_API_KEY}` },
        });
        const data = await response.json();
        if (response.ok && (data.status === 'complete' || data.status === 'paid')) {
          purchase = await prisma.purchase.update({
            where: { id: purchase.id },
            data: { status: 'confirmed', pendingExpiresAt: null },
            include: {
              sale: true,
              file: true,
              seller: { select: { firstName: true, lastName: true, email: true } },
            },
          });
          triggerPurchasePayouts(purchase.id).catch((e) => console.error('[Admin Verify] Payout error:', e));
        }
      } catch (err) {
        console.error('[Admin Verify] Bitcart fetch error:', err.message);
      }
    }
  }

  res.status(200).json({ status: 'success', data: { purchase: { ...purchase, _id: purchase.id } } });
});

exports.confirmPurchaseAdmin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.params;
  const existing = await prisma.purchase.findUnique({ where: { tokenId }, include: { sale: true } });
  if (!existing) return next(new AppError('Purchase token not found', 404));

  let purchase = existing;
  if (existing.status !== 'confirmed') {
    purchase = await prisma.purchase.update({
      where: { id: existing.id },
      data: { status: 'confirmed', pendingExpiresAt: null },
      include: { sale: true },
    });
    triggerPurchasePayouts(purchase.id).catch((e) => console.error('[Admin Confirm] Payout error:', e));
  } else if (!existing.payoutsProcessed) {
    triggerPurchasePayouts(existing.id).catch((e) => console.error('[Admin Confirm] Payout retry error:', e));
  }

  res.status(200).json({ status: 'success', data: { purchase: { ...purchase, _id: purchase.id } } });
});
