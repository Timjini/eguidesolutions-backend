const mongoose = require('../db'); // adjust the path as needed

const bookingRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '', 
  },
  numberOfPeople: {
    type: Number,
    default: 1,
  },
  note: {
    type: String,
    default: '',
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);

module.exports = BookingRequest;
