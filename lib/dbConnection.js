const mongoose = require('mongoose');
const logger = require('./log');

const connectionUrl = process.env.DB_URL || 'mongodb://localhost:27017/group-chat';
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 }
logger.info('Connecting to DB: ' + connectionUrl);
mongoose.connect(connectionUrl, connectionOptions);
mongoose.connection.on('error', (error) => {
  logger.error('[MONGOOSE] ERROR: ' + error);
});
/* eslint-disable no-unused-vars */
mongoose.connection.on('connected', (err, res) => {
  logger.info('DB is connected');
});

module.exports = mongoose.connection;