const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const jwt = require('jsonwebtoken');

const router = express.Router();

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Public routes for buyers
router.post('/', purchaseController.createPurchase);
router.get('/status/:tokenId', purchaseController.getPurchaseStatus);
router.get('/checkout/:tokenId', purchaseController.getCheckoutData);
router.post('/bitcart-webhook', purchaseController.handleBitCartWebhook);

// Protected routes for sellers
router.use(protect);
router.get('/verify/:tokenId', purchaseController.getPurchaseDetailsForSeller);
router.patch('/confirm/:tokenId', purchaseController.confirmPurchase);

module.exports = router;
