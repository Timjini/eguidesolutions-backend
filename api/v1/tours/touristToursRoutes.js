const express = require("express");
const router = express.Router();
const TourController = require("../../../controllers/tourController");

router.post("/", TourController.getAllTours);
router.post("/new-route", TourController.createNewTour);

module.exports = router;
