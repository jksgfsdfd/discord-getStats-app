const mongoose = require("mongoose");

const adUserClickSchema = new mongoose.Schema({
  adId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
});

const adUserClickModel = mongoose.model("AdUserClick", adUserClickSchema);

module.exports = adUserClickModel;
