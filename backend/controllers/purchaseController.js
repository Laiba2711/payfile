const crypto = require('crypto');
const fetch = require('node-fetch');
const prisma = require('../prisma/client');
const { networkFromDb } = require('../utils/enumMap');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// ─── Bitcart currency code mapping ──────────────────────────────────────────
// Bitcart uses its own currency codes that differ from our internal names.
// BTC → 'BTC' | USDT TRC20 → 'USDTTRX' | USDT ERC20 → 'USDTETH'
const getBitcartCurrencyCode = (currency, network) => {
  if (currency === 'BTC') return 'BTC';
  if (currency === 'USDT') return 'USDTTRX';
  return currency;
};

// Merge env-level config with DB Settings (env always wins for addresses).
const loadSettings = async () => {
  const db = (await prisma.settings.findUnique({ where: { id: 1 } })) || {};
  return {
    adminBtcAddress: process.env.ADMIN_BTC_ADDRESS || db.adminBtcAddress || '',
    adminUsdtAddress: process.env.ADMIN_USDT_ADDRESS || db.adminUsdtAddress || '',
    adminUsdtTrc20Address: process.env.ADMIN_USDT_TRC20_ADDRESS || db.adminUsdtTrc20Address || '',
    commissionRate: db.commissionRate || 0.05,
    btcWalletId: process.env.BITCART_WALLET_ID || db.btcWalletId || '',
    usdtTrc20WalletId: process.env.BITCART_USDT_TRC20_WALLET_ID || db.usdtTrc20WalletId || '',
  };
};

// ── POST /api/purchases ─────────────────────────────────────────────────────
// Buyer initiates a purchase: create a Bitcart invoice for (seller price + commission).
exports.createPurchase = catchAsync(async (req, res, next) => {
  const { saleId } = req.body;
  const sale = await prisma.sale.findUnique({ where: { id: saleId }, include: { file: true } });
  if (!sale) return next(new AppError('Sale not found', 404));

  const BITCART_HOST = process.env.BITCART_HOST;
  const BITCART_API_KEY = process.env.BITCART_API_KEY;
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID;
  if (!BITCART_HOST || !BITCART_API_KEY || !BITCART_STORE_ID) {
    return next(new AppError('Payment system not configured on server', 500));
  }

  const settings = await loadSettings();
  const commissionRate = parseFloat(settings.commissionRate) || 0.05;

  const dp = sale.currency === 'BTC' ? 8 : 6;
  const sellerAmount = parseFloat(sale.price);
  const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
  const totalAmount = parseFloat((sellerAmount + commissionAmount).toFixed(dp));

  const walletId = sale.currency === 'USDT' ? settings.usdtTrc20WalletId : settings.btcWalletId;

  const bitcartCurrency = getBitcartCurrencyCode(sale.currency, networkFromDb(sale.network));

  // BACKEND_URL must be the Docker-internal service name so Bitcart reaches us.
  const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

  const invoiceBody = {
    price: totalAmount,
    store_id: BITCART_STORE_ID,
    order_id: saleId,
    notification_url: `${backendUrl}/api/purchases/bitcart-webhook`,
    currency: bitcartCurrency,
  };
  if (walletId) invoiceBody.wallet_id = walletId;

  const response = await fetch(`${BITCART_HOST}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BITCART_API_KEY}` },
    body: JSON.stringify(invoiceBody),
  });

  const data = await response.json();
  if (!response.ok) {
    return next(new AppError(data.detail || 'Failed to create payment invoice', 400));
  }

  const tokenId = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  // 48h cleanup window (replaces Mongo's TTL index). See startPendingPurchaseCleanupJob in server.js.
  const pendingExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const purchase = await prisma.purchase.create({
    data: {
      tokenId,
      saleId: sale.id,
      fileId: sale.file.id,
      sellerId: sale.sellerId,
      status: 'pending',
      bitcartId: data.id,
      checkoutUrl: `/checkout/${tokenId}`,
      pendingExpiresAt,
    },
  });

  res.status(201).json({ status: 'success', data: { purchase: { ...purchase, _id: purchase.id } } });
});

