# Glossary

> Terminology and definitions for Atlassian CLI concepts

---

## Atlassian Concepts

### Issue
A Jira ticket representing work to be done. Types include:
- **Story**: User-facing feature
- **Bug**: Defect to fix
- **Epic**: Large feature containing multiple stories
- **Task**: Technical or administrative work
- **Sub-task**: Child of another issue

### Issue Key
Unique identifier for a Jira issue in format `PROJECT-NUMBER` (e.g., `PROJ-1234`).

### JQL (Jira Query Language)
A structured language for searching Jira issues. Example:
```
project = CEAJ AND status = "In Progress" AND assignee = currentUser()
```

### Project
A container for issues in Jira, identified by a key (e.g., `CEAJ`, `DIGSTART`).

### Sprint
A time-boxed iteration (usually 2 weeks) for completing work.

### Epic
A large body of work that can be broken into smaller stories.

### Confluence Page
A wiki-style document in Confluence, identified by numeric page ID.

### Space
A container for Confluence pages, identified by a space key (e.g., `CPBDST`).

### Personal Access Token (PAT)
A secure token for API authentication, replacing username/password.

---

## CLI Concepts

### Global CLI
The `atl` command installed globally via `npm link`, accessible from any directory.

### Cache
Local storage of fetched data to reduce API calls and speed up subsequent requests.

### Fresh Fetch
Using `--fresh` flag to bypass cache and fetch directly from API.

### Output Directory
Where fetched markdown files are saved (default: `./docs`).

### Workspace Root
The parent directory containing all repositories, where `.env` file lives.

---

## File Formats

### Markdown (.md)
Human-readable text format used for documentation and cached content.

### JSON (.json)
Structured data format for raw API responses and metadata.

### JSONL (.jsonl)
JSON Lines format - one JSON object per line, used for API logs.

### .env
Environment variable file containing configuration and secrets.

---

## API Terms

### REST API
The HTTP-based interface for programmatic access to Jira/Confluence.

### Endpoint
A specific URL path for an API resource (e.g., `/rest/api/2/issue/{issueKey}`).

### Rate Limit
Maximum number of API requests allowed in a time period (usually per minute).

### Bearer Token
Authentication method using a token in the HTTP Authorization header.

---

## Status Values

### Jira Issue Statuses (Common)
- **To Do** / **Open**: Work not started
- **In Progress**: Currently being worked on
- **In Review**: Code review or QA
- **Done** / **Closed**: Work completed
- **Blocked**: Cannot proceed due to dependency

### Jira Priority Levels
- **Blocker**: Prevents any work
- **Critical**: Urgent fix needed
- **Major**: High priority
- **Minor**: Low priority
- **Trivial**: Optional or cosmetic

---

## Commands Reference

| Command | Alias | Description |
|---------|-------|-------------|
| `atl jira` | `atl j` | Jira operations |
| `atl confluence` | `atl c` | Confluence operations |
| `atl auth` | - | Authentication management |
| `atl cache` | - | Cache management |
| `atl init` | - | Configuration wizard |
| `atl help` | - | Show help |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JIRA_URL` | Jira instance URL |
| `JIRA_TOKEN` | Jira PAT |
| `CONFLUENCE_URL` | Confluence instance URL |
| `CONFLUENCE_TOKEN` | Confluence PAT |
| `ATLASSIAN_URL` | Shared URL (fallback) |
| `ATLASSIAN_TOKEN` | Shared token (fallback) |
| `OUTPUT_DIR` | Output directory for docs |
| `LOG_LEVEL` | Logging verbosity |

---

## Related Terms

- **GitHub Copilot**: AI coding assistant
- **Skills**: AI capabilities defined in SKILL.md files
- **EasyApply**: TD Bank's unified application platform
- **TD**: Toronto-Dominion Bank

---

**See Also**: [COMMAND-REFERENCE.md](COMMAND-REFERENCE.md), [FAQ.md](FAQ.md)
