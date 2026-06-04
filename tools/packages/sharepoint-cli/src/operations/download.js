const fs = require('fs');
const path = require('path');
const { Validators } = require('@ea-workspace/shared-utils');

/**
 * Find workspace root by looking for workspace markers
 */
function findWorkspaceRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;
  
  while (currentDir !== root) {
    // Check for workspace markers
    if (fs.existsSync(path.join(currentDir, '.env')) ||
        fs.existsSync(path.join(currentDir, 'easyapply.code-workspace')) ||
        fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Default to current directory if no workspace found
  return startDir;
}

/**
 * Download file from SharePoint
 * @param {string} fileUrl - SharePoint file URL  
 * @param {string} outputPath - Local output path
 * @param {Object} client - SharePoint client instance
 * @param {Object} logger - Logger instance
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Download result
 */
async function downloadFile(fileUrl, outputPath, client, logger, options = {}) {
  // Resolve output path relative to workspace root if it's a relative path
  let resolvedOutputPath = outputPath;
  if (!path.isAbsolute(outputPath)) {
    const workspaceRoot = findWorkspaceRoot();
    resolvedOutputPath = path.join(workspaceRoot, outputPath);
    logger.info('Resolved output path relative to workspace root', {
      workspaceRoot,
      relativePath: outputPath,
      absolutePath: resolvedOutputPath
    });
  }
  
  logger.info('Starting file download operation', {
    fileUrl,
    outputPath: resolvedOutputPath
  });
  
  // Create output directory if needed
  const outputDir = path.dirname(resolvedOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const result = await client.downloadFile({
      fileUrl,
      itemId: options.itemId,
      outputPath: resolvedOutputPath
    });
    
    logger.info('Download operation completed successfully', result);
    return result;
  } catch (error) {
    logger.error('Download operation failed', {
      error: error.message,
      fileUrl,
      outputPath: resolvedOutputPath
    });
    throw error;
  }
}

module.exports = { downloadFile };