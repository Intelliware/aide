/**
 * @ea-workspace/shared-utils
 * Common utilities for EasyApply workspace CLI tools
 */

// Configuration Management
const ConfigManager = require('./config');

// Logging
const logger = require('./logger');
const apiLogger = require('./api-logger');

// Validation
const Validators = require('./validators');

// Error Handling
const {
  SharePointError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleApiError,
  formatError
} = require('./error-handler');

module.exports = {
  // Config
  ConfigManager,
  
  // Logging
  logger,
  apiLogger,
  
  // Validation
  Validators,
  
  // Error Handling
  SharePointError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleApiError,
  formatError
};
