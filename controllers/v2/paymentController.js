const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");
const SubscriptionPackage = require("../../models/SubscriptionPackage");
const Payment = require("../../models/Payment");

async function createPayment(req, res) {
    try {
      const { agencyId, subscriptionId, packageId, amount } = req.body;
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      const package = await SubscriptionPackage.findById(packageId);
      if (!package) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      const newPayment = new Payment({
        agency: agencyId,
        subscription: subscriptionId,
        package: packageId,
        amount,
        status: "pending",
      });
      await newPayment.save();
        //TODO adapt subscriptions helper   after payment is successful, update subscription status to active
        subscription.status = "active";
        subscription.payment_status = "paid";
        await subscription.save();
      res.status(201).json(newPayment);
    } catch (err) {
      res.status(500).json({ error: "Failed to create payment" });
      }
    }

async function getPayments(req, res) {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve payments" });
  }
}
    module.exports = {
      createPayment,
      getPayments
    };