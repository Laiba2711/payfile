const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Settings = require('../models/Settings');
const Income = require('../models/Income');
const crypto = require('crypto');
const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// ─────────────────────────────────────────────────────────────────────────────
// ── Bitcart currency code mapping ────────────────────────────────────────────
// Bitcart uses its own currency codes that differ from our internal names.
// BTC → 'BTC' | USDT TRC20 → 'USDTTRX' | USDT ERC20 → 'USDTETH'
// ─────────────────────────────────────────────────────────────────────────────
const getBitcartCurrencyCode = (currency, network) => {
  if (currency === 'BTC') return 'BTC';
  if (currency === 'USDT') {
    return 'USDTTRX'; // Always USDT to TRC20
  }
  return currency;
};

// ── Helper: load settings with fallback, env always overrides for addresses ──
const loadSettings = async () => {
  const db = await Settings.findOne();
  return {
    adminBtcAddress:       process.env.ADMIN_BTC_ADDRESS        || (db && db.adminBtcAddress)        || '',
    adminUsdtAddress:      process.env.ADMIN_USDT_ADDRESS       || (db && db.adminUsdtAddress)       || '',
    adminUsdtTrc20Address: process.env.ADMIN_USDT_TRC20_ADDRESS || (db && db.adminUsdtTrc20Address)  || '',
    commissionRate:        (db && db.commissionRate) || 0.05,
    btcWalletId:           process.env.BITCART_WALLET_ID             || (db && db.btcWalletId)           || '',
    usdtTrc20WalletId:     process.env.BITCART_USDT_TRC20_WALLET_ID  || (db && db.usdtTrc20WalletId)     || '',
  };
};

// ── POST /api/purchases ───────────────────────────────────────────────────────
// Buyer initiates a purchase: creates a Bitcart invoice for (seller price + commission)
exports.createPurchase = catchAsync(async (req, res, next) => {
  const { saleId } = req.body;
  const sale = await Sale.findById(saleId).populate('file');

  if (!sale) {
    return next(new AppError('Sale not found', 404));
  }

  const BITCART_HOST     = process.env.BITCART_HOST;
  const BITCART_API_KEY  = process.env.BITCART_API_KEY;
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID;

  if (!BITCART_HOST || !BITCART_API_KEY || !BITCART_STORE_ID) {
    return next(new AppError('Payment system not configured on server', 500));
  }

  // Load commission rate from admin settings (supports dynamic rate)
  const settings       = await loadSettings();
  const commissionRate = parseFloat(settings.commissionRate) || 0.05;

  // Price breakdown — USDT uses 6 decimal places (TRC20 standard), BTC uses 8
  const dp               = sale.currency === 'BTC' ? 8 : 6;
  const sellerAmount     = parseFloat(sale.price);
  const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
  const totalAmount      = parseFloat((sellerAmount + commissionAmount).toFixed(dp));

  // Determine which Bitcart wallet to use
  let walletId = settings.btcWalletId; 
  if (sale.currency === 'USDT') {
    walletId = settings.usdtTrc20WalletId;
  }

  // Map currency+network to Bitcart-specific currency code
  // BTC → 'BTC' | USDT ERC20 → 'USDTETH' | USDT TRC20 → 'USDTTRX'
  const bitcartCurrency = getBitcartCurrencyCode(sale.currency, sale.network);

  // Build the backend URL for the webhook — prefer env var over runtime detection
  // (runtime detection breaks behind reverse proxies)
  const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

  // Create Bitcart invoice for the TOTAL amount (buyer pays seller + commission)
  const invoiceBody = {
    price:            totalAmount,
    store_id:         BITCART_STORE_ID,
    order_id:         saleId,
    notification_url: `${backendUrl}/api/purchases/bitcart-webhook`,
    currency:         bitcartCurrency,
  };
  // Attach wallet if we have one configured
  if (walletId) invoiceBody.wallet_id = walletId;

  const response = await fetch(`${BITCART_HOST}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BITCART_API_KEY}`
    },
    body: JSON.stringify(invoiceBody)
  });

  const data = await response.json();
  if (!response.ok) {
    return next(new AppError(data.detail || 'Failed to create payment invoice', 400));
  }

  // Internal token for this purchase
  const tokenId = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  // pendingExpiresAt: auto-clean abandoned invoices after 48 hours (TTL on model)
  const pendingExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const purchase = await Purchase.create({
    tokenId,
    sale:        sale._id,
    file:        sale.file._id,
    seller:      sale.seller,
    status:      'pending',
    bitcartId:   data.id,
    checkoutUrl: `/checkout/${tokenId}`,
    pendingExpiresAt,
  });

  res.status(201).json({
    status: 'success',
    data: { purchase }
  });
});


