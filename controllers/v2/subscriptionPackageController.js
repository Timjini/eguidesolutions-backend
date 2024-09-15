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
    res.status(500).json({ error: "Failed to create subscription package" });
  }
}

module.exports = {
    createPackage,
  };