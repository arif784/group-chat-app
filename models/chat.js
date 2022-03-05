const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  message: String,
  room: {
    type: mongoose.Types.ObjectId,
    ref: 'room',
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  channel: {
    type: mongoose.Types.ObjectId,
    ref: 'channel',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('chat', chatSchema);