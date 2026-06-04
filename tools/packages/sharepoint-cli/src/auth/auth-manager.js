const { logger, SharePointError, ERROR_CODES } = require('@ea-workspace/shared-utils');

/**
 * AuthManager - Manages authentication for SharePoint platforms
 * Supports both NTLM (Windows) and Bearer Token authentication
 */
class AuthManager {
  /**
   * @param {Object} config - Configuration object from ConfigManager
   */
  constructor(config) {
    this.config = config;
  }
  
  /**
   * Get authentication context for specified platform
   * @param {string} platform - Platform type ('td-internal' or 'microsoft365')
   * @returns {Object} Authentication context
   * @throws {SharePointError} If authentication configuration is missing
   */
  getAuthContext(platform) {
    if (platform === 'td-internal') {
      // On Windows, use integrated authentication (no credentials needed)
      if (process.platform === 'win32') {
        logger.info('Using Windows integrated authentication (no credentials required)');
        
        return {
          type: 'integrated',
          platform: 'win32'
        };
      }
      
      // On non-Windows platforms, require NTLM credentials
      if (!this.config.username || !this.config.password) {
        throw new SharePointError(
          'Windows authentication requires username and password on non-Windows platforms. Please configure WINDOWS_USERNAME and WINDOWS_PASSWORD.',
          ERROR_CODES.CREDENTIALS_MISSING,
          401
        );
      }
      
      logger.info('Creating NTLM auth context', {
        username: this.config.username,
        domain: this.config.domain
      });
      
      return {
        type: 'ntlm',
        username: this.config.username,
        password: this.config.password,
        domain: this.config.domain,
        workstation: ''
      };
    } else if (platform === 'microsoft365') {
      // Microsoft 365 uses Bearer Token
      if (!this.config.token) {
        throw new SharePointError(
          'Microsoft 365 authentication requires a Bearer token. Please configure SHAREPOINT_API_TOKEN.',
          ERROR_CODES.CREDENTIALS_MISSING,
          401
        );
      }
      
      logger.info('Creating Bearer token auth context');
      
      return {
        type: 'bearer',
        token: this.config.token
      };
    } else {
      throw new SharePointError(
        `Unsupported platform: ${platform}. Supported platforms are 'td-internal' and 'microsoft365'.`,
        ERROR_CODES.PLATFORM_UNSUPPORTED,
        400
      );
    }
  }
  
  /**
   * Validate authentication context
   * @param {Object} auth - Authentication context to validate
   * @returns {boolean} True if auth is valid
   */
  async validateAuth(auth) {
    if (!auth || !auth.type) {
      logger.warn('Invalid auth context: missing type');
      return false;
    }
    
    if (auth.type === 'integrated') {
      // Windows integrated authentication - always valid on Windows
      if (process.platform === 'win32') {
        logger.info('Windows integrated authentication validated');
        return true;
      } else {
        logger.warn('Integrated auth only supported on Windows');
        return false;
      }
    }
    
    if (auth.type === 'bearer') {
      if (!auth.token || auth.token.trim() === '') {
        logger.warn('Invalid Bearer token: token is empty');
        return false;
      }
      
      // Check if token looks like a JWT or valid token format
      if (auth.token.length < 20) {
        logger.warn('Invalid Bearer token: token too short');
        return false;
      }
      
      return true;
    }
    
    if (auth.type === 'ntlm') {
      if (!auth.username || auth.username.trim() === '') {
        logger.warn('Invalid NTLM auth: username is empty');
        return false;
      }
      
      if (!auth.password || auth.password.trim() === '') {
        logger.warn('Invalid NTLM auth: password is empty');
        return false;
      }
      
      return true;
    }
    
    logger.warn('Invalid auth context: unknown type', { type: auth.type });
    return false;
  }
  
  /**
   * Check if token is expired (for JWT tokens)
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    if (!token || typeof token !== 'string') {
      return true;
    }
    
    try {
      // Check if token is JWT format
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Not a JWT, assume valid (could be different token format)
        return false;
      }
      
      // Decode JWT payload (base64)
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf8')
      );
      
      // Check expiration claim
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (now >= expirationTime) {
          logger.warn('Token has expired', {
            expiredAt: new Date(expirationTime).toISOString()
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // If we can't parse the token, assume it's not expired
      // (might be a different token format)
      logger.debug('Could not parse token for expiration check', {
        error: error.message
      });
      return false;
    }
  }
  
  /**
   * Get authentication headers for HTTP requests
   * @param {Object} auth - Authentication context
   * @returns {Object} HTTP headers object
   */
  getAuthHeaders(auth) {
    if (auth.type === 'bearer') {
      return {
        'Authorization': `Bearer ${auth.token}`
      };
    }
    
    // NTLM headers are handled by axios-ntlm, return empty
    return {};
  }
}

module.exports = AuthManager;
