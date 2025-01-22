// src/logger.ts

import { createLogger, format, transports } from 'winston';

// Define the log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }), // Include stack trace
  format.splat(),
  format.json()
);

// Create the logger instance
const logger = createLogger({
  level: 'info', // Default log level
  format: logFormat,
  defaultMeta: { service: 'bot-service' },
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    // File transport for errors
    new transports.File({ filename: 'error.log', level: 'error' }),
    // File transport for combined logs
    new transports.File({ filename: 'combined.log' }),
  ],
});

// If not in production, also log to the console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

export default logger;
