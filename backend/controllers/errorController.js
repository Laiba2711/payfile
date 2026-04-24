const AppError = require('../utils/AppError');

// Prisma known-error codes we want to surface nicely:
// P2002 unique constraint violation, P2025 record not found, P2003 FK violation.
const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const fields = (err.meta && err.meta.target) || 'field';
    return new AppError(`Duplicate value for ${fields}. Please use another value.`, 400);
  }
  if (err.code === 'P2025') return new AppError('Record not found.', 404);
  if (err.code === 'P2003') return new AppError('Related record missing for this operation.', 400);
  return null;
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({ status: 'error', message: 'Something went very wrong!' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  let error = err;
  const prismaMapped = handlePrismaError(err);
  if (prismaMapped) error = prismaMapped;
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
