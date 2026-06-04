# confluence-extract-package — Inputs & Outputs

## Input Parameters

| Parameter | Type | Required |Description |
|-----------|------|----------|-------------|
| `pageId` | string/number | Yes | Root Confluence page ID |
| `--fresh` | flag | No | Force fresh fetch for all items |

## Output Structure

```
{output-root}/{page-title-slug}/
├── README.md                           # TOC + links checklist
├── sources/confluence/{slug}.md       # Root page (agent-authored)
└── links/
    ├── {linked-page-slug}.md          # Linked Confluence pages
    └── {ISSUE_KEY}-{slug}.md          # Referenced Jira issues
```

## CLI Commands

```bash
# Fetch root page with Jira enrichment
atl c page {PAGE_ID} --with-jira

# Fetch linked page
atl c page {LINKED_PAGE_ID}

# Fetch Jira issue
atl j issue {ISSUE_KEY}

# Staleness check (lightweight)
atl c page {PAGE_ID} --fields=version
atl j issue {KEY} --fields=updated
```

## Cache Structure

```
cache/confluence/{SPACE}/{PAGE_ID}/
├── {PAGE_ID}.json       # Raw page JSON
├── .meta.json            # version.number, version.when, fetched_at
└── .jira.json            # Jira enrichment

cache/jira/{PROJECT}/{KEY}/
├── {KEY}.json            # Raw issue JSON
└── .meta.json            # updated, fetched_at
```

## Package Update Report

```
📦 Package Update Report — {page-slug}
Run completed: {ISO_DATETIME}

✅ Refreshed:
  • Confluence {PAGE_ID} version 12 → 15 — re-authored
  • Jira PROJ-123 updated 2026-04-28 → re-authored

⏭ No changes:
  • Confluence 987654 version 4 — unchanged
  • Jira ABC-999 updated 2026-03-15 — unchanged

⬜ Pending:
  • Confluence 111222 — not yet fetched

⚠ Errors:
  • Confluence 999888 — 403 Forbidden
```
