const express = require("express");
const router = express.Router();
const Channel = require("../models/Channels");
const Itinerary = require("../models/Itinerary");
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

      const serializedTours = await Promise.all(
        tours.map(async (tour) => {
          const favoriteRecord = await Favorite.findOne({
            user: userId,
            tour: tour._id,
          });

          return {
            ...TourSerializer.serialize(tour),
            favorite: favoriteRecord ? favoriteRecord.isFavorite : false,
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
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  static async createNewTour(req, res) {
    try {
      const { title, description, guide, agency, starting_date, ending_date } = req.body;
      const start_point = JSON.parse(req.body.start_point);
      const end_point = JSON.parse(req.body.end_point);
      const stops = JSON.parse(req.body.stops);
      console.log("req.body", req.body);
      const file = req.file;
      const agencyId = req.body.agency;

      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      const image = await uploadToS3(file);

      const tour = new Tour({
        title,
        description,
        photo: image.file_name,
        guide,
        agency,
        starting_date,
        ending_date,
        start_point,
        end_point,
        stops
      });

      // Validate required fields
      if (!start_point || !end_point) {
        return res.status(400).json({ error: "Start point and end point are required" });
      }

      const startPointAddress = await createAddress(start_point);
      const endPointAddress = await createAddress(end_point);

      const addresses = [];
      if (Array.isArray(stops)) {
        for (const stop of stops) {
          addresses.push(await createAddress(stop));
        }
      }
      
      addresses.push(startPointAddress);
      addresses.push(endPointAddress);
      
      await tour.save();
      await createItinerary(addresses, tour);

      const agencyTour = await Agency.findOne({ _id: agencyId });

      if (!agencyTour) {
        return res.status(404).json({ error: "Agency not found" });
      }

      agencyTour.tours.push(tour);
      await agencyTour.save();

      res.status(201).json({ message: "Tour created successfully", tour });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while creating the tour" });
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

      if ((user.type === "admin" && !agencyId)) {
        const allTours = await Tour.find();
        console.log("Tours here Admin ----", allTours);
        res.status(200).json({ message: "All Tours", tours: allTours });
      } else {
        const agency = await Agency.findOne({ owner: user._id });

        if (!agency) {
          return res.status(404).json({ message: "Agency not found for the user" });
        }

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
              return null;
            }
          })
        );

        const validToursWithGuides = toursWithGuides.filter(
          (tour) => tour !== null
        );

        console.log(validToursWithGuides);

        res.status(200).json({
          message: "Agency Tours",
          tours: validToursWithGuides,
          agency: agency,
          guide: users,
        });
        console.log("Tours here ----", validToursWithGuides);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching the tour" });
    }
  }
}

module.exports = TourController;
