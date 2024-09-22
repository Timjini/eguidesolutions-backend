const mongoose = require('mongoose');
const Address = require('../models/Address');
const Itinerary = require('../models/Itinerary');

class TourHelper {
  static async createAddress(data) {
 
    try {
      const address = new Address({
        street_1: data?.street_1 ?? "",
        street_2: data?.street_2 ?? "",
        city: data?.city ?? "",
        state: data?.state ?? "",
        country: data?.country ?? "",
        postal_code: data?.postal_code ?? "",
        coordinates: {
          lng: data?.coordinates?.lng ?? "",
          lat: data?.coordinates?.lat ?? "",
        },
        address_type: data?.address_type ?? 0,
      });
      
      await address.save();
      return address
    } catch (error) {
      console.log("Create Address Error", error)
    }

    return address;
  }

  static async createItinerary(addresses, tour) {
    let start_point = null;
    let end_point = null;
    let stops = [];

    for (const address of addresses) {
      const addressObject = {
        street_1: address.street_1 ?? "",
        street_2: address.street_2 ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        country: address.country ?? "",
        postal_code: address.postal_code ?? "",
        coordinates: {
          lat: address.coordinates.lat,
          lng: address.coordinates.lng,
        },
        address_type: address.address_type
      };

      if (address.address_type === 0) {
        start_point = addressObject;
      } else if (address.address_type === 1) {
        end_point = addressObject;
      } else if (address.address_type === 2) {
        stops.push(addressObject);
      }
    }

    const itinerary = new Itinerary({
      tour: new mongoose.Types.ObjectId(tour.id),
      agency: new mongoose.Types.ObjectId(tour.agency.id),
      start_point: start_point,
      end_point: end_point,
      stops: stops,
    });

    await itinerary.save();
    return itinerary;
  }

  static async addressPayload(data) {
    
    return {
      street_1: data?.street_1?.long_name ?? "",
      street_2: data?.street_2?.long_name ?? "",
      city: data?.city?.long_name ?? "",
      state: data?.state?.long_name ?? "",
      country: data?.country?.long_name ?? "",
      postal_code: data?.postal_code?.long_name ?? "",
      coordinates: {
        lng: data?.coordinates.lng ?? "",
        lat: data?.coordinates.lat ?? "",
      },
      address_type: data?.address_type ?? 1,
    }
  }
}


module.exports = TourHelper;
