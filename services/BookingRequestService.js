const Agency = require('../models/Agency');
const User = require('../models/Users');
const BookingRequest = require('../models/BookingRequest');
const sendBookingRequestEmail = require('../mailer/sendBookingRequestEmail');

class BookingRequestService {
  static async submitRequest(req, res) {
    try {
      const { email, phone, numberOfPeople, note, tourId, agency } = req.body;
      
      const parsedNumberOfPeople = numberOfPeople ? parseInt(numberOfPeople, 10) : 1;

      const bookingRequest = new BookingRequest({
        email,
        phone: phone || '',
        numberOfPeople: parsedNumberOfPeople,
        note: note || '',
        tourId,
        agency,
      });

      const agencyContact = await Agency.findById(agency);
      const user = await User.findById(agencyContact.owner)

      await bookingRequest.save();

      try {
        await sendBookingRequestEmail(bookingRequest, agencyContact, user);
      } catch (err) {
        console.log(err)
      }

      return res.status(200).json({
        status: 'success',
        message: "Booking request submitted successfully.",
        bookingRequest,
      });
    } catch (error) {
      console.error("Error submitting booking request: ", error);
      return res.status(500).json({
        error: "An error occurred while submitting the booking request.",
      });
    }
  }
    
}

module.exports = BookingRequestService;
