# Field Mappings Directory

This directory contains **project-specific** field mappings for converting Jira custom field IDs to readable names.

## Structure

```
src/field-mappings/
├── {PROJECT_KEY}/
│   ├── fields.json         # Field ID → Field Name mapping
│   └── fields.json.meta    # Generation metadata (date, source, etc.)
├── DIGSTART/
│   ├── fields.json
│   └── fields.json.meta
├── CEAJ/
│   ├── fields.json
│   └── fields.json.meta
└── README.md               # This file
```

## How It Works

1. **Auto-Generation**: When you fetch a Jira issue for the first time from a new project, the CLI automatically:
   - Detects the project key (e.g., `DIGSTART-1258` → `DIGSTART`)
   - Creates a directory `src/field-mappings/DIGSTART/`
   - Generates `fields.json` with all custom fields from that issue
   - Creates `fields.json.meta` with generation metadata

2. **Project-Specific Loading**: Each time you fetch an issue:
   - CLI extracts project key from issue key
   - Loads the corresponding `field-mappings/{PROJECT}/fields.json`
   - Uses it to convert field IDs to readable names in markdown output

3. **No Default Fallback**: Every project must have its own mapping. There is no generic fallback.

## Mapping File Format

**fields.json** - Maps custom field IDs to human-readable names:
```json
{
  "customfield_10008": "Epic Link",
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner",
  "customfield_26905": "Feature Statement",
  "customfield_10002": "Story Points"
}
```

**fields.json.meta** - Metadata about the mapping generation:
```json
{
  "generatedAt": "2026-04-15T02:07:09.115Z",
  "source": "DIGSTART-1258",
  "project": "DIGSTART",
  "fieldCount": 169,
  "importantFields": [
    {
      "name": "Epic Link",
      "id": "customfield_10008"
    }
  ]
}
```

## Manual Generation

If you want to regenerate a mapping manually:

```bash
# From workspace/tools/atlassian-cli directory
npm run generate-mapping DIGSTART-1258
npm run generate-mapping PROJ-123
```

## Customization

You can manually edit `fields.json` to:
- Rename fields for better clarity
- Add/remove field mappings
- Fix incorrect auto-generated names

Example:
```bash
# Edit the mapping
nano src/field-mappings/CEAJ/fields.json

# Test with a fresh fetch
npm run issue PROJ-123 -- --fresh
```

## Why Project-Specific?

Different Jira projects can have:
- Different custom field IDs for the same logical field
- Unique fields that don't exist in other projects
- Different naming conventions

Example:
- DIGSTART project: `customfield_10008` = "Epic Link
"  
- CEAJ project: **doesn't have** `customfield_10008`
- CEAJ project: `customfield_26903` = "Feature Owner"
- DIGSTART project: **doesn't have** `customfield_26903`

Therefore, each project needs its own accurate mapping.

## Notes

- Mappings are cached and reused across fetches
- Auto-generation happens only once per project
- Metadata file tracks when and how the mapping was created
- All mappings are project-specific - no generic defaults exist
