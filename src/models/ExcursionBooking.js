const mongoose = require("../db");

const excursionBookingSchema = new mongoose.Schema(
  {
    excursion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Excursion",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "archived"],
      default: "pending",
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    numberOfPeople: {
      type: Number,
      default: 1,
    },
    note: {
      type: String,
      default: "",
    },
    desiredDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ExcursionBooking = mongoose.model(
  "ExcursionBooking",
  excursionBookingSchema
);

module.exports = ExcursionBooking;
