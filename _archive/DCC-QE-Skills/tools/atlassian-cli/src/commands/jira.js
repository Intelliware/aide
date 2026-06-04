const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { execSync } = require('child_process');
const JiraClient = require('../api/jira-client');
const { fetchIssue: fetchIssueCore } = require('../core/fetch-issue');
const { searchIssues: searchIssuesCore } = require('../core/search-issues');
const IssueCreator = require('../core/create-issue');
const IssueUpdater = require('../core/update-issue');
const StatusUpdater = require('../core/update-status');
const { loadEnv } = require('../utils/env-loader');
const { listAttachments: listJiraAttachments, downloadAttachments: downloadJiraAttachments, uploadAttachment: uploadJiraAttachment } = require('../core/attachments-jira');

loadEnv();

/**
 * Resolve JSON data from either --data (inline string) or --data-file (path to JSON file).
 * Returns the raw JSON string, or throws if neither is provided or the file can't be read.
 */
function resolveDataOption(options, required = false) {
  if (options.dataFile) {
    const filePath = path.resolve(options.dataFile);
    if (!fs.existsSync(filePath)) {
      throw new Error(`--data-file path not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try { fs.unlinkSync(filePath); } catch (_) { /* best-effort cleanup */ }
    return content;
  }
  if (options.data) {
    return options.data;
  }
  if (required) {
    throw new Error('Either --data or --data-file is required');
  }
  return null;
}

function jiraCommand(program) {
  const jira = program
    .command('jira')
    .alias('j')
    .description('Fetch and export Jira issues')
    .argument('[key]', 'Issue key (optional, defaults to get command)')
    .addHelpText('after', `

Examples:
  $ atl j issue CEAJ-3843                          # Fetch single issue
  $ atl j issue CEAJ-3843 --fresh                  # Force refresh from API
  $ atl j search "project = CEAJ"                  # Search with JQL
  $ atl j search "status = 'In Progress'" --max 20 # Limit results
  $ atl j related CEAJ-100                         # Fetch epic with all stories
  $ atl j deps CEAJ-3843 --out docs/deps           # Fetch all deps + write markdown
  $ atl j url https://track.td.com/browse/CEAJ-123 # Fetch from URL
  $ atl j create CEAJ                              # Create new issue (interactive)
    `)
    .action(async (key, options, command) => {
      // Default action: if issue key provided without subcommand, fetch it
      if (key && /^[A-Z][A-Z0-9]+-\d+$/.test(key)) {
        await fetchIssue(key, {});
      }
    });

  // Fetch single issue
  jira
    .command('issue <key>')
    .alias('get')
    .description('Fetch a single Jira issue')
    .option('--fresh', 'Force fetch from API, ignore cache')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/jira)')
    .addHelpText('after', `

Examples:
  $ atl j issue CEAJ-3843          # Fetch issue (uses cache)
  $ atl j issue CEAJ-3843 --fresh  # Force API fetch
  $ atl j get DIGSTART-1234        # Alias command
    `)
    .action(async (key, options) => {
      await fetchIssue(key, options);
    });

  // Fetch by URL
  jira
    .command('url <url>')
    .description('Fetch issue from Jira URL')
    .option('--fresh', 'Force fetch from API, ignore cache')
    .option('-o, --output <dir>', 'Output directory (default: ./atl/jira)')
    .action(async (url, options) => {
      const issueKey = JiraClient.parseUrl(url).issueKey;
      if (!issueKey) {
        console.error(chalk.red('\n✗ Could not extract issue key from URL\n'));
        process.exit(1);
      }
      await fetchIssue(issueKey, options);
    });

  // Fetch all related issues and Confluence pages
  jira
    .command('related <key>')
    .description('Fetch all related Jira issues and Confluence pages')
    .option('--subtasks-only', 'Fetch only direct subtasks')
    .option('--quiet', 'Suppress cached issues list')
    .addHelpText('after', `

Examples:
  $ atl j related CEAJ-100              # Fetch epic with all child stories
  $ atl j related CEAJ-100 --quiet      # Suppress verbose output
  $ atl j related CEAJ-200 --subtasks-only  # Only direct subtasks
    `)
    .action((key, options) => {
      const scriptPath = path.join(__dirname, '../standalone/fetch-related.js');
      const args = [key];
      if (options.subtasksOnly) args.push('--subtasks-only');
      if (options.quiet) args.push('--quiet');
      
      try {
        execSync(`node "${scriptPath}" ${args.join(' ')}`, {
          cwd: process.cwd(),
          stdio: 'inherit'
        });
      } catch (error) {
        process.exit(error.status || 1);
      }
    });

  // Search issues by JQL
  jira
    .command('search <jql>')
    .description('Search issues using JQL (Jira Query Language)')
    .option('--max <number>', 'Maximum number of results (default: 50)', '50')
    .option('--fields <list>', 'Comma-separated field list (default: all)')
    .option('--no-summary', 'Skip generating search summary file')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/jira)')
    .addHelpText('after', `

Examples:
  $ atl j search "project = CEAJ"                      # All CEAJ issues
  $ atl j search "status = 'In Progress'"              # By status
  $ atl j search "assignee = currentUser()"            # My issues
  $ atl j search "project = CEAJ" --max 20            # Limit results
  $ atl j search "type = Story" --fields summary,status # Specific fields
    `)
    .action(async (jql, options) => {
      await searchIssues(jql, options);
    });

  // Create new issue
  jira
    .command('create [projectKey]')
    .description('Create a new Jira issue (interactive or with --data)')
    .option('-t, --template <name>', 'Use issue template')
    .option('--data <json>', 'Issue data as JSON string (non-interactive)')
    .option('--data-file <path>', 'Path to a JSON file containing issue data (non-interactive)')
    .action(async (projectKey, options) => {
      await createIssue(projectKey, options);
    });

  // Update existing issue
  jira
    .command('update <key>')
    .description('Update an existing Jira issue')
    .option('--data <json>', 'Issue data as JSON string')
    .option('--data-file <path>', 'Path to a JSON file containing issue data')
    .action(async (key, options) => {
      await updateIssue(key, options);
    });

  // List/download attachments
  jira
    .command('attachments <key>')
    .description('List and download all attachments from a Jira issue')
    .option('--fresh', 'Re-download even if already cached')
    .option('--list-only', 'List attachments without downloading')
    .option('-o, --output <dir>', 'Output directory (default: ./cache/jira/<PROJECT>/<KEY>/attachments)')
    .addHelpText('after', `

Examples:
  $ atl j attachments CEAJ-3843              # Download all attachments
  $ atl j attachments CEAJ-3843 --list-only  # List without downloading
  $ atl j attachments CEAJ-3843 --fresh      # Re-download all
    `)
    .action(async (key, options) => {
      await jiraAttachments(key, options);
    });

  // Upload attachment to issue
  jira
    .command('attach <key>')
    .description('Upload a file as an attachment to a Jira issue')
    .requiredOption('--file <path>', 'Path to the file to upload')
    .addHelpText('after', `

Examples:
  $ atl j attach CEAJ-3843 --file ./report.pdf
  $ atl j attach CEAJ-3843 --file ./screenshot.png
    `)
    .action(async (key, options) => {
      await jiraAttach(key, options);
    });

  // Extract all dependencies and write markdown files
  jira
    .command('deps <key>')
    .alias('extract-deps')
    .description('Fetch all dependencies (issuelinks + subtasks) and write a markdown file for each')
    .option('--out <dir>', 'Output directory for markdown files')
    .option('--fresh', 'Force re-fetch all issues from API, bypassing cache')
    .addHelpText('after', `

Examples:
  $ atl j deps CEAJ-3843                                          # Auto-resolve output dir
  $ atl j deps CEAJ-3843 --out docs/requirements/CEAJ-3843/deps  # Explicit output dir
  $ atl j deps CEAJ-3843 --fresh                                  # Force fresh fetch of all deps
    `)
    .action((key, options) => {
      const scriptPath = path.join(__dirname, '../standalone/extract-deps.js');
      const args = [key];
      if (options.out)   args.push('--out', options.out);
      if (options.fresh) args.push('--fresh');

      try {
        execSync(`node "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`, {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
      } catch (error) {
        process.exit(error.status || 1);
      }
    });

  // Update issue status
  jira
    .command('transition <key>')
    .alias('status')
    .description('Update issue status with mandatory field validation')
    .option('-s, --status <name>', 'Target status name (non-interactive)')
    .option('-c, --comment <text>', 'Add comment')
    .action(async (key, options) => {
      await updateStatus(key, options);
    });
}

