/**
 * Enhanced Error Handling Utilities
 * 
 * Provides user-friendly error messages and actionable guidance.
 */

const chalk = require('chalk');

/**
 * Error Types
 */
const ErrorType = {
  AUTHENTICATION: 'authentication',
  NOT_FOUND: 'not_found',
  PERMISSION: 'permission',
  RATE_LIMIT: 'rate_limit',
  NETWORK: 'network',
  SERVER: 'server',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

/**
 * Classify error based on status code and message
 */
function classifyError(error) {
  if (!error.response) {
    // Network error (no response)
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return ErrorType.NETWORK;
    }
    if (error.code === 'ECONNREFUSED') {
      return ErrorType.NETWORK;
    }
    return ErrorType.UNKNOWN;
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.PERMISSION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 429:
      return ErrorType.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
}

/**
 * Get user-friendly error message and guidance
 */
function getErrorGuidance(error, context = {}) {
  const errorType = classifyError(error);
  const { resourceType = 'resource', resourceId = '', command = '' } = context;

  const guidance = {
    type: errorType,
    message: '',
    suggestions: [],
    command: command
  };

  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      guidance.message = 'Authentication failed. Your API token may be invalid or expired.';
      guidance.suggestions = [
        'Run: atl auth login',
        'Generate a new API token at: https://id.atlassian.com/manage-profile/security/api-tokens',
        'Ensure your .env file has correct JIRA_EMAIL and JIRA_TOKEN values',
        'Check if your token has expired (tokens expire after 90-365 days)'
      ];
      if (command) {
        guidance.suggestions.push(`After re-authenticating, try: ${command}`);
      }
      break;

    case ErrorType.NOT_FOUND:
      if (resourceType === 'issue') {
        guidance.message = `Jira issue "${resourceId}" not found.`;
        guidance.suggestions = [
          'Verify the issue key is correct (format: PROJ-123)',
          'Check if you have permission to view this issue',
          `Search in Jira: ${process.env.JIRA_BASE_URL || 'https://your-jira.atlassian.net'}/browse/${resourceId}`,
          'Ensure the issue hasn\'t been deleted or moved to another project'
        ];
      } else if (resourceType === 'page') {
        guidance.message = `Confluence page "${resourceId}" not found.`;
        guidance.suggestions = [
          'Verify the page ID is correct (should be a numeric ID)',
          'Check if you have permission to view this page',
          'Ensure the page hasn\'t been deleted or moved',
          'Extract page ID from URL: /pages/{PAGE_ID}/ or ?pageId={PAGE_ID}'
        ];
      } else {
        guidance.message = `${resourceType} "${resourceId}" not found.`;
        guidance.suggestions = [
          'Verify the resource identifier is correct',
          'Check if you have permission to access this resource'
        ];
      }
      break;

    case ErrorType.PERMISSION:
      guidance.message = `Access denied. You don't have permission to access ${resourceType} "${resourceId}".`;
      guidance.suggestions = [
        'Verify you can access this resource in your browser',
        'Ask your Jira/Confluence administrator to grant you access',
        'Check if the resource is in a restricted project/space',
        'Ensure your API token has the required permissions'
      ];
      break;

    case ErrorType.RATE_LIMIT:
      const retryAfter = error.response?.headers?.['retry-after'] || 60;
      guidance.message = 'Rate limit exceeded. Too many requests to Atlassian API.';
      guidance.suggestions = [
        `Wait ${retryAfter} seconds before retrying`,
        'Use --fresh flag less frequently (use cached data when possible)',
        'Reduce number of concurrent requests',
        'Check Atlassian Cloud usage: https://admin.atlassian.com/'
      ];
      break;

    case ErrorType.NETWORK:
      guidance.message = 'Network error. Unable to reach Atlassian servers.';
      guidance.suggestions = [
        'Check your internet connection',
        'Verify Jira/Confluence URLs are correct in .env',
        'Try again in a few moments',
        'If behind a firewall/VPN, ensure it allows Atlassian API access',
        'Test connectivity: curl ' + (process.env.JIRA_BASE_URL || 'https://your-jira.atlassian.net')
      ];
      break;

    case ErrorType.SERVER:
      guidance.message = 'Server error. Atlassian server is experiencing issues.';
      guidance.suggestions = [
        'Wait a few minutes and try again',
        'Check Atlassian status: https://status.atlassian.com/',
        'Contact your Jira/Confluence administrator if issue persists',
        'Use cached data if available (remove --fresh flag)'
      ];
      break;

    case ErrorType.VALIDATION:
      guidance.message = 'Invalid request. The provided data is not valid.';
      guidance.suggestions = [
        'Check the command syntax: atl --help',
        'Verify all required fields are provided',
        'Ensure field values are in the correct format'
      ];
      if (error.response?.data?.errorMessages) {
        guidance.suggestions.push(`API says: ${error.response.data.errorMessages.join(', ')}`);
      }
      break;

    case ErrorType.UNKNOWN:
    default:
      guidance.message = 'An unexpected error occurred.';
      guidance.suggestions = [
        'Try running the command again',
        'Check the troubleshooting guide: docs/TROUBLESHOOTING.md',
        'Report this issue with full error details'
      ];
      if (error.message) {
        guidance.suggestions.push(`Technical error: ${error.message}`);
      }
      break;
  }

  return guidance;
}

