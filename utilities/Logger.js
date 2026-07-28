import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const customFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

export const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'automation.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error'
    })
  ]
});

export default Logger;
