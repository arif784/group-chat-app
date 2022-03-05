const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");
const path = require('path');
const {
  dbConnection,
  logger,
} = require('./lib');
const {
  room: roomController,
  channel: channelController,
  user: userController,
  chat: chatController,
} = require('./controllers');

const app = express();

const chatRoutes = require('./routes');

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', chatRoutes);

app.get('/chat', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public/chat.html'));
});


const httpServer = createServer(app);
const io = new Server(httpServer);
io.adapter(createAdapter());

setupWorker(io);

io.on("connection", (socket) => {
  logger.info('[SOCKET] connected');
  socket.on('create-channel', async(payload, cb) => {
    try {
      const channel = await channelController.createChannel(payload);
      socket.join(channel._id);
      cb(null, channel);
    } catch (error) {
      cb(error);
    }
  });
  socket.on('add-members', async(payload, cb) => {
    try {
      const channel = await channelController.addChannelUsers(payload);
      socket.broadcast.emit('notify-members', channel);
      cb(null);
    } catch (error) {
      cb(error);
    }
  });
  socket.on('member-ack', function(channelId) {
    socket.join(channelId);
  });
  socket.on('direct-join-req', async(payload, cb) => {
    try {
      const room = await roomController.createRoom(payload);
      console.log('room 1 >>>', room);
      socket.broadcast.emit('direct-join-res', room);
      cb(null, room);
    } catch (error) {
      cb(error);
    }
  });
  socket.on('direct-msg-send', async(payload, cb) => {
    try {
      const chat = await chatController.createChat(payload);
      socket.broadcast.emit('direct-msg-res', chat);
      cb(null, chat);
    } catch (error) {
      console.log('error >>>>', error);
      cb(error);
    }
  });
  socket.on('channel-msg-send', async(payload, cb) => {
    try {
      const chat = await chatController.createChat(payload);
      socket.broadcast.emit('channel-msg-res', chat);
      cb(null, chat);
    } catch (error) {
      cb(error);
    }
  });
});

httpServer.listen(port, () => {
  logger.info(`server is running on port ${port}`);
});