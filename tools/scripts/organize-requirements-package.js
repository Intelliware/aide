#!/usr/bin/env node

/**
 * Requirements Package Organizer
 * 
 * Takes a fetched Confluence page tree and organizes it into a feature artifacts folder
 * with table of contents and numbered markdown files.
 * 
 * Usage:
 *   node organize-requirements-package.js <pageId>
 *   
 * Example:
 *   node organize-requirements-package.js 3579197259
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Get workspace root
const workspaceRoot = path.resolve(__dirname, '..', '..');

function main() {
  const pageId = process.argv[2];
  
  if (!pageId) {
    console.error(chalk.red('\n✗ Missing page ID'));
    console.error(chalk.gray('Usage: node organize-requirements-package.js <pageId>'));
    console.error(chalk.yellow('Example: node organize-requirements-package.js 3579197259\n'));
    process.exit(1);
  }

  console.log(chalk.blue('\n📦 Organizing requirements package...'));
  console.log(chalk.gray(`   Page ID: ${pageId}\n`));

  try {
    // Step 1: Find the cached page tree
    const treeData = findPageTree(pageId);
    if (!treeData) {
      console.error(chalk.red('✗ Page tree not found'));
      console.error(chalk.yellow('\n💡 Fetch the page tree first:'));
      console.error(chalk.gray('   cd tools && npm run atl -- c tree ' + pageId + '\n'));
      process.exit(1);
    }

    console.log(chalk.green(`✓ Found page tree: ${treeData.tree.parentTitle}`));
    console.log(chalk.gray(`  Total pages: ${treeData.tree.totalPages}\n`));

    // Step 2: Extract feature identity
    const identity = extractFeatureIdentity(treeData.tree.parentTitle);
    console.log(chalk.blue('🔍 Feature identity:'));
    console.log(chalk.gray(`   Issue ID: ${identity.issueId || 'None'}`));
    console.log(chalk.gray(`   Feature: ${identity.featureName}`));
    console.log(chalk.gray(`   Folder: ${identity.folderName}\n`));

    // Step 3: Create output directory
    const outputDir = path.join(workspaceRoot, 'documentation', 'feature-artifacts', identity.folderName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(chalk.green(`✓ Created: ${outputDir}\n`));
    } else {
      console.log(chalk.yellow(`⚠ Folder exists (will update): ${outputDir}\n`));
    }

    // Step 4: Generate TOC and copy markdown files
    const pages = treeData.tree.pages;
    const tocContent = generateTOC(identity, pages, treeData.meta);
    
    const tocPath = path.join(outputDir, 'README.md');
    fs.writeFileSync(tocPath, tocContent);
    console.log(chalk.green(`✓ Created TOC: README.md`));

    // Step 5: Copy markdown files with proper naming
    pages.forEach((page, index) => {
      const pageDir = findPageDirById(page.id);
      if (!pageDir) {
        console.log(chalk.yellow(`   ⚠ Skipped ${page.title} (cached file not found)`));
        return;
      }

      const markdownPath = path.join(pageDir, `${page.id}.md`);
      if (!fs.existsSync(markdownPath)) {
        console.log(chalk.yellow(`   ⚠ Skipped ${page.title} (markdown not found)`));
        return;
      }

      // Read markdown content
      let content = fs.readFileSync(markdownPath, 'utf8');
      
      // Check if frontmatter already exists (starts with ---)
      const hasFrontmatter = content.trimStart().startsWith('---');
      
      if (!hasFrontmatter) {
        // Add frontmatter only if it doesn't exist
        const frontmatter = `---
title: ${page.title}
confluence_id: ${page.id}
confluence_url: https://collaborate.td.com/pages/${page.id}
last_updated: ${new Date().toISOString().split('T')[0]}
version: ${page.version}
---

`;
        content = frontmatter + content;
      }
      
      // Create numbered filename
      const slug = slugify(page.title);
      const fileName = `${String(index + 1).padStart(2, '0')}-${slug}.md`;
      const outputPath = path.join(outputDir, fileName);
      
      fs.writeFileSync(outputPath, content);
      console.log(chalk.green(`✓ Created: ${fileName}`));
    });

    console.log(chalk.green(`\n✅ Requirements package organized successfully!`));
    console.log(chalk.blue(`\n📁 Location: ${path.relative(workspaceRoot, outputDir)}`));
    console.log(chalk.blue(`📄 Total files: ${pages.length + 1} (1 TOC + ${pages.length} pages)\n`));

  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

/**
 * Find the page tree data for a given page ID
 */
