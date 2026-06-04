# Atlassian CLI - Complete Command Reference

This is the complete command reference for the Atlassian CLI tool. For setup instructions, see [../SETUP-ATL-CLI.md](../SETUP-ATL-CLI.md).

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Jira Commands](#jira-commands)
  - [Fetch Single Issue](#fetch-single-issue)
  - [Fetch from URL](#fetch-from-url)
  - [Fetch All Related Items](#fetch-all-related-items-)
  - [Create New Issue](#create-new-issue-)
  - [Update Issue Status](#update-issue-status-)
- [Confluence Commands](#confluence-commands)
  - [Fetch Single Page](#fetch-single-page)
  - [Fetch Page from URL](#fetch-page-from-url)
- [Cache Commands](#cache-commands)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Pro Tips](#pro-tips)
- [Common Workflows](#common-workflows)

---

## Quick Reference

```bash
# Jira - Read Operations
atl j issue <KEY>          # Fetch single issue
atl j related <KEY>        # Fetch issue + all related items
atl j url <URL>            # Fetch from URL

# Jira - Write Operations  
atl j create <PROJECT>     # Create new issue (interactive)
atl j transition <KEY>     # Update issue status (interactive)
atl j status <KEY>         # Alias for transition

# Confluence - Read Operations
atl c page <PAGE-ID>       # Fetch single page
atl c url <URL>            # Fetch from URL

# Cache
atl cache status           # View cache stats
atl cache list             # List cached items
atl cache clear            # Clear all cache

# Auth
atl auth login             # Save credentials
atl auth status            # Check authentication
atl auth logout            # Remove credentials
```

---

## Jira Commands

### Fetch Single Issue
Fetch a single Jira issue and convert to Markdown:
```bash
atl j issue <ISSUE-KEY>
atl j issue PROJ-123
```

**Options:**
- `--fresh` - Force fetch from API, ignore cache

**Output:**
- `atl/jira/{ISSUE-KEY}/{ISSUE-KEY}.json` - Raw JSON from API
- `atl/jira/{ISSUE-KEY}/{ISSUE-KEY}.md` - Converted Markdown
- `atl/jira/{ISSUE-KEY}/.meta.json` - Cache metadata

### Fetch from URL
Extract issue key from URL and fetch:
```bash
atl j url <JIRA-URL>
atl j url https://jira.example.com/browse/PROJ-123
```

### Fetch All Related Items ⭐
**Fetch all related Jira issues AND Confluence pages from a parent issue:**
```bash
atl j related <ISSUE-KEY>
atl j related PROJ-123
```

**What it does:**
1. Reads the parent issue's JSON and Markdown
2. Extracts all related Jira keys (subtasks, links, epic, parent, mentioned in comments)
3. Extracts all Confluence page URLs from the markdown
4. Checks which items are already cached
5. Fetches only uncached items (respects rate limits)
6. Updates parent markdown with:
   - ✅ Checked boxes for cached Jira issues
   - 🔗 Relative links to all cached markdown files
   - ⏰ Timestamps showing cache age
   - 📄 Links to cached Confluence pages

**Options:**
- `--subtasks-only` - Fetch only direct subtasks (ignore links, epic, etc.)
- `--quiet` - Suppress the list of already-cached items

**Examples:**
```bash
# Fetch everything (uses cache by default)
atl j related PROJ-123

# Fetch only subtasks
atl j related PROJ-123 --subtasks-only

# Quiet mode (less output)
atl j related PROJ-123 --quiet
```

**Output:**
- Fetches Jira issues to: `atl/jira/{ISSUE-KEY}/`
- Fetches Confluence pages to: `atl/confluence/{PAGE-ID}/`
- Updates parent markdown: `atl/jira/{PARENT-KEY}/{PARENT-KEY}.md`
- Shows summary: Total/Cached/Fetched/Failed counts

**Example Output:**
```
📋 Found 49 related issues
✓ Already cached: 12
↓ Need to fetch: 37

🔄 Fetching 37 uncached issues:
   [1/37] PPCIAM-756... ✓
   ...

📄 Found 2 Confluence URLs
✓ Already cached: 2

============================================================
📊 Fetch Summary for PROJ-123
============================================================
Total related Jira issues: 49
  Already cached: 12
  Newly fetched: 37
Total Confluence pages: 2
  Already cached: 2
  Newly fetched: 0
============================================================

🔄 Updating parent issue with cache status and links...
   ✓ Updated PROJ-123.md with cache status and links
```

## Cache Commands

### Create New Issue ✏️
Create a new Jira issue with project-specific field mapping support:
```bash
atl j create <PROJECT-KEY>
atl j create CEAJ
```

**Interactive Mode:**
- Prompts for issue type, summary, description
- Prompts for assignee, priority, labels
- Optionally prompts for custom fields
- Validates and creates the issue

**Template Mode:**
```bash
atl j create CEAJ --template user-story
atl j create CEAJ -t bug
```

**Example:**
```bash
$ atl j create CEAJ

🎫 Creating new Jira issue in CEAJ
? Issue Type: Story
? Summary: Implement user login feature
? Description: [Opens editor]
? Assignee: john.doe@example.com
? Priority: High
? Labels: authentication, security
? Add custom fields? Yes

✅ Issue created: PROJ-1234
🔗 https://jira.example.com/browse/PROJ-1234
```

**👉 See [WRITE-OPERATIONS.md](WRITE-OPERATIONS.md) for complete guide**

---

### Update Issue Status 🔄
Update issue status with automatic mandatory field validation:
```bash
atl j transition <ISSUE-KEY>
atl j status <ISSUE-KEY>      # Alias
```

**Interactive Mode (Recommended):**
```bash
atl j transition PROJ-1234
```

**What it does:**
1. Fetches current issue and available transitions
2. Loads project-specific transition rules
3. Validates transition requirements (assignee, subtasks, etc.)
4. Auto-populates mandatory fields (start/end dates)
5. Prompts for user-provided fields
6. Executes the transition

**Direct Mode:**
```bash
# Quick status change
atl j transition PROJ-1234 --status "In Progress"

# With comment
atl j status PROJ-1234 -s "Done" -c "Implementation complete"
```

**Example:**
```bash
$ atl j transition PROJ-1234

🔄 Updating status for PROJ-1234
Current status: To Do
? Select new status: In Progress

✓ Auto-set Development Start Date: 2026-04-14
✓ Validation passed

? Add a comment? Yes
? Comment: Starting implementation

✅ Status updated successfully
```

**Auto-Tracked Fields for Velocity:**
- Development Start Date (→ In Progress)
- Code Review Start Date (→ Code Review)
- QA Start Date (→ In QA)
- Completion Date (→ Done)
- Blocked Date (→ Blocked)

**👉 See [WRITE-OPERATIONS.md](WRITE-OPERATIONS.md) for complete guide**

---

## Confluence Commands

### Fetch Single Page
Fetch a single Confluence page and convert to Markdown:
```bash
atl c page <PAGE-ID>
atl c page 3309101741
```

**Options:**
- `--fresh` - Force fetch from API, ignore cache
- `-o, --output <dir>` - Custom output directory

**Output:**
- `cache/confluence/{SPACE}/{PAGE-ID}/{PAGE-ID}.json` - Raw Confluence API response
- `cache/confluence/{SPACE}/{PAGE-ID}/{PAGE-ID}.analysis.md` - Agent-generated analysis (when populated)
- `cache/confluence/{SPACE}/{PAGE-ID}/.meta.json` - Cache metadata

**Example:**
```bash
$ atl c page 3309101741

🔄 Fetching Confluence page: 3309101741...
✓ Retrieved page: Requirements for Flow 1 - Arrival Ready
✓ Saved JSON: cache/confluence/CEA/3309101741/3309101741.json

✅ Done! Files saved to: cache/confluence/CEA/3309101741
```

**Cached Results:**
```bash
$ atl c page 3309101741

📦 Cached version found!
   Last retrieved: 4/15/2026, 2:26:55 PM (15 minutes ago)
   Location: cache/confluence/CEA/3309101741

Using cached version. Use --fresh flag to fetch new data.
```

### Fetch Page from URL
Extract page ID from Confluence URL and fetch:
```bash
atl c url <CONFLUENCE-URL>
atl c url https://confluence.example.com/spaces/MYSPACE/pages/3309101741/Requirements+for+Flow+1
```

**Supported URL formats:**
```bash
# Query parameter format
https://confluence.example.com/pages/viewpage.action?pageId=123456

# Display format
https://confluence.example.com/display/SPACE/Page+Title?pageId=123456

# Modern format
https://confluence.example.com/spaces/SPACE/pages/123456/Page+Title
```

**Example:**
```bash
$ atl c url "https://confluence.example.com/spaces/MYSPACE/pages/3309101741/Requirements"

🔄 Fetching Confluence page: 3309101741...
✓ Retrieved page: Requirements for Flow 1 - Arrival Ready
```

---

## Cache Commands

### View Cache Status
```bash
atl cache status
```

Shows statistics about your local cache.

## Authentication

### Login
```bash
atl auth login
```

Authenticate with Jira/Confluence using Personal Access Token (PAT).

## Pro Tips

1. **Always fetch parent first:**
   ```bash
   atl j issue PROJ-123        # Fetch parent
   atl j related PROJ-123      # Then fetch all related
   ```

2. **Use cache by default:**
   - `atl j related` uses cached data (fast, no API calls)
   - Cached items are skipped automatically
   - Only uncached items are fetched

3. **Navigate with links:**
   - After `related` command, parent markdown has clickable links
   - Links use relative paths: `../../../jira/ISSUE-KEY/ISSUE-KEY.md`
   - Works in VS Code, GitHub, and markdown viewers

4. **Check what's cached:**
   - Look for `✓ Already cached: X` in output
   - Check `atl/jira/` and `atl/confluence/` directories
   - Each folder has `.meta.json` with timestamp

5. **Rate limiting is automatic:**
   - 200ms delay between API requests (built-in)
   - Respects Jira/Confluence rate limits
   - No need to worry about throttling

---

## Configuration

### Environment Variables

Create `.env` at workspace root (recommended) or in `tools/atlassian-cli/`:

```bash
# Atlassian Configuration
CONFLUENCE_URL=https://your-org.atlassian.net
ATLASSIAN_TOKEN=your_confluence_token

JIRA_URL=https://your-org.atlassian.net
JIRA_TOKEN=your_jira_token

# Alternative: Single token for both (Atlassian Cloud)
# ATLASSIAN_URL=https://your-org.atlassian.net
# ATLASSIAN_TOKEN=your_token

# Cache settings (optional)
# CACHE_DIR=./atl
```

**How env loading works:**
- Scripts automatically search up the directory tree for `.env`
- Looks for workspace markers (`package.json`, `.git`)
- Falls back to tool directory if not found
- See `src/utils/env-loader.js` for details

### Getting Personal Access Tokens

**Atlassian Cloud:**
1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it (e.g., "EasyApply CLI")
4. Copy token immediately (won't be shown again)
5. Add to `.env`

**Atlassian Data Center/Server:**
1. Visit: `https://your-domain/plugins/personalaccesstokens/usertokens.action`
2. Create token with read permissions
3. Add to `.env`

### Local Config (Alternative)

Store credentials locally using CLI:
```bash
atl auth login
```

Stored in encrypted local config. **Priority**: `.env` > Local config

---

## File Structure

```
atl/
├── jira/
│   ├── PROJ-123/
│   │   ├── PROJ-123.json          # Raw JSON
│   │   ├── PROJ-123.md            # Markdown with links
│   │   └── .meta.json              # Cache metadata
│   ├── CEAJ-3844/
│   │   └── ...
│   └── PPCIAM-756/
│       └── ...
└── confluence/
    ├── 2315130362/
    │   ├── 2315130362.json         # Raw JSON
    │   ├── 2315130362.md           # Converted markdown
    │   └── .meta.json              # Cache metadata
    └── 3152195935/
        └── ...
```

## Environment Variables

Create `.env` file in `atlassian-cli/` folder:
```env
# Confluence
ATLASSIAN_URL=https://confluence.example.com
ATLASSIAN_TOKEN=your_confluence_pat_here

# Jira (optional - falls back to ATLASSIAN_* if not set)
JIRA_URL=https://jira.example.com
JIRA_TOKEN=your_jira_pat_here
```

---

## Markdown Features in Output

### YAML Frontmatter
Every Jira issue includes metadata:
```yaml
---
issue_key: PROJ-123
issue_type: Feature
status: Refining
priority: High
feature_type: Primary
feature_size: L
qbr: FY25 Q4
...
---
```

### Table of Contents
Auto-generated based on sections present:
```markdown
## Table of Contents
- [Feature Statement](#feature-statement)
- [Acceptance Criteria](#acceptance-criteria)
- [Description](#description)
- [Comments](#comments)
- [Subtasks](#subtasks)
- [Links](#links)
```

### Linked Subtasks
After using `related` command:
```markdown
## Subtasks
- [x] CEAJ-3844: Business Case → [View](../../../jira/CEAJ-3844/CEAJ-3844.md) (cached: 5 minutes ago)
- [x] CEAJ-3846: HLAD → [View](../../../jira/CEAJ-3846/CEAJ-3846.md) (cached: 5 minutes ago)
```

### Linked Confluence Pages
```markdown
#### Confluence Documentation
- [ ] [HLAD - Architecture Design](https://confluence.example.com/pages/viewpage.action?pageId=2315130362) → [View Cached](../../../confluence/2315130362/2315130362.md) (cached: 15 minutes ago)
```

## Common Workflows

### Workflow 1: Quick Issue Fetch
```bash
atl j issue PROJ-123
```

### Workflow 2: Deep Analysis (Recommended)
```bash
# Step 1: Fetch parent
atl j issue PROJ-123

# Step 2: Fetch all related (Jira + Confluence)
atl j related PROJ-123

# Step 3: Open parent markdown in editor
# Click links to navigate to related issues/docs
```

### Workflow 3: Subtasks Only
```bash
atl j related PROJ-123 --subtasks-only
```

### Workflow 4: Fresh Fetch
```bash
# Fetch parent (force fresh)
atl j issue PROJ-123 --fresh

# Related command always respects existing cache
# To refresh related items, delete their folders first
rm -rf atl/jira/CEAJ-3844
atl j related PROJ-123
```

## Troubleshooting

### Issue: "Parent issue not found locally"
```bash
# Solution: Fetch parent first
atl j issue PROJ-123
atl j related PROJ-123
```

### Issue: Authentication failed (401)
```bash
# Solution: Check your PAT and environment variables
atl auth login
# Or verify .env file has correct JIRA_TOKEN
```

### Issue: Rate limited (429)
```bash
# Solution: Wait 60 seconds and try again
# Built-in 200ms delay should prevent this
# If persistent, use cache more (don't use --fresh)
```

### Issue: Confluence page not found (404)
Confluence pages may require different permissions or may have been deleted. Check the URL in a browser first.

## Performance Tips

- **Cache is your friend**: Default behavior uses cache (fast)
- **Batch operations**: Use `related` once instead of multiple `issue` calls
- **Parallelization**: Jira issues fetched sequentially for rate limit compliance
- **Expected time**: ~5-10 seconds for 37 issues (200ms × 37 = 7.4s minimum)
