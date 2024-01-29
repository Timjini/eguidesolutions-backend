require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create an email
const msg = {
  to: 'hatim.jini@gmail.com',
  from: 'info@e-guidesolutions.com',
  subject: 'Test Email',
  text: 'Hello, this is a test email!',
  html: '<p>Hello, this is a test email!</p>',
};

// Send the email
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  })
  .catch((error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('SendGrid API error response:', error.response.body);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SendGrid API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request to SendGrid API:', error.message);
    }
  });
