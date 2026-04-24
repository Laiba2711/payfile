// Edit the email below then run:
//   node backend/scripts/promoteAdmin.js
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const prisma = require('../prisma/client');

const EMAIL = 'laibashah2711@gmail.com';

(async () => {
  try {
    const user = await prisma.user.update({
      where: { email: EMAIL },
      data: { role: 'admin' },
    });
    console.log(`Successfully promoted ${user.email} to admin.`);
    await prisma.$disconnect();
  } catch (err) {
    if (err.code === 'P2025') {
      console.log(`User with email ${EMAIL} not found.`);
      process.exit(1);
    }
    console.error('Error promoting user:', err);
    process.exit(1);
  }
})();
