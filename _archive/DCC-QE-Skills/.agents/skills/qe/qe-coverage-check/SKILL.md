---
name: qe-coverage-check
description: "Use when the user wants to check whether all increments in an implementation package have BB-DCC-QE test coverage; says 'check QE coverage', 'are all increments covered', 'what's missing in QE', 'coverage report', 'which INCs have no tests', 'audit QE coverage', 'coverage gap', 'have all increments been tested'. Reads the implementation package, cross-references each INC against the QE tracker and BB-DCC-QE codebase, and produces a structured coverage report showing which increments are fully covered, in-progress, ready but not started, blocked, or not applicable."
---

# QE Coverage Check

Audit BB-DCC-QE test coverage against every increment in an implementation package.
Produces a structured coverage report and flags gaps with recommended next actions.

## When to use

- QA lead or team wants a full coverage picture before a release
- User asks "which increments are missing tests?"
- After a batch of `qe-development` sessions — confirm nothing was missed
- Periodic audit: "are all done INCs covered?"
- User provides a feature name, KB folder, JIRA ID, or INC ID as the starting point

## When NOT to use

- User wants to build tests → use `qe-development`
- User wants to run tests → use `qe-execution`
- User wants to analyse failures → use `qe-defect-review`
- User just wants to refresh codebase knowledge → use `qe-code-scanner`

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| Feature / KB folder name | User-provided or auto-detected | Yes | e.g. `outgoing-wires-mvp2-import` |
| `implementation-package/increment-status.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | Master list of all INCs and dev status |
| `implementation-package/plan/test-plan.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | §10 pyramid table — determines which INCs require BB-DCC-QE E2E |
| `implementation-package/plan/increments/INC-XXX.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | Layer and name per INC |
| `qe-package/qe-increment-status.md` | `TDBC-knowledge-base/features/<feature>/` | No — created if absent | QE status and tags per INC |
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | No — enhances live tag check | Used to verify tags exist in codebase |

## Outputs

| Output | Destination | Format |
|---|---|---|
| Coverage report | Chat | Structured markdown — summary + detail table + gaps table |
| Updated `qe-increment-status.md` | `TDBC-knowledge-base/features/<feature>/qe-package/` | Markdown — created if it did not exist |
| Next-action recommendations | Chat | Checklist with skill hand-off links |

## Process Overview

```
1. Locate KB feature folder
2. Read implementation-package (increment-status, test-plan §10, INC files)
3. Read / create qe-increment-status.md
4. Cross-reference tags against KNOWLEDGE.md (live drift check)
5. Produce coverage report
6. Offer next actions
```

## Step-by-step

### Step 1 — Locate the KB feature folder

Accept any of the following as the entry point:
- Direct feature folder name (e.g. `outgoing-wires-mvp2-import`)
- JIRA ID — use JIRA summary keywords to match a folder name
- INC ID — resolve the parent feature folder from the INC file path

If the folder cannot be auto-detected, ask once:
> "Which feature folder should I audit? (e.g. `outgoing-wires-mvp2-import` under
> `TDBC-knowledge-base/features/`)"

Hold the resolved path as **KB_FEATURE_ROOT**.

---

### Step 2 — Read the implementation package

Read all three sources:

1. `<KB_FEATURE_ROOT>/implementation-package/increment-status.md`
   - Extract: INC ID, Name, Dev Status for every INC

2. `<KB_FEATURE_ROOT>/implementation-package/plan/test-plan.md` §10 pyramid table
   - For each INC, determine: E2E column ✔ (BB-DCC-QE required) or blank (dev-owned only)

3. `<KB_FEATURE_ROOT>/implementation-package/plan/increments/INC-XXX.md` for each INC
   - Extract: Layer field

Build an internal master list:

| INC | Name | Layer | Dev Status | E2E Required? |
|---|---|---|---|---|
| INC-001 | ... | L4 | done | Yes |
| INC-002 | ... | L1 | done | No (dev-owned) |

---

### Step 3 — Read or create qe-increment-status.md

Check if `<KB_FEATURE_ROOT>/qe-package/qe-increment-status.md` exists.

**If NOT found:**
- Create it now using the master list from Step 2
- Pre-populate each row: `n/a` for dev-owned INCs, `not-ready` for INCs where dev is not `done`, `ready` for INCs where dev is `done` and E2E is required
- Tell the user: "No QE tracker found — created `qe-increment-status.md` with <N> rows."

**If found:**
- Read current QE Status and BB-DCC-QE tag / feature file per INC
- Merge with the master list (add any INCs that appear in the implementation package but are missing from the tracker)

---

### Step 4 — Live tag check against KNOWLEDGE.md

If `BB-DCC-QE/docs/KNOWLEDGE.md` is available:

For each INC whose QE tracker has a BB-DCC-QE tag:
- Search KNOWLEDGE.md Sections 7 and 8 for the tag (e.g. `@INC-001`, `@BZC-5678`)
- If **found**: confirm live coverage count (number of scenarios)
- If **not found**: flag as ⚠️ **Drift** — tracker claims coverage but tag is absent from codebase

If KNOWLEDGE.md is not available, skip this step and note: "Live tag check skipped — run `/qe-code-scanner` to enable."

---

### Step 5 — Produce coverage report

Present the following report in chat:

```
## QE Coverage Report — <feature>
Generated: <date>
Implementation package: <N> total INCs

