# Multi-Project Field Mapping Architecture

## Problem Statement

Different Jira projects/boards often have different custom field configurations:
- Same field name but different IDs across projects
- Project-specific fields that don't exist in other projects
- Different field requirements per project type

**Example**:
- Project CEAJ might have `customfield_14400` = "Acceptance Criteria"
- Project OCA might have `customfield_15500` = "Acceptance Criteria"
- Project CEAJ has "Feature Statement" but OCA doesn't
- Project OCA has "Technical Spec Link" but CEAJ doesn't

## Solution: Project-Specific Field Mappings

### File Structure

```
src/utils/
├── field-mapping.json              # Default/fallback mapping
├── field-mapping-CEAJ.json         # CEAJ project specific
├── field-mapping-CEAJ.json.meta    # Metadata (when generated, source ticket)
├── field-mapping-OCA.json          # OCA project specific
├── field-mapping-OCA.json.meta
└── field-mapping-PROJ.json         # PROJ project specific

src/templates/                       # Optional: Custom markdown templates
├── markdown-template.md            # Default template
├── markdown-template-CEAJ.md       # CEAJ specific
└── markdown-template-OCA.md        # OCA specific
```

### Field Mapping Format

`field-mapping-CEAJ.json`:
```json
{
  "customfield_10008": "Epic Link",
  "customfield_14400": "Acceptance Criteria",
  "customfield_26903": "Feature Owner",
  "customfield_26904": "Feature Size",
  "customfield_26905": "Feature Statement",
  "customfield_27001": "Business Value"
}
```

`field-mapping-CEAJ.json.meta`:
```json
{
  "generatedAt": "2026-04-14T10:30:00Z",
  "source": "PROJ-123",
  "project": "CEAJ",
  "fieldCount": 12,
  "importantFields": [
    { "name": "Epic Link", "id": "customfield_10008" },
    { "name": "Acceptance Criteria", "id": "customfield_14400" }
  ]
}
```

## Setup Workflow

### During Initial Setup (Step 6.2 in SETUP.md)

**AI Agent asks user**:
```
Please provide a Jira ticket key to test the integration.
For example: PROJ-123

Tip: Choose a ticket that represents the type of work you'll be tracking
(Story, Epic, Bug, etc.) as it will help generate the correct field mappings.
```

**User provides**: `PROJ-123`

**Agent executes**:
```bash
# 1. Fetch the ticket
npm run atl:issue PROJ-123

# 2. Generate project-specific field mapping from the ticket
npm run generate-mapping PROJ-123

# Output:
# 🔍 Generating field mapping from issue: PROJ-123
# 
# ✓ Found 15 custom fields in issue
# ✓ Issue Type: Story
# ✓ Project: CEAJ (EasyApply)
# 
# ✓ Generated field mapping with 15 custom fields
# ✓ Saved to: src/utils/field-mapping-CEAJ.json
```

### For Multiple Projects

**AI Agent asks**:
```
Do you work with multiple Jira projects with different custom fields?

If yes, please provide one sample ticket from each project:
- Project 1 ticket: 
- Project 2 ticket: 
- Project 3 ticket: (optional)
```

**User provides**:
- PROJ-123
- OCA-1234
- PROJ-567

**Agent executes for each**:
```bash
# Project 1: CEAJ
npm run atl:issue PROJ-123
npm run generate-mapping PROJ-123

# Project 2: OCA
npm run atl:issue OCA-1234
npm run generate-mapping OCA-1234

# Project 3: PROJ
npm run atl:issue PROJ-567
npm run generate-mapping PROJ-567
```

## Runtime Behavior

### When Fetching an Issue

```javascript
// Pseudo-code workflow
function fetchIssue(issueKey) {
  // 1. Extract project key
  const project = issueKey.split('-')[0]; // "PROJ-123" → "CEAJ"
  
  // 2. Try to load project-specific field mapping
  let fieldMapping;
  const projectMappingPath = `src/utils/field-mapping-${project}.json`;
  
  if (fs.existsSync(projectMappingPath)) {
    fieldMapping = require(projectMappingPath);
    console.log(`✓ Using project-specific mapping: ${project}`);
  } else {
    // Fallback to default
    fieldMapping = require('src/utils/field-mapping.json');
    console.log(`⚠️  No mapping for ${project}, using default`);
    console.log(`   Generate mapping: npm run generate-mapping ${issueKey}`);
  }
  
  // 3. Fetch issue from API
  const issue = await jiraClient.getIssue(issueKey);
  
  // 4. Transform custom fields using mapping
  const transformedFields = transformFields(issue.fields, fieldMapping);
  
  // 5. Generate markdown
  const markdown = generateMarkdown(transformedFields, project);
  
  return markdown;
}
```

