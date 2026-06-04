const fs = require('fs');
const path = require('path');
const ConfluenceClient = require('../api/confluence-client');
const JiraClient = require('../api/jira-client');
const { getWorkspaceRoot } = require('../utils/env-loader');

/**
 * Fetch a Confluence page and save it locally
 * @param {string} pageId - Confluence page ID
 * @param {object} options - Options object
 * @param {boolean} options.useCache - Whether to use cached version if available (default: true)
 * @param {string} options.outputDir - Base output directory (overrides OUTPUT_DIR env var)
 * @param {boolean} options.silent - Suppress console output (default: false)
 * @param {string} options.url - Original URL for metadata (optional)
 * @param {boolean} options.fetchJiraDetails - Whether to fetch live Jira issue details (default: false, use --with-jira to enable)
 * @returns {Promise<object>} Result object with success status and paths
 */
async function fetchPage(pageId, options = {}) {
  // Get base output directory from env or use workspace root default
  const workspaceRoot = getWorkspaceRoot();
  const defaultOutputDir = process.env.OUTPUT_DIR 
    ? (path.isAbsolute(process.env.OUTPUT_DIR) 
        ? process.env.OUTPUT_DIR 
        : path.join(workspaceRoot, process.env.OUTPUT_DIR))
    : path.join(workspaceRoot, 'docs');
  
  const {
    useCache = true,
    outputDir: baseDir = path.join(defaultOutputDir, 'confluence'),
    silent = false,
    url = null,
    fetchJiraDetails = false
  } = options;
  
  // Search for cached version across all spaces and folder formats
  // Supports both old format ({SPACE}/{PAGE-ID}/) and new format ({SPACE}/{PAGE-ID}-{TITLE}/)
  let cachedMeta = null;
  let cachedDir = null;
  
  if (useCache && fs.existsSync(baseDir)) {
    const found = findCachedPage(baseDir, pageId);
    if (found) {
      cachedMeta = found.meta;
      cachedDir = found.dir;
    }
  }
  
  // Check if cached version exists
  if (cachedMeta && cachedDir) {
    const lastFetch = new Date(cachedMeta.lastFetch);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastFetch) / 1000 / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo;
    if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    const jsonPath = path.join(cachedDir, `${pageId}.json`);
    const metaPath = path.join(cachedDir, '.meta.json');
    const jiraPath = path.join(cachedDir, '.jira.json');
    const analysisPath = path.join(cachedDir, `${pageId}.analysis.md`);
    const legacyMarkdownPath = path.join(cachedDir, `${pageId}.md`);
    
    if (!silent) {
      console.log(`\n📦 Cached version found (fetched ${timeAgo})`);
      console.log(`   Page: ${cachedMeta.title}`);
      console.log(`   Checking if remote has updates...`);
    }
    
    // Check if remote has been modified (lightweight timestamp check)
    try {
      const client = new ConfluenceClient();
      const { version: remoteVersion } = await client.getPageTimestamp(pageId);
      
      const cachedVersion = cachedMeta.version;
      const isUpToDate = cachedVersion === remoteVersion.number;
      
      if (!silent) {
        console.log(`   Cached version:    v${cachedVersion || 'unknown'} (${cachedMeta.updated || 'unknown'})`);
        console.log(`   Remote version:    v${remoteVersion.number} (${remoteVersion.when})`);
        
        if (isUpToDate) {
          console.log(`   ✓ Cache is up to date!`);
          console.log(`\n📄 Using cached version. Use --fresh flag to force re-fetch.\n`);
        } else {
          console.log(`   ⚠ Remote has been updated (v${cachedVersion} → v${remoteVersion.number}) - fetching fresh copy...\n`);
        }
      }
      
      if (isUpToDate) {
        removeLegacyMarkdown(legacyMarkdownPath, silent);

        // If fetchJiraDetails is enabled, check if we need to refresh Jira data
        let jiraIssues = [];
        if (fetchJiraDetails) {
          jiraIssues = await refreshJiraDataIfNeeded(pageId, cachedDir, jiraPath, cachedMeta, silent);
        }
        
        return {
          success: true,
          cached: true,
          cacheUpToDate: true,
          timeAgo,
          paths: { outputDir: cachedDir, jsonPath, metaPath, jiraPath, analysisPath },
          meta: cachedMeta,
          jiraIssues
        };
      }
      
      // Fall through to fetch fresh copy
      if (!silent) {
        console.log(`🔄 Fetching updated version from Confluence...`);
      }
      
    } catch (timestampError) {
      // If timestamp check fails, use cached version anyway
      if (!silent) {
        console.log(`   ⚠ Could not check remote timestamp: ${timestampError.message}`);
        console.log(`   📄 Using cached version.\n`);
      }
      
      // If fetchJiraDetails is enabled, check if we need to refresh Jira data
      let jiraIssues = [];
      if (fetchJiraDetails) {
        jiraIssues = await refreshJiraDataIfNeeded(pageId, cachedDir, jiraPath, cachedMeta, silent);
      }
      
      return {
        success: true,
        cached: true,
        cacheUpToDate: null,
        timeAgo,
        paths: { outputDir: cachedDir, jsonPath, metaPath, jiraPath, analysisPath },
        meta: cachedMeta,
        jiraIssues
      };
    }
  }
  
  if (!silent && !cachedMeta) {
    console.log(`\n🔄 Fetching Confluence page: ${pageId}...`);
  }
  
  const client = new ConfluenceClient();
  
  try {
    // Fetch the page with all expansions
    const page = await client.getPage(pageId);
    
    // Sanitize title for folder name (remove special chars, limit length)
    const sanitizedTitle = sanitizeFolderName(page.title);
    
    // Update output directory to include space key and page title
    const spaceKey = page.space.key;
    const folderName = `${pageId}-${sanitizedTitle}`;
    const finalOutputDir = path.join(baseDir, spaceKey, folderName);
    const finalJsonPath = path.join(finalOutputDir, `${pageId}.json`);
    const finalMetaPath = path.join(finalOutputDir, '.meta.json');
    const finalJiraPath = path.join(finalOutputDir, '.jira.json');
    const analysisPath = path.join(finalOutputDir, `${pageId}.analysis.md`);
    const legacyMarkdownPath = path.join(finalOutputDir, `${pageId}.md`);
    
    if (!silent) {
      console.log(`✓ Retrieved page: ${page.title}`);
    }
    
    // Create output directory with space key
    fs.mkdirSync(finalOutputDir, { recursive: true });
    
    // Save metadata with timestamp
    const metadata = {
      pageId: page.id,
      lastFetch: new Date().toISOString(),
      title: page.title,
      space: page.space.key,
      version: page.version.number,
      updated: page.version.when,
      url: url || `${page._links.base}${page._links.webui}`,
      analysisFile: path.basename(analysisPath)
    };
    fs.writeFileSync(finalMetaPath, JSON.stringify(metadata, null, 2));
    
    // Save raw JSON
    fs.writeFileSync(finalJsonPath, JSON.stringify(page, null, 2));
    
    if (!silent) {
      console.log(`✓ Saved JSON: ${finalJsonPath}`);
    }
    
    // Extract Jira issue keys if fetchJiraDetails is enabled
    let jiraIssues = [];
    let issueKeys = [];
    if (fetchJiraDetails) {
      issueKeys = extractJiraIssueKeys(page.body.storage.value);
      if (issueKeys.length > 0 && !silent) {
        console.log(`✓ Found ${issueKeys.length} Jira issue(s): ${issueKeys.join(', ')}`);
        console.log(`🔄 Fetching live Jira data...`);
      }
      jiraIssues = await fetchJiraIssues(issueKeys, silent);
      
      // Save Jira data to separate cache file
      if (jiraIssues.length > 0) {
        const jiraCache = {
          lastFetch: new Date().toISOString(),
          issueKeys,
          issues: jiraIssues
        };
        fs.writeFileSync(finalJiraPath, JSON.stringify(jiraCache, null, 2));
        if (!silent) {
          console.log(`✓ Saved Jira data: ${finalJiraPath}`);
        }
      }
    }

    removeLegacyMarkdown(legacyMarkdownPath, silent);
    
    if (!silent) {
      console.log(`ℹ Markdown analysis is agent-generated from cached JSON: ${analysisPath}`);
      console.log(`\n✅ Done! Files saved to: ${finalOutputDir}\n`);
    }
    
    return {
      success: true,
      cached: false,
      cacheUpToDate: false,
      page,
      paths: { outputDir: finalOutputDir, jsonPath: finalJsonPath, metaPath: finalMetaPath, jiraPath: finalJiraPath, analysisPath },
      meta: metadata,
      jiraIssues
    };
  } catch (error) {
    if (!silent) {
      console.error(`\n✗ Error fetching page:`, error.message);
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error(`  Response:`, error.response.data);
      }
    }
    
    return {
      success: false,
      error: error.message,
      errorResponse: error.response
    };
  }
}

