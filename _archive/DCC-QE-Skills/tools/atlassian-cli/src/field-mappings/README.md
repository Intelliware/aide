# Field Mappings Directory

This directory contains the single project-specific Jira custom field mapping used by this trimmed tool:

```text
src/field-mappings/
├── RMBJTDBC/
│   └── fields.json
└── README.md
```

## Purpose

`fields.json` maps Jira custom field IDs to the human-readable names returned by Jira metadata for `RMBJTDBC` issues.

Example:

```json
{
  "customfield_14400": "Acceptance Criteria",
  "customfield_10002": "Story Points"
}
```

## How it is used

When the tool generates markdown for an `RMBJTDBC-*` issue, it loads this mapping and uses it to find known sections such as:
- `Acceptance Criteria`

The mapping was regenerated from real Jira issue metadata and stripped down to the single project we currently support.
