const path = require('path');
const chalk = require('chalk');
const { fetchPage } = require('../core/fetch-page');
const { fetchPageTree } = require('../core/fetch-page-tree');
const { createPage, createPageFromJson } = require('../core/create-page');
const { updatePage, updatePageFromJson } = require('../core/update-page');
const { loadEnv } = require('../utils/env-loader');
const { listAttachments: listConfluenceAttachments, downloadAttachments: downloadConfluenceAttachments, uploadAttachment: uploadConfluenceAttachment } = require('../core/attachments-confluence');

loadEnv();

function confluenceCommand(program) {
  const confluence = program
    .command('confluence')
    .alias('c')
    .description('Fetch and export Confluence pages')
    .addHelpText('after', `

Examples:
  $ atl c page 3579197259                    # Fetch single page
  $ atl c page 3579197259 --with-jira        # Fetch page with Jira issue data
  $ atl c page 3579197259 --fresh            # Force refresh from API
  $ atl c tree 3579197259                    # Fetch page tree (parent + children)
  $ atl c url https://your-confluence.atlassian.net/... # Fetch from URL
  $ atl c refresh-jira 3579197259            # Refresh only Jira data
    `);

  // Fetch single page
  confluence
    .command('page <pageId>')
    .description('Fetch a single Confluence page')
    .option('--fresh', 'Force fetch from API, ignore cache')
    .option('--with-jira', 'Fetch live data for referenced Jira issues')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/confluence)')
    .action(async (pageId, options) => {
      await fetchConfluencePage(pageId, options);
    });

  // Fetch by URL
  confluence
    .command('url <url>')
    .description('Fetch page from Confluence URL')
    .option('--fresh', 'Force fetch from API, ignore cache')
    .option('--with-jira', 'Fetch live data for referenced Jira issues')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/confluence)')
    .action(async (url, options) => {
      const pageId = extractPageIdFromUrl(url);
      if (!pageId) {
        console.error(chalk.red('\n✗ Could not extract page ID from URL'));
        console.error(chalk.gray(`  URL: ${url}`));
        console.error(chalk.yellow('\n💡 Supported URL formats:'));
        console.error(chalk.gray('  • https://confluence.example.com/pages/viewpage.action?pageId=123456'));
        console.error(chalk.gray('  • https://confluence.example.com/display/SPACE/Page?pageId=123456'));
        console.error(chalk.gray('  • https://confluence.example.com/spaces/SPACE/pages/123456/Title'));
        console.error(chalk.yellow('\n💡 Or use: atl c page <pageId>\n'));
        process.exit(1);
      }
      await fetchConfluencePage(pageId, { ...options, url });
    });

  // Refresh Jira data for cached page
  confluence
    .command('refresh-jira <pageId>')
    .description('Refresh Jira issue data for a cached Confluence page')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/confluence)')
    .action(async (pageId, options) => {
      await refreshJiraForPage(pageId, options);
    });

  // Fetch page tree (parent + all descendants)
  confluence
    .command('tree <pageId>')
    .description('Fetch page tree (parent and all child pages)')
    .option('--fresh', 'Force fetch from API, ignore cache')
    .option('--depth <number>', 'Maximum depth to traverse (default: Infinity)', parseInt)
    .option('-o, --output <dir>', 'Output directory (default: ./cache/confluence)')
    .addHelpText('after', `

Examples:
  $ atl c tree 3579197259              # Fetch parent + all children
  $ atl c tree 3579197259 --depth 2    # Limit to 2 levels deep
  $ atl c tree 3579197259 --fresh      # Force fresh fetch

Use Case:
  Extract complete requirements documentation with all child pages
  for AI context or feature artifact generation.
    `)
    .action(async (pageId, options) => {
      await fetchConfluencePageTree(pageId, options);
    });

  // Create new page
  confluence
    .command('create')
    .description('Create a new Confluence page')
    .option('--space <key>', 'Space key (required)')
    .option('--title <title>', 'Page title (required)')
    .option('--content <content>', 'Page content (required)')
    .option('--parent <pageId>', 'Parent page ID (optional)')
    .option('--data <json>', 'Complete page data as JSON string (alternative to individual options)')
    .option('--representation <type>', 'Content representation type (storage, wiki, view)', 'storage')
    .action(async (options) => {
      await createConfluencePage(options);
    });

  // Update existing page
  confluence
    .command('update <pageId>')
    .description('Update an existing Confluence page')
    .option('--title <title>', 'New page title (optional)')
    .option('--content <content>', 'New page content (optional)')
    .option('--version <number>', 'Version number (optional, will auto-increment if not provided)', parseInt)
    .option('--data <json>', 'Complete update data as JSON string (alternative to individual options)')
    .option('--representation <type>', 'Content representation type (storage, wiki, view)', 'storage')
    .action(async (pageId, options) => {
      await updateConfluencePage(pageId, options);
    });

  // List/download attachments
  confluence
    .command('attachments <pageId>')
    .description('List and download all attachments from a Confluence page')
    .option('--fresh', 'Re-download even if already cached')
    .option('--list-only', 'List attachments without downloading')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/confluence/<PAGE_ID>/attachments)')
    .addHelpText('after', `

Examples:
  $ atl c attachments 3579197259              # Download all attachments
  $ atl c attachments 3579197259 --list-only  # List without downloading
  $ atl c attachments 3579197259 --fresh      # Re-download all
    `)
    .action(async (pageId, options) => {
      await confluenceAttachments(pageId, options);
    });

  // Upload attachment to page
  confluence
    .command('attach <pageId>')
    .description('Upload a file as an attachment to a Confluence page')
    .requiredOption('--file <path>', 'Path to the file to upload')
    .option('--comment <text>', 'Version comment for the attachment')
    .addHelpText('after', `

Examples:
  $ atl c attach 3579197259 --file ./report.pdf
  $ atl c attach 3579197259 --file ./diagram.png --comment "Updated diagram"
    `)
    .action(async (pageId, options) => {
      await confluenceAttach(pageId, options);
    });
}