/**
 * Remove the legacy markdown artifact from older CLI runs.
 * Markdown analysis is now generated by the agent from cached JSON.
 * @param {string} markdownPath - Legacy markdown file path
 * @param {boolean} silent - Suppress console output
 */
function removeLegacyMarkdown(markdownPath, silent = false) {
  if (!fs.existsSync(markdownPath)) {
    return;
  }

  fs.unlinkSync(markdownPath);

  if (!silent) {
    console.log(`ℹ Removed legacy Markdown artifact: ${markdownPath}`);
  }
}

function sanitizeFolderName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .substring(0, 50)              // Limit length
    .replace(/-+$/, '');           // Remove trailing hyphen if substring cuts mid-word
}

/**
 * Find cached page by ID across all spaces and folder formats
 * Supports both old format ({SPACE}/{PAGE-ID}/) and new format ({SPACE}/{PAGE-ID}-{TITLE}/)
 * @param {string} baseDir - Base confluence directory
 * @param {string} pageId - Page ID to search for
 * @returns {object|null} Object with {meta, dir} or null if not found
 */
function findCachedPage(baseDir, pageId) {
  try {
    // Get all space directories
    const spaces = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Search each space for matching page folder
    for (const space of spaces) {
      const spacePath = path.join(baseDir, space);
      const folders = fs.readdirSync(spacePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      // Look for folders matching {PAGE-ID} or {PAGE-ID}-{TITLE}
      for (const folder of folders) {
        // Check if folder starts with pageId (exact match or followed by hyphen)
        if (folder === pageId || folder.startsWith(`${pageId}-`)) {
          const folderPath = path.join(spacePath, folder);
          const metaPath = path.join(folderPath, '.meta.json');
          
          if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            // Verify the pageId matches in metadata
            if (meta.pageId === pageId) {
              return { meta, dir: folderPath };
            }
          }
        }
      }
    }
  } catch (error) {
    // If any error during search, just return null (will fetch fresh)
    return null;
  }
  
  return null;
}