function findPageTree(pageId) {
  const cacheDir = path.join(workspaceRoot, 'cache', 'confluence');
  
  if (!fs.existsSync(cacheDir)) {
    return null;
  }

  // Search through all spaces
  const spaces = fs.readdirSync(cacheDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const space of spaces) {
    const spaceDir = path.join(cacheDir, space);
    const pageDirs = fs.readdirSync(spaceDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const pageDir of pageDirs) {
      if (pageDir.startsWith(`${pageId}-`)) {
        const treeFile = path.join(spaceDir, pageDir, '.tree.json');
        const metaFile = path.join(spaceDir, pageDir, '.meta.json');
        
        if (fs.existsSync(treeFile) && fs.existsSync(metaFile)) {
          return {
            tree: JSON.parse(fs.readFileSync(treeFile, 'utf8')),
            meta: JSON.parse(fs.readFileSync(metaFile, 'utf8')),
            dir: path.join(spaceDir, pageDir)
          };
        }
      }
    }
  }

  return null;
}

/**
 * Find the cache directory for a page by ID
 */
function findPageDirById(pageId) {
  const cacheDir = path.join(workspaceRoot, 'cache', 'confluence');
  
  if (!fs.existsSync(cacheDir)) {
    return null;
  }

  // Search through all spaces
  const spaces = fs.readdirSync(cacheDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const space of spaces) {
    const spaceDir = path.join(cacheDir, space);
    const pageDirs = fs.readdirSync(spaceDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const pageDir of pageDirs) {
      if (pageDir.startsWith(`${pageId}-`)) {
        return path.join(spaceDir, pageDir);
      }
    }
  }

  return null;
}

/**
 * Extract feature identity from page title
 */
function extractFeatureIdentity(title) {
  // Try to find issue ID pattern (e.g., CEAJ-3843, PROJ-123)
  const issueIdMatch = title.match(/([A-Z]+-\d+)/);
  const issueId = issueIdMatch ? issueIdMatch[1] : null;

  // Extract feature name (remove issue ID and separators)
  let featureName = title;
  if (issueId) {
    featureName = title.replace(new RegExp(`${issueId}\\s*[\\-|:]?\\s*`), '').trim();
  }

  // Create folder name
  const folderName = issueId 
    ? `${issueId}-${slugify(featureName)}`
    : slugify(featureName);

  return {
    issueId,
    featureName,
    folderName
  };
}

/**
 * Generate table of contents markdown
 */
function generateTOC(identity, pages, meta) {
  const title = identity.issueId 
    ? `${identity.issueId} - ${identity.featureName}`
    : identity.featureName;

  const issueLink = identity.issueId 
    ? `- **Jira Epic**: [${identity.issueId}](https://track.td.com/browse/${identity.issueId})\n`
    : '';

  const lines = [
    `# ${title}`,
    '',
    '**Feature Requirements Package**',
    '',
    `Extracted from Confluence: [${meta.title}](${meta.url})  `,
    `**Extraction Date**: ${new Date().toISOString().split('T')[0]}  `,
    `**Total Pages**: ${pages.length}`,
    '',
    '---',
    '',
    '## 📚 Table of Contents',
    ''
  ];

  pages.forEach((page, index) => {
    const slug = slugify(page.title);
    const fileName = `${String(index + 1).padStart(2, '0')}-${slug}.md`;
    lines.push(`${index + 1}. [${page.title}](${fileName})`);
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 📄 Page Structure');
  lines.push('');
  lines.push('| # | Page Title | Confluence Link | Version |');
  lines.push('|---|------------|----------------|---------|');

  pages.forEach((page, index) => {
    const pageUrl = `https://collaborate.td.com/pages/${page.id}`;
    lines.push(`| ${index + 1} | ${page.title} | [View](${pageUrl}) | v${page.version} |`);
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 🔗 Related Links');
  lines.push('');
  lines.push(issueLink);
  lines.push(`- **Confluence Space**: [${meta.space}](https://collaborate.td.com/spaces/${meta.space})`);
  lines.push(`- **Feature Artifacts**: \`documentation/feature-artifacts/${identity.folderName}/\``);
  lines.push('');

  return lines.join('\n');
}

/**
 * Convert string to URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing -
}

// Run the script
main();
