const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ConfluenceClient = require('../api/confluence-client');
const { fetchPage } = require('./fetch-page');
const { getWorkspaceRoot } = require('../utils/env-loader');

/**
 * Fetch a Confluence page tree (parent + all descendants)
 * @param {string} pageId - Parent page ID
 * @param {object} options - Fetch options
 * @param {boolean} options.useCache - Use cached data if available
 * @param {string} options.outputDir - Output directory
 * @param {number} options.depth - Maximum depth to traverse (default: Infinity)
 * @param {boolean} options.silent - Suppress console output
 * @param {boolean} options.fetchAttachments - Fetch attachments (Gliffy diagrams) for each page (default: true)
 * @returns {Promise<object>} Result object with success status and page tree data
 */
async function fetchPageTree(pageId, options = {}) {
  const {
    useCache = true,
    outputDir,
    depth = Infinity,
    silent = false,
    fetchAttachments = false
  } = options;

  const workspaceRoot = getWorkspaceRoot();
  const defaultOutputDir = process.env.OUTPUT_DIR 
    ? (path.isAbsolute(process.env.OUTPUT_DIR) 
        ? process.env.OUTPUT_DIR 
        : path.join(workspaceRoot, process.env.OUTPUT_DIR))
    : path.join(workspaceRoot, 'cache');
  
  const baseDir = outputDir || path.join(defaultOutputDir, 'confluence');

  if (!silent) {
    console.log(chalk.blue('\n🌳 Fetching Confluence page tree...'));
    console.log(chalk.gray(`   Parent Page ID: ${pageId}`));
    console.log(chalk.gray(`   Max Depth: ${depth === Infinity ? 'Unlimited' : depth}`));
    console.log(chalk.gray(`   Output: ${baseDir}\n`));
  }

  try {
    // Step 1: Fetch parent page
    if (!silent) {
      console.log(chalk.blue('📄 Fetching parent page...'));
    }

    const parentResult = await fetchPage(pageId, {
      useCache,
      outputDir,
      silent: true
    });

    if (!parentResult.success) {
      return {
        success: false,
        error: 'Failed to fetch parent page',
        details: parentResult.error
      };
    }

    const parentPage = parentResult.page;
    const pages = [parentPage];

    if (!silent) {
      console.log(chalk.green(`   ✓ Parent: ${parentPage.title}`));
    }

    // Step 2: Fetch descendants if depth > 0
    if (depth > 0) {
      if (!silent) {
        console.log(chalk.blue('\n🔍 Fetching child pages...'));
      }

      const client = new ConfluenceClient();
      const descendants = await client.getDescendants(pageId, depth);

      if (!silent) {
        console.log(chalk.green(`   ✓ Found ${descendants.length} child page(s)`));
      }

      // Fetch each descendant page to cache it
      for (let i = 0; i < descendants.length; i++) {
        const child = descendants[i];
        
        if (!silent) {
          console.log(chalk.gray(`   [${i + 1}/${descendants.length}] ${child.title}...`));
        }

        const childResult = await fetchPage(child.id, {
          useCache,
          outputDir,
          silent: true
        });

        if (childResult.success) {
          pages.push(childResult.page);
          
        } else {
          if (!silent) {
            console.log(chalk.yellow(`      ⚠️  Failed to fetch: ${child.title}`));
          }
        }
      }
    }

    // Step 3: Save tree metadata
    const parentDir = findPageDir(baseDir, pageId);
    if (parentDir) {
      const treeMetadata = {
        parentId: pageId,
        parentTitle: parentPage.title,
        totalPages: pages.length,
        depth: depth === Infinity ? 'unlimited' : depth,
        lastFetch: new Date().toISOString(),
        pages: pages.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          version: p.version.number,
          spaceKey: p.space.key
        }))
      };

      const treePath = path.join(parentDir, '.tree.json');
      fs.writeFileSync(treePath, JSON.stringify(treeMetadata, null, 2));

      if (!silent) {
        console.log(chalk.green(`\n✓ Saved tree metadata: ${treePath}`));
      }
    }

    if (!silent) {
      console.log(chalk.green(`\n✅ Page tree fetched successfully!`));
      console.log(chalk.blue(`\n📊 Summary:`));
      console.log(chalk.gray(`   Parent: ${parentPage.title}`));
      console.log(chalk.gray(`   Children: ${pages.length - 1}`));
      console.log(chalk.gray(`   Total Pages: ${pages.length}`));
      console.log(chalk.gray(`   Cache: ${baseDir}\n`));
    }

    return {
      success: true,
      parentPage,
      pages,
      totalPages: pages.length
    };

  } catch (error) {
    if (!silent) {
      console.error(chalk.red('\n✗ Error fetching page tree:'), error.message);
    }

    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Find the directory for a cached page
 * @param {string} baseDir - Base directory to search
 * @param {string} pageId - Page ID to find
 * @returns {string|null} Directory path or null if not found
 */
function findPageDir(baseDir, pageId) {
  if (!fs.existsSync(baseDir)) {
    return null;
  }

  // Search through all space directories
  const spaces = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const space of spaces) {
    const spaceDir = path.join(baseDir, space);
    const pageDirs = fs.readdirSync(spaceDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pageDir of pageDirs) {
      if (pageDir.startsWith(`${pageId}-`)) {
        return path.join(spaceDir, pageDir);
      }
    }
  }

  return null;
}

module.exports = {
  fetchPageTree
};
