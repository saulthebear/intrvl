const winston = require("winston")

const env = process.env.NODE_ENV

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
})

// Dev environment:
if (!(env === "production" || env === "test")) {
  logger.add(
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
  logger.add(
    new winston.transports.File({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
      filename: "logs/dev.log",
    })
  )
}

// Output logs to file in test env
if (env === "test") {
  logger.add(
    new winston.transports.File({
      level: "debug",
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp()
      ),
      filename: "logs/test.log",
    })
  )
}

module.exports = logger
