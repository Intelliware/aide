const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Conf = require('conf');
const { getWorkspaceRoot } = require('../utils/env-loader');

const config = new Conf({ projectName: 'atlassian-cli' });

function initCommand(program) {
  program
    .command('init')
    .description('Initialize Atlassian CLI configuration with interactive wizard')
    .option('--force', 'Overwrite existing configuration')
    .action(async (options) => {
      await runWizard(options);
    });
}

async function runWizard(options) {
  console.log(chalk.blue('\n🔧 Atlassian CLI Configuration Wizard\n'));

  // Check if already configured
  const workspaceRoot = getWorkspaceRoot();
  const envPath = path.join(workspaceRoot, '.env');
  const hasEnv = fs.existsSync(envPath);
  const hasToken = config.has('token') || process.env.ATLASSIAN_TOKEN || process.env.JIRA_TOKEN;

  if (hasToken && !options.force) {
    console.log(chalk.yellow('⚠️  Atlassian CLI is already configured.'));
    console.log(chalk.gray('   Use --force to reconfigure\n'));
    
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Do you want to reconfigure anyway?',
      default: false
    }]);
    
    if (!proceed) {
      console.log(chalk.gray('\nConfiguration unchanged.\n'));
      return;
    }
  }

  try {
    // Step 1: Jira Authentication
    console.log(chalk.bold('\n--- Step 1: Jira Authentication ---\n'));
    console.log(chalk.gray('Jira URL: https://track.td.com (TD Enterprise)'));
    console.log(chalk.gray('Get your Personal Access Token from:'));
    console.log(chalk.cyan('https://track.td.com → Profile → Personal Access Tokens\n'));

    const jiraAuth = await inquirer.prompt([
      {
        type: 'password',
        name: 'jiraToken',
        message: 'Enter your Jira Personal Access Token:',
        mask: '*',
        validate: (input) => {
          if (!input || input.length < 10) {
            return 'Please enter a valid Jira token';
          }
          return true;
        }
      }
    ]);

    // Step 2: Confluence Authentication (separate token)
    console.log(chalk.bold('\n--- Step 2: Confluence Authentication ---\n'));
    console.log(chalk.gray('Confluence URL: https://collaborate.td.com (TD Enterprise)'));
    console.log(chalk.gray('Get your Personal Access Token from:'));
    console.log(chalk.cyan('https://collaborate.td.com → Profile → Personal Access Tokens\n'));
    
    const confluenceAuth = await inquirer.prompt([
      {
        type: 'password',
        name: 'confluenceToken',
        message: 'Enter your Confluence Personal Access Token:',
        mask: '*',
        validate: (input) => {
          if (!input || input.length < 10) {
            return 'Please enter a valid Confluence token';
          }
          return true;
        }
      }
    ]);

    // URLs are fixed for TD
    const jiraUrl = 'https://track.td.com';
    const confluenceUrl = 'https://collaborate.td.com';

    // Step 3: Default Settings
    console.log(chalk.bold('\n--- Step 3: Default Settings ---\n'));

    const settings = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputDir',
        message: 'Default output directory:',
        default: './cache'
      },
      {
        type: 'list',
        name: 'defaultProject',
        message: 'Default Jira project:',
        choices: [
          { name: 'CEAJ (Canadian Easy Apply)', value: 'CEAJ' },
          { name: 'DIGSTART (Digital Start)', value: 'DIGSTART' },
          { name: 'Other (enter manually)', value: 'OTHER' }
        ],
        default: 'CEAJ'
      }
    ]);

    let defaultProject = settings.defaultProject;
    if (settings.defaultProject === 'OTHER') {
      const { projectKey } = await inquirer.prompt([{
        type: 'input',
        name: 'projectKey',
        message: 'Enter project key:',
        validate: (input) => {
          if (!/^[A-Z]{2,}$/.test(input)) {
            return 'Project key must be 2+ uppercase letters';
          }
          return true;
        }
      }]);
      defaultProject = projectKey;
    }

    // Step 4: Cache Settings
    console.log(chalk.bold('\n--- Step 4: Cache Settings ---\n'));

    const cacheSettings = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cacheEnabled',
        message: 'Enable API response caching?',
        default: true
      },
      {
        type: 'list',
        name: 'cacheTTL',
        message: 'Cache expiration time:',
        choices: [
          { name: '15 minutes', value: 900000 },
          { name: '30 minutes', value: 1800000 },
          { name: '1 hour (recommended)', value: 3600000 },
          { name: '4 hours', value: 14400000 },
          { name: 'Never expires', value: 0 }
        ],
        default: 3600000,
        when: (answers) => answers.cacheEnabled
      }
    ]);

    // Step 5: Save to .env file or Conf
    console.log(chalk.bold('\n--- Step 5: Save Configuration ---\n'));

    const { saveLocation } = await inquirer.prompt([{
      type: 'list',
      name: 'saveLocation',
      message: 'Where to save configuration?',
      choices: [
        { name: 'Workspace .env file (recommended for team)', value: 'env' },
        { name: 'Local config only (personal machine)', value: 'config' }
      ],
      default: 'env'
    }]);

    if (saveLocation === 'env') {
      // Save to .env file
      const envContent = `# ============================================================================
# Atlassian CLI Configuration
# ============================================================================
# Generated: ${new Date().toISOString()} by 'atl init'
# DO NOT COMMIT THIS FILE - It contains your personal access tokens
# ============================================================================

# Jira Configuration
JIRA_URL=${jiraUrl}
JIRA_TOKEN=${jiraAuth.jiraToken}

# Confluence Configuration
CONFLUENCE_URL=${confluenceUrl}
CONFLUENCE_TOKEN=${confluenceAuth.confluenceToken}

# Shared settings (fallback)
ATLASSIAN_URL=${jiraUrl}
ATLASSIAN_TOKEN=${jiraAuth.jiraToken}

# Default Settings
OUTPUT_DIR=${settings.outputDir}
DEFAULT_PROJECT=${defaultProject}
`;
      
      const backupPath = envPath + '.backup.' + Date.now();
      if (hasEnv) {
        fs.copyFileSync(envPath, backupPath);
        console.log(chalk.gray(`  Backed up existing .env to ${path.basename(backupPath)}`));
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(chalk.green(`  ✓ Saved to ${envPath}`));
    }

    // Also save to Conf for local persistence
    config.set('jira.url', jiraUrl);
    config.set('confluence.url', confluenceUrl);
    config.set('defaults.outputDir', settings.outputDir);
    config.set('defaults.project', defaultProject);

    if (cacheSettings.cacheEnabled) {
      config.set('cache', {
        enabled: true,
        ttl: cacheSettings.cacheTTL
      });
    } else {
      config.set('cache', { enabled: false });
    }

    // Summary
    console.log(chalk.green('\n✓ Configuration saved!\n'));
    console.log(chalk.bold('Configuration Summary:'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.cyan('  Jira URL:          ') + jiraUrl);
    console.log(chalk.cyan('  Jira Token:        ') + chalk.gray('***' + jiraAuth.jiraToken.slice(-4)));
    console.log(chalk.cyan('  Confluence URL:    ') + confluenceUrl);
    console.log(chalk.cyan('  Confluence Token:  ') + chalk.gray('***' + confluenceAuth.confluenceToken.slice(-4)));
    console.log(chalk.cyan('  Output Dir:        ') + settings.outputDir);
    console.log(chalk.cyan('  Default Project:   ') + defaultProject);
    console.log(chalk.cyan('  Cache:             ') + (cacheSettings.cacheEnabled ? 'Enabled' : 'Disabled'));
    console.log(chalk.gray('━'.repeat(50)));

    // Test connection
    console.log(chalk.bold('\nWould you like to test the connection?'));
    const { testConnection } = await inquirer.prompt([{
      type: 'confirm',
      name: 'testConnection',
      message: 'Test connection now?',
      default: true
    }]);

    if (testConnection) {
      console.log(chalk.gray('\nTesting connection...\n'));
      console.log(chalk.yellow('  Run: atl auth status'));
      console.log(chalk.gray('  to verify your configuration.\n'));
    }

    console.log(chalk.green('\n🎉 Setup complete! You can now use:\n'));
    console.log(chalk.cyan('  atl jira issue PROJ-123') + chalk.gray('     # Fetch Jira issue'));
    console.log(chalk.cyan('  atl confluence page 12345') + chalk.gray('  # Fetch Confluence page'));
    console.log(chalk.cyan('  atl auth status') + chalk.gray('             # Check auth status'));
    console.log('');

  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('\n✗ Interactive prompts not supported in this environment.'));
      console.error(chalk.gray('  Please configure manually via .env file.\n'));
    } else {
      console.error(chalk.red(`\n✗ Setup failed: ${error.message}\n`));
    }
    process.exit(1);
  }
}

module.exports = initCommand;
