const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");
const SubscriptionPackage = require("../../models/SubscriptionPackage");
const Payment = require("../../models/Payment");
const PaymentSerializer = require("../../serializers/v2/PaymentSerializer");
const { uploadToS3 } = require("../../fileUploader");
const PaymentService = require("../../services/PaymentService");

async function createPayment(req, res) {
  try {
    const { agencyId, amount, packageId } = req.body;
    const file = req.file;
    const payment = await PaymentService.processPayment({ agencyId, amount, file, packageId });
    res.status(201).json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
}


async function getPayments(req, res) {
  try {
        // Retrieve all payments
    const payments = await Payment.find();

    // Serialize all payments
    const serializedPayments = await Promise.all(
      payments.map((payment) => PaymentSerializer.serialize(payment))
    );

    // Send the serialized payments as the response
    res.status(200).json(serializedPayments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve payments" });
  }
}

async function agencyPayments(req,res){
  try {
    const { agencyId } = req.query;
    const payments = await Payment.find({ agency: agencyId });
    const serializedPayments = await Promise.all(
      payments.map((payment) => PaymentSerializer.serialize(payment))
    );
    res.status(200).json(serializedPayments);
  } catch (err){
    res.status(500).json({error: err})
  }
}

async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { status , amount , paymentDate } = req.body;
    const payment = await Payment.findByIdAndUpdate(id, { amount, status, paymentDate }, { new: true });
    res.status(200).json(payment);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
  }
    catch (err) {
    res.status(500).json({ error: "Failed to update payment" });
  }
}

module.exports = {
  createPayment,
  getPayments,
  updatePayment,
  agencyPayments
};
