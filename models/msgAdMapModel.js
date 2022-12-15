const mongoose = require("mongoose");

const msgAdMapSchema = new mongoose.Schema({
  msgId: {
    type: String,
    required: true,
  },
  adId: {
    type: String,
    required: false,
  },
});

const msgAdMapModel = mongoose.model("MsgAdMap", msgAdMapSchema);

module.exports = msgAdMapModel;
