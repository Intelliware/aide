# Atlassian CLI - Features & Roadmap

> Complete overview of implemented features and planned enhancements

**Current Version**: 0.1.5  
**Last Updated**: April 15, 2026

---

## Table of Contents

- [Current Features](#current-features)
  - [Jira Integration](#jira-integration)
  - [Confluence Integration](#confluence-integration)
  - [Write Operations](#write-operations)
  - [Cache System](#cache-system)
  - [Multi-Project Support](#multi-project-support)
  - [AI Integration](#ai-integration)
- [Planned Features](#planned-features)
  - [Coming Soon (Q2 2026)](#coming-soon-q2-2026)
  - [Future Enhancements](#future-enhancements)
- [Vision](#vision)

---

## Current Features

### Jira Integration

**Fetch Issues** ✅
- Fetch single issues by key (e.g., `PROJ-123`)
- Extract issue keys from Jira URLs
- Fetch all related items (subtasks, linked issues, epic, parent)
- Fetch subtasks-only mode
- Comment extraction with markdown conversion
- Attachment metadata capture
- Smart caching with cache-bypass option (`--fresh`)

**Create Issues** ✅
- Interactive issue creation with field prompts
- Project-specific field mapping support
- Template-based creation
- Custom field population
- Validation and error handling

**Update Status** ✅
- Interactive status transitions with available options
- Project-specific transition configurations
- Mandatory field validation per status
- Auto-tracking of start/end dates for velocity measurement
- Comment support on transitions
- Direct status change mode

### Confluence Integration

**Fetch Pages** ✅
- Fetch pages by ID or URL
- Convert storage format to Markdown
- Preserve formatting (headers, lists, code blocks, tables)
- Cache pages locally
- Extract page metadata

### Write Operations

**Issue Creation** ✅
- Create stories, bugs, tasks, epics
- Project-specific field mappings
- Custom field support
- Template-based workflow

**Status Management** ✅
- Transition issues through workflow
- Mandatory field validation
- Auto-populate date fields (NOW)
- Validation rules (assignee required, subtasks closed, etc.)

**Velocity Tracking** ✅
- Auto-track development start date (→ In Progress)
- Auto-track code review start/end dates
- Auto-track QA start/end dates
- Auto-track completion date (→ Done)
- Support for cycle time calculation

### Cache System

**Smart Caching** ✅
- Local markdown storage in `atl/` directory
- Cache metadata tracking (fetch timestamp, TTL)
- Cache status reporting and listing
- Cache clear functionality
- Flag-based control (`--fresh` to bypass)
- Auto-linking to cached related items

### Multi-Project Support

**Project-Specific Configuration** ✅
- Field mappings per project (`field-mapping-{PROJECT}.json`)
- Status transition configs per project
- Field mapping generator from sample issues
- Optional custom markdown templates
- Fallback to default configurations

### AI Integration

**GitHub Copilot Skills** ✅
- `jira-get` - Fetch individual issues
- `atlassian-analyze-epic` - Analyze epics with child stories
- `atlassian-compare-issues` - Compare multiple issues
- Natural language issue fetching
- Auto-extraction of issue keys from conversation

---

## Planned Features

### Coming Soon (Q2 2026)

**JQL Query Support** 🚧 In Progress
- Execute JQL queries from CLI
- Sprint and epic query shortcuts
- Pagination for large result sets
- Saved queries
- Export formats (markdown, JSON, CSV)

**Update Issue Fields** 🚧 In Progress
- Update any standard field (assignee, priority, labels)
- Update custom fields via field mapping
- Batch field updates
- Interactive update mode

**Add Comments** 📋 Planned
- Add comments without status transitions
- Markdown to ADF conversion
- Comment from file or editor
- Support @mentions
- Visibility restrictions

**Link Issues** 📋 Planned
- Create/remove issue links
- Support all link types (blocks, relates-to, duplicates)
- Batch link operations

### Future Enhancements

**Bulk Operations** (Q3 2026)
- Fetch all issues in a sprint
- Fetch all stories in an epic
- Fetch entire Confluence spaces
- Parallel fetching with rate limiting

**Advanced Querying** (Q4 2026)
- JQL query builder
- Save and reuse queries
- Analytics and reporting
- Dependency graphs
- Velocity analysis

**Git Integration** (Q1 2027)
- Auto-fetch issue on branch creation
- Generate PR descriptions from issues
- Link commits to issues
- Auto-transition issues on PR merge

**Documentation Generation** (Q1 2027)
- Generate README from epic
- Auto-create ADRs from stories
- Generate API docs from specs
- Create test plans from acceptance criteria

**Quality & Testing** (Q2 2027)
- Generate test scenarios from acceptance criteria
- Validate code against requirements
- Track requirement completion
- Quality metrics per sprint/epic

---

## Vision

> **Mission**: Enable AI-first SDLC by providing seamless integration between Atlassian tools and AI agents, automating documentation retrieval, analysis, and workflow management.

### Key Principles

1. **AI-First Design** - Built for AI agent interaction with natural language support
2. **Developer Productivity** - Fast, cached access to requirements and documentation  
3. **Quality Focus** - Link code to requirements with validation
4. **Team Collaboration** - Shared workspace configuration and knowledge base
5. **Flexible Integration** - Works with CLI, standalone scripts, or programmatic API

### Success Metrics

- ⚡ **Speed**: <2 second access to cached issues
- 🎯 **Coverage**: 90%+ of SDLC workflows supported
- 🤖 **AI Integration**: Seamless Copilot/agent interaction
- ✅ **Quality**: Requirements traceability from Jira to code
- 👥 **Adoption**: Used daily by development teams

---

## Related Documentation

- [../README.md](../README.md) - Overview and quick start
- [../SETUP-ATL-CLI.md](../SETUP-ATL-CLI.md) - Installation and configuration  
- [USAGE.md](./USAGE.md) - How to use the CLI
- [WRITE-OPERATIONS.md](./WRITE-OPERATIONS.md) - Creating and updating issues
- [COMMAND-REFERENCE.md](./COMMAND-REFERENCE.md) - Complete command reference
- [AI-INTEGRATION.md](./AI-INTEGRATION.md) - AI skills and integration guide

---

**Version**: 1.0  
**Maintained By**: Development Team  
**Feedback**: Submit issues or suggestions via team channels