### Detecting New Projects

When user fetches from a new project:

```
npm run atl:issue NEWPROJ-100

Output:
🔍 Fetching Jira issue: NEWPROJ-100

⚠️  Warning: No field mapping found for project NEWPROJ
   Using default field mapping
   
   To generate project-specific mapping:
   1. Run: npm run generate-mapping NEWPROJ-100
   2. Review: src/utils/field-mapping-NEWPROJ.json
   3. Re-fetch: npm run atl:issue NEWPROJ-100 -- --fresh

✓ Fetched NEWPROJ-100
  Summary: Some task
  Status: In Progress
  
📄 Saved to: atl/jira/NEWPROJ-100/NEWPROJ-100.md
```

**Agent should**:
1. Detect the warning
2. Ask user: "I detected a new project (NEWPROJ). Would you like me to generate field mappings for it?"
3. If yes, run: `npm run generate-mapping NEWPROJ-100`
4. Re-fetch with proper mappings

## Markdown Template Customization (Optional)

### Default Template

`src/templates/markdown-template.md`:
```markdown
# {ISSUE_KEY}: {SUMMARY}

**Type**: {TYPE}
**Status**: {STATUS}
**Priority**: {PRIORITY}

## Description
{DESCRIPTION}

## Acceptance Criteria
{ACCEPTANCE_CRITERIA}

## Comments
{COMMENTS}
```

### Project-Specific Template

`src/templates/markdown-template-CEAJ.md`:
```markdown
# {ISSUE_KEY}: {SUMMARY}

**Type**: {TYPE}
**Status**: {STATUS}
**Priority**: {PRIORITY}

## Feature Statement
{FEATURE_STATEMENT}

## Business Value
{BUSINESS_VALUE}

## Acceptance Criteria
{ACCEPTANCE_CRITERIA}

## Risk Assessment
{RISK_ASSESSMENT}

## Description
{DESCRIPTION}
```

The system automatically uses project-specific template if it exists.

## Maintenance

### Updating Field Mappings

When a project adds new custom fields:

```bash
# 1. Fetch a recent ticket with the new fields
npm run atl:issue CEAJ-9999

# 2. Regenerate mapping
npm run generate-mapping CEAJ-9999

# 3. Compare with existing
diff src/utils/field-mapping-CEAJ.json src/utils/field-mapping-CEAJ.json.new

# 4. Review and update template if needed
```

### Best Practices

1. **Keep canonical tickets**:
   - Document which ticket was used to generate each mapping
   - Use a comprehensive ticket (Story with many fields)
   - Store in `.meta` file for reference

2. **Regular updates**:
   - Regenerate mappings quarterly
   - Or when project configuration changes
   - Test with different issue types (Story, Bug, Epic)

3. **Version control**:
   - Commit field mapping files to git
   - Track changes over time
   - Document mapping updates in commit messages

4. **Documentation**:
   ```
   # In project README or wiki:
   
   ## Field Mapping Sources
   - CEAJ: Generated from PROJ-123 (Epic with feature fields)
   - OCA: Generated from OCA-1234 (Story with acceptance criteria)
   - PROJ: Generated from PROJ-567 (Bug with technical fields)
   ```

## Benefits

✅ **Accurate field names**: Each project gets its proper field labels  
✅ **Flexible**: Easy to add new projects as needed  
✅ **Maintainable**: Clear separation of project configurations  
✅ **User-friendly**: Readable markdown with proper field names  
✅ **Automatic**: System auto-selects mapping based on issue key  
✅ **Fallback**: Default mapping when project-specific not found

## Implementation Checklist

- [x] Enhanced `generate-field-mapping.js` to accept issue keys
- [x] Support project-specific output files
- [x] Detect project from issue key
- [x] Metadata file generation
- [x] SETUP.md documentation for multi-project setup
- [ ] Update `fetch-issue.js` to load project-specific mappings
- [ ] Add warning when project mapping not found
- [ ] Template support (optional enhancement)
- [ ] CLI command to list all project mappings
- [ ] Migration guide for existing installations
