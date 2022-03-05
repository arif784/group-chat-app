const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ label, message, level, timestamp }) => {
  return `${timestamp} [${label}] ${level} : ${message}`;
});

const options = {
  console: {
    level: process.env.LOG_LEVEL || 'info',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = createLogger({
  format: combine(
    label({ label: path.basename(require.main.filename) }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console(options.console)],
});

module.exports = logger;