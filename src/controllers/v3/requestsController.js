const ProcessToursData = require("../../services/ExcursionsService");
const Excursion = require("../../models/Excursion");
const sendExcursionBookingRequestEmail = require("../../mailer/sendExcursionBookingRequestEmail");
const sendBookingConfirmationEmail = require("../../mailer/sendBookingConfirmationEmail");


class requestsController {
  static async save(req, res) {
    try {
      const data = req.body;
      if (!req.body) {
        return res.status(400).json({ error: "No Data provided" });
      }

      const excursion = await Excursion.findOne({_id: req.body.tourId});
      if (!excursion) {
        return res.status(404).send({ message: 'Excursion not found' });
      }

      const result = await ProcessToursData.saveExcursionRequest(data);

      await sendExcursionBookingRequestEmail(data);
      await sendBookingConfirmationEmail(data);

      return res.status(200).json({
        status: "success",
        message: "data successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: `Error uploading Json ${err}` });
    }
  }
}

module.exports = requestsController;
