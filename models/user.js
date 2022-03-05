const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
  username: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('user', userSchema);