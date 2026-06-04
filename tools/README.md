# Workspace CLI Tools

Command-line tools for integrating with Atlassian (Jira/Confluence) and SharePoint. Built as an npm workspace monorepo with shared dependencies and utilities.

## 📦 What's Included

- **`atlassian-cli`** (`atl`) - Fetch Jira issues and Confluence pages
- **`sharepoint-cli`** (`spt`) - Upload/download SharePoint documents

All tools share common utilities for config management, logging, validation, and error handling.

## 🚀 Installation

```bash
cd tools
npm install
```

This installs both CLIs and their shared dependencies.

## 💡 Usage

Two ways to run the CLIs:

### Method 1: npm scripts (Recommended)

Run from the `tools/` directory without global installation:

```bash
cd tools

# Atlassian CLI
npm run atl -- jira ABC-123
npm run atl -- confluence page PAGE-ID

# SharePoint CLI  
npm run spt -- upload file.pdf --site <url> --folder "/Documents"
npm run spt -- list --site <url> --folder "/Documents"
```

### Method 2: Global CLI (Optional)

Link the commands globally (requires permissions):

```bash
npm run link-all

# Then use from anywhere
atl jira ABC-123
spt status
```

## 📖 Command Reference

### Atlassian CLI (`atl`)

```bash
# Authentication
atl auth login
atl auth status

# Jira
atl jira <issue-key>                    # Fetch single issue
atl jira search "<jql-query>"           # Search with JQL
atl jira create                         # Create new issue
atl jira transition <key>               # Update status

# Confluence
atl confluence page <page-id>           # Fetch page
atl confluence url <url>                # Fetch from URL
atl confluence tree <page-id>           # Get page tree
```

### SharePoint CLI (`spt`)

```bash
# Status
spt status                              # Check configuration
spt platform <url>                      # Identify SharePoint type

# File Operations
spt upload <file> --site <url> --folder <path>
spt download <url> --output <path>
spt list --site <url> --folder <path>

# Document Conversion
spt doc-to-md <file>                    # Convert .docx to markdown
spt pdf-to-md <file>                    # Convert .pdf to markdown
spt excel-to-md <file>                  # Convert .xlsx to markdown
```

## 🛠️ Workspace Commands

Run these from the `tools/` directory:

```bash
npm run atl -- <command>     # Run Atlassian CLI
npm run spt -- <command>     # Run SharePoint CLI
npm run link-all             # Link CLIs globally (optional)
npm run unlink-all           # Unlink all CLIs
npm test                     # Run all tests
npm run clean                # Remove all node_modules
```

## 🔐 Configuration

Create a `.env` file in the workspace root:

```bash
# Atlassian
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your-token
CONFLUENCE_EMAIL=your.email@company.com
CONFLUENCE_API_TOKEN=your-token

# SharePoint (TD Internal)
SHAREPOINT_TD_USERNAME=your.username
SHAREPOINT_TD_PASSWORD=your-password

# SharePoint (Microsoft 365)
SHAREPOINT_M365_TOKEN=your-bearer-token

# Optional: Logging
API_LOGGING=false           # Set to true to log API calls
LOG_LEVEL=info
```

## 📚 Documentation

Detailed documentation for each CLI:

- **Atlassian CLI**: [packages/atlassian-cli/README.md](./packages/atlassian-cli/README.md)
- **SharePoint CLI**: [packages/sharepoint-cli/README.md](./packages/sharepoint-cli/README.md)
- **Shared Utils**: [packages/shared-utils/README.md](./packages/shared-utils/README.md)

## 🚦 Getting Started

For guided installation and setup, see [tools-install.prompt.md](./tools-install.prompt.md) (agent workflow).

Quick start:
1. `cd tools && npm install`
2. Set up authentication for each CLI you plan to use
3. Test with `npm run atl -- --version` (or `spt`)
4. See `tools/README.md` and each package's `README.md` for command reference
