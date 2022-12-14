const mongoose = require("mongoose");
const validatorJS = require("validator");

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
      validate: {
        validator: function (inp) {
          return validatorJS.isURL(inp);
        },
      },
    },
    CTAText: {
      type: String,
      required: true,
    },
    CTAUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (inp) {
          return validatorJS.isURL(inp);
        },
      },
    },
    keywords: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const adModel = mongoose.model("Ads", adSchema);

module.exports = adModel;