/**
 * Refresh Jira data if stale (older than 1 hour) or missing
 * @param {string} pageId - Page ID
 * @param {string} cachedDir - Directory where page is cached
 * @param {string} jiraPath - Path to .jira.json file
 * @param {object} pageMeta - Page metadata
 * @param {boolean} silent - Suppress console output
 * @returns {Promise<Array>} Array of Jira issues
 */
async function refreshJiraDataIfNeeded(pageId, cachedDir, jiraPath, pageMeta, silent = false) {
  let jiraIssues = [];
  let shouldRefresh = false;
  let jiraCache = null;
  
  // Check if Jira cache exists
  if (fs.existsSync(jiraPath)) {
    try {
      jiraCache = JSON.parse(fs.readFileSync(jiraPath, 'utf8'));
      
      // Check staleness (refresh if older than 1 hour)
      const lastFetch = new Date(jiraCache.lastFetch);
      const now = new Date();
      const hoursSinceRefresh = (now - lastFetch) / 1000 / 60 / 60;
      
      if (hoursSinceRefresh > 1) {
        shouldRefresh = true;
        if (!silent) {
          console.log(`   Jira data is ${Math.floor(hoursSinceRefresh * 60)} minutes old, refreshing...`);
        }
      } else {
        // Use cached Jira data
        jiraIssues = jiraCache.issues || [];
        if (!silent && jiraIssues.length > 0) {
          console.log(`   Loaded ${jiraIssues.length} Jira issue(s) from cache`);
        }
      }
    } catch (error) {
      shouldRefresh = true;
      if (!silent) {
        console.log(`   Could not read Jira cache, fetching fresh...`);
      }
    }
  } else {
    // No cache exists, need to fetch
    shouldRefresh = true;
  }
  
  // Refresh Jira data if needed
  if (shouldRefresh) {
    // Read the page JSON to extract issue keys
    const pageJsonPath = path.join(cachedDir, `${pageId}.json`);
    if (fs.existsSync(pageJsonPath)) {
      try {
        const pageData = JSON.parse(fs.readFileSync(pageJsonPath, 'utf8'));
        const issueKeys = extractJiraIssueKeys(pageData.body.storage.value);
        
        if (issueKeys.length > 0) {
          if (!silent) {
            console.log(`   Found ${issueKeys.length} Jira issue(s), fetching updates...`);
          }
          jiraIssues = await fetchJiraIssues(issueKeys, silent);
          
          // Update cache
          const newJiraCache = {
            lastFetch: new Date().toISOString(),
            issueKeys,
            issues: jiraIssues
          };
          fs.writeFileSync(jiraPath, JSON.stringify(newJiraCache, null, 2));

          if (!silent) {
            console.log(`   ✓ Updated Jira cache: ${jiraPath}`);
          }
        }
      } catch (error) {
        if (!silent) {
          console.warn(`   ⚠️  Could not refresh Jira data: ${error.message}`);
        }
      }
    }
  }
  
  return jiraIssues;
}

