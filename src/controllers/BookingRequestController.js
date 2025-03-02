const BookingRequest = require('../models/BookingRequest');
const BookingRequestService = require('../services/BookingRequestService');

class BookingRequestController {
  static async submitRequest(req, res) {
    try{
        return BookingRequestService.submitRequest(req, res);
    } catch (err) {
        console.log(err);
    }
  }

  static async getRequestsByAgency(req, res) {
    const { agencyId } = req.params;
    try {
      const requests = await BookingRequest.find({ agency: agencyId });
      return res.status(200).json({ requests });
    } catch (error) {
      console.error("Error fetching booking requests by agency:", error);
      return res.status(500).json({ error: "An error occurred while fetching booking requests." });
    }
  }
}

module.exports = BookingRequestController;
