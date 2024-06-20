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

export const createItinerary = (addresses, tour) => {
  let start_point = null;
  let end_point = null;
  let stops = [];

  addresses.forEach(address => {
    if (address.address_type === 0) {
      start_point = { lang: address.coordinates.lang, lat: address.coordinates.lat };
    } else if (address.address_type === 1) {
      end_point = { lang: address.coordinates.lang, lat: address.coordinates.lat };
    } else if (address.address_type === 2) {
      stops.push({ lang: address.coordinates.lang, lat: address.coordinates.lat });
    }
  });

  const itinerary = new Itinerary({
    tour: tour.id,
    agency: tour.agency.id,
    start_point: start_point,
    end_point: end_point,
    stops: stops,
  });

  itinerary.save();
  console.log("Itinerary is created!");

  return itinerary;
};
