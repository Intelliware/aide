#!/usr/bin/env node

/**
 * Standalone script to fetch a Jira issue
 * This is a thin wrapper around the core fetch-issue module
 */

const path = require('path');
const { fetchIssue } = require('../core/fetch-issue');

// Parse command line arguments
const args = process.argv.slice(2);
const issueKey = args.find(arg => !arg.startsWith('--'));
const useFresh = args.includes('--fresh');

if (!issueKey) {
  console.error('\nUsage: node fetch-jira-issue.js <ISSUE-KEY> [--fresh]');
  console.error('');
  console.error('Arguments:');
  console.error('  <ISSUE-KEY>  Jira issue key (e.g., CEAJ-3843)');
  console.error('  --fresh      Force fetch from API, ignore cache');
  console.error('');
  console.error('Examples:');
  console.error('  node fetch-jira-issue.js CEAJ-3843');
  console.error('  node fetch-jira-issue.js CEAJ-3843 --fresh\n');
  process.exit(1);
}

// Load environment variables from workspace root
const { loadEnv } = require('../utils/env-loader');
loadEnv();

// Run the fetch
fetchIssue(issueKey, { 
  useCache: !useFresh,
  silent: false 
})
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  });
