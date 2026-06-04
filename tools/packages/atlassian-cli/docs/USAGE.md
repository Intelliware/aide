# Atlassian CLI - Usage Guide

> Complete guide for using the Atlassian CLI to fetch Jira issues and Confluence pages

## 📋 Quick Reference

```bash
# From tools/atlassian-cli directory
cd tools/atlassian-cli
npm run issue -- PROJ-123         # Fetch single Jira issue
npm run related -- PROJ-123       # Fetch issue + all related items
npm run page -- 123456            # Fetch Confluence page

# Using global CLI (works from any directory)
atl j issue PROJ-123              # Fetch single issue
atl cache status                  # Check cache
atl auth status                   # Check authentication

# Note: Confluence global commands coming in v0.2.0
# For now, use npm scripts for Confluence pages
```

---

## 🎯 Usage Methods

There are three ways to use the Atlassian CLI:

### 1. Using npm scripts (from atlassian-cli directory)

Navigate to tool directory and use npm scripts:

```bash
cd tools/atlassian-cli

# Fetch Jira issue
npm run issue -- PROJ-123

# Fetch Confluence page
npm run page -- 2315130362

# Fetch issue with all related items
npm run related -- PROJ-123
```

**Pros**:
- Simple commands
- Direct access to tool scripts
- Works reliably

### 2. From atlassian-cli Directory

Navigate to tool directory and use simplified scripts:

```bash
cd tools/atlassian-cli

# Simplified npm scripts (no prefix)
npm run issue -- PROJ-123
npm run related -- PROJ-123
npm run page -- 2315130362
npm run generate-mapping
```

**Pros**:
- Shorter commands
- Direct access to tool scripts

### 3. Global CLI (Jira only for now)

Call scripts directly with Node:

```bash
# From workspace root
node tools/atlassian-cli/src/standalone/fetch-jira-issue.js PROJ-123
node tools/atlassian-cli/src/standalone/fetch-related.js PROJ-123
node tools/atlassian-cli/src/standalone/fetch-confluence-page.js 2315130362

# From tools/atlassian-cli
node src/standalone/fetch-jira-issue.js PROJ-123
```

**Pros**:
- No npm overhead
- Direct execution
- Clear what's being run

### 4. Global CLI (Optional)

Install globally for system-wide access:

```bash
# One-time setup
cd tools/atlassian-cli
npm link

# Now use 'atl' from anywhere
atl j issue PROJ-123
atl c page 2315130362
atl cache status
```

**Pros**:
- Shortest commands
- Available globally
- Professional CLI experience

---

## 📄 Fetching Jira Issues

### Fetch Single Issue

```bash
npm run issue -- PROJ-123
```

**Output**:
```
🔍 Fetching Jira issue: PROJ-123

✓ Fetched PROJ-123
  Summary: Implement user profile page
  Status: In Progress
  
📄 Saved to: atl/jira/PROJ-123/PROJ-123.md
📦 Cached: Yes

✅ Issue fetched successfully
```

**Files created**:
```
atl/jira/PROJ-123/
├── PROJ-123.json      # Raw API response
├── PROJ-123.md        # Formatted markdown
└── .meta.json          # Cache metadata
```

### Fetch with Fresh Data

Force re-fetch from API, ignoring cache:

```bash
cd tools/atlassian-cli
npm run issue -- PROJ-123 --fresh
```

**Use when**:
- Issue was recently updated
- You need the latest data
- Cache might be stale

### Fetch Related Issues

Fetch an issue and all related items (subtasks, linked issues, epic):

```bash
cd tools/atlassian-cli
npm run related -- PROJ-123
```

**What it fetches**:
- Parent issue
- All subtasks
- Linked issues (blocks, relates to, duplicates)
- Epic (if issue is in an epic)
- Referenced issues in description/comments
- Referenced Confluence pages

**Options**:
```bash
# Fetch only direct subtasks
npm run related -- PROJ-123 -- --subtasks-only

# Suppress cached items list
npm run related -- PROJ-123 -- --quiet
```

**Output**:
```
🔍 Analyzing PROJ-123 for related issues...

📋 Found 12 related issues

✓ Already cached: 8
↓ Need to fetch: 4

🔄 Fetching 4 uncached issues:

   [1/4] CEAJ-3844... ✓
   [2/4] CEAJ-3845... ✓
   [3/4] CEAJ-3846... ✓
   [4/4] CEAJ-3847... ✓

🔍 Analyzing for Confluence pages...

📄 Found 2 Confluence URLs
✓ Already cached: 1
↓ Need to fetch: 1

====================================================================
📊 Fetch Summary for PROJ-123
====================================================================
Total related Jira issues: 12
  Already cached: 8
  Newly fetched: 4
Total Confluence pages: 2
  Already cached: 1
  Newly fetched: 1
====================================================================
```

