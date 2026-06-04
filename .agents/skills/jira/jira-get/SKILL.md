---
name: jira-get
description: "Use when the user asks to fetch, view, cache, or analyze a single Jira issue by key; says 'fetch PROJ-123', 'show me Jira issue {KEY}', 'get this Jira ticket', or needs raw Jira issue JSON and metadata for agent analysis. Saves the raw JSON response, metadata, and agent-generated markdown analysis by default to cache/jira/{projectKey}/{ISSUE_KEY}/."
---

# Jira Get

Fetch individual Jira issues using the Atlassian CLI tool. Caches raw JSON responses and metadata for agent analysis.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, when to use, cache strategy, error handling
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — Parameters, CLI commands, cache structure, reading output
- **[Example](./references/EXAMPLE.md)** — Complete worked scenarios with code

## When NOT to use

- Fetching multiple issues by criteria (status, assignee, sprint) → `jira-search`
- Building a structured requirements package from a Feature or Epic → `jira-extract-requirements`
- The user only wants to view the issue in a browser — point them at the Jira URL instead of caching JSON
- The `atl` CLI is not installed and the user has not opted into the optional Atlassian integration — halt and explain the prerequisite

## Quick Start

### Fetch an Issue

**User Request**: "Fetch PROJ-123"

**Command**:
```bash
# Uses cache if available
atl j issue PROJ-123

# Force fresh fetch
atl j issue PROJ-123 --fresh
```

**Output**: Saved to `cache/jira/PROJ/PROJ-123/`
- `PROJ-123.json` — Raw Jira API response
- `.meta.json` — Metadata (summary, status, type, updated, links)
- `PROJ-123.analysis.md` — Optional agent-generated analysis

### Read Cached Data

**Use agent's JSON parsing** (preferred - works in all environments):
```javascript
const issueKey = "PROJ-123";
const projectKey = issueKey.split('-')[0];

// Read raw JSON using agent's read_file tool
const jsonPath = `cache/jira/${projectKey}/${issueKey}/${issueKey}.json`;
const issueData = JSON.parse(await read_file({ filePath: jsonPath, startLine: 1, endLine: 2000 }));

// Read metadata
const metaPath = `cache/jira/${projectKey}/${issueKey}/.meta.json`;
const meta = JSON.parse(await read_file({ filePath: metaPath, startLine: 1, endLine: 50 }));
```

**If custom scripts needed** (check `SCRIPT_RUNTIME` environment variable):
```javascript
// Check which runtime is available
const runtime = process.env.SCRIPT_RUNTIME || 'node';  // defaults to node

if (runtime === 'node') {
  // Use Node.js for parsing
  await run_in_terminal({
    command: `node -e "const data = require('./${jsonPath}'); console.log(JSON.stringify(data.fields.summary));"`,
    isBackground: false
  });
} else if (runtime === 'python' || runtime === 'python3') {
  // Use Python for parsing
  await run_in_terminal({
    command: `${runtime} -c "import json; data = json.load(open('${jsonPath}')); print(data['fields']['summary'])"`,
    isBackground: false
  });
}
```

**Note**: Always prefer agent's native JSON.parse() over external scripts unless absolutely necessary.

**See also**: `tools/SCRIPT-RUNTIME.md` for detailed guidance on runtime configuration.

### Present to User

**Always report cache status:**

```javascript
// Check terminal output for:
// "✓ Cache is up to date!" = using cached data
// "⚠ Remote has been updated" = fetched fresh copy
// "🔄 Fetching Jira issue" = first fetch

console.log(`✅ Retrieved ${meta.issueKey}: ${meta.summary}`);
console.log(`   Status: ${meta.status}`);
console.log(`   Type: ${meta.type}`);
console.log(`   Cache Status: [up to date | freshly fetched | first fetch]`);
```

## Essential Workflow

1. **Validate** issue key format (`^[A-Z]{2,}-\d+$`)
2. **Check runtime** environment variable: `SCRIPT_RUNTIME` (node, python, python3)
3. **Probe CLI availability** — see [CLI Invocation](#cli-invocation) below; resolve once per session and reuse the result
4. **Execute** CLI command using the resolved invocation form
5. **Read** cached JSON and metadata
6. **Present** to user with cache status
7. **Generate** analysis markdown (optional)

## CLI Invocation

Probe `atl` availability once at the start of the session. If it resolves on PATH (e.g. user ran `npm run link-all`), invoke it directly. Otherwise fall back to the workspace-relative form, which only requires `cd tools && npm install` to have been run.

```bash
# Probe (run once, cache the result)
atl --version 2>$null   # PowerShell
atl --version 2>/dev/null   # bash/zsh

# If exit code 0 → use:    atl j issue PROJ-123
# Otherwise        → use:    cd tools && npm run atl -- j issue PROJ-123
```

All command examples in this skill show the direct `atl` form for brevity. When `atl` is not on PATH, prefix with `cd tools && npm run atl --`.

## Common Patterns

### Basic Fetch (Cached)
```bash
atl j issue PROJ-123
```

### Force Fresh Data
```bash
atl j issue PROJ-123 --fresh
```

### Fetch with Related Issues
```bash
atl j related PROJ-123
```

### Lightweight Status Check
```bash
atl j issue PROJ-123 --fields=updated
```

## Error Handling

| Error | Action |
|-------|--------|
| Invalid format | Validate against `^[A-Z]{2,}-\d+$` |
| 404 Not Found | Verify key, check permissions |
| 401 Auth Failed | Check `.env` configuration |
| Network error | Retry or use cached version |

## Best Practices

1. ✅ **Use cache by default** (no `--fresh` unless user asks for "latest")
2. ✅ **Always validate** issue key format before fetching
3. ✅ **Report cache status** to user in every response
4. ✅ **Read JSON directly** (don't rely on pre-rendered markdown)
5. ✅ **Warn if cache > 7 days old**
6. ❌ **Never say "I fetched"** without clarifying cache vs. fresh

## CLI Commands Reference

```bash
# Fetch issue
atl j issue {ISSUE_KEY}

# Fresh fetch  
atl j issue {ISSUE_KEY} --fresh

# Specific fields only
atl j issue {ISSUE_KEY} --fields=summary,status,updated

# With related issues
atl j related {ISSUE_KEY}

# Local installation mode
cd tools && npm run atl -- j issue {ISSUE_KEY}
```

## Cache Directory Structure

```
cache/jira/
├── CEAJ/
│   └── PROJ-123/
│       ├── PROJ-123.json           # Raw API response
│       ├── .meta.json                # Metadata & links
│       └── PROJ-123.analysis.md    # Optional agent analysis
└── DIGSTART/
    └── XYZ-456/
        ├── XYZ-456.json
        ├── .meta.json
        └── XYZ-456.analysis.md
```

## Related Skills

- **jira-search** — Find multiple issues using JQL queries
- **jira-extract-requirements** — Build structured requirements packages from Jira features/epics
- **confluence-fetch** — Fetch related Confluence documentation

## Additional Resources

- [Atlassian CLI Setup Guide](../../../../tools/packages/atlassian-cli/SETUP-ATL-CLI.md)
- [JIRA Integration Documentation](../../../../tools/packages/atlassian-cli/README.md)
