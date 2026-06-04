#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ConfluenceClient = require('../api/confluence-client');
const { fetchPage, findCachedPage } = require('../core/fetch-page');
const { getWorkspaceRoot } = require('../utils/env-loader');

// Get output directory using same logic as fetch-issue.js
function getOutputDir() {
  const workspaceRoot = getWorkspaceRoot();
  const defaultOutputDir = process.env.OUTPUT_DIR 
    ? (path.isAbsolute(process.env.OUTPUT_DIR) 
        ? process.env.OUTPUT_DIR 
        : path.join(workspaceRoot, process.env.OUTPUT_DIR))
    : path.join(workspaceRoot, 'cache');
  
  return defaultOutputDir;
}

// Jira cache functions
function isCached(issueKey) {
  const projectKey = issueKey.split('-')[0];
  const baseDir = getOutputDir();
  const metaPath = path.join(baseDir, 'jira', projectKey, issueKey, '.meta.json');
  return fs.existsSync(metaPath);
}

function getCacheInfo(issueKey) {
  const projectKey = issueKey.split('-')[0];
  const baseDir = getOutputDir();
  const metaPath = path.join(baseDir, 'jira', projectKey, issueKey, '.meta.json');
  if (!fs.existsSync(metaPath)) {
    return { cached: false };
  }
  
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const lastFetch = new Date(meta.lastFetch);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastFetch) / 1000 / 60);
  
  let timeAgo;
  if (diffMinutes < 60) {
    timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  return {
    cached: true,
    lastFetch: meta.lastFetch,
    summary: meta.summary || 'N/A',
    status: meta.status || 'N/A',
    timeAgo
  };
}

// Confluence cache functions
function isConfluenceCached(pageId) {
  const baseDir = path.join(getOutputDir(), 'confluence');
  return !!findCachedPage(baseDir, pageId);
}

function getConfluenceCacheInfo(pageId) {
  const baseDir = path.join(getOutputDir(), 'confluence');
  const found = findCachedPage(baseDir, pageId);
  if (!found) {
    return { cached: false };
  }
  
  const meta = found.meta;
  const lastFetch = new Date(meta.lastFetch);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastFetch) / 1000 / 60);
  
  let timeAgo;
  if (diffMinutes < 60) {
    timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  return {
    cached: true,
    lastFetch: meta.lastFetch,
    title: meta.title || 'N/A',
    space: meta.space || 'N/A',
    timeAgo,
    dir: found.dir
  };
}

function toSearchableText(value) {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function extractIssueKeysFromValue(value, issueKeyRegex) {
  return toSearchableText(value).match(issueKeyRegex) || [];
}

// Extract Confluence URLs from markdown
function extractConfluenceUrls(content) {
  const confluenceUrls = [];
  
  // Match Confluence URLs (various patterns)
  const urlPatterns = [
    /https?:\/\/[^\/]+\/pages\/viewpage\.action\?pageId=(\d+)/g,
    /https?:\/\/[^\/]+\/pages\/(\d+)\//g,
    /https?:\/\/[^\/]+\/display\/[A-Z0-9]+\/[^\s\)]+/g,
    /\[([^\]]+)\]\((https?:\/\/[^\/]+\/(?:pages|display)\/[^\)]+)\)/g
  ];
  
  urlPatterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const url = index === 3 ? match[2] : match[0]; // Handle markdown links
      if (!confluenceUrls.includes(url)) {
        confluenceUrls.push(url);
      }
    }
  });
  
  return confluenceUrls;
}

// Fetch and cache Confluence page
async function fetchConfluencePage(pageId, url) {
  const result = await fetchPage(pageId, {
    useCache: true,
    silent: true,
    url: url
  });
  
  if (result.success) {
    return { success: true, title: result.meta.title };
  } else {
    return { success: false, error: result.error };
  }
}

