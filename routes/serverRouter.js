const express = require("express");
const {
  getServerDetails,
  piggie_stats,
  piggie_user_stats,
  piggie_server_stats,
} = require("../controllers/serverController");
const serverRouter = express.Router();

serverRouter.use(express.urlencoded({ extended: false }));

serverRouter.route("/:id").get(getServerDetails);
serverRouter.route("/:id/piggie-stats").get(piggie_stats);
serverRouter.route("/:id/piggie-user-stats").get(piggie_user_stats);
serverRouter.route("/:id/piggie-server-stats").get(piggie_server_stats);

module.exports = serverRouter;
