# jira-search — Example

## Scenario: Search for In-Progress Stories

### User Request

> "Show me all in-progress stories in project ABC"

### Agent Workflow

#### Step 1: Translate to JQL

```javascript
const userRequest = "in-progress stories in project ABC";
const jql = "project = ABC AND type = Story AND status = 'In Progress'";
```

#### Step 2: Execute Search

```bash
atl j search "project = ABC AND type = Story AND status = 'In Progress'"
```

**Terminal Output**:
```
🔍 Searching Jira...
✅ Found 15 issues matching criteria
📁 Saved individual issues to: cache/jira/ABC/
📄 Search summary: cache/jira/_searches/search-2026-05-05-abc-stories.md
```

#### Step 3: Read Search Summary

```javascript
const summaryPath = 'cache/jira/_searches/search-2026-05-05-abc-stories.md';
const summary = await read_file({
  filePath: summaryPath,
  startLine: 1,
  endLine: 200
});
```

#### Step 4: Present Results

**Agent Response**:

```
✅ Found 15 in-progress stories in project ABC

**Summary by Assignee**:
  - Jane Smith: 6 stories
  - John Doe: 5 stories
  - Unassigned: 4 stories

**Top Stories**:
  1. ABC-123: Implement user authentication (Jane Smith)
  2. ABC-124: Add password reset feature (John Doe)
  3. ABC-125: Update profile page UI (Jane Smith)
  4. ABC-126: Fix email validation (Unassigned)
  5. ABC-127: Add two-factor auth (Jane Smith)

**Full results saved to**: cache/jira/_searches/search-2026-05-05-abc-stories.md

Would you like me to:
- Analyze any specific story?
- Show unassigned stories?
- Group by sprint or epic?
```

## Example: Empty Results with Suggestions

### User Request

> "Find issues with label 'urgent' in project ABC"

### Agent Workflow

#### Execute Search

```bash
atl j search "project = ABC AND labels = urgent"
```

**Terminal Output**:
```
🔍 Searching Jira...
⚠️  No issues found matching criteria
```

#### Present Helpful Suggestions

**Agent Response**:

```
⚠️ No issues found matching:
   project = ABC AND labels = urgent

**Suggestions**:
  - Check if the label name is correct (case-sensitive)
  - Try: `labels IN (urgent, critical, high-priority)`
  - Remove label filter to see all project issues

Would you like me to search for:
  1. All issues in project ABC?
  2. High priority issues (priority >= High)?
  3. A different label?
```

## Example: Large Result Set

### User Request

> "Show all issues in project ABC"

### Agent Workflow

#### Execute Search with Default Limit

```bash
atl j search "project = ABC" --max 50
```

**Terminal Output**:
```
🔍 Searching Jira...
✅ Found 250 issues (showing 50 results due to limit)
```

#### Present Options for Refinement

**Agent Response**:

```
✅ Found 250 issues in project ABC (limited to 50 results)

**Preview** (first 50):
  - By Status:
    - In Progress: 15
    - To Do: 20
    - Done: 10
    - In Review: 5
  
  - By Type:
    - Story: 30
    - Bug: 12
    - Task: 8

**Would you like me to**:
  1. Show a specific subset (e.g., only bugs or only in-progress)?
  2. Filter by assignee or status?
  3. Increase the limit (use `--max 250` for all results)?
  4. Export to a file for offline analysis?

**Current query**: `project = ABC`
```

## Example: Complex Multi-Criteria Search

### User Request

> "Find high priority bugs assigned to John Doe that are not done"

### Agent Workflow

#### Translate to JQL

```javascript
const jql = `
  type = Bug 
  AND priority >= High 
  AND assignee = "john.doe@example.com" 
  AND status != Done
`.trim().replace(/\s+/g, ' ');
```

#### Execute Search

```bash
atl j search "type = Bug AND priority >= High AND assignee = 'john.doe@example.com' AND status != Done"
```

**Terminal Output**:
```
🔍 Searching Jira...
✅ Found 8 issues matching criteria
```

#### Present Detailed Analysis

**Agent Response**:

```
✅ Found 8 high-priority bugs assigned to John Doe (not done)

**By Status**:
  - In Progress: 5 bugs
  - To Do: 2 bugs
  - Blocked: 1 bug

**By Priority**:
  - Highest: 2 bugs
  - High: 6 bugs

**Critical Issues** (Highest priority):
  1. BUG-456: Login fails after password reset (Blocked)
  2. BUG-789: Data loss on form submission (In Progress)

**All Bugs**:
  1. BUG-123: Session timeout too short (In Progress)
  2. BUG-234: Email validation incorrect (To Do)
  3. BUG-345: Profile image not saving (In Progress)
  4. BUG-456: Login fails after password reset (Blocked) ⚠️
  5. BUG-567: Password strength meter broken (In Progress)
  6. BUG-678: Two-factor auth bypass (In Progress)
  7. BUG-789: Data loss on form submission (In Progress) ⚠️
  8. BUG-890: Redirect loop on logout (To Do)

**Recommendations**:
  - 2 highest-priority bugs need immediate attention
  - 1 bug is blocked — may need escalation
  - Workload: 5 bugs in progress (may be too many concurrent)

Would you like me to:
- Deep dive into the blocked bug (BUG-456)?
- Show details for highest-priority bugs?
- Analyze John's overall workload?
```

## Example: Integration with Other Skills

### Scenario: Search Then Extract Requirements

**User**: "Find all features in project CEAJ"

**Step 1**: Search for Features

```bash
atl j search "project = CEAJ AND type = Feature"
```

**Agent Response**:
```
✅ Found 12 features in project CEAJ

Top Features:
  1. PROJ-123: User Onboarding Feature
  2. PROJ-4272: Address Verification
  3. PROJ-5100: Document Upload

Would you like me to extract requirements for any of these features?
```

**User**: "Extract requirements for PROJ-123"

**Step 2**: Invoke jira-extract-requirements

```
→ Switch to jira-extract-requirements skill
→ Extract PROJ-123 into documentation/requirements-package/
```

This demonstrates how `jira-search` discovers work items that feed into downstream skills.
