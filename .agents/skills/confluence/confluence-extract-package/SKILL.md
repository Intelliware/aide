---
name: confluence-extract-package
description: >-
  Given a Confluence page ID or URL, extracts the main page plus all linked pages
  and Jira issues (L0 only). Checks for related Jira packages. Performs staleness
  checks and prints Package Update Report. Use when user says "extract Confluence
  package", "download page and its links", "build package from Confluence page {ID}".
compatibility: "Requires atl CLI tool."
metadata:
  version: 2.1.0
  author: AI-A
  updated: 2026-05-05
---

# Confluence Extract Package

Extract a Confluence page and all L0-linked pages/Jira issues into a structured markdown package with staleness tracking.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, when to use, key features, workflow position
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — Parameters, package structure, CLI commands, update report
- **[Example](./references/EXAMPLE.md)** — Complete extraction scenario with staleness checking

## When NOT to use

- Only a single page is needed (no link traversal) → `confluence-fetch`
- The authoritative requirements source is a Jira Feature/Epic → `jira-extract-requirements`
- The source content lives in attached documents (Word/Excel/PDF) → `document-convert`
- The user is ready to author the canonical requirements package — this skill produces *discovery input*; the gated artifact is still produced by `create-requirements-package`
- The `atl` CLI is not installed and the user has not opted into the optional Atlassian integration — halt and explain the prerequisite

## Quick Start

**User**: "Extract a Confluence package for page 123456789"

**Steps**:
1. Fetch root: `atl c page 123456789 --with-jira`
2. Check for related Jira package (`.jira.json` inspection)
3. Extract L0 links (Confluence pages + Jira keys from page body)
4. Run staleness check on cached items
5. Prompt for output location
6. Fetch & author MISSING/STALE items only
7. Print Package Update Report

**Output**: `{output-root}/{page-slug}/`

## Essential Workflow

1. **Fetch root page** via `confluence-fetch` with `--with-jira`
2. **Check `.jira.json`** for linked Feature → detect existingrequirements packages
3. **Extract L0 links** (Confluence + Jira, direct links only)
4. **Staleness check** each cached item (version/updated comparison)
5. **Prompt for output** (offer related Jira package if found)
6. **Create package structure** (`README.md`, `sources/confluence/`, `links/`)
7. **Author root markdown** by reading cache
8. **Fetch & author dependencies** (MISSING or STALE only)
9. **Update README checklist** (`[x]` fetched, `[ ]` pending)
10. **Print Package Update Report**

## File Structure

```
{output-root}/{page-slug}/
├── README.md                           # TOC + links checklist
├── sources/confluence/{slug}.md       # Agent-authored root page
└── links/
    ├── {linked-page-slug}.md          # Linked Confluence pages
    └── {ISSUE_KEY}-{slug}.md          # Referenced Jira issues
```

## Staleness Check Algorithm

**Confluence pages**:
```bash
atl c page {ID} --fields=version
→ compare remote version.number vs cached version.number
```

**Jira issues**:
```bash
atl j issue {KEY} --fields=updated
→ compare remote updated vs cached updated
```

**Results**: MISSING → fetch | STALE → refetch | CURRENT → skip

## CLI Commands

```bash
# Fetch root with Jira enrichment
atl c page {PAGE_ID} --with-jira

# Fetch linked page
atl c page {LINKED_PAGE_ID}

# Fetch Jira issue
atl j issue {ISSUE_KEY}

# Staleness lightweight checks
atl c page {PAGE_ID} --fields=version
atl j issue {KEY} --fields=updated

# Force fresh
atl c page {PAGE_ID} --with-jira --fresh
```

## Best Practices

1. ✅ Always fetch root with `--with-jira` for Jira enrichment
2. ✅ Check `.jira.json` for related Jira packages before prompting
3. ✅ L0 linking only (never recursive)
4. ✅ Run staleness check before re-authoring
5. ✅ Print Package Update Report after every run
6. ❌ Never auto-fetch all links if > 20 items (ask user first)

## Related skills

### Upstream (provide cache this skill reads)

- **confluence-fetch** — fetches the root page and writes `cache/confluence/{SPACE}/{PAGE_ID}/`. Required.
- **jira-get** — populates `cache/jira/{PROJECT}/{KEY}/` for any Jira keys discovered in the page body. Required for L0 Jira links.

### Runtime coupling: `.jira.json`

When the root page is fetched with `--with-jira`, `confluence-fetch` writes `cache/confluence/{SPACE}/{PAGE_ID}/.jira.json` containing the live status, assignee, and priority of every Jira key referenced on the page. This skill **reads `.jira.json`** during Step 2 of the workflow to:

1. Identify whether any referenced Jira issue is a **Feature/Epic** that may already have a sibling requirements package on disk (`documentation/requirements-package/{KEY}-*/`).
2. If a matching package is found, offer the user the option to **link into the existing Jira-sourced package** instead of creating a parallel Confluence-sourced one.

**Graceful degradation** — if `--with-jira` was not used, `.jira.json` is absent, or no linked Feature is found, this skill proceeds normally and produces a standalone Confluence package. The Jira coupling is an enrichment, not a hard dependency.

### Sibling skill (not a fallback)

- **jira-extract-requirements** — produces a parallel package shape rooted in a Jira Feature/Epic. Choose based on **where the source of truth lives**, not as a substitute for this skill. Both skills feed `create-requirements-package` as discovery input; neither produces the gated requirements artifact.

## Additional Resources

- [Atlassian CLI Setup](../../../tools/packages/atlassian-cli/SETUP-ATL-CLI.md)
