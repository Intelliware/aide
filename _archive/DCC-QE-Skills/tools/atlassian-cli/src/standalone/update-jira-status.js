#!/usr/bin/env node

/**
 * Standalone script to update Jira issue status
 * Usage: node update-jira-status.js ISSUE-KEY [--status STATUS_NAME] [--comment TEXT]
 */

const StatusUpdater = require('../core/update-status');
const { loadEnv } = require('../utils/env-loader');
const { getJiraUrl } = require('../utils/defaults');
const chalk = require('chalk');

loadEnv();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${chalk.blue.bold('Update Jira Issue Status')}

${chalk.bold('Usage:')}
  node update-jira-status.js <ISSUE-KEY> [options]

${chalk.bold('Options:')}
  -s, --status <name>    Target status (non-interactive)
  -c, --comment <text>   Add comment
  -h, --help             Show this help

${chalk.bold('Examples:')}
  # Interactive mode (recommended)
  node update-jira-status.js CEAJ-123

  # Direct status change
  node update-jira-status.js CEAJ-123 --status "In Progress"

  # With comment
  node update-jira-status.js CEAJ-123 -s "Done" -c "Completed implementation"
`);
    process.exit(0);
  }

  const issueKey = args[0];
  
  // Parse options
  let status = null;
  let comment = null;
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--status' || args[i] === '-s') {
      status = args[i + 1];
      i++;
    } else if (args[i] === '--comment' || args[i] === '-c') {
      comment = args[i + 1];
      i++;
    }
  }

  // Validate environment
  const jiraEmail = process.env.JIRA_EMAIL || process.env.ATLASSIAN_EMAIL;
  const jiraToken = process.env.JIRA_TOKEN || process.env.ATLASSIAN_TOKEN;
  if (!jiraEmail || !jiraToken) {
    console.error(chalk.red('\n\u2717 Missing Jira credentials in .env file\n'));
    console.log(chalk.dim('Required:'));
    console.log(chalk.dim('  JIRA_EMAIL=your-email@example.com'));
    console.log(chalk.dim('  JIRA_TOKEN=your-token\n'));
    process.exit(1);
  }

  const config = {
    jiraUrl: getJiraUrl(),
    email: jiraEmail,
    apiToken: jiraToken,
    workspaceRoot: process.cwd()
  };

  const updater = new StatusUpdater(config);

  try {
    let result;
    if (status) {
      // Non-interactive mode
      result = await updater.updateStatus(issueKey, status, {}, comment);
    } else {
      // Interactive mode
      result = await updater.updateInteractive(issueKey);
    }

    if (result && result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

main();
