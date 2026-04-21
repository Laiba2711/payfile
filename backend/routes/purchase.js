const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── Public routes (no auth — buyers don't need accounts) ─────────────────────
router.post('/', purchaseController.createPurchase);
router.get('/status/:tokenId', purchaseController.getPurchaseStatus);
router.get('/checkout/:tokenId', purchaseController.getCheckoutData);

// Webhook: raw body is parsed by express.raw() registered in server.js BEFORE this router
router.post('/bitcart-webhook', purchaseController.handleBitCartWebhook);

// ── Protected routes (sellers only) ──────────────────────────────────────────
router.use(authMiddleware.protect);
router.get('/verify/:tokenId', purchaseController.getPurchaseDetailsForSeller);
router.patch('/confirm/:tokenId', purchaseController.confirmPurchase);

module.exports = router;
