const { logger, SharePointError, ERROR_CODES } = require('@ea-workspace/shared-utils');

/**
 * BaseSharePointClient - Abstract base class for SharePoint clients
 * Provides common interface and shared functionality
 */
class BaseSharePointClient {
  /**
   * @param {string} siteUrl - Base SharePoint site URL
   * @param {Object} auth - Authentication context
   * @param {Object} options - Additional options
   */
  constructor(siteUrl, auth, options = {}) {
    this.siteUrl = siteUrl;
    this.auth = auth;
    this.options = options;
    this.logger = logger;
  }
  
  /**
   * Upload file to SharePoint
   * @param {Object} options - Upload options
   * @param {string} options.filePath - Local file path
   * @param {string} options.targetFolder - Target folder in SharePoint
   * @param {boolean} options.overwrite - Overwrite if exists
   * @returns {Promise<Object>} Upload result
   * @throws {Error} Must be implemented by subclass
   */
  async uploadFile(options) {
    throw new Error('uploadFile() must be implemented by subclass');
  }
  
  /**
   * Download file from SharePoint
   * @param {Object} options - Download options
   * @param {string} options.fileUrl - SharePoint file URL
   * @param {string} options.outputPath - Local output path
   * @returns {Promise<Object>} Download result
   * @throws {Error} Must be implemented by subclass
   */
  async downloadFile(options) {
    throw new Error('downloadFile() must be implemented by subclass');
  }
  
  /**
   * List files in SharePoint folder
   * @param {Object} options - List options
   * @param {string} options.folderPath - Folder path
   * @param {boolean} options.recursive - List recursively
   * @returns {Promise<Array>} Array of file objects
   * @throws {Error} Must be implemented by subclass
   */
  async listFiles(options) {
    throw new Error('listFiles() must be implemented by subclass');
  }
  
  /**
   * Search for files in SharePoint
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.fileType - File type filter
   * @param {number} options.maxResults - Maximum results
   * @returns {Promise<Array>} Array of matching files
   * @throws {Error} Must be implemented by subclass
   */
  async searchFiles(options) {
    throw new Error('searchFiles() must be implemented by subclass');
  }
  
  /**
   * Create folder in SharePoint
   * @param {Object} options - Folder creation options
   * @param {string} options.folderPath - Folder path to create
   * @param {boolean} options.recursive - Create parent folders
   * @returns {Promise<Object>} Creation result
   * @throws {Error} Must be implemented by subclass
   */
  async createFolder(options) {
    throw new Error('createFolder() must be implemented by subclass');
  }
  
  /**
   * Get file metadata
   * @param {Object} options - Metadata options
   * @param {string} options.fileUrl - File URL
   * @returns {Promise<Object>} File metadata
   * @throws {Error} Must be implemented by subclass
   */
  async getMetadata(options) {
    throw new Error('getMetadata() must be implemented by subclass');
  }
  
  /**
   * Update file metadata
   * @param {Object} options - Update options
   * @param {string} options.fileUrl - File URL
   * @param {Object} options.metadata - Metadata to update
   * @returns {Promise<Object>} Update result
   * @throws {Error} Must be implemented by subclass
   */
  async updateMetadata(options) {
    throw new Error('updateMetadata() must be implemented by subclass');
  }
  
  /**
   * Validate file size is within limits
   * @param {number} fileSize - File size in bytes
   * @param {number} maxSize - Maximum size (default: 250 MB)
   * @throws {SharePointError} If file exceeds size limit
   */
  validateFileSize(fileSize, maxSize = 250 * 1024 * 1024) {
    if (fileSize > maxSize) {
      throw new SharePointError(
        `File size ${this.formatBytes(fileSize)} exceeds maximum allowed size of ${this.formatBytes(maxSize)}`,
        ERROR_CODES.FILE_TOO_LARGE,
        413,
        { fileSize, maxSize }
      );
    }
  }
  
  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string (e.g., "10.5 MB")
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Test connection to SharePoint
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      // Each subclass should implement specific connection test
      throw new Error('testConnection() must be implemented by subclass');
    } catch (error) {
      this.logger.error('Connection test failed', { error:error.message });
      return false;
    }
  }
}

module.exports = BaseSharePointClient;
