# confluence-fetch — Example

## Scenario: Fetch API Design Page

### User Request

> "Show me the API design doc from page 123456"

### Agent Workflow

#### Step 1: Extract Page ID

```javascript
const pageId = "123456";
```

#### Step 2: Execute CLI Command

```bash
atl c page 123456
```

**Terminal Output**:
```
🔄 Fetching Confluence page 123456...
✅ Saved to: cache/confluence/SPACE/123456-api-design/
   - 123456.json
   - .meta.json
```

#### Step 3: Read Cached Files

```javascript
const jsonPath = 'cache/confluence/SPACE/123456-api-design/123456.json';
const page = JSON.parse(await read_file({ filePath: jsonPath, startLine: 1, endLine: 5000 }));
```

#### Step 4: Present to User

**Agent Response**:

```
Here's the API Authentication Design documentation:

**Overview**: OAuth2 with JWT tokens for API access

**Key Points**:
- 1-hour token expiry with refresh capability
- HttpOnly cookies for XSS prevention
- HTTPS required for all endpoints

**Related Work**: PROJ-123 (OAuth2 implementation)

Would you like details on any specific aspect?
```

## Example: With Jira Enrichment

### User Request

> "Get the feature spec page 789012 with current Jira status"

### Agent Workflow

#### Execute with --with-jira Flag

```bash
atl c page 789012 --with-jira
```

**Terminal Output**:
```
🔄 Fetching Confluence page...
📋 Fetching live Jira issue data...
✅ Saved with Jira enrichment
```

#### Present with Live Jira Data

**Agent Response**:

```
Feature Specification: User Onboarding Feature

**Referenced Jira Issues** (live status):
| Key | Status | Assignee |
|-----|--------|----------|
| PROJ-123 | **In Progress** | Jane Smith |
| PROJ-201 | To Do | Unassigned |
| XYZ-6111 | **Done** | John Doe |

The main feature (PROJ-123) is currently in progress...
```
