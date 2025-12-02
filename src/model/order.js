const { Schema, model } = require("mongoose");

const Order = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    regionFrom: { type: String, required: true },
    regionTo: { type: String, required: true },
    countryFrom: { type: String, required: true },
    countryTo: { type: String, required: true },

    phone_number: { type: String, required: true },

    weight: { type: Number, required: true },
    cargoUnit: { type: String, required: false }, // kg/ton etc

    pickupDate: { type: String, required: true }, // YYYY-MM-DD
    pickupTime: { type: String, required: false }, // HH:mm

    vehicleType: { type: String, required: true }, // car/truck etc
    vehicleBodyType: { type: String, required: false }, // sedan/van etc

    paymentType: { type: String, required: false }, // cash/card
    paymentAmount: { type: Number, required: false },
    paymentCurrency: { type: String, required: false }, // usd/uzs etc
    messegeId: { type: Number },
    capacity: { type: String },
    status: { type: String, default: "1" },
    username: String,
    user_id: String,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = model("Order", Order);
