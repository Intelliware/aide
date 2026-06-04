#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { executeOperation, ConfigManager, SharePointClientFactory } = require('../src/index');
const { uploadFile } = require('../src/operations/upload');
const { downloadFile } = require('../src/operations/download');
const { listFiles } = require('../src/operations/list');
const { convertToMarkdown } = require('../src/operations/convert');
const { convertPdfToMarkdown } = require('../src/operations/convert-pdf');
const { convertExcelToMarkdown } = require('../src/operations/convert-excel');
const { formatError } = require('@ea-workspace/shared-utils');

const program = new Command();

program
  .name('spt')
  .description('SharePoint CLI - Cross-platform document management for TD Internal and Microsoft 365')
  .version('0.1.0');

// Upload command
program
  .command('upload <file>')
  .description('Upload file to SharePoint')
  .requiredOption('--site <url>', 'SharePoint site URL')
  .requiredOption('--folder <path>', 'Target folder path (e.g., "/Shared Documents")')
  .option('--overwrite', 'Overwrite if file already exists')
  .action(async (file, options) => {
    try {
      console.log(chalk.blue('📤 Uploading file to SharePoint...'));
      
      const result = await executeOperation(
        (client, params, log) => uploadFile(
          params.file,
          params.siteUrl,
          params.folder,
          client,
          log,
          { overwrite: params.overwrite }
        ),
        {
          file,
          siteUrl: options.site,
          folder: options.folder,
          overwrite: options.overwrite
        }
      );
      
      console.log(chalk.green('✓ Upload successful!\n'));
      console.log(chalk.white('File URL: ') + chalk.cyan(result.fileUrl || result.serverUrl));
      console.log(chalk.white('Size: ') + formatBytes(result.size));
      console.log(chalk.white('Uploaded: ') + result.uploadedAt.toLocaleString());
    } catch (error) {
      console.error(chalk.red('✗ Upload failed:'));
      console.error(chalk.red(formatError(error)));
      process.exit(1);
    }
  });

