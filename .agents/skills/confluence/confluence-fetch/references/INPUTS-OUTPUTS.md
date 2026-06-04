# confluence-fetch — Inputs & Outputs

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageId` | string/number | Yes | Confluence page ID |
| `--with-jira` | flag | No | Fetch live Jira issue data |
| `--fresh` | flag | No | Force fresh fetch, bypass cache |

## Output Artifacts

**Cache location**: `cache/confluence/{SPACE}/{PAGE_ID}/`

| File | Description |
|------|-------------|
| `{PAGE_ID}.json` | Raw Confluence API response |
| `.meta.json` | Page metadata (title, space, version, URL, fetched_at) |
| `.jira.json` | Jira enrichment data (optional, created with `--with-jira`) |

## CLI Commands

```bash
# Basic fetch
atl c page {PAGE_ID}

# With Jira enrichment
atl c page {PAGE_ID} --with-jira

# Force fresh
atl c page {PAGE_ID} --fresh

# Refresh only Jira data
atl c refresh-jira {PAGE_ID}

# By URL
atl c url https://confluence.example.com/pages/{PAGE_ID}
```

## Cache Status Indicators

| Pattern | Meaning |
|---------|---------|
| `"✓ Cache is up to date!"` | Using cached version |
| `"⚠ Remote has been updated (vX → vY)"` | Fresh copy fetched |
| `"🔄 Fetching Confluence page"` | First fetch |

Always communicate cache status to user.
