---
name: jira-search
description: Search Jira issues using JQL (Jira Query Language) queries. Find issues by status, assignee, project, sprint, labels, or custom criteria. Returns multiple issues with summaries and generates search reports.
---

# Jira Search

Search for multiple Jira issues using JQL queries and generate comprehensive search reports with aggregations and summaries.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, when to use, JQL translation, error handling
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — JQL patterns, CLI commands, search reports, cache structure
- **[Example](./references/EXAMPLE.md)** — Complete search scenarios with natural language translation

## When NOT to use

- A single, known issue key is requested → `jira-get`
- The user wants a full requirements package extracted from a Feature/Epic → `jira-extract-requirements`
- The user's request is too vague to translate to JQL — ask clarifying questions first instead of guessing a query
- The `atl` CLI is not installed and the user has not opted into the optional Atlassian integration — halt and explain the prerequisite

## Quick Start

### Basic Search

**User Request**: "Show me all in-progress issues in project ABC"

**Translate to JQL**:
```jql
project = ABC AND status = 'In Progress'
```

**Execute**:
```bash
atl j search "project = ABC AND status = 'In Progress'"
```

**Output**:
- Individual issues cached at: `cache/jira/ABC/{ISSUE_KEY}/`
- Search summary saved to: `cache/jira/_searches/search-{DATE}-{slug}.md`

### Search with Limit

```bash
atl j search "project = XYZ" --max 100
```

### Specific Fields Only

```bash
atl j search "type = Bug" --fields=summary,status,assignee
```

## Natural Language to JQL Translation

| User Says | JQL Query |
|-----------|-----------|
| "My open issues" | `assignee = currentUser() AND status != Done` |
| "Bugs in ABC" | `project = ABC AND type = Bug` |
| "High priority unassigned" | `priority = High AND assignee is EMPTY` |
| "In progress stories" | `type = Story AND status = 'In Progress'` |
| "Created this week" | `created >= -7d` |

## Essential Workflow

1. **Parse** user request for search criteria
2. **Translate** to valid JQL query
3. **Probe CLI availability** — use `atl` directly if on PATH, otherwise `cd tools && npm run atl --` (resolve once per session)
4. **Execute** search command using the resolved invocation form
5. **Read** search summary from cache
6. **Aggregate** results (by status, type, assignee, priority)
7. **Present** summary with actionable insights

## Common JQL Patterns

### Project & Status
```jql
project = ABC
status = "In Progress"
project = ABC AND status != Done
```

### Assignee
```jql
assignee = currentUser()
assignee is EMPTY
assignee = "john.doe@example.com"
```

### Type & Priority
```jql
type = Story
priority >= High
type IN (Bug, Task) AND priority = Highest
```

### Dates

```jql
created >= -7d
updated >= -2w
duedate <= now()
```

### Complex Queries
```jql
project = ABC AND type = Bug AND status != Done AND assignee = currentUser()
```

## Response Pattern

Always provide: **Count**, **Aggregations** (status/type/assignee), **Top results**, **Actions**

See [EXAMPLE.md](./references/EXAMPLE.md) for complete response examples.

## Error Handling

**Invalid JQL**: Show syntax error, suggest correction  
**Empty Results**: Suggest alternative queries  
**Field Errors**: Suggest correct field name

See [OVERVIEW.md](./references/OVERVIEW.md) for detailed error handling.

```
cache/jira/
├── ABC/
│   ├── ABC-123/
│   │   ├── ABC-123.json           # Individual issue details
│   │   └── .meta.json
│   └── ABC-124/
│       ├── ABC-124.json
│       └── .meta.json
└── _searches/
    └── search-2026-05-05-abc-inprogress.md  # Search summary report
```

## CLI Commands Reference

```bash
# Basic search
atl j search "{JQL}"

# With limit
atl j search "{JQL}" --max 100

# Specific fields
atl j search "{JQL}" --fields=summary,status,assignee

# Local installation mode
cd tools && npm run atl -- j search "{JQL}"
```

## Best Practices

1. ✅ **Start broad, then narrow** — Add filters incrementally
2. ✅ **Use limits** — Default 50, increase only when needed
3. ✅ **Validate JQL** — Quote multi-word values
4. ✅ **Provide aggregations** — Summary by status, type, assignee
5. ✅ **Offer refinement** — Suggest filters when results are large
6. ❌ **Don't fetch all** — Use pagination for large result sets

## Integration with Other Skills

**jira-get**: Search finds issues → Get fetches individual details

```
User: "Find all bugs in ABC"
→ jira-search: project = ABC AND type = Bug
→ Returns: BUG-123, BUG-456, BUG-789

User: "Show details for BUG-123"
→ jira-get: issue BUG-123
```

**jira-extract-requirements**: Search finds features → Extract builds packages

```
User: "Find features in CEAJ project"
→ jira-search: project = CEAJ AND type = Feature
→ Returns list of features

User: "Extract requirements for PROJ-123"
→ jira-extract-requirements: PROJ-123
```

## Related Skills

- **jira-get** — Fetch individual issue details
- **jira-extract-requirements** — Build requirement packages from features/epics

## Additional Resources

- [JQL Reference Documentation](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [Atlassian CLI Setup Guide](../../../tools/packages/atlassian-cli/SETUP-ATL-CLI.md)
