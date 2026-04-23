const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/status/:tokenId', purchaseController.getPurchaseStatus);
router.get('/checkout/:tokenId', purchaseController.getCheckoutData);

// Webhook: raw body is parsed by express.raw() registered in server.js BEFORE this router
router.post('/bitcart-webhook', purchaseController.handleBitCartWebhook);

// ── Protected routes ─────────────────────────────────────────────────────────
router.use(authMiddleware.protect);

// Now requiring login to initiate a purchase as requested by user
router.post('/', purchaseController.createPurchase);

router.get('/verify/:tokenId', purchaseController.getPurchaseDetailsForSeller);
router.patch('/confirm/:tokenId', purchaseController.confirmPurchase);

module.exports = router;
