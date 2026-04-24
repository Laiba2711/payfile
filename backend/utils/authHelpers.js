/**
 * Password + reset-token helpers. Previously lived as methods on the Mongoose
 * User schema (pre('save') hook, comparePassword, createPasswordResetToken).
 * With Prisma, the controller is responsible for calling these explicitly.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const PASSWORD_COST = 12;
const RESET_TOKEN_LIFETIME_MS = 10 * 60 * 1000; // 10 minutes

const hashPassword = (plaintext) => bcrypt.hash(plaintext, PASSWORD_COST);
const comparePassword = (plaintext, hash) => bcrypt.compare(plaintext, hash);

/**
 * Creates a pair: (plainToken) is e-mailed to the user, (hashedToken) is
 * persisted on User.passwordResetToken. This matches the exact scheme the
 * Mongoose model used so existing reset URLs in transit still work.
 */
const createPasswordResetToken = () => {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);
  return { plainToken, hashedToken, expiresAt };
};

const hashResetToken = (plainToken) =>
  crypto.createHash('sha256').update(plainToken).digest('hex');

module.exports = { hashPassword, comparePassword, createPasswordResetToken, hashResetToken };
