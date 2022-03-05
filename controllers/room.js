const { logger } = require('../lib');
const {
  room: RoomModel,
  chat: ChatModel,
  user: UserModel,
} = require('../models');

/**
 * Create new room
 * @param {String} sender create room sender
 * @param {String} receiver create room reciver
 */

const createRoom = ({ sender, receiver }) => {
  return new Promise(async(resolve, reject) => {
    try {
      console.log('sender reciver >>>', sender, receiver);
      const payload = {
        sender,
        receiver,
      };
      const newRoom = await RoomModel.create(payload);
      const room = await RoomModel.findOne({ _id: newRoom._id }).populate('sender receiver').exec();
      console.log('return room >..', room);
      resolve(room);
    } catch (error) {
      logger.error('[ROOM POST] Error while creating room ' + error);
      reject('Error while creating room');
    }
  });
};

/**
 * Get users for room
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getUsersForRoom = async(req, res, next) => {
  try {
    const { _id } = req.params;
    const existRooms = await RoomModel.find({ sender: _id });
    let existUsers = [];
    if (existRooms && existRooms.length) {
      existUsers = existRooms.map((room) => room.receiver);
    }
    const query = {
      _id: {
        $nin: existUsers,
      }
    };
    const users = await UserModel.find(query);
    res.status(200).send(users);
  } catch (error) {
    logger.error('[ROOM GET] Error while getting uers ' + error);
    res.status(400).send('Error while getting users');
  }
};

module.exports = {
  createRoom,
  getUsersForRoom,
};