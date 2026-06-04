# Standalone Scripts

> **Note**: These standalone scripts are now **secondary** to the `atl` CLI. They serve as npm script targets and fallback methods when the CLI wrapper is unavailable.

Standalone scripts are thin wrappers around the core functionality in `src/core/`. They provide:
- **npm script targets** for convenience (`npm run issue`)
- **Fallback method** when `atl` CLI not globally installed
- **Programmatic usage** by importing core modules directly

## Recommended Usage Priority

### 1. ⭐ Primary: Use `atl` CLI (after `npm link`)

```bash
# Recommended - works from any directory
atl j issue CEAJ-3843
atl c page 2315130362
atl j issue DIGSTART-1258 --fresh
```

### 2. ✅ Secondary: Use npm scripts (convenience)

```bash
# From atlassian-cli directory
npm run issue CEAJ-3843
npm run related CEAJ-3843
npm run create CEAJ
npm run status CEAJ-3843 -- --status "In Progress"
npm run generate-mapping

# Useful when:
# - Quick shorthand preferred
# - Working inside tool directory
# - npm link not available
```

### 3. 🔧 Tertiary: Direct invocation (fallback)

```bash
# From workspace root - when atl CLI unavailable
node tools/atlassian-cli/src/standalone/fetch-jira-issue.js CEAJ-3843

# From atlassian-cli directory
node src/standalone/fetch-jira-issue.js CEAJ-3843

# Useful when:
# - npm link failed or not run
# - Scripting/automation scenarios
# - Testing/debugging the tool itself
```

## Available Scripts

> All scripts below can be invoked via npm scripts or directly. **Prefer using `atl` CLI commands** when available.

### fetch-jira-issue.js
Fetch a single Jira issue and cache as JSON for agent analysis.

**Recommended:** `atl j issue <ISSUE-KEY> [--fresh]`  
**npm script:** `npm run issue <ISSUE-KEY> [--fresh]`  
**Direct:** `node src/standalone/fetch-jira-issue.js <ISSUE-KEY> [--fresh]`

**Options:**
- `--fresh` - Force fetch from API, ignore cache

**Output:** `cache/jira/{projectKey}/{ISSUE_KEY}/{ISSUE_KEY}.json` + `.meta.json`  
Agent-generated analysis saved to `{ISSUE_KEY}.analysis.md` when populated.

---

### fetch-related.js
Fetch all related Jira issues and Confluence pages referenced in a parent issue.

**Recommended:** `atl j related <ISSUE-KEY> [options]`  
**npm script:** `npm run related <ISSUE-KEY> [options]`  
**Direct:** `node src/standalone/fetch-related.js <ISSUE-KEY> [options]`

**Options:**
- `--subtasks-only` - Fetch only direct subtasks
- `--quiet` - Suppress cached issues list

---

### create-jira-issue.js
Create a Jira issue using the same write flow as `atl j create`.

**Recommended:** `atl j create <PROJECT-KEY>`  
**npm script:** `npm run create <PROJECT-KEY>`  
**Direct:** `node src/standalone/create-jira-issue.js <PROJECT-KEY>`

---

### update-jira-status.js
Transition a Jira issue using the same status-update flow as `atl j transition` / `atl j status`.

**Recommended:** `atl j transition <ISSUE-KEY> --status "In Progress"`  
**npm script:** `npm run status <ISSUE-KEY> -- --status "In Progress"`  
**Direct:** `node src/standalone/update-jira-status.js <ISSUE-KEY> --status "In Progress"`

---

### generate-field-mapping.js
Generate or regenerate field mappings for Jira projects.

> **Note**: Field mappings are now **auto-generated** on first fetch. This script is primarily for regenerating or customizing existing mappings.

**Usage:** 
- `npm run generate-mapping RMBJTDBC-18001` - Regenerate the current project mapping from a real issue
- `npm run generate-mapping ABC-123` - Generate a mapping for another Jira project when needed

**What it creates**:
```
src/field-mappings/
└── RMBJTDBC/
    ├── fields.json         # Field ID to name mappings
    └── fields.json.meta    # Generation metadata when regenerated
```

**When to use**:
- **Customizing mappings**: After auto-generation, edit and improve field names
- **Updating mappings**: When project adds/changes custom fields
- **Troubleshooting**: If auto-generation failed or produced incorrect mappings

**Multi-Project Support**:
- Different projects can have different custom field IDs
- Each project gets its own directory in `src/field-mappings/` when generated
- The checked-in mapping currently covers `RMBJTDBC`

**Example**:
```bash
# Field mapping can be generated from a real issue
atl j issue RMBJTDBC-18001
# → Uses or regenerates src/field-mappings/RMBJTDBC/fields.json

# To regenerate or customize:
npm run generate-mapping RMBJTDBC-18001
# → Overwrites src/field-mappings/RMBJTDBC/fields.json

# Then re-fetch to see changes
atl j issue RMBJTDBC-18001 --fresh
```

## Architecture

These scripts are **thin wrappers** (~30-50 lines each) that:
1. Parse command-line arguments
2. Load environment variables
3. Call core functions from `src/core/`
4. Handle errors and exit codes

The actual business logic lives in:
- `src/core/fetch-issue.js` - Jira issue fetching
- `src/api/` - API clients

This separation allows the same core logic to be used by:
- **`atl` CLI commands** (`bin/atl.js` + `src/commands/`) - Primary interface
- **Standalone scripts** (this directory) - npm scripts & fallback
- **Programmatic usage** (import `src/core/` directly) - Automation & testing

---

## When to Use Standalone Scripts

### ✅ Use standalone scripts when:
- **npm shortcuts**: `npm run issue` is faster to type
- **Tool directory**: Already in `tools/atlassian-cli/`
- **No global CLI**: `npm link` not run or failed
- **Scripting**: Automating with shell scripts that call npm
- **CI/CD**: Build pipelines that avoid global installs

### ⚠️ Prefer `atl` CLI when:
- **Global access**: Working from any directory in workspace
- **Interactive use**: Running commands frequently
- **Documentation**: Easier to explain and remember
- **Consistency**: Matches other CLI tools (git, npm, etc.)
- **Features**: Access to full CLI capabilities (help, version, etc.)

---

## Migration Guide

If you have existing scripts using standalone invocation:

**Before:**
```bash
node tools/atlassian-cli/src/standalone/fetch-jira-issue.js RMBJTDBC-18001
```

**After `npm link`:**
```bash
atl j issue RMBJTDBC-18001
```

**Or keep using npm scripts:**
```bash
# Still works, shorter than direct invocation
npm run issue RMBJTDBC-18001
```

No breaking changes - all methods continue to work.
