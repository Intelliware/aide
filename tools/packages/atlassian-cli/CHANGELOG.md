# Changelog

All notable changes to Atlassian CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-04-15 (Pre-Launch)

### Status
🚧 **Pre-Launch Preparation** - 85% ready for release

### Added
- Four GitHub Copilot skills operational
  - `jira-get` - Fetch individual Jira issues
  - `confluence-fetch` - Fetch Confluence pages
  - `jira-analyze-epic` - Analyze epic progress
  - `jira-compare-issues` - Compare multiple issues
- Pre-launch checklist document
- Next skills roadmap document
- Implementation summary document
- Comprehensive troubleshooting guide (18 common issues)
- Example conversations for jira-get skill (9 examples)
- Example conversations for confluence-fetch skill (10 examples)
- Enhanced error handler utility with 8 error types
- Jest test framework configuration
- Unit tests for cache and markdown utilities
- Test fixtures for Jira issues

### Changed
- Version number reset to 0.0.1 for MVP launch
- Skills documentation updated to use correct CLI commands (`atl j` instead of `npm run atl:issue`)
- Confluence command paths corrected in all docs
- Error messages improved with actionable suggestions

### Fixed
- Documentation inconsistencies between skills and CLI
- npm script references that don't exist
- Command paths in skill documentation
- Authentication command references (atl auth login)

### Known Issues
- ❌ Unit tests not yet executed (infrastructure ready)
- ❌ Skills not end-to-end tested with GitHub Copilot
- ⚠️  0% test coverage (tests written, need execution)

### Completed This Sprint
✅ Confluence command verification  
✅ Documentation consistency fixes  
✅ Unit test infrastructure  
✅ Install skills script (verified complete)  
✅ Example conversations  
✅ Troubleshooting guide  
✅ Enhanced error handling  

### Remaining Before Launch
- End-to-end skill testing (3 hours)
- Execute and validate unit tests (1 hour)
- Integration testing (2 hours)
- Bug fixes from testing

**Target Launch Date**: April 20, 2026  
**Estimated Hours to Launch**: 6-7 hours

## [0.1.5] - 2026-04-14

### Added
- Issue creation with interactive prompts and templates
- Status transition with mandatory field validation
- Velocity tracking with auto-populated date fields
- Project-specific status transition configurations
- WRITE-OPERATIONS.md comprehensive guide

### Changed
- Updated COMMAND-REFERENCE.md with write operations
- Enhanced README.md with write operations section

## [0.1.0] - 2026-03-15

### Added
- Initial release
- Jira issue fetching with caching
- Confluence page fetching with caching
- Smart cache system with metadata tracking
- Multi-project support with field mappings
- Interactive setup wizard
- PAT authentication
- Workspace-level configuration
- Related items fetching (subtasks, links, epic)
- Markdown conversion for all outputs
- CLI interface with short commands (`atl j`, `atl c`)

### Documentation
- README.md - Overview and quick start
- SETUP-ATL-CLI.md - Installation and configuration guide
- USAGE.md - How to use the CLI
- COMMAND-REFERENCE.md - Complete command reference
- OUTPUT-FORMAT.md - Markdown format examples
- MULTI-PROJECT.md - Multi-project architecture guide

## [Unreleased]

### Planned for v0.2.0
- JQL query support
- Update issue fields
- Add comments
- Link/unlink issues
- AI skills for GitHub Copilot

[0.1.5]: https://github.com/yourorg/atlassian-cli/releases/tag/v0.1.5
[0.1.0]: https://github.com/yourorg/atlassian-cli/releases/tag/v0.1.0
