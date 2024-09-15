const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");

async function createSubscription(req, res) {
  try {
    const { packageId, agencyId, startDate, endDate } = req.body;
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }
    const newSubscription = new Subscription({
      agency: agencyId,
      package: packageId,
      startDate,
      endDate,
      status: "pending",
    });

    await newSubscription.save();
    agency.status = "active";
    await agency.save();
    res.status(201).json(newSubscription);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subscription" });
  }
}

module.exports = {
    createSubscription,
  };
