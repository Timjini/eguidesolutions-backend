const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");
const TourController = require("../../../controllers/v2/tourController");

// get agency by id 
router.get("/:id",verifyToken, TourController.getAgencyTourById);
router.get("/",verifyToken, TourController.getAgencyTours);

module.exports = router;