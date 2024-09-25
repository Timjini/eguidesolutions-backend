const SubscriptionPackage = require("../../models/SubscriptionPackage");

async function createPackage(req, res) {
  try {
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
    const packages = await SubscriptionPackage.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription packages", error: error.message });
  }
}

async function updatePackage(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;
    const updatedPackage = await SubscriptionPackage.findByIdAndUpdate(
      id,
      { name, description, price, durationInMonths: duration },
      { new: true }
    );
    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: "Failed to update subscription package", error: error.message });
  }
}

async function deletePackage(req, res) {

  try {
    const { id } = req.params;
    const deletedPackage = await SubscriptionPackage.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.status(200).json(deletedPackage);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subscription package", error: error.message });
  }
}

module.exports = {
    createPackage,
    getPackages,
    updatePackage,
    deletePackage,
  };