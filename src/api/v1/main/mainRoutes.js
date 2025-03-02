const express = require("express");
const router = express.Router();
const mainController = require("../../../controllers/v1/mainController");

router.post("/error-logs", mainController.errorLogs);

module.exports = router;