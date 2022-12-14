const {
  getTextandVoiceChannels,
  getGuildDetails,
  findTotalUsersAndOnlineUsers,
  getGuildMembers,
  viewMessagesInAChannel,
  searchGuildMember,
  getChannelsSortedOnMessageCount,
  getUsersJoinedWithin,
  getGuildMember,
} = require("../functionalities");

const moment = require("moment");
require("express-async-errors");

async function getServerDetails(req, res) {
  const serverData = await getGuildDetails(req.params.id);
  const { id, name } = serverData;
  res.status(200).json({ id, name });
}

async function piggie_stats_controller(req, res) {
  const guildId = req.params.id;
  const newData = await piggie_stats(guildId);
  res.status(200).json(newData);
}

async function piggie_stats(guildId) {
  //const guildId = req.params.id;

  //guild members
  const guildMembers = await getGuildMembers(guildId);
  // console.log(guildMembers);
  const minGuildMembers = guildMembers.map((member) => {
    const joined_at = moment(member["joined_at"]).format("D MMM YYYY");
    const id = member.user.id;
    const username = member.user.username;
    return { id, username, joined_at };
  });
  // console.log(minGuildMembers);

  // online and total users
  const userCount = await findTotalUsersAndOnlineUsers(guildId);
  // console.log(userCount);

  //active users
  // timeframe = 1 week
  // find all channels , get all their mesages
  let compareTime = moment().subtract(7, "d");
  const channels = await getTextandVoiceChannels(guildId);
  let activeUserCount = 0;
  let activeUsers = [];
  let checkNextUser = false;
  for (let user of minGuildMembers) {
    checkNextUser = false;
    for (let chan of channels) {
      const messagesOfChannel = await viewMessagesInAChannel(chan.id);
      const thisWeekMessages = messagesOfChannel.filter((message) => {
        if (compareTime.isBefore(message.timestamp)) {
          return true;
        } else {
          return false;
        }
      });
      for (let msg of thisWeekMessages) {
        if (msg.author.id === user.id) {
          activeUserCount++;
          activeUsers.push(user);
          checkNextUser = true;
          break;
        }
      }
      if (checkNextUser) {
        break;
      }
    }
  }

  // console.log(activeUserCount);
  // console.log(activeUsers);

  //find avg message perday
  //timeframe = 1month
  compareTime = moment().subtract(30, "d");
  let monthlyMessageCount = 0;
  for (let channel of channels) {
    const messagesOfChannel = await viewMessagesInAChannel(channel.id);
    const thisMonthMessages = messagesOfChannel.filter((message) => {
      if (compareTime.isBefore(message.timestamp)) {
        //console.log(message);
        return true;
      } else {
        return false;
      }
    });
    monthlyMessageCount += thisMonthMessages.length;
  }

  const avgMessagePerDay = (monthlyMessageCount / 30).toFixed(2);

  const newData = {};
  newData.serverMembers = minGuildMembers;
  newData.totalMemberCount = userCount.totalUsers;
  newData.onlineMemberCount = userCount.onlineUsers;
  newData.activeMemberCount = activeUserCount;
  newData.activeMembers = activeUsers;
  newData.averageMessagePerDay = avgMessagePerDay;
  //res.status(200).json(newData);
  return newData;
}
//piggie_stats("1044887003868713010");
async function piggie_user_stats_controller(req, res) {
  const guildId = req.params.id;
  const username = req.body.username;
  const memberData = await searchGuildMember(guildId, username);
  if (memberData.length === 0) {
    res.status(404);
    throw new Error("No such user found");
  }
  const member = memberData[0];
  const userId = member.user.id;
  const newData = await piggie_user_stats(guildId, userId);
  res.status(200).json(newData);
}

async function piggie_user_stats(guildId, userId) {
  const member = await getGuildMember(guildId, userId);
  const userName = member.user.username;
  const joined_at = moment(member["joined_at"]).format("D MMM YYYY");
  //console.log(joined_at);

  //last 5 messages,active in channels , average msg/day
  const compareTimeActive = moment().subtract(7, "d");
  const compareTimeAvg = moment().subtract(30, "d");
  const usersMessages = [];
  const activeChannels = [];
  let monthlyMessageCount = 0;
  const channels = await getTextandVoiceChannels(guildId);
  for (let channel of channels) {
    const messagesOfChannel = await viewMessagesInAChannel(channel.id);
    for (let message of messagesOfChannel) {
      if (message.author.id != userId) {
        continue;
      }
      const minMessage = {};
      minMessage.channel = channel.name;
      minMessage.timestamp = message.timestamp;
      minMessage.content = message.content;
      if (message.attachments.length) {
        minMessage.attachments = message.attachments;
      }
      if (message.embeds.length) {
        minMessage.embeds = message.embeds;
      }
      if (message.mentions.length) {
        minMessage.mentions = message.mentions;
      }
      usersMessages.push(minMessage);
      if (compareTimeAvg.isBefore(message.timestamp)) {
        monthlyMessageCount++;
      }
      if (compareTimeActive.isBefore(message.timestamp)) {
        if (!activeChannels.includes(channel.name)) {
          activeChannels.push(channel.name);
        }
      }
    }
  }

  usersMessages.sort((a, b) => {
    return a.timestamp < b.timestamp ? -1 : 1;
  });

  const latest5 =
    usersMessages.length < 6 ? usersMessages : usersMessages.slice(-5);
  latest5.forEach((message) => {
    message.timestamp = moment(message.timestamp).format("lll");
  });

  const averageMessagePerDay = (monthlyMessageCount / 30).toFixed(2);
  const newData = {};
  newData.userId = userId;
  newData.username = userName;
  newData.joined_at = joined_at;
  newData.averageMessagePerDay = averageMessagePerDay;
  newData.latestMessages = latest5;
  newData.activeChannels = activeChannels;
  //console.log(newData);
  return newData;
}

