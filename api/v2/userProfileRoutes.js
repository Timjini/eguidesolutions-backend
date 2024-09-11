// router.get("/v2/user-profile", UserProfileController.getUser);
const express = require("express");
const router = express.Router();

const UserProfileController = require('../../controllers/v2/userProfileController');
const verifyToken = require('../../auth/authMiddleware');

router.get("/", UserProfileController.getUserProfile);
router.post("/new_user_profile", verifyToken, UserProfileController.createUserProfile);
router.put("/update_user_profile", verifyToken, UserProfileController.updateUserProfile);
router.delete("/delete_user_profile", verifyToken, UserProfileController.deleteUserProfile);

module.exports = router;
