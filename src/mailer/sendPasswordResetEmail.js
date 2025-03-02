require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const sendPasswordResetEmail = async (user) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${user.resetPasswordToken}`;

    const msg = {
        to: user.email,
        from: 'info@e-guidesolutions.com',
        subject: `Hello ${user?.name} active your account today`,
        text: `Click the following link to reset your password`,
        html: `<a href="${resetLink}">Reset Password</a>`,
      };
    await sgMail.send(msg);
  }
  
module.exports = sendPasswordResetEmail;
