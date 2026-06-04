const path = require('path');

/**
 * Validators - Input validation and sanitization utilities
 */
class Validators {
  /**
   * Validate SharePoint URL format
   * @param {string} url - SharePoint URL to validate
   * @returns {boolean} True if URL is valid SharePoint URL
   */
  static isValidSharePointUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      
      // Must be HTTPS
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Check for TD internal or Microsoft 365 SharePoint domains
      const hostname = urlObj.hostname.toLowerCase();
      const isTDInternal = hostname.includes('myteam.td.com');
      const isM365 = hostname.includes('.sharepoint.com');
      
      return isTDInternal || isM365;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate file path is safe (no directory traversal)
   * @param {string} filePath - File path to validate
   * @returns {boolean} True if path is safe
   */
  static isValidFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    
    try {
      const normalized = path.normalize(filePath);
      
      // Check for directory traversal attempts
      if (normalized.includes('..')) {
        return false;
      }
      
      // Must be absolute path for safety
      return path.isAbsolute(normalized);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate file size is within limits
   * @param {number} size - File size in bytes
   * @param {number} maxSize - Maximum allowed size (default: 250 MB)
   * @returns {boolean} True if size is valid
   */
  static isValidFileSize(size, maxSize = 250 * 1024 * 1024) {
    return typeof size === 'number' && size > 0 && size <= maxSize;
  }
  
  /**
   * Sanitize search query by removing potentially dangerous characters
   * @param {string} query - Search query to sanitize
   * @returns {string} Sanitized query
   */
  static sanitizeSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters
    return query.replace(/[<>'"\\;]/g, '').trim();
  }
  
  /**
   * Validate folder path format for SharePoint
   * @param {string} folderPath - Folder path to validate
   * @returns {boolean} True if folder path is valid
   */
  static isValidFolderPath(folderPath) {
    if (!folderPath || typeof folderPath !== 'string') {
      return false;
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(folderPath)) {
      return false;
    }
    
    // Check for directory traversal
    if (folderPath.includes('..')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate metadata key name
   * @param {string} key - Metadata key to validate
   * @returns {boolean} True if key is valid
   */
  static isValidMetadataKey(key) {
    if (!key || typeof key !== 'string') {
      return false;
    }
    
    // Alphanumeric, underscore, and hyphen only
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(key) && key.length <= 255;
  }
  
  /**
   * Sanitize filename by removing invalid characters
   * @param {string} filename - Filename to sanitize
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'untitled';
    }
    
    // Remove invalid filename characters
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/^\.+/, '') // Remove leading dots
      .trim()
      .substring(0, 255); // Limit length
  }
}

module.exports = Validators;