//piggie_user_stats("1044887003868713010", "ronmaa");

async function piggie_server_stats_controller(req, res) {
  const guildId = req.params.id;
  const inpTimeframe = req.query.timeframe;

  const newData = await piggie_server_stats(guildId, inpTimeframe);

  res.status(200).json(newData);
}

async function piggie_server_stats(guildId, inpTimeframe) {
  //const guildId = req.params.id;
  //const reqTimeFrame = req.query.timeframe;
  const reqTimeFrame = inpTimeframe;
  if (reqTimeFrame) {
    if (!Number.isInteger(+reqTimeFrame) || reqTimeFrame[0] == "-") {
      res.status(400);
      throw new Error("Enter a valid amount of days for timeframe");
    }
  }
  const timeframe = reqTimeFrame ? reqTimeFrame : "30";
  //sorted list of channels with avg message perday , timeframe = 1month
  const channelsData = await getChannelsSortedOnMessageCount(
    guildId,
    timeframe
  );
  channelsData.forEach((element) => {
    delete element["messageCount"];
  });
  //console.log(data);
  const usersJoinData = await getUsersJoinedWithin(guildId, timeframe);

  return { channelsData: channelsData, userJoinData: usersJoinData };
}

async function piggie_channel_stats_controller(req, res) {
  const guildId = req.params.id;
  const channelName = req.query.channel;
  if (!channelName) {
    res.status(400);
    throw new Error("Provide a channel name");
  }

  const channels = await getTextandVoiceChannels(guildId);
  let neededChannel;
  for (let channel of channels) {
    if (channel.name === channelName) {
      neededChannel = channel;
      break;
    }
  }
  if (!neededChannel) {
    res.status(404);
    throw new Error("No such channel found");
  }

  const reqTimeFrame = req.query.timeframe;

  const newData = await piggie_channel_stats(
    guildId,
    neededChannel.id,
    reqTimeFrame
  );

  res.status(200).json(newData);
}

async function piggie_channel_stats(guildId, channelId, inpTimeframe) {
  const channels = await getTextandVoiceChannels(guildId);
  let neededChannel;
  for (let channel of channels) {
    if (channel.id === channelId) {
      neededChannel = channel;
      break;
    }
  }
  if (!neededChannel) {
    res.status(404);
    throw new Error("No such channel found");
  }

  const reqTimeFrame = inpTimeframe;
  if (reqTimeFrame) {
    if (!Number.isInteger(+reqTimeFrame) || reqTimeFrame[0] == "-") {
      res.status(400);
      throw new Error("Enter a valid amount of days for timeframe");
    }
  }
  const timeInDays = reqTimeFrame ? Number(reqTimeFrame) : 30;
  const compareTime = moment().subtract(timeInDays, "d");
  let channelMessageCount = 0;
  const messagesOfChannel = await viewMessagesInAChannel(neededChannel.id);
  const activeUserData = {};
  for (let message of messagesOfChannel) {
    if (compareTime.isBefore(message.timestamp)) {
      channelMessageCount++;
      const author = message.author;
      if (activeUserData.hasOwnProperty(author.id)) {
        activeUserData[author.id]["activeMessageCount"]++;
      } else {
        activeUserData[author.id] = {
          username: author.username,
          activeMessageCount: 1,
        };
      }
    }
  }

  const activeUsersList = [];
  Object.keys(activeUserData).forEach((user) => {
    activeUsersList.push(activeUserData[user]);
  });

  activeUsersList.sort((a, b) => {
    return a.activeMessageCount - b.activeMessageCount;
  });

  const neededActiveUsers =
    activeUsersList.length < 6 ? activeUsersList : activeUsersList.slice(-5);

  const averageMessagePerDay = (channelMessageCount / timeInDays).toFixed(2);

  return {
    id: neededChannel.id,
    name: neededChannel.name,
    averageMessagePerDay: averageMessagePerDay,
    activeUsers: neededActiveUsers,
  };
}

//piggie_server_stats("1044887003868713010");

module.exports = {
  piggie_stats,
  piggie_stats_controller,
  getServerDetails,
  piggie_user_stats,
  piggie_user_stats_controller,
  piggie_server_stats,
  piggie_server_stats_controller,
  piggie_channel_stats,
  piggie_channel_stats_controller,
};