// ── GET /api/purchases/status/:tokenId ──────────────────────────────────────
exports.getPurchaseStatus = catchAsync(async (req, res, next) => {
  const purchase = await prisma.purchase.findUnique({ where: { tokenId: req.params.tokenId } });
  if (!purchase) return next(new AppError('Purchase token not found', 404));
  res.status(200).json({ status: 'success', data: { status: purchase.status } });
});

// ── GET /api/purchases/verify/:tokenId (seller) ─────────────────────────────
exports.getPurchaseDetailsForSeller = catchAsync(async (req, res, next) => {
  const purchase = await prisma.purchase.findFirst({
    where: { tokenId: req.params.tokenId, sellerId: req.user.id },
    include: { file: true, sale: true },
  });
  if (!purchase) return next(new AppError('Token not found or unauthorized', 404));
  res.status(200).json({ status: 'success', data: { purchase: { ...purchase, _id: purchase.id } } });
});

// ── PATCH /api/purchases/confirm/:tokenId (seller manual confirm) ───────────
exports.confirmPurchase = catchAsync(async (req, res, next) => {
  const found = await prisma.purchase.findFirst({
    where: { tokenId: req.params.tokenId, sellerId: req.user.id },
  });
  if (!found) return next(new AppError('Token not found or unauthorized', 404));

  const purchase = await prisma.purchase.update({
    where: { id: found.id },
    data: { status: 'confirmed' },
  });

  triggerPurchasePayouts(purchase.id).catch((e) => console.error('Payout trigger error:', e));

  res.status(200).json({ status: 'success', data: { purchase: { ...purchase, _id: purchase.id } } });
});

// ── Shared payout helper ────────────────────────────────────────────────────
// currency must be a Bitcart-specific code: 'BTC', 'USDTTRX', or 'USDTETH'.
// DO NOT pass 'USDT' directly — Bitcart will reject it.
const createBitcartPayout = async ({ amount, bitcartCurrency, destination, walletId }) => {
  const BITCART_HOST = process.env.BITCART_HOST;
  const BITCART_API_KEY = process.env.BITCART_API_KEY;
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID;
  const resolvedWallet = walletId || process.env.BITCART_WALLET_ID;

  if (!BITCART_HOST || !BITCART_API_KEY || !BITCART_STORE_ID) {
    return { ok: false, error: 'Bitcart not configured (missing HOST/API_KEY/STORE_ID)' };
  }
  if (!resolvedWallet) return { ok: false, error: 'No wallet ID available for payout' };
  if (!destination) return { ok: false, error: 'No destination address for payout' };

  console.log(`[Payout] ${amount} ${bitcartCurrency} → ${destination} (wallet: ${resolvedWallet})`);

  const payoutBody = {
    amount,
    currency: bitcartCurrency,
    destination,
    store_id: BITCART_STORE_ID,
    wallet_id: resolvedWallet,
  };

  const res = await fetch(`${BITCART_HOST}/payouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BITCART_API_KEY}` },
    body: JSON.stringify(payoutBody),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data.detail || data.message || JSON.stringify(data);
    return { ok: false, error: errMsg };
  }
  return { ok: true, payoutId: data.id, status: data.status };
};

