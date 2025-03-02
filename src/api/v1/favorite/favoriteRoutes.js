const express = require("express");
const router = express.Router();
const FavoriteController = require("../../../controllers/favoriteController");

router.post("/", FavoriteController.addToFavorite);
router.delete("/", FavoriteController.removeFromFavorite);

module.exports = router;
