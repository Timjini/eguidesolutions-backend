const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");
const SubscriptionPackage = require("../../models/SubscriptionPackage");
const SubscriptionSerializer = require("../../serializers/v2/SubscriptionSerializer");

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

    let subscription = await Subscription.findOne({agency: agencyId});
    if (subscription && subscription.endDate > endDate) {
      return res.status(400).json({ error: "Agency already has an active subscription" });
    }

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
    res.status(201).json(newSubscription);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subscription", error: err.message });
  }
}

async function getSubscriptions(req, res) {
  try {
    const subscriptions = await Subscription.find();
    const serializedSubscription = await Promise.all(
      subscriptions.map((subscriptions) => SubscriptionSerializer.serialize(subscriptions))
    );
    res.status(200).json(serializedSubscription);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve subscriptions" });
  }
}

async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const { payment_status,startDate,endDate,status  } = req.body;
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { status, payment_status,startDate,endDate },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.status(200).json(updatedSubscription);
  } catch (err) {
    res.status(500).json({ error: "Failed to update subscription" });
  }
}

module.exports = {
    createSubscription,
    getSubscriptions,
    updateSubscription
  };
