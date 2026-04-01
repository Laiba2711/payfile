const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const crypto = require('crypto');
const fetch = require('node-fetch');

exports.createPurchase = async (req, res) => {
  try {
    const { saleId } = req.body;
    const sale = await Sale.findById(saleId).populate('file');
    
    if (!sale) {
      return res.status(404).json({ status: 'fail', message: 'Sale not found' });
    }

    const BITCART_HOST = process.env.BITCART_HOST;
    const BITCART_API_KEY = process.env.BITCART_API_KEY;
    const BITCART_STORE_ID = process.env.BITCART_STORE_ID;

    if (!BITCART_HOST || !BITCART_API_KEY || !BITCART_STORE_ID) {
      return res.status(500).json({ status: 'fail', message: 'BitCart not configured on server' });
    }

    // Calculate Total Price (Seller Price + 5%)
    const originalPrice = parseFloat(sale.price);
    const totalPrice = (originalPrice * 1.05).toFixed(8);

    // Create BitCart Invoice
    const response = await fetch(`${BITCART_HOST}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${BITCART_API_KEY}`
      },
      body: JSON.stringify({
        price: totalPrice,
        store_id: BITCART_STORE_ID,
        order_id: saleId,
        notification_url: `${process.env.BACKEND_URL || req.protocol + '://' + req.get('host')}/api/purchases/bitcart-webhook`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to create BitCart invoice');
    }

    // Internal tokenId for reference
    const tokenId = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const purchase = await Purchase.create({
      tokenId,
      sale: sale._id,
      file: sale.file._id,
      seller: sale.seller,
      status: 'pending',
      bitcartId: data.id,
      checkoutUrl: `${BITCART_HOST}/i/${data.id}` // BitCart checkout URL format
    });

    res.status(201).json({
      status: 'success',
      data: {
        purchase
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getPurchaseStatus = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ tokenId: req.params.tokenId });
    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase token not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        status: purchase.status
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getPurchaseDetailsForSeller = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ 
      tokenId: req.params.tokenId,
      seller: req.user.id 
    }).populate('file').populate('sale');

    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Token not found or unauthorized' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        purchase
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

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

    res.status(200).json({
      status: 'success',
      data: {
        purchase
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.handleBitCartWebhook = async (req, res) => {
  try {
    const { id, status } = req.body;
    
    // Search for purchase with this BitCart ID
    const purchase = await Purchase.findOne({ bitcartId: id }).populate('sale');
    if (!purchase) {
      return res.status(404).json({ status: 'fail', message: 'Purchase not found' });
    }

    // Only proceed if invoice is completed
    if (status === 'complete' || status === 'paid') {
      purchase.status = 'confirmed';
      await purchase.save();

      // Trigger Automated Payout to Seller
      const sale = await Sale.findById(purchase.sale).populate('seller');
      const BITCART_HOST = process.env.BITCART_HOST;
      const BITCART_API_KEY = process.env.BITCART_API_KEY;

      if (BITCART_HOST && BITCART_API_KEY && sale.address) {
        try {
          const payoutResponse = await fetch(`${BITCART_HOST}/payouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${BITCART_API_KEY}`
            },
            body: JSON.stringify({
              amount: sale.price,
              currency: sale.currency || 'BTC',
              destination: sale.address,
              store_id: process.env.BITCART_STORE_ID
            })
          });
          const payoutData = await payoutResponse.json();
          if (payoutResponse.ok) {
            purchase.bitcartPayoutId = payoutData.id;
            await purchase.save();
          }
        } catch (payoutErr) {
          console.error('Payout automation failed:', payoutErr);
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
