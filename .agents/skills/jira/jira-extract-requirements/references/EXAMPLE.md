# jira-extract-requirements — Example

## Scenario: Extract Feature Requirements Package

### User Request

> "Extract requirements from Jira feature PROJ-123 into a requirements package"

### Agent Workflow

#### Step 1: Fetch Root Issue

```bash
atl j related PROJ-123
```

#### Step 2: Detect Issue Type

Read `cache/jira/PROJ/PROJ-123/.meta.json` → `issuetype.name = "Feature"`

#### Step 3: Prompt for Output Location

```
I found PROJ-123 is a Feature issue (User Onboarding Feature).
Where would you like to save the requirements package?

1. ✅ documentation/requirements-package/PROJ-123-user-onboarding-feature/ (recommended)
2. drafts/PROJ-123-user-onboarding-feature/
3. Link into existing package — tell me which folder

Choice: 1
```

#### Step 4: Create Package Structure

```
documentation/requirements-package/PROJ-123-user-onboarding-feature/
├── README.md
├── sources/jira/
└── links/
```

#### Step 5: Author Root Markdown

Read `PROJ-123.json` → Write `sources/jira/PROJ-123-user-onboarding-feature.md`

#### Step 6: Extract Child/Linked Issues

From root JSON:
- 12 child stories found
- 3 linked dependencies found

#### Step 7: Fetch & Author Dependencies

For each child/linked issue:
1. Check if already cached
2. Run staleness check (compare `updated` timestamps)
3. Fetch if MISSING or STALE
4. Author markdown file in `links/`
5. Mark `[x]` in README.md checklist

#### Step 8: Print Package Update Report

```
📦 Package Update Report — PROJ-123-user-onboarding-feature
Run completed: 2026-05-05T11:45:00Z

✅ Refreshed (remote updated):
  • PROJ-123   updated 2026-05-04 → re-authored sources/jira/PROJ-123-user-onboarding-feature.md
  • PROJ-201 updated 2026-05-03 → re-authored links/PROJ-201-naps-update.md

⏭ No changes:
  • XYZ-6111  last updated 2026-04-10 — unchanged
  • ABC-999       last updated 2026-03-15 — unchanged

⬜ Pending:
  • DEF-100  — To Do — not yet fetched

✅ Package complete: documentation/requirements-package/PROJ-123-user-onboarding-feature/
```

## Scenario: Refresh Existing Package

### User Request

> "Refresh the requirements package for PROJ-123"

### Agent Workflow

#### Step 1: Detect Existing Package

```
Found existing package: documentation/requirements-package/PROJ-123-user-onboarding-feature/
```

#### Step 2: Read Checklist

Parse `README.md` → collect all `[x]` items

#### Step 3: Run Staleness Check

For root + all `[x]` items:
```bash
atl j issue {KEY} --fields=updated
```

Compare remote `updated` vs cached `updated`

#### Step 4: Refresh Only Stale Items

- PROJ-123: STALE → re-fetch → re-author
- PROJ-201: STALE → re-fetch → re-author  
- XYZ-6111: CURRENT → skip
- ABC-999: CURRENT → skip

#### Step 5: Print Update Report

Shows which items were refreshed vs unchanged (see report format above)