async function fetchConfluencePage(pageId, options) {
  // Validate page ID format
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray('  Expected: Numeric ID (e.g., 3309101741)'));
    console.error(chalk.gray(`  Received: ${pageId}`));
    console.error(chalk.yellow('\n💡 Tip: Extract page ID from Confluence URL'));
    console.error(chalk.gray('  Example: https://confluence.example.com/pages/123456\n'));
    process.exit(1);
  }

  // Check authentication before fetching
  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  const useCache = !options.fresh;
  const outputDir = options.output;
  const fetchJiraDetails = options.withJira || false;
  
  // Call core function
  const result = await fetchPage(pageId, {
    useCache,
    outputDir,
    silent: false,
    url: options.url,
    fetchJiraDetails
  });
  
  if (!result.success) {
    console.error(chalk.red('\n✗ Error fetching page:'), result.error);
    
    if (result.errorResponse) {
      const status = result.errorResponse.status;
      console.error(chalk.gray(`  Status: ${status}`));
      
      // Provide specific error guidance
      if (status === 404) {
        console.error(chalk.yellow('\n💡 Page not found. Please verify:'));
        console.error(chalk.gray('  • Page ID is correct'));
        console.error(chalk.gray('  • You have permission to view this page'));
        console.error(chalk.gray('  • Page has not been deleted\n'));
      } else if (status === 401 || status === 403) {
        console.error(chalk.yellow('\n💡 Authentication failed. Please:'));
        console.error(chalk.gray('  • Run: atl auth login'));
        console.error(chalk.gray('  • Check your API token is valid'));
        console.error(chalk.gray('  • Verify you have page access\n'));
      } else if (status >= 500) {
        console.error(chalk.yellow('\n💡 Server error. Please:'));
        console.error(chalk.gray('  • Try again in a few moments'));
        console.error(chalk.gray('  • Check Confluence server status\n'));
      }
    }
    
    process.exit(1);
  }
}


/**
 * Extract page ID from Confluence URL
 * Supports multiple URL formats:
 * - https://confluence.example.com/pages/viewpage.action?pageId=123456
 * - https://confluence.example.com/display/SPACE/Page+Title?pageId=123456
 * - https://confluence.example.com/spaces/SPACE/pages/123456/Page+Title
 */
