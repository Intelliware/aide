# Atlassian CLI Documentation

Complete documentation for the Atlassian CLI tool.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Usage Guides](#usage-guides)
3. [Advanced Topics](#advanced-topics)
4. [Reference](#reference)

---

## Getting Started

Start here if you're new to Atlassian CLI:

### [Setup Guide](../SETUP-ATL-CLI.md)
Complete installation and configuration guide for both AI agents and users. Covers:
- Installation steps
- Authentication setup (PAT tokens)
- Workspace configuration
- Verification and testing

### [Quick Start](../README.md#quick-start)
Get up and running in minutes with the essentials.

---

## Usage Guides

### [Usage Guide](USAGE.md)
How to use the CLI to fetch and manage Atlassian content:
- Fetching Jira issues
- Fetching Confluence pages
- Related items and dependencies
- Cache management
- Common workflows

### [Write Operations Guide](WRITE-OPERATIONS.md)
Creating and updating Jira issues:
- Creating new issues
- Updating issue status
- Field validation and mappings
- Velocity tracking
- Interactive workflows

---

## Advanced Topics

### [Multi-Project Setup](MULTI-PROJECT.md)
Configure the CLI for multiple projects:
- Project-specific field mappings
- Field mapping generator
- Custom markdown templates
- Configuration inheritance

### [AI Integration Guide](AI-INTEGRATION.md)
Integrate with GitHub Copilot and AI agents:
- GitHub Copilot skills
- Natural language issue fetching
- Structured output formats
- AI workflow patterns
- Integration examples

### [Output Format](OUTPUT-FORMAT.md)
Understanding the JSON cache format:
- Cache file structure (JSON + .meta.json)
- Agent-generated analysis files
- Cache refresh behaviour
- Field mapping reference

---

## Reference

### [Command Reference](COMMAND-REFERENCE.md)
Complete reference for all CLI commands:
- Jira commands (read/write)
- Confluence commands
- Cache commands
- Auth commands
- Global options

### [Features & Roadmap](FEATURES.md)
Current features and future plans:
- Implemented features (v0.1.5)
- Planned features (Q2-Q4 2026)
- Vision and success metrics

### [Changelog](../CHANGELOG.md)
Version history and changes:
- Release notes
- Breaking changes
- Migration guides

---

## Quick Links

| Task | Documentation |
|------|---------------|
| Install the CLI | [Setup Guide](../SETUP-ATL-CLI.md) |
| Fetch my first issue | [Usage Guide](USAGE.md#fetch-single-issue) |
| Create a new issue | [Write Operations](WRITE-OPERATIONS.md#creating-issues) |
| Update issue status | [Write Operations](WRITE-OPERATIONS.md#updating-status) |
| Configure for multiple projects | [Multi-Project Guide](MULTI-PROJECT.md) |
| Use with GitHub Copilot | [AI Integration](AI-INTEGRATION.md) |
| Find a specific command | [Command Reference](COMMAND-REFERENCE.md) |
| See what's planned | [Features & Roadmap](FEATURES.md) |

---

## Need Help?

- **Setup Issues**: See [Setup Guide](../SETUP-ATL-CLI.md#troubleshooting)
- **Command Questions**: See [Command Reference](COMMAND-REFERENCE.md)
- **Integration Help**: See [AI Integration Guide](AI-INTEGRATION.md#troubleshooting)
- **Feature Requests**: See [Features & Roadmap](FEATURES.md) and submit via team channels

---

**Documentation Version**: 1.0  
**Last Updated**: April 15, 2026  
**Maintained By**: Development Team
