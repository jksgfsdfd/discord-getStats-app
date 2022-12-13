const {
  InteractionType,
  InteractionResponseType,
} = require("discord-interactions");
const { DiscordRequest } = require("../utils");
const { piggie_stats } = require("./serverController");

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

      const guildId = req.body.guild_id;
      const data = await piggie_stats(guildId);
      const replyData = JSON.stringify(data, null, 4);
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
