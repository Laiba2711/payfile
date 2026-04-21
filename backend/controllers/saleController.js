const Sale = require('../models/Sale');
const Settings = require('../models/Settings');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// Helper: decimal precision by currency
const decimals = (currency) => currency === 'BTC' ? 8 : 2;

exports.createSale = catchAsync(async (req, res, next) => {
  const { fileId, price, currency, network, address, expiry } = req.body;

  let expiresAt;
  if (expiry) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));
  }

  const newSale = await Sale.create({
    file: fileId,
    seller: req.user.id,
    price,
    currency,
    network: currency === 'USDT' ? (network || 'TRC20') : '',
    address,
    expiresAt
  });

  res.status(201).json({
    status: 'success',
    data: {
      sale: newSale
    }
  });
});


exports.getSales = catchAsync(async (req, res, next) => {
  const sales = await Sale.find({ seller: req.user.id }).populate('file').sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: sales.length,
    data: {
      sales
    }
  });
});


exports.getPublicSale = catchAsync(async (req, res, next) => {
  const sale = await Sale.findById(req.params.id)
    .populate({
      path: 'file',
      select: 'name size mimeType createdAt expiresAt'
    });

  if (!sale) {
    return next(new AppError('Sale listing not found', 404));
  }

  const dp = decimals(sale.currency);

  const sellerPrice = parseFloat(sale.price);
  const commission = sellerPrice * 0.05;
  const totalPrice = (sellerPrice + commission).toFixed(dp);
  const commissionPrice = commission.toFixed(dp);

  const settings = await Settings.findOne() || {};
  let adminAddress;
  if (sale.currency === 'BTC') {
    adminAddress = process.env.ADMIN_BTC_ADDRESS || settings.adminBtcAddress;
  } else if (sale.network === 'ERC20') {
    adminAddress = process.env.ADMIN_USDT_ERC20_ADDRESS || settings.adminUsdtErc20Address || settings.adminUsdtAddress;
  } else {
    adminAddress = process.env.ADMIN_USDT_TRC20_ADDRESS || settings.adminUsdtTrc20Address || settings.adminUsdtAddress;
  }

  res.status(200).json({
    status: 'success',
    data: {
      sale: {
        _id:          sale._id,
        file:         sale.file,
        currency:     sale.currency,
        network:      sale.network,
        price:        sale.price,
        sellerPrice:  sale.price,
        commissionPrice,
        totalPrice,
        adminAddress,
        status:       sale.status,
        expiresAt:    sale.expiresAt,
        createdAt:    sale.createdAt,
        // NOTE: seller address (payout destination) is intentionally excluded from
        // the public response to protect seller privacy.
      }
    }
  });
});


