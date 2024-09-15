const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");
const SubscriptionPackage = require("../../models/SubscriptionPackage");

async function createSubscription(req, res) {
  try {
    const { packageId, agencyId, startDate } = req.body;
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }


    const subscriptionPackage = await SubscriptionPackage.findById(packageId);
    if (!subscriptionPackage) {
      return res.status(404).json({ error: "Subscription package not found" });
    }

    let today = new Date();
    let durationToMonth = subscriptionPackage.durationInMonths * 30;
    let endDate = new Date(today.getTime() + durationToMonth * 24 * 60 * 60 * 1000);


    const newSubscription = new Subscription({
      agency: agencyId,
      package: packageId,
      startDate: startDate || new Date(),
      endDate,
      status: "pending",
    });

    await newSubscription.save();
    agency.status = "active";
    await agency.save();
    res.status(201).json(today);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subscription", error: err.message });
  }
}

module.exports = {
    createSubscription,
  };
