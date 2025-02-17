const express = require("express");
const router = express.Router();
const TourController = require("../../../controllers/tourController");

router.get("/", TourController.getAllTours);
router.post("/new_route", TourController.createNewTour);
router.get("/agency_tours", TourController.getAgencyTours);

module.exports = router;
