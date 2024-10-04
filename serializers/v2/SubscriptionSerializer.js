const Agency = require("../../models/Agency");
const AgencySerializer = require("./AgencySerializer");

class SubscriptionSerializer {
    static async serialize(subscription) {
      if (!subscription) {
        return null; // Handle cases where subscription might be null
      }

      // Fetch associated agency, subscription, and package
      const agency = await Agency.findById(subscription.agency).exec();
      return {
        _id: subscription._id,
        status: subscription.status,
        agency: await AgencySerializer.serialize(agency) || null,
        startDate: subscription.startDate,
        endDate : subscription.endDate,
      };
    }
}

module.exports = SubscriptionSerializer;