function extractPageIdFromUrl(url) {
  // Try pageId query parameter first
  const pageIdMatch = url.match(/[?&]pageId=(\d+)/);
  if (pageIdMatch) {
    return pageIdMatch[1];
  }
  
  // Try /pages/123456/ format
  const pathMatch = url.match(/\/pages\/(\d+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  return null;
}

/**
 * Refresh Jira data for a cached Confluence page
 */
async function refreshJiraForPage(pageId, options) {
  const fs = require('fs');
  const path = require('path');
  const { getWorkspaceRoot } = require('../utils/env-loader');
  
  // Validate page ID format
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray('  Expected: Numeric ID (e.g., 3309101741)'));
    console.error(chalk.gray(`  Received: ${pageId}`));
    process.exit(1);
  }

  // Find cached page
  const workspaceRoot = getWorkspaceRoot();
  const defaultOutputDir = process.env.OUTPUT_DIR 
    ? (path.isAbsolute(process.env.OUTPUT_DIR) 
        ? process.env.OUTPUT_DIR 
        : path.join(workspaceRoot, process.env.OUTPUT_DIR))
    : path.join(workspaceRoot, 'docs');
  
  const baseDir = options.output || path.join(defaultOutputDir, 'confluence');
  
  // Import the findCachedPage function (we'll need to export it)
  const { findCachedPage, extractJiraIssueKeys, fetchJiraIssues } = require('../core/fetch-page');
  
  if (!fs.existsSync(baseDir)) {
    console.error(chalk.red('\n✗ No cached pages found'));
    console.error(chalk.gray(`  Directory: ${baseDir}`));
    console.error(chalk.yellow('\n💡 Fetch a page first: atl c page <pageId>\n'));
    process.exit(1);
  }
  
  const found = findCachedPage(baseDir, pageId);
  
  if (!found) {
    console.error(chalk.red('\n✗ Cached page not found'));
    console.error(chalk.gray(`  Page ID: ${pageId}`));
    console.error(chalk.yellow('\n💡 Fetch the page first: atl c page ' + pageId + '\n'));
    process.exit(1);
  }
  
  console.log(chalk.blue(`\n🔄 Refreshing Jira data for: ${found.meta.title}`));
  console.log(chalk.gray(`   Page ID: ${pageId}`));
  console.log(chalk.gray(`   Location: ${found.dir}\n`));
  
  // Read page JSON to extract issue keys
  const pageJsonPath = path.join(found.dir, `${pageId}.json`);
  
  try {
    const pageData = JSON.parse(fs.readFileSync(pageJsonPath, 'utf8'));
    const issueKeys = extractJiraIssueKeys(pageData.body.storage.value);
    
    if (issueKeys.length === 0) {
      console.log(chalk.yellow('   No Jira issues found in this page\n'));
      return;
    }
    
    console.log(chalk.blue(`   Found ${issueKeys.length} Jira issue(s): ${issueKeys.join(', ')}`));
    console.log(chalk.gray('   Fetching current status and assignee data...\n'));
    
    const jiraIssues = await fetchJiraIssues(issueKeys, false);
    
    if (jiraIssues.length === 0) {
      console.error(chalk.yellow('   ⚠️  No Jira data retrieved\n'));
      return;
    }
    
    // Save updated Jira cache
    const jiraPath = path.join(found.dir, '.jira.json');
    const jiraCache = {
      lastFetch: new Date().toISOString(),
      issueKeys,
      issues: jiraIssues
    };
    fs.writeFileSync(jiraPath, JSON.stringify(jiraCache, null, 2));
    console.log(chalk.green(`✓ Updated Jira cache: ${jiraPath}`));
    
    const analysisPath = path.join(found.dir, `${pageId}.analysis.md`);
    if (fs.existsSync(analysisPath)) {
      console.log(chalk.yellow(`ℹ Existing analysis may now be stale: ${analysisPath}`));
      console.log(chalk.gray('   Re-generate it from the cached JSON if you need updated analysis.'));
    } else {
      console.log(chalk.gray(`ℹ Analysis can be generated from: ${pageJsonPath}`));
    }
    
    console.log(chalk.green(`\n✅ Jira data refreshed successfully!\n`));
    
    // Display summary
    console.log(chalk.blue('📊 Summary:'));
    jiraIssues.forEach(issue => {
      const statusColor = getStatusColor(issue.status);
      console.log(chalk.gray(`   ${issue.key}: `) + chalk[statusColor](issue.status) + chalk.gray(` | ${issue.assignee || 'Unassigned'}`));
    });
    console.log('');
    
  } catch (error) {
    console.error(chalk.red('\n✗ Error refreshing Jira data:'), error.message);
    process.exit(1);
  }
}

