const Excursion = require("../models/Excursion");
const ExcursionBooking = require("../models/ExcursionBooking");

function save(data){
    const mappedData = data.map(item => ({
        type: item.type,
        city: item.city,
        // coverImages: item?.coverImages,
        imageUrls: item?.imageUrls,
        include: item.include,
        duration: item.duration,
        price: item.price,
        timing: item.timing,
        title_en: item.title_en,
        title_pl: item.title_pl,
        content_en: item.content_en,
        content_pl: item.content_pl,
        highlights_en: item.highlights_en,
        highlights_pl: item.highlights_pl,
        description_en: item.description_en,
        description_pl: item.description_pl
      }));
    const result = Excursion.insertMany(mappedData); 
    return result;
}

function saveExcursionRequest(data){
    const mappedData = {
        excursion: data.tourId,
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        numberOfPeople: data.people,
        desiredDate: data.date,
        note: data.message || `Booking request for ${data.tourName}`
      };
    const result = ExcursionBooking.insertMany(mappedData); 
    return result;
}

function excursions(filter = {}){
    // const allExcursions = Excursion.find({ include: 'breakfast' });
    const allExcursions = Excursion.find(filter);
    return allExcursions;
}


module.exports = { excursions, save, saveExcursionRequest };
