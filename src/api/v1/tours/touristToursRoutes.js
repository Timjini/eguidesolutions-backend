const express = require("express");
const router = express.Router();
const TourController = require("../../../controllers/tourController");

router.post("/", TourController.getAllTours);
router.post("/promoted-tours", TourController.getPromotedTours);
router.post("/new_route", TourController.createNewTour);
router.get("/agency_tours", TourController.getAgencyTours);
router.post("/request", TourController.submitRequest)

module.exports = router;
