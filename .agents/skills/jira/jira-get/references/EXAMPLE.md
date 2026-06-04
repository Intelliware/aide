# jira-get — Example

## Scenario: Fetch and Analyze a Feature Issue

### User Request

> "Fetch PROJ-123 and show me the acceptance criteria"

### Agent Workflow

#### Step 1: Validate Issue Key

```javascript
const issueKey = "PROJ-123";
const issueKeyPattern = /^[A-Z]{2,}-\d+$/;

if (!issueKeyPattern.test(issueKey)) {
  throw new Error(`Invalid issue key format: ${issueKey}`);
}
// ✓ Valid format
```

#### Step 2: Execute CLI Command

```bash
# Probe atl once per session
atl --version 2>/dev/null && ATL_DIRECT=true || ATL_DIRECT=false

# Execute (use atl directly if on PATH, otherwise the workspace-relative form)
atl j issue PROJ-123
# or, if atl is not on PATH:
cd tools && npm run atl -- j issue PROJ-123
```

**Terminal Output**:
```
🔄 Fetching Jira issue PROJ-123...
✅ Saved to: cache/jira/PROJ/PROJ-123/
   - PROJ-123.json
   - .meta.json
```

#### Step 3: Read Cached Files

```javascript
const jsonPath = 'cache/jira/PROJ/PROJ-123/PROJ-123.json';
const metaPath = 'cache/jira/PROJ/PROJ-123/.meta.json';

const issueData = JSON.parse(await read_file({
  filePath: jsonPath,
  startLine: 1,
  endLine: 2000
}));

const meta = JSON.parse(await read_file({
  filePath: metaPath,
  startLine: 1, 
  endLine: 50
}));
```

#### Step 4: Extract Relevant Information

```javascript
const acceptanceCriteria = issueData.fields.customfield_10100; // Example field
const description = issueData.fields.description;
const summary = meta.summary;
const status = meta.status;
```

#### Step 5: Present to User

**Agent Response**:

```
✅ Retrieved PROJ-123 from Jira server

**Title**: User Onboarding Feature feature
**Status**: In Progress
**Type**: Feature

**Acceptance Criteria**:

1. User must be able to complete all 5 pre-arrival sections
2. Real-time validation on each section before proceeding
3. Auto-save functionality every 30 seconds
4. Mobile-responsive design required for all screens
5. Session timeout warning at 25 minutes

**Additional Details**:
- Assigned to: Jane Smith
- Sprint: Sprint 23
- Due date: May 15, 2026
- Child issues: 12 stories (8 in progress, 4 to do)

Would you like me to:
- Show the full description?
- List all child stories?
- Analyze the implementation progress?
```

## Example: Force Fresh Fetch

### User Request

> "Get the latest version of ABC-321"

### Agent Workflow

#### Recognize "latest" Trigger

User keywords: "latest", "current", "fresh", "up to date"

#### Execute with Fresh Flag

```bash
atl j issue ABC-321 --fresh
```

**Terminal Output**:
```
⚠ Remote has been updated
🔄 Fetching fresh copy...
✅ Saved to: cache/jira/ABC/ABC-321/
   Last updated: 2026-04-29T09:30:15.000Z
```

#### Present with Cache Status

**Agent Response**:

```
✅ Fetched fresh copy of ABC-321 — remote was updated since last cache

**Title**: OAuth2 Token Enhancement
**Status**: Done (changed from In Progress)
**Last Updated**: April 29, 2026, 9:30 AM

**Recent Changes**:
- Status moved to Done (was In Progress)
- Resolution added: Fixed
- Assignee updated: John Doe → QA Team

The issue has been completed and is ready for verification.
```

## Example: Using Cached Data

### User Request

> "What's the status of XYZ-456?"

### Agent Workflow

#### Check for Existing Cache

```javascript
const cachePath = 'cache/jira/XYZ/XYZ-456/.meta.json';
const exists = await file_exists(cachePath);
// true — cache exists
```

#### Use Cached Data (No CLI Call)

```bash
# No command executed — read from cache directly
```

#### Read Metadata

```javascript
const meta = JSON.parse(await read_file({
  filePath: cachePath,
  startLine: 1,
  endLine: 50
}));

console.log(`✅ Retrieved ${meta.issueKey} — cache is up to date`);
```

**Agent Response**:

```
📄 Retrieved XYZ-456 — cache is up to date with Jira server

**Status**: In Progress
**Summary**: User Profile API Enhancement
**Assignee**: Jane Smith
**Last Updated**: April 22, 2026 (cached on April 23, 2026)

💡 Note: Cache is from April 23. Use "get latest" if you need current data.
```

## Example: Error Handling

### User Request

> "Fetch INVALID-KEY"

### Agent Workflow

#### Validation Fails

```javascript
const issueKey = "INVALID-KEY";
const issueKeyPattern = /^[A-Z]{2,}-\d+$/;

if (!issueKeyPattern.test(issueKey)) {
  // Pattern requires at least 2 uppercase letters
  throw new Error(`Invalid issue key format: ${issueKey}`);
}
```

**Agent Response**:

```
❌ Invalid issue key format: "INVALID-KEY"

Expected format: PROJECT-NUMBER
Examples:
- PROJ-123
- XYZ-456
- ABC-123

Please provide a valid Jira issue key.
```

### 404 Not Found Example

#### CLI Returns Error

```bash
atl j issue PROJ-99999
```

**Terminal Output**:
```
❌ Error: Issue Does Not Exist
   Key: PROJ-99999
   Status: 404
```

**Agent Response**:

```
❌ Jira issue PROJ-99999 not found

Please verify:
- Issue key is correct (check for typos)
- You have permission to view this issue
- Issue hasn't been deleted

Search for similar issues: "Would you like me to search the CEAJ project for related issues?"
```