// ── GET /api/purchases/status/:tokenId ───────────────────────────────────────
exports.getPurchaseStatus = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOne({ tokenId: req.params.tokenId });
  if (!purchase) {
    return next(new AppError('Purchase token not found', 404));
  }
  res.status(200).json({ status: 'success', data: { status: purchase.status } });
});

// ── GET /api/purchases/verify/:tokenId (seller) ──────────────────────────────
exports.getPurchaseDetailsForSeller = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOne({
    tokenId: req.params.tokenId,
    seller:  req.user.id
  }).populate('file').populate('sale');

  if (!purchase) {
    return next(new AppError('Token not found or unauthorized', 404));
  }
  res.status(200).json({ status: 'success', data: { purchase } });
});


// ── PATCH /api/purchases/confirm/:tokenId (seller manual confirm) ─────────────
exports.confirmPurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOneAndUpdate(
    { tokenId: req.params.tokenId, seller: req.user.id },
    { status: 'confirmed' },
    { new: true }
  );

  if (!purchase) {
    return next(new AppError('Token not found or unauthorized', 404));
  }

  // Trigger payouts in background (idempotent — won't double-pay)
  triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout trigger error:', e));

  res.status(200).json({ status: 'success', data: { purchase } });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared payout helper ──────────────────────────────────────────────────────
