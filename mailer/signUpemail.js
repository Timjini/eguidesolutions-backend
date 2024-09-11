// resetPassword.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const sendSignUpEmail = async (user) => {
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: user.email,
    from: 'info@e-guidesolutions.com',
    subject: `Hello ${user.name} active your account today`,
    text: `Click the following link to activate your account`,
    html: `<p>Welcome to E-guide solutions</p>`,
  };

  await sgMail.send(msg);
};

module.exports = sendSignUpEmail;
