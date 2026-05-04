const express = require('express');
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/public/:id', saleController.getPublicSale);

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(authMiddleware.protect);

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
