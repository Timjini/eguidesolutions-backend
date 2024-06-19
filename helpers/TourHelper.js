function createItinerary(data, tour) {
  const itinerary = new Itinerary({
    tour_id: data.tour_id,
    tour: data.tour,
    address: data.address,
  });

  itinerary.save();
  console.log("Itinerary created successfully");

  return itinerary;
}
