const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Settings = require('../models/Settings');
const Income = require('../models/Income');
const crypto = require('crypto');
const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');



// ── Helper: load settings with fallback, env always overrides for addresses ─
const loadSettings = async () => {
  const db = await Settings.findOne();
  return {
    // Env vars take priority for addresses so .env is the source of truth
    adminBtcAddress:       process.env.ADMIN_BTC_ADDRESS        || (db && db.adminBtcAddress)        || '',
    adminUsdtAddress:      process.env.ADMIN_USDT_ADDRESS       || (db && db.adminUsdtAddress)       || '',
    adminUsdtTrc20Address: process.env.ADMIN_USDT_TRC20_ADDRESS || (db && db.adminUsdtTrc20Address)  || '',
    adminUsdtErc20Address: process.env.ADMIN_USDT_ERC20_ADDRESS || (db && db.adminUsdtErc20Address)  || '',
    commissionRate:        (db && db.commissionRate) || 0.05,
    // Bitcart wallet IDs per currency
    btcWalletId:           process.env.BITCART_WALLET_ID             || '',
    usdtTrc20WalletId:     process.env.BITCART_USDT_TRC20_WALLET_ID  || '',
    usdtErc20WalletId:     process.env.BITCART_USDT_ERC20_WALLET_ID  || '',
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
    return next(new AppError('Bitcart not configured on server', 500));
  }

  // Load commission rate from admin settings (supports dynamic rate)
  const settings       = await loadSettings();
  const commissionRate = parseFloat(settings.commissionRate) || 0.05;

  // Price breakdown — USDT uses 2 decimal places, BTC uses 8
  const dp               = sale.currency === 'BTC' ? 8 : 2;
  const sellerAmount     = parseFloat(sale.price);
  const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
  const totalAmount      = parseFloat((sellerAmount + commissionAmount).toFixed(dp));

  // Determine which Bitcart wallet to use
  let walletId = settings.btcWalletId; // BTC default
  if (sale.currency === 'USDT') {
    walletId = sale.network === 'ERC20'
      ? settings.usdtErc20WalletId
      : settings.usdtTrc20WalletId;
  }

  // Map currency+network to Bitcart currency code
  const bitcartCurrency = sale.currency === 'USDT'
    ? (sale.network === 'ERC20' ? 'USDT' : 'USDTTRX')
    : 'BTC';

  // Create Bitcart invoice for the TOTAL amount (buyer pays seller + commission)
  const invoiceBody = {
    price:            totalAmount,
    store_id:         BITCART_STORE_ID,
    order_id:         saleId,
    notification_url: `${process.env.BACKEND_URL || req.protocol + '://' + req.get('host')}/api/purchases/bitcart-webhook`,
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
    return next(new AppError(data.detail || 'Failed to create Bitcart invoice', 400));
  }

  // Internal token for this purchase
  const tokenId = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const purchase = await Purchase.create({
    tokenId,
    sale:        sale._id,
    file:        sale.file._id,
    seller:      sale.seller,
    status:      'pending',
    bitcartId:   data.id,
    checkoutUrl: `/checkout/${tokenId}`
  });

  res.status(201).json({
    status: 'success',
    data: { purchase }
  });
});


