import winston from 'winston'
import 'winston-daily-rotate-file'
const { format, transports } = winston

export default winston.createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      level: 'debug',
      dirname: '.logs',
      filename: 'TallMe-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: 1024
    })
  ]
})
