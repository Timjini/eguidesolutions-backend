const Tour = require("../models/Tours");
const Favorite = require("../models/Favorite");
const TourSerializer = require("../serializers/tourSerializer");
const Agency = require('../../models/Agency');
const { upload, uploadToS3 } = require('../../fileUploader');

class TourController {
  static async getAllTours(req, res) {
    try {
      const userId = req.body.user_id;
      const tours = await Tour.find();
      console.log(tours.length);

      const serializedTours = await Promise.all(
        tours.map(async (tour) => {
          const favoriteRecord = await Favorite.findOne({
            user: userId,
            tour: tour._id,
          });

          // const isFavorite = !!favoriteRecord;

          return {
            ...TourSerializer.serialize(tour),
            favorite: favoriteRecord.isFavorite,
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

  static async createNewTour(req, res) {
    try {
      const { title, description, guide, agency, startingDate, endingDate } = req.body;
      const file = req.file;
      const agencyId = req.body.agency
      const image = await uploadToS3(file);

      // const authToken = req.headers.authorization?.split(' ')[1];

      const tour = new Tour({
        title,
        description,
        photo: image.file_name,
        guide: guide,
        agency: agency,
        starting_date: startingDate,
        ending_date: endingDate
      });

      // Save the tour document to the database
      await tour.save();

      const agencyTour = await Agency.findOne({ _id: agencyId });

      if (!agencyTour) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      // Update the user's profile to include this new tour (assuming you have a user-tour relationship)
      agencyTour.tours.push(tour);
      await agencyTour.save();

      res.status(201).json({ message: 'Tour created successfully', tour });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the tour' });
    }
  }
}

module.exports = TourController;
