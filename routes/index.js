const express = require('express');
const {
  user: userController,
  channel: channelController,
  room: roomController,
  chat: chatController,
} = require('../controllers');
const {
  user: userMiddleware,
} = require('../middlewares');

const router = express.Router();
// User routes
router.post('/user/create', userMiddleware.getExistUser, userController.createUser);
router.get('/user/roomsAndChannels/:_id', userController.getUserRoomsAndChannels);

// Channel routes
router.get('/channel/chats/:_id', channelController.getChannelChats);
router.get('/channel/getUsers/:_id', channelController.getChannelUsers);
router.get('/channel/getAllUsers/:_id', channelController.getUsersForChannel);

//Room routes
router.get('/room/getAllUsers/:_id', roomController.getUsersForRoom);

//Chat routes
router.get('/chat/receiverChats/:_id', chatController.getDirectRoomChats);

module.exports = router;