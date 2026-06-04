#!/usr/bin/env node

/**
 * Standalone script to fetch a Confluence page
 * This is a thin wrapper around the core fetch-page module
 */

const path = require('path');
const { fetchPage } = require('../core/fetch-page');

// Parse command line arguments
const args = process.argv.slice(2);
const pageId = args.find(arg => !arg.startsWith('--'));
const useFresh = args.includes('--fresh');

if (!pageId) {
  console.error('\nUsage: node fetch-confluence-page.js <PAGE-ID> [--fresh]');
  console.error('');
  console.error('Arguments:');
  console.error('  <PAGE-ID>  Confluence page ID (e.g., 2315130362)');
  console.error('  --fresh    Force fetch from API, ignore cache');
  console.error('');
  console.error('Examples:');
  console.error('  node fetch-confluence-page.js 2315130362');
  console.error('  node fetch-confluence-page.js 2315130362 --fresh\n');
  process.exit(1);
}

// Load environment variables from workspace root
const { loadEnv } = require('../utils/env-loader');
loadEnv();

// Run the fetch
fetchPage(pageId, {
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
