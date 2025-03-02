const mongoose = require('mongoose');

const errorLogsSchema = new mongoose.Schema({
  error_message: { type: String, required: true },
  stack_trace: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const ErrorLogs = mongoose.model('ErrorLogs', errorLogsSchema);

module.exports = ErrorLogs;