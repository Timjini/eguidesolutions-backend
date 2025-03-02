const Agency = require("../../models/Agency");
const AgencySerializer = require("./AgencySerializer");

class PaymentSerializer {
    static async serialize(payment) {
      if (!payment) {
        return null; // Handle cases where payment might be null
      }

      // Fetch associated agency, subscription, and package
      const agency = await Agency.findById(payment.agency).exec();
      return {
        _id: payment._id,
        status: payment.status,
        agency: await AgencySerializer.serialize(agency) || null,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        status: payment.status,
      };
    }
}

module.exports = PaymentSerializer;
