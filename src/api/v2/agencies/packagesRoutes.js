const express = require("express");
const router = express.Router();
const verifyToken = require("../../../auth/authMiddleware");
const {isAdministrator} = require("../../../auth/auth");

const PackagesController = require("../../../controllers/v2/subscriptionPackageController");

router.post("/",verifyToken, isAdministrator, PackagesController.createPackage);
router.get("/",verifyToken, isAdministrator, PackagesController.getPackages);
router.delete("/:id", PackagesController.deletePackage);

module.exports = router;