// ── GET /api/purchases/status/:tokenId ───────────────────────────────────────
exports.getPurchaseStatus = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ tokenId: req.params.tokenId });
    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase token not found' });
    }
    res.status(200).json({ status: 'success', data: { status: purchase.status } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

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
exports.confirmPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOneAndUpdate(
      { tokenId: req.params.tokenId, seller: req.user.id },
      { status: 'confirmed' },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Token not found or unauthorized' });
    }

    // Record admin income (5% commission)
    const sale     = await Sale.findById(purchase.sale);
    const settings = await loadSettings();
    const rate     = parseFloat(settings.commissionRate) || 0.05;
    if (sale) {
      await Income.create({
        amount:   (parseFloat(sale.price) * rate).toFixed(8),
        currency: sale.currency || 'BTC',
        purchase: purchase._id,
        tokenId:  purchase.tokenId
      });
    }

    res.status(200).json({ status: 'success', data: { purchase } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared payout helper ──────────────────────────────────────────────────────
// Creates a Bitcart payout. Reads all config from env — no extra API calls.
// Returns { ok: true, payoutId, status } or { ok: false, error }.
// ─────────────────────────────────────────────────────────────────────────────
const createBitcartPayout = async ({ amount, currency, destination, walletId }) => {
  const BITCART_HOST     = process.env.BITCART_HOST;
  const BITCART_API_KEY  = process.env.BITCART_API_KEY;
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID;
  const resolvedWallet   = walletId || process.env.BITCART_WALLET_ID;

  console.log(`[Payout] ${amount} ${currency} → ${destination} (wallet: ${resolvedWallet})`);

  const res = await fetch(`${BITCART_HOST}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BITCART_API_KEY}`
    },
    body: JSON.stringify({
      amount,
      currency:    currency || 'BTC',
      destination,
      store_id:    BITCART_STORE_ID,
      wallet_id:   resolvedWallet
    })
  });

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: JSON.stringify(data) };
  }
  return { ok: true, payoutId: data.id, status: data.status };
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared payout trigger ─────────────────────────────────────────────────────
// Called when a purchase is confirmed (via webhook or polling auto-sync).
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
    const dp               = sale.currency === 'BTC' ? 8 : 2;
    const sellerAmount     = parseFloat(sale.price);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(dp));
    const currency         = sale.currency || 'BTC';
    const network          = sale.network  || '';

    // Determine correct wallet ID for this currency+network
    let walletId = settings.btcWalletId;
    if (currency === 'USDT') {
      walletId = network === 'ERC20' ? settings.usdtErc20WalletId : settings.usdtTrc20WalletId;
    }

    if (!walletId) {
      console.error(`❌ [Payouts] No wallet ID configured for ${currency}${network ? ' ' + network : ''} — cannot create payouts`);
      return;
    }

    console.log(`🚀 [Payouts][${purchase.tokenId}] Beginning split distribution (${currency})`);
    
    // ── PAYOUT 1: SELLER ──────────────────────────────────────────────
    let sellerPayoutOk = purchase.sellerPayoutProcessed;
    if (!sellerPayoutOk) {
      if (sale.address) {
        console.log(`   [Payouts][${purchase.tokenId}] Distributing to Seller...`);
        const sellerPayout = await createBitcartPayout({
          amount:      sellerAmount,
          currency,
          destination: sale.address,
          walletId
        });
        sellerPayoutOk = sellerPayout.ok;
        if (sellerPayoutOk) {
          purchase.sellerPayoutProcessed = true;
          purchase.bitcartPayoutId = sellerPayout.payoutId;
          await purchase.save();
          console.log(`✅ [Payouts][${purchase.tokenId}] SELLER Payout Success | ${sellerAmount} ${currency} → ${sale.address}`);
        } else {
          console.error(`❌ [Payouts][${purchase.tokenId}] SELLER Payout FAILED: ${sellerPayout.error}`);
        }
      } else {
        console.warn(`⚠️  [Payouts][${purchase.tokenId}] SKIPPED Seller Payout (No address set by seller)`);
        // We consider it "processed" if there's no address to send to, to avoid infinite retries
        purchase.sellerPayoutProcessed = true;
        await purchase.save();
      }
    }

    // ── PAYOUT 2: ADMIN ───────────────────────────────────────────────
    let adminPayoutOk = purchase.adminPayoutProcessed;
    if (!adminPayoutOk) {
      let adminAddress;
      if (currency === 'BTC') {
        adminAddress = settings.adminBtcAddress;
      } else if (network === 'ERC20') {
        adminAddress = settings.adminUsdtErc20Address || settings.adminUsdtAddress;
      } else {
        adminAddress = settings.adminUsdtTrc20Address || settings.adminUsdtAddress;
      }

      if (adminAddress) {
        console.log(`   [Payouts][${purchase.tokenId}] Distributing to Admin...`);
        const adminPayout = await createBitcartPayout({
          amount:      commissionAmount,
          currency,
          destination: adminAddress,
          walletId
        });
        adminPayoutOk = adminPayout.ok;
        if (adminPayoutOk) {
          purchase.adminPayoutProcessed = true;
          await purchase.save();
          console.log(`✅ [Payouts][${purchase.tokenId}] ADMIN Payout Success  | ${commissionAmount} ${currency} → ${adminAddress}`);
          
          // Record income stats
          await Income.create({
            amount:      commissionAmount.toFixed(dp),
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
      await purchase.save();
      console.log(`🎉 [Payouts][${purchase.tokenId}] Order fully processed.`);
    }

  } catch (err) {
    console.error('❌ [Payouts] Fatal error in triggerPurchasePayouts:', err.message);
  }
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
exports.handleBitCartWebhook = async (req, res) => {
  try {
    const { id, status } = req.body;
    const signature = req.headers['x-bitcart-signature-256'];
    const secret = process.env.BITCART_WEBHOOK_SECRET;

    // ── Security Verification ────────────────────────────────────────────────
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
      const checksum = Buffer.from(signature, 'utf8');

      if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        console.warn(`🛑 [Webhook] INVALID SIGNATURE from ${req.ip}. Rejecting.`);
        return res.status(401).json({ status: 'fail', message: 'Invalid signature' });
      }
    } else if (secret) {
        // If secret is configured but signature missing
        console.warn(`🛑 [Webhook] MISSING SIGNATURE from ${req.ip}. Rejecting for security.`);
        return res.status(401).json({ status: 'fail', message: 'Missing signature' });
    }

    const purchase = await Purchase.findOne({ bitcartId: id });
    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase not found' });
    }

    // Only act on completed / paid invoices
    if (status === 'complete' || status === 'paid') {
      if (purchase.status !== 'confirmed') {
        purchase.status = 'confirmed';
        await purchase.save();
        console.log(`📢 [Webhook] Authenticated Payment Confirmed for ${purchase.tokenId}. Release triggered.`);
        
        // Trigger payouts in background
        triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout trigger error:', e));
      } else if (!purchase.payoutsProcessed) {
         // Retry payouts if they weren't finished correctly last time
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
            await purchase.save();
            console.log(`📢 [Sync] Purchase ${purchase.tokenId} auto-marked CONFIRMED via polling.`);
            
            // Trigger payouts in background
            triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout sync error:', e));
          } else if (
            (invoiceData.status === 'complete' || invoiceData.status === 'paid') &&
            !purchase.payoutsProcessed
          ) {
            // If already confirmed but payouts failed previously, retry on poll
            triggerPurchasePayouts(purchase._id).catch(e => console.error('Payout retry poll error:', e));
          }
        }
      } catch (fetchErr) {
        console.error('Bitcart invoice fetch error:', fetchErr.message);
      }
    }

    // Price breakdown for the checkout UI
    const commissionRate   = parseFloat(settings.commissionRate) || 0.05;
    const sellerAmount     = parseFloat(purchase.sale?.price || 0);
    const commissionAmount = parseFloat((sellerAmount * commissionRate).toFixed(8));
    const totalAmount      = parseFloat((sellerAmount + commissionAmount).toFixed(8));

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
          sellerAmount:     sellerAmount.toFixed(8),
          commissionAmount: commissionAmount.toFixed(8),
          totalAmount:      totalAmount.toFixed(8),
          commissionRate:   `${(commissionRate * 100).toFixed(0)}%`,
          currency:         purchase.sale?.currency || 'BTC',
          sellerAddress:    purchase.sale?.address || '',
          adminAddress:     purchase.sale?.currency === 'BTC'
                              ? settings.adminBtcAddress
                              : settings.adminUsdtAddress
        }
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};



