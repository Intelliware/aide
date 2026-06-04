# jira-search — Overview

## Purpose

Search for multiple Jira issues using JQL (Jira Query Language) queries. Find issues by status, assignee, project, sprint, labels, or custom criteria. Generate comprehensive search reports with summaries and aggregations.

## When to Use

Use this skill when:
- User wants to find issues matching specific criteria
- User mentions "search", "find", "show me", "list"
- User asks questions like:
  - "Show me all issues in status X"
  - "Find issues assigned to me"
  - "List bugs in project ABC"
  - "What issues are in the current sprint?"
  - "Show unassigned issues"

## When NOT to Use

- **Single issue lookup** → Use `jira-get` skill instead
- **Comprehensive requirements packages** → Use `jira-extract-requirements` skill instead
- **Epic with all children analysis** → Use requirements extraction for structured packages

## Position in Workflow

`jira-search` is a discovery skill that:
1. **Precedes** `jira-get` — find multiple issues, then fetch specific ones
2. **Guides** `jira-extract-requirements` — discover features/epics to extract
3. **Supports** reporting and analysis — aggregate status, count issues, identify trends

## Output Structure

```
cache/jira/
├── ABC/
│   ├── ABC-123/
│   │   ├── ABC-123.json
│   │   └── .meta.json
│   └── ABC-124/
│       ├── ABC-124.json
│       └── .meta.json
└── _searches/
    └── search-2026-05-05-project-abc.md  ← Summary report
```

## JQL Translation

The skill translates natural language to JQL:

| User Request | JQL Query |
|--------------|-----------|
| "My open issues" | `assignee = currentUser() AND status != Done` |
| "Bugs in project ABC" | `project = ABC AND type = Bug` |
| "In progress stories" | `type = Story AND status = 'In Progress'` |
| "High priority unassigned" | `priority = High AND assignee is EMPTY` |

## Error Handling

| Error | Response |
|-------|----------|
| **Invalid JQL** | Show syntax error, suggest correction |
| **Auth Failed** | Guide to authentication setup |
| **Field Name Error** | Suggest correct field name |
| **Empty Results** | Suggest alternative queries |

## Best Practices

1. **Start broad, then narrow** — Begin with simple queries, add filters as needed
2. **Use limits** — Default is 50, increase only when needed (`--max` flag)
3. **Save common patterns** — Document frequently-used JQL queries
4. **Check result count** — Verify count makes sense before deep analysis
5. **Generate summaries** — Always provide aggregations (by status, type, assignee)