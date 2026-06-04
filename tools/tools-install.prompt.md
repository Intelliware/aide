# Tools Installation and Setup — Agent Workflow

This is an **agent-driven workflow** to install and configure the workspace CLI tools (Atlassian, SharePoint). Follow this step-by-step to guide the user through setup, token acquisition, and testing.

---

## 🎯 Objective

Install and configure the CLI tools, obtain necessary API tokens, test each tool, and verify the setup is working correctly.

---

## 📋 Pre-Flight Check

Before starting:

1. **Confirm workspace location**: Verify you're in the workspace root directory
2. **Check Node.js version**: Ensure Node.js >= 18.0.0 is installed
3. **Verify npm**: Ensure npm >= 9.0.0 is installed
4. **Detect scripting runtime**: Check which runtime is available for JSON parsing

```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
```

**Detect available scripting runtime**:
```bash
# Check Python availability
python --version 2>/dev/null || python3 --version 2>/dev/null

# Check Node.js availability (already verified above)
node --version
```

**Determine SCRIPT_RUNTIME value**:
- If Python 3.x is available → Use `SCRIPT_RUNTIME=python3` or `SCRIPT_RUNTIME=python`
- If only Node.js is available → Use `SCRIPT_RUNTIME=node`
- **Recommended**: Use Node.js since it's required anyway (`SCRIPT_RUNTIME=node`)

**Note the result** — you'll add this to `.env` in Step 2.

---

## Step 1: Install Dependencies

Navigate to the tools directory and install all packages:

```bash
cd tools
npm install
```

**Expected outcome**: 
- Installation completes without errors
- `node_modules/` directory created
- All CLIs (atlassian-cli, sharepoint-cli) are installed

**Verification**:
```bash
npm run atl -- --version
npm run spt -- --version
```

All CLIs should display their version numbers.

---

## Step 2: Atlassian CLI Setup

# Scripting Runtime (from Pre-Flight Check)
SCRIPT_RUNTIME=node  # or python3 if available and preferred

# Atlassian Configuration
JIRA_URL=https://your-jira.atlassian.net
JIRA_TOKEN=<paste token from step 2.1>
CONFLUENCE_URL=https://your-confluence.atlassian.net
CONFLUENCE_TOKEN=<paste token from step 2.1>
```

**Important**: 
- Set `SCRIPT_RUNTIME` to match your environment (detected in Pre-Flight Check)
- Use the same token for both Jira and Confluence
- Skills will use this runtime for JSON parsing and data conversion
4. Copy the generated token (it looks like `ATATT3xFfGF0...`)

**Important**: The token is only shown once. If lost, create a new one.

### 2.2 Configure Authentication

**Recommended: Environment file**

Add to `.env` file in workspace root:
```bash
JIRA_URL=https://your-jira.atlassian.net
JIRA_TOKEN=<paste token from step 2.1>
CONFLUENCE_URL=https://your-confluence.atlassian.net
CONFLUENCE_TOKEN=<paste token from step 2.1>
```

Note: Use the same token for both Jira and Confluence.

**Alternative: Interactive setup**

If preferred, run:
```bash
npm run atl -- auth login
```

### 2.3 Test Atlassian CLI

**Verify authentication**:
```bash
npm run atl -- auth status
```

Should show: `✓ Authenticated as <email>`

**Test Jira fetch** (use a real issue key the user has access to):
```bash
npm run atl -- jira <ISSUE-KEY>
```

Example: `npm run atl -- jira ABC-123`

**Expected outcome**: 
- Issue details displayed in markdown format
- Cached JSON saved to `cache/jira/<ISSUE-KEY>.json`

**Test Confluence fetch** (use a real page ID the user has access to):
```bash
npm run atl -- confluence page <PAGE-ID>
```

**Expected outcome**:
- Page content displayed in markdown format
- Cached JSON saved to `cache/confluence/<PAGE-ID>.json`

---

## Step 3: SharePoint CLI Setup

SharePoint supports two platforms:
1. **On-Premises SharePoint** (internal network) — uses Windows domain credentials (NTLM)
2. **Microsoft 365 SharePoint** (*.sharepoint.com) — uses OAuth bearer token

### 4.1 Identify Which Platform User Needs

Ask the user: **"Which SharePoint platform will you be using?"**

- On-Premises SharePoint (internal network)
- Microsoft 365 SharePoint (*.sharepoint.com)
- Both

### 4.2 Setup for On-Premises SharePoint

**On Windows**: Uses integrated authentication automatically (no config needed)

**On macOS/Linux**: Would require manual credentials (not typically used)

**Note**: Windows domain authentication is handled automatically via NTLM.

### 4.3 Setup for Microsoft 365 SharePoint

**Guide user to obtain OAuth token**:

This is more complex. User needs:
1. Azure AD app registration with SharePoint permissions
2. OAuth2 flow to get bearer token
3. Token looks like: `eyJ0eXAiOiJKV1QiLCJh...`

**Guide user to add to `.env` file**:
```bash
SHAREPOINT_M365_TOKEN=eyJ0eXAiOiJKV1QiLCJh...your-bearer-token
```

**Note**: Most users on corporate networks will use On-Premises SharePoint. M365 setup is advanced.

### 4.4 Test SharePoint CLI

**Check status**:
```bash
npm run spt -- status
```

Should show configuration and available credentials.

**Test platform detection** (ask user for a SharePoint URL):
```bash
npm run spt -- platform "<SHAREPOINT-URL>"
```

Example: `npm run spt -- platform "https://sharepoint.example.com/site"`

**Expected outcome**:
- Platform identified (On-Premises or M365)
- Authentication method shown

**Test file list** (if user has access to a SharePoint site):
```bash
npm run spt -- list --site "<SHAREPOINT-URL>" --folder "/Documents"
```

**Expected outcome**:
- List of files in the specified folder
- File names, sizes, and modified dates displayed

---

## Step 5: Verify Complete Setup

Run a comprehensive verification:

```bash
# Check all CLI versions
npm run atl -- --version
npm run spt -- --version

