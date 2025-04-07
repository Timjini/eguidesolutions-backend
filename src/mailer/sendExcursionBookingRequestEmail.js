const sgMail = require('@sendgrid/mail');
const { formatDate } = require('../utils/common');
const Excursion = require('../models/Excursion');

const sendExcursionBookingRequestEmail = async (bookingRequest) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);


  const excursion = await Excursion.findById(bookingRequest.tourId).exec();
  
  if (!excursion) {
    throw new Error('Excursion not found');
  }

  const msg = {
    to: 'hatim.jini@gmail.com',
    from: 'info@e-guidesolutions.com',
    subject: `New Booking Request: ${excursion.title_en}`,
    text: `You have received a new booking request from Maroko Ekspert:
    
    Email: ${bookingRequest.email}
    Full Name: ${bookingRequest.name}
    Phone: ${bookingRequest.phone || 'N/A'}
    Desired Date: ${formatDate(bookingRequest.desiredDate) || 'N/A'}
    Number of People: ${bookingRequest.numberOfPeople}
    Note: ${bookingRequest.note || 'No additional notes'}
    Tour: ${excursion.title_en || 'N/A'}
    Price: ${excursion.price || 'N/A'}
    City: ${excursion.city || 'N/A'}
    `,
    html: `
    <p>You have received a new booking request with the following details:</p>
    <ul>
      <li><strong>Email:</strong> ${bookingRequest.email}</li>
      <li><strong>Full Name:</strong> ${bookingRequest.name || 'N/A'}</li>
      <li><strong>Phone:</strong> ${bookingRequest.phone || 'N/A'}</li>
      <li><strong>Number of People:</strong> ${bookingRequest.numberOfPeople}</li>
       <li><strong>Desired Date:</strong> ${formatDate(bookingRequest.desiredDate) || 'N/A'}</li>
      <li><strong>Note:</strong> ${bookingRequest.note || 'No additional notes'}</li>
      <li><strong>Tour:</strong> ${excursion.title_en || 'N/A'}</li>
      <li><strong>Price:</strong> ${excursion.price || 'N/A'}</li>
      <li><strong>City:</strong> ${excursion.city || 'N/A'}</li>
    </ul>
    `,
  };

  await sgMail.send(msg);
};

module.exports = sendExcursionBookingRequestEmail;
