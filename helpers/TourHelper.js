const Itinerary = require('../models/Itinerary');
const Address = require('../models/Address');

export const createAddress = (data) => {
  const address = new Address({
    street_1: data.street_1,
    street_2: data.street_2,
    city: data.city,
    state: data.state,
    country: data.country,
    postal_code: data.postal_code,
    coordinates: {
      lang: data.lang,
      lat: data.lat,
    },
    address_type: data.address_type,
  });

  address.save();
  console.log("Address is created!");

  return address;
};

export const createItinerary = (address, tour) => {
  const itinerary = new Itinerary({
    tour_id: tour.id,
    tour: data.tour,
    agency_id: tour.agency.id,
    address: address,
  });

  itinerary.save();
  console.log("Itinerary is created!");

  return itinerary;
};

