const mongoose = require('mongoose');
const { Schema } = mongoose;

const channelSchema = Schema({
  name: String,
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  members: [{
    type: mongoose.Types.ObjectId,
    ref: 'user',
  }],
  status: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('channel', channelSchema);