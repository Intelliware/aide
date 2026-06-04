/**
 * Create Confluence Page Module
 * Handles creation of new Confluence pages
 */

const chalk = require('chalk');
const ora = require('ora');
const ConfluenceClient = require('../api/confluence-client');

/**
 * Create a new Confluence page
 * @param {Object} pageData - Page data
 * @param {string} pageData.space - Space key (required)
 * @param {string} pageData.title - Page title (required)
 * @param {string} pageData.content - Page content in Confluence storage format (required)
 * @param {string} pageData.parentId - Parent page ID (optional)
 * @param {string} pageData.representation - Content format: 'storage', 'wiki', or 'view' (default: 'storage')
 * @param {Object} options - Additional options
 * @param {boolean} options.silent - Suppress console output
 * @returns {Promise<Object>} Created page info with id, title, url
 */
async function createPage(pageData, options = {}) {
  const spinner = options.silent ? null : ora('Creating Confluence page...').start();

  try {
    // Validate required fields
    if (!pageData.space || !pageData.title || !pageData.content) {
      throw new Error('space, title, and content are required');
    }

    // Initialize client
    const client = new ConfluenceClient();

    // Create page
    const result = await client.createPage(pageData);

    if (spinner) {
      spinner.succeed(chalk.green(`Page created: ${result.title}`));
      console.log(chalk.blue(`\n🔗 ${result.url}\n`));
    }

    return {
      success: true,
      pageId: result.id,
      title: result.title,
      space: result.space,
      url: result.url
    };

  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red('Failed to create page'));
    }

    // Extract error details
    let errorMessage = error.message;
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      console.error(chalk.red(`\nError: ${error.response.status} ${error.response.statusText}`));
    }

    return {
      success: false,
      error: errorMessage,
      errorResponse: error.response
    };
  }
}

/**
 * Create page from JSON data string
 * Used by CLI with --data flag
 * @param {string} jsonData - JSON string of page data
 * @param {Object} options - Additional options
 */
async function createPageFromJson(jsonData, options = {}) {
  let pageData;
  
  try {
    pageData = JSON.parse(jsonData);
  } catch (error) {
    throw new Error(`Invalid JSON data: ${error.message}`);
  }

  return await createPage(pageData, options);
}

module.exports = {
  createPage,
  createPageFromJson
};