/**
 * Extract all Jira issue keys from Confluence page content
 * Finds patterns like PROJECT-123, ABC-456, etc.
 * @param {string} html - Confluence storage format HTML
 * @returns {string[]} Array of unique issue keys
 */
function extractJiraIssueKeys(html) {
  const issueKeys = new Set();
  
  // Pattern 1: Jira macros with key attribute
  const macroMatches = html.matchAll(/<structured-macro[^>]*name="jira"[^>]*>([\s\S]*?)<\/structured-macro>/gi);
  for (const match of macroMatches) {
    const keyMatch = match[1].match(/key="([A-Z]+-\d+)"/i);
    if (keyMatch) {
      issueKeys.add(keyMatch[1].toUpperCase());
    }
  }
  
  // Pattern 2: Plain text issue keys (e.g., "see ABC-123 for details")
  // Match word boundary + PROJECT-NUMBER pattern
  const textMatches = html.matchAll(/\b([A-Z]{2,10}-\d+)\b/g);
  for (const match of textMatches) {
    issueKeys.add(match[1].toUpperCase());
  }
  
  // Pattern 3: Issue keys in links
  const linkMatches = html.matchAll(/href="[^"]*\/browse\/([A-Z]+-\d+)"/gi);
  for (const match of linkMatches) {
    issueKeys.add(match[1].toUpperCase());
  }
  
  return Array.from(issueKeys).sort();
}

/**
 * Fetch multiple Jira issues in a single batch API call
 * @param {string[]} issueKeys - Array of issue keys to fetch
 * @param {boolean} silent - Suppress console output
 * @returns {Promise<object[]>} Array of simplified issue objects
 */
async function fetchJiraIssues(issueKeys, silent = false) {
  if (!issueKeys || issueKeys.length === 0) {
    return [];
  }
  
  try {
    const jiraClient = new JiraClient();
    
    // Single JQL query to fetch all issues at once
    const jql = `key IN (${issueKeys.join(',')})`;
    
    if (!silent) {
      console.log(`   Fetching ${issueKeys.length} issue(s) in batch...`);
    }
    
    // Fetch with specific fields for performance
    const issues = await jiraClient.search(jql, {
      fields: ['summary', 'status', 'assignee', 'priority', 'issuetype', 'duedate'],
      maxResults: 100
    });
    
    if (!silent) {
      console.log(`✓ Retrieved ${issues.length} issue(s)`);
    }
    
    // Simplify issue data for markdown
    return issues.map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name || 'Unknown',
      assignee: issue.fields.assignee?.displayName || null,
      priority: issue.fields.priority?.name || null,
      type: issue.fields.issuetype?.name || null,
      dueDate: issue.fields.duedate || null,
      url: `${jiraClient.baseURL}/browse/${issue.key}`
    }));
    
  } catch (error) {
    if (!silent) {
      console.warn(`⚠️  Warning: Could not fetch Jira issues: ${error.message}`);
      console.warn(`   Continuing without Jira enrichment...`);
    }
    return [];
  }
}

