---
name: qe-development
description: "Use when the user asks to develop, extend, refactor, or repair automated tests in the BB-DCC-QE repo; can supply a JIRA issue with acceptance criteria, an increment file (INC-XX), or alternative instructions; says 'add a Playwright test', 'write a Cucumber scenario', 'create step definitions', 'fix QE automation', 'cover this BZC flow', 'build a test', 'run QE for INC-001', 'automate INC-XXX', 'build tests for this increment'. Turns a test request into Playwright + Cucumber + Java automation changes in BB-DCC-QE via a phased workflow with approval checkpoints. All intermediary artifacts are stored in BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/."
---

# QE Development

Turn a JIRA issue (or user-provided instructions) into working Playwright +
Cucumber + Java test automation in BB-DCC-QE, following a phased workflow with
approval checkpoints between each step.

## When to use

- User asks to build, extend, fix, or refactor automated tests
- User provides a JIRA ticket with acceptance criteria
- User provides alternative test development instructions

## When NOT to use

- User wants to run existing tests → use `qe-execution`
- User wants to analyze test failures → use `qe-defect-review`
- User just wants to refresh codebase knowledge → use `qe-code-scanner`

## Inputs

| Input | Source | Required |
|---|---|---|
| JIRA ID (e.g. `CEAJ-1234`) | User-provided | Alternative entry point — prompted in Phase 0 if nothing supplied |
| INC ID (e.g. `INC-001`) | User-provided | Alternative entry point — reads INC file from KB; no Atlassian CLI needed |
| Plain instructions (if no JIRA issue exists) | User-provided | Fallback when no JIRA ID or INC ID |
| Atlassian CLI connectivity | `setup-atlassian-cli` prerequisite | Required when JIRA ID provided; not needed for INC or plain instructions |
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | Auto-seeded if missing |

## Outputs

| Output | Location | Committed |
|---|---|---|
| Test cases document | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/test-cases.md` | Yes |
| BDD scenarios draft | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/scenarios.md` | Yes |
| Reuse analysis | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/reuse-analysis.md` | Yes |
| Code output plan | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/code-output.md` | Yes |
| Sign-off record | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/sign-off.md` | Yes |
| Updated KNOWLEDGE.md | `BB-DCC-QE/docs/KNOWLEDGE.md` | Yes |
| Hand-off to qe-execution | Chat output (tags to run) | — |

## Workflow Overview

```
Phase 0:  Seed Knowledge (if docs/KNOWLEDGE.md missing → invoke qe-code-scanner)
Phase 0c: Testability Check — scan KNOWLEDGE.md for existing tests; classify UI/API/none
          scope from INC layer or JIRA signals; inform user; exit gracefully if no scope
Phase 0b: QE Increment Readiness — locate KB feature folder; create or read
          qe-package/qe-increment-status.md; surface ready INCs to user
