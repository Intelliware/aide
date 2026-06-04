const TDInternalClient = require('./td-internal-client');
const Microsoft365Client = require('./microsoft365-client');
const { SharePointError, ERROR_CODES } = require('@ea-workspace/shared-utils');

/**
 * SharePointClientFactory - Factory for creating platform-specific SharePoint clients
 * Automatically detects platform from URL and returns appropriate client
 */
class SharePointClientFactory {
  /**
   * Create SharePoint client based on site URL
   * @param {string} siteUrl - SharePoint site URL
   * @param {Object} auth - Authentication context
   * @param {Object} options - Additional options
   * @returns {BaseSharePointClient} Platform-specific client instance
   */
  static createClient(siteUrl, auth, options = {}) {
    const platform = this.detectPlatform(siteUrl);
    
    if (platform === 'td-internal') {
      return new TDInternalClient(siteUrl, auth, options);
    } else if (platform === 'microsoft365') {
      return new Microsoft365Client(siteUrl, auth, options);
    } else {
      throw new SharePointError(
        `Unsupported SharePoint URL: ${siteUrl}. Supported platforms: TD Internal (myteam.td.com) and Microsoft 365 (*.sharepoint.com)`,
        ERROR_CODES.PLATFORM_UNSUPPORTED,
        400,
        { siteUrl, supportedPlatforms: ['myteam.td.com', '*.sharepoint.com'] }
      );
    }
  }
  
  /**
   * Detect SharePoint platform from URL
   * @param {string} siteUrl - SharePoint site URL
   * @returns {string|null} Platform identifier ('td-internal', 'microsoft365', or null)
   */
  static detectPlatform(siteUrl) {
    if (!siteUrl || typeof siteUrl !== 'string') {
      return null;
    }
    
    try {
      const urlObj = new URL(siteUrl);
      const hostname = urlObj.hostname.toLowerCase();
      
      // TD Internal SharePoint (myteam.td.com or mydrive.td.com)
      if (hostname.includes('myteam.td.com') || hostname.includes('mydrive.td.com')) {
        return 'td-internal';
      }
      
      // Microsoft 365 SharePoint
      if (hostname.includes('.sharepoint.com')) {
        return 'microsoft365';
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Validate SharePoint URL format
   * @param {string} siteUrl - SharePoint site URL to validate
   * @returns {boolean} True if URL is valid SharePoint URL
   */
  static isValidSharePointUrl(siteUrl) {
    const platform = this.detectPlatform(siteUrl);
    return platform !== null;
  }
  
  /**
   * Get platform information
   * @param {string} siteUrl - SharePoint site URL
   * @returns {Object} Platform information
   */
  static getPlatformInfo(siteUrl) {
    const platform = this.detectPlatform(siteUrl);
    
    const platformInfo = {
      'td-internal': {
        name: 'TD Internal SharePoint',
        api: 'SharePoint REST API',
        authMethod: 'NTLM (Windows Authentication)',
        baseUrl: 'myteam.td.com'
      },
      'microsoft365': {
        name: 'Microsoft 365 SharePoint',
        api: 'Microsoft Graph API v1.0',
        authMethod: 'Bearer Token (OAuth 2.0)',
        baseUrl: '*.sharepoint.com'
      }
    };
    
    return platform ? platformInfo[platform] : null;
  }
}

module.exports = SharePointClientFactory;
