# Atlassian CLI — AI Integration Guide

> **Last Updated**: May 2026

---

## Overview

This guide explains how AI agents use the Atlassian CLI (`atl`) to access Jira and Confluence content within the A.I.D.E. framework. Jira and Confluence integration is **optional** — the framework operates fully without it.

---

## 🚀 Quick Start

### 1. Install Skills

From the `tools/atlassian-cli` directory:

```bash
npm run install-skills
```

This will:
- Copy all skills to `.github/skills/`
- Create a skills README
- Make skills available to AI agents

### 2. Verify Installation

Check that skills are present:

```bash
ls .github/skills/
```

You should see:
- `jira-fetch/`
- `confluence-fetch/`
- `jira-analyze-epic/`
- `jira-compare-issues/`
- `jira-get/`
- `README.md`

### 3. Test with GitHub Copilot

Open GitHub Copilot chat and try:

```
Get CEAJ-123
```

Copilot should invoke the `@jira-fetch` skill and fetch the issue.

---

## 📝 Workspace Configuration

### Option 1: Automatic Skill Discovery (Recommended)

GitHub Copilot automatically discovers skills in `.github/skills/`. No additional configuration needed!

### Option 2: Explicit Skill References

Add skill references to `.github/copilot-instructions.md` for more control:

```markdown
# Project Instructions for GitHub Copilot

## Atlassian Integration

This workspace integrates with Jira and Confluence via the Atlassian CLI.

### Available Skills

- **@jira-fetch**: Fetch Jira issues by key or URL
- **@confluence-fetch**: Confluence pages by ID or URL
- **@jira-analyze-epic**: Analyze epic progress and blockers
- **@jira-compare-issues**: Compare multiple issues side-by-side
- **@jira-get**: Advanced Jira fetching with custom queries

### Jira Projects

- **CEAJ**: Easylend Application
- **OCA**: Online Credit Application

### Workflow

When a developer mentions a Jira issue (e.g., "CEAJ-123"), automatically:
1. Fetch the issue using `@jira-fetch`
2. Provide context about the story, acceptance criteria, and blockers
3. Help the developer understand requirements

### Cached Data

Issues and pages are cached in `atl/` directory:
- `atl/jira/` - Jira issues (markdown format)
- `atl/confluence/` - Confluence pages (markdown format)

Use cached data when available for faster responses.
```

---

## 🎯 Skill Usage Patterns

### @jira-fetch

**Trigger Keywords**:
- Jira issue keys (CEAJ-123, PROJ-456)
- "Get", "Fetch", "Show" + issue key
- Jira URLs

**Examples**:
```
User: Get CEAJ-123
User: Show me issue CEAJ-456
User: What's the status of CEAJ-789?
User: Fetch https://jira.example.com/browse/CEAJ-123
```

**AI Agent Flow**:
1. Detect issue key from user message
2. Run: `npm run atl:issue -- CEAJ-123`
3. Read cached file: `atl/jira/CEAJ-123.md`
4. Present relevant information

### @confluence-fetch

**Trigger Keywords**:
- Confluence page IDs
- "Get page", "Show doc", "Fetch documentation"
- Confluence URLs

**Examples**:
```
User: Get Confluence page 123456
User: Show me the API design doc
User: Fetch https://confluence.example.com/pages/123456
```

**AI Agent Flow**:
1. Detect page ID from user message
2. Run: `npm run atl:page -- 123456`
3. Read cached file: `atl/confluence/123456.md`
4. Present relevant sections

### @jira-analyze-epic

**Trigger Keywords**:
- "Analyze epic"
- "Epic status", "Epic progress"
- "Show blockers", "What's blocking"

**Examples**:
```
User: Analyze epic CEAJ-100
User: What's the progress on the authentication epic?
User: Show blockers in epic CEAJ-200
```

**AI Agent Flow**:
1. Fetch epic and all child stories
2. Calculate progress metrics
3. Identify blockers and dependencies
4. Generate comprehensive report

### @jira-compare-issues

**Trigger Keywords**:
- "Compare" + issue keys
- "Differences between"
- "What's similar"

**Examples**:
```
User: Compare CEAJ-123 and CEAJ-124
User: Show differences between CEAJ-100, CEAJ-101, CEAJ-102
User: What's similar between these bugs?
```