// ── Shared payout trigger ──────────────────────────────────────────────────
// Called when a purchase is confirmed (via webhook, polling, or manual admin confirm).
// Fully idempotent — checks each flag before creating a payout.
const triggerPurchasePayouts = async (purchaseId) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { sale: true },
    });
    if (!purchase || purchase.status !== 'confirmed') return;

    if (purchase.payoutsProcessed && purchase.sellerPayoutProcessed && purchase.adminPayoutProcessed) {
      console.log(`[Payouts] Purchase ${purchase.tokenId} already fully processed.`);
      return;
    }

    const sale = purchase.sale;
    const settings = await loadSettings();
    const commissionRate = parseFloat(settings.commissionRate) || 0.05;
    const currency = sale.currency || 'BTC';
    const network = networkFromDb(sale.network);
    const dp = currency === 'BTC' ? 8 : 2;
    const sellerAmount = parseFloat(sale.price);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));

    const walletId = currency === 'USDT' ? settings.usdtTrc20WalletId : settings.btcWalletId;
    if (!walletId) {
      console.error(`❌ [Payouts] No wallet ID configured for ${currency}${network ? ' ' + network : ''} — cannot create payouts`);
      return;
    }

    const bitcartCurrencyCode = getBitcartCurrencyCode(currency, network);
    console.log(`🚀 [Payouts][${purchase.tokenId}] Split distribution: ${sellerAmount} + ${commissionAmount} ${bitcartCurrencyCode}`);

    // ── PAYOUT 1: SELLER ──
    let sellerPayoutOk = purchase.sellerPayoutProcessed;
    if (!sellerPayoutOk) {
      if (sale.address) {
        console.log(`   [Payouts][${purchase.tokenId}] → Seller: ${sellerAmount} ${bitcartCurrencyCode} to ${sale.address}`);
        const sellerPayout = await createBitcartPayout({
          amount: sellerAmount,
          bitcartCurrency: bitcartCurrencyCode,
          destination: sale.address,
          walletId,
        });
        sellerPayoutOk = sellerPayout.ok;
        if (sellerPayoutOk) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              sellerPayoutProcessed: true,
              bitcartPayoutId: sellerPayout.payoutId,
              pendingExpiresAt: null,
            },
          });
          console.log(`✅ [Payouts][${purchase.tokenId}] SELLER Payout Success | ${sellerAmount} ${currency} → ${sale.address}`);
        } else {
          console.error(`❌ [Payouts][${purchase.tokenId}] SELLER Payout FAILED: ${sellerPayout.error}`);
        }
      } else {
        console.warn(`⚠️  [Payouts][${purchase.tokenId}] SKIPPED Seller Payout (No address set by seller)`);
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { sellerPayoutProcessed: true, pendingExpiresAt: null },
        });
        sellerPayoutOk = true;
      }
    }

    // ── PAYOUT 2: ADMIN ──
    let adminPayoutOk = purchase.adminPayoutProcessed;
    if (!adminPayoutOk) {
      const adminAddress =
        currency === 'BTC'
          ? settings.adminBtcAddress
          : settings.adminUsdtTrc20Address || settings.adminUsdtAddress;

      if (adminAddress) {
        console.log(`   [Payouts][${purchase.tokenId}] → Admin: ${commissionAmount} ${bitcartCurrencyCode} to ${adminAddress}`);
        const adminPayout = await createBitcartPayout({
          amount: commissionAmount,
          bitcartCurrency: bitcartCurrencyCode,
          destination: adminAddress,
          walletId,
        });
        adminPayoutOk = adminPayout.ok;
        if (adminPayoutOk) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              adminPayoutProcessed: true,
              adminBitcartPayoutId: adminPayout.payoutId,
              pendingExpiresAt: null,
            },
          });
          console.log(`✅ [Payouts][${purchase.tokenId}] ADMIN Payout Success  | ${commissionAmount} ${bitcartCurrencyCode} → ${adminAddress}`);

          // Record income stats — store as Number (not string) for aggregation.
          await prisma.income.create({
            data: {
              amount: parseFloat(commissionAmount.toFixed(dp)),
              currency,
              purchaseId: purchase.id,
              tokenId: purchase.tokenId,
              adminAddress,
              payoutSent: true,
            },
          });
        } else {
          console.error(`❌ [Payouts][${purchase.tokenId}] ADMIN Payout FAILED: ${adminPayout.error}`);
        }
      } else {
        console.error(`❌ [Payouts][${purchase.tokenId}] FAILED: No Admin address configured for ${currency}. Check .env.`);
      }
    }

    if (sellerPayoutOk && adminPayoutOk) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { payoutsProcessed: true, pendingExpiresAt: null },
      });
      console.log(`🎉 [Payouts][${purchase.tokenId}] Order fully processed.`);
    }
  } catch (err) {
    console.error('❌ [Payouts] Fatal error in triggerPurchasePayouts:', err.message);
  }
};

