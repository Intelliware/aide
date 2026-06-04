---
name: jira-extract-requirements
description: "Use when the user asks to extract requirements from Jira, create a requirements package from a Jira Feature/Epic, build requirements from Jira, or says 'extract requirements for {KEY}'. Fetches the Jira issue, detects issue type, prompts for output location, saves raw data to cache, creates a structured markdown requirements package, performs staleness checks, and prints a Package Update Report."
compatibility: "Requires atl CLI tool."
metadata:
  version: 2.1.0
  author: AI-A
  updated: 2026-05-05
---

# Jira Extract Requirements

Extract a Jira feature or epic into a structured markdown requirements package with root issue, children, linked dependencies, and incremental staleness tracking.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, when to use, key features, output structure
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — Parameters, package structure, CLI commands, cache format
- **[Example](./references/EXAMPLE.md)** — Complete extraction and refresh scenarios

## When NOT to use

- The user only needs to view one issue → `jira-get`
- The user needs to find issues across criteria → `jira-search`
- The source of truth for requirements is a Confluence page, not Jira → `confluence-extract-package`
- The user is ready to author the canonical requirements package — this skill produces *discovery input*; the gated artifact is still produced by `create-requirements-package`
- The `atl` CLI is not installed and the user has not opted into the optional Atlassian integration — halt and explain the prerequisite

## Quick Start

**User**: "Extract requirements from Jira feature PROJ-123"

**Steps**:
1. Fetch root: `atl j related PROJ-123`
2. Detect issue type → prompt for output location
3. Create package folder structure
4. Author root markdown from cache
5. Fetch & author child/linked issues
6. Print Package Update Report

**Output**: `documentation/requirements-package/PROJ-123-{slug}/`

## Essential Workflow

1. **Fetch root issue** via `jira-get` skill (JSON to cache)
2. **Detect issue type** — Features default to `documentation/requirements-package/`
3. **Prompt for output location** (3 options: requirements-package, drafts, link-into-existing)
4. **Create package structure** (`README.md`, `sources/jira/`, `links/`)
5. **Author root markdown** by reading cache (agent-authored, not CLI)
6. **Extract L0 links** (children + explicit links only, no recursion)
7. **Staleness check** each item (compare remote `updated` vs cached `updated`)
8. **Fetch & author dependencies** (only MISSING or STALE items)
9. **Update README checklist** (`[x]` for fetched, `[ ]` for pending)
10. **Print Package Update Report** (refreshed, unchanged, pending, errors)

## File Structure

```
{output-root}/{ISSUE_KEY}-{slug}/
├── README.md                           # TOC + links checklist
├── sources/
│   └── jira/
│       └── {ISSUE_KEY}-{slug}.md      # Agent-authored root issue
└── links/
    ├── {CHILD_KEY}-{slug}.md          # Agent-authored child/dependency
    └── ...
```

## Cache Behavior

**CLI writes**: Raw JSON only to `cache/jira/{PROJECT}/{KEY}/{KEY}.json`  
**Agent writes**: All markdown files by reading JSON cache

**Staleness check** (runs on every execution):
```bash
# Lightweight check
atl j issue {KEY} --fields=updated

# Compare remote vs cached
if remote.updated > cached.updated → STALE → refetch
else → CURRENT → skip
```

## Output Location Prompt

**If issueType = "Feature"**:
```
1. ✅ documentation/requirements-package/{KEY}-{slug}/ (recommended)
2. drafts/{KEY}-{slug}/
3. Link into existing package
```

**Otherwise**:
```
1. drafts/{KEY}-{slug}/ (default)
2. documentation/requirements-package/{KEY}-{slug}/
3. Link into existing package
```

## Package Update Report

**Always print after every run**:

```
📦 Package Update Report — {ISSUE_KEY}-{slug}
Run completed: {ISO_DATETIME}

✅ Refreshed: • {KEY} updated {date} → re-authored
⏭ No changes: • {KEY} last updated {date} — unchanged
⬜ Pending: • {KEY} — not yet fetched
⚠ Errors: • {KEY} — {error}
```

## CLI Commands

```bash
# Fetch root + related
atl j related {ISSUE_KEY}

# Fetch single dependency
atl j issue {DEP_KEY}

# Lightweight staleness check
atl j issue {KEY} --fields=updated

# Force fresh (bypass cache)
atl j issue {KEY} --fresh
```

## Best Practices

1. ✅ CLI/skills write JSON only — agent authors all markdown
2. ✅ Always run staleness check before re-authoring
3. ✅ Preserve hand-written notes in CURRENT files
4. ✅ Prompt for output location before creating any files
5. ✅ L0 linking only (direct children/links, no recursive crawl)
6. ✅ Print Package Update Report after every run
7. ❌ Never auto-generate markdown via CLI `--out` flag

## Related Skills

- **jira-get** — Fetch individual issues (provides cache this skill reads)
- **jira-search** — Discover features/epics to extract
- **confluence-extract-package** — Extract Confluence-sourced requirements

## Additional Resources

- [Atlassian CLI Setup](../../../../tools/packages/atlassian-cli/SETUP-ATL-CLI.md)

