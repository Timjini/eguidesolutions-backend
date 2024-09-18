const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");

const subscriptionController = require("../../../controllers/v2/subscriptionController");

router.post("/",verifyToken, isAdministrator, subscriptionController.createSubscription);

module.exports = router;