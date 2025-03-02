// router.get("/v2/user-profile", UserProfileController.getUser);
const express = require("express");
const router = express.Router();

const UserProfileController = require('../../controllers/v2/userProfileController');
const verifyToken = require('../../auth/authMiddleware');

router.get("/", UserProfileController.getUserProfile);
router.post("/create", verifyToken, UserProfileController.createOrUpdateUserProfile);
router.delete("/delete-user-profile", verifyToken, UserProfileController.deleteUserProfile);

module.exports = router;
