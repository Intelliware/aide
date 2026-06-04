#!/usr/bin/env node

/**
 * Atlassian CLI - Main Entry Point
 * 
 * A command-line tool for caching Confluence pages and Jira issues as JSON for agent-driven analysis
 */

// Suppress dotenv logging
process.env.DOTENV_CONFIG_QUIET = 'true';

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const { initLogger } = require('../src/utils/logger');

// Import command modules
const authCommand = require('../src/commands/auth');
const cacheCommand = require('../src/commands/cache');
const jiraCommand = require('../src/commands/jira');
const confluenceCommand = require('../src/commands/confluence');
const initCommand = require('../src/commands/init');

// Configure CLI
program
  .name('atl')
  .description('Atlassian CLI - Cache Confluence pages and Jira issues as JSON for agent-driven analysis')
  .version(packageJson.version, '-v, --version', 'Display version number')
  .option('--debug', 'Enable debug mode with verbose logging')
  .option('--log-level <level>', 'Set log level (error, warn, info, http, debug, trace)', 'info')
  .option('--no-file-log', 'Disable file logging')
  .option('--silent', 'Suppress all console output (file logging still enabled)')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpText('beforeAll', `Version: ${packageJson.version}\n`)
  .addHelpCommand(false) // Disable default help command, we'll add our own
  .hook('preAction', (thisCommand) => {
    // Initialize logger based on global options
    const opts = thisCommand.opts();
    
    // If --debug is set, override log level to debug
    const logLevel = opts.debug ? 'debug' : opts.logLevel;
    
    initLogger({
      level: logLevel,
      enableFile: opts.fileLog,
      silent: opts.silent
    });
  });

// Register commands
authCommand(program);
cacheCommand(program);
jiraCommand(program);
confluenceCommand(program);
initCommand(program);

// Override help to show comprehensive help
program.on('option:help', () => {
  showComprehensiveHelp();
  process.exit(0);
});

// Add custom help command with comprehensive overview
program
  .command('help [command]')
  .description('Display help for a specific command')
  .action((commandName) => {
    if (commandName) {
      // Show specific command help
      const cmd = program.commands.find(c => c.name() === commandName || c.aliases().includes(commandName));
      if (cmd) {
        cmd.outputHelp();
      } else {
        console.log(chalk.red(`\n✗ Unknown command: ${commandName}\n`));
        showComprehensiveHelp();
      }
    } else {
      showComprehensiveHelp();
    }
  });

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  showComprehensiveHelp();
  process.exit(0);
}

/**
 * Show comprehensive help with all commands and subcommands
 */
function showComprehensiveHelp() {
  console.log(chalk.bold(`\n${program.name()} v${program.version()}`));
  console.log(chalk.gray(program.description()));
  
  console.log(chalk.bold('\n📚 Available Commands:\n'));
  
  // Authentication Commands
  console.log(chalk.blue('  auth') + chalk.gray(' - Manage Atlassian authentication'));
  console.log('    ' + chalk.cyan('login') + '   - Save your Atlassian credentials (URL and PAT)');
  console.log('    ' + chalk.cyan('status') + '  - Check authentication status');
  console.log('    ' + chalk.cyan('logout') + '  - Remove stored credentials');
  
  // Cache Commands
  console.log(chalk.blue('\n  cache') + chalk.gray(' - Manage local JSON cache artifacts'));
  console.log('    ' + chalk.cyan('status') + '  - Show cache statistics');
  console.log('    ' + chalk.cyan('list') + '    - List all cached items');
  console.log('    ' + chalk.cyan('clear') + '   - Clear all cached data');
  
  // Jira Commands
  console.log(chalk.blue('\n  jira, j') + chalk.gray(' - Fetch and export Jira issues'));
  console.log('    ' + chalk.cyan('issue <key>') + '         - Fetch a single Jira issue');
  console.log('    ' + chalk.cyan('url <url>') + '           - Fetch issue from Jira URL');
  console.log('    ' + chalk.cyan('search "<jql>"') + '       - Search issues using JQL query');
  console.log('    ' + chalk.cyan('related <key>') + '       - Fetch all related issues and pages');
  console.log('    ' + chalk.cyan('create <projectKey>') + ' - Create a new Jira issue (interactive)');
  console.log('    ' + chalk.cyan('transition <key>') + '    - Update issue status (alias: status)');
  
  // Confluence Commands
  console.log(chalk.blue('\n  confluence, c') + chalk.gray(' - Fetch and export Confluence pages'));
  console.log('    ' + chalk.cyan('page <pageId>') + '  - Fetch a single Confluence page');
  console.log('    ' + chalk.cyan('url <url>') + '     - Fetch page from Confluence URL');
  console.log('    ' + chalk.gray('Options: --fresh (bypass cache), --with-jira (fetch live Jira data)'));
  
  // General
  console.log(chalk.blue('\n  help [command]') + chalk.gray(' - Display help for a specific command'));
  
  console.log(chalk.bold('\n📖 Usage Examples:\n'));
  console.log('  ' + chalk.gray('# Setup authentication'));
  console.log('  $ atl auth login\n');
  console.log('  ' + chalk.gray('# Fetch a Jira issue'));
  console.log('  $ atl jira issue ABC-123\n');
  console.log('  ' + chalk.gray('# Search for issues'));
  console.log('  $ atl jira search "project = ABC AND status = \'In Progress\'"\n');
  console.log('  ' + chalk.gray('# Fetch a Confluence page'));
  console.log('  $ atl confluence page 123456\n');
  console.log('  ' + chalk.gray('# Fetch page with live Jira issue data'));
  console.log('  $ atl confluence page 123456 --with-jira\n');
  console.log('  ' + chalk.gray('# Fetch all related issues'));
  console.log('  $ atl jira related ABC-123\n');
  console.log('  ' + chalk.gray('# View cache status'));
  console.log('  $ atl cache status\n');
  console.log('  ' + chalk.gray('# Get detailed help for a command'));
  console.log('  $ atl help auth');
  console.log('  $ atl jira issue --help\n');
  
  console.log(chalk.bold('📝 Options:\n'));
  console.log('  ' + chalk.cyan('-v, --version') + '  - Display version number');
  console.log('  ' + chalk.cyan('-h, --help') + '     - Display help for command\n');
  
  console.log(chalk.gray('For detailed command help, use: atl <command> --help\n'));
}

// Parse command line arguments
program.parse(process.argv);
