const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");
const AgencyController = require("../../../controllers/v2/agencyController");

// get agency by id 
router.get("/:id", isAdministrator, AgencyController.getAgencyById);

module.exports = router;