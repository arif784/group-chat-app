const { logger } = require('../lib');
const {
  user: UserModel,
  channel: ChannelModel,
  room: RoomModel,
} = require('../models');

/**
 * Get exist user
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
*/

const getExistUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = username.trim().toLowerCase();
    const existUser = await UserModel.findOne({ username: user });
    if (existUser) {
      return res.status(200).send(existUser);
    }
    next();
  } catch (error) {
    logger.error('[USER GET] Error while getting user details ' + error);
    res.status(400).send('Error while getting user details');
  }
};

module.exports = {
  getExistUser,
};