const express = require("express");
const router = express.Router();

const publicController = require('../../controllers/v3/publicController');
const verifyToken = require('../../auth/authMiddleware');


router.get("/", publicController.index);
router.post('/upload-csv', publicController.readCsv);

module.exports = router;
