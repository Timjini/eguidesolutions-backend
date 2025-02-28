require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'hatim.jini@gmail.com',
  from: 'info@e-guidesolutions.com',
  subject: 'Test Email',
  text: 'Hello, this is a test email!',
  html: '<p>Hello, this is a test email!</p>',
};

sgMail
  .send(msg)
  .then(() => {
  })
  .catch((error) => {
    if (error.response) {
      console.error('SendGrid API error response:', error.response.body);
    } else if (error.request) {
      console.error('No response received from SendGrid API');
    } else {
      console.error('Error setting up the request to SendGrid API:', error.message);
    }
  });