Phase 1:  Understand Requirements — parse JIRA/instructions, map user journey
Phase 2:  Generate BDD Scenarios — write .feature drafts
Phase 3:  Reuse & Gap Analysis — check KNOWLEDGE.md, identify what to build
Phase 4:  Code Output — generate step defs, page methods, locators
Phase 5:  Sign-off & Apply — place files, apply changes to BB-DCC-QE
Phase 6:  Refresh Knowledge — invoke qe-code-scanner to update KNOWLEDGE.md
```

Each phase requires explicit user approval before proceeding.
Rejecting a phase resets all downstream phases.

See `steps/` for detailed per-phase instructions.

## Phase Summary

### Phase 0 — Seed Knowledge

1. **Elicit input** — if not supplied, prompt the user for a JIRA ID, an INC ID (e.g. `INC-001`), or "no ticket"
2. **If JIRA ID given:** invoke `setup-atlassian-cli` (prerequisite connectivity check), then fetch the issue via `node bin/atl.js jira issue <KEY>`. Hold as JIRA context for Phase 1.
3. **If INC ID given:** locate `TDBC-knowledge-base/features/<feature>/implementation-package/plan/increments/<INC-ID>.md`. Read the Goal, FR Mapping, Layer, and Acceptance Criteria sections. Hold as **INC context** for Phase 1. No Atlassian CLI required. Use the INC ID as the working directory name (e.g. `features/INC-001/`).
4. **If "no ticket":** prompt for a plain-English description of what to test. Hold as requirements context for Phase 1.
5. Check if `BB-DCC-QE/docs/KNOWLEDGE.md` exists; if missing → invoke `qe-code-scanner` skill
6. Read KNOWLEDGE.md — this is the single source of truth for this session
7. Create `BB-DCC-QE/features/<JIRA-ID-or-INC-ID-or-slug>/` directory

### Phase 0c — Testability Check

1. **Scan for existing tests** — search KNOWLEDGE.md Sections 7 and 8 for any feature file or tag matching the JIRA ID or INC ID; report the count to the user
2. **Classify test type scope** — using INC Layer field (highest confidence), test-plan §10 pyramid table, or JIRA component/description signals:
   - `L4` UI component → UI/E2E applicable
   - `L2`/`L3` service/API → API applicable
   - `L1` infrastructure (scheduler, mTLS, DB migration, config, audit) → not applicable
3. **Present testability summary** — show existing test count and scope classification to user
4. **If no scope:** inform the user "This increment has no BB-DCC-QE automation scope" and offer Exit or Continue-anyway. Halt if user exits.
5. **If scope is UI/E2E or API:** proceed automatically to Phase 0b
6. **If uncertain (JIRA-only):** ask one clarifying question (UI flow / API / backend-infra) then classify

See `steps/00c-testability-check.md` for full detail.

### Phase 0b — QE Increment Readiness Check

1. **If INC ID was supplied directly in Phase 0:** the KB feature folder and INC file are already known — skip the discovery loop. Go straight to step 3 to check the `qe-package/qe-increment-status.md` tracker.
2. **Otherwise:** search `TDBC-knowledge-base/features/` for the KB folder matching this work item (by JIRA keywords, user slug, or prompt-as-last-resort). If no `implementation-package/increment-status.md` found → skip (proceed to Phase 1 unconstrained).
3. If `qe-package/qe-increment-status.md` **does not exist** → read the three plan sources (increment-status, implementation-package, test-plan §10 pyramid) and create it, pre-populated with one row per INC and `n/a` / `not-ready` QE status
4. Read the tracker and surface a readiness report: Ready INCs (dev done), In-progress QE, Blocked (dev not done), N/A (dev-owned only)
5. **If INC ID was supplied directly:** confirm that specific INC is `ready` before proceeding; warn the user if it is `not-ready` or `n/a` and ask whether to continue anyway.
6. **Otherwise:** ask the user whether to start from a ready INC or continue with the original JIRA context
7. Load the chosen INC file (`INC-XXX.md`) as additional context if an INC was selected (already loaded if supplied in Phase 0)

See `steps/00b-qe-increment-readiness.md` for full detail.

### Phase 1 — Understand Requirements

1. Surface the loaded context (JIRA issue fields, INC file, or user description) — do not re-prompt
2. **Internally resolve FRs and ACs** — read `FR Mapping` from INC file; look up each FR in `05-functional-requirements.md`; find all matching ACs in `11-acceptance-criteria.md`; flag 🔴 TBD ACs as excluded, 🟡 Conditional as `@wip`
3. **Human Gate — FR/AC verification:** present a formatted FR table + AC table to the user; do not advance until the user replies APPROVED
4. Ask context questions (environment, persona, entry point, test type: UI vs API) — one at a time, after gate passes
5. Write plain-English summary, user journey, confidence rating, and FR/AC coverage table
6. Write output to `features/<JIRA-ID>/test-cases.md`
7. **Checkpoint: ask user to approve before proceeding to Phase 2**

See `steps/01-understand-requirements.md` for full detail.

### Phase 2 — Generate BDD Scenarios

1. Write full `.feature` file draft following conventions from KNOWLEDGE.md
2. Reuse existing steps (mark new ones with `# NEW STEP`)
3. Keep scenarios atomic — one behaviour each
4. Map each acceptance criterion to a scenario
5. Write output to `features/<JIRA-ID>/scenarios.md`
6. **Checkpoint: ask user to approve before proceeding**

### Phase 3 — Reuse & Gap Analysis

Run the lateral thinking checklist for every step/action:

1. What TYPE of interaction is this? (dialog, dropdown, table, form, etc.)
2. Does a GENERIC method exist for this type in KNOWLEDGE.md Section 3?
3. Does a SIMILAR step exist for a DIFFERENT feature in Section 8?
4. Can existing steps be COMBINED to cover this?
5. ONLY if all above fail → propose new code

Also run the duplication/quality check (from code-quality rules):
- Flag if new code duplicates existing method in KNOWLEDGE.md
- Flag if new code near-duplicates an existing method
- Flag if generic logic is in the wrong class

Output reuse score and gap table to `features/<JIRA-ID>/reuse-analysis.md`

**Checkpoint: ask user to approve before proceeding**

### Phase 4 — Code Output

1. Generate step definitions, page methods, utility extensions
2. Each block labelled with target file path and action (NEW/ADD TO EXISTING)
3. Follow locator strategy from KNOWLEDGE.md Section 21:
   - Store in objectRepo.properties with `{page}.{element}.{type}` naming
   - Priority: ID > data-attribute > name > CSS > XPath text > XPath attribute
   - Never hardcode locators in Java
4. Use utility methods from KNOWLEDGE.md Section 3 — never raw Playwright API
5. Write output to `features/<JIRA-ID>/code-output.md`
6. **Checkpoint: ask user to approve before proceeding**

### Phase 5 — Sign-off & Apply

1. Present file placement table (exact paths for every file)
2. Apply approved changes to BB-DCC-QE codebase
3. Record rollback plan (git revert command)
4. Write sign-off record to `features/<JIRA-ID>/sign-off.md`
5. **Checkpoint: user confirms sign-off**

### Phase 6 — Refresh Knowledge

1. Invoke `qe-code-scanner` to rescan the codebase
2. Updated KNOWLEDGE.md now reflects the newly added code
3. Report completion and offer hand-off to `qe-execution`

## Hand-off to qe-execution

After Phase 6, offer:
> "Tests are ready. Would you like to run them? The tag is `@<tag>` and default
> environment is PAT4. Invoke `qe-execution` to proceed."

## Rules — NEVER VIOLATE

- Never edit BB-DCC-QE code without user approval at the appropriate phase
- Never skip a phase or generate code without prior approval
- Never create a new class if an existing one can be extended
- Never duplicate an existing step — reuse or align wording
- Never hardcode locators or environment values in generated code
- Never write raw Playwright API calls if a utility method exists
- Never proceed past Phase 1 without confirming interpretation
- Never re-scan live code for something already in KNOWLEDGE.md
- Always write intermediary artifacts to `features/<JIRA-ID-or-INC-ID>/`
- Always refresh KNOWLEDGE.md after applying code changes (Phase 6)

