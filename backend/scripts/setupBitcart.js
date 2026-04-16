/**
 * setupBitcart.js
 * Run once (or on every startup) to configure Bitcart store settings:
 *  - Enable automatic payout approval so sellers receive funds without admin clicking "Approve"
 */

const fetch = require('node-fetch');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function setupBitcartStore() {
  // Read env vars inside function (not at module level) to ensure dotenv has run
  const BITCART_HOST     = process.env.BITCART_HOST    || 'http://bitcart_api:8000';
  const BITCART_API_KEY  = process.env.BITCART_API_KEY || '';
  const BITCART_STORE_ID = process.env.BITCART_STORE_ID || '';

  if (!BITCART_API_KEY || !BITCART_STORE_ID) {
    console.warn('[Bitcart Setup] Missing BITCART_API_KEY or BITCART_STORE_ID — skipping store setup.');
    return;
  }

  // Retry a few times — Bitcart API may still be starting up
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[Bitcart Setup] Attempt ${attempt} — fetching store ${BITCART_STORE_ID}...`);

      const getRes = await fetch(`${BITCART_HOST}/stores/${BITCART_STORE_ID}`, {
        headers: { 'Authorization': `Bearer ${BITCART_API_KEY}` }
      });

      if (!getRes.ok) {
        console.warn(`[Bitcart Setup] Store fetch failed (HTTP ${getRes.status}). Retrying in 5s...`);
        await sleep(5000);
        continue;
      }

      const store = await getRes.json();
      console.log('[Bitcart Setup] Current store settings:', {
        id: store.id,
        name: store.name,
        checkout_settings: store.checkout_settings
      });

      // Patch: enable automatic payout approval
      const patchBody = {
        checkout_settings: {
          ...(store.checkout_settings || {}),
          underpaid_percentage: 0,
          // Bitcart uses these flags depending on version:
          auto_approve_payouts:             true,
          payout_auto_approval:             true,
          automatically_approve_payouts:    true,
        }
      };

      const patchRes = await fetch(`${BITCART_HOST}/stores/${BITCART_STORE_ID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BITCART_API_KEY}`
        },
        body: JSON.stringify(patchBody)
      });

      const patchData = await patchRes.json();

      if (patchRes.ok) {
        console.log('✅ [Bitcart Setup] Store updated — auto-approve payouts enabled.');
        console.log('   Updated checkout_settings:', patchData.checkout_settings);
        return; // success
      } else {
        console.warn('[Bitcart Setup] PATCH failed:', patchData);
      }

    } catch (err) {
      console.warn(`[Bitcart Setup] Error on attempt ${attempt}:`, err.message);
    }

    await sleep(5000);
  }

  console.warn('[Bitcart Setup] ⚠️  Could not configure auto-approve payouts after 5 attempts.');
  console.warn('   Please go to http://localhost:4000 → Stores → your store → Settings → enable auto-approve payouts manually.');
}

module.exports = { setupBitcartStore };