// Creates a Bitcart payout. Returns { ok: true, payoutId, status } or { ok: false, error }.
// ─────────────────────────────────────────────────────────────────────────────
// ── createBitcartPayout ────────────────────────────────────────────────────────
// currency must be a Bitcart-specific code: 'BTC', 'USDTTRX', or 'USDTETH'
// DO NOT pass 'USDT' directly — Bitcart will reject it.
const createBitcartPayout = async ({ amount, bitcartCurrency, destination, walletId }) => {
  const BITCART_HOST     = process.env.BITCART_HOST;
  const BITCART_API_KEY  = process.env.BITCART_API_KEY;
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID;
  const resolvedWallet   = walletId || process.env.BITCART_WALLET_ID;

  if (!BITCART_HOST || !BITCART_API_KEY || !BITCART_STORE_ID) {
    return { ok: false, error: 'Bitcart not configured (missing HOST/API_KEY/STORE_ID)' };
  }
  if (!resolvedWallet) {
    return { ok: false, error: 'No wallet ID available for payout' };
  }
  if (!destination) {
    return { ok: false, error: 'No destination address for payout' };
  }

  console.log(`[Payout] ${amount} ${bitcartCurrency} → ${destination} (wallet: ${resolvedWallet})`);

  const payoutBody = {
    amount:      amount,
    currency:    bitcartCurrency,
    destination: destination,
    store_id:    BITCART_STORE_ID,
    wallet_id:   resolvedWallet
  };

  const res = await fetch(`${BITCART_HOST}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BITCART_API_KEY}`
    },
    body: JSON.stringify(payoutBody)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data.detail || data.message || JSON.stringify(data);
    return { ok: false, error: errMsg };
  }
  return { ok: true, payoutId: data.id, status: data.status };
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared payout trigger ─────────────────────────────────────────────────────
// Called when a purchase is confirmed (via webhook, polling, or manual admin confirm).
// Fully idempotent — checks each flag before creating a payout.
// ─────────────────────────────────────────────────────────────────────────────
const triggerPurchasePayouts = async (purchaseId) => {
  try {
    const purchase = await Purchase.findById(purchaseId).populate('sale');
    if (!purchase || purchase.status !== 'confirmed') return;

    // Early exit if everything is already done
    if (purchase.payoutsProcessed && purchase.sellerPayoutProcessed && purchase.adminPayoutProcessed) {
      console.log(`[Payouts] Purchase ${purchase.tokenId} already fully processed.`);
      return;
    }

    const sale             = purchase.sale;
    const settings         = await loadSettings();
    const commissionRate   = parseFloat(settings.commissionRate) || 0.05;
    const currency         = sale.currency || 'BTC';
    const network          = sale.network  || '';
    const dp               = currency === 'BTC' ? 8 : 2;
    const sellerAmount     = parseFloat(sale.price);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));

    // Determine correct wallet ID for this currency+network
    let walletId = settings.btcWalletId;
    if (currency === 'USDT') {
      walletId = settings.usdtTrc20WalletId;
    }

    if (!walletId) {
      console.error(`❌ [Payouts] No wallet ID configured for ${currency}${network ? ' ' + network : ''} — cannot create payouts`);
      return;
    }

    // Map our internal currency/network to Bitcart's currency code ONCE here
    const bitcartCurrencyCode = getBitcartCurrencyCode(currency, network);

    console.log(`🚀 [Payouts][${purchase.tokenId}] Split distribution: ${sellerAmount} + ${commissionAmount} ${bitcartCurrencyCode}`);
    
    // ── PAYOUT 1: SELLER ──────────────────────────────────────────────
    let sellerPayoutOk = purchase.sellerPayoutProcessed;
    if (!sellerPayoutOk) {
      if (sale.address) {
        console.log(`   [Payouts][${purchase.tokenId}] → Seller: ${sellerAmount} ${bitcartCurrencyCode} to ${sale.address}`);
        const sellerPayout = await createBitcartPayout({
          amount:          sellerAmount,
          bitcartCurrency: bitcartCurrencyCode,
          destination:     sale.address,
          walletId
        });
        sellerPayoutOk = sellerPayout.ok;
        if (sellerPayoutOk) {
          purchase.sellerPayoutProcessed = true;
          purchase.bitcartPayoutId = sellerPayout.payoutId;
          // Clear pendingExpiresAt so TTL won't delete this confirmed purchase
          purchase.pendingExpiresAt = undefined;
          await purchase.save();
          console.log(`✅ [Payouts][${purchase.tokenId}] SELLER Payout Success | ${sellerAmount} ${currency} → ${sale.address}`);
        } else {
          console.error(`❌ [Payouts][${purchase.tokenId}] SELLER Payout FAILED: ${sellerPayout.error}`);
        }
      } else {
        console.warn(`⚠️  [Payouts][${purchase.tokenId}] SKIPPED Seller Payout (No address set by seller)`);
        purchase.sellerPayoutProcessed = true;
        purchase.pendingExpiresAt = undefined;
        await purchase.save();
      }
    }

    // ── PAYOUT 2: ADMIN ───────────────────────────────────────────────
    let adminPayoutOk = purchase.adminPayoutProcessed;
    if (!adminPayoutOk) {
      let adminAddress;
      if (currency === 'BTC') {
        adminAddress = settings.adminBtcAddress;
      } else {
        adminAddress = settings.adminUsdtTrc20Address || settings.adminUsdtAddress;
      }

      if (adminAddress) {
        console.log(`   [Payouts][${purchase.tokenId}] → Admin: ${commissionAmount} ${bitcartCurrencyCode} to ${adminAddress}`);
        const adminPayout = await createBitcartPayout({
          amount:          commissionAmount,
          bitcartCurrency: bitcartCurrencyCode,
          destination:     adminAddress,
          walletId
        });
        adminPayoutOk = adminPayout.ok;
        if (adminPayoutOk) {
          purchase.adminPayoutProcessed = true;
          purchase.adminBitcartPayoutId = adminPayout.payoutId;
          purchase.pendingExpiresAt = undefined;
          await purchase.save();
          console.log(`✅ [Payouts][${purchase.tokenId}] ADMIN Payout Success  | ${commissionAmount} ${bitcartCurrencyCode} → ${adminAddress}`);
          
          // Record income stats — store as Number (not string) for aggregation
          await Income.create({
            amount:      parseFloat(commissionAmount.toFixed(dp)),
            currency,
            purchase:    purchase._id,
            tokenId:     purchase.tokenId,
            adminAddress,
            payoutSent:  true
          });
        } else {
          console.error(`❌ [Payouts][${purchase.tokenId}] ADMIN Payout FAILED: ${adminPayout.error}`);
        }
      } else {
        console.error(`❌ [Payouts][${purchase.tokenId}] FAILED: No Admin address configured for ${currency}. Check .env.`);
      }
    }

    // Final mark as atomic success
    if (purchase.sellerPayoutProcessed && purchase.adminPayoutProcessed) {
      purchase.payoutsProcessed = true;
      purchase.pendingExpiresAt = undefined;
      await purchase.save();
      console.log(`🎉 [Payouts][${purchase.tokenId}] Order fully processed.`);
    }

  } catch (err) {
    console.error('❌ [Payouts] Fatal error in triggerPurchasePayouts:', err.message);
  }
};

