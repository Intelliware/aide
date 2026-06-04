# Changelog

All notable changes to the SharePoint CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-17

### Added

#### Core Features
- Initial release of SharePoint CLI (`spt` command)
- Support for TD Internal SharePoint (myteam.td.com)
- Support for Microsoft 365 SharePoint (*.sharepoint.com)
- Cross-platform support (Windows, macOS, Linux)

#### Operations
- `spt upload` - Upload files to SharePoint
- `spt download` - Download files from SharePoint
- `spt list` - List files in SharePoint folders
- `spt status` - Check configuration and status
- `spt platform` - Identify SharePoint platform from URL

#### Authentication
- NTLM authentication for TD Internal SharePoint
- Bearer token authentication for Microsoft 365 SharePoint
- Encrypted credential storage using `conf`
- Support for .env configuration

#### Architecture
- Monorepo structure with npm workspaces
- Shared utilities package (`@ea-workspace/shared-utils`)
- Base client pattern with platform-specific implementations
- TD Internal Client (SharePoint REST API)
- Microsoft 365 Client (Microsoft Graph API v1.0)
- Client Factory for platform auto-detection

#### Security
- Encrypted credential storage at rest
- HTTPS-only connections
- Credential redaction in logs
- Input validation and sanitization
- Path traversal prevention
- File size validation (250 MB limit)

#### Developer Experience
- Colored terminal output with `chalk`
- Clear error messages
- Comprehensive help documentation
- CLI built with `commander`
- Logging with `winston`

#### Documentation
- Complete README with examples
- GitHub Copilot skill (`sharepoint-manage`)
- Inline JSDoc comments
- Platform-specific notes

### Technical Details

#### Dependencies
- axios ^1.6.0 (HTTP client)
- axios-ntlm ^1.4.6 (NTLM authentication)
- chalk ^4.1.2 (Terminal colors)
- commander ^11.1.0 (CLI framework)
- conf ^10.2.0 (Encrypted config storage)
- dotenv ^17.4.1 (Environment variables)
- winston ^3.11.0 (Logging)

#### Shared Dependencies (via monorepo)
- @ea-workspace/shared-utils ^1.0.0
  - ConfigManager
  - Logger  
  - Validators
  - Error Handler

#### API Versions
- SharePoint REST API (for TD Internal)
- Microsoft Graph API v1.0 (for Microsoft 365)

### Known Limitations

- Maximum file size: 250 MB
- No batch operations (single file at a time)
- No recursive folder operations
- No delete operations
- Basic metadata support only
- List operations are shallow (non-recursive)

### Future Roadmap

See [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md) for upcoming features:
- Phase 2: Search and metadata operations
- Phase 3: Advanced features (batch, recursive, chunked upload)
- Phase 4: Delete and move operations

---

## [Unreleased]

### Planned for 0.2.0

- Advanced search with filters
- Recursive folder operations
- Batch upload/download
- Enhanced metadata management
- Folder creation with recursive parent creation

### Planned for 0.3.0

- Chunked upload for files >250 MB
- File versioning support
- Delete operations
- Move/copy operations
- Progress indicators for large operations

---

## Development Notes

### Monorepo Migration

This release includes a major architectural change:
- Migrated from standalone CLI to npm workspaces monorepo
- Shared utilities extracted to `@ea-workspace/shared-utils`
- Reduced duplicate dependencies (200 MB → 50 MB, 75% reduction)
- All CLIs (atlassian, figma, sharepoint) now share common code

### Breaking Changes

None - this is the initial release.

### Migration from Old Structure

Old standalone CLIs have been consolidated:
- `tools/atlassian-cli/` → `tools/packages/atlassian-cli/`
- `tools/figma-cli/` → `tools/packages/figma-cli/`
- `tools/sharepoint-cli/` → `tools/packages/sharepoint-cli/` (new)

All CLI commands remain unchanged:
- `atl` - Atlassian CLI
- `figma` - Figma CLI
- `spt` - SharePoint CLI

---

## Contributors

- EasyApply Team @ TD

---

## License

MIT © EasyApply Team

---

[0.1.0]: https://github.com/TD-Universe/easyapply-ai-workspace/releases/tag/sharepoint-cli-v0.1.0
