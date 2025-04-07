const express = require("express");
const router = express.Router();

const publicController = require('../../controllers/v3/publicController');
const requestsController = require('../../controllers/v3/requestsController');

// const verifyToken = require('../../auth/authMiddleware');


router.get("/", publicController.index);
router.post("/tours-data", publicController.save);
router.post("/booking-request",requestsController.save);

module.exports = router;