async function fetchIssue(issueKey, options) {
  // Validate issue key format
  if (!/^[A-Z][A-Z0-9]+-\d+$/.test(issueKey)) {
    console.error(chalk.red('\n✗ Invalid issue key format'));
    console.error(chalk.gray('  Expected: PROJECT-123 (e.g., CEAJ-3843)'));
    console.error(chalk.gray(`  Received: ${issueKey}`));
    console.error(chalk.yellow('\n💡 Tip: Issue keys are PROJECT-NUMBER\n'));
    process.exit(1);
  }

  // Check authentication before fetching
  if (!process.env.JIRA_URL || !process.env.JIRA_TOKEN) {
    console.error(chalk.red('\n✗ Missing Jira credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  const useCache = !options.fresh;
  const outputDir = options.output;
  
  // Call core function
  const result = await fetchIssueCore(issueKey, {
    useCache,
    outputDir,
    silent: false
  });
  
  if (!result.success) {
    console.error(chalk.red('\n✗ Error fetching issue:'), result.error);
    
    if (result.errorResponse) {
      const status = result.errorResponse.status;
      console.error(chalk.gray(`  Status: ${status}`));
      
      // Provide specific error guidance
      if (status === 404) {
        console.error(chalk.yellow('\n💡 Issue not found. Please verify:'));
        console.error(chalk.gray('  • Issue key is correct'));
        console.error(chalk.gray('  • You have permission to view this issue'));
        console.error(chalk.gray('  • Issue has not been deleted\n'));
      } else if (status === 401 || status === 403) {
        console.error(chalk.yellow('\n💡 Authentication failed. Please:'));
        console.error(chalk.gray('  • Run: atl auth login'));
        console.error(chalk.gray('  • Check your API token is valid'));
        console.error(chalk.gray('  • Verify you have project access\n'));
      } else if (status >= 500) {
        console.error(chalk.yellow('\n💡 Server error. Please:'));
        console.error(chalk.gray('  • Try again in a few moments'));
        console.error(chalk.gray('  • Check Jira server status\n'));
      }
    }
    
    process.exit(1);
  }
}


async function createIssue(projectKey, options) {
  try {
    const config = {
      jiraUrl: process.env.JIRA_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_TOKEN,
      workspaceRoot: process.cwd()
    };

    // Validate config
    if (!config.jiraUrl || !config.email || !config.apiToken) {
      console.error(chalk.red('\n✗ Missing Jira credentials. Run: atl auth login\n'));
      process.exit(1);
    }

    const creator = new IssueCreator(config);

    let result;
    
    // Non-interactive mode with --data or --data-file flag
    const rawData = resolveDataOption(options);
    if (rawData) {
      try {
        const issueData = JSON.parse(rawData);
        
        // Ensure we have a project key
        if (!issueData.project && !projectKey) {
          console.error(chalk.red('\n✗ Project key is required. Provide via argument or in data.project\n'));
          process.exit(1);
        }
        
        // Use projectKey from argument if not in data
        if (!issueData.project) {
          issueData.project = { key: projectKey };
        }
        
        result = await creator.createFromData(issueData);
      } catch (parseError) {
        console.error(chalk.red(`\n✗ Invalid JSON data: ${parseError.message}\n`));
        process.exit(1);
      }
    }
    // Interactive mode
    else if (options.template) {
      result = await creator.createFromTemplate(projectKey, options.template);
    } else {
      result = await creator.createInteractive(projectKey);
    }

    if (result) {
      console.log(chalk.green(`\n✅ Issue created successfully: ${result.key}\n`));
      // Output just the issue key for scripting
      if (options.data) {
        console.log(result.key);
      }
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to create issue: ${error.message}\n`));
    process.exit(1);
  }
}

async function updateIssue(issueKey, options) {
  try {
    // Validate issue key format
    if (!/^[A-Z][A-Z0-9]+-\d+$/.test(issueKey)) {
      console.error(chalk.red('\n✗ Invalid issue key format'));
      console.error(chalk.gray('  Expected: PROJECT-123 (e.g., CEAJ-3843)'));
      console.error(chalk.gray(`  Received: ${issueKey}\n`));
      process.exit(1);
    }

    const config = {
      jiraUrl: process.env.JIRA_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_TOKEN,
      workspaceRoot: process.cwd()
    };

    // Validate config
    if (!config.jiraUrl || !config.email || !config.apiToken) {
      console.error(chalk.red('\n✗ Missing Jira credentials. Run: atl auth login\n'));
      process.exit(1);
    }

    let rawUpdateData;
    try {
      rawUpdateData = resolveDataOption(options, true);
    } catch (e) {
      console.error(chalk.red(`\n✗ ${e.message}`));
      console.error(chalk.gray('  Example: atl j update ISSUE-123 --data \'{"summary":"New title"}\'\n'));
      console.error(chalk.gray('  Or:      atl j update ISSUE-123 --data-file ./update.json\n'));
      process.exit(1);
    }

    const updater = new IssueUpdater(config);

    // Verify issue exists first
    const exists = await updater.verifyIssueExists(issueKey);
    if (!exists.exists) {
      console.error(chalk.red(`\n✗ Issue ${issueKey} not found\n`));
      process.exit(1);
    }

    // Parse and update
    let issueData;
    try {
      issueData = JSON.parse(rawUpdateData);
    } catch (parseError) {
      console.error(chalk.red(`\n✗ Invalid JSON data: ${parseError.message}\n`));
      process.exit(1);
    }

    const result = await updater.updateIssue(issueKey, issueData, { silent: false });

    if (result.success) {
      console.log(chalk.green(`\n✅ Issue ${issueKey} updated successfully\n`));
      // Output just the issue key for scripting
      console.log(issueKey);
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to update issue: ${error.message}\n`));
    process.exit(1);
  }
}

async function updateStatus(issueKey, options) {
  try {
    const config = {
      jiraUrl: process.env.JIRA_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_TOKEN,
      workspaceRoot: process.cwd()
    };

    // Validate config
    if (!config.jiraUrl || !config.email || !config.apiToken) {
      console.error(chalk.red('\n✗ Missing Jira credentials. Run: atl auth login\n'));
      process.exit(1);
    }

    const updater = new StatusUpdater(config);

    let result;
    if (options.status) {
      // Non-interactive mode
      result = await updater.updateStatus(issueKey, options.status, {}, options.comment);
    } else {
      // Interactive mode
      result = await updater.updateInteractive(issueKey);
    }

    if (result && result.success) {
      console.log(chalk.green(`\n✅ Status updated successfully\n`));
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to update status: ${error.message}\n`));
    process.exit(1);
  }
}

async function searchIssues(jql, options) {
  // Check authentication before searching
  if (!process.env.JIRA_URL || !process.env.JIRA_TOKEN) {
    console.error(chalk.red('\n✗ Missing Jira credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  const maxResults = parseInt(options.max) || 50;
  const fields = options.fields ? options.fields.split(',') : ['*all'];
  const saveSummary = options.summary !== false; // Negated by --no-summary
  const outputDir = options.output;
  
  // Call core function
  const result = await searchIssuesCore(jql, {
    maxResults,
    fields,
    outputDir,
    silent: false,
    saveIndividual: true,
    saveSummary
  });
  
  if (!result.success) {
    console.error(chalk.red('\n✗ Error executing search:'), result.error);
    
    if (result.errorResponse) {
      const status = result.errorResponse.status;
      console.error(chalk.gray(`  Status: ${status}`));
      
      // Provide specific error guidance
      if (status === 400) {
        console.error(chalk.yellow('\n💡 JQL syntax error. Check your query:'));
        console.error(chalk.gray(`  Query: ${jql}`));
        console.error(chalk.gray('  Common fixes:'));
        console.error(chalk.gray('    • Use quotes for multi-word values: status = "In Progress"'));
        console.error(chalk.gray('    • Check field names are correct'));
        console.error(chalk.gray('    • Use AND/OR for multiple conditions\n'));
      } else if (status === 401 || status === 403) {
        console.error(chalk.yellow('\n💡 Authentication failed. Please:'));
        console.error(chalk.gray('  • Run: atl auth login'));
        console.error(chalk.gray('  • Check your API token is valid'));
        console.error(chalk.gray('  • Verify you have project access\n'));
      }
    }
    
    process.exit(1);
  }
}

async function jiraAttachments(issueKey, options) {
  if (!/^[A-Z][A-Z0-9]+-\d+$/.test(issueKey)) {
    console.error(chalk.red('\n✗ Invalid issue key format'));
    console.error(chalk.gray(`  Expected: PROJECT-123, received: ${issueKey}\n`));
    process.exit(1);
  }

  if (!process.env.JIRA_URL || !process.env.JIRA_TOKEN) {
    console.error(chalk.red('\n✗ Missing Jira credentials'));
    console.error(chalk.yellow('\n💡 Run: atl auth login\n'));
    process.exit(1);
  }

  try {
    if (options.listOnly) {
      // List only — no download
      console.log(chalk.blue(`\n🔍 Listing attachments for ${issueKey}...`));
      const { summary, attachments } = await listJiraAttachments(issueKey);
      console.log(chalk.gray(`   ${summary}`));

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
      console.log(chalk.blue(`\n📥 Downloading attachments for ${issueKey}...`));
      const result = await downloadJiraAttachments(issueKey, {
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

async function jiraAttach(issueKey, options) {
  if (!/^[A-Z][A-Z0-9]+-\d+$/.test(issueKey)) {
    console.error(chalk.red('\n✗ Invalid issue key format'));
    console.error(chalk.gray(`  Expected: PROJECT-123, received: ${issueKey}\n`));
    process.exit(1);
  }

  if (!process.env.JIRA_URL || !process.env.JIRA_TOKEN) {
    console.error(chalk.red('\n✗ Missing Jira credentials'));
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
    console.log(chalk.blue(`\n📎 Uploading ${path.basename(resolvedPath)} to ${issueKey}...`));
    const result = await uploadJiraAttachment(issueKey, resolvedPath);

    const uploaded = Array.isArray(result) ? result : [result];
    console.log(chalk.green(`\n  ✓ Uploaded ${uploaded.length} file(s) to ${issueKey}`));
    uploaded.forEach(a => {
      console.log(chalk.gray(`    • ${a.filename} (id: ${a.id})`));
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

module.exports = jiraCommand;
