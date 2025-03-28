
function serializeExcursion(excursion) {
    return {
      _id: excursion._id,
      type: excursion.type,
      city: excursion.city,
      include: excursion.include,
      duration: excursion.duration,
      price: excursion.price,
      timing: excursion.timing,
      title_en: excursion.title_en,
      title_pl: excursion.title_pl,
      content_en: excursion.content_en,
      content_pl: excursion.content_pl,
      highlights_en: excursion.highlights_en,
      highlights_pl: excursion.highlights_pl,
      imageUrls: excursion.imageUrls,
      description_en: excursion.description_en,
      description_pl: excursion.description_pl
    };
  }
  
  function serializeExcursions(excursions) {
    return excursions.map(serializeExcursion);
  }
  
  module.exports = { serializeExcursion, serializeExcursions };
  