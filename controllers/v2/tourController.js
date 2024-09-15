const Tour = require("../../models/Tours");


// get agency by id 
async function getAgencyTourById(req, res) {
    console.log(req.params.id);
    try {
      const tour = await Tour.findById(req.params.id);
      if (!tour) {
        return res => res.status(404).json({ message: "Tour not found" });
      }
      return res.status(200).json(tour);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  
  module.exports = {
    getAgencyTourById,
  };
  