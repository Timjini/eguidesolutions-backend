const Agency = require("../../models/Agency");
const Subscription = require("../../models/Subscription");
const SubscriptionPackage = require("../../models/SubscriptionPackage");
const Payment = require("../../models/Payment");
const PaymentSerializer = require("../../serializers/v2/PaymentSerializer");

async function createPayment(req, res){
    try {
      const { agencyId, packageId, amount } = req.body;

      const agency = await Agency.findById(agencyId);
          if (!agency) {
            return res.status(404).json({ error: "Agency not found" });
          }
          const package = await SubscriptionPackage.findById(packageId);
          if (!package) {
            return res.status(404).json({ error: "Subscription package not found" });
          }

    const subscription = await Subscription.findOne({
      agency: agencyId,
    }).exec();

      if(!subscription) {
        try {
          let today = new Date();
          let durationToMonth = package.durationInMonths;
          let startDate = new Date();
          let endDate = new Date(
            today.getTime() + durationToMonth * 24 * 60 * 60 * 1000
          );
          // create e a new subscription
          try {
            let subscription = new Subscription({
              agency: agencyId,
              package: packageId,
              startDate: startDate || new Date(),
              endDate,
              status: "pending",
            });
            await subscription.save();
          } catch (err) {
            console.log("==================",err);
          }
        } catch (err) {
          console.log("==================",err);
        }
      }

      let newPayment;
          try {
            const newPayment = new Payment({
              agency: agencyId,
              subscription: subscription?._id,
              package: packageId,
              amount,
              status: "pending",
            });
            await newPayment.save();
          } catch (err) {
            console.log("==================",err);
          }

          res.status(201).json(newPayment);
    } catch (err) {
      console.log("==================",err);
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
};
