const mongoose = require("mongoose");

const advertismentSchema = new mongoose.Schema(
  {
    msgId: {
      type: String,
      required: true,
    },
    adId: {
      type: String,
      required: false,
    },
    clickedUsers: {
      type: [String],
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const advertismentModel = mongoose.model("Advertisment", advertismentSchema);

module.exports = advertismentModel;
