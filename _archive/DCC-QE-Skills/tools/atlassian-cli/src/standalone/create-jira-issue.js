#!/usr/bin/env node

/**
 * Standalone script to create a Jira issue
 * Usage: node create-jira-issue.js PROJECT-KEY [--template TEMPLATE_NAME]
 */

const IssueCreator = require('../core/create-issue');
const { loadEnv } = require('../utils/env-loader');
const { getJiraUrl } = require('../utils/defaults');
const chalk = require('chalk');

loadEnv();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${chalk.blue.bold('Create Jira Issue')}

${chalk.bold('Usage:')}
  node create-jira-issue.js <PROJECT-KEY> [options]

${chalk.bold('Options:')}
  -t, --template <name>   Use issue template
  -h, --help             Show this help

${chalk.bold('Examples:')}
  node create-jira-issue.js CEAJ
  node create-jira-issue.js CEAJ --template user-story
  node create-jira-issue.js OCA -t bug
`);
    process.exit(0);
  }

  const projectKey = args[0];
  
  // Parse options
  let templateName = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--template' || args[i] === '-t') {
      templateName = args[i + 1];
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

  const creator = new IssueCreator(config);

  try {
    let result;
    if (templateName) {
      result = await creator.createFromTemplate(projectKey, templateName);
    } else {
      result = await creator.createInteractive(projectKey);
    }

    if (result) {
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
