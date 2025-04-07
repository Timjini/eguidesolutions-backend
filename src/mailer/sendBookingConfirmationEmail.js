const sgMail = require('@sendgrid/mail');
const { formatDate } = require('../utils/common');
const Excursion = require('../models/Excursion'); // Make sure to import your Excursion model

const sendBookingConfirmationEmail = async (bookingRequest) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const excursion = await Excursion.findById(bookingRequest.tourId).exec();
  
  if (!excursion) {
    throw new Error('Excursion not found');
  }

  const msg = {
    to: bookingRequest.email,
    from: 'info@e-guidesolutions.com',
    subject: `Thank you for your booking with Morocco Ekspert`,
    text: `Thank you for booking with Morocco Ekspert! We have received your booking request with the following details:

    Tour: ${excursion.title_en || 'N/A'}
    City: ${excursion.city || 'N/A'}
    Number of People: ${bookingRequest.numberOfPeople}
    Desired Date: ${formatDate(bookingRequest.desiredDate) || 'N/A'}

    Please note, this is a booking request and we will contact you soon to confirm the details.

    Thank you for choosing Morocco Ekspert!
    `,
    html: `
    <p>Thank you for booking with <strong>Morocco Ekspert</strong>! We have received your booking request with the following details:</p>
    <ul>
      <li><strong>Tour:</strong> ${excursion.title_en || 'N/A'}</li>
      <li><strong>City:</strong> ${excursion.city || 'N/A'}</li>
      <li><strong>Number of People:</strong> ${bookingRequest.numberOfPeople}</li>
      <li><strong>Desired Date:</strong> ${formatDate(bookingRequest.desiredDate) || 'N/A'}</li>
    </ul>
    <p>Please note, this is a booking request and we will contact you soon to confirm the details.</p>
    <p>Thank you for choosing <strong>Maroko Ekspert</strong>!</p>
    <footer>
      <p><strong>Maroko Ekspert</strong></p>
    </footer>
    `,
  };

  await sgMail.send(msg);
};

module.exports = sendBookingConfirmationEmail;
