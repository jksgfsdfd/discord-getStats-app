const {
  getTextandVoiceChannels,
  getGuildDetails,
  findTotalUsersAndOnlineUsers,
  getGuildMembers,
  viewMessagesInAChannel,
  searchGuildMember,
  getChannelsSortedOnMessageCount,
} = require("../functionalities");

const moment = require("moment");
require("express-async-errors");

async function getServerDetails(req, res) {
  const serverData = await getGuildDetails(req.params.id);
  const { id, name } = serverData;
  res.status(200).json({ id, name });
}

async function piggie_stats(req, res) {
  const guildId = req.params.id;

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
        console.log(message);
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
  res.status(200).json(newData);
}
//piggie_stats("1044887003868713010");

async function piggie_user_stats(req, res) {
  const guildId = req.params.id;
  const username = req.body.username;
  const memberData = await searchGuildMember(guildId, username);
  const member = memberData[0];
  const userId = member.user.id;
  const userName = member.user.username;
  const joined_at = moment(member["joined_at"]).format("D MMM YYYY");
  console.log(joined_at);

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
      usersMessages.push(message);
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

  const averageMessagePerDay = (monthlyMessageCount / 30).toFixed(2);
  const newData = {};
  newData.userId = userId;
  newData.username = userName;
  newData.joined_at = joined_at;
  newData.averageMessagePerDay = averageMessagePerDay;
  newData.latesMessages = latest5;
  newData.activeChannels = activeChannels;
  //console.log(newData);
  res.status(200).json(newData);
}

//piggie_user_stats("1044887003868713010", "ronmaa");

async function piggie_server_stats(req, res) {
  const guildId = req.params.id;
  const timeframe = req.query.timeframe ? req.query.timeframe : "30";
  //sorted list of channels with avg message perday , timeframe = 1month
  const data = await getChannelsSortedOnMessageCount(guildId, timeframe);
  data.forEach((element) => {
    delete element["messageCount"];
  });

  //console.log(data);
  res.status(200).json({ channelsData: data });
}

async function piggie_channel_stats(req, res) {
  const guildId = req.params.id;
  const channelName = req.query.channel;
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

  const timeInDays = 30;
  const compareTime = moment().subtract(timeInDays, "d");
  let channelMessageCount = 0;
  const messagesOfChannel = await viewMessagesInAChannel(neededChannel.id);
  for (let message of messagesOfChannel) {
    if (compareTime.isBefore(message.timestamp)) {
      channelMessageCount++;
    }
  }

  const averageMessagePerDay = (channelMessageCount / timeInDays).toFixed(2);
  res.status(200).json({
    id: neededChannel.id,
    name: neededChannel.name,
    averageMessagePerDay: averageMessagePerDay,
  });
}

//piggie_server_stats("1044887003868713010");

module.exports = {
  piggie_stats,
  getServerDetails,
  piggie_user_stats,
  piggie_server_stats,
  piggie_channel_stats,
};