/**
 * Format and display error with guidance
 */
function displayError(error, context = {}) {
  const guidance = getErrorGuidance(error, context);

  // Display main error message
  console.error(chalk.red(`\n✗ Error: ${guidance.message}\n`));

  // Display status code if available
  if (error.response?.status) {
    console.error(chalk.gray(`  HTTP Status: ${error.response.status}`));
  }

  // Display resource info if provided
  if (context.resourceType && context.resourceId) {
    console.error(chalk.gray(`  Resource: ${context.resourceType} "${context.resourceId}"`));
  }

  // Display suggestions
  if (guidance.suggestions.length > 0) {
    console.error(chalk.yellow('\n💡 Suggestions:'));
    guidance.suggestions.forEach((suggestion, index) => {
      console.error(chalk.gray(`  ${index + 1}. ${suggestion}`));
    });
  }

  // Display additional context if available
  if (error.response?.data?.errorMessages && Array.isArray(error.response.data.errorMessages)) {
    console.error(chalk.yellow('\n📋 Details from server:'));
    error.response.data.errorMessages.forEach(msg => {
      console.error(chalk.gray(`  • ${msg}`));
    });
  }

  console.error(''); // Empty line for spacing
}

/**
 * Handle and format errors consistently
 */
async function handleError(error, context = {}) {
  displayError(error, context);

  // Return structured error object for programmatic handling
  return {
    success: false,
    error: error.message,
    errorType: classifyError(error),
    errorResponse: error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : null,
    guidance: getErrorGuidance(error, context)
  };
}

/**
 * Wrap async function with error handling
 */
function withErrorHandling(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return await handleError(error, context);
    }
  };
}

/**
 * Validate issue key format
 */
function validateIssueKey(issueKey) {
  const pattern = /^[A-Z][A-Z0-9]+-\d+$/;
  if (!pattern.test(issueKey)) {
    throw new Error(
      `Invalid issue key format: "${issueKey}". Expected format: PROJ-123 (project key must start with an uppercase letter, followed by uppercase letters or digits, then dash and number)`
    );
  }
  return true;
}

/**
 * Validate Confluence page ID format
 */
function validatePageId(pageId) {
  const pattern = /^\d+$/;
  if (!pattern.test(pageId)) {
    throw new Error(
      `Invalid page ID format: "${pageId}". Expected numeric ID (e.g., 3309101741)`
    );
  }
  return true;
}

module.exports = {
  ErrorType,
  classifyError,
  getErrorGuidance,
  displayError,
  handleError,
  withErrorHandling,
  validateIssueKey,
  validatePageId
};
