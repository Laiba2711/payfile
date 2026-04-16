const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/history', adminController.getHistory);
router.get('/income-stats', adminController.getIncomeStats);
router.get('/report', adminController.downloadReport);
router.get('/verify-purchase/:tokenId', adminController.verifyPurchaseAdmin);
router.patch('/confirm-purchase/:tokenId', adminController.confirmPurchaseAdmin);
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Payout Management
const purchaseController = require('../controllers/purchaseController');
router.post('/retry-payout/:tokenId', purchaseController.retryPayout);

module.exports = router;
