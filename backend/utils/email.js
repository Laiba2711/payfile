const fetch = require('node-fetch');

/**
 * Send a password reset email using Brevo (formerly Sendinblue) API
 * @param {Object} options - { email, subject, message }
 */
const sendEmail = async (options) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
  const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'SatoshiBin';

  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.error('Email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL missing in .env');
    return;
  }

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: options.email,
      },
    ],
    subject: options.subject,
    htmlContent: options.message,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Brevo Error: ${data.message || response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error('Email sending failed:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
