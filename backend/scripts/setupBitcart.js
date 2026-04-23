/**
 * setupBitcart.js
 *
 * Runs on every server startup to fully configure the Bitcart store:
 *  1. Enable automatic payout approval (sellers receive funds without manual admin approval)
 *  2. Register webhook notification URL + secret so Bitcart signs its callbacks
 *  3. Verify configured wallet IDs actually exist
 */

const fetch = require('node-fetch');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Helper: make an authenticated Bitcart API request
const bitcartRequest = async (method, path, body = null) => {
  const BITCART_HOST    = process.env.BITCART_HOST || 'http://bitcart_api:8000';
  const BITCART_API_KEY = process.env.BITCART_API_KEY || '';

  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${BITCART_API_KEY}`,
      'Content-Type':  'application/json',
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BITCART_HOST}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
};

// Helper: verify a wallet ID exists in Bitcart
const verifyWallet = async (walletId, label) => {
  if (!walletId) {
    console.warn(`[Bitcart Setup] ⚠️  ${label} wallet ID not configured`);
    return false;
  }
  const { ok, data } = await bitcartRequest('GET', `/wallets/${walletId}`);
  if (ok) {
    console.log(`[Bitcart Setup] ✅ ${label} wallet verified: ${data.name || walletId} (currency: ${data.currency || '?'})`);
    return true;
  }
  console.warn(`[Bitcart Setup] ⚠️  ${label} wallet ID "${walletId}" not found in Bitcart — check your .env`);
  return false;
};

async function setupBitcartStore() {
  const BITCART_HOST        = process.env.BITCART_HOST        || 'http://bitcart_api:8000';
  const BITCART_API_KEY     = process.env.BITCART_API_KEY     || '';
  const BITCART_STORE_ID    = process.env.BITCART_STORE_ID    || '';
  const BITCART_WEBHOOK_SECRET = process.env.BITCART_WEBHOOK_SECRET || '';
  const BACKEND_URL         = process.env.BACKEND_URL         || '';

  if (!BITCART_API_KEY || !BITCART_STORE_ID) {
    console.warn('[Bitcart Setup] Missing BITCART_API_KEY or BITCART_STORE_ID — skipping store setup.');
    return;
  }

  const webhookUrl = BACKEND_URL
    ? `${BACKEND_URL}/api/purchases/bitcart-webhook`
    : null;

  // ── Retry loop: Bitcart API may still be starting up ─────────────────────────
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[Bitcart Setup] Attempt ${attempt}/5 — fetching store ${BITCART_STORE_ID}...`);

      // 1. Get current store config
      const { ok: getOk, data: store } = await bitcartRequest('GET', `/stores/${BITCART_STORE_ID}`);

      if (!getOk) {
        console.warn(`[Bitcart Setup] Store fetch failed (HTTP ${store.detail}). Retrying in 5s...`);
        await sleep(5000);
        continue;
      }

      console.log('[Bitcart Setup] Store fetched:', { id: store.id, name: store.name });

      // 2. Build the patch payload
      // These flags enable automatic payout broadcasting without manual approval
      const checkoutPatch = {
        ...(store.checkout_settings || {}),
        underpaid_percentage:           0,
        auto_approve_payouts:           true,
        payout_auto_approval:           true,
        automatically_approve_payouts:  true,
      };

      // Register our webhook URL and secret so Bitcart signs every notification
      if (webhookUrl) {
        checkoutPatch.notification_url    = webhookUrl;
        checkoutPatch.notification_secret = BITCART_WEBHOOK_SECRET || '';
        console.log(`[Bitcart Setup] Registering webhook: ${webhookUrl}`);
      } else {
        console.warn('[Bitcart Setup] ⚠️  BACKEND_URL not set — webhook not registered at store level.');
        console.warn('   Webhooks will only be set per-invoice via notification_url on invoice creation.');
      }

      const patchBody = {
        checkout_settings: checkoutPatch,
      };

      // Also set notification_url at the store root level (Bitcart version compatibility)
      if (webhookUrl) {
        patchBody.notification_url = webhookUrl;
      }

      // 3. Patch the store
      const { ok: patchOk, data: patchData } = await bitcartRequest(
        'PATCH',
        `/stores/${BITCART_STORE_ID}`,
        patchBody
      );

      if (patchOk) {
        console.log('✅ [Bitcart Setup] Store configured:');
        console.log('   - Auto-approve payouts: ENABLED');
        console.log(`   - Webhook URL: ${webhookUrl || 'per-invoice only'}`);
        console.log(`   - Webhook secret: ${BITCART_WEBHOOK_SECRET ? 'SET' : 'NOT SET'}`);
        console.log('   Updated checkout_settings:', patchData.checkout_settings);
      } else {
        console.warn('[Bitcart Setup] Store PATCH failed:', patchData);
      }

      // 4. Verify wallet IDs
      console.log('\n[Bitcart Setup] Verifying wallet configurations...');
      await verifyWallet(process.env.BITCART_WALLET_ID,             'BTC');
      await verifyWallet(process.env.BITCART_USDT_TRC20_WALLET_ID,  'USDT TRC20');
      console.log('[Bitcart Setup] Wallet verification complete.\n');

      return; // Success — exit retry loop

    } catch (err) {
      console.warn(`[Bitcart Setup] Error on attempt ${attempt}:`, err.message);
    }

    await sleep(5000);
  }

  console.warn('[Bitcart Setup] ⚠️  Could not configure store after 5 attempts.');
  console.warn('   MANUAL STEPS:');
  console.warn('   1. Go to http://localhost:4000 → Stores → your store → Settings');
  console.warn('   2. Enable "Automatically approve payouts"');
  if (webhookUrl) {
    console.warn(`   3. Set notification URL to: ${webhookUrl}`);
  }
}

module.exports = { setupBitcartStore };
