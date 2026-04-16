const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

const router = express.Router();

// Rate limit for password reset requests: 3 per hour per IP
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: 'Too many password reset requests from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);


module.exports = router;
