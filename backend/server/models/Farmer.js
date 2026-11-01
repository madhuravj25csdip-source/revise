const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    fullName:          { type: String, required: true, trim: true },
    mobile:            { type: String, required: true, unique: true, trim: true },
    email:             { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash:      { type: String, required: true },
    village:           { type: String, required: true, trim: true },
    district:          { type: String, required: true, trim: true },
    state:             { type: String, required: true },
    preferredLanguage: { type: String, default: "en" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);