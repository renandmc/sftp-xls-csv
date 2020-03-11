const {createLogger, format, transports} = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss'
    }),
    format.simple()
  ),
  transports: [
    new transports.File({
      filename: './logs/error.log',
      level: 'error'
    }),
    new transports.File({
      filename: './logs/combined.log'
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

module.exports = logger;