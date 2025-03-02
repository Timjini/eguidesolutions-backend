// resetPassword.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const sendPasswordResetEmail = async (user) => {
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const resetLink = `${process.env.CLIENT_URL}/activate-account?token=${user.resetPasswordToken}`;
  
  const msg = {
    to: user.email,
    from: 'info@e-guidesolutions.com',
    subject: `Hello ${user.name} active your account today`,
    text: `Click the following link to activate your account`,
    html: `<p>Click the following link: <a href="${resetLink}">Activate Your acount here</a></p>`,
  };

  await sgMail.send(msg);
};

module.exports = sendPasswordResetEmail;
