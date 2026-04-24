// Edit the email/password below then run:
//   node backend/scripts/seedAdmin.js
// Idempotent: upserts the admin user and seeds default Settings if missing.
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const prisma = require('../prisma/client');
const { hashPassword } = require('../utils/authHelpers');

const EMAIL = 'laibashah2711@gmail.com';
const PASSWORD = 'aneeslaiba@3027';

(async () => {
  try {
    const hashed = await hashPassword(PASSWORD);

    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      update: { role: 'admin', password: hashed },
      create: {
        firstName: 'System',
        lastName: 'Admin',
        email: EMAIL,
        password: hashed,
        role: 'admin',
      },
    });
    console.log(`Admin user ${user.email} upserted.`);

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    console.log('Default settings ensured.');

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
})();
