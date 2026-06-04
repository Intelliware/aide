const inquirer = require('inquirer');
const chalk = require('chalk');
const ConfluenceClient = require('../api/confluence-client');
const JiraClient = require('../api/jira-client');

// Lazy-load Conf (ESM) using dynamic import
let configInstance = null;
async function getConfig() {
  if (!configInstance) {
    const { default: Conf } = await import('conf');
    configInstance = new Conf({ projectName: 'atlassian-cli' });
  }
  return configInstance;
}

function authCommand(program) {
  const auth = program
    .command('auth')
    .description('Manage Atlassian authentication');

  // Login command
  auth
    .command('login')
    .description('Save your Atlassian credentials (URL and PAT)')
    .action(async () => {
      const config = await getConfig();
      console.log(chalk.blue('\n🔐 Atlassian Authentication\n'));
      console.log('Generate a token:');
      console.log('  Cloud: https://id.atlassian.com/manage-profile/security/api-tokens');
      console.log('  Data Center/Server: https://your-domain/plugins/personalaccesstokens/usertokens.action\n');
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Enter your Atlassian instance URL (e.g., https://your-domain.atlassian.net):',
          validate: input => {
            const trimmed = input.trim();
            if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
              return 'URL must start with http:// or https://';
            }
            return true;
          },
          filter: input => input.trim(),
          default: config.get('confluenceUrl') || config.get('jiraUrl') || 'https://your-confluence.atlassian.net'
        },
        {
          type: 'password',
          name: 'token',
          message: 'Enter your Personal Access Token:',
          validate: input => input.length > 0 || 'Token cannot be empty'
        }
      ]);
      
      try {
        // Verify token works with both Confluence and Jira
        console.log(chalk.gray('\n  Verifying credentials...'));
        
        let confluenceSuccess = false;
        let jiraSuccess = false;
        
        // Test Confluence
        try {
          const confluenceClient = new ConfluenceClient({
            baseURL: answers.url,
            token: answers.token
          });
          await confluenceClient.getCurrentUser();
          console.log(chalk.green(`  ✓ Confluence access confirmed`));
          confluenceSuccess = true;
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(chalk.yellow(`  ⚠ Confluence: Authentication failed (401)`));
          } else {
            console.log(chalk.yellow(`  ⚠ Confluence: ${error.message}`));
          }
        }

        // Test Jira
        try {
          const jiraClient = new JiraClient({
            baseURL: answers.url,
            token: answers.token
          });
          await jiraClient.getCurrentUser();
          console.log(chalk.green(`  ✓ Jira access confirmed`));
          jiraSuccess = true;
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(chalk.yellow(`  ⚠ Jira: Authentication failed (401)`));
          } else {
            console.log(chalk.yellow(`  ⚠ Jira: ${error.message}`));
          }
        }
        
        // Save credentials
        config.set('confluenceUrl', answers.url);
        config.set('jiraUrl', answers.url);
        config.set('token', answers.token);
        
        if (!confluenceSuccess && !jiraSuccess) {
          console.log(chalk.yellow(`\n⚠ Credentials saved, but authentication failed`));
          console.log(chalk.gray('\nPossible causes:'));
          console.log(chalk.gray('  1. Token may not have required permissions'));
          console.log(chalk.gray('  2. Wrong token type for your instance (Cloud vs Data Center)'));
          console.log(chalk.gray('  3. SSO/SAML authentication required\n'));
          console.log(chalk.gray('Contact your IT team for the correct authentication method.\n'));
        } else {
          console.log(chalk.green(`\n✓ Credentials saved successfully\n`));
        }
      } catch (error) {
        console.error(chalk.red('\n✗ Authentication failed'));
        console.error(chalk.gray(`  ${error.message}\n`));
        process.exit(1);
      }
    });

  // Status command
  auth
    .command('status')
    .description('Check authentication status')
    .action(async () => {
      const config = await getConfig();
      const { loadEnv } = require('../utils/env-loader');
      loadEnv();
      
      const url = config.get('confluenceUrl') || process.env.ATLASSIAN_URL;
      const token = config.get('token') || process.env.ATLASSIAN_TOKEN;
      
      if (!url || !token) {
        console.log(chalk.yellow('\n⚠ Not authenticated'));
        console.log(chalk.gray('  Run "atl auth login" or set environment variables\n'));
        return;
      }
      
      const source = config.get('token') ? 'config' : 'environment variables';
      
      console.log(chalk.green('\n✓ Authenticated'));
      console.log(chalk.gray(`  URL: ${url}`));
      console.log(chalk.gray(`  Token: ${'*'.repeat(20)}`));
      console.log(chalk.gray(`  Source: ${source}\n`));
    });

  // Logout command
  auth
    .command('logout')
    .description('Remove saved credentials')
    .action(async () => {
      const config = await getConfig();
      config.delete('confluenceUrl');
      config.delete('jiraUrl');
      config.delete('email');
      config.delete('token');
      console.log(chalk.green('\n✓ Logged out successfully\n'));
    });
}

module.exports = authCommand;