async function fetchRelatedIssues(parentKey, options = {}) {
  console.log(`\n🔍 Analyzing ${parentKey} for related issues...\n`);
  
  // Step 1: Check if parent issue exists, fetch if needed
  const projectKey = parentKey.split('-')[0];
  const baseDir = getOutputDir();
  const issueDir = path.join(baseDir, 'jira', projectKey, parentKey);
  const jsonPath = path.join(issueDir, `${parentKey}.json`);
  
  if (!fs.existsSync(jsonPath)) {
    // Fetch parent issue automatically using atl CLI
    const atlPath = path.join(__dirname, '..', '..', 'bin', 'atl.js');
    try {
      execSync(`node "${atlPath}" j issue ${parentKey}`, {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      console.log(''); // Add spacing after fetch
    } catch (error) {
      console.error(`\n❌ Failed to fetch parent issue ${parentKey}\n`);
      process.exit(1);
    }
  }
  
  const issue = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Step 2: Extract all related issue keys
  const relatedKeys = new Set();
  
  // Subtasks
  if (issue.fields.subtasks) {
    issue.fields.subtasks.forEach(st => relatedKeys.add(st.key));
  }
  
  // Issue links
  if (issue.fields.issuelinks) {
    issue.fields.issuelinks.forEach(link => {
      if (link.outwardIssue) relatedKeys.add(link.outwardIssue.key);
      if (link.inwardIssue) relatedKeys.add(link.inwardIssue.key);
    });
  }
  
  // Epic link (customfield_10008 can be either a string or an object)
  if (issue.fields.customfield_10008) {
    const epicLink = issue.fields.customfield_10008;
    if (typeof epicLink === 'string') {
      relatedKeys.add(epicLink);
    } else if (epicLink.key) {
      relatedKeys.add(epicLink.key);
    }
  }
  
  // Parent
  if (issue.fields.parent) {
    relatedKeys.add(issue.fields.parent.key);
  }
  
  // Extract from description and comments (regex)
  const jiraKeyRegex = /\b[A-Z][A-Z0-9]+-\d+\b/g;
  const matches = extractIssueKeysFromValue(issue.fields.description, jiraKeyRegex);
  matches.forEach(key => {
    if (key !== parentKey) relatedKeys.add(key);
  });
  
  // From comments
  if (issue.fields.comment && issue.fields.comment.comments) {
    issue.fields.comment.comments.forEach(comment => {
      const commentMatches = extractIssueKeysFromValue(comment.body, jiraKeyRegex);
      commentMatches.forEach(key => {
        if (key !== parentKey) relatedKeys.add(key);
      });
    });
  }
  
  // Step 3: Filter by options
  let issueList = Array.from(relatedKeys);
  
  if (options.subtasksOnly) {
    const subtaskKeys = new Set(
      (issue.fields.subtasks || []).map(st => st.key)
    );
    issueList = issueList.filter(key => subtaskKeys.has(key));
  }
  
  console.log(`📋 Found ${issueList.length} related issue${issueList.length !== 1 ? 's' : ''}`);
  if (options.subtasksOnly) {
    console.log(`   (Filtered to subtasks only)\n`);
  } else {
    console.log('');
  }
  
  // Step 4: Check cache and prepare fetch list for Jira issues
  const toFetch = [];
  const alreadyCached = [];
  
  issueList.forEach(key => {
    if (isCached(key)) {
      const info = getCacheInfo(key);
      alreadyCached.push({ key, info });
    } else {
      toFetch.push(key);
    }
  });
  
  console.log(`✓ Already cached: ${alreadyCached.length}`);
  console.log(`↓ Need to fetch: ${toFetch.length}\n`);
  
  if (alreadyCached.length > 0 && !options.quiet) {
    console.log('📦 Already Cached (Skipping):');
    alreadyCached.slice(0, 5).forEach(({ key, info }) => {
      console.log(`   ↻ ${key}: ${info.summary} (${info.timeAgo})`);
    });
    if (alreadyCached.length > 5) {
      console.log(`   ... and ${alreadyCached.length - 5} more`);
    }
    console.log('');
  }
  
  // Step 5: Fetch uncached Jira issues
  const fetched = [];
  const failed = [];
  
  if (toFetch.length === 0) {
    console.log('✅ All related issues are already cached!\n');
  } else {
    console.log(`🔄 Fetching ${toFetch.length} uncached issue${toFetch.length !== 1 ? 's' : ''}:\n`);
    
    for (let i = 0; i < toFetch.length; i++) {
      const key = toFetch[i];
      process.stdout.write(`   [${i + 1}/${toFetch.length}] ${key}... `);
      
      try {
        execSync(`atl j issue ${key}`, {
          cwd: process.cwd(),
          stdio: 'pipe' // Suppress output
        });
        console.log('✓');
        fetched.push(key);
      } catch (error) {
        console.log('✗');
        failed.push({ key, error: error.message });
      }
    }
    console.log('');
  }
  
  // Step 6: Extract and fetch Confluence pages
  console.log('🔍 Analyzing for Confluence pages...\n');

  const confluenceSearchText = toSearchableText(issue.fields);
  const confluenceUrls = extractConfluenceUrls(confluenceSearchText);
  
  const confluencePages = [];
  const confluenceToFetch = [];
  const confluenceCached = [];
  const confluenceFetched = [];
  const confluenceFailed = [];
  
  if (confluenceUrls.length > 0) {
    console.log(`📄 Found ${confluenceUrls.length} Confluence URL${confluenceUrls.length !== 1 ? 's' : ''}\n`);
    
    confluenceUrls.forEach(url => {
      const parsed = ConfluenceClient.parseUrl(url);
      if (parsed.pageId) {
        const pageInfo = { pageId: parsed.pageId, url };
        confluencePages.push(pageInfo);
        
        if (isConfluenceCached(parsed.pageId)) {
          const info = getConfluenceCacheInfo(parsed.pageId);
          confluenceCached.push({ ...pageInfo, info });
        } else {
          confluenceToFetch.push(pageInfo);
        }
      }
    });
    
    console.log(`✓ Already cached: ${confluenceCached.length}`);
    console.log(`↓ Need to fetch: ${confluenceToFetch.length}\n`);
    
    if (confluenceToFetch.length > 0) {
      console.log(`🔄 Fetching ${confluenceToFetch.length} Confluence page${confluenceToFetch.length !== 1 ? 's' : ''}:\n`);

      for (let i = 0; i < confluenceToFetch.length; i++) {
        const { pageId, url } = confluenceToFetch[i];
        process.stdout.write(`   [${i + 1}/${confluenceToFetch.length}] Page ${pageId}... `);
        
        const result = await fetchConfluencePage(pageId, url);
        
        if (result.success) {
          console.log(`✓ ${result.title}`);
          confluenceFetched.push({ pageId, title: result.title });
        } else {
          console.log(`✗ ${result.error}`);
          confluenceFailed.push({ pageId, error: result.error });
        }
       
        // Rate limiting
        if (i < confluenceToFetch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log('');
      
      if (confluenceFailed.length > 0) {
        console.log('⚠️  Failed Confluence pages:');
        confluenceFailed.forEach(({ pageId, error }) => {
          console.log(`   ✗ Page ${pageId}: ${error}`);
        });
        console.log('');
      }
    } else {
      console.log('✅ All Confluence pages are already cached!\n');
    }
  } else {
    console.log('📄 No Confluence pages found in cached issue JSON\n');
  }
  
  // Step 7: Summary
  console.log('='.repeat(60));
  console.log(`📊 Fetch Summary for ${parentKey}`);
  console.log('='.repeat(60));
  console.log(`Total related Jira issues: ${issueList.length}`);
  console.log(`  Already cached: ${alreadyCached.length}`);
  console.log(`  Newly fetched: ${fetched.length}`);
  if (failed.length > 0) {
    console.log(`  Failed: ${failed.length}`);
  }
  console.log(`Total Confluence pages: ${confluencePages.length}`);
  console.log(`  Already cached: ${confluenceCached.length}`);
  console.log(`  Newly fetched: ${confluenceFetched.length}`);
  if (confluenceFailed.length > 0) {
    console.log(`  Failed: ${confluenceFailed.length}`);
  }
  console.log('='.repeat(60) + '\n');
  
  if (fetched.length > 0) {
    console.log('✅ Successfully fetched Jira issues:');
    fetched.forEach(key => {
      const info = getCacheInfo(key);
      console.log(`   ✓ ${key}: ${info.summary}`);
    });
    console.log('');
  }
  
  if (failed.length > 0) {
    console.log('❌ Failed Jira issues:');
    failed.forEach(({ key }) => {
      console.log(`   ✗ ${key} (check permissions or issue key)`);
    });
    console.log('');
  }

  console.log('ℹ Cached analysis markdown is agent-generated from JSON artifacts when requested.\n');
  
  return {
    jira: {
      total: issueList.length,
      cached: alreadyCached.length,
      fetched: fetched.length,
      failed: failed.length
    },
    confluence: {
      total: confluencePages.length,
      cached: confluenceCached.length,
      fetched: confluenceFetched.length,
      failed: confluenceFailed.length
    }
  };
}

// CLI usage
const args = process.argv.slice(2);
const parentKey = args.find(arg => !arg.startsWith('--'));
const subtasksOnly = args.includes('--subtasks-only');
const quiet = args.includes('--quiet');

if (!parentKey) {
  console.error('\nUsage: node fetch-related.js <ISSUE-KEY> [OPTIONS]');
  console.error('');
  console.error('Arguments:');
  console.error('  <ISSUE-KEY>       Parent Jira issue key (e.g., CEAJ-3843)');
  console.error('');
  console.error('Options:');
  console.error('  --subtasks-only   Fetch only direct subtasks');
  console.error('  --quiet           Suppress cached issues list');
  console.error('');
  console.error('Examples:');
  console.error('  node fetch-related.js CEAJ-3843');
  console.error('  node fetch-related.js CEAJ-3843 --subtasks-only');
  console.error('  node fetch-related.js CEAJ-3843 --quiet\n');
  process.exit(1);
}

// Load environment variables from workspace root
const { loadEnv } = require('../utils/env-loader');
loadEnv();

fetchRelatedIssues(parentKey, { subtasksOnly, quiet })
  .catch(error => {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  });
