const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payfile';

async function promoteAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'laibashah2711@gmail.com';
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Successfully promoted ${email} to admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error promoting user:', err);
    process.exit(1);
  }
}

promoteAdmin();
