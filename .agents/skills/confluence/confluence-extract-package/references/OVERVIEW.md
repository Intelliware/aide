# confluence-extract-package — Overview  

## Purpose

Extract a Confluence page plus all L0-linked pages and Jira issues into a structured markdown package with staleness tracking and incremental updates.

## When to Use

- User provides Confluence page ID/URL and wants a local package
- User wants to extract a page and all its linked resources
- User needs structured markdown with download checklist
- User says "extract Confluence package for page {ID}"

## When NOT to Use

- **Single page fetch** → Use `confluence-fetch` instead
- **Jira-sourced packages** → Use `jira-extract-requirements` instead

## Position in Workflow

This skill is **optional** — Confluence integration is not required by the framework, only used when the team manages documentation in Confluence.

When used, it acts as a discovery-input step that runs before `create-requirements-package`:
1. **After** `confluence-fetch` (validates page exists)
2. **Alternative to** `jira-extract-requirements` when source material lives in Confluence rather than Jira
3. **Before** `create-requirements-package` — its output feeds Step 1 (discovery) of that skill
4. **Does NOT replace** `create-requirements-package` or its mandatory `review-requirements-package` gate

The full path to design is always:
`confluence-extract-package` (optional) → `create-requirements-package` → `review-requirements-package` → `create-design-package`

## Key Features

1. **Detects related Jira packages** — checks for linked Feature issues with existing packages
2. **L0 linking only** — direct links on root page, no recursive crawl
3. **Staleness checking** — compares version numbers (Confluence) and updated timestamps (Jira)
4. **Incremental updates** — refreshes only stale items
5. **Update reporting** — Package Update Report after every run

## Best Practices

1. Always fetch root with `--with-jira` for Jira enrichment
2. Run staleness check before re-authoring  
3. Check for related Jira packages before prompting output location
4. L0 only — never recursive link following
5. Print Package Update Report after every run
