# Atlassian CLI - Setup Guide

> Complete setup and configuration instructions for AI agents and users

## 🤖 AI Agent Installation Guide

**For AI agents**: When a user asks you to "install the Atlassian CLI" or "setup Jira integration", follow these steps:

> **🔐 IMPORTANT - Workspace-Level Configuration**:
> - **Prerequisites**: Workspace .env must be configured first
> - See **[SETUP-WORKSPACE.md](../../SETUP-WORKSPACE.md)** for complete workspace setup
> - The CLI reads configuration from workspace root `.env` file
> - **DO NOT** create local .env files in CLI directories
> 
> **TD Bank Configuration**:
> - **Jira URL**: `https://jira.example.com` (configured in workspace .env)
> - **Confluence URL**: `https://confluence.example.com` (configured in workspace .env)
> - **Tokens**: Set in workspace .env (ATLASSIAN_TOKEN, JIRA_TOKEN)

---

## Prerequisites

Before installing the Atlassian CLI, ensure:

- [ ] **Workspace .env configured** - See [SETUP-WORKSPACE.md](../../SETUP-WORKSPACE.md)
  - Contains `ATLASSIAN_URL` and `JIRA_URL`
  - Contains `ATLASSIAN_TOKEN` and `JIRA_TOKEN`
- [ ] **Node.js 14+** installed
- [ ] **npm** available

**Quick check**:
```bash
# Check Node.js and npm
node --version  # Should be v14+ or higher
npm --version

# Verify workspace .env exists (from workspace root)
ls -la .env
```

**From the tool directory** (where you already are):

```bash
# Install npm dependencies
npm install

# Link CLI globally (makes 'atl' command available everywhere)
npm link
```

**What `npm link` does**:
- Creates a global symlink to the `atl` command
- Allows you to run `atl` from any directory in your workspace
- Example: `atl j issue DIGSTART-1258` works from anywhere

**Verify global installation**:
```bash
# Test that 'atl' command is available
which atl  # Should show path to global npm bin
atl --version  # Should show version number
```

**Expected output**:
```
added X packages, and audited Y packages in Zs

X packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**If errors occur**:
- Check Node.js version: `node --version` (requires >=14.0.0)
- Check npm version: `npm --version`
- Try clearing cache: `npm cache clean --force`
- Retry: `npm install`

---

## Step 6: Verify Installation

Test that everything is configured correctly.

### Test Authentication

**From any directory** (after npm link):
```bash
atl auth status
```

**Expected successful output**:
```
🔐 Authentication Status

Confluence:
  ✓ Authenticated
  URL: https://confluence.example.com
  Token: ********************ab (last 2 chars shown)
  Source: workspace .env file

Jira:
  ✓ Authenticated
  URL: https://jira.example.com
  Token: ********************xy (last 2 chars shown)
  Source: workspace .env file

