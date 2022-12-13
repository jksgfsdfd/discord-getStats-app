const express = require("express");
const { VerifyDiscordRequest } = require("../utils");
require("express-async-errors");
const interactionsRouter = express.Router();

interactionsRouter.use(
  express.json({
    verify: VerifyDiscordRequest(process.env.DISCORD_APP_PUBLIC_KEY),
  })
);

//interactionsRouter.route("/").post(interactionsController);

module.exports = interactionsRouter;
