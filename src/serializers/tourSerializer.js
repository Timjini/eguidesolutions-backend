class TourSerializer {
  static serialize(tour) {
    return {
      _id: tour._id,
      id: tour.id,
      title: tour.title,
      description: tour.description,
      image: `/uploads/${tour.photo}` ?? "/uploads/1709835166036-44599960.jpg",
      starting_date: tour.starting_date,
      ending_date: tour.ending_date,
      favorite: tour.favorite ?? false,
    };
  }

  static serializeMany(tours) {
    return tours.map(this.serialize);
  }
}

module.exports = TourSerializer;
