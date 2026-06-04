# Troubleshooting Guide - Atlassian CLI

> Common issues and solutions for the Atlassian CLI and AI skills

**Version**: 0.0.1  
**Last Updated**: April 15, 2026

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Command Failures](#command-failures)
- [Skill Issues](#skill-issues)
- [Cache Issues](#cache-issues)
- [Performance Issues](#performance-issues)
- [Advanced Debugging](#advanced-debugging)

---

## Installation Issues

### ❌ npm install fails with "Cannot find module"

**Problem**: Missing dependencies after installation.

**Solution**:
```bash
# Clear npm cache and reinstall
cd tools/atlassian-cli
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Prevention**: Ensure Node.js version >= 14.0.0:
```bash
node --version  # Should show v14.0.0 or higher
```

---

### ❌ "Permission denied" during npm install

**Problem**: Insufficient file system permissions.

**Solution on Windows**:
```bash
# Run terminal as Administrator, or:
npm config set prefix "%APPDATA%\npm"
npm install -g
```

**Solution on Mac/Linux**:
```bash
sudo chown -R $USER /usr/local/lib/node_modules
npm install
```

---

### ❌ Global CLI command `atl` not found

**Problem**: CLI not linked globally or PATH not configured.

**Solution**:
```bash
cd tools/atlassian-cli
npm link

# Verify installation
atl --version
which atl  # Should show path to atl command
```

**Alternative** (if npm link fails):
```bash
# Add to your PATH in ~/.bashrc or ~/.zshrc (Mac/Linux)
export PATH="$PATH:$HOME/code/ea/tools/atlassian-cli/bin"

# Windows: Add to system PATH manually via Environment Variables
```

---

## Authentication Issues

### ❌ "401 Unauthorized" when fetching issues/pages

**Problem**: Invalid or missing API token.

**Symptoms**:
```
✗ Error fetching issue: Request failed with status code 401
```

**Solution**:
```bash
# Re-run authentication setup
atl auth login

# Follow prompts to enter:
# 1. Jira Base URL: https://your-company.atlassian.net
# 2. Confluence URL: https://confluence.example.com
# 3. API Token: (generate new token if needed)
```

**Generate New API Token**:
1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name: "Atlassian CLI - [Your Name]"
4. Copy token immediately (shown only once)
5. Paste when prompted by `atl auth login`

**Check Current Auth**:
```bash
atl auth status
```

---

### ❌ "403 Forbidden" - Permission denied

**Problem**: API token is val id but lacks permissions for the requested resource.

**Symptoms**:
```
✗ Error fetching page: Request failed with status code 403
```

**Solution**:
1. **Verify page/issue access**: Can you view it in the browser?
2. **Check project permissions**: Admin may need to grant access
3. **Confirm API token scope**: Token must have read permissions

**Test Access**:
```bash
# Try fetching a public issue you know exists
atl j issue {PUBLIC_ISSUE_KEY}

# If this fails, re-generate API token with correct permissions
```

---

### ❌ Token expired or revoked

**Problem**: API token is no longer valid.

**Symptoms**:
- Previously working commands now fail with 401
- "Token expired" or "Token revoked" error message

**Solution**:
```bash
# Generate new token and re-authenticate
atl auth login

# Or manually update .env file
cd tools/atlassian-cli
# Edit .env: update JIRA_TOKEN value
```

**Prevention**: Set calendar reminder to renew tokens before expiry (typically 90-365 days).

---

## Command Failures

### ❌ "Issue not found" (404) for valid issue key

**Problem**: Issue exists but CLI can't find it.

**Possible Causes**:
1. Issue is in a different Jira instance
2. Issue was deleted or archived
3. Typo in issue key
4. Permission issue (403 may appear as 404)

**Solution**:
```bash
# Verify issue key format
# Valid: PROJ-123, DIGSTART-1258, OCA-456
# Invalid: ceaj-123 (lowercase), CEAJ123 (missing dash)

# Check issue in browser first
# https://your-jira.atlassian.net/browse/PROJ-123

# Verify correct Jira base URL in .env
cat .env | grep JIRA_BASE_URL
```

---

### ❌ "Page ID not found" (404) for Confluence

**Problem**: Page ID doesn't exist or is inaccessible.

**Solution**:
```bash
# Extract correct page ID from URL

# URL Format 1: ?pageId=123456
https://confluence.example.com/pages/viewpage.action?pageId=3309101741
# Page ID = 3309101741

# URL Format 2: /pages/123456/
https://confluence.example.com/spaces/CPBDST/pages/3309101741/OAuth2
# Page ID = 3309101741

# Fetch using extracted ID
atl c page 3309101741
```

**Verify Page Access**:
- Can you view the page in your browser?
- Is the page in a restricted space?
- Has the page been deleted or moved?

---

### ❌ "Network error" or timeout

**Problem**: Unable to reach Jira/Confluence servers.

**Symptoms**:
```
✗ Network error: connect ETIMEDOUT
✗ Request timeout after 30000ms
```

**Solution**:
```bash
# 1. Check internet connection
ping google.com

# 2. Verify Jira/Confluence URLs are accessible
curl https://your-jira.atlassian.net
curl https://confluence.example.com

# 3. Check firewall/VPN settings
# Corporate networks may block API access

# 4. Increase timeout (if slow network)
# Edit src/api/jira-client.js:
# timeout: 60000  # 60 seconds
```

**Behind Corporate VPN**: You may need to connect to VPN before running CLI commands.

---

### ❌ "Command not found" for atl sub-commands

**Problem**: Sub-command doesn't exist or has wrong syntax.

**Symptoms**:
```bash
atl confluence page 123456
# Error: unknown command 'confluence'
```

**Solution**:
```bash
# Use correct command format
atl c page 123456         # ✅ Correct (short alias)
atl confluence page 123456  # ❌ May not work if not registered

# Show all available commands
atl --help

# Show command-specific help
atl j --help
atl c --help
```

---

## Skill Issues

### ❌ Skills not appearing in GitHub Copilot

**Problem**: AI agent doesn't recognize Atlassian skills.

**Solution**:
```bash
# 1. Install skills to workspace
cd tools/atlassian-cli
npm run install-skills

# 2. Verify skills copied to .github/skills/
ls ../../.github/skills/
# Should show: jira-get, confluence-fetch, etc.

# 3. Restart VS Code to reload skills

# 4. Test skill invocation
# In Copilot chat: "Fetch PROJ-123"
```

**Check Skills Installation**:
```bash
# Skills should exist in workspace root
ls -la .github/skills/
cat .github/skills/README.md
```

---

### ❌ Skill invokes wrong command

**Problem**: Skill references outdated or incorrect CLI commands.

**Symptoms**:
- Skill tries `npm run atl:issue` (doesn't exist)
- Commands fail with "script not found"

**Solution**:
```bash
# Skills should use these commands:
atl j issue {KEY}        # Jira issue
atl c page {ID}          # Confluence page
atl j related {KEY}      # Related issues

# NOT these (workspace scripts don't exist):
npm run atl:issue        # ❌ Wrong
npm run atl:page         # ❌ Wrong
```

**Fix**: Update skill SKILL.md files to use correct commands (see PRE-LAUNCH-CHECKLIST.md).

---

### ❌ AI agent doesn't use cached data

**Problem**: Agent fetches fresh data every time, slowing down responses.

**Solution**:
Configure AI agent to check cache first:

```javascript
// Pseudo-code for AI behavior
const issueKey = extractIssueKey(userMessage);
const cachePath = `cache/jira/${projectKey}/${issueKey}/${issueKey}.json`;

// Check if cache exists and is recent (< 5 min old)
if (fs.existsSync(cachePath) && isCacheRecent(cachePath, 300)) {
  // Use cached JSON
  return fs.readFileSync(cachePath, 'utf-8');
} else {
  // Fetch fresh
  await run_in_terminal(`atl j issue ${issueKey}`);
  return fs.readFileSync(cachePath, 'utf-8');
}
```

---

## Cache Issues

### ❌ Cache not updating with recent changes

**Problem**: Fetched data is stale.

**Solution**:
```bash
# Force fresh fetch (bypass cache)
atl j issue PROJ-123 --fresh
atl c page 123456 --fresh

# Or clear entire cache and re-fetch
atl cache clear
atl j issue PROJ-123
```

**Check Cache Age**:
```bash
# View cache metadata
cat cache/jira/CEAJ/PROJ-123/.meta.json

# Shows lastFetch timestamp
```

---

### ❌ Cache directory growing too large

**Problem**: Cache uses too much disk space.

**Symptoms**:
```bash
du -sh docs/
# Output: 5.2G  <- Too large!
```

**Solution**:
```bash
# Clear old cache (keeps recent items)
atl cache clear --keep-recent 7  # Keep last 7 days

# Or clear everything
atl cache clear

# Or manually delete old cache directories
find cache/jira -type d -mtime +30 -exec rm -rf {} \;
```

**Monitor Cache Size**:
```bash
atl cache status
# Shows: total cached items, disk usage, oldest item
```

---

### ❌ Cannot write to cache directory

**Problem**: Permission denied when saving cache.

**Symptoms**:
```
✗ Error saving cache: EACCES: permission denied, open 'cache/jira/PROJ-123/'
```

**Solution**:
```bash
# Fix permissions on cache directory
chmod -R u+w cache/

# On Windows: check folder properties > Security tab
```

---

## Performance Issues

### ❌ Slow fetch times (> 10 seconds)

**Problem**: API requests taking too long.

**Possible Causes**:
1. Slow network connection
2. Large issues with many comments/attachments
3. Jira/Confluence server under heavy load
4. Rate limiting

**Solution**:
```bash
# 1. Use cache when possible (don't use --fresh unnecessarily)
atl j issue PROJ-123  # Uses 5-min cache by default

# 2. Fetch only what you need
atl j issue PROJ-123  # Just the issue
# Instead of:
atl j related PROJ-123  # Issue + all related (slower)

# 3. Check network speed
curl -w "@-" -o /dev/null -s https://your-jira.atlassian.net << EOF
   time_connect:  %{time_connect}s\n
   time_total:    %{time_total}s\n
EOF
```

---

### ❌ Rate limiting errors (429 Too Many Requests)

**Problem**: Exceeded Atlassian API rate limits.

**Symptoms**:
```
✗ Error: Request failed with status code 429
✗ Rate limit exceeded. Retry after 60 seconds.
```

**Solution**:
```bash
# 1. Wait for rate limit reset (check Retry-After header)
sleep 60  # Wait 60 seconds
atl j issue PROJ-123

# 2. Use cache to avoid unnecessary API calls
# (Cache is your friend!)

# 3. Implement exponential backoff
# CLI should automatically retry with backoff (check logs)
```

**Prevention**:
- Use `--fresh` sparingly
- Fetch multiple issues in batch (planned feature)
- Cache aggressively during development

---

## Advanced Debugging

### Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=atl:*

# Run command with verbose output
atl j issue PROJ-123

# Check logs in:
# - Console output
# - ~/.atlassian-cli/logs/ (if logging enabled)
```

### Inspect Raw API Responses

```bash
# Fetch issue and inspect JSON
atl j issue PROJ-123
cat cache/jira/CEAJ/PROJ-123/PROJ-123.json | jq .

# Inspect specific fields
cat cache/jira/CEAJ/PROJ-123/PROJ-123.json | jq '.fields.status'
```

### Test API Connection Directly

```bash
# Test Jira API
curl -u "your-email@example.com:YOUR_API_TOKEN" \
  "https://your-jira.atlassian.net/rest/api/2/issue/PROJ-123"

# Test Confluence API
curl -u "your-email@example.com:YOUR_API_TOKEN" \
  "https://confluence.example.com/rest/api/content/123456?expand=body.storage"
```

### Check Environment Variables

```bash
# Show all environment variables
cat tools/atlassian-cli/.env

# Verify critical values are set
grep -E "(JIRA_BASE_URL|CONFLUENCE_URL|JIRA_TOKEN|JIRA_EMAIL)" tools/atlassian-cli/.env
```

---

## Getting Help

### Still stuck?

1. **Check documentation**:
   - [README.md](README.md)
   - [SETUP-ATL-CLI.md](SETUP-ATL-CLI.md)
   - [COMMAND-REFERENCE.md](docs/COMMAND-REFERENCE.md)

2. **Search GitHub issues**:
   - https://github.com/yourorg/atlassian-cli/issues

3. **Ask for help**:
   - Slack: #atlassian-cli
   - Email: easyapply-team@example.com

4. **Report a bug**:
   - Include CLI version: `atl --version`
   - Include error message (full stack trace)
   - Include steps to reproduce
   - Attach logs (remove sensitive data)

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026  
**Contributers**: EasyApply AI Team
