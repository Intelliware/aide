# jira-get — Overview

## Purpose

Fetch individual Jira issues using the Atlassian CLI tool, cache the raw JSON response and metadata, and enable agent analysis of issue content.

## When to Use

Use this skill when:
- User asks to "fetch a Jira ticket/issue"
- User provides a Jira issue key (e.g., PROJ-123, ABC-789)
- User wants to analyze requirements from Jira
- User asks about issue details, acceptance criteria, or related items
- You need to read issue descriptions, comments, or metadata

## When NOT to Use

- **Searching for multiple issues** → Use `jira-search` skill instead
- **Extracting full requirements packages** → Use `jira-extract-requirements` skill instead
- **Analyzing epics with all children** → Use requirements extraction for comprehensive packages

## Position in Workflow

`jira-get` is a foundational skill that:
1. **Precedes** `jira-extract-requirements` — provides the raw issue cache that extraction skills read
2. **Works alongside** `jira-search` — get individual issues after finding them via search
3. **Supports** all Jira-dependent workflows by maintaining the cache at `cache/jira/{PROJECT}/{ISSUE_KEY}/`

## Cache Strategy

**Default behavior**: Uses cached version if available (fast, no API call)

**Fresh fetch**: Add `--fresh` flag to bypass cache and get latest data

**Cache location**: `cache/jira/{PROJECT}/{ISSUE_KEY}/`

**Cache contents**:
- `{ISSUE_KEY}.json` — Raw Jira API response
- `.meta.json` — Issue metadata (summary, status, type, updated, links, fetched_at)
- `{ISSUE_KEY}.analysis.md` — Optional agent-generated analysis (not created by CLI)

**Always report cache status** to the user:
- ✅ "Retrieved from cache (up to date with server)"
- ✅ "Fresh copy fetched (remote was updated)"
- ✅ "First fetch from Jira server"

## Error Handling

| Error | Response |
|-------|----------|
| **404 Not Found** | Issue doesn't exist, verify key format |
| **401 Auth Failed** | Guide to check .env configuration and tokens |
| **CLI Not Found** | Direct user to setup guide |
| **Network Error** | Suggest retry or use cached version |

## Best Practices

1. **Validate issue key format** before fetching (`^[A-Z]{2,}-\d+$`)
2. **Use cache by default** for speed
3. **Force fresh** only when user asks for "latest" or "current"
4. **Handle errors gracefully** with helpful messages
5. **Read the JSON response directly** rather than depending on lossy pre-rendered markdown
6. **Check cache age** — warn if > 7 days old
