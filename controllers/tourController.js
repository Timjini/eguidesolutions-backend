const Tour = require("../models/Tours");
const TourSerializer = require("../serializers/tourSerializer");

class TourController {
  static async getAllTours(req, res) {
    try {
      const tours = await Tour.find();
      const serializedTours = TourSerializer.serializeMany(tours);
      console.log(tours);
      return res.status(200).json({
        status: "success",
        message: "Tours fetched successfully",
        data: serializedTours,
      });
    } catch (err) {
      console.error(err);
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }
}

module.exports = TourController;
