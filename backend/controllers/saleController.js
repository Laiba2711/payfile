const prisma = require('../prisma/client');
const { networkToDb, networkFromDb } = require('../utils/enumMap');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const decimals = (currency) => (currency === 'BTC' ? 8 : 6);

// Map DB row → client shape (exposes `_id`, flattens network enum).
const toClientSale = (s) => s && ({ ...s, _id: s.id, network: networkFromDb(s.network) });

exports.createSale = catchAsync(async (req, res, next) => {
  const { fileId, price, currency, network, address, expiry } = req.body;

  let expiresAt;
  if (expiry) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));
  }

  const newSale = await prisma.sale.create({
    data: {
      fileId,
      sellerId: req.user.id,
      price: parseFloat(price),
      currency,
      network: currency === 'USDT' ? networkToDb(network || 'TRC20') : networkToDb(''),
      address,
      expiresAt,
    },
  });

  res.status(201).json({ status: 'success', data: { sale: toClientSale(newSale) } });
});

exports.getSales = catchAsync(async (req, res, next) => {
  const sales = await prisma.sale.findMany({
    where: { sellerId: req.user.id },
    include: { file: true },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({
    status: 'success',
    results: sales.length,
    data: {
      sales: sales.map((s) => ({
        ...toClientSale(s),
        file: s.file && { ...s.file, _id: s.file.id },
      })),
    },
  });
});

exports.getPublicSale = catchAsync(async (req, res, next) => {
  const sale = await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: {
      file: { select: { id: true, name: true, size: true, mimeType: true, createdAt: true, expiresAt: true } },
    },
  });
  if (!sale) return next(new AppError('Sale listing not found', 404));

  const dp = decimals(sale.currency);
  const sellerPrice = parseFloat(sale.price);
  const commission = sellerPrice * 0.05;
  const totalPrice = (sellerPrice + commission).toFixed(dp);
  const commissionPrice = commission.toFixed(dp);

  const settings = (await prisma.settings.findUnique({ where: { id: 1 } })) || {};

  let adminAddress;
  if (sale.currency === 'BTC') {
    adminAddress = process.env.ADMIN_BTC_ADDRESS || settings.adminBtcAddress;
  } else {
    adminAddress =
      process.env.ADMIN_USDT_TRC20_ADDRESS ||
      settings.adminUsdtTrc20Address ||
      settings.adminUsdtAddress;
  }

  res.status(200).json({
    status: 'success',
    data: {
      sale: {
        _id: sale.id,
        id: sale.id,
        file: sale.file && { ...sale.file, _id: sale.file.id },
        currency: sale.currency,
        network: networkFromDb(sale.network),
        price: sale.price,
        sellerPrice: sale.price,
        commissionPrice,
        totalPrice,
        adminAddress,
        status: sale.status,
        expiresAt: sale.expiresAt,
        createdAt: sale.createdAt,
        // Intentionally omit sale.address (seller payout destination) from public response.
      },
    },
  });
});
