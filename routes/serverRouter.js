const express = require("express");
const serverRouter = express.Router();

serverRouter.route("/getUserPresence").get();

module.exports = serverRouter;