**AI Agent Flow**:
1. Fetch all issues to compare
2. Extract common fields
3. Identify patterns and differences
4. Generate comparison matrix and insights

---

## 🔧 Advanced Configuration

### Custom Agent Skills

Create project-specific agent skills that build on Atlassian CLI skills:

**`.github/skills/code-review-with-jira/SKILL.md`**:

```markdown
---
skillName: code-review-with-jira
description: Enhanced code review with automatic Jira context
invocationExamples:
  - Review this PR with Jira context
  - Code review for CEAJ-123
tools:
  - name: jira-fetch
  - name: read_file
---

# Code Review with Jira Context

When reviewing code:
1. Extract Jira issue key from PR title or branch name
2. Fetch issue using @jira-fetch
3. Compare code changes against acceptance criteria
4. Provide context-aware review feedback

## Example

User: "Review this PR"

AI:
1. Detects branch: `feature/CEAJ-123-oauth-implementation`
2. Fetches CEAJ-123
3. Reads acceptance criteria
4. Reviews code against requirements
5. Provides feedback highlighting criteria alignment
```

### Project-Specific Templates

Customize output templates for your team:

**`tools/atlassian-cli/src/templates/jira-template-CEAJ.hbs`**:

```handlebars
# {{key}}: {{summary}}

**Status**: {{status}}
**Type**: {{type}}
**Assignee**: {{assignee}}
**Sprint**: {{sprint}}
**Story Points**: {{storyPoints}}

## Description
{{description}}

## Acceptance Criteria
{{acceptanceCriteria}}

## Technical Notes
{{technicalNotes}}

## Definition of Done
- [ ] Code complete
- [ ] Unit tests written (90%+ coverage)
- [ ] Code review passed
- [ ] QA tested
- [ ] Documentation updated
```

### Multi-Project Configuration

For workspaces with multiple Jira projects:

**`.github/copilot-instructions.md`**:

```markdown
## Jira Projects

| Project Key | Name | Purpose |
|-------------|------|---------|
| CEAJ | Easylend Application | Main application features |
| OCA | Online Credit Application | Credit app features |
| SHARED | Shared Components | Reusable components |

## Project-Specific Field Mappings

Each project has custom field mappings:
- `tools/atlassian-cli/src/config/field-mapping-CEAJ.json`
- `tools/atlassian-cli/src/config/field-mapping-OCA.json`

When fetching issues, the correct mapping is automatically applied.
```

---

## 🎨 Structured Output Formats

### JSON Output

For AI consumption and processing:

```bash
# Generate JSON output
npm run atl:issue -- CEAJ-123 --format json > issue.json
```

**Output Format** (`issue.json`):

```json
{
  "key": "CEAJ-123",
  "summary": "Implement OAuth2 authentication",
  "status": "In Progress",
  "type": "Story",
  "priority": "High",
  "assignee": "john.doe@example.com",
  "storyPoints": 5,
  "acceptanceCriteria": [
    "Users can login with OAuth2",
    "JWT tokens generated correctly",
    "Refresh token flow works"
  ],
  "subtasks": [
    {"key": "CEAJ-124", "summary": "Setup OAuth2 client", "status": "Done"},
    {"key": "CEAJ-125", "summary": "Implement token validation", "status": "In Progress"}
  ],
  "dependencies": {
    "blocks": ["CEAJ-130"],
    "isBlockedBy": [],
    "relatesTo": ["CEAJ-140"]
  }
}
```

### YAML Output

For configuration and structured data:

```bash
npm run atl:issue -- CEAJ-123 --format yaml > issue.yaml
```

**Output Format** (`issue.yaml`):

```yaml
key: CEAJ-123
summary: Implement OAuth2 authentication
status: In Progress
type: Story
priority: High
assignee: john.doe@example.com
storyPoints: 5
acceptanceCriteria:
  - Users can login with OAuth2
  - JWT tokens generated correctly
  - Refresh token flow works
subtasks:
  - key: CEAJ-124
    summary: Setup OAuth2 client
    status: Done
  - key: CEAJ-125
    summary: Implement token validation
    status: In Progress
```

---

## 🔗 Integration Examples

### Example 1: Sprint Planning

**Scenario**: Product Owner wants to analyze sprint readiness

