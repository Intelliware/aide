const { Validators } = require('@ea-workspace/shared-utils');

/**
 * List files in SharePoint folder
 * @param {string} siteUrl - SharePoint site URL
 * @param {string} folderPath - Folder path
 * @param {Object} client - SharePoint client instance
 * @param {Object} logger - Logger instance
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Array of file objects
 */
async function listFiles(siteUrl, folderPath, client, logger, options = {}) {
  logger.info('Starting list files operation', {
    siteUrl,
    folderPath,
    recursive: options.recursive || false
  });
  
  try {
    const files = await client.listFiles({
      folderPath,
      recursive: options.recursive || false
    });
    
    logger.info('List operation completed successfully', {
      count: files.length
    });
    
    return files;
  } catch (error) {
    logger.error('List operation failed', {
      error: error.message,
      folderPath
    });
    throw error;
  }
}

module.exports = { listFiles };
