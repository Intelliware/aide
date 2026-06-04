# @ea-workspace/shared-utils

Shared utilities for EasyApply workspace CLI tools (Atlassian, SharePoint).

## Installation

This is an internal package within the monorepo. It's automatically available to all workspace packages.

## Usage

```javascript
const {
  ConfigManager,
  logger,
  apiLogger,
  Validators,
  SharePointError,
  ERROR_CODES,
  handleApiError,
  formatError
} = require('@ea-workspace/shared-utils');
```

## Available Utilities

### ConfigManager
Manages configuration with encrypted storage and .env support.

```javascript
const configManager = new ConfigManager();
const config = configManager.getConfig();
configManager.setConfig('token', 'your-token');
```

### Logger
Winston-based logger with log rotation and credential redaction.

```javascript
const { logger } = require('@ea-workspace/shared-utils');

logger.info('Operation started', { file: 'example.pdf' });
logger.error('Operation failed', { error: error.message });
```

### API Logger
Specialized logger for API calls (Jira, Confluence, SharePoint).

```javascript
const { apiLogger } = require('@ea-workspace/shared-utils');

apiLogger.logRequest('GET', '/api/endpoint', { params });
apiLogger.logResponse(response);
```

### Validators
Input validation and sanitization.

```javascript
const { Validators } = require('@ea-workspace/shared-utils');

if (Validators.isValidSharePointUrl(url)) {
  // Process URL
}

const sanitized = Validators.sanitizeSearchQuery(userInput);
```

### Error Handling
Standardized error handling across all CLIs.

```javascript
const { SharePointError, ERROR_CODES, handleApiError } = require('@ea-workspace/shared-utils');

throw new SharePointError(
  'File not found',
  ERROR_CODES.NOT_FOUND,
  404
);

// Handle API errors
try {
  await axios.get(url);
} catch (error) {
  throw handleApiError(error);
}
```

## Features

- ✅ Encrypted credential storage (using Conf)
- ✅ Secure logging with credential redaction
- ✅ Cross-platform path validation
- ✅ Standardized error codes
- ✅ API request/response logging
- ✅ Input sanitization

## Dependencies

Peer dependencies (provided by root package.json):
- axios
- chalk
- conf
- dotenv
- winston
