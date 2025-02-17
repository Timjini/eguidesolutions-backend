const express = require("express");
const router = express.Router();

const GuideController = require('../../controllers/v2/guideController');
const verifyToken = require('../../auth/authMiddleware');


router.post("/info", GuideController.getGuide);
router.post("/rating", GuideController.submitRating)

module.exports = router;
