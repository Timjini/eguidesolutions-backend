const mongoose = require('../db');

const jobLogSchema = new mongoose.Schema({
  jobName: { type: String, required: true },
  executionTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'error'], required: true },
  errorMessage: { type: String, default: '' },
  data: { type: Array, default: [] },
});

const JobLog = mongoose.model('JobLog', jobLogSchema);

module.exports = JobLog;
