# jira-extract-requirements — Inputs & Outputs

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueKey` | string | Yes | Root Jira issue key (Feature/Epic) |
| `--fresh` | flag | No | Force fresh fetch for all items |

## Output Artifacts

### Package Structure

```
{output-root}/{ISSUE_KEY}-{slug}/
├── README.md                           # TOC + links checklist
├── sources/jira/{ISSUE_KEY}-{slug}.md # Root issue markdown
└── links/{DEP_KEY}-{slug}.md          # Dependency markdown files
```

### README.md

Contains:
- Package title and issue type
- Extraction date
- Root issue Jira URL
- TOC linking to all files
- Links checklist tracking fetch status

### Root Issue Markdown

Frontmatter + content sections:
```markdown
---
source: jira
issue_key: PROJ-123
issue_type: Feature
status: In Progress
assignee: Jane Smith
fetched: 2026-05-05T10:30:00Z
---

# PROJ-123 — Feature Title

## Metadata
## Summary
## Acceptance Criteria
## Description
## Child Items / Linked Issues
```

### Link Markdown Files

```markdown
---
source: jira
issue_key: PROJ-201
relationship: child
parent: PROJ-123
fetched: 2026-05-05T10:35:00Z
---

# PROJ-201 — Child Story Title

## Why This Matters
## Issue Content
## Relationship to Parent
## Open Questions / Notes
```

## CLI Commands

```bash
# Fetch root + related
atl j related {ISSUE_KEY}

# Fetch single dependency
atl j issue {DEP_KEY}

# Force fresh
atl j related {ISSUE_KEY} --fresh
```

## Cache Structure

```
cache/jira/{PROJECT}/{ISSUE_KEY}/
├── {ISSUE_KEY}.json       # Raw API response (CLI-written)
└── .meta.json              # Metadata (updated, fetched_at, links)
```

## Package Update Report Format

```
📦 Package Update Report — {ISSUE_KEY}-{slug}
Run completed: {ISO_DATETIME}

✅ Refreshed (remote updated):
  • PROJ-123   updated 2026-04-28 → re-authored
  • PROJ-201 updated 2026-04-27 → re-authored

⏭ No changes (cache current):
  • XYZ-6111  last updated 2026-04-10
  • ABC-999       last updated 2026-03-15

⬜ Pending (not yet fetched):
  • DEF-100  — To Do

⚠ Errors:
  • JKL-88  — 403 Forbidden
```
