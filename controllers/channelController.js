const { getChannel } = require("../functionalities");

async function getChannelDetails(req, res) {
  const channelData = await getChannel(req.params.id);
  const { id, name } = channelData;
  res.status(200).json({ id, name });
}

async function getMessageCount(req, res) {}

module.exports = {
  getChannelDetails,
};
