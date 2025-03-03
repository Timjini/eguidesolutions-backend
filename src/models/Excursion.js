const mongoose = require('../db');

const excursionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  include: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  timing: {
    type: String,
    default: ''
  },
  title_en: {
    type: String,
    required: true
  },
  title_pl: {
    type: String,
    required: true
  },
  content_en: {
    type: String,
    required: true
  },
  content_pl: {
    type: String,
    required: true
  },
  highlights_en: {
    type: String,
    default: ''
  },
  highlights_pl: {
    type: String,
    default: ''
  }
});

const Excursion = mongoose.model('Excursion', excursionSchema);

module.exports = Excursion;
