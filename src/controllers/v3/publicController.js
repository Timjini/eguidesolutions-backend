const ProcessToursData = require("../../services/ExcursionsService");
const Excursion = require("../../models/Excursion");
const { excursions } = require('../../services/ExcursionsService');
const { serializeExcursions } = require("../../serializers/v3/excursionsSerializer");

class publicController {
  static async index(req, res) {
    try {
      const { type, city, include, duration, price, _id, coverImage, imageUrls} = req.query;
      console.log("Received query params:", { type, city, include, duration, price, _id, coverImage, imageUrls });

      const filter = {};
      if (type) filter.type = type;
      if (city) filter.city = city;
      if (include) filter.include = include;
      if (duration) filter.duration = duration;
      if (price) filter.price = price;
      if (_id) filter._id = _id;
      if (coverImage) filter.coverImage = coverImage;
      if(imageUrls) filter.imageUrls = imageUrls;
  
      const allExcursions = await excursions(filter);
      
      const excursionsWithSimilar = await Excursion.find({
        city: allExcursions[0]?.city,
      })
      .limit(3)
      .select('_id title_en title_pl duration price imageUrls')
      .lean();
      const serializedExcursions = serializeExcursions(allExcursions);
      return res.status(200).json({
        message: 'excursions fetched successfully',
        data: serializedExcursions,
        excursionsWithSimilar: excursionsWithSimilar
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ "error": "An error occurred" });
    }
  }

  static async save(req, res) {
    try {
      const data = req.body;
      if (!req.body) {
        return res.status(400).json({ error: 'No Data provided' });
      }

      const result = await ProcessToursData.save(data);

      return res.status(200).json({
        message: 'data successfully',
        data: result
      });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: `Error uploading Json ${err}` });
    }
  }
}

module.exports = publicController;