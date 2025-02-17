// services/PaymentService.js

const Agency = require("../models/Agency");
const SubscriptionPackage = require("../models/SubscriptionPackage");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const { uploadToS3 } = require("../fileUploader");


class PaymentService {
  static async createSubscriptionIfNotExists(agencyId, subscriptionPackage) {
    const subscription = await Subscription.findOne({ agency: agencyId }).exec();
    if (!subscription) {
      const today = new Date();
      const durationToMonth = subscriptionPackage.durationInMonths;
      const startDate = new Date();
      const endDate = new Date(today.getTime() + durationToMonth * 24 * 60 * 60 * 1000);

      const newSubscription = new Subscription({
        agency: agencyId,
        package: subscriptionPackage._id,
        startDate,
        endDate,
        status: "pending",
      });

      await newSubscription.save();
      return newSubscription;
    }
    return subscription;
  }

  static async createPayment(agencyId, subscriptionId, agencyPackage, amount) {
    const newPayment = new Payment({
      agency: agencyId,
      subscription: subscriptionId,
      package: agencyPackage._id,
      amount,
      status: "pending",
    });

    await newPayment.save();
    return newPayment;
  }

  static async processPayment({ agencyId, amount, file, agencyPackage= undefined }) {
    const agency = await Agency.findById(agencyId);
    let totalPayment = 0;
    if (!agency) {
      throw new Error("Agency not found");
    }

    const subscriptionPackage = await Subscription.find({agency: agencyId});
    if (!subscriptionPackage) {
      throw new Error("Subscription package not found");
    }

    const subscription = await this.createSubscriptionIfNotExists(agencyId, subscriptionPackage);

    // Upload the file to S3
    let photoUrl = "";
    if (file) {
      const photo = await uploadToS3(file);
      photoUrl = photo.file_name;
    }

    if (!agencyPackage) {
        agencyPackage = await SubscriptionPackage.findOne({ package: subscriptionPackage.package });
        if (!agencyPackage) {
          throw new Error("Package not found");
        }
    }

    if(!amount){
        totalPayment += SubscriptionPackage.price;
    } else {
        totalPayment += amount;
    }

    // Create payment
    const payment = await this.createPayment(agencyId, subscription?._id, agencyPackage, totalPayment, photoUrl);
    return payment;
  }
}

module.exports = PaymentService;
