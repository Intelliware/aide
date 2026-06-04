# jira-get — Inputs & Outputs

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `issueKey` | string | Yes | Jira issue key (PROJECT-NUMBER format) | `PROJ-123`, `XYZ-456` |
| `--fresh` | flag | No | Force fresh fetch, bypass cache | `--fresh` |
| `--fields` | string | No | Comma-separated list of fields to fetch | `--fields=summary,status,updated` |

###Issue Key Format

Must match: `^[A-Z]{2,}-\d+$`

Project keys may contain digits (e.g., `GHI1`, `CEAJN2C`, `MNO1`).

## Output Artifacts

### Cache Files

All output files are saved to: `cache/jira/{PROJECT}/{ISSUE_KEY}/`

| File | Description | Format | Created By |
|------|-------------|--------|------------|
| `{ISSUE_KEY}.json` | Raw Jira API response | JSON | CLI tool |
| `.meta.json` | Issue metadata and cache info | JSON | CLI tool |
| `{ISSUE_KEY}.analysis.md` | Agent-generated analysis (optional) | Markdown | Agent |

### .meta.json Structure

```json
{
  "issueKey": "PROJ-123",
  "summary": "User Onboarding Feature feature",
  "status": "In Progress",
  "type": "Feature",
  "updated": "2026-04-28T14:30:00.000Z",
  "fetched_at": "2026-04-29T10:15:22.154Z",
  "links": [
    {"key": "PROJ-201", "type": "child", "status": "To Do"},
    {"key": "XYZ-6111", "type": "child", "status": "In Progress"}
  ]
}
```

## CLI Commands

All examples below use the direct `atl` form. If `atl` is not on PATH, prefix with `cd tools && npm run atl --`. See the SKILL's `CLI Invocation` section for the probe pattern.

### Basic Fetch

```bash
atl j issue PROJ-123
```

### Force Fresh Fetch

```bash
atl j issue PROJ-123 --fresh
```

### Fetch Specific Fields Only

```bash
atl j issue PROJ-123 --fields=updated
```

### Fetch Issue with Related Items

```bash
atl j related PROJ-123
```

## Example Directory Structure

```
cache/jira/
├── CEAJ/
│   └── PROJ-123/
│       ├── PROJ-123.json           # Raw API response
│       ├── .meta.json                # Metadata
│       └── PROJ-123.analysis.md    # Optional agent analysis
└── DIGSTART/
    └── XYZ-456/
        ├── XYZ-456.json
        ├── .meta.json
        └── XYZ-456.analysis.md
```

## Reading Cached Output

### Read JSON Response

```javascript
const projectKey = issueKey.split('-')[0];
const jsonPath = `cache/jira/${projectKey}/${issueKey}/${issueKey}.json`;

const issueJson = await read_file({
  filePath: jsonPath,
  startLine: 1,
  endLine: 2000
});

const issue = JSON.parse(issueJson);
```

### Read Metadata

```javascript
const metaPath = `cache/jira/${projectKey}/${issueKey}/.meta.json`;

const meta = JSON.parse(await read_file({
  filePath: metaPath,
  startLine: 1,
  endLine: 50
}));

console.log(`Status: ${meta.status}`);
console.log(`Last updated: ${meta.updated}`);
console.log(`Fetched: ${meta.fetched_at}`);
```

## Cache Status Indicators

Check terminal output for these patterns:

| Pattern | Meaning |
|---------|---------|
| `"✓ Cache is up to date!"` | Data is current, no fetch needed |
| `"⚠ Remote has been updated"` | Fresh copy was fetched |
| `"🔄 Fetching Jira issue"` | No cache, fetching fresh |

Always communicate cache status to the user in your response.
