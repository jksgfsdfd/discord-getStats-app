const { InteractionResponseFlags } = require("discord-interactions");
const { DiscordRequest } = require("../utils");

async function errorHandler(err, req, res, next) {
  const statusCode = res.status ? res.status : 500;
  res.status = statusCode;

  if (res.replySent) {
    console.error(err);
    await DiscordRequest(res.replyEndpoint, {
      method: "PATCH",
      body: {
        content: "Sorry there was some error.Try later",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
    return;
  }
  console.error(err);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "dev" ? err.stack : null,
  });
}

module.exports = errorHandler;
