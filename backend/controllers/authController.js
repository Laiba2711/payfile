const User = require('../models/User');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key', {
    expiresIn: '7d',
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // 1. Determine role (Auto-promote if matches OWNER_EMAIL in .env)
  const isOwner = email.toLowerCase() === (process.env.OWNER_EMAIL || '').toLowerCase();
  const role = isOwner ? 'admin' : 'user';

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists & password is correct
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    },
  });
});


exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  // ⚠ PRODUCTION SECURITY: Do not reveal if email exists or not
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password/${resetToken}`;

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

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    },
  });
});

