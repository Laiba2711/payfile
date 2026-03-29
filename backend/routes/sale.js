const express = require('express');
const saleController = require('../controllers/saleController');
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

router.get('/public/:id', saleController.getPublicSale);

router.use(protect);

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);

module.exports = router;