// Download command
program
  .command('download <file-url>')
  .description('Download file from SharePoint')
  .requiredOption('--output <path>', 'Output file path')
  .option('--item-id <id>', 'File item ID (Microsoft 365 only)')
  .action(async (fileUrl, options) => {
    try {
      console.log(chalk.blue('📥 Downloading file from SharePoint...'));
      
      // Extract site URL from file URL
      const urlObj = new URL(fileUrl);
      const siteUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.split('/')[1] === 'sites' ? '/sites/' + urlObj.pathname.split('/')[2] : ''}`;
      
      const result = await executeOperation(
        (client, params, log) => downloadFile(
          params.fileUrl,
          params.output,
          client,
          log,
          { itemId: params.itemId }
        ),
        {
          fileUrl,
          output: options.output,
          itemId: options.itemId,
          siteUrl
        }
      );
      
      console.log(chalk.green('✓ Download successful!\n'));
      console.log(chalk.white('Output: ') + chalk.cyan(result.outputPath));
      console.log(chalk.white('Size: ') + formatBytes(result.size));
    } catch (error) {
      console.error(chalk.red('✗ Download failed:'));
      console.error(chalk.red(formatError(error)));
      process.exit(1);
    }
  });

// Convert command
program
  .command('convert <input>')
  .description('Convert document to markdown (.docx → .md)')
  .requiredOption('--output <path>', 'Output markdown file path')
  .option('--to <format>', 'Output format (only "markdown" supported)', 'markdown')
  .action(async (input, options) => {
    try {
      console.log(chalk.blue('🔄 Converting document to markdown...'));
      
      // Create a simple logger for standalone operation
      const logger = {
        info: (msg, meta) => console.log(chalk.gray(`[INFO] ${msg}`), meta ? chalk.gray(JSON.stringify(meta)) : ''),
        warn: (msg, meta) => console.log(chalk.yellow(`[WARN] ${msg}`), meta ? chalk.yellow(JSON.stringify(meta)) : ''),
        error: (msg, meta) => console.error(chalk.red(`[ERROR] ${msg}`), meta ? chalk.red(JSON.stringify(meta)) : '')
      };
      
      if (options.to !== 'markdown') {
        throw new Error(`Unsupported output format: ${options.to}. Only "markdown" is supported.`);
      }
      
      const result = await convertToMarkdown(
        input,
        options.output,
        logger
      );
      
      console.log(chalk.green('✓ Conversion successful!\n'));
      console.log(chalk.white('Input:  ') + chalk.cyan(result.inputPath));
      console.log(chalk.white('Output: ') + chalk.cyan(result.outputPath));
      console.log(chalk.white('Input size:  ') + formatBytes(result.inputSize));
      console.log(chalk.white('Output size: ') + formatBytes(result.outputSize));
      
      if (result.images && result.images.length > 0) {
        console.log(chalk.green(`\n📸 Extracted ${result.images.length} image(s):`));
        console.log(chalk.white('  Images directory: ') + chalk.cyan(result.imagesDirectory));
        result.images.forEach((img, i) => {
          console.log(chalk.gray(`  ${i + 1}. ${img.name} (${formatBytes(img.size)}) - ${img.contentType}`));
        });
      }
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠ Warnings:'));
        result.warnings.forEach(w => console.log(chalk.yellow(`  • ${w.message || w}`)));
      }
    } catch (error) {
      console.error(chalk.red('✗ Conversion failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Convert PDF command
program
  .command('convert-pdf <input>')
  .description('Convert PDF to markdown (.pdf → .md)')
  .option('--output <path>', 'Output markdown file path (default: documentation/converted-docs/<filename>.md)')
  .option('--pages <range>', 'Page range (e.g., "1-10")')
  .option('--metadata', 'Include PDF metadata in output')
  .action(async (input, options) => {
    try {
      console.log(chalk.blue('🔄 Converting PDF to markdown...'));
      
      // Create a simple logger for standalone operation
      const logger = {
        info: (msg, meta) => console.log(chalk.gray(`[INFO] ${msg}`), meta ? chalk.gray(JSON.stringify(meta)) : ''),
        warn: (msg, meta) => console.log(chalk.yellow(`[WARN] ${msg}`), meta ? chalk.yellow(JSON.stringify(meta)) : ''),
        error: (msg, meta) => console.error(chalk.red(`[ERROR] ${msg}`), meta ? chalk.red(JSON.stringify(meta)) : '')
      };
      
      const result = await convertPdfToMarkdown(
        input,
        options.output || null, // null triggers default path
        logger,
        {
          pages: options.pages,
          metadata: options.metadata
        }
      );
      
      console.log(chalk.green('✓ PDF conversion successful!\n'));
      console.log(chalk.white('Input:  ') + chalk.cyan(result.inputPath));
      console.log(chalk.white('Output: ') + chalk.cyan(result.outputPath));
      console.log(chalk.white('Pages:  ') + chalk.cyan(result.pages));
      console.log(chalk.white('Input size:  ') + formatBytes(result.inputSize));
      console.log(chalk.white('Output size: ') + formatBytes(result.outputSize));
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠ Warnings:'));
        result.warnings.forEach(w => console.log(chalk.yellow(`  • ${w}`)));
      }
    } catch (error) {
      console.error(chalk.red('✗ PDF conversion failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Convert Excel command
program
  .command('convert-excel <input>')
  .description('Convert Excel to markdown (.xlsx/.xls → .md)')
  .option('--output <path>', 'Output markdown file path (default: documentation/converted-docs/<filename>.md)')
  .option('--sheet <name>', 'Convert specific sheet only (by name or 1-based index)')
  .option('--metadata', 'Include Excel metadata in output')
  .option('--no-toc', 'Skip table of contents for multi-sheet workbooks')
  .option('--include-blank-rows', 'Include blank rows in output')
  .action(async (input, options) => {
    try {
      console.log(chalk.blue('🔄 Converting Excel to markdown...'));
      
      // Create a simple logger for standalone operation
      const logger = {
        info: (msg, meta) => console.log(chalk.gray(`[INFO] ${msg}`), meta ? chalk.gray(JSON.stringify(meta)) : ''),
        warn: (msg, meta) => console.log(chalk.yellow(`[WARN] ${msg}`), meta ? chalk.yellow(JSON.stringify(meta)) : ''),
        error: (msg, meta) => console.error(chalk.red(`[ERROR] ${msg}`), meta ? chalk.red(JSON.stringify(meta)) : '')
      };
      
      const result = await convertExcelToMarkdown(
        input,
        options.output || null, // null triggers default path
        logger,
        {
          sheet: options.sheet,
          metadata: options.metadata,
          noToc: !options.toc, // Commander automatically sets toc to false when --no-toc is used
          includeBlankRows: options.includeBlankRows
        }
      );
      
      console.log(chalk.green('✓ Excel conversion successful!\n'));
      console.log(chalk.white('Input:  ') + chalk.cyan(result.inputPath));
      console.log(chalk.white('Output: ') + chalk.cyan(result.outputPath));
      console.log(chalk.white('Sheets: ') + chalk.cyan(result.sheets));
      console.log(chalk.white('Sheet names: ') + chalk.cyan(result.sheetNames.join(', ')));
      console.log(chalk.white('Input size:  ') + formatBytes(result.inputSize));
      console.log(chalk.white('Output size: ') + formatBytes(result.outputSize));
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠ Warnings:'));
        result.warnings.forEach(w => console.log(chalk.yellow(`  • ${w}`)));
      }
    } catch (error) {
      console.error(chalk.red('✗ Excel conversion failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List files in SharePoint folder')
  .requiredOption('--site <url>', 'SharePoint site URL')
  .requiredOption('--folder <path>', 'Folder path (e.g., "/Shared Documents")')
  .option('--recursive', 'List recursively (not fully implemented)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📂 Listing files in SharePoint folder...'));
      
      const result = await executeOperation(
        (client, params, log) => listFiles(
          params.siteUrl,
          params.folder,
          client,
          log,
          { recursive: params.recursive }
        ),
        {
          siteUrl: options.site,
          folder: options.folder,
          recursive: options.recursive
        }
      );
      
      console.log(chalk.green(`✓ Found ${result.length} files\n`));
      
      if (result.length > 0) {
        result.forEach(file => {
          console.log(chalk.white('━'.repeat(60)));
          console.log(chalk.cyan(file.name));
          console.log(chalk.gray(`  Size: ${formatBytes(file.size)}`));
          console.log(chalk.gray(`  Modified: ${file.modifiedAt.toLocaleString()}`));
          console.log(chalk.gray(`  By: ${file.modifiedBy}`));
          console.log(chalk.gray(`  URL: ${file.url}`));
        });
        console.log(chalk.white('━'.repeat(60)));
      }
    } catch (error) {
      console.error(chalk.red('✗ List failed:'));
      console.error(chalk.red(formatError(error)));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check SharePoint CLI status and configuration')
  .action(async () => {
    try {
      const ConfigManager = require('../src/index').ConfigManager;
      const configManager = await ConfigManager.create();
      const config = configManager.getConfig();
      
      console.log(chalk.blue('SharePoint CLI Status:\n'));
      console.log(chalk.white('  Version: ') + chalk.green('0.1.0'));
      console.log(chalk.white('  Node.js: ') + chalk.green(process.version));
      console.log(chalk.white('\nConfiguration:'));
      console.log(chalk.white('  Microsoft 365 Token: ') + (config.token ? chalk.green('✓ Set') : chalk.red('✗ Not set')));
      console.log(chalk.white('  Windows Username: ') + (config.username ? chalk.green('✓ Set') : chalk.red('✗ Not set')));
      console.log(chalk.white('  Windows Password: ') + (config.password ? chalk.green('✓ Set') : chalk.red('✗ Not set')));
      console.log(chalk.white('  Windows Domain: ') + chalk.cyan(config.domain));
      console.log(chalk.white('  Log Level: ') + chalk.cyan(config.logLevel));
      
      console.log(chalk.white('\nSupported Platforms:'));
      console.log(chalk.green('  ✓ ') + chalk.white('TD Internal SharePoint (myteam.td.com)'));
      console.log(chalk.green('  ✓ ') + chalk.white('Microsoft 365 SharePoint (*.sharepoint.com)'));
      
      console.log(chalk.white('\nConfiguration File Locations:'));
      console.log(chalk.gray('  .env: workspace root/.env'));
      console.log(chalk.gray('  Encrypted config: ' + configManager.conf.path));
      
    } catch (error) {
      console.error(chalk.red('✗ Status check failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Platform info command
program
  .command('platform <url>')
  .description('Get information about SharePoint platform from URL')
  .action((url) => {
    try {
      const info = SharePointClientFactory.getPlatformInfo(url);
      
      if (info) {
        console.log(chalk.blue('Platform Information:\n'));
        console.log(chalk.white('  Name: ') + chalk.cyan(info.name));
        console.log(chalk.white('  API: ') + chalk.cyan(info.api));
        console.log(chalk.white('  Auth Method: ') + chalk.cyan(info.authMethod));
        console.log(chalk.white('  Base URL: ') + chalk.cyan(info.baseUrl));
      } else {
        console.log(chalk.red('✗ Unsupported SharePoint URL'));
        console.log(chalk.yellow('\nSupported platforms:'));
        console.log(chalk.white('  • TD Internal: myteam.td.com'));
        console.log(chalk.white('  • Microsoft 365: *.sharepoint.com'));
      }
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
