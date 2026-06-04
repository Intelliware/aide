# confluence-fetch — Overview

## Purpose

Fetch Confluence pages using the Atlassian CLI tool, cache raw JSON and metadata, enable agent analysis of page content.

## When to Use

- User mentions a Confluence page ID or URL
- User asks about documentation, specs, or design docs
- Developer needs architectural context during coding

## When NOT to Use

- **Extracting entire packages** → Use `confluence-extract-package` instead
- **Jira issues** → Use `jira-get` instead

## Position in Workflow

Foundational skill for Confluence access:
1. **Precedes** `confluence-extract-package` — provides page cache
2. **Supports** design/implementation by fetching specs on-demand
3. **Maintains** cache at `cache/confluence/{SPACE}/{PAGE_ID}/`

## Key Features

1. **Cache-first** strategy (fast, minimal API calls)
2. **Optional Jira enrichment** (`--with-jira` flag fetches live issue statuses)
3. **Staleness checking** (compares version numbers)
4. **Rate limit protection** (fails fast on 429, no auto-retry)

## Cache Strategy

**Default**: Uses cached version (no `--with-jira`)  
**Jira enrichment**: Add `--with-jira` flag  
**Fresh fetch**: Add `--fresh` flag  
**Cache location**: `cache/confluence/{SPACE}/{PAGE_ID}/`

Always report cache status to user.

## Best Practices

1. Use cache by default (avoid `--fresh` unless needed)
2. Skip `--with-jira` unless necessary (prevents rate limits)
3. Read JSON directly (agent interprets Confluence Storage Format)
4. Report cache status in every response
5. On 429 errors, wait 5-10 min before retry
