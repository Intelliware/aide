/**
 * SharePointError - Custom error class for SharePoint CLI
 */
class SharePointError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code constant
   * @param {number} statusCode - HTTP status code (if applicable)
   * @param {Object} details - Additional error details
   */
  constructor(message, code, statusCode, details = null) {
    super(message);
    this.name = 'SharePointError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes used throughout the application
 */
const ERROR_CODES = {
  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_URL: 'INVALID_URL',
  INVALID_PATH: 'INVALID_PATH',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Operation errors
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  
  // Configuration errors
  CONFIG_ERROR: 'CONFIG_ERROR',
  PLATFORM_UNSUPPORTED: 'PLATFORM_UNSUPPORTED'
};

/**
 * User-friendly error messages mapped from HTTP status codes
 */
const ERROR_MESSAGES = {
  400: 'Bad request. Please check your input parameters.',
  401: 'Authentication failed. Please check your credentials.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'File or folder not found.',
  409: 'File already exists. Use --overwrite to replace.',
  413: 'File too large. Maximum file size is 250 MB.',
  429: 'Rate limit exceeded. Please try again later.',
  500: 'SharePoint server error. Please try again.',
  502: 'Bad gateway. The SharePoint server is not responding correctly.',
  503: 'SharePoint service unavailable. Please try again later.',
  504: 'Gateway timeout. The request took too long to process.'
};

/**
 * Handle API errors and convert to SharePointError
 * @param {Error} error - Axios or other error object
 * @returns {SharePointError} Formatted SharePointError instance
 */
function handleApiError(error) {
  // If already a SharePointError, return as-is
  if (error instanceof SharePointError) {
    return error;
  }
  
  // Handle Axios errors
  if (error.response) {
    const statusCode = error.response.status;
    const message = ERROR_MESSAGES[statusCode] || error.message;
    
    let code = ERROR_CODES.NETWORK_ERROR;
    
    // Map status codes to error codes
    if (statusCode === 401) {
      code = ERROR_CODES.AUTH_FAILED;
    } else if (statusCode === 403) {
      code = ERROR_CODES.PERMISSION_DENIED;
    } else if (statusCode === 404) {
      code = ERROR_CODES.NOT_FOUND;
    } else if (statusCode === 409) {
      code = ERROR_CODES.ALREADY_EXISTS;
    } else if (statusCode === 413) {
      code = ERROR_CODES.FILE_TOO_LARGE;
    } else if (statusCode === 429) {
      code = ERROR_CODES.RATE_LIMIT;
    } else if (statusCode >= 500) {
      code = ERROR_CODES.SERVER_ERROR;
    }
    
    return new SharePointError(
      message,
      code,
      statusCode,
      error.response.data
    );
  }
  
  // Handle network/timeout errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new SharePointError(
      'Request timeout. Please check your network connection.',
      ERROR_CODES.TIMEOUT,
      null,
      { originalError: error.code }
    );
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new SharePointError(
      'Network error. Cannot connect to SharePoint server.',
      ERROR_CODES.NETWORK_ERROR,
      null,
      { originalError: error.code }
    );
  }
  
  // Generic error
  return new SharePointError(
    error.message || 'An unexpected error occurred',
    ERROR_CODES.NETWORK_ERROR,
    null,
    { originalError: error }
  );
}

/**
 * Format error for display to user
 * @param {SharePointError|Error} error - Error to format
 * @returns {string} Formatted error message
 */
function formatError(error) {
  if (error instanceof SharePointError) {
    let output = `Error: ${error.message}`;
    
    if (error.code) {
      output += `\nCode: ${error.code}`;
    }
    
    if (error.statusCode) {
      output += `\nStatus: ${error.statusCode}`;
    }
    
    if (error.details && process.env.NODE_ENV !== 'production') {
      output += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
    }
    
    return output;
  }
  
  return `Error: ${error.message}`;
}

module.exports = {
  SharePointError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleApiError,
  formatError
};
