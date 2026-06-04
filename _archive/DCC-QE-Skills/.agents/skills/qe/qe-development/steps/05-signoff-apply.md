# Phase 5 — Sign-off & Apply

## Purpose
Apply the approved code changes to BB-DCC-QE and record the sign-off.

## Process

### 1. Present file placement table

Show every file that will be created or modified:

| Item | Target File | Action |
|---|---|---|
| Feature file | `src/test/resources/features/...` | Create new |
| Step definitions | `src/test/java/stepdefinitions/...` | Add to existing / Create new |
| Page methods | `src/main/java/framework/app/...` | Add to existing / Create new |
| Locators | `src/test/resources/locators/objectRepo.properties` | Add entries |
| Content strings | `src/test/resources/content/english_lang.properties` | Add entries (if needed) |

### 2. Apply changes

- Create/modify each file in BB-DCC-QE as specified
- Ensure all imports are added
- Ensure no compilation errors

### 3. Record rollback plan

```
Files touched:
- <file path 1>
- <file path 2>

Revert command: git checkout HEAD -- <file paths>
```

### 4. Write sign-off.md

Write to `features/<JIRA-ID>/sign-off.md`:

```markdown
# Sign-off — <JIRA-ID>

## Date
<timestamp>

## Files Modified/Created
| File | Action |
|---|---|
| ... | Created / Modified |

## Rollback Plan
​```
git checkout HEAD -- <file1> <file2> ...
​```

## Risk Notes
<any risks, things to watch, follow-up suggestions>

## Status
✅ COMPLETE — Changes applied to BB-DCC-QE
```

## Checkpoint

> "Phase 5 complete. Changes applied. Proceeding to refresh KNOWLEDGE.md..."

### 5. Update qe-increment-status.md

If a KB feature folder was resolved in Phase 0b and `qe-package/qe-increment-status.md` exists:

- For each INC that this QE work covers, update its `QE Status` column:
  - `in-progress` → `done`
  - Populate the `BB-DCC-QE tag / feature file` column with the Cucumber tag(s) and feature file path(s) added in Phase 4/5
- Update the `Last updated` date field

Tell the user:
> "Updated `qe-package/qe-increment-status.md` — INC-XXX [, INC-YYY] marked as `done`."

## Exit criteria
- All code applied to BB-DCC-QE
- sign-off.md written
- qe-increment-status.md updated (if KB feature folder was resolved)
- User has confirmed


