const Agency = require("../../models/Agency");
const AgencySerializer = require("../../serializers/v2/AgencySerializer");
const User = require("../../models/Users");
const Tour = require("../../models/Tours");

async function getAgencies(req, res) {
  try {
    const agencies = await Agency.find();

    // Serialize each agency using the updated serializer
    const serializedAgencies = await Promise.all(
      agencies.map((agency) => AgencySerializer.serialize(agency))
    );

    return res
      .status(200)
      .json({
        status: "success",
        message: "Agencies fetched successfully",
        agencies: serializedAgencies,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:error, message: "Internal server error" });
  }
}

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

// get agency by id
async function getAgencyById(req, res) {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return (res) => res.status(404).json({ message: "Agency not found" });
    }
    res.json(agency);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateAgency(req, res) {
  console.log("body here", req.body);

  try {
    const { name } = req.body;
    const updatedAgency = await Agency.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updatedAgency) {
      return (res) => res.status(404).json({ message: "Agency not found" });
    }
    res.json(updatedAgency);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getAgencies,
  createAgency,
  getAgencyById,
  updateAgency,
};
