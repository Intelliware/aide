# Phase 0c — Testability Check

## Purpose
Before investing in test authoring, determine upfront whether the JIRA ticket or INC
has any UI or API automation scope in BB-DCC-QE, and whether any tests already exist
for it. Inform the user clearly and offer a clean exit if there is nothing to automate.

This phase runs immediately after Phase 0 has loaded context (JIRA / INC / description)
and before Phase 0b (readiness deep-dive). It is always executed — it cannot be skipped.

---

## Process

### 1. Scan for existing BB-DCC-QE tests

Using `KNOWLEDGE.md` (already loaded in Phase 0):

- Search **Section 7** (feature files index) for any `.feature` file whose filename,
  path, or tags contain the JIRA ID or INC ID (case-insensitive).
- Search **Section 8** (step definitions / tags index) for any tag matching
  `@<JIRA-ID>` or `@<INC-ID>` (e.g. `@BZC-5678`, `@INC-001`).

Record:
- **existing_count** — number of matching scenarios found
- **existing_tags** — list of matching tags (e.g. `@BZC-5678`)
- **existing_files** — list of feature file paths

If KNOWLEDGE.md is not yet available (rare, only if Phase 0 scan was just triggered),
skip this step and set existing_count = unknown.

---

### 2. Classify test type scope

Determine what category of BB-DCC-QE automation (if any) applies, using the following
signals in priority order:

#### Signal A — INC Layer field (highest confidence)

If an INC file was loaded in Phase 0 or selected in this session, read
`## 1. Increment Identity` → `Layer:` field:

| Layer value | Test type | BB-DCC-QE scope |
|---|---|---|
| `L4` — UI / frontend component | **UI / E2E** | ✅ Applicable |
| `L3` — API / service boundary | **API** | ✅ Applicable |
| `L2` — internal service / entitlement | **API** | ✅ Applicable (verify with test-plan) |
| `L1` — infrastructure (scheduler, mTLS, DB migration, config, audit emitter) | **None** | ⛔ Not applicable |

#### Signal B — test-plan.md §10 pyramid table (high confidence)

If `<KB_FEATURE_ROOT>/implementation-package/plan/test-plan.md` is available, find
the row for the relevant INC in the pyramid table (§10):

- If the **E2E** column is ✔ → **UI/E2E applicable**
- If only **API/IT** column is ✔ and E2E is blank → **API applicable**
- If only **Unit** column is ✔ → **None — dev-owned only**

#### Signal C — JIRA issue fields (used when no INC file is available)

If context came from a JIRA issue only (no INC file), use these heuristics:

- **JIRA component tags** containing `UI`, `Frontend`, `BZC`, `Portal` → UI/E2E likely
- **JIRA component tags** containing `API`, `Service`, `AuthZ`, `Entitlement` → API likely
- **JIRA issue type** = `Task` or `Story` with description mentioning a user journey,
  page navigation, button clicks, form submission → UI/E2E likely
- **JIRA description** mentioning only infrastructure terms (scheduler, migration,
  mTLS, audit log, config change, DB script) with no user-facing interaction →
  likely not applicable
- **When uncertain from JIRA alone:** classify as `unknown` and note the gap;
  ask the user one question: "Is this ticket for a user-facing UI flow, an API
  endpoint, or a backend/infrastructure change?"

---

### 3. Present testability summary to user

Format and present the following report. Do not proceed to Phase 0b without showing this.

#### If UI or API scope identified:

```
## Testability Check — <JIRA-ID or INC-ID>

**Existing BB-DCC-QE tests:** <N> scenario(s) tagged <@tags> in <files>
  — OR —
**Existing BB-DCC-QE tests:** None found

**Test type scope:** ✅ <UI/E2E | API> — <reason, e.g. "L4 frontend component" or "L3 service boundary">

**Recommended approach:** <one of the following>
- Build new <UI/API> automation from scratch
- Extend existing <@tag> scenarios (<N> already exist)
- No new code needed — existing scenarios already cover this (confirm with user)
```

Then proceed automatically to Phase 0b.

#### If no BB-DCC-QE automation scope:

```
## Testability Check — <JIRA-ID or INC-ID>

**Existing BB-DCC-QE tests:** None found

**Test type scope:** ⛔ Not applicable
**Reason:** <one of the following>
- L1 infrastructure increment (no user-facing UI or API surface to automate in BB-DCC-QE)
- Dev-owned only — covered by unit/IT/Cypress (confirmed from test-plan §10)
- Backend execution ticket — no UI journey or API endpoint introduced

**This increment has no BB-DCC-QE automation scope.**

Would you like to:
  1. **Exit** — close this session (no automation work needed)
  2. **Continue anyway** — proceed to Phase 0b (e.g. to document a manual check or
     verify an assumption)
```

Wait for user response before proceeding. If the user selects **Exit**, halt the skill
and do not proceed to Phase 0b or Phase 1. If the user selects **Continue anyway**,
note the override in session context and proceed to Phase 0b.

#### If classification is uncertain (JIRA-only, ambiguous signals):

```
## Testability Check — <JIRA-ID>

**Existing BB-DCC-QE tests:** <N or None>

**Test type scope:** ❓ Unknown — could not determine from JIRA fields alone

To proceed, please confirm: is this ticket for a:
  1. **User-facing UI flow** (page navigation, form, button, modal)
  2. **API endpoint** (REST, service boundary, AuthZ)
  3. **Backend / infrastructure change** (no UI or new API surface)
```

Wait for user response, then classify accordingly and continue.

---

## Exit criteria

- Existing BB-DCC-QE test count reported to user (or noted as unknown)
- Test type scope classified: `ui-e2e`, `api`, `none`, or `unknown` (resolved by user)
- Testability summary presented to user
- If scope is `none`: user has chosen to exit or override
- If scope is `ui-e2e` or `api`: proceed automatically to Phase 0b

## Next step
Proceed to **Phase 0b** (`steps/00b-qe-increment-readiness.md`) — QE Increment Readiness Check.
(Unless user chose Exit from a `none`-scope result.)