/**
 * Get color for status display
 */
function getStatusColor(status) {
  const statusLower = (status || '').toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('complete')) {
    return 'green';
  } else if (statusLower.includes('progress') || statusLower.includes('review')) {
    return 'yellow';
  } else if (statusLower.includes('blocked') || statusLower.includes('error')) {
    return 'red';
  }
  return 'gray';
}

/**
 * Fetch a Confluence page tree (parent + all descendants)
 */
async function fetchConfluencePageTree(pageId, options) {
  // Validate page ID format
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray('  Expected: Numeric ID (e.g., 3309101741)'));
    console.error(chalk.gray(`  Received: ${pageId}`));
    console.error(chalk.yellow('\n💡 Tip: Extract page ID from Confluence URL'));
    console.error(chalk.gray('  Example: https://confluence.example.com/pages/123456\n'));
    process.exit(1);
  }

  // Check authentication before fetching
  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  const useCache = !options.fresh;
  const outputDir = options.output;
  const depth = options.depth || Infinity;

  // Call core function
  const result = await fetchPageTree(pageId, {
    useCache,
    outputDir,
    depth,
    silent: false
  });

  if (!result.success) {
    console.error(chalk.red('\n✗ Error fetching page tree:'), result.error);
    process.exit(1);
  }
}

/**
 * Create a new Confluence page
 */
