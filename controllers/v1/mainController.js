const ErrorLogs = require("../../models/ErrorLogs");

async function errorLogs(req, res) {
  const { errorMessage, stackTrace } = req.body;

  if (!errorMessage || !stackTrace) {
    return res.status(400).json({ message: "Invalid error data" });
  }

  try {
    const errorLog = new ErrorLogs({ errorMessage, stackTrace });
    res.status(200).json({ message: "Error logged successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to log error" });
  }
}

module.exports = {
  errorLogs
}