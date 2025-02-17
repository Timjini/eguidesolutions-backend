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
const UserToursSerializer = require("../serializers/v2/UserToursSerializer");
const BookingRequest = require("../models/BookingRequest");

class TourController {
  static async getAllTours(req, res) {
    try {
      const userId = req.body.user_id;
      const user = await User.findById(userId);
      const tours = await Tour.find();

      if (!tours) {
        return res.status(404).json({ error: "No tour found" });
      }

      const serializedTours = await Promise.all(
        tours.map(async (tour) => {
          return await UserToursSerializer.serialize(tour, user);
        })
      );

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
  static async getPromotedTours(req, res) {
    try {
      const userId = req.body.user_id;
      const user = await User.findById(userId);
      const tours = await Tour.find({ promoted: true });
      const serializedTours = await Promise.all(
        tours.map(async (tour) => {
          return await UserToursSerializer.serialize(tour, user);
        })
      );
  
      return res.status(200).json({
        status: "success",
        message: "Promoted Tours fetched successfully",
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
      const { title, description, guide, agency, price, promoted, tags } =
        req.body;
      const stops = JSON.parse(req.body.stops);
      const parsedStartPoint = JSON.parse(req.body.start_point);
      const parsedEndPoint = JSON.parse(req.body.end_point);
      const file = req.file;
      const agencyId = req.body.agency;

      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      const agencyTour = await Agency.findOne({ _id: agencyId });

      if (!agencyTour) {
        return res.status(404).json({ error: "Agency not found" });
      }

      const image = await uploadToS3(file);

      const tour = new Tour({
        title,
        description,
        photo: image.file_name,
        guide,
        agency,
        start_point: parsedStartPoint,
        end_point: parsedEndPoint,
        stops,
        price,
        promoted,
        tags,
      });

      // validate required fields
      if (!parsedStartPoint || !parsedEndPoint) {
        return res
          .status(400)
          .json({ error: "Start point and end point are required" });
      }

      const startPointAddress = await createAddress(parsedStartPoint);
      const endPointAddress = await createAddress(parsedEndPoint);

      const addresses = [];
      if (Array.isArray(stops)) {
        for (const stop of stops) {
          addresses.push(await createAddress(stop));
        }
      }

      addresses.push(startPointAddress, endPointAddress);

      if (!addresses.length) {
        return res
          .status(404)
          .json({ error: "Addresses could not be created" });
      }

      await createItinerary(addresses, tour);
      await tour.save();

      agencyTour.tours.push(tour);
      await agencyTour.save();
      res.status(201).json({ message: "Tour created successfully", tour });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `An error occurred while creating the tour ${error}` });
    }
  }

  static async getAgencyTours(req, res) {
    const { agencyId } = req.query;
    const authToken = req.headers.authorization?.split(" ")[1];

    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await User.findOne({ authToken: authToken }).exec();

      if (user.type === "admin" && !agencyId) {
        const allTours = await Tour.find();
        res.status(200).json({ message: "All Tours", tours: allTours });
      } else {
        const agency = await Agency.findOne({
          $or: [
            { members: { _id: user._id } }, 
            { ownedAgency: user?.ownedAgency },
            { userAgency: user?.userAgency }
          ]
        }) || null;

        if (!agency) {
          return res
            .status(404)
            .json({ message: "Agency not found for the user" });
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
                price: populatedTour?.price
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

        res.status(200).json({
          message: "Agency Tours",
          tours: validToursWithGuides,
          agency: agency,
          guide: users,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the tour" });
    }
  }

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

      await bookingRequest.save();

      return res.status(200).json({
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

module.exports = TourController;