async function createConfluencePage(options) {
  // Check authentication
  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  try {
    let result;

    // If --data flag is provided, use JSON data
    if (options.data) {
      result = await createPageFromJson(options.data, { silent: false });
    } 
    // Otherwise, use individual options
    else {
      // Validate required options
      if (!options.space || !options.title || !options.content) {
        console.error(chalk.red('\n✗ Missing required options'));
        console.error(chalk.gray('  Required: --space, --title, --content'));
        console.error(chalk.gray('  Or use: --data with complete JSON\n'));
        console.error(chalk.yellow('Example:'));
        console.error(chalk.gray('  atl c create --space MYSPACE --title "My Page" --content "Page content"\n'));
        process.exit(1);
      }

      const pageData = {
        space: options.space,
        title: options.title,
        content: options.content,
        parentId: options.parent,
        representation: options.representation || 'storage'
      };

      result = await createPage(pageData, { silent: false });
    }

    if (!result.success) {
      console.error(chalk.red(`\n✗ Failed to create page: ${result.error}\n`));
      process.exit(1);
    }

    // Output page ID for scripting
    console.log(result.pageId);

  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

/**
 * Update an existing Confluence page
 */
async function updateConfluencePage(pageId, options) {
  // Validate page ID format
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray('  Expected: Numeric ID (e.g., 3309101741)'));
    console.error(chalk.gray(`  Received: ${pageId}\n`));
    process.exit(1);
  }

  // Check authentication
  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  try {
    let result;

    // If --data flag is provided, use JSON data
    if (options.data) {
      result = await updatePageFromJson(pageId, options.data, { silent: false });
    } 
    // Otherwise, use individual options
    else {
      // Validate we have something to update
      if (!options.title && !options.content) {
        console.error(chalk.red('\n✗ Nothing to update'));
        console.error(chalk.gray('  Provide at least one: --title, --content'));
        console.error(chalk.gray('  Or use: --data with complete JSON\n'));
        console.error(chalk.yellow('Example:'));
        console.error(chalk.gray('  atl c update 123456 --title "New Title" --content "New content"\n'));
        process.exit(1);
      }

      const updateData = {
        title: options.title,
        content: options.content,
        version: options.version,
        representation: options.representation || 'storage'
      };

      result = await updatePage(pageId, updateData, { silent: false });
    }

    if (!result.success) {
      console.error(chalk.red(`\n✗ Failed to update page: ${result.error}\n`));
      process.exit(1);
    }

    // Output page ID for scripting
    console.log(pageId);

  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

async function confluenceAttachments(pageId, options) {
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray(`  Expected: numeric ID (e.g., 3579197259), received: ${pageId}\n`));
    process.exit(1);
  }

  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  try {
    if (options.listOnly) {
      // List only — no download
      console.log(chalk.blue(`\n🔍 Listing attachments for page ${pageId}...`));
      const { title, attachments } = await listConfluenceAttachments(pageId);
      console.log(chalk.gray(`   ${title}`));

      if (attachments.length === 0) {
        console.log(chalk.yellow('\n  No attachments found.\n'));
        return;
      }

      console.log(chalk.green(`\n  Found ${attachments.length} attachment(s):\n`));
      attachments.forEach((a, i) => {
        const size = a.size ? `${(a.size / 1024).toFixed(1)} KB` : 'unknown size';
        console.log(chalk.white(`  ${i + 1}. ${a.filename}`) + chalk.gray(` (${size}, ${a.mimeType || 'unknown type'}, by ${a.author})`));
      });
      console.log();
    } else {
      // Download
      console.log(chalk.blue(`\n📥 Downloading attachments for page ${pageId}...`));
      const result = await downloadConfluenceAttachments(pageId, {
        fresh: options.fresh,
        output: options.output
      });

      if (result.total === 0) {
        console.log(chalk.yellow('\n  No attachments found.\n'));
        return;
      }

      if (result.downloaded.length > 0) {
        console.log(chalk.green(`\n  ✓ Downloaded ${result.downloaded.length} file(s):`) + chalk.gray(` → ${result.outputDir}`));
        result.downloaded.forEach(f => console.log(chalk.gray(`    • ${f}`)));
      }
      if (result.skipped.length > 0) {
        console.log(chalk.gray(`\n  Skipped (already cached): ${result.skipped.length} file(s)`) + chalk.gray(' (use --fresh to re-download)'));
        result.skipped.forEach(f => console.log(chalk.gray(`    • ${f}`)));
      }
      if (result.errors && result.errors.length > 0) {
        console.log(chalk.red(`\n  ✗ Failed (${result.errors.length}):`));
        result.errors.forEach(e => console.log(chalk.red(`    • ${e.filename}: ${e.error}`)));
      }
      console.log();
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

async function confluenceAttach(pageId, options) {
  if (!/^\d+$/.test(pageId)) {
    console.error(chalk.red('\n✗ Invalid page ID format'));
    console.error(chalk.gray(`  Expected: numeric ID (e.g., 3579197259), received: ${pageId}\n`));
    process.exit(1);
  }

  const hasUrl = process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL;
  const hasToken = process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!hasUrl || !hasToken) {
    console.error(chalk.red('\n✗ Missing Confluence credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  const filePath = options.file;
  const path = require('path');
  const fs = require('fs');
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(chalk.red(`\n✗ File not found: ${resolvedPath}\n`));
    process.exit(1);
  }

  try {
    console.log(chalk.blue(`\n📎 Uploading ${path.basename(resolvedPath)} to page ${pageId}...`));
    const result = await uploadConfluenceAttachment(pageId, resolvedPath, {
      comment: options.comment
    });

    // Result can be a single object or an object with results array
    const uploaded = result.results ? result.results : (Array.isArray(result) ? result : [result]);
    console.log(chalk.green(`\n  ✓ Uploaded ${uploaded.length} file(s) to page ${pageId}`));
    uploaded.forEach(a => {
      console.log(chalk.gray(`    • ${a.title} (id: ${a.id})`));
    });
    console.log();
  } catch (error) {
    console.error(chalk.red(`\n✗ Upload failed: ${error.message}\n`));
    if (error.response) {
      console.error(chalk.gray(`  Status: ${error.response.status}`));
    }
    process.exit(1);
  }
}

module.exports = confluenceCommand;
