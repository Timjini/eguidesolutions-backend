const SubscriptionPackage = require("../../models/SubscriptionPackage");

async function createPackage(req, res) {
  try {
    console.log(req.body);
    const { name, description, price, duration } = req.body;
    const newPackage = new SubscriptionPackage({
      name,
      description,
      price,
      durationInMonths: duration,
    });
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ error: "Failed to create subscription package", error: error.message });
  }
}

async function getPackages(req, res) {
  try {
    console.log("Fetching packages");
    const packages = await SubscriptionPackage.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription packages", error: error.message });
  }
}

module.exports = {
    createPackage,
    getPackages
  };