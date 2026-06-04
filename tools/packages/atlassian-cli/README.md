# Atlassian CLI

> A command-line tool for caching raw Confluence pages and Jira issues as JSON with smart local caching, so agents can generate markdown analysis from the full response when needed.

## ✨ Features

- 📄 **Confluence Cache** - Save pages, spaces, and page trees as raw JSON for agent analysis
- 🎫 **Jira Cache** - Save issues, epics, and JQL query results as raw JSON for agent analysis  
- ✏️ **Jira Create** - Create new issues with project-specific field mappings
- 🔄 **Status Updates** - Update issue status with mandatory field validation
- 📊 **Velocity Tracking** - Auto-track start/end dates for velocity measurement
- 🔗 **Related Items** - Automatically fetch all related Jira issues and Confluence pages
- 💾 **Smart Caching** - Local JSON storage with flag-based control
- 🔐 **Secure Auth** - PAT (Personal Access Token) authentication
- ⚡ **Fast Access** - Reuse local JSON artifacts or fetch fresh data on demand
- 🎯 **Short Commands** - `atl j` for Jira, `atl c` for Confluence
- 🏢 **Workspace Integration** - Shared .env at workspace root for all tools
- 🔀 **Multi-Project Support** - Project-specific field mappings and agent-authored analysis workflows
- 🤖 **AI Skills** - Built-in skills for GitHub Copilot and AI agents

---

## 📚 Documentation

### Getting Started
- **[SETUP-ATL-CLI.md](SETUP-ATL-CLI.md)** - Complete installation and configuration guide
- **[docs/USAGE.md](docs/USAGE.md)** - How to use the CLI to fetch issues and pages
- **[docs/COMMAND-REFERENCE.md](docs/COMMAND-REFERENCE.md)** - Complete command reference

### Advanced Topics
- **[docs/WRITE-OPERATIONS.md](docs/WRITE-OPERATIONS.md)** - Creating issues and updating status
- **[docs/MULTI-PROJECT.md](docs/MULTI-PROJECT.md)** - Multi-project setup and field mappings
- **[docs/OUTPUT-FORMAT.md](docs/OUTPUT-FORMAT.md)** - Example cached artifact structure and analysis workflow
- **[AI-INTEGRATION.md](AI-INTEGRATION.md)** - AI skills and GitHub Copilot integration

### Reference
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[docs/FEATURES.md](docs/FEATURES.md)** - Current features and roadmap

---

## 🚀 Quick Start

### For AI Agents

**When a user asks to install the Atlassian CLI**, see **[SETUP-ATL-CLI.md](SETUP-ATL-CLI.md)** for complete step-by-step instructions.

### For Users

**Prerequisites:**
- Workspace .env configured with tokens (see [workspace setup](../../SETUP-WORKSPACE.md))
- Node.js 14+ installed

**Install:**
```bash
# From tools/atlassian-cli directory
npm install
npm link  # Makes 'atl' command available globally
```

3. **Start fetching**:
   ```bash
   # Global CLI (works from any directory)
   atl j issue PROJ-123
   atl c page 3309101741
   
   # From workspace root (convenience scripts)
   npm run atl:issue -- PROJ-123
   npm run atl:page -- 3309101741
   
   # From atlassian-cli directory
   npm run issue -- PROJ-123
   npm run page -- 3309101741
   ```

**👉 See [SETUP.md](SETUP-ATL-CLI.md) for detailed setup-atl-cli instructions**

**👉 See [USAGE.md](USAGE.md) for complete usage guide**

---

## 💡 Usage Examples

### Three Ways to Execute Commands

**1. Global CLI** (Recommended - works from any directory):
```bash
atl j issue PROJ-123
atl c page 3309101741
atl cache status
```

**2. Workspace Scripts** (from workspace root):
```bash
npm run atl:issue -- PROJ-123
npm run atl:page -- 3309101741
npm run atl:related -- PROJ-123
```

**3. Direct Scripts** (from atlassian-cli directory):
```bash
cd tools/atlassian-cli
npm run issue -- PROJ-123
npm run page -- 3309101741
npm run related -- PROJ-123
```

### Read Operations

```bash
# Fetch single Jira issue
atl j issue PROJ-123

# Fetch issue with all related items (subtasks, links, specs)
atl j related PROJ-123

# Fetch Confluence page
atl c page 3309101741

# Fetch from URL
atl c url "https://confluence.example.com/pages/123456"
```

### Write Operations

