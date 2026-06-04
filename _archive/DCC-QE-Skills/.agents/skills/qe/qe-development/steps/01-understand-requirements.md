# Phase 1 — Understand Requirements

## Purpose
Parse the requirements context loaded in Phase 0, **extract and structure all acceptance criteria** (from the KB or directly from the JIRA issue), draft a BDD scenario title for each, surface them to the user for verification, and only proceed once the user explicitly approves. This is a Human Gate — do not advance to Phase 2 until the user passes it.

## Process

### Step 1 — Load and surface context

State clearly what was loaded by Phase 0:

- **From JIRA:** "Using JIRA issue `<KEY>` — `<summary>`." Show the acceptance criteria and description fields extracted from the fetched issue.
- **From INC file (Phase 0b):** "Using INC-XXX — `<name>`." Show the FR Mapping and Goal sections.
- **From user description:** "Using provided description: `<first line of description>`." Show the full description back to the user.

Do not re-prompt for requirements. Phase 0 already established the context; Phase 1 consumes it.

---

### Step 2 — Extract and structure Acceptance Criteria

**Do this automatically — do not ask the user to supply AC IDs.**

Branch on the available context:

#### Branch A — KB folder available (INC or JIRA with KB match)

1. Read the INC file's `## 1. Increment Identity` section → extract `FR Mapping:` field (e.g. `FR.UPL-001, FR.UPL-002, FR.UPL-003`)
2. Open `TDBC-knowledge-base/features/<feature-folder>/requirements-package/requirements/05-functional-requirements.md`
   - Search for each FR ID and extract: **Statement**, **Details**, **Priority**, **OQs**
3. Open `TDBC-knowledge-base/features/<feature-folder>/requirements-package/requirements/11-acceptance-criteria.md`
   - For each FR ID, find all AC rows whose `FRs:` annotation or table section references that FR
   - Extract: **AC ID**, **Status** (✅/🟡/🔴), **Criterion text**
4. Flag any AC with status `🔴 TBD` — these **cannot** generate test cases until the open question is resolved; exclude them and note why
5. Flag any AC with status `🟡 Conditional` — include them but mark as `@wip` / assumption-heavy

#### Branch B — JIRA-only context (no KB folder found)

1. Parse the JIRA issue markdown fetched in Phase 0. Look for acceptance criteria in these locations, in order:
   - A dedicated `Acceptance Criteria` field
   - A section heading `## Acceptance Criteria` or `## AC` in the description body
   - A numbered or bulleted list in the description that describes expected behaviour
2. Extract each criterion as a separate item and assign provisional IDs: `AC-J-001`, `AC-J-002`, etc.
3. Apply status flags:
   - `🟡 Needs clarification` — if the criterion uses vague language (e.g. "should work correctly", "behaves as expected", "no errors") — flag and note what is ambiguous
   - `✅ Clear` — if the criterion describes a specific, testable outcome
   - `🔴 Excluded` — if the criterion is explicitly out of scope or deferred
4. If **no acceptance criteria are found** in the JIRA issue at all, prompt the user once:
   > "No acceptance criteria were found in JIRA issue `<KEY>`. Please provide the acceptance criteria before I can generate test cases."
   Wait for the user to supply them. Number each as `AC-J-001`, `AC-J-002`, etc. and continue.

#### Both branches — Draft BDD scenario titles

For every ✅ and 🟡 AC (regardless of source), immediately draft a **BDD scenario title**:
- Must be a business-readable outcome, not a technical description
- Format: `[Subject] [action/state] [outcome]` — e.g. `"User successfully uploads a valid CSV file"`
- If the AC is already written in Given/When/Then language, extract the business outcome as the scenario title
- If the AC describes multiple distinct flows (happy path + error path), draft a separate scenario title for each
- 🔴 ACs get no scenario title — mark as `—`

---

### Step 3 — Surface ACs and draft scenario titles for user verification (Human Gate)

Present the following report to the user. Do not proceed past this point without explicit approval.

```
## Phase 1 — Acceptance Criteria & Draft BDD Scenarios

### Scope
<INC-XXX — <name> | JIRA <KEY> — <summary>>
<FR Mapping: FR.XXX-001, FR.XXX-002, ... | (JIRA-extracted — no KB FR mapping)>

### Functional Requirements identified        ← omit this section if Branch B (JIRA-only)
| FR ID | Priority | Statement (summary) | OQs |
|---|---|---|---|
| FR.XXX-001 | M | ... | None |
| FR.XXX-002 | M | ... | OQ-NNN |

### Acceptance Criteria & Draft Scenario Titles
| AC ID | Status | Criterion (summary) | Draft Scenario Title | Generates test? |
|---|---|---|---|---|
| AC-XXX-001 | ✅ | ... | User successfully uploads a valid CSV file | Yes |
| AC-XXX-002 | 🟡 | ... (conditional on OQ-NNN) | System rejects an invalid CSV with a clear error message | Yes — @wip |
| AC-XXX-003 | 🔴 | ... (TBD — OQ-NNN unresolved) | — | No — excluded |

### Assumptions
1. <any inference made where AC was ambiguous or scenario title was rewritten>

### Confidence
- Understanding: ⭐⭐⭐☆☆ (X/5)
```

