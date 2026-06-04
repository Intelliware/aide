const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { getWorkspaceRoot } = require('./env-loader');

/**
 * Logger Utility for Atlassian CLI
 * 
 * Provides structured logging with multiple levels and optional file output.
 * Supports debug mode for detailed troubleshooting.
 */

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.enableFile = options.enableFile !== false;
    // Default to workspace root _logs_ directory (dynamically detected)
    const workspaceRoot = getWorkspaceRoot();
    this.logDir = options.logDir || path.join(workspaceRoot, '_logs_', 'atlassian');
    this.logFile = options.logFile || `atlassian-cli-${new Date().toISOString().split('T')[0]}.log`;
    this.silent = options.silent || false;
    
    // Log levels with priority
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      trace: 5
    };
    
    // Ensure log directory exists
    if (this.enableFile) {
      this._ensureLogDir();
    }
  }

  /**
   * Ensure log directory exists
   */
  _ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠ Could not create log directory: ${error.message}`));
      this.enableFile = false;
    }
  }

  /**
   * Get current log level priority
   */
  _getLevelPriority(level) {
    return this.levels[level] !== undefined ? this.levels[level] : this.levels.info;
  }

  /**
   * Check if message should be logged based on level
   */
  _shouldLog(level) {
    const currentLevel = this._getLevelPriority(this.level);
    const messageLevel = this._getLevelPriority(level);
    return messageLevel <= currentLevel;
  }

  /**
   * Format log message with timestamp and metadata
   */
  _formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 
      ? ' ' + JSON.stringify(metadata)
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Write to log file
   */
  _writeToFile(formattedMessage) {
    if (!this.enableFile) return;
    
    try {
      const logPath = path.join(this.logDir, this.logFile);
      fs.appendFileSync(logPath, formattedMessage + '\n', 'utf8');
    } catch (error) {
      // Silently fail file writing to avoid recursive logging
    }
  }

  /**
   * Internal log method
   */
  _log(level, message, metadata = {}) {
    if (!this._shouldLog(level)) return;
    
    const formattedMessage = this._formatMessage(level, message, metadata);
    this._writeToFile(formattedMessage);
    
    if (this.silent) return;
    
    // Console output with colors
    const timestamp = chalk.gray(new Date().toISOString());
    const metaStr = Object.keys(metadata).length > 0 
      ? chalk.gray(' ' + JSON.stringify(metadata))
      : '';
    
    let consoleMessage;
    switch (level) {
      case 'error':
        consoleMessage = `${timestamp} ${chalk.red('✗ ERROR')} ${message}${metaStr}`;
        break;
      case 'warn':
        consoleMessage = `${timestamp} ${chalk.yellow('⚠ WARN')} ${message}${metaStr}`;
        break;
      case 'info':
        consoleMessage = `${timestamp} ${chalk.blue('ℹ INFO')} ${message}${metaStr}`;
        break;
      case 'http':
        consoleMessage = `${timestamp} ${chalk.cyan('→ HTTP')} ${message}${metaStr}`;
        break;
      case 'debug':
        consoleMessage = `${timestamp} ${chalk.magenta('⚙ DEBUG')} ${message}${metaStr}`;
        break;
      case 'trace':
        consoleMessage = `${timestamp} ${chalk.gray('• TRACE')} ${message}${metaStr}`;
        break;
      default:
        consoleMessage = `${timestamp} ${message}${metaStr}`;
    }
    
    console.log(consoleMessage);
  }

  /**
   * Log error message
   */
  error(message, metadata = {}) {
    this._log('error', message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message, metadata = {}) {
    this._log('warn', message, metadata);
  }

  /**
   * Log info message
   */
  info(message, metadata = {}) {
    this._log('info', message, metadata);
  }

  /**
   * Log HTTP request/response
   */
  http(message, metadata = {}) {
    this._log('http', message, metadata);
  }

  /**
   * Log debug message
   */
  debug(message, metadata = {}) {
    this._log('debug', message, metadata);
  }

  /**
   * Log trace message (most verbose)
   */
  trace(message, metadata = {}) {
    this._log('trace', message, metadata);
  }

  /**
   * Get log file path
   */
  getLogPath() {
    return this.enableFile ? path.join(this.logDir, this.logFile) : null;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
      this.debug(`Log level set to: ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled) {
    this.enableFile = enabled;
    if (enabled) {
      this._ensureLogDir();
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context = {}) {
    const childLogger = new Logger({
      level: this.level,
      enableFile: this.enableFile,
      logDir: this.logDir,
      logFile: this.logFile,
      silent: this.silent
    });
    
    // Store context for child logger
    childLogger.context = { ...this.context, ...context };
    
    // Override _log to include context
    const originalLog = childLogger._log.bind(childLogger);
    childLogger._log = (level, message, metadata = {}) => {
      originalLog(level, message, { ...childLogger.context, ...metadata });
    };
    
    return childLogger;
  }
}

// Create singleton instance
let defaultLogger = null;

/**
 * Get or create default logger instance
 */
function getLogger(options = {}) {
  if (!defaultLogger) {
    defaultLogger = new Logger(options);
  }
  return defaultLogger;
}

/**
 * Initialize logger with specific options
 */
function initLogger(options = {}) {
  defaultLogger = new Logger(options);
  return defaultLogger;
}

module.exports = {
  Logger,
  getLogger,
  initLogger
};
