const Address = require('../models/Address');
const Itinerary = require('../models/Itinerary');

class TourHelper {
  static async createAddress(data) {
    console.log("ADDRESS DATA", data)
    const address = new Address({
      street_1: data.street_1,
      street_2: data.street_2,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      coordinates: {
        lng: data.coordinates.lng,
        lat: data.coordinates.lat,
      },
      address_type: data.address_type,
    });

    await address.save();
    console.log("Address is created!");
    return address;
  }

  static async createItinerary(addresses, tour) {
    let start_point = null;
    let end_point = null;
    let stops = [];

    for (const address of addresses) {
      if (address.address_type === 0) {
        start_point = { lng: address.coordinates.lng, lat: address.coordinates.lat };
      } else if (address.address_type === 1) {
        end_point = { lng: address.coordinates.lng, lat: address.coordinates.lat };
      } else if (address.address_type === 2) {
        stops.push({ lng: address.coordinates.lng, lat: address.coordinates.lat });
      }
    }

    const itinerary = new Itinerary({
      tour: tour.id,
      agency: tour.agency.id,
      start_point: start_point,
      end_point: end_point,
      stops: stops,
    });

    await itinerary.save();
    console.log("Itinerary is created!");
    return itinerary;
  }
}

module.exports = TourHelper;