/**
 * Fetch page attachments (especially Gliffy diagrams)
 * @param {string} pageId - Confluence page ID
 * @param {string} outputDir - Directory to save attachments
 * @param {object} options - Options
 * @param {boolean} options.silent - Suppress console output
 * @param {boolean} options.gliffyOnly - Only fetch Gliffy diagram images (default: true)
 * @returns {Promise<Array>} Array of saved attachment info
 */
async function fetchPageAttachments(pageId, outputDir, options = {}) {
  const { silent = false, gliffyOnly = true } = options;
  
  try {
    const client = new ConfluenceClient();
    const attachments = await client.getPageAttachments(pageId);
    
    if (attachments.length === 0) {
      if (!silent) {
        console.log(`   No attachments found for page ${pageId}`);
      }
      return [];
    }
    
    // Filter for Gliffy diagrams (PNG images generated by Gliffy)
    let targetAttachments = attachments;
    if (gliffyOnly) {
      // Gliffy creates PNG attachments with specific naming pattern
      targetAttachments = attachments.filter(att => 
        att.title && 
        att.title.toLowerCase().endsWith('.png') &&
        att.metadata &&
        att.metadata.mediaType === 'image/png'
      );
    }
    
    if (targetAttachments.length === 0) {
      if (!silent) {
        console.log(`   No ${gliffyOnly ? 'Gliffy diagram' : 'target'} attachments found`);
      }
      return [];
    }
    
    // Create attachments directory
    const attachmentsDir = path.join(outputDir, 'attachments');
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true });
    }
    
    const savedAttachments = [];
    
    if (!silent) {
      console.log(`\n📎 Fetching ${targetAttachments.length} attachment${targetAttachments.length !== 1 ? 's' : ''}...`);
    }
    
    for (const attachment of targetAttachments) {
      try {
        // Download attachment
        const downloadUrl = attachment._links?.download;
        if (!downloadUrl) {
          if (!silent) {
            console.log(`   ⚠ Skipping ${attachment.title} (no download link)`);
          }
          continue;
        }
        
        // Extract path from download URL (e.g., "/download/attachments/...")
        const downloadPath = downloadUrl.replace(/^.*?(\/download\/.*)$/, '$1');
        const fileData = await client.downloadAttachment(downloadPath);
        
        // Save to file
        const filename = attachment.title;
        const filepath = path.join(attachmentsDir, filename);
        fs.writeFileSync(filepath, fileData);
        
        savedAttachments.push({
          id: attachment.id,
          title: attachment.title,
          mediaType: attachment.metadata?.mediaType,
          filesize: attachment.extensions?.fileSize,
          path: filepath,
          relativePath: `attachments/${filename}`
        });
        
        if (!silent) {
          const sizeKB = attachment.extensions?.fileSize 
            ? `${Math.round(attachment.extensions.fileSize / 1024)} KB` 
            : 'unknown size';
          console.log(`   ✓ ${filename} (${sizeKB})`);
        }
      } catch (error) {
        if (!silent) {
          console.warn(`   ⚠ Failed to download ${attachment.title}: ${error.message}`);
        }
      }
    }
    
    if (!silent && savedAttachments.length > 0) {
      console.log(`✓ Saved ${savedAttachments.length} attachment${savedAttachments.length !== 1 ? 's' : ''} to ${attachmentsDir}`);
    }
    
    return savedAttachments;
  } catch (error) {
    if (!silent) {
      console.warn(`⚠️  Warning: Could not fetch attachments: ${error.message}`);
    }
    return [];
  }
}

module.exports = {
  fetchPage,
  findCachedPage,
  extractJiraIssueKeys,
  fetchJiraIssues,
  fetchPageAttachments
};
