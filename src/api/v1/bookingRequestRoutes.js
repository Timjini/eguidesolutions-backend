const express = require('express');
const BookingRequestController = require('../../controllers/BookingRequestController');
const router = express.Router();

router.post('/booking-request', BookingRequestController.submitRequest);
router.get('/booking-requests/:agencyId', BookingRequestController.getRequestsByAgency);

module.exports = router;
