# confluence-extract-package — Example

## Scenario: Extract Confluence Page Package

### User Request

> "Extract Confluence package for page 123456789"

### Agent Workflow

#### Step 1: Fetch Root Page

```bash
atl c page 123456789 --with-jira
```

#### Step 2: Check for Related Jira Package

Read `.jira.json` → find linked Feature issues → check if package exists in `documentation/requirements-package/`

If found: Offer as recommended output location

#### Step 3: Extract L0 Links

Parse page body:
- 5 linked Confluence pages  
- 8 referenced Jira issues

#### Step 4: Run Staleness Check

For each already-cached item:
```bash
atl c page {LINKED_ID} --fields=version
atl j issue {KEY} --fields=updated
```

Compare remote vs cached → mark MISSING, STALE, or CURRENT

#### Step 5: Prompt for Output Location

```
Found page "API Design Specification" (ID: 123456789).
Linked to Jira Feature WATCH-200 with existing package.

Where to save?
1. ✅ documentation/requirements-package/PROJ-123-feature/ (recommended)
2. drafts/api-design-specification/
3. documentation/requirements-package/api-design-specification/

Choice: 1
```

#### Step 6: Fetch & Author

- Fetch MISSING/STALE items only
- Author markdown for root and all links
- Update README checklist

#### Step 7: Print Report

```
📦 Package Update Report — api-design-specification
Run completed: 2026-05-05T12:00:00Z

✅ Refreshed (2 items):
  • Confluence 123456789 version 8 → 10
  • Jira PROJ-123 updated 2026-05-04

⏭ No changes (11 items)
⬜ Pending (0 items)
✅ Package complete
```
