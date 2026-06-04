const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), '_logs_', 'sharepoint');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format to redact sensitive information
const redactSensitive = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'authorization', 'secret'];
  
  if (info.message && typeof info.message === 'string') {
    sensitiveKeys.forEach(key => {
      const regex = new RegExp(`${key}['":\\s]*(\\S+)`, 'gi');
      info.message = info.message.replace(regex, `${key}: [REDACTED]`);
    });
  }
  
  // Redact in metadata
  if (info.metadata) {
    sensitiveKeys.forEach(key => {
      if (info.metadata[key]) {
        info.metadata[key] = '[REDACTED]';
      }
    });
  }
  
  return info;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSensitive(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Operations log (all levels)
    new winston.transports.File({
      filename: path.join(logDir, 'operations.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Error log (errors only)
    new winston.transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
