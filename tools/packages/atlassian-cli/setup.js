#!/usr/bin/env node
/**
 * Setup Script for Atlassian CLI
 * 
 * Helps users create their personal .env configuration file
 */

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { DEFAULTS } = require('./src/utils/defaults');

const ENV_FILE = path.join(__dirname, '.env');
const ENV_EXAMPLE = path.join(__dirname, '.env.example');

async function setup() {
  console.log(chalk.blue.bold('\n🔧 Atlassian CLI Setup\n'));

  // Check if .env already exists
  if (fs.existsSync(ENV_FILE)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: chalk.yellow('.env file already exists. Do you want to overwrite it?'),
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.gray('\nSetup cancelled. Your existing .env file was not modified.\n'));
      process.exit(0);
    }
  }

  // Prompt for configuration
  console.log(chalk.gray('Enter your Atlassian credentials:\n'));
  console.log(chalk.gray(`  Confluence URL: ${DEFAULTS.CONFLUENCE_URL} (built-in default)`));
  console.log(chalk.gray(`  Jira URL:       ${DEFAULTS.JIRA_URL} (built-in default)`));
  console.log(chalk.gray(`  JTMF URL:       ${DEFAULTS.JTMF_URL} (built-in default)\n`));
  
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'confluenceToken',
      message: 'Confluence Personal Access Token:',
      validate: input => input.length > 0 || 'Token cannot be empty'
    },
    {
      type: 'password',
      name: 'jiraToken',
      message: 'Jira Personal Access Token (leave empty if same as Confluence):',
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory for docs (relative to workspace root):',
      default: './docs'
    }
  ]);

  // Build .env content
  const envContent = `# ============================================================================
# Atlassian CLI Configuration
# ============================================================================
# Generated: ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE - It contains your personal access tokens
# ============================================================================
# NOTE: Confluence, Jira, and JTMF URLs are built-in defaults.
#       Only tokens need to be configured per-user.
#       To override URLs, uncomment and set below:
# CONFLUENCE_URL=${DEFAULTS.CONFLUENCE_URL}
# JIRA_URL=${DEFAULTS.JIRA_URL}
# JTMF_URL=${DEFAULTS.JTMF_URL}

# ----------------------------------------------------------------------------
# CONFLUENCE TOKEN
# ----------------------------------------------------------------------------
CONFLUENCE_TOKEN=${answers.confluenceToken}

# ----------------------------------------------------------------------------
# JIRA TOKEN
# ----------------------------------------------------------------------------
JIRA_TOKEN=${answers.jiraToken || answers.confluenceToken}

# ----------------------------------------------------------------------------
# CONFLUENCE CONFIGURATION
# ----------------------------------------------------------------------------
CONFLUENCE_URL=${answers.confluenceUrl}
CONFLUENCE_TOKEN=${answers.confluenceToken}

# ----------------------------------------------------------------------------
# OUTPUT CONFIGURATION
# ----------------------------------------------------------------------------
OUTPUT_DIR=${answers.outputDir}

# ----------------------------------------------------------------------------
# FIGMA CONFIGURATION (Optional - for future integration)
# ----------------------------------------------------------------------------
# FIGMA_TOKEN=your_figma_token_here
`;

  // Write .env file
  try {
    fs.writeFileSync(ENV_FILE, envContent, 'utf8');
    console.log(chalk.green('\n✓ Configuration saved to .env'));
    
    // Verify .gitignore
    const gitignorePath = path.join(__dirname, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('.env')) {
        console.log(chalk.yellow('\n⚠ Warning: .env is not in .gitignore'));
        console.log(chalk.gray('  Add ".env" to your .gitignore to prevent accidental commits\n'));
      } else {
        console.log(chalk.gray('  .env is properly excluded from git\n'));
      }
    }

    console.log(chalk.blue('📝 Next steps:'));
    console.log(chalk.gray('  1. Run: npm install'));
    console.log(chalk.gray('  2. Run: npm link (to use globally)'));
    console.log(chalk.gray('  3. Test: atl --version'));
    console.log(chalk.gray('  4. Try: atl jira --help\n'));

  } catch (error) {
    console.error(chalk.red(`\n✗ Error writing .env file: ${error.message}\n`));
    process.exit(1);
  }
}

// Run setup
setup().catch(error => {
  console.error(chalk.red(`\n✗ Setup failed: ${error.message}\n`));
  process.exit(1);
});