```bash
# Create new issue (interactive, from atlassian-cli directory)
npm run create -- CEAJ

# Create from template (global CLI)
atl j create CEAJ --template user-story

# Update issue status (interactive, from atlassian-cli directory)
npm run status -- PROJ-1234

# Direct status change (global CLI)
atl j transition PROJ-1234 --status "In Progress"

# Update status with comment (global CLI)
atl j status PROJ-1234 -s "Done" -c "Implementation complete"
```

**👉 See [docs/WRITE-OPERATIONS.md](docs/WRITE-OPERATIONS.md) for detailed guide on creating and updating issues**

**👉 See [docs/USAGE.md](docs/USAGE.md) for workflows, options, and advanced usage**

**🤖 Using with AI Agents**

After setup, AI agents can fetch Jira issues directly:

```bash
# AI agents can invoke the skill
@jira-get PROJ-123

# Or just ask naturally
"Fetch Jira issue PROJ-123"
"What are the acceptance criteria for PROJ-123?"
```

**👉 See [AI-INTEGRATION.md](AI-INTEGRATION.md) for AI skills documentation**

---

---

## 📦 Architecture

**Project Structure:**

```
atlassian-cli/
├── bin/
│   └── atl.js                   # CLI entry point
├── src/
│   ├── api/                     # API clients (Confluence & Jira)
│   ├── commands/                # CLI command handlers
│   ├── core/                    # Shared business logic
│   ├── utils/                   # Utilities (cache, markdown, env-loader)
│   └── standalone/              # Standalone scripts for direct invocation
├── skills/                      # AI skills for GitHub Copilot
│   ├── fetch-jira-issue/        # Fetch Jira issue skill
│   └── README.md                # Skills documentation
├── setup.js                     # Interactive setup wizard
├── install-skills.js            # Install AI skills to .github/skills/
├── package.json                 # Dependencies
├── .env.example                 # Configuration template
├── SETUP.md                     # Setup guide
├── USAGE.md                     # Usage guide
├── COMMAND-REFERENCE.md         # Command reference
└── README.md                    # This file
```

**Key Design Principles:**
- **DRY**: Core logic in `src/core/` shared by CLI and standalone scripts
- **Smart .env discovery**: Automatically finds workspace root
- **Workspace integration**: Shared configuration with other tools
- **Flexible usage**: CLI, standalone scripts, or programmatic import

**👉 See [SETUP.md](SETUP.md#architecture)** for detailed architecture information

---

## 📝 Output

Caches artifacts under the configured output directory at workspace root:

```
docs/
├── jira/
│   └── PROJ/
│       └── PROJ-123/
│           ├── PROJ-123.json         # Raw API response
│           ├── .meta.json            # Cache metadata
│           └── PROJ-123.analysis.md  # Optional agent-authored analysis
└── confluence/
    └── SPACE/
        └── 123456-page-title/
            ├── 123456.json           # Raw API response
            ├── .meta.json            # Cache metadata
            ├── .jira.json            # Optional Jira enrichment cache
            └── 123456.analysis.md    # Optional agent-authored analysis
```

The CLI does not mechanically convert responses into markdown anymore. Instead, agents read the cached JSON and write analysis markdown only when the user requests it.

**👉 See [docs/OUTPUT-FORMAT.md](docs/OUTPUT-FORMAT.md)** for complete output specification

---

## 🔧 Configuration

Minimal `.env` at workspace root:

```bash
# Atlassian
ATLASSIAN_URL=https://your-org.atlassian.net
ATLASSIAN_TOKEN=your_confluence_token

JIRA_URL=https://your-org.atlassian.net
JIRA_TOKEN=your_jira_token
```

**Get tokens**: https://id.atlassian.com/manage-profile/security/api-tokens

**👉 See [SETUP.md](SETUP.md)** for complete configuration guide

---

## 🔒 Security

- ✅ Never commit `.env` to version control
- ✅ Use PATs with minimum required permissions
- ✅ Rotate tokens regularly
- ✅ `.env` automatically in `.gitignore`

---

## 📄 License

MIT

---

**Version**: 0.1.5  
**Last Updated**: April 15, 2026

**📖 Documentation**:
- [SETUP-ATL-CLI.md](SETUP-ATL-CLI.md) - Complete setup guide  
- [docs/USAGE.md](docs/USAGE.md) - How to use guide  
- [docs/COMMAND-REFERENCE.md](docs/COMMAND-REFERENCE.md) - Command reference  
- [docs/FEATURES.md](docs/FEATURES.md) - Features and roadmap  
- [CHANGELOG.md](CHANGELOG.md) - Version history

