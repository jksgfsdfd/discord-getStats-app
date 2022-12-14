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
  latestSeenAdTime: { type: Date, default: Date("2000") },
});

const adminModel = mongoose.model("Admins", adSchema);

module.exports = adminModel;
