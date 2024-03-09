class TourSerializer {
    static serialize(tour){
        return {
            _id: tour._id,
            description: tour.description,
            image: `uploads/${tour.photo}`,
            starting_date: tour.starting_date,
            ending_date: tour.ending_date,
        };
    }

    static serializeMany(tours) {
        return tours.map(this.serialize);
      }
}

module.exports = TourSerializer;