exports.triggerPurchasePayouts = triggerPurchasePayouts;

// ── Background Payout Retry Job (every 5 min) ───────────────────────────────
exports.startPayoutRetryJob = () => {
  const INTERVAL_MS = 5 * 60 * 1000;

  const runRetryPass = async () => {
    try {
      const stalePurchases = await prisma.purchase.findMany({
        where: {
          status: 'confirmed',
          payoutsProcessed: false,
          updatedAt: { lt: new Date(Date.now() - 2 * 60 * 1000) },
        },
        take: 20,
      });

      if (stalePurchases.length > 0) {
        console.log(`[PayoutRetry] 🔄 Found ${stalePurchases.length} unprocessed confirmed purchase(s). Retrying...`);
        for (const p of stalePurchases) await triggerPurchasePayouts(p.id);
      }
    } catch (err) {
      console.error('[PayoutRetry] Error during retry pass:', err.message);
    }
  };

  setTimeout(() => {
    runRetryPass();
    setInterval(runRetryPass, INTERVAL_MS);
  }, 60 * 1000);

  console.log('⏰ [PayoutRetry] Background retry job started (runs every 5 min)');
};

// Replaces MongoDB's TTL index on pendingExpiresAt. Every 5 minutes, delete
// pending purchases whose pendingExpiresAt has passed.
exports.startPendingPurchaseCleanupJob = () => {
  const INTERVAL_MS = 5 * 60 * 1000;

  const pass = async () => {
    try {
      const result = await prisma.purchase.deleteMany({
        where: { status: 'pending', pendingExpiresAt: { lt: new Date() } },
      });
      if (result.count > 0) {
        console.log(`[PendingCleanup] Removed ${result.count} expired pending purchase(s).`);
      }
    } catch (err) {
      console.error('[PendingCleanup] Error:', err.message);
    }
  };

  setTimeout(() => {
    pass();
    setInterval(pass, INTERVAL_MS);
  }, 60 * 1000);

  console.log('🧹 [PendingCleanup] Expired-pending purge job started (runs every 5 min)');
};

// ── ADMIN: POST /api/purchases/retry-payout/:tokenId ────────────────────────
exports.retryPayout = catchAsync(async (req, res, next) => {
  const purchase = await prisma.purchase.findUnique({ where: { tokenId: req.params.tokenId } });
  if (!purchase) return next(new AppError('Purchase not found', 404));
  if (purchase.status !== 'confirmed') {
    return next(new AppError('Payouts can only be processed for confirmed orders', 400));
  }

  console.log(`🛠️ [Admin] Manual payout retry triggered for ${purchase.tokenId}`);
  await triggerPurchasePayouts(purchase.id);

  const updated = await prisma.purchase.findUnique({ where: { id: purchase.id } });
  res.status(200).json({
    status: 'success',
    data: {
      payoutsProcessed: updated.payoutsProcessed,
      sellerPayoutProcessed: updated.sellerPayoutProcessed,
      adminPayoutProcessed: updated.adminPayoutProcessed,
    },
  });
});

