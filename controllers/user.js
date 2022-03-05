const { logger } = require('../lib');
const {
  user: UserModel,
  channel: ChannelModel,
  room: RoomModel,
} = require('../models');

/**
 * Join/Create new user
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const createUser = async(req, res, next) => {
  try {
    const {
      username,
    } = req.body;
    const payload = {
      username: username.trim().toLowerCase(),
    };
    const newUser = await UserModel.create(payload);
    res.status(201).send(newUser);
  } catch (error) {
    logger.error('[USER POST] Error while creating user ' + error);
    res.status(400).send('Error while creating user');
  }
};

/**
 * Get all users
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getAllUsers = async(req, res, next) => {
  try {
    const users = await UserModel.find();
    res.status(200).send(users);
  } catch (error) {
    logger.error('[USER GET] Error while getting users ' + error);
    res.status(400).send('Error while getting users');
  }
};

/**
 * Get user rooms and channels list
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getUserRoomsAndChannels = async(req, res, next) => {
  try {
    const { _id } = req.params;
    const channelQuery = {
      members: {
        $in: [_id],
      },
      status: 1,
    };
    const userChannels = await ChannelModel.find(channelQuery);
    const query = {
      $or: [{
        sender: _id,
      }, {
        receiver: _id,
      }],
      status: 1,
    };
    const userRooms = await RoomModel.find(query).populate('sender receiver').exec();
    return res.status(200).send({ userChannels, userRooms });
  } catch (error) {
    logger.error('[USER GET] Error while getting user channels and rooms ' + error);
    res.status(400).send('Error while getting user channels and rooms');
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserRoomsAndChannels,
};