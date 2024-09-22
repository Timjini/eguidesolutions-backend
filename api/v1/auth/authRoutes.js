const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/v1/authController");
const verifyToken = require("../../../auth/authMiddleware");

router.post("/login", authController.loginAuth);
router.delete("/logout",verifyToken ,  authController.logoutAuth);
router.post("/sign_up", authController.signUpAuth);

module.exports = router;
