const {
  InteractionType,
  InteractionResponseType,
} = require("discord-interactions");
const { DiscordRequest } = require("../utils");
const { piggie_stats } = require("./serverController");
require("express-async-errors");

async function interactionController(req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === "piggi_stats") {
      //acknoledge the interaction first itself since the webhook will only wait for 3secs to get the first reply
      await res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      console.log("Entered piggi stats");
      res.replySent = true;
      const guildId = req.body.guild_id;
      const newData = await piggie_stats(guildId);
      console.log(newData);
      const replyData = JSON.stringify(newData, null, 4);
      console.log(replyData);
      const interactionToken = req.body.token;
      const replyEndpoint = `/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`;
      const messageObject = {};
      messageObject.content = replyData;
      await DiscordRequest(replyEndpoint, {
        method: "PATCH",
        body: messageObject,
      });
      return;
    }
  }
}

module.exports = interactionController;
