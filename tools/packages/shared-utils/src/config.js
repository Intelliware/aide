const dotenv = require('dotenv');
const os = require('os');
const crypto = require('crypto');

/**
 * ConfigManager - Manages SharePoint CLI configuration
 * Loads from .env file and encrypted Conf storage
 */
class ConfigManager {
  constructor(conf) {
    // Load .env file
    dotenv.config();
    
    // Store conf instance
    this.conf = conf;
  }
  
  /**
   * Create a new ConfigManager instance (async factory)
   * @returns {Promise<ConfigManager>}
   */
  static async create() {
    // Dynamically import Conf (ESM)
    const { default: Conf } = await import('conf');
    
    // Create encryption key from machine-specific info
    const encryptionKey = crypto
      .createHash('sha256')
      .update(os.userInfo().username + os.hostname())
      .digest('hex')
      .substring(0, 32);
    
    // Initialize encrypted config storage
    const conf = new Conf({
      projectName: 'sharepoint-cli',
      encryptionKey: encryptionKey
    });
    
    return new ConfigManager(conf);
  }
  
  /**
   * Get all configuration values
   * Prioritizes Conf storage over .env
   * @returns {Object} Configuration object
   */
  getConfig() {
    return {
      token: this.conf.get('token') || process.env.SHAREPOINT_API_TOKEN || '',
      username: this.conf.get('username') || process.env.WINDOWS_USERNAME || '',
      password: this.conf.get('password') || process.env.WINDOWS_PASSWORD || '',
      domain: this.conf.get('domain') || process.env.WINDOWS_DOMAIN || 'TD',
      logLevel: process.env.LOG_LEVEL || 'info',
      httpProxy: process.env.HTTP_PROXY || '',
      httpsProxy: process.env.HTTPS_PROXY || ''
    };
  }
  
  /**
   * Set a configuration value (stored in encrypted Conf)
   * @param {string} key - Configuration key
   * @param {string} value - Configuration value
   */
  setConfig(key, value) {
    this.conf.set(key, value);
  }
  
  /**
   * Get a single configuration value
   * @param {string} key - Configuration key
   * @returns {string} Configuration value
   */
  get(key) {
    return this.conf.get(key) || process.env[key.toUpperCase()] || '';
  }
  
  /**
   * Check if required configuration is present
   * @param {string} platform - Platform type ('td-internal' or 'microsoft365')
   * @returns {boolean} True if config is valid
   */
  hasRequiredConfig(platform) {
    const config = this.getConfig();
    
    if (platform === 'microsoft365') {
      return !!config.token;
    } else if (platform === 'td-internal') {
      return !!config.username && !!config.password;
    }
    
    return false;
  }
  
  /**
   * Clear all configuration from Conf storage
   */
  clearConfig() {
    this.conf.clear();
  }
}

module.exports = ConfigManager;