Then ask:

> **"Does this AC mapping and draft scenario structure look correct? Reply APPROVED to proceed to Phase 2 where I will write the full Gherkin steps, or tell me what to correct."**

**If the user rejects:** apply corrections, re-surface the table, and ask again. Do not proceed until APPROVED.

---

### Step 4 — Ask context questions (only after FR/AC approved)

After the Human Gate passes, ask the following — one at a time:
- Which environment will this test run against? (list options from KNOWLEDGE.md Section 23)
- Which user role / persona? (list options from KNOWLEDGE.md Section 12)
- Confirm entry point / auth pattern (from KNOWLEDGE.md Section 8)
- Confirm test type: **UI end-to-end** or **API integration test** (where both are viable, present the trade-off)

---

### Step 5 — Write test-cases.md

Write to `features/<JIRA-ID-or-INC-ID>/test-cases.md`. This file is the BDD contract for Phase 2 — it must contain a draft scenario title and skeleton for every ✅ and 🟡 AC before Phase 2 begins.

```markdown
# Test Cases — <JIRA-ID or INC-ID>

## Session Info
- **Date:** <timestamp>
- **Environment:** <selected>
- **User Role:** <selected>
- **Entry Point:** <exact login step from KNOWLEDGE.md>
- **Requirement Reference:** <JIRA-ID or INC-XXX>
- **Test Type:** UI / API / Accessibility / Other
- **AC Source:** KB (11-acceptance-criteria.md) | JIRA-extracted

## What This Test Covers
<plain English summary>

## FR Coverage                          ← omit if Branch B (JIRA-only, no KB FRs)
| FR ID | Statement |
|---|---|
| FR.XXX-001 | ... |

## Acceptance Criteria & Draft Scenarios

| AC ID | Status | Criterion | Draft Scenario Title |
|---|---|---|---|
| AC-XXX-001 | ✅ | User uploads a valid CSV | User successfully uploads a valid CSV file |
| AC-XXX-002 | 🟡 @wip | Upload fails for invalid format | System rejects an invalid CSV with a clear error message |
| AC-XXX-003 | 🔴 excluded | TBD — OQ-NNN unresolved | — |

## Draft Feature Skeleton

```gherkin
@<tag>
Feature: <Feature name>

  Background:
    # Entry point — to be confirmed in Phase 2

  Scenario: <Draft scenario title for AC-XXX-001>
    Given <TBD — Phase 2>
    When <TBD — Phase 2>
    Then <TBD — Phase 2>

  @wip
  Scenario: <Draft scenario title for AC-XXX-002>
    Given <TBD — Phase 2>
    When <TBD — Phase 2>
    Then <TBD — Phase 2>
```

## Confidence
- **Understanding:** ⭐⭐⭐☆☆ (X/5)
- **Assumptions:** <list — a new tester must be able to follow the reasoning>
- **Excluded ACs:** <list ACs with 🔴 status and reason>

## Open Questions
<list any unresolved questions that may affect test design>
```

### Rules for writing test-cases.md
- Every ✅ AC must have exactly one (or more) draft scenario title — no exceptions
- Every 🟡 AC must have a draft scenario title tagged `@wip`
- 🔴 ACs are listed but have no scenario title
- Scenario titles must be business-readable outcomes, not technical descriptions
- If an AC covers multiple distinct flows (e.g. success + failure), create a separate draft scenario title for each flow
- The Draft Feature Skeleton includes only scenario titles and `TBD` step placeholders — full Gherkin steps are written in Phase 2
- If an AC was already written in Given/When/Then language, extract the business outcome as the scenario title; do not paste raw Given/When/Then text into the title

### Confidence rating rules
- Default to 3/5 unless requirement is completely unambiguous
- Never self-rate 5/5 if any assumptions were made
- List every assumption — a new tester needs to see reasoning

---

## Checkpoint

> "Phase 1 complete — `test-cases.md` written with [N] draft scenarios covering [N] acceptance criteria. Ready to move to Phase 2 where I will write the full Gherkin steps? Reply APPROVED or tell me what to correct."

## Exit criteria
- All ACs extracted and structured (from KB or JIRA — Branch A or B)
- Draft BDD scenario title authored for every ✅ and 🟡 AC
- User has APPROVED the AC mapping and draft scenario titles (Human Gate passed)
- Context questions answered (environment, role, entry point, test type)
- `test-cases.md` written to `features/<JIRA-ID-or-INC-ID>/` with Draft Feature Skeleton
- User has approved Phase 1 checkpoint

