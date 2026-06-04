const chalk = require('chalk');
const Cache = require('../utils/cache');

function cacheCommand(program) {
  const cache = program
    .command('cache')
    .description('Manage local JSON cache');

  // Status command
  cache
    .command('status')
    .description('Show cache statistics')
    .action(async () => {
      const cacheManager = new Cache();
      const stats = await cacheManager.stats();
      
      console.log(chalk.blue('\n📦 Cache Status\n'));
      console.log(chalk.gray(`  Location: ${stats.location}`));
      console.log(chalk.gray(`  Total items: ${stats.total}`));
      console.log(chalk.green(`  Confluence: ${stats.confluence}`));
      console.log(chalk.blue(`  Jira: ${stats.jira}`));
      console.log(chalk.gray(`  Size: ${stats.sizeFormatted}\n`));
    });

  // List command
  cache
    .command('list')
    .description('List all cached items')
    .action(async () => {
      const cacheManager = new Cache();
      const items = await cacheManager.list();
      
      if (items.length === 0) {
        console.log(chalk.yellow('\nNo cached items found\n'));
        return;
      }

      console.log(chalk.blue(`\n📋 Cached Items (${items.length})\n`));
      
      items.forEach(item => {
        const typeColor = item.type === 'confluence' ? chalk.green : chalk.blue;
        const typeLabel = item.type === 'confluence' ? 'Confluence' : 'Jira';
        const key = item.key ? chalk.white(item.key.padEnd(20)) : ' '.repeat(20);
        const age = item.lastFetch ? chalk.gray(`(${formatAge(item.lastFetch)})`) : '';
        console.log(`${typeColor(typeLabel.padEnd(11))} ${key} ${item.title} ${age}`);
      });
      console.log();
    });

  // Clear command
  cache
    .command('clear')
    .description('Clear all cached data')
    .action(async () => {
      const cacheManager = new Cache();
      const count = await cacheManager.clear();
      console.log(chalk.green(`\n✓ Cleared ${count} cache entries\n`));
    });
}

/**
 * Format an ISO date string to a human-readable age (e.g. "3h ago")
 */
function formatAge(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

module.exports = cacheCommand;
