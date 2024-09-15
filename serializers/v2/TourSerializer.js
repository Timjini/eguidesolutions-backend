const UserSerializer = require("./userSerializer");
const User = require("../../models/Users");
const Guide = require("../../models/Guide");


class TourSerializer {
    static async serialize(tour) {
      if (!tour) {
        return null; 
      }

      const tourGuide = await Guide.findById(tour.guide).exec();
      const tourGuideUser = await User.findById(tourGuide.user).exec();
  
      const convertIdToString = (id) => id ? id.toString() : null;
  
      const serializedTour = {
        _id: convertIdToString(tour._id),
        id: convertIdToString(tour._id), 
        title: tour.title,
        description: tour.description,
        photo: tour?.photo,
        guide: tourGuideUser ? await UserSerializer.serialize(tourGuideUser) : null,
        agency: convertIdToString(tour.agency), 
        starting_date: tour?.starting_date ?? '',
        ending_date: tour?.ending_date ?? '',
        start_point: tour?.start_point ?? '',
        end_point: tour?.end_point ?? '',
        stops: tour?.stops ?? [],
        address: tour?.address  ?? '',
      };
  
      return serializedTour;
    }
  }
  
  module.exports = TourSerializer;
  