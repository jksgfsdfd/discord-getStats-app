const {
  InteractionType,
  InteractionResponseType,
} = require("discord-interactions");
const { DiscordRequest } = require("../utils");
const { piggie_stats, piggie_server_stats } = require("./serverController");
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

      const interactionToken = req.body.token;
      const replyEndpoint = `/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`;

      const neededFields = {};
      neededFields.totalMemberCount = newData.totalMemberCount;
      neededFields.onlineMemberCount = newData.onlineMemberCount;
      neededFields.activeMemberCount = newData.activeMemberCount;
      const activeMembers = [];
      for (
        let i = newData.activeMembers.length - 1;
        i >= 0 && i > newData.activeMembers.length - 6;
        i--
      ) {
        activeMembers.push(newData.activeMembers[i].username);
      }
      neededFields.activeMembers = activeMembers.join(" ");
      neededFields.averageMessagePerDay = newData.averageMessagePerDay;
      const embedFields = [];
      Object.keys(neededFields).forEach((field) => {
        embedFields.push({ name: field, value: neededFields[field] });
      });

      const messageObject = {};
      messageObject.embeds = [
        {
          type: "rich",
          title: "",
          description: "",
          color: 0x00ffff,
          fields: embedFields,
        },
      ];

      console.log(messageObject);
      await DiscordRequest(replyEndpoint, {
        method: "PATCH",
        body: messageObject,
      });
      return;
    } else if (name === "piggi_server_stats") {
      await res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
      res.replySent = true;

      const guildId = req.body.guild_id;
      const newData = await piggie_server_stats(guildId, null);

      const interactionToken = req.body.token;
      const replyEndpoint = `/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`;

      const neededFields1 = {};

      neededFields1.newlyJoinedUserCount = newData.userJoinData.joinedUserCount;
      const newlyJoinedUsers = [];
      for (
        let i = newData.userJoinData.joinedUsers.length - 1;
        i >= 0 && i > newData.userJoinData.joinedUsers.length - 11;
        i--
      ) {
        newlyJoinedUsers.push(newData.userJoinData.joinedUsers[i].username);
      }

      neededFields1.newlyJoinedUsers = newlyJoinedUsers.join(" ");

      const channelWithAvg = [];
      for (
        let i = newData.channelsData.length - 1;
        i >= 0 && i > newData.channelsData.length - 6;
        i--
      ) {
        channelWithAvg.push(
          `${newData.channelsData[i].channelName} : ${newData.channelsData[i].averageMessagePerDay} messages/day`
        );
      }
      neededFields1.channelData = channelWithAvg.join("\n");
      const embedFields1 = [];
      Object.keys(neededFields1).forEach((field) => {
        embedFields1.push({ name: field, value: neededFields1[field] });
      });

      const messageObject1 = {};
      messageObject1.embeds = [
        {
          type: "rich",
          title: "",
          description: "",
          color: 0x00ffff,
          fields: embedFields1,
        },
      ];

      console.log(messageObject1);
      await DiscordRequest(replyEndpoint, {
        method: "PATCH",
        body: messageObject1,
      });

      return;
    }
  }
}

module.exports = interactionController;
