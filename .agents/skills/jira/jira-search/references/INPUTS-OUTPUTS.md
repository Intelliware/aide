# jira-search — Inputs & Outputs

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `jql` | string | Yes | JQL query string | `project = ABC AND status = 'In Progress'` |
| `--max` | integer | No | Maximum results to return (default: 50) | `--max 100` |
| `--fields` | string | No | Comma-separated field list | `--fields=summary,status,assignee` |

## Common JQL Patterns

### By Project
```jql
project = ABC
project IN (ABC, XYZ, DEF)
```

### By Status
```jql
status = "In Progress"
status IN ("To Do", "In Progress")
status != Done
```

### By Assignee
```jql
assignee = currentUser()
assignee = "john.doe@example.com"
assignee is EMPTY
assignee is not EMPTY
```

### By Type
```jql
type = Story
type IN (Bug, Task)
issuetype = Epic
```

### By Priority
```jql
priority = High
priority IN (High, Highest)
priority >= High
```

### By Dates
```jql
created >= -7d
updated >= -2w
duedate <= now()
```

### Complex Queries
```jql
project = ABC AND status = "In Progress" AND assignee = currentUser()
type = Bug AND priority >= High AND status != Done
project = XYZ AND sprint in openSprints() AND assignee is not EMPTY
```

## Output Artifacts

### Individual Issue Caches

Each found issue is cached at: `cache/jira/{PROJECT}/{ISSUE_KEY}/`

| File | Description |
|------|-------------|
| `{ISSUE_KEY}.json` | Raw API response |
| `.meta.json` | Metadata (summary, status, type) |

### Search Summary Report

Saved to: `cache/jira/_searches/search-{DATE}-{slug}.md`

**Structure**:
```markdown
# Search Results — {JQL}

**Date**: {ISO_DATE}
**Results**: {COUNT} issues

## Summary by Status
- In Progress: 15
- To Do: 10
- In Review: 5

## Summary by Type
- Story: 20  
- Bug: 8
- Task: 2

## Summary by Assignee
- Jane Smith: 12
- John Doe: 8
- Unassigned: 10

## Top Issues
1. ABC-123: Implement authentication
2. ABC-124: Fix login redirect
3. ABC-125: Add password reset

## Full Results
[Table of all issues with key, summary, status, assignee, priority]
```

## CLI Commands

All examples below use the direct `atl` form. If `atl` is not on PATH, prefix with `cd tools && npm run atl --`.

### Basic Search

```bash
atl j search "project = ABC"
```

### With Limit

```bash
atl j search "project = ABC" --max 100
```

### Specific Fields Only

```bash
atl j search "project = ABC" --fields=summary,status,assignee
```

## Reading Search Results

### Find Latest Search Summary

```javascript
const summaryPath = await findLatestSearchSummary(); // cache/jira/_searches/search-*.md
```

### Parse Search Count

```javascript
const summary = await read_file({ filePath: summaryPath, startLine: 1, endLine: 500 });
const lines = summary.split('\n');
const countLine = lines.find(l => l.includes('**Results**:'));
const count = parseInt(countLine.match(/\d+/)[0]);
```

### Read Individual Issues

```javascript
// After search, issues are cached individually
const issueKey = "ABC-123";
const projectKey = issueKey.split('-')[0];
const jsonPath = `cache/jira/${projectKey}/${issueKey}/${issueKey}.json`;

const issue = JSON.parse(await read_file({ 
  filePath: jsonPath, 
  startLine: 1, 
  endLine: 1000 
}));
```

## Example Directory Structure

```
cache/jira/
├── ABC/
│   ├── ABC-123/
│   │   ├── ABC-123.json
│   │   └── .meta.json
│   ├── ABC-124/
│   │   ├── ABC-124.json
│   │   └── .meta.json
└── _searches/
    ├── search-2026-05-05-project-abc.md
    └── search-2026-05-04-my-issues.md
```
