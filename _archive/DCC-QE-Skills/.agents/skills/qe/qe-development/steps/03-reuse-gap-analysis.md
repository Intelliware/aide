# Phase 3 — Reuse & Gap Analysis

## Purpose
Identify what can be reused from the existing codebase and what genuinely needs to be built. This is the most critical phase — quadruple-check before proposing anything new.

## Process

### Mandatory Lateral Thinking Checklist

For EVERY step or action in the BDD scenarios, run this sequence:

1. **What TYPE of interaction is this?**
   - Dialog, dropdown, table, form, button, navigation, assertion, upload, pagination...
   - Search KNOWLEDGE.md Section 3 (Utility & Generic Actions) for this TYPE first

2. **Does a GENERIC method exist for this type?**
   - A payment dialog and a delete confirmation dialog are the same type
   - A file upload and an avatar upload are the same type
   - Always check Section 3 utility methods before anything else

3. **Does a SIMILAR step exist for a DIFFERENT feature?**
   - Same pattern, different context — search Section 8 by pattern, not feature name
   - e.g. "confirm dialog on payments" vs "confirm dialog on transfers"

4. **Can existing steps be COMBINED to cover this?**
   - Two existing steps together might cover what looks like a new requirement

5. **ONLY if all 4 above return nothing → propose new code**

### Duplication & Quality Check

For every proposed new method, also check:

- **Identical functionality**: Does an existing method in KNOWLEDGE.md already do exactly this? → Flag as duplicate, use existing
- **Near-duplicate**: Does an existing method do almost the same thing with slight difference? → Flag, extend existing with parameter instead
- **Wrong location**: Is generic logic being placed in a page/service class? → Suggest correct utility class home

### Write reuse-analysis.md

Write to `features/<JIRA-ID>/reuse-analysis.md`:

```markdown
# Reuse & Gap Analysis — <JIRA-ID>

## Reuse Score
`X% reuse — [N] existing steps reused, [N] new items needed`

## Existing Steps Reused
<plain English list of what's being reused>

## What Needs To Be Built

| Type | Name | Action | Target File | Reason |
|---|---|---|---|---|
| Step Def | ... | New / Extend | ... | ... |
| Page Method | ... | New / Extend | ... | ... |
| Utility Method | ... | New (only if truly generic) | ... | ... |
| Locator | ... | New | objectRepo.properties | ... |

## Risk Flags
<only if reuse score below 50% or something looks fragile>
```

## Checkpoint

> "Phase 3 complete. Reuse score: X%. Does the reuse plan look right? Reply APPROVED to generate the code."

## Exit criteria
- reuse-analysis.md written to features/<JIRA-ID>/
- Lateral thinking checklist completed for every step
- User has approved Phase 3