✅ All services authenticated successfully
```

**If authentication fails**:
- ✗ URL not configured → Check workspace .env file has ATLASSIAN_URL and JIRA_URL
- ✗ Token not configured → Check workspace .env file has ATLASSIAN_TOKEN and JIRA_TOKEN
- ✗ Authentication failed (401) → Token is invalid or expired, regenerate tokens
- ✗ Connection error → Check network connectivity and URLs

---

### Test Basic Fetch

**Important**: Different Jira **projects** have different custom field configurations. The field mapping system is **PROJECT-based** (e.g., DIGSTART, CEAJ, OCA), extracted from the issue key.

**How Field Mapping Works**:
- Each Jira project can have different custom field IDs for the same logical field
- Example: "Acceptance Criteria" might be `customfield_14400` in CEAJ but `customfield_15500` in OCA
- Field mappings are organized in `src/field-mappings/` directory:
  ```
  src/field-mappings/
  ├── DIGSTART/
  │   ├── fields.json          # DIGSTART project-specific (169 fields)
  │   └── fields.json.meta     # Metadata (generation date, source)
  ├── CEAJ/
  │   ├── fields.json          # CEAJ project-specific (164 fields)
  │   └── fields.json.meta     # Metadata
  └── {NEW-PROJECT}/
      ├── fields.json          # Auto-generated on first fetch
      └── fields.json.meta     # Metadata
  ```
- **Auto-Generation**: When you fetch an issue from a new project, the CLI automatically creates a field mapping for that project
- The CLI loads the correct mapping based on the project key extracted from the issue key

**Note**: While Jira boards can filter issues from multiple projects, the custom fields are defined at the **project level**, not board level.

**Ask the user**:
> Please provide a Jira ticket key from your project to test the integration.
> 
> For example: PROJ-123, PROJ-123, etc.
> 
> **Tip**: Choose a ticket that represents the type of work you'll be tracking (Story, Epic, Bug, etc.) as it will help generate the correct field mappings.

**Wait for user to provide a ticket key.**

**Once user provides ticket (e.g., PROJ-123)**:

1. **Fetch the test ticket** (from any directory after npm link):
   ```bash
   atl j issue PROJ-123
   ```

   **✨ Auto-Magic**: The CLI will automatically detect this is the CEAJ project and:
   - Check if `src/field-mappings/CEAJ/` exists
   - If not, auto-generate a field mapping from the fetched issue
   - Save it to `src/field-mappings/CEAJ/fields.json`
   - Use it to convert custom field IDs to readable names in the markdown

2. **Expected output**:
   ```
   🔍 Fetching Jira issue: PROJ-123
   
   ✓ Fetched PROJ-123
     Summary: [Issue Summary]
     Status: [Status]
     Type: Story
     Project: CEAJ (EasyApply)
     
   � Saved JSON: cache/jira/CEAJ/PROJ-123/PROJ-123.json
   
   ✅ Issue fetched successfully
   ```

3. **Review the fetched ticket**:
   ```bash
   # View raw JSON (all fields, full API response)
   cat cache/jira/CEAJ/PROJ-123/PROJ-123.json
   
   # View cache metadata
   cat cache/jira/CEAJ/PROJ-123/.meta.json
   ```

4. **Generate project-specific field mapping**:
   
   **Tell the user**:
   > I'll now generate custom field mappings specific to your project. This helps ensure all important fields are captured in the markdown output.
   
   ```bash
   # Generate field mapping for this project
   npm run generate-mapping
   ```
   
   **This creates**:
   - `src/utils/field-mapping.json` - Maps custom field IDs to readable names
   - Identifies important fields like: Acceptance Criteria, Feature Statement, Story Points, etc.

5. **Verify field mapping**:
   ```bash
   cat src/utils/field-mapping.json
   ```
   
   **Expected output**:
   ```json
   {
     "customfield_10008": "Epic Link",
     "customfield_14400": "Acceptance Criteria",
     "customfield_26903": "Feature Owner",
     "customfield_26904": "Feature Size",
     "customfield_26905": "Feature Statement"
   }
   ```

6. **Re-fetch ticket with new mappings**:
   ```bash
   # Fetch again with fresh data (bypasses cache)
   atl j issue PROJ-123 --fresh
   ```
   
   **Now the markdown should have readable field names** instead of `customfield_XXXXX`.

**🎯 Multi-Project Setup (Recommended)**:

If you work with **multiple Jira projects** (e.g., DIGSTART, CEAJ, OCA) with different custom fields:

1. **During setup, identify your projects**:
   > Do you work with multiple Jira projects with different custom fields?
   > If yes, please provide one sample ticket from each project:
   > - Project 1: DIGSTART-1258 (DIGSTART project)
   > - Project 2: PROJ-123 (CEAJ project)
   > - Project 3: OCA-1234 (OCA project)
   > - Additional projects as needed

2. **Generate mappings for each project** (from any directory after npm link):
   ```bash
   # Fetch sample ticket from each project
   atl j issue DIGSTART-1258
   atl j issue PROJ-123
   atl j issue OCA-1234
   
   # Field mappings are auto-generated during fetch
   # Verify they were created:
   ls -la tools/atlassian-cli/src/field-mappings/
   ```

3. **Verify mappings created**:
   ```bash
   # List all field mapping directories
   ls -la src/field-mappings/
   
   # Should show project directories:
   # DIGSTART/
   # CEAJ/
   # OCA/
   
   # View a specific project's files
   ls -la src/field-mappings/DIGSTART/
   # Should show:
   # fields.json       - Field mappings
   # fields.json.meta  - Generation metadata
   ```

4. **How the CLI uses mappings**:
   - When you fetch `DIGSTART-1258`, the CLI loads `field-mappings/DIGSTART/fields.json`
   - When you fetch `PROJ-123`, the CLI loads `field-mappings/CEAJ/fields.json`
   - **New project**: If no mapping exists, it's auto-generated during fetch
   - If generation fails, it falls back to `field-mappings/default/fields.json`
   - The project key is automatically extracted from the issue key (before the hyphen)

5. **Customizing field mappings**:
   ```bash
   # Edit the auto-generated mapping
   nano src/field-mappings/CEAJ/fields.json
   
   # Example: Rename fields for better clarity
   {
     "customfield_26903": "Feature Owner",
     "customfield_26905": "Feature Statement",
     "customfield_14400": "Acceptance Criteria"
   }
   
   # Re-fetch to see changes
   atl j issue PROJ-123 --fresh
   ```

**See [Multi-Project Configuration](#multi-project-configuration)** section below for detailed setup.

---

## ✅ Setup Complete!

The Atlassian CLI is now installed and configured. 

**Next Steps**:

1. **Skills are already available in the workspace repository**
   - Skills are located at `../.github/skills/`
   - No manual skill installation or symlink step is required
   - If needed, verify the directory exists after cloning the workspace

2. **Start using the CLI** - See [docs/USAGE.md](docs/USAGE.md) for command reference

3. **Configure multi-project support** - See multi-project section below if needed

---

## Available Commands

**Once setup is verified**, you can use:

> ✅ **Setup Complete!**
> 
> The Atlassian CLI is now configured and globally available. Here are some commands to get started:
>
> **From anywhere in your workspace** (using global `atl` command):
> ```bash
> # Fetch a single Jira issue
> atl j issue DIGSTART-1258
> atl j issue PROJ-123
> 
> # Fetch with related items (subtasks, links)
> atl j related DIGSTART-1258
> 
> # Check cache status
> atl cache status
> 
> # Clear cache for a specific issue
> atl cache clear jira DIGSTART-1258
> 
> # Get help
> atl --help
> atl j --help
> ```
>
> **Using the atl CLI (recommended after npm link):**
> ```bash
> # Fetch Jira issues
> atl j issue DIGSTART-1258
> 
> # Fetch Confluence pages
> atl c page 123456
> ```
>
> **📚 Documentation:**
> - [docs/USAGE.md](docs/USAGE.md) - Complete usage guide
> - [docs/COMMAND-REFERENCE.md](docs/COMMAND-REFERENCE.md) - All commands and options
> - [docs/OUTPUT-FORMAT.md](docs/OUTPUT-FORMAT.md) - JSON cache format reference

---

## Common Issues & Troubleshooting

### Issue: "No .env file found"

**Symptoms**:
```
⚠️  No .env file found. Please run setup or create .env file.
```

**Solution**:
1. Ensure .env exists in the tool directory: `ls -la .env`
2. If missing, copy from template: `cp .env.example .env`
3. Fill in your credentials (see Step 4)

**Debug**:
```bash
# From atlassian-cli directory
node -e "console.log(require('./src/utils/env-loader').loadEnv())"
```

### Issue: "Authentication failed"

**Symptoms**:
```
❌ Authentication failed (401 Unauthorized)
```

**Solutions**:
1. **Verify PAT token is correct**:
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Check if token still exists
   - If expired, create a new one
   
2. **Check URLs are correct**:
   - CONFLUENCE_URL should match your org's Confluence URL
   - JIRA_URL should match your org's Jira URL
   - Include https:// protocol
   - No trailing slash

3. **Run diagnostics**:
   ```bash
   npm run atl auth status
   ```

4. **Test token manually**:
   ```bash
   # Test Confluence
   curl -u "email@example.com:YOUR_PAT_TOKEN" \
     "https://your-org.atlassian.net/wiki/rest/api/content"
   
   # Test Jira
   curl -u "email@example.com:YOUR_PAT_TOKEN" \
     "https://your-org.atlassian.net/rest/api/2/myself"
   ```

### Issue: "Command not found: atl"

**Symptoms**:
```bash
atl j issue DIGSTART-1258
# bash: atl: command not found
```

**Solutions**:

**Option 1: Run npm link** (recommended):
```bash
cd easyapply-ai-skill/tools/atlassian-cli  # or your tool path
npm link
# Now 'atl' is available globally
atl j issue DIGSTART-1258
```

**Option 2: Use direct node calls from workspace** (if npm link not available):
```bash
node tools/atlassian-cli/bin/atl.js j issue DIGSTART-1258
```

**Verify npm link worked**:
```bash
which atl  # Should show path to npm global bin
atl --version  # Should show version number
```

### Issue: "Module not found"

**Symptoms**:
```
Error: Cannot find module 'axios'
```

**Solution**:
```bash
cd tools/atlassian-cli
npm install
```

### Issue: "Permission denied"

**Symptoms**:
```
bash: ./bin/atl.js: Permission denied
```

**Solution**:
```bash
cd tools/atlassian-cli
chmod +x bin/atl.js
chmod +x src/standalone/*.js
```

---

## Understanding Field Mapping for Multiple Projects

### How Field Mapping Works

Jira custom fields are defined at the **PROJECT level**, not the board level. This means:

**The Challenge**:
- Different projects can have different custom field IDs for the same logical field
- Example: "Acceptance Criteria" could be:
  - `customfield_14400` in the DIGSTART project
  - `customfield_15500` in the CEAJ project  
  - `customfield_16600` in the OCA project
- Boards can show issues from multiple projects, but fields are still project-specific

**The Solution**:
The CLI automatically uses **project-specific field mappings** based on the issue key:

```
Issue Key          → Project Key → Field Mapping File
--------------        -----------   ------------------------------------------
DIGSTART-1258     →  DIGSTART   →  field-mappings/DIGSTART/fields.json
PROJ-123         →  CEAJ       →  field-mappings/CEAJ/fields.json
OCA-1234          →  OCA        →  field-mappings/OCA/fields.json (auto-gen)
NEWPROJ-999       →  NEWPROJ    →  field-mappings/NEWPROJ/fields.json (auto-gen)
```

**Where mappings are stored**:
```
src/field-mappings/
├── DIGSTART/
│   ├── fields.json              # DIGSTART-specific mappings (169 fields)
│   └── fields.json.meta         # Metadata (generation date, source, etc.)
├── CEAJ/
│   ├── fields.json              # CEAJ-specific mappings (164 fields)
│   └── fields.json.meta         # Metadata
└── {NEW-PROJECT}/
    ├── fields.json              # Auto-generated on first fetch
    └── fields.json.meta         # Metadata
```

**Example mapping file** (`field-mappings/DIGSTART/fields.json`):
```json
{
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner",
  "customfield_26904": "Feature Size",
  "customfield_26905": "Feature Statement",
  "customfield_10008": "Epic Link",
  "customfield_10002": "Story Points"
}
```

**When you fetch an issue**:
1. CLI extracts project key: `DIGSTART-1258` → `DIGSTART`
2. Checks if `field-mappings/DIGSTART/fields.json` exists:
   - **Yes**: Loads the existing mapping
   - **No**: Auto-generates mapping from the issue, saves to `field-mappings/DIGSTART/fields.json`
3. Uses mapping to convert field IDs to readable names in markdown output
4. Creates `fields.json.meta` with generation metadata

**🎯 Auto-Generation Feature**:
- No manual setup required for new projects
- First fetch automatically creates the mapping
- Metadata tracks when and how it was generated
- You can customize the generated mapping afterwards
- Tip displayed after generation showing where to customize

---

## Advanced Configuration

### Multiple Atlassian Instances

If you need to connect to multiple Atlassian instances, you can:

**Option 1: Use separate .env files**:
```bash
# .env.prod
CONFLUENCE_URL=https://prod.atlassian.net
CONFLUENCE_PAT=token1

# .env.dev
CONFLUENCE_URL=https://dev.atlassian.net
CONFLUENCE_PAT=token2
```

Load with: `ENV_FILE=.env.prod atl j issue PROJ-123`

**Option 2: Create separate tool instances**:
```
tools/
├── atlassian-cli-prod/
└── atlassian-cli-dev/
```

### Multi-Project Configuration

**Problem**: Different Jira projects/boards often have different custom fields, which means:
- A "Story Points" field in one project might be `customfield_10005`
- The same field in another project might be `customfield_20032`
- Project A might have "Acceptance Criteria" but Project B doesn't
- Each project needs its own field mapping and markdown template

**Solution**: Project-specific field mappings and templates.

#### Setup for Multiple Projects

**1. Ask user about their projects**:

> Do you work with multiple Jira projects that have different custom fields?
> 
> Examples: CEAJ (EasyApply), OCA (Order Composition), PROJ (Generic Project)
> 
> If yes, please provide one sample ticket from each project:

**2. For each project, fetch sample tickets**:

```bash
# Example: User provides PROJ-123, OCA-1234, PROJ-567

# Fetch samples from each project (field mappings auto-generated)
atl j issue PROJ-123
atl j issue OCA-1234
atl j issue PROJ-567

# Verify mappings were created
ls -la tools/atlassian-cli/src/field-mappings/
```

**3. This creates project-specific mappings**:
```
src/field-mappings/
├── CEAJ/
│   ├── fields.json         # CEAJ project mappings
│   └── fields.json.meta    # Metadata
├── OCA/
│   ├── fields.json         # OCA project mappings
│   └── fields.json.meta    # Metadata
└── PROJ/
    ├── fields.json         # PROJ project mappings
    └── fields.json.meta    # Metadata
```

**4. Create project-specific markdown templates** (optional):
```
src/templates/
├── markdown-template.md            # Default template
├── markdown-template-CEAJ.md       # CEAJ specific
├── markdown-template-OCA.md        # OCA specific
└── markdown-template-PROJ.md       # PROJ specific
```

#### How It Works

When fetching an issue:

1. **Extract project key** from issue (e.g., `PROJ-123` → `CEAJ`)
2. **Load project-specific field mapping**: `field-mapping-CEAJ.json`
3. **Apply mapping** to convert `customfield_XXXXX` to readable names
4. **Use project-specific template** (if exists) for markdown output
5. **Fallback to default** if no project-specific config found

#### Example Field Mapping - CEAJ Project

`src/utils/field-mapping-CEAJ.json`:
```json
{
  "customfield_10008": "Epic Link",
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner",
  "customfield_26904": "Feature Size",
  "customfield_26905": "Feature Statement",
  "customfield_27001": "Business Value",
  "customfield_27002": "Risk Assessment"
}
```

#### Example Field Mapping - OCA Project

`src/utils/field-mapping-OCA.json`:
```json
{
  "customfield_10008": "Epic Link",
  "customfield_15500": "Acceptance Criteria",
  "customfield_28001": "Product Owner",
  "customfield_28002": "Story Points",
  "customfield_28003": "Technical Spec Link",
  "customfield_28004": "Dependencies"
}
```

**Notice**: Both projects have "Acceptance Criteria" but different field IDs!

#### Markdown Template Customization

**Default template** includes standard fields:
- Summary, Description, Status, Type, Priority
- Assignee, Reporter, Created, Updated
- Comments, Attachments, Links

**Project-specific template** can include custom sections:

`src/templates/markdown-template-CEAJ.md`:
```markdown
# {ISSUE_KEY}: {SUMMARY}

**Type**: {TYPE}
**Status**: {STATUS}
**Priority**: {PRIORITY}

## Feature Statement
{FEATURE_STATEMENT}

## Business Value
{BUSINESS_VALUE}

## Acceptance Criteria
{ACCEPTANCE_CRITERIA}

## Risk Assessment
{RISK_ASSESSMENT}

## Description
{DESCRIPTION}

[... rest of template ...]
```

`src/templates/markdown-template-OCA.md`:
```markdown
# {ISSUE_KEY}: {SUMMARY}

**Type**: {TYPE}
**Status**: {STATUS}
**Story Points**: {STORY_POINTS}

## Technical Specification
{TECHNICAL_SPEC_LINK}

## Acceptance Criteria
{ACCEPTANCE_CRITERIA}

## Dependencies
{DEPENDENCIES}

## Description
{DESCRIPTION}

[... rest of template ...]
```

#### Detecting New Projects

When fetching from a **new project** for the first time:

```bash
# Fetch ticket from new project
atl j issue NEWPROJ-100

# Field mapping is auto-generated on first fetch
✓ Fetched NEWPROJ-100
💡 Auto-generated field mapping for project: NEWPROJ
   Location: src/field-mappings/NEWPROJ/fields.json
   
✅ Issue fetched successfully
```

**Agent should then**:
1. Inform user about new project detected and mapping generated
2. Suggest reviewing the mapping if custom fields seem incorrect
3. User can customize fields in `src/field-mappings/NEWPROJ/fields.json`
4. Re-fetch with `atl j issue NEWPROJ-100 --fresh` to apply changes

#### Maintenance

**Update mappings when project config changes**:

```bash
# Project added new custom fields
# Fetch a recent ticket to see new fields
atl j issue CEAJ-9999 --fresh

# View the generated mapping
cat tools/atlassian-cli/src/field-mappings/CEAJ/fields.json

# If new fields detected, they're automatically included
# Review and customize as needed
```
```

**Best practices**:
- Keep one "canonical" ticket per project for field mapping
- Document which ticket was used to generate each mapping
- Regenerate mappings quarterly or when project config changes
- Test with different issue types (Story, Bug, Epic) to capture all fields

### Custom Cache Location

By default, cache is stored in `atl/` at workspace root. To customize:

```bash
# Set in .env
CACHE_DIR=/custom/path/to/cache
```

### Proxy Configuration

If behind a corporate proxy:

```bash
# Add to .env
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

---

## Uninstallation

To remove the Atlassian CLI:

1. **Remove dependencies**:
   ```bash
   cd tools/atlassian-cli
   rm -rf node_modules
   ```

2. **Remove configuration** (optional):
   ```bash
   # Remove PAT tokens from .env (or delete entire .env)
   nano .env  # Remove CONFLUENCE_PAT and JIRA_PAT lines
   ```

3. **Remove cached data** (optional):
   ```bash
   # From workspace root
   rm -rf atl/
   ```

4. **Remove tool directory** (if no longer needed):
   ```bash
   # From workspace root
   rm -rf tools/atlassian-cli
   ```

---

**Next Steps**: See [docs/USAGE.md](docs/USAGE.md) for complete usage instructions.
