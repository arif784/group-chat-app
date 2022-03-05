const { logger } = require('../lib');
const {
  chat: ChatModel,
} = require('../models');

/**
 * Create new chat
 * @param {String} sender Sender of the message
 * @param {String} receiver Receiver of the message
 * @param {String} message Message content
 * @param {String} room Direct message room
 * @param {String} channel Channel Id
 */

const createChat = ({ sender, receiver, message, room, channel }) => {
  return new Promise(async(resolve, reject) => {
    try {
      const payload = {
        sender,
        message,
      };
      if (room) {
        payload.room = room;
      }
      if (receiver) {
        payload.receiver = receiver;
      }
      if (channel) {
        payload.channel = channel;
      }
      const newChat = await ChatModel.create(payload);
      const chat = await ChatModel.findById(newChat._id).populate('sender receiver channel').exec();
      resolve(chat);
    } catch (error) {
      logger.error('[CHAT POST] Error while creating chat ' + error);
      reject('Error while creating chat');
    }
  });
};

/**
 * Get Chats
 * @param {String} _id receiver id
 */

const getChats = (_id) => {
  return new Promise(async(resolve, reject) => {
    try {
      const query = {
        room: _id,
      };
      const chats = await ChatModel.find(query).populate('sender receiver channel');
      resolve(chats);
    } catch (error) {
      logger.error('[CHAT GET] Error while getting chats' + error);
      reject('Error while getting chats');
    }
  });
};

/**
 * Get Receiver chats
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 */

const getDirectRoomChats = async(req, res, next) => {
  try {
    const { _id } = req.params;
    const chats = await getChats(_id);
    res.status(200).send(chats);
  } catch (error) {
    logger.error('[CHAT GET] Error while getting receiver chats' + error);
    res.status(400).send('Error while getting reciver chats');
  }
};

module.exports = {
  createChat,
  getDirectRoomChats,
  getChats,
};