---

## 📄 Fetching Confluence Pages

### Fetch Single Page

```bash
npm run page -- 2315130362
```

**Output**:
```
🔍 Fetching Confluence page: 2315130362

✓ Fetched page 2315130362
  Title: User Profile Feature Specification
  Space: EA (EasyApply)
  
📄 Saved to: atl/confluence/2315130362/2315130362.md
📦 Cached: Yes

✅ Page fetched successfully
```

**Files created**:
```
atl/confluence/2315130362/
├── 2315130362.json     # Raw API response
├── 2315130362.md       # Formatted markdown
└── .meta.json          # Cache metadata
```

### Fetch with Fresh Data

```bash
npm run page -- 2315130362 -- --fresh
```

### Find Page ID from URL

Confluence URLs contain the page ID:

```
https://confluence.example.com/pages/viewpage.action?pageId=2315130362
                                                          ^^^^^^^^^^
                                                          Page ID
```

Or from short URL:
```
https://confluence.example.com/pages/2315130362/Feature+Spec
                                  ^^^^^^^^^^
                                  Page ID
```

---

## 🗄️ Cache Management

### Check Cache Status

```bash
npm run atl cache status
```

**Output**:
```
📦 Cache Status

Location: /workspace/atl
Total size: 45.2 MB

Jira Issues: 127 issues
  Last fetched: 2 hours ago
  Oldest: 30 days ago

Confluence Pages: 43 pages
  Last fetched: 5 hours ago
  Oldest: 15 days ago
```

### List Cached Items

```bash
# List all cached Jira issues
npm run atl cache list jira

# List all cached Confluence pages
npm run atl cache list confluence

# Show details
npm run atl cache list jira --verbose
```

### Clear Cache

```bash
# Clear all cache
npm run atl cache clear

# Clear only Jira cache
npm run atl cache clear jira

# Clear only Confluence cache
npm run atl cache clear confluence

# Clear specific issue
npm run atl cache clear jira PROJ-123
```

### How Caching Works

**Default behavior** (uses cache):
- On first fetch, data is downloaded and cached
- Subsequent fetches use cached data
- Cache metadata includes last fetch time
- Cache never expires automatically

**Fresh fetch** (bypasses cache):
- Use `--fresh` flag to force API call
- Updates cache with latest data
- Useful when you know data changed

**Cache location**:
```
workspace-root/atl/
├── jira/
│   ├── PROJ-123/
│   ├── CEAJ-3844/
│   └── ...
└── confluence/
    ├── 2315130362/
    ├── 2315130363/
    └── ...
```

---

## 🔍 Using the Full CLI

The full CLI provides additional commands and options.

### Jira Commands

```bash
# Fetch issue
npm run atl j issue PROJ-123

# Fetch with options
npm run atl j issue PROJ-123 --fresh
npm run atl j issue PROJ-123 --no-cache

# Fetch related items
npm run atl j related PROJ-123
npm run atl j related PROJ-123 --subtasks-only
```

### Confluence Commands

```bash
# Fetch page
npm run atl c page 2315130362

# Fetch with options
npm run atl c page 2315130362 --fresh
```

### Cache Commands

```bash
# Status
npm run atl cache status

# List items
npm run atl cache list jira
npm run atl cache list confluence

# Clear cache
npm run atl cache clear
npm run atl cache clear jira PROJ-123
```

### Auth Commands

```bash
# Check authentication
npm run atl auth status

# Test connection
npm run atl auth test
```

---

## 📊 Output Format

### Jira Issue Markdown

Issues are exported to structured markdown:

```markdown
# PROJ-123: Implement user profile page

**Type**: Story  
**Status**: In Progress  
**Priority**: High  
**Assignee**: John Doe  
**Reporter**: Jane Smith  
**Created**: 2026-03-15  
**Updated**: 2026-04-10  

## Description

User profile page needs to display user information...

## Acceptance Criteria

- [ ] User can view their profile
- [ ] User can edit their information
- [x] Profile photo upload works

## Subtasks

- [x] CEAJ-3844: Design profile UI → [View](../CEAJ-3844/CEAJ-3844.md)
- [ ] CEAJ-3845: Implement profile API → [View](../CEAJ-3845/CEAJ-3845.md)

## Links

- Blocks: CEAJ-3800 → [View](../CEAJ-3800/CEAJ-3800.md)
- Relates to: CEAJ-3850

## Comments

### John Doe - 2026-04-10
Making good progress on the UI components...
```

