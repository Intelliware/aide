# Atlassian CLI - Write Operations Guide

> Complete guide for creating and updating Jira issues with project-specific field mappings and status transition validation

**⚠️ Important**: Write operations modify data in Jira. Always verify configurations before use in production.

---

## Table of Contents

- [Creating Issues](#creating-issues)
- [Updating Issue Status](#updating-issue-status)
- [Project-Specific Configuration](#project-specific-configuration)
- [Status Transition Rules](#status-transition-rules)
- [Field Mappings](#field-mappings)
- [Templates](#templates)
- [Velocity Tracking](#velocity-tracking)
- [Best Practices](#best-practices)

---

## Creating Issues

Create new Jira issues with project-specific field mapping support.

### Interactive Mode (Recommended)

```bash
# Using CLI
npm run atl j create CEAJ

# Using standalone script
npm run create CEAJ

# From workspace root
npm run create -- CEAJ
```

**What happens:**
1. Fetches available issue types for the project
2. Loads project-specific field mappings
3. Prompts for standard fields (summary, description, assignee, priority)
4. Optionally prompts for custom fields
5. Validates and creates the issue

### Template-Based Creation

```bash
# Use predefined template
npm run atl j create CEAJ --template user-story

# Available templates
npm run atl j create CEAJ -t user-story
npm run atl j create CEAJ -t bug
npm run atl j create CEAJ -t task
```

### Example Interactive Session

```
🎫 Creating new Jira issue in CEAJ

✔ Issue types loaded
Using field mapping for project: CEAJ

? Issue Type: Story
? Summary: Implement user login feature
? Description (opens editor): [Opens your default editor]
? Assignee: john.doe@example.com
? Priority: High
? Labels: authentication, security
? Add custom fields? Yes
? Select custom fields to populate:
  ◉ Acceptance Criteria
  ◉ Feature Statement
  ◯ Epic Link

? Acceptance Criteria: 
  - User can login with email and password
  - Invalid credentials show error message
  - Successful login redirects to dashboard

? Feature Statement: Enable users to securely access their accounts

Create this issue? Yes

✔ Issue created successfully: PROJ-1234

🔗 https://jira.example.com/browse/PROJ-1234
```

---

## Updating Issue Status

Update issue status with automatic mandatory field validation and population.

### Interactive Mode (Recommended)

```bash
# Using CLI
npm run atl j transition PROJ-1234

# Using standalone script
npm run status PROJ-1234

# From workspace root
npm run status -- PROJ-1234
```

**What happens:**
1. Fetches current issue details and available transitions
2. Loads project-specific transition configuration
3. Shows available status transitions
4. Validates transition requirements (e.g., subtasks closed)
5. Auto-populates mandatory fields (e.g., start/end dates)
6. Prompts for user-provided mandatory fields
7. Optionally adds a comment
8. Executes the transition

### Direct Status Change (Non-Interactive)

```bash
# Quick status change
npm run atl j transition PROJ-1234 --status "In Progress"

# With comment
npm run atl j transition PROJ-1234 -s "Done" -c "Implementation complete"

# Alias: status
npm run atl j status PROJ-1234 --status "In Review"
```

### Example Interactive Session

```
🔄 Updating status for PROJ-1234

✔ Issue loaded
Using transition config for project: CEAJ
Current status: To Do
Available transitions: 3

? Select new status: In Progress

✓ Auto-set Development Start Date: 2026-04-14
✓ Validation passed: Assignee is set

? Add a comment? Yes
? Comment: Starting implementation

Transition details:
  From: To Do
  To: In Progress
  Field updates:
    customfield_26906: "2026-04-14"

? Proceed with status update? Yes

✔ Status updated successfully

🔗 https://jira.example.com/browse/PROJ-1234
```

---

## Project-Specific Configuration

### Status Transition Configuration

Define mandatory fields and validations per status transition for each project.

**File**: `src/config/status-transitions-{PROJECT}.json`

**Example**: `status-transitions-CEAJ.json`

```json
{
  "transitions": {
    "In Progress": {
      "mandatoryFields": [
        {
          "field": "customfield_26906",
          "name": "Development Start Date",
          "type": "date",
          "autoValue": "NOW",
          "description": "Automatically set when work begins"
        }
      ],
      "validations": {
        "requireAssignee": true,
        "requireEstimate": true
      }
    },
    
    "Done": {
      "mandatoryFields": [
        {
          "field": "customfield_26911",
          "name": "Completion Date",
          "type": "date",
          "autoValue": "NOW"
        },
        {
          "field": "customfield_26912",
          "name": "Actual Story Points",
          "type": "number",
          "prompt": true,
          "description": "Actual effort spent"
        },
        {
          "field": "resolution",
          "name": "Resolution",
          "type": "resolution",
          "defaultValue": "Done"
        }
      ],
      "validations": {
        "requireSubtasksClosed": true,
        "requireTestsCovered": true
      }
    }
  }
}
```

### Fallback Configuration

If no project-specific config exists, falls back to `status-transitions-default.json`.

---

## Status Transition Rules

### Mandatory Field Types

| Type | Description | Example |
|------|-------------|---------|
| `date` | Date field (YYYY-MM-DD) | `2026-04-14` |
| `datetime` | DateTime with timezone | `2026-04-14T10:30:00.000Z` |
| `number` | Numeric value | `5` |
| `text` | Short text (max 255 chars) | `"Bug fix"` |
| `textarea` | Long text | `"Detailed description..."` |
| `select` | Single select from options | Uses `options` array |
| `resolution` | Jira resolution | `"Done"`, `"Won't Do"`, etc. |
| `url` | URL field | `"https://..."` |
| `issuelink` | Link to another issue | Issue key |

### Auto-Population

**`autoValue: "NOW"`** - Automatically set to current date/time:
- For `date` type: Sets to current date (YYYY-MM-DD)
- For `datetime` type: Sets to current timestamp (ISO-8601)

**`defaultValue`** - Use predefined value if no prompt needed

**Example:**
```json
{
  "field": "customfield_10015",
  "name": "Start Date",
  "type": "date",
  "autoValue": "NOW"
}
```

### User Prompts

**`prompt: true`** - Ask user to provide value:
- Opens appropriate input based on field type
- Uses `editor` for textarea fields
- Uses `list` for select fields with options
- Uses `input` for other types

**`required: true`** - Field must be provided by user

**Example:**
```json
{
  "field": "customfield_26914",
  "name": "Block Reason",
  "type": "textarea",
  "prompt": true,
  "required": true,
  "description": "Detailed reason for blocking"
}
```

### Validations

Available validation rules:

| Validation | Description |
|------------|-------------|
| `requireAssignee` | Issue must have an assignee |
| `requireEstimate` | Issue must have time estimate |
| `requireSubtasksClosed` | All subtasks must be closed/done |
| `requireTestsCovered` | Test coverage requirement |
| `requireQASignoff` | QA approval required |
| `requirePRLink` | Pull request link must be set |
| `requireEnvironment` | Deployment environment must be specified |

**Example:**
```json
{
  "validations": {
    "requireAssignee": true,
    "requireSubtasksClosed": true
  }
}
```

---

## Field Mappings

Field mappings translate custom field IDs to human-readable names.

### Usage in Create/Update

When creating or updating issues, the tool uses:
1. **Project-specific mapping**: `field-mapping-{PROJECT}.json`
2. **Fallback to default**: `field-mapping-default.json`

### Generating Field Mappings

```bash
npm run generate-mapping PROJ-1234
```

See [MULTI-PROJECT.md](MULTI-PROJECT.md) for details.

---

## Templates

Issue templates provide pre-configured issue structures.

### Creating a Template

**File**: `src/templates/issue-template-{NAME}.json`

**Example**: `issue-template-bug.json`

```json
{
  "fields": {
    "project": {
      "key": "WILL_BE_REPLACED"
    },
    "issuetype": {
      "name": "Bug"
    },
    "summary": "Bug Template",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Steps to Reproduce" }]
        },
        {
          "type": "orderedList",
          "content": [
            {
              "type": "listItem",
              "content": [
                { "type": "paragraph", "content": [{ "type": "text", "text": "Step 1" }] }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Expected vs Actual" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Expected: ", "marks": [{ "type": "strong" }] },
            { "type": "text", "text": "[What should happen]" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Actual: ", "marks": [{ "type": "strong" }] },
            { "type": "text", "text": "[What actually happens]" }
          ]
        }
      ]
    },
    "priority": {
      "name": "High"
    },
    "labels": ["bug"]
  }
}
```

### Built-in Templates

- `user-story` - User story with acceptance criteria
- `bug` - Bug report template (create as needed)
- `task` - Generic task template (create as needed)

---

## Velocity Tracking

### Automatic Date Tracking

The tool automatically tracks dates for velocity calculation:

| Transition | Auto-Set Field | Purpose |
|------------|---------------|---------|
| To Do → In Progress | Development Start Date | Track when work begins |
| In Progress → Code Review | Code Review Start Date | Track review time |
| Code Review → In QA | QA Start Date | Track QA duration |
| In QA → Done | Completion Date | Track finish time |
| Any → Blocked | Blocked Date | Track blocking events |

### Velocity Metrics

With automatic date tracking, you can calculate:

- **Cycle Time**: Completion Date - Development Start Date
- **Development Time**: Code Review Start - Development Start
- **Review Time**: QA Start - Code Review Start  
- **QA Time**: Completion - QA Start
- **Blocked Time**: Sum of blocking periods

### Example Configuration for Velocity

```json
{
  "transitions": {
    "In Progress": {
      "mandatoryFields": [
        {
          "field": "customfield_26906",
          "name": "Development Start Date",
          "type": "date",
          "autoValue": "NOW"
        }
      ]
    },
    "Done": {
      "mandatoryFields": [
        {
          "field": "customfield_26911",
          "name": "Completion Date",
          "type": "date",
          "autoValue": "NOW"
        },
        {
          "field": "customfield_26912",
          "name": "Actual Story Points",
          "type": "number",
          "prompt": true
        }
      ]
    }
  }
}
```

---

## Best Practices

### 1. Project-Specific Configurations

✅ **DO**: Create project-specific configurations
```bash
src/config/status-transitions-CEAJ.json
src/config/field-mapping-CEAJ.json
```

❌ **DON'T**: Modify default configurations directly

### 2. Field Mappings

✅ **DO**: Generate field mappings from sample issues
```bash
npm run generate-mapping PROJ-1234
```

❌ **DON'T**: Manually create mappings without validation

### 3. Date Fields for Velocity

✅ **DO**: Use auto-populated dates for consistency
```json
{
  "field": "customfield_26906",
  "type": "date",
  "autoValue": "NOW"
}
```

❌ **DON'T**: Prompt users for start/end dates manually

### 4. Validations

✅ **DO**: Add validations to prevent incomplete transitions
```json
{
  "validations": {
    "requireSubtasksClosed": true,
    "requireAssignee": true
  }
}
```

❌ **DON'T**: Allow transitions without required context

### 5. Templates

✅ **DO**: Create templates for common issue types
- user-story
- bug
- technical-task
- spike

❌ **DON'T**: Create one-off templates for specific issues

### 6. Testing

✅ **DO**: Test configurations in a non-production project first

❌ **DON'T**: Deploy to production without validation

---

## Error Handling

### Common Errors

**Missing Field Mapping:**
```
⚠ No project-specific mapping found, using default
```
**Solution**: Generate field mapping for your project

**Validation Failed:**
```
❌ Validation failed:
  - Issue must have an assignee
  - 2 subtask(s) still open
```
**Solution**: Address validation errors before retrying

**Invalid Transition:**
```
No transition to "In Progress" available. 
Options: To Do, Blocked
```
**Solution**: Check available transitions for the issue

**Missing Credentials:**
```
✗ Missing Jira credentials. Run: atl auth login
```
**Solution**: Configure authentication

---

## Related Documentation

- [README.md](README.md) - Overview and quick start
- [SETUP-ATL-CLI.md](SETUP-ATL-CLI.md) - Installation guide
- [USAGE.md](USAGE.md) - Read operations guide
- [COMMAND-REFERENCE.md](COMMAND-REFERENCE.md) - All commands
- [MULTI-PROJECT.md](MULTI-PROJECT.md) - Multi-project setup
- [ROADMAP.md](ROADMAP.md) - Future enhancements

---

**Document Version**: 1.0  
**Last Updated**: April 14, 2026  
**Maintained By**: Development Team
