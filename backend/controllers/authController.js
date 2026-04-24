const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { hashPassword, comparePassword, createPasswordResetToken, hashResetToken } = require('../utils/authHelpers');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });

// Response shape kept identical to the previous Mongoose version so the
// frontend doesn't have to change. `id` is aliased as `_id` for legacy consumers.
const userResponse = (u) => ({
  id: u.id,
  _id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
});

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  const isOwner = lowerEmail === (process.env.OWNER_EMAIL || '').toLowerCase();
  const role = isOwner ? 'admin' : 'user';

  const existingUser = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: lowerEmail,
      password: await hashPassword(password),
      role,
    },
  });

  res.status(201).json({
    status: 'success',
    token: signToken(newUser.id),
    data: { user: userResponse(newUser) },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  res.status(200).json({
    status: 'success',
    token: signToken(user.id),
    data: { user: userResponse(user) },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { email: (req.body.email || '').toLowerCase() } });

  // Don't reveal whether the email exists.
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  }

  const { plainToken, hashedToken, expiresAt } = createPasswordResetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: hashedToken, passwordResetExpires: expiresAt },
  });

  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password/${plainToken}`;
  const message = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #430101;">Password Reset Request</h2>
      <p>You requested a password reset for your SatoshiBin account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #430101; color: #D4AF37; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 12px;">This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 10px;">Sent from SatoshiBin Secure Storage</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'SatoshiBin - Password Reset (Valid for 10 min)',
      message,
    });
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = hashResetToken(req.params.token);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(req.body.password),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json({
    status: 'success',
    token: signToken(user.id),
    data: { user: userResponse(user) },
  });
});