### Summary
| Status | Count |
|---|---|
| ✅ Fully covered (done, tag verified) | N |
| 🔄 In-progress | N |
| ⚠️ Ready but not started | N |
| 🔴 Not covered (not-ready — blocked on dev) | N |
| ⚠️ Drift — tracker says done but tag not in codebase | N |
| ➖ Not applicable (dev-owned only) | N |

### Coverage Detail
| INC | Name | Layer | Dev Status | QE Status | Tag | Scenarios in BB-DCC-QE | Gap? |
|---|---|---|---|---|---|---|---|
| INC-001 | ... | L4 | done | done | @INC-001 | 3 | ✅ |
| INC-002 | ... | L3 | done | ready | — | 0 | ⚠️ No automation yet |
| INC-003 | ... | L1 | done | n/a | — | — | ➖ |
| INC-004 | ... | L4 | in-progress | not-ready | — | 0 | 🔴 Blocked on dev |
| INC-005 | ... | L4 | done | done | @INC-005 | 0 (tag not found) | ⚠️ Drift |

### Gaps requiring action
| INC | Name | Issue | Recommended action |
|---|---|---|---|
| INC-002 | ... | Dev done, QE not started | `/qe-development INC-002` |
| INC-005 | ... | Tag @INC-005 not in KNOWLEDGE.md | `/qe-code-scanner` then recheck |
```

---

### Step 6 — Offer next actions

After presenting the report, ask:
> "Would you like to:
> 1. Start QE automation for an uncovered INC — tell me which one (e.g. `INC-002`)
> 2. Refresh codebase knowledge to resolve drift warnings — invoke `/qe-code-scanner`
> 3. Exit"

If the user picks an INC to work on, hand off directly:
> "Invoking `qe-development` for INC-002..."

---

## Rules — NEVER VIOLATE

- Never mark an INC as `done` in the tracker unless the tag is verified in KNOWLEDGE.md
- Never skip Step 2 — the implementation package is the source of truth for what must be covered
- Never report coverage as complete if any ✔ E2E INC has QE Status other than `done`
- Always create `qe-increment-status.md` if it does not exist — never report without a tracker

## Hand-off

- Gaps found → offer `/qe-development <INC-ID>` per uncovered INC
- Drift found → offer `/qe-code-scanner` to refresh KNOWLEDGE.md then re-run
- All covered → confirm and exit