**Workflow**:
```
PO: "Analyze epic CEAJ-100 for sprint planning"

Copilot (using @jira-analyze-epic):
- Fetches epic and all stories
- Calculates: 12 stories, 48 points, 41.7% complete
- Identifies: 1 blocker (email service dependency)
- Recommends: Descope "Remember Me" or extend timeline

PO: "Compare the top 3 priority stories"

Copilot (using @jira-compare-issues):
- Compares CEAJ-105, CEAJ-110, CEAJ-112
- Identifies: All backend work, sequential dependencies
- Recommends: Complete in order, assign to single developer

PO: "Show me the API design doc"

Copilot (using @confluence-fetch):
- Fetches page 123456
- Displays architecture overview
- Highlights authentication flow
```

### Example 2: Code Review

**Scenario**: Developer reviewing PR for CEAJ-123

**Workflow**:
```
Dev: "Review this PR for CEAJ-123"

Copilot (using @jira-fetch):
- Fetches CEAJ-123 (OAuth2 implementation)
- Reads acceptance criteria:
  1. Users can login with OAuth2 ✓
  2. JWT tokens generated correctly ✓
  3. Refresh token flow works ✓
  4. Error handling for failures ✗

Copilot: "The PR looks good and covers 3 of 4 acceptance criteria.
Missing: Error handling for authentication failures.
Suggest adding try-catch blocks and user-friendly error messages."
```

### Example 3: Bug Triage

**Scenario**: QA triaging login bugs

**Workflow**:
```
QA: "Compare CEAJ-200, CEAJ-201, CEAJ-202 (login bugs)"

Copilot (using @jira-compare-issues):
- Compares 3 bugs
- Detects pattern: All reported April 11 (day after CEAJ-123 deployment)
- Identifies: All show OAuth2 callback errors
- Hypothesis: Regression in CEAJ-123

Copilot: "These bugs likely have the same root cause.
Recommend:
1. Investigate CEAJ-123 callback URL configuration
2. Fix root cause instead of 3 separate fixes
3. Consider hotfix if production impact is high"
```

---

## 🧪 Testing AI Skills

### Manual Testing

1. **Open GitHub Copilot Chat** in VS Code
2. **Type a skill trigger**:
   ```
   Get CEAJ-123
   ```
3. **Verify skill invocation**:
   - Check terminal for CLI command execution
   - Verify cached file created in `atl/jira/`
   - Confirm AI response includes issue details

4. **Test different scenarios**:
   - Fresh fetch: "Get latest status of CEAJ-123"
   - Related issues: "Show CEAJ-123 with all subtasks"
   - Error handling: "Get CEAJ-99999" (non-existent)

### Automated Testing

Run skill validation:

```bash
npm run test:skills
```

This will:
- Validate SKILL.md files have correct YAML frontmatter
- Check that all referenced files exist
- Verify skills are installable
- Test CLI integration

---

## 🚨 Troubleshooting

### Skill Not Found

**Problem**: Copilot says "I don't know how to do that"

**Solutions**:
1. Check skills are installed: `ls .github/skills/`
2. Reinstall: `npm run install-skills`
3. Reload VS Code window
4. Check skill naming matches frontmatter

### CLI Command Fails

**Problem**: Skill invokes CLI but command fails

**Solutions**:
1. Verify Atlassian CLI is set up: `npm run atl:status`
2. Check authentication: `npm run atl:login`
3. Test CLI manually: `npm run atl:issue -- CEAJ-123`
4. Check error logs in terminal

### Stale Cache Data

**Problem**: AI returns outdated information

**Solutions**:
1. Ask for fresh data: "Get latest status of CEAJ-123"
2. Clear cache: `npm run atl:cache clear`
3. Check cache TTL settings: `atl/.cache/CEAJ-123.json`

### Performance Issues

**Problem**: Skills slow to respond

**Solutions**:
1. Pre-fetch frequently used issues
2. Increase cache TTL for stable data
3. Use `--subtasks-only` for large epics
4. Consider local Jira instance caching

---

## 📚 Additional Resources

- [AI Skills README](skills/README.md)
- [Atlassian CLI Documentation](README.md)
- [Implementation Plan Phase 2](IMPLEMENTATION-PLAN-PHASE2.md)
- [GitHub Copilot Skills Documentation](https://docs.github.com/copilot)

---

## 📄 License

Internal Use Only - TD Bank Group

---

**Last Updated**: April 15, 2026  
**Maintained By**: Development Team, AI Enablement