# Check all authentication statuses
npm run atl -- auth status
npm run spt -- status

# Show available commands
npm run atl -- --help
npm run spt -- --help
```

**Expected outcome**: All checks pass, all CLIs show authenticated status.

---

## Step 6: Optional - Global CLI Installation

Ask user: **"Would you like to install the CLIs globally for easier access?"**

**Note**: This requires permissions and may fail on restricted machines. npm scripts method always works.

If yes:
```bash
npm run link-all
```

**Verification**:
```bash
atl --version
spt --version
```

If this fails, user should continue using npm scripts (`npm run atl -- ...`).

---

## 🎓 Next Steps

Inform the user:

1. ✅ All tools are installed and configured
2. ✅ Authentication is set up for each service
3. ✅ Basic tests passed

**Usage reminder**:
- Run from `tools/` directory: `npm run atl -- <command>`
- Or use global CLI (if linked): `atl <command>`
- Detailed docs: See `README.md` and each package's `README.md`

**Cache location**: `cache/` directory in workspace root
**Logs location**: `_logs_/` directory (only if `API_LOGGING=true` in `.env`)

---

## 🔧 Troubleshooting

### Authentication Failures

**Atlassian**:
- Verify JIRA_URL and CONFLUENCE_URL are correct
- Regenerate API token if needed
- Check `.env` file for typos (use JIRA_TOKEN and CONFLUENCE_TOKEN)

**SharePoint**:
- On Windows: Integrated auth should work automatically
- For M365, verify bearer token is not expired

### Module Not Found Errors

```bash
cd tools
rm -rf node_modules packages/*/node_modules
npm install
```

### Permission Errors on Global Install

Use npm scripts instead:
```bash
npm run atl -- <command>
npm run spt -- <command>
```

No admin rights required for this method.

---

## 📊 Success Criteria

✅ All dependencies installed successfully  
✅ All CLIs show version numbers  
✅ Atlassian CLI authenticated and tested with real issue  
✅ SharePoint CLI configured (if needed by user)  
✅ User understands how to run commands (npm scripts or global)  
✅ User knows where to find documentation (README.md)  

---

## 🎯 Agent Workflow Complete

Once all criteria are met, inform the user:

> **Setup complete!** All CLI tools are installed and configured. You can now:
> - Fetch Jira issues: `npm run atl -- jira <key>`
> - Fetch Confluence pages: `npm run atl -- confluence page <id>`
> - Manage SharePoint files: `npm run spt -- <command>`
>
> See `README.md` for detailed command reference.

---

**Installation workflow complete.** ✅