// ── POST /api/purchases/bitcart-webhook ─────────────────────────────────────
// Called by Bitcart when an invoice status changes.
// Raw body is captured by express.raw() in server.js before global express.json().
exports.handleBitCartWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const signature = req.headers['x-bitcart-signature-256'];
    const secret = process.env.BITCART_WEBHOOK_SECRET;

    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
      const checksum = Buffer.from(signature, 'utf8');
      if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        console.warn(`🛑 [Webhook] INVALID SIGNATURE from ${req.ip}. Rejecting.`);
        return res.status(401).json({ status: 'fail', message: 'Invalid signature' });
      }
    } else if (secret) {
      console.warn(`🛑 [Webhook] MISSING SIGNATURE from ${req.ip}. Rejecting for security.`);
      return res.status(401).json({ status: 'fail', message: 'Missing signature' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const { id, status } = payload;

    const purchase = await prisma.purchase.findFirst({ where: { bitcartId: id } });
    if (!purchase) {
      // 200 so Bitcart stops retrying for unknown invoices.
      console.warn(`[Webhook] Unknown bitcartId: ${id}`);
      return res.status(200).json({ status: 'success' });
    }

    if (status === 'complete' || status === 'paid') {
      if (purchase.status !== 'confirmed') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'confirmed', pendingExpiresAt: null },
        });
        console.log(`📢 [Webhook] Authenticated Payment Confirmed for ${purchase.tokenId}. Payout triggered.`);
        triggerPurchasePayouts(purchase.id).catch((e) => console.error('Payout trigger error:', e));
      } else if (!purchase.payoutsProcessed) {
        triggerPurchasePayouts(purchase.id).catch((e) => console.error('Payout retry error:', e));
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ── GET /api/purchases/checkout/:tokenId ────────────────────────────────────
// Public: returns Bitcart invoice details (address, amount, status) for the checkout UI.
exports.getCheckoutData = async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { tokenId: req.params.tokenId },
      include: { file: true, sale: { include: { file: true } } },
    });
    if (!purchase) return res.status(404).json({ status: 'fail', message: 'Purchase not found' });

    const BITCART_HOST = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;
    const settings = await loadSettings();

    let invoiceData = null;
    let current = purchase;
    if (current.bitcartId && BITCART_HOST && BITCART_API_KEY) {
      try {
        const invoiceRes = await fetch(`${BITCART_HOST}/invoices/${current.bitcartId}`, {
          headers: { Authorization: `Bearer ${BITCART_API_KEY}`, 'Content-Type': 'application/json' },
        });
        if (invoiceRes.ok) {
          invoiceData = await invoiceRes.json();
          if ((invoiceData.status === 'complete' || invoiceData.status === 'paid') && current.status === 'pending') {
            current = await prisma.purchase.update({
              where: { id: current.id },
              data: { status: 'confirmed', pendingExpiresAt: null },
              include: { file: true, sale: { include: { file: true } } },
            });
            console.log(`📢 [Sync] Purchase ${current.tokenId} auto-marked CONFIRMED via polling.`);
            triggerPurchasePayouts(current.id).catch((e) => console.error('Payout sync error:', e));
          } else if ((invoiceData.status === 'complete' || invoiceData.status === 'paid') && !current.payoutsProcessed) {
            triggerPurchasePayouts(current.id).catch((e) => console.error('Payout retry poll error:', e));
          }
        }
      } catch (fetchErr) {
        console.error('Bitcart invoice fetch error:', fetchErr.message);
      }
    }

    const currency = current.sale?.currency || 'BTC';
    const dp = currency === 'BTC' ? 8 : 6;
    const commissionRate = parseFloat(settings.commissionRate) || 0.05;
    const sellerAmount = parseFloat(current.sale?.price || 0);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
    const totalAmount = parseFloat((sellerAmount + commissionAmount).toFixed(dp));

    const adminAddress = currency === 'USDT'
      ? settings.adminUsdtTrc20Address || settings.adminUsdtAddress
      : settings.adminBtcAddress;

    res.status(200).json({
      status: 'success',
      data: {
        purchase: {
          tokenId: current.tokenId,
          status: current.status,
          bitcartId: current.bitcartId,
          file: current.file && { ...current.file, _id: current.file.id },
          sale: current.sale && {
            ...current.sale,
            _id: current.sale.id,
            network: networkFromDb(current.sale.network),
            file: current.sale.file && { ...current.sale.file, _id: current.sale.file.id },
          },
          createdAt: current.createdAt,
        },
        invoice: invoiceData,
        breakdown: {
          sellerAmount: sellerAmount.toFixed(dp),
          commissionAmount: commissionAmount.toFixed(dp),
          totalAmount: totalAmount.toFixed(dp),
          commissionRate: `${(commissionRate * 100).toFixed(0)}%`,
          currency,
          sellerAddress: current.sale?.address || '',
          adminAddress,
        },
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
