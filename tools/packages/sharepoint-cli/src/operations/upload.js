const fs = require('fs');
const { SharePointError, ERROR_CODES, Validators } = require('@ea-workspace/shared-utils');

/**
 * Upload file to SharePoint
 * @param {string} filePath - Local file path
 * @param {string} siteUrl - SharePoint site URL
 * @param {string} targetFolder - Target folder path
 * @param {Object} client - SharePoint client instance
 * @param {Object} logger - Logger instance
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Upload result
 */
async function uploadFile(filePath, siteUrl, targetFolder, client, logger, options = {}) {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new SharePointError(
      `File not found: ${filePath}`,
      ERROR_CODES.NOT_FOUND,
      404,
      { filePath }
    );
  }
  
  // Validate file path
  if (!Validators.isValidFilePath(filePath)) {
    throw new SharePointError(
      `Invalid file path: ${filePath}`,
      ERROR_CODES.INVALID_PATH,
      400,
      { filePath }
    );
  }
  
  // Validate folder path
  if (!Validators.isValidFolderPath(targetFolder)) {
    throw new SharePointError(
      `Invalid folder path: ${targetFolder}`,
      ERROR_CODES.INVALID_PATH,
      400,
      { targetFolder }
    );
  }
  
  logger.info('Starting file upload operation', {
    filePath,
    siteUrl,
    targetFolder,
    overwrite: options.overwrite || false
  });
  
  try {
    const result = await client.uploadFile({
      filePath,
      targetFolder,
      overwrite: options.overwrite || false
    });
    
    logger.info('Upload operation completed successfully', result);
    return result;
  } catch (error) {
    logger.error('Upload operation failed', {
      error: error.message,
      filePath,
      targetFolder
    });
    throw error;
  }
}

module.exports = { uploadFile };
