const { ConfigManager, logger } = require('@ea-workspace/shared-utils');
const AuthManager = require('./auth/auth-manager');
const SharePointClientFactory = require('./clients/sharepoint-client-factory');

/**
 * Execute SharePoint operation with proper setup
 * @param {Function} operation - Operation function to execute
 * @param {Object} params - Parameters for the operation
 * @returns {Promise<any>} Operation result
 */
async function executeOperation(operation, params) {
  try {
    // Load configuration
    const configManager = await ConfigManager.create();
    const config = configManager.getConfig();
    
    // Detect platform
    const platform = SharePointClientFactory.detectPlatform(params.siteUrl);
    
    if (!platform) {
      throw new Error(`Invalid SharePoint URL: ${params.siteUrl}`);
    }
    
    // Get authentication context
    const authManager = new AuthManager(config);
    const auth = authManager.getAuthContext(platform);
    
    // Validate authentication
    const isValid = await authManager.validateAuth(auth);
    if (!isValid) {
      throw new Error(`Invalid authentication configuration for ${platform}`);
    }
    
    // Create SharePoint client
    const client = SharePointClientFactory.createClient(
      params.siteUrl,
      auth,
      { logger }
    );
    
    // Execute operation
    const result = await operation(client, params, logger);
    
    return result;
  } catch (error) {
    logger.error('Operation failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  executeOperation,
  ConfigManager,
  AuthManager,
  SharePointClientFactory
};
