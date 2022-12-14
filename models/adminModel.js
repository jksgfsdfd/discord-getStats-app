const mongoose = require("mongoose");
const validatorJS = require("validator");

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  DMChannelId: {
    type: String,
  },
  latestSeenAdTime: { type: Date, default: "2000" },
});

const adminModel = mongoose.model("Admins", adminSchema);

module.exports = adminModel;
