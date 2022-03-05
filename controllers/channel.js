const { logger } = require('../lib');

const {
  channel: ChannelModel,
  chat: ChatModel,
  user: UserModel,
  channelRoom: ChannelRoomModel
} = require('../models');

/**
 * Create new channel
 * @param {String} name Channel Name
 * @param {String} user Channel creator
 */

const createChannel = ({ name, user }) => {
  return new Promise(async(resolve, reject) => {
    try {
      const payload = {
        name: name.trim().toLowerCase(),
        owner: user,
        members: [user],
      };
      const newChannel = await ChannelModel.create(payload);
      const channel = await ChannelModel.findById(newChannel._id).populate('members').exec();
      resolve(channel);
    } catch (error) {
      logger.error('[CHANNEL] Error while creating channel ' + error);
      reject('Error while creating channel');
    }
  });
};

/**
 * Get channel chat
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getChannelChats = async(req, res, next) => {
  try {
    const { _id } = req.params;
    const chats = await ChatModel.find({ channel: _id }).populate('sender channel').exec();
    res.status(200).send(chats);
  } catch (error) {
    logger.error('[Channel GET] error while getting channel chats ' + error);
    res.status(400).send('Error while getting channel chats');
  }
};

/**
 * Get channel users
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getChannelUsers = async(req, res, next) => {
  try {
    const { _id } = req.params;
    const users = await ChannelModel.findOne({ _id }).populate('members').exec();
    res.status(200).send(users);
  } catch (error) {
    logger.error('[Channel GET] error while getting channel users ' + error);
    res.status(400).send('Error while getting channel users');
  }
};

/**
 * Add channel users
 * @param {String} channelId Channel Id
 * @param {Array} users channel members
 */

const addChannelUsers = ({ channelId, users }) => {
  return new Promise(async(resolve, reject) => {
    try {
      console.log('channelId >>>', channelId);
      console.log('users >>>', users);
      const payload = {
        $push: {
          members: {
            $each: users,
          },
        },
      }
      const updatedChannel = await ChannelModel.findByIdAndUpdate(channelId, payload, { new: true });
      resolve(updatedChannel);
    } catch (error) {
      logger.error('[Channel PUT] error while adding channel users ' + error);
      reject('Error while adding channel users');
    }
  });
};

/**
 * get users for channel
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getUsersForChannel = async(req, res, next) => {
  try {
    const { _id } = req.params;
    let query = {};
    const existChannel = await ChannelModel.findOne({ _id });
    if (existChannel) {
      query = {
        _id: {
          $nin: existChannel.users,
        },
      };
    }
    const users = await UserModel.find(query);
    res.status(200).send(users);
  } catch (error) {
    logger.error('[CHANNEL GET] Error while getting users ' + error);
    res.status(400).send('Error while getting users');
  }
};

module.exports = {
  createChannel,
  getChannelChats,
  getChannelUsers,
  addChannelUsers,
  getUsersForChannel,
};