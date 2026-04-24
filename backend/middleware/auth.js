const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    if (!currentUser) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};
