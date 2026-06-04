# Architecture

> Technical architecture and design decisions for Atlassian CLI

---

## Overview

The Atlassian CLI is a Node.js command-line tool that provides a unified interface for interacting with Jira and Confluence APIs. It's designed for:

- **Local caching** of fetched data for offline access
- **AI integration** via GitHub Copilot skills
- **Workspace-level configuration** shared across tools
- **Clean markdown output** for human and AI consumption

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User / AI Agent                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     CLI Entry Point                          │
│                      (bin/atl.js)                           │
│   - Commander.js program                                     │
│   - Command registration                                     │
│   - Help system                                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Command Layer                             │
│              (src/commands/*.js)                            │
│   - auth: Authentication management                          │
│   - jira: Jira operations                                   │
│   - confluence: Confluence operations                        │
│   - cache: Cache management                                 │
│   - init: Configuration wizard                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     Core Layer                               │
│                 (src/core/*.js)                             │
│   - fetch-issue: Jira issue fetching                        │
│   - fetch-page: Confluence page fetching                    │
│   - create-issue: Jira issue creation                       │
│   - update-status: Status transitions                       │
│   - markdown-generator: MD output                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     API Layer                                │
│                  (src/api/*.js)                             │
│   - jira-client: Axios client for Jira REST API            │
│   - confluence-client: Axios client for Confluence API      │
│   - api-logger-integration: Request/response logging        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Atlassian APIs                              │
│   - Jira REST API v2                                        │
│   - Confluence REST API v1                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
atlassian-cli/
├── bin/
│   └── atl.js              # Entry point, Commander.js setup
│
├── src/
│   ├── api/                # API clients
│   │   ├── jira-client.js      # Jira API client
│   │   ├── confluence-client.js # Confluence API client
│   │   └── api-logger-integration.js # Logging
│   │
│   ├── commands/           # CLI commands
│   │   ├── auth.js             # atl auth login/status
│   │   ├── cache.js            # atl cache status/clear
│   │   ├── jira.js             # atl jira issue/search
│   │   ├── confluence.js       # atl confluence page/url
│   │   └── init.js             # atl init
│   │
│   ├── core/               # Business logic
│   │   ├── fetch-issue.js      # Issue fetching logic
│   │   ├── fetch-page.js       # Page fetching logic
│   │   ├── create-issue.js     # Issue creation
│   │   └── update-status.js    # Status transitions
│   │
│   ├── utils/              # Utilities
│   │   ├── env-loader.js       # .env file loading
│   │   ├── cache.js            # File-based caching
│   │   ├── logger.js           # Structured logging
│   │   ├── error-handler.js    # Error handling
│   │   └── markdown-converter.js # Confluence → MD
│   │
│   ├── field-mappings/     # Project configs
│   └── templates/          # Output templates
│
├── skills/                 # AI skills
│   ├── jira-get/
│   ├── confluence-fetch/
│   └── ...
│
├── tests/
│   ├── unit/
│   └── fixtures/
│
└── docs/                   # Documentation
```

---

## Key Design Decisions

### 1. Workspace-Level Configuration

**Decision**: Environment variables are loaded from workspace root `.env`, not local to CLI.

**Rationale**:
- Shared configuration across all workspace CLI tools
- Single source of truth for credentials
- Easier team setup (one .env to configure)

**Implementation**:
```javascript
// src/utils/env-loader.js
function getWorkspaceRoot() {
  // Traverse up to find workspace marker
  // Load .env from there
}
```

### 2. File-Based Caching

**Decision**: Cache fetched data as markdown files in `docs/` directory.

**Rationale**:
- Human-readable cached content
- Git-trackable (selectively)
- Offline access
- AI can read directly

**Structure**:
```
docs/
├── jira/
│   └── CEAJ/
│       └── PROJ-1234/
│           ├── PROJ-1234.md    # Formatted markdown
│           ├── PROJ-1234.json  # Raw API response
│           └── .meta.json      # Fetch metadata
└── confluence/
    └── CPBDST/
        └── 12345678/
            ├── 12345678.md
            └── .meta.json
```

### 3. Shared API Logger

**Decision**: Use shared/utils/api-logger.js for all API logging.

**Rationale**:
- Consistent log format across tools
- Easy to aggregate and analyze
- JSONL format for structured queries

**Log Format**:
```json
{
  "timestamp": "2026-04-16T10:30:00.000Z",
  "service": "jira",
  "endpoint": "/issue/PROJ-1234",
  "method": "GET",
  "status": 200,
  "duration": 145
}
```

### 4. Commander.js for CLI

**Decision**: Use Commander.js for CLI argument parsing.

**Rationale**:
- Industry standard for Node.js CLIs
- Built-in help generation
- Supports subcommands and aliases
- Easy to extend

### 5. Axios for HTTP

**Decision**: Use Axios for HTTP requests.

**Rationale**:
- Promise-based API
- Request/response interceptors
- Automatic JSON parsing
- Widespread adoption

---

## Authentication Flow

```
┌─────────────────────┐
│   User runs CLI     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Load .env from     │────▶│  Check for token    │
│  workspace root     │     │  in env vars        │
└─────────────────────┘     └──────────┬──────────┘
                                       │
           ┌───────────────────────────┴───────────────────┐
           │                                               │
           ▼                                               ▼
┌─────────────────────┐                     ┌─────────────────────┐
│   Token found       │                     │   No token          │
│   Create client     │                     │   Error + guidance  │
└──────────┬──────────┘                     └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Bearer token auth  │
│  in HTTP headers    │
└─────────────────────┘
```

---

## Error Handling Strategy

The CLI uses a structured error handling approach:

1. **Classification**: Errors are classified by type (auth, not_found, rate_limit, etc.)
2. **User Guidance**: Each error type has specific suggestions
3. **Logging**: Errors are logged with full context
4. **Graceful Exit**: Clean exit codes for scripting

```javascript
// src/utils/error-handler.js
const ErrorType = {
  AUTHENTICATION: 'authentication',
  NOT_FOUND: 'not_found',
  PERMISSION: 'permission',
  RATE_LIMIT: 'rate_limit',
  // ...
};
```

---

## AI Integration Architecture

```
┌─────────────────────┐
│  GitHub Copilot     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SKILL.md files    │
│   (skills/*.md)     │
│   - Triggers        │
│   - Instructions    │
│   - Examples        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Copilot executes  │
│   CLI commands      │
│   via terminal      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Output parsed by  │
│   Copilot for user  │
└─────────────────────┘
```

---

## Extension Points

### Adding New Commands

1. Create `src/commands/newcmd.js`
2. Export function that takes `program`
3. Register in `bin/atl.js`

### Adding New API Client

1. Create `src/api/new-client.js`
2. Follow axios client pattern
3. Add logging integration

### Custom Field Mappings

1. Add JSON in `src/field-mappings/`
2. Project-specific configurations
3. Loaded by project key

---

## Performance Considerations

- **Caching**: Avoid redundant API calls
- **Rate Limiting**: Built-in delays between requests
- **Batch Operations**: Use JQL for bulk fetches
- **Connection Reuse**: Axios keeps connections alive

---

## Security Considerations

- Tokens never logged (redacted)
- .env excluded from git
- No credentials in code
- Bearer token auth (not basic)

---

**See Also**: [CONTRIBUTING.md](CONTRIBUTING.md), [docs/SECURITY.md](SECURITY.md)
