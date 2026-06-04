#!/usr/bin/env node
/**
 * extract-deps.js
 *
 * Fetches all dependencies (issuelinks + subtasks) of a parent Jira issue
 * and writes a markdown file for each into an output directory.
 *
 * Usage:
 *   node extract-deps.js <ISSUE_KEY> [options]
 *
 * Options:
 *   --out <dir>    Output directory for markdown files (required or auto-resolved)
 *   --fresh        Force re-fetch all issues from API, bypassing cache
 *
 * Example:
 *   atl j deps CEAJ-3843 --out documentation/requirements-package/CEAJ-3843-arrival-ready/dependencies
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { fetchIssue: fetchIssueCore } = require('../core/fetch-issue');
const { getWorkspaceRoot, loadEnv } = require('../utils/env-loader');
const { getCacheJsonPath, buildMarkdown } = require('../utils/issue-markdown');

loadEnv();

// ─── Main ────────────────────────────────────────────────────────────────────

async function extractDeps(parentKey, options = {}) {
  const { outDir, fresh } = options;

  const chalk = require('chalk');

  console.log(chalk.cyan(`\n🔗 Extracting dependencies for ${parentKey}...\n`));

  // 1. Load parent issue from cache (fetch if missing)
  let parentJsonPath = getCacheJsonPath(parentKey);
  if (!fs.existsSync(parentJsonPath) || fresh) {
    console.log(chalk.gray(`  Fetching parent ${parentKey}...`));
    const atlBin = path.join(__dirname, '..', '..', 'bin', 'atl.js');
    try {
      execSync(`node "${atlBin}" j issue ${parentKey}${fresh ? ' --fresh' : ''}`, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (err) {
      console.error(chalk.red(`\n✗ Failed to fetch parent issue ${parentKey}\n`));
      process.exit(1);
    }
    parentJsonPath = getCacheJsonPath(parentKey);
  }

  if (!fs.existsSync(parentJsonPath)) {
    console.error(chalk.red(`\n✗ Could not find cached JSON for ${parentKey} at:\n  ${parentJsonPath}\n`));
    process.exit(1);
  }

  const parent = JSON.parse(fs.readFileSync(parentJsonPath, 'utf8'));
  const pf = parent.fields || {};

  // 2. Collect all dependency keys
  const depKeys = new Set();

  // issuelinks (depends on / is depended on / related to / etc.)
  (pf.issuelinks || []).forEach(link => {
    if (link.outwardIssue) depKeys.add(link.outwardIssue.key);
    if (link.inwardIssue)  depKeys.add(link.inwardIssue.key);
  });

  // subtasks
  (pf.subtasks || []).forEach(st => depKeys.add(st.key));

  const keyList = Array.from(depKeys);

  if (keyList.length === 0) {
    console.log(chalk.yellow(`  ⚠  No issuelinks or subtasks found for ${parentKey}.\n`));
    process.exit(0);
  }

  console.log(chalk.white(`  Found ${keyList.length} dependenc${keyList.length === 1 ? 'y' : 'ies'}:`));
  keyList.forEach(k => console.log(chalk.gray(`    • ${k}`)));
  console.log('');

  // 3. Resolve output directory
  const workspaceRoot = getWorkspaceRoot();
  const resolvedOut = outDir
    ? (path.isAbsolute(outDir) ? outDir : path.join(workspaceRoot, outDir))
    : path.join(workspaceRoot, 'documentation', 'requirements-package',
        `${parentKey.toLowerCase()}-deps`, 'dependencies');

  fs.mkdirSync(resolvedOut, { recursive: true });
  console.log(chalk.gray(`  Output dir: ${path.relative(workspaceRoot, resolvedOut)}\n`));

  // 4. Fetch + write each dependency
  const results = { written: [], skipped: [], failed: [] };

  for (const key of keyList) {
    const jsonPath = getCacheJsonPath(key);
    const needsFetch = !fs.existsSync(jsonPath) || fresh;

    if (needsFetch) {
      process.stdout.write(chalk.gray(`  ↓ Fetching ${key}... `));
      const result = await fetchIssueCore(key, { useCache: !fresh, silent: true });
      if (!result.success) {
        console.log(chalk.red('✗'));
        results.failed.push({ key, error: result.error });
        continue;
      }
      console.log(chalk.green('✓'));
    } else {
      process.stdout.write(chalk.gray(`  ↻ Using cache for ${key}... `));
      console.log(chalk.green('✓'));
    }

    // Read cached JSON
    if (!fs.existsSync(jsonPath)) {
      results.failed.push({ key, error: 'JSON not found after fetch' });
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const md  = buildMarkdown(key, raw);

    const outFile = path.join(resolvedOut, `${key}.md`);
    fs.writeFileSync(outFile, md, 'utf8');
    results.written.push({ key, file: path.relative(workspaceRoot, outFile) });
  }

  // 5. Summary
  console.log('');
  console.log(chalk.bold(`📊 Summary`));
  console.log(chalk.green(`  ✓ Written:  ${results.written.length}`));
  if (results.failed.length > 0) {
    console.log(chalk.red(`  ✗ Failed:   ${results.failed.length}`));
    results.failed.forEach(f => console.log(chalk.red(`    • ${f.key}: ${f.error}`)));
  }
  console.log('');

  if (results.written.length > 0) {
    console.log(chalk.bold('📄 Files written:'));
    results.written.forEach(r => console.log(chalk.gray(`  ${r.file}`)));
    console.log('');
  }

  console.log(chalk.green(`✅ Done!\n`));
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const issueKey = args.find(a => !a.startsWith('-'));

  if (!issueKey || !/^[A-Z][A-Z0-9]+-\d+$/i.test(issueKey.toUpperCase())) {
    console.error('\n✗ Usage: node extract-deps.js <ISSUE_KEY> [--out <dir>] [--fresh]');
    console.error('  Example: node extract-deps.js CEAJ-3843 --out documentation/requirements-package/CEAJ-3843-arrival-ready/dependencies\n');
    process.exit(1);
  }

  const outIdx  = args.indexOf('--out');
  const outDir  = outIdx !== -1 ? args[outIdx + 1] : undefined;
  const fresh   = args.includes('--fresh');

  extractDeps(issueKey.toUpperCase(), { outDir, fresh }).catch(err => {
    console.error('\n✗ Unexpected error:', err.message);
    process.exit(1);
  });
}

module.exports = { extractDeps };
