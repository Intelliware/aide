# jira-extract-requirements — Overview  

## Purpose

Extract a Jira feature or epic into a structured markdown requirements package with the root issue, child stories, linked dependencies, and cache staleness tracking for incremental updates.

## When to Use

- User provides a Jira feature, epic, or high-level issue key
- User wants to build a reusable markdown requirements package from Jira
- User asks to extract requirements, dependencies, child stories into files
- User mentions a requirements package driven by Jira (not Confluence)

## When NOT to Use

- **Single issue fetch** → Use `jira-get` instead
- **Search/discover issues** → Use `jira-search` instead
- **Confluence-sourced requirements** → Use `confluence-extract-package` instead

## Position in Workflow

This skill is **optional** — Jira integration is not required by the framework, only used when the team manages requirements in Jira.

When used, it acts as a discovery-input step that runs before `create-requirements-package`:
1. **After** `jira-search` (discovers features/epics)
2. **After** `jira-get` (validates single issue exists)
3. **Before** `create-requirements-package` — its output feeds Step 1 (discovery) of that skill
4. **Does NOT replace** `create-requirements-package` or its mandatory `review-requirements-package` gate

The full path to design is always:
`jira-extract-requirements` (optional) → `create-requirements-package` → `review-requirements-package` → `create-design-package`

## Key Features

1. **Automatic issue type detection** — Features default to `documentation/requirements-package/`, others prompt for location
2. **L0 linking only** — Extracts direct children and explicitly linked issues, not recursive crawl
3. **Staleness checking** — Compares cached `updated` vs remote, refetches only changed items
4. **Incremental updates** — Reuses existing package, refreshes stale items only
5. **Update reporting** — Package Update Report lists refreshed, unchanged, pending, and errored items

## Output Structure

```
{output-root}/{ISSUE_KEY}-{slug}/
├── README.md                           # TOC + links checklist
├── sources/
│   └── jira/
│       └── {ISSUE_KEY}-{slug}.md      # Root issue (agent-authored from cache)
└── links/
    ├── {CHILD_KEY}-{slug}.md          # One MD per child/linked issue
    └── ...
```

## Best Practices

1. CLI/skills write raw JSON to cache only — agent authors all markdown
2. Always run staleness check before re-authoring
3. Prompt user for output location before creating files
4. Prefer incremental expansion over bulk fetches
5. Print Package Update Report after every run
