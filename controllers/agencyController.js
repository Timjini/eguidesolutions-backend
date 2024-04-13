const Agency = require("../models/agency");

async function createAgency(req, res) {
  try {
    const { name } = req.body;

    // Create a new agency document
    const agency = new Agency({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    // Save the agency to the database
    await agency.save();

    res.status(201).json({ message: "Agency created successfully", agency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createAgency,
};
