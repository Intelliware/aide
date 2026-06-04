# Configuration Files

This directory contains configuration files for project-specific field mappings and status transition rules.

## File Types

### Field Mappings
**Format**: `field-mapping-{PROJECT}.json`

Maps Jira custom field IDs to human-readable field names for a specific project.

**Example**: `field-mapping-CEAJ.json`
```json
{
  "customfield_10008": "Epic Link",
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner"
}
```

**Usage**:
- Used when creating issues to map field names to IDs
- Used when displaying issue data in markdown
- Generated via: `npm run generate-mapping ISSUE-KEY`

**Fallback**: `field-mapping-default.json` (if project-specific not found)

---

### Status Transitions
**Format**: `status-transitions-{PROJECT}.json`

Defines mandatory fields and validations for status transitions in a specific project.

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
          "autoValue": "NOW"
        }
      ],
      "validations": {
        "requireAssignee": true
      }
    }
  }
}
```

**Usage**:
- Used when transitioning issue status (`atl j transition`)
- Validates required fields before allowing transition
- Auto-populates date fields for velocity tracking
- Prompts user for mandatory fields

**Fallback**: `status-transitions-default.json` (if project-specific not found)

---

## Creating Project-Specific Configs

### 1. Field Mapping

Generate from a sample issue:
```bash
npm run generate-mapping PROJ-1234
```

This creates `field-mapping-CEAJ.json` with all custom fields from PROJ-1234.

### 2. Status Transitions

Copy and customize the default or CEAJ example:
```bash
cp status-transitions-default.json status-transitions-YOUR-PROJECT.json
```

Then edit to match your project's:
- Status workflow
- Custom field IDs
- Validation requirements
- Velocity tracking needs

---

## Field Types

| Type | Description | Auto-Value Support |
|------|-------------|-------------------|
| `date` | Date (YYYY-MM-DD) | ✅ NOW |
| `datetime` | Timestamp (ISO-8601) | ✅ NOW |
| `number` | Numeric value | ❌ |
| `text` | Short text (≤255) | ❌ |
| `textarea` | Long text | ❌ |
| `select` | Dropdown selection | ❌ |
| `resolution` | Jira resolution | ❌ |
| `url` | URL field | ❌ |
| `issuelink` | Link to issue | ❌ |

---

## Validation Rules

| Rule | Description |
|------|-------------|
| `requireAssignee` | Issue must have an assignee |
| `requireEstimate` | Issue must have time estimate |
| `requireSubtasksClosed` | All subtasks must be done |
| `requireTestsCovered` | Test coverage required |
| `requireQASignoff` | QA approval needed |
| `requirePRLink` | PR link must be set |
| `requireEnvironment` | Deployment environment required |

---

## Best Practices

1. **Generate field mappings** from real issues, don't create manually
2. **Use autoValue: "NOW"** for date fields to ensure consistency
3. **Add validations** to prevent incomplete transitions
4. **Document custom fields** with clear names and descriptions
5. **Version control** your project-specific configs
6. **Test configs** in non-production environment first

---

## Related Documentation

- [WRITE-OPERATIONS.md](../WRITE-OPERATIONS.md) - Complete guide to creating and updating issues
- [MULTI-PROJECT.md](../MULTI-PROJECT.md) - Multi-project architecture overview
- [COMMAND-REFERENCE.md](../COMMAND-REFERENCE.md) - CLI command reference
