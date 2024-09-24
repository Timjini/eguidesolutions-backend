const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");
const paymentController = require("../../../controllers/v2/paymentController");

router.post("/",verifyToken, isAdministrator, paymentController.createPayment);
router.get("/", verifyToken, isAdministrator, paymentController.getPayments);

module.exports = router;