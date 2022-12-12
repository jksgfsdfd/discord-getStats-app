const express = require("express");
const { getChannelDetails } = require("../controllers/channelController");
const channelRouter = express.Router();

channelRouter.route("/:id").get(getChannelDetails);
channelRouter.route("/:id/messages/count");

module.exports = channelRouter;
