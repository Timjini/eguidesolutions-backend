const express = require("express");
const router = express.Router();
// const upload = require('../../multer-config');
const Channel = require("../models/Channels");
const User = require("../models/Users");
const Agency = require("../models/Agency");
const Guide = require("../models/Guide");
const Tour = require("../models/Tours");
const { upload, uploadToS3 } = require("../fileUploader");
const { createAddress, createItinerary } = require("../helpers/TourHelper");

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
      const { title, description, guide, agency, startingDate, endingDate, startPoint, endPoint, stops } =
        req.body;
      const file = req.file;
      console.log("===================>", file)
      const agencyId = req.body.agency;
      const image = await uploadToS3(file);

      // const authToken = req.headers.authorization?.split(' ')[1];

      const tour = new Tour({
        title,
        description,
        photo: image.file_name,
        guide: guide,
        agency: agency,
        starting_date: startingDate,
        ending_date: endingDate,
      });
      await tour.save();

      // create itinerary
      const addresses = [];
      const startPointAddress = createAddress(startPoint);
      const endPointAddress = createAddress(endPoint);
 
      stops.map((stop) => {
        addresses.push(createAddress(stop))
      });
      addresses.push(startPointAddress);
      addresses.push(endPointAddress);

      createItinerary(addresses, tour);

      // Save the tour document to the database

      const agencyTour = await Agency.findOne({ _id: agencyId });

      if (!agencyTour) {
        return res.status(404).json({ error: "Agency not found" });
      }

      // Update the user's profile to include this new tour (assuming you have a user-tour relationship)
      agencyTour.tours.push(tour);
      await agencyTour.save();

      res.status(201).json({ message: "Tour created successfully", tour });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the tour" });
    }
  }

  static async getAgencyTours(req, res) {
    const { agencyId } = req.query;
    const authToken = req.headers.authorization?.split(" ")[1];
    console.log(agencyId);

    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await User.findOne({ authToken: authToken }).exec();

      // Check if the user is an admin and agencyId is null
      if (
        (user.type === "admin" && agencyId === null) ||
        agencyId === undefined
      ) {
        const allTours = await Tour.find();

        console.log("Tours here Admin ----", allTours);

        res.status(200).json({ message: "All Tours", tours: allTours });
      } else {
        const agency = await Agency.findOne({ owner: user._id });

        if (!agency) {
          return res
            .status(404)
            .json({ message: "Agency not found for the user" });
        }

        // Use provided agencyId or the agencyId of the user
        const tours = await Tour.find({ agency: agencyId || agency._id });
        const guides = await Guide.find({ agency: agency }).exec();
        const userIDs = guides.map((guide) => guide.user);
        const users = await User.find({ _id: { $in: userIDs } }).exec();

        const toursWithGuides = await Promise.all(
          tours.map(async (tour) => {
            try {
              const populatedTour = await Tour.findById(tour._id)
                .populate("guide")
                .populate("agency");

              return {
                title: populatedTour.title,
                description: populatedTour.description,
                image: `uploads/${populatedTour.photo}`,
                _id: populatedTour._id,
                guide: populatedTour.guide,
                agency: populatedTour.agency,
                starting_date: populatedTour.starting_date,
                ending_date: populatedTour.ending_date,
              };
            } catch (error) {
              console.error("Error populating guide for tour:", error);
              return null; // Handle the error as needed
            }
          })
        );

        // Filter out any tours that failed to be populated
        const validToursWithGuides = toursWithGuides.filter(
          (tour) => tour !== null
        );

        console.log(validToursWithGuides);

        res.status(200).json({
          message: "Agency Tours",
          tours: toursWithGuides,
          agency: agency,
          guide: users,
        });
        console.log("Tours here ----", toursWithGuides);
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the tour" });
    }
  }
}

module.exports = TourController;