See [OUTPUT-FORMAT.md](OUTPUT-FORMAT.md) for complete specification.

### Confluence Page Markdown

```markdown
# User Profile Feature Specification

**Space**: EA (EasyApply)  
**Version**: 12  
**Last Modified**: 2026-04-10 by Jane Smith  

## Overview

This document specifies...

[Content continues in markdown format]
```

---

## 💡 Common Workflows

### Workflow 1: Start Working on a Story

```bash
# 1. Fetch the story
npm run issue -- PROJ-123

# 2. Fetch all related items (subtasks, specs, etc.)
npm run related -- PROJ-123

# 3. Review in your editor
code atl/jira/PROJ-123/PROJ-123.md
```

**Result**: All requirements, subtasks, and related documentation available locally in markdown.

### Workflow 2: Review Epic with All Stories

```bash
# 1. Fetch the epic
npm run issue -- CEAJ-3000

# 2. Fetch all child stories
npm run related -- CEAJ-3000

# 3. Generate report (custom script)
ls -d atl/jira/CEAJ-3* | wc -l  # Count fetched issues
```

### Workflow 3: Update Stale Cache

```bash
# 1. List old cached items
npm run atl cache list jira --verbose

# 2. Refresh specific issues
npm run issue -- PROJ-123 -- --fresh
npm run issue -- CEAJ-3844 -- --fresh

# Or clear and re-fetch
npm run atl cache clear jira PROJ-123
npm run issue -- PROJ-123
```

### Workflow 4: Export Team's Sprint

```bash
# Fetch all sprint issues
npm run issue -- PROJ-123
npm run issue -- CEAJ-3844
npm run issue -- CEAJ-3845
# ... etc

# Or fetch parent epic with all children
npm run related -- CEAJ-3000
```

---

## 🔧 Advanced Usage

### Generate Field Mappings

If your org uses custom Jira fields, generate mappings:

```bash
# From tools/atlassian-cli
npm run generate-mapping
```

This creates `src/utils/field-mapping.json` mapping custom field IDs to readable names.

### Custom Field Configuration

Edit `src/utils/field-mapping.json` to customize which fields are exported:

```json
{
  "customfield_10008": "Epic Link",
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner",
  "customfield_26904": "Feature Size",
  "customfield_26905": "Feature Statement"
}
```

### Programmatic Usage

Import core functions in your scripts:

```javascript
const { fetchIssue } = require('./tools/atlassian-cli/src/core/fetch-issue');
const { fetchPage } = require('./tools/atlassian-cli/src/core/fetch-page');

// Fetch issue programmatically
const result = await fetchIssue('PROJ-123', { 
  useCache: true,
  silent: false 
});

if (result.success) {
  console.log('Fetched:', result.meta.summary);
  console.log('Markdown:', result.markdown);
}
```

### Batch Operations

Create scripts to batch fetch multiple issues:

```bash
#!/bin/bash
# fetch-sprint.sh - Fetch all sprint issues

ISSUES=(
  "PROJ-123"
  "CEAJ-3844"
  "CEAJ-3845"
  "CEAJ-3846"
)

for issue in "${ISSUES[@]}"; do
  echo "Fetching $issue..."
  npm run issue -- "$issue"
done

echo "✅ Fetched ${#ISSUES[@]} issues"
```

---

## 🐛 Troubleshooting

### Issue not found

**Error**:
```
❌ Error: Issue CEAJ-9999 not found (404)
```

**Solutions**:
- Verify issue key is correct
- Check you have permission to view the issue
- Ensure issue exists in Jira

### Rate limiting

**Error**:
```
❌ Error: Too many requests (429)
```

**Solutions**:
- Wait a few minutes before retrying
- Use cached data when possible
- Atlassian has rate limits per token

### Slow fetches

**If fetches are slow**:
- Use cache: don't use `--fresh` unless needed
- Check network connection
- Atlassian API may be slow during peak hours

### Large issues timeout

**For very large issues** (many comments, attachments):
- First fetch may take time
- Subsequent fetches use cache
- Consider fetching during off-hours

---

## 📚 See Also

- **[../SETUP-ATL-CLI.md](../SETUP-ATL-CLI.md)** - Installation and configuration
- **[COMMAND-REFERENCE.md](COMMAND-REFERENCE.md)** - Complete command reference
- **[OUTPUT-FORMAT.md](OUTPUT-FORMAT.md)** - Output format specification
- **[WRITE-OPERATIONS.md](WRITE-OPERATIONS.md)** - Creating and updating issues

---

**Need help?** Check [COMMAND-REFERENCE.md](COMMAND-REFERENCE.md) for complete command documentation.
