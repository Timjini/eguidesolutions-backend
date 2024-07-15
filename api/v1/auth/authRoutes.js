const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/authController");

router.post("/login", authController.loginAuth);
router.delete("/logout", authController.logoutAuth);
router.post("/sign_up", authController.signUpAuth);

module.exports = router;
