const PrcessCsv = require("../../utils/processCsv");

class publicController {
  static async index(req, res) {
    try {
      return res.status(200).json({ "message": "get it" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ "error": "An error occurred" });
    }
  }

  static async readCsv(req, res) {
    try {
      console.log("Uploaded file:", req.file);
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await PrcessCsv.upload(req.file);

      return res.status(200).json({
        message: 'CSV uploaded successfully',
        data: result
      });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error uploading CSV' });
    }
  }
}

module.exports = publicController;
