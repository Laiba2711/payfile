const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payfile';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'laibashah2711@gmail.com';
    const password = 'aneeslaiba@3027';

    // 1. Create/Update Admin User
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = password; // Will be hashed in pre-save
      await user.save();
      console.log(`Admin user ${email} updated.`);
    } else {
      user = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email,
        password,
        role: 'admin'
      });
      console.log(`Admin user ${email} created.`);
    }

    // 2. Initialize Settings
    let settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
          adminBtcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          adminUsdtAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          commissionRate: 0.05
      });
      console.log('Default settings initialized.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