// Export for use in adminController
exports.triggerPurchasePayouts = triggerPurchasePayouts;

// ─────────────────────────────────────────────────────────────────────────────
// ── Background Payout Retry Job ───────────────────────────────────────────────
// Runs every 5 minutes to catch any confirmed purchases whose payouts failed
// (e.g., Bitcart was temporarily down at time of confirmation).
// This is the safety net — the system should self-heal without admin intervention.
// ─────────────────────────────────────────────────────────────────────────────
exports.startPayoutRetryJob = () => {
  const INTERVAL_MS = 5 * 60 * 1000; // Every 5 minutes

  const runRetryPass = async () => {
    try {
      // Find confirmed purchases that haven't had their payouts fully processed
      const stalePurchases = await Purchase.find({
        status:           'confirmed',
        payoutsProcessed: false,
        // Only retry if last update was more than 2 minutes ago (avoids racing a fresh trigger)
        updatedAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) }
      }).limit(20);

      if (stalePurchases.length > 0) {
        console.log(`[PayoutRetry] 🔄 Found ${stalePurchases.length} unprocessed confirmed purchase(s). Retrying...`);
        for (const purchase of stalePurchases) {
          await triggerPurchasePayouts(purchase._id);
        }
      }
    } catch (err) {
      console.error('[PayoutRetry] Error during retry pass:', err.message);
    }
  };

  // Run first pass after 60s (allow server to fully start), then every INTERVAL_MS
  setTimeout(() => {
    runRetryPass();
    setInterval(runRetryPass, INTERVAL_MS);
  }, 60 * 1000);

  console.log('⏰ [PayoutRetry] Background retry job started (runs every 5 min)');
};

// ── ADMIN: POST /api/purchases/retry-payout/:tokenId ─────────────────────────
exports.retryPayout = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOne({ tokenId: req.params.tokenId });

  if (!purchase) {
    return next(new AppError('Purchase not found', 404));
  }

  if (purchase.status !== 'confirmed') {
    return next(new AppError('Payouts can only be processed for confirmed orders', 400));
  }

  console.log(`🛠️ [Admin] Manual payout retry triggered for ${purchase.tokenId}`);
  
  // High-level trigger (it handles idempotency internally)
  await triggerPurchasePayouts(purchase._id);

  // Reload purchase to get updated state
  const updatedPurchase = await Purchase.findById(purchase._id);

  res.status(200).json({
    status: 'success',
    data: {
      payoutsProcessed: updatedPurchase.payoutsProcessed,
      sellerPayoutProcessed: updatedPurchase.sellerPayoutProcessed,
      adminPayoutProcessed: updatedPurchase.adminPayoutProcessed
    }
  });
});


