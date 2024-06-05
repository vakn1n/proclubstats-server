import winston from "winston";
import "winston-daily-rotate-file";

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

// Conditionally set the logger level based on the NODE_ENV
const loggerLevel = process.env.NODE_ENV === "test" ? "error" : "info";

const logger = winston.createLogger({
  level: loggerLevel, // Use the determined level
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),
      level: loggerLevel, // Also apply the level to the console transport
    }),
  ],
});

export default logger;
