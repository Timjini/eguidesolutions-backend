require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const sendBookingRequestEmail = async (bookingRequest, agency, user) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: user.email,
    from: 'info@e-guidesolutions.com',
    subject: `New Booking Request from ${agency.name}`,
    text: `You have received a new booking request with the following details:
    
    Email: ${bookingRequest.email}
    Phone: ${bookingRequest.phone || 'N/A'}
    Number of People: ${bookingRequest.numberOfPeople}
    Note: ${bookingRequest.note || 'No additional notes'}
    Tour ID: ${bookingRequest.tourId}
    Agency: ${agency.name}
    `,
    html: `
    <p>You have received a new booking request with the following details:</p>
    <ul>
      <li><strong>Email:</strong> ${bookingRequest.email}</li>
      <li><strong>Phone:</strong> ${bookingRequest.phone || 'N/A'}</li>
      <li><strong>Number of People:</strong> ${bookingRequest.numberOfPeople}</li>
      <li><strong>Note:</strong> ${bookingRequest.note || 'No additional notes'}</li>
      <li><strong>Tour ID:</strong> ${bookingRequest.tourId}</li>
      <li><strong>Agency:</strong> ${agency.name}</li>
    </ul>
    `,
  };

  await sgMail.send(msg);
};

module.exports = sendBookingRequestEmail;
