const ProcessToursData = require("../../services/ExcursionsService");
const Excursion = require("../../models/Excursion");
const { excursions } = require('../../services/ExcursionsService');
const { serializeExcursions } = require("../../serializers/v3/excursionsSerializer");

class publicController {
  static async index(req, res) {
    try {
      const allExcursions = await excursions(); 
      const serializedExcursions = serializeExcursions(allExcursions);
      return res.status(200).json({
        message: 'excursions fetched successfully',
        data: serializedExcursions
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
      return res.status(500).json({ error: 'Error uploading CSV' });
    }
  }
}

module.exports = publicController;