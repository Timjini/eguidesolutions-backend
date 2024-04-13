const Tour = require("../models/Tours");
const Favorite = require("../models/Favorite");
const TourSerializer = require("../serializers/tourSerializer");

class TourController {
  static async getAllTours(req, res) {
    try {
      console.log(req.body);
      const userId = req.body.user_id;
      const tours = await Tour.find();
      console.log(tours.length);

      const serializedTours = await Promise.all(
        tours.map(async (tour) => {
          const favoriteRecord = await Favorite.findOne({
            user: userId,
            tour: tour._id,
          });

          const isFavorite = !!favoriteRecord;

          return {
            ...TourSerializer.serialize(tour),
            favorite: isFavorite,
          };
        })
      );
      console.log("Serialized Tours:", serializedTours.length);
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