// ── POST /api/purchases/bitcart-webhook ──────────────────────────────────────
// Called by Bitcart when an invoice status changes.
// Raw body is captured by express.raw() in server.js before global express.json()
exports.handleBitCartWebhook = async (req, res) => {
  try {
    // req.body is a Buffer here (raw bytes from express.raw middleware)
    const rawBody = req.body;
    const signature = req.headers['x-bitcart-signature-256'];
    const secret = process.env.BITCART_WEBHOOK_SECRET;

    // ── Security Verification ────────────────────────────────────────────────
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(
        hmac.update(rawBody).digest('hex'),  // rawBody is the raw Buffer — matches exactly what Bitcart signed
        'utf8'
      );
      const checksum = Buffer.from(signature, 'utf8');

      if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        console.warn(`🛑 [Webhook] INVALID SIGNATURE from ${req.ip}. Rejecting.`);
        return res.status(401).json({ status: 'fail', message: 'Invalid signature' });
      }
    } else if (secret) {
      // Secret is configured but signature is missing
      console.warn(`🛑 [Webhook] MISSING SIGNATURE from ${req.ip}. Rejecting for security.`);
      return res.status(401).json({ status: 'fail', message: 'Missing signature' });
    }

    // Parse the raw body now that HMAC is verified
    const payload = JSON.parse(rawBody.toString('utf8'));
    const { id, status } = payload;

    const purchase = await Purchase.findOne({ bitcartId: id });
    if (!purchase) {
      // Return 200 so Bitcart doesn't keep retrying for unknown invoices
      console.warn(`[Webhook] Unknown bitcartId: ${id}`);
      return res.status(200).json({ status: 'success' });
    }

    // Only act on completed / paid invoices
    if (status === 'complete' || status === 'paid') {
      if (purchase.status !== 'confirmed') {
        purchase.status = 'confirmed';
        purchase.pendingExpiresAt = undefined; // Preserve confirmed purchases from TTL
        await purchase.save();
        console.log(`📢 [Webhook] Authenticated Payment Confirmed for ${purchase.tokenId}. Payout triggered.`);
        
        // Trigger payouts in background (idempotent)
        triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout trigger error:', e));
      } else if (!purchase.payoutsProcessed) {
        // Already confirmed but payouts may have failed — retry
        triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout retry error:', e));
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};



// ── GET /api/purchases/checkout/:tokenId ─────────────────────────────────────
// Public: returns Bitcart invoice details (address, amount, status) for checkout UI
exports.getCheckoutData = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ tokenId: req.params.tokenId })
      .populate('file')
      .populate({ path: 'sale', populate: { path: 'file' } });

    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase not found' });
    }

    const BITCART_HOST    = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;
    const settings        = await loadSettings();

    let invoiceData = null;
    if (purchase.bitcartId && BITCART_HOST && BITCART_API_KEY) {
      try {
        const invoiceRes = await fetch(`${BITCART_HOST}/invoices/${purchase.bitcartId}`, {
          headers: {
            'Authorization': `Bearer ${BITCART_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        if (invoiceRes.ok) {
          invoiceData = await invoiceRes.json();
          // Auto-sync: if Bitcart says paid/complete, mark confirmed in our DB
          if (
            (invoiceData.status === 'complete' || invoiceData.status === 'paid') &&
            purchase.status === 'pending'
          ) {
            purchase.status = 'confirmed';
            purchase.pendingExpiresAt = undefined;
            await purchase.save();
            console.log(`📢 [Sync] Purchase ${purchase.tokenId} auto-marked CONFIRMED via polling.`);
            triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout sync error:', e));
          } else if (
            (invoiceData.status === 'complete' || invoiceData.status === 'paid') &&
            !purchase.payoutsProcessed
          ) {
            // Already confirmed but payouts failed — retry on next poll
            triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout retry poll error:', e));
          }
        }
      } catch (fetchErr) {
        console.error('Bitcart invoice fetch error:', fetchErr.message);
      }
    }

    // Price breakdown for the checkout UI — use correct decimal places per currency
    const currency         = purchase.sale?.currency || 'BTC';
    const dp               = currency === 'BTC' ? 8 : 6;
    const commissionRate   = parseFloat(settings.commissionRate) || 0.05;
    const sellerAmount     = parseFloat(purchase.sale?.price || 0);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
    const totalAmount      = parseFloat((sellerAmount + commissionAmount).toFixed(dp));

    // Admin address for display only
    const network = purchase.sale?.network || '';
    let adminAddress = settings.adminBtcAddress;
    if (currency === 'USDT') {
      adminAddress = settings.adminUsdtTrc20Address || settings.adminUsdtAddress;
    }

    res.status(200).json({
      status: 'success',
      data: {
        purchase: {
          tokenId:   purchase.tokenId,
          status:    purchase.status,
          bitcartId: purchase.bitcartId,
          file:      purchase.file,
          sale:      purchase.sale,
          createdAt: purchase.createdAt
        },
        invoice: invoiceData,
        breakdown: {
          sellerAmount:     sellerAmount.toFixed(dp),
          commissionAmount: commissionAmount.toFixed(dp),
          totalAmount:      totalAmount.toFixed(dp),
          commissionRate:   `${(commissionRate * 100).toFixed(0)}%`,
          currency,
          sellerAddress:    purchase.sale?.address || '',
          adminAddress
        }
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
