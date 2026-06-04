/**
 * Update Confluence Page Module
 * Handles updating existing Confluence pages
 */

const chalk = require('chalk');
const ora = require('ora');
const ConfluenceClient = require('../api/confluence-client');

/**
 * Update an existing Confluence page
 * @param {string} pageId - Page ID to update
 * @param {Object} updateData - Update data
 * @param {string} updateData.title - New page title (optional)
 * @param {string} updateData.content - New page content (optional)
 * @param {number} updateData.version - Version number (optional, will be fetched if not provided)
 * @param {string} updateData.representation - Content format: 'storage', 'wiki', or 'view' (default: 'storage')
 * @param {Object} options - Additional options
 * @param {boolean} options.silent - Suppress console output
 * @returns {Promise<Object>} Updated page info
 */
async function updatePage(pageId, updateData, options = {}) {
  const spinner = options.silent ? null : ora(`Updating page ${pageId}...`).start();

  try {
    // Validate page ID
    if (!/^\d+$/.test(pageId)) {
      throw new Error(`Invalid page ID format: ${pageId}. Expected numeric ID.`);
    }

    // Validate we have something to update
    if (!updateData.title && !updateData.content) {
      throw new Error('Either title or content must be provided for update');
    }

    // Initialize client
    const client = new ConfluenceClient();

    // If version not provided, fetch current page to get version
    if (!updateData.version) {
      if (spinner) {
        spinner.text = 'Fetching current page version...';
      }
      const currentPage = await client.getPage(pageId, ['version']);
      updateData.version = currentPage.version.number + 1;
    }

    // Update page
    if (spinner) {
      spinner.text = 'Updating page...';
    }
    const result = await client.updatePage(pageId, updateData);

    if (spinner) {
      spinner.succeed(chalk.green(`Page updated: ${result.title} (v${result.version})`));
      console.log(chalk.blue(`\n🔗 ${result.url}\n`));
    }

    return {
      success: true,
      pageId: result.id,
      title: result.title,
      version: result.version,
      url: result.url
    };

  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red('Failed to update page'));
    }

    // Extract error details
    let errorMessage = error.message;
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      console.error(chalk.red(`\nError: ${error.response.status} ${error.response.statusText}`));
      
      // Handle version conflict
      if (error.response.status === 409) {
        console.error(chalk.yellow('\n💡 Version conflict detected. The page may have been updated by someone else.'));
        console.error(chalk.gray('   Try fetching the latest version first.\n'));
      }
    }

    return {
      success: false,
      error: errorMessage,
      errorResponse: error.response
    };
  }
}

/**
 * Update page from JSON data string
 * Used by CLI with --data flag
 * @param {string} pageId - Page ID
 * @param {string} jsonData - JSON string of update data
 * @param {Object} options - Additional options
 */
async function updatePageFromJson(pageId, jsonData, options = {}) {
  let updateData;
  
  try {
    updateData = JSON.parse(jsonData);
  } catch (error) {
    throw new Error(`Invalid JSON data: ${error.message}`);
  }

  return await updatePage(pageId, updateData, options);
}

module.exports = {
  updatePage,
  updatePageFromJson
};
