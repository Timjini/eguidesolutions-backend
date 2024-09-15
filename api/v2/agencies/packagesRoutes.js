const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");

const PackagesController = require("../../../controllers/v2/packagesController");

router.post("/",verifyToken, isAdministrator, PackagesController.createPackage);