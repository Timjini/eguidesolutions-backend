const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");
const AgencyController = require("../../../controllers/v2/agencyController");

// get agency by id 
router.get("/:id",verifyToken, isAdministrator, AgencyController.getAgencyById);
router.put("/:id",isAdministrator, AgencyController.updateAgency);

module.exports = router;