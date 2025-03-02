// resetPassword.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const sendWelcomeEmail = async (user) => {
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: user.email,
    from: 'info@e-guidesolutions.com',
    subject: `Hello ${user.name}, welcome to E-Guide Solutions`,
    text: `E-Guide Solutions makes your tourism business easier!`,
    html: `<p>Welcome to E-Guide Solutions. You can easily create tours with E-Guide Solutions, and run your touring business.</p>`,
  };

  await sgMail.send(msg);
};

module.exports = sendWelcomeEmail;
