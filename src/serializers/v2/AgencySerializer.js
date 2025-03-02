const UserSerializer = require("./userSerializer");
const TourSerializer = require("./TourSerializer");
const User = require("../../models/Users");
const Tour = require("../../models/Tours");
const Subscription = require("../../models/Subscription");


class AgencySerializer {
    static async serialize(agency) {
      if (!agency) {
        return null; // Handle cases where agency might be null
      }
  
      // Fetch owner
      const ownerUser = await User.findById(agency.owner).exec();
      const members = await Promise.all(
        agency.members.map(async (memberId) => {
          try {
            const member = await User.findById(memberId).exec();
            return member ? await UserSerializer.serialize(member) : null;
          } catch (error) {
            console.error(`Failed to fetch member with ID ${memberId}:`, error);
            return null;
          }
        })
      );
  
      // Fetch all tours and filter out null values
      const tours = await Promise.all(
        agency.tours.map(async (tourId) => {
          try {
            const tour = await Tour.findById(tourId).exec();
            return tour ? await TourSerializer.serialize(tour) : null;
          } catch (error) {
            console.error(`Failed to fetch tour with ID ${tourId}:`, error);
            return null;
          }
        })
      );

      const subscription = await Subscription.findOne({agency: agency._id}).exec();  
      // Filter out null tours
      const filteredTours = tours.filter(tour => tour !== null);
      const filteredMembers = members.filter(member => member !== null);
  
      return {
        _id: agency._id,
        id: agency.id,
        name: agency.name,
        owner: ownerUser ? await UserSerializer.serialize(ownerUser) : null,
        description: agency.description,
        members: filteredMembers,
        tours: filteredTours,
        subscription: subscription ?? null,
        image: agency.image,
        address: agency.address,
        status: agency.status,
        createdAt: agency.createdAt,
        updatedAt: agency.updatedAt,
      };
    }
  }
  
  module.exports = AgencySerializer;
  