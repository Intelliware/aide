---
name: confluence-fetch
description: "Use when the user asks to fetch, view, cache, or analyze a single Confluence page by ID or URL; says 'fetch Confluence page', 'show me page {ID}', 'read this Confluence URL', or needs raw page JSON and metadata for agent analysis. Saves the raw JSON response and metadata, then lets the agent generate markdown analysis when needed."
---

# Confluence Fetch

Fetch Confluence documentation pages using the Atlassian CLI tool. Caches raw JSON responses for agent analysis.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, cache strategy, rate limit protection, best practices
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — Parameters, CLI commands, cache structure, status indicators
- **[Example](./references/EXAMPLE.md)** — Complete fetch scenarios with and without Jira enrichment

## When NOT to use

- The user wants the page **plus its linked pages and Jira issues** as a package → `confluence-extract-package`
- Requirements live in Jira and Confluence is only secondary context → `jira-extract-requirements`
- The source content is an attached Word/Excel/PDF file, not a Confluence page → `document-convert`
- The `atl` CLI is not installed and the user has not opted into the optional Atlassian integration — halt and explain the prerequisite

## Quick Start

**User**: "Show me page 123456"

**Command**:
```bash
# Basic fetch (no Jira data)
atl c page 123456

# With live Jira issue statuses
atl c page 123456 --with-jira

# Force fresh copy
atl c page 123456 --fresh
```

**Output**: Saved to `cache/confluence/{SPACE}/123456-{title}/`

## Essential Workflow

1. **Extract** page ID from message or URL
2. **Probe CLI availability** — use `atl` directly if on PATH, otherwise `cd tools && npm run atl --` (resolve once per session)
3. **Execute** CLI command using the resolved invocation form
4. **Read** cached JSON and metadata
5. **Interpret** Confluence Storage Format XHTML
6. **Present** to user with cache status

## Jira Enrichment

**Default** (no `--with-jira`):
- Issue keys displayed as text
- No live API calls
- Fast, no rate limit risk

**With `--with-jira` flag**:
- Fetches live Jira status/assignee/priority
- Single batch JQL query for all issues
- Cached in `.jira.json` (auto-refreshes after 1 hour)

**Refresh Jira only**:
```bash
atl c refresh-jira 123456
```

## Cache Behavior

**Files created**:
- `{PAGE_ID}.json` — Raw API response (source of truth)
- `.meta.json` — Metadata (title, space, version, URL, fetched_at)
- `.jira.json` — Optional Jira enrichment (with `--with-jira`)

**Always report cache status**:
- ✅ "Retrieved from cache (up to date with server)"
- ✅ "Fresh copy fetched (version X → Y)"
- ✅ "First fetch from Confluence"

## Rate Limit Protection

**Tool behavior**: Fails fast on 429 errors (no auto-retry)

**To avoid rate limits**:
1. ✅ Use cache by default (omit `--fresh`)
2. ✅ Skip `--with-jira` unless necessary
3. ✅ Use `refresh-jira` to update only issue data
4. ❌ Don't repeatedly use `--fresh --with-jira`

**If you hit 429**:
- Wait 5-10 minutes before retry
- Use cached data: `atl c page {PAGE_ID}` (no flags)

## CLI Commands Reference

```bash
# Fetch page
atl c page {PAGE_ID}

# With Jira enrichment
atl c page {PAGE_ID} --with-jira

# Fresh copy
atl c page {PAGE_ID} --fresh

# Refresh only Jira
atl c refresh-jira {PAGE_ID}

# From URL
atl c url https://confluence.example.com/pages/{PAGE_ID}

# Local installation
cd tools && npm run atl -- c page {PAGE_ID}
```

## Error Handling

| Error | Action |
|-------|--------|
| **404 Not Found** | Verify page ID, check permissions |
| **401 Auth Failed** | Run `atl auth login` |
| **429 Rate Limit** | Wait 5-10 min, use cache |
| **Network Error** | Retry or use cached version |

## Best Practices

1. ✅ **Use cache by default** — Skip `--fresh` unless user asks for "latest"
2. ✅ **Skip `--with-jira`** unless user needs live issue status
3. ✅ **Read JSON directly** — Agent interprets Confluence Storage Format XHTML
4. ✅ **Report cache status** in every response
5. ✅ **On 429 errors, wait** — Tool fails fast, no auto-retry
6. ❌ **Never spam API** with repeated `--fresh --with-jira` calls

## Cache Directory Structure

```
cache/confluence/
└── {SPACE}/
    └── {PAGE_ID}-{title}/
        ├── {PAGE_ID}.json       # Raw page content
        ├── .meta.json            # Metadata
        └── .jira.json            # Optional Jira data
```

## Related Skills

- **confluence-extract-package** — Extract page + all linked pages/issues into package
- **jira-get** — Fetch Jira issues referenced in Confluence

## Additional Resources

- [Atlassian CLI Setup](../../../../tools/packages/atlassian-cli/SETUP-ATL-CLI.md)
