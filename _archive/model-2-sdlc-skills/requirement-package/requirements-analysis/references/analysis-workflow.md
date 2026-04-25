# Analysis Workflow

## Purpose

Define the entry-point sequence for the analysis phase — what the BSA does after discovery (or instead of discovery if skipped). Sequences the BSA's analysis skills in strict sequential order: (1) stakeholder-mapping (always runs — discovery does not produce a stakeholder map), (2) change-scoping to define the boundary of the change, (3) dependency-mapping to map what the change needs from the system, (4) impact-analysis to map what the change does to the system, (5) constraint-extraction to extract hard limits, (6) process-mapping to map future-state workflows, (7) user-journey-mapping to map future-state user experience flows, (8) gap-analysis to compare current vs future state and identify readiness gaps, (9) assumption-log consolidation, (10) decision-log consolidation, and (11) risk-analysis as the broadest risk view consuming everything above. Prevents the failure mode where analysis skills run without proper sequencing and produce inconsistent or contradictory outputs. The analysis phase produces the analytical foundation that the requirements phase consumes — no requirement is written without an analysis basis.

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

The sequence below tells you which reference file to read next. Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output artifact in full.
2. Present the artifact to the user.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step because a previous step's output seemed to cover it.
- Run steps in parallel — every step depends on the outputs of previous steps.
- Begin Phase 3 (Requirements) before step 11 (risk-analysis) is complete and acknowledged.

If any step's output cannot be produced, explicitly state that, write a minimal artifact recording the finding, present it, and proceed.

**After every step:** Update the assumption-log and decision-log with any new assumptions or decisions surfaced during that step. This is a running checkpoint — not a separate skill invocation.

---

## Step 0a — Determine Feature Folder

Before any analysis work begins, confirm the feature output folder. Discovery is optional — analysis may be the first phase run.

1. **Check for existing feature folder.** Look for `docs/*/requirements-package/` in the project repository. If a feature folder already exists from the discovery phase, reuse it.
2. **If no existing folder**, infer the feature name from the change description. Convert to kebab-case (e.g., `refund-processing`, `user-onboarding`).
3. **Present to the user:** *"I'll organize all requirements outputs under `docs/<feature-name>/requirements-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/requirements-package/`."*
5. **Create the folder structure** if it does not exist:
   - `docs/<feature>/requirements-package/analysis/`
   - `docs/<feature>/requirements-package/requirements/`

All file paths in subsequent steps use `docs/<feature>/requirements-package/analysis/` as the output root.

---

## When to Use

- The entry point for the analysis phase — whether or not discovery was completed
- After the discovery phase's current-capability-baseline is complete (standard path)
- As the first phase if discovery was skipped (discovery-skipped path)
- Before any requirements, design, or implementation work

## Scope

All analysis skills in this sequence are **scoped to the proposed change**. This is not a full system audit. The goal is to define the boundaries of the change and identify every risk, constraint, dependency, and gap before requirements are written.

## What This Does

Sequences the BSA's analysis skills in the order that maximises information quality before each step. Each skill arrives with the best available context from prior steps. This file is the workflow — it does not contain skill logic itself.

---

## Did Discovery Run?

Before starting, determine which path to follow:

**Discovery completed** if all of the following exist:
- `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` (from current-capability-synthesis)
- Confirmed requirements from requirements-elicitation
- Process maps and user journey maps from discovery

If discovery completed → **skip step 0** (change-description already exists at `docs/<feature>/requirements-package/discovery/change-description.md`) and start at **step 1** (stakeholder-mapping).

**Discovery was skipped** if any of the above are missing:
- Start at **step 0** (change-description capture) — the BSA needs a confirmed change description before any analysis begins
- Then proceed to **step 1** (stakeholder-mapping)
- Flag all system claims as assumptions throughout the sequence
- Seed the assumption-log immediately with every system claim from the user

**In both paths, step 1 (stakeholder-mapping) always runs.** Discovery does not produce a stakeholder map, so this step is the only place a formal change-focused stakeholder map is produced.

---

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  ANALYSIS WORKFLOW — BSA ANALYSIS SEQUENCE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0. change-description capture ──► change-description.md        │
│     (CONDITIONAL — only if          Confirmed who / what / why  │
│     discovery was skipped;                                      │
│     if discovery ran, change-                                   │
│     description.md already exists)                              │
│              │                                                  │
│              ▼                                                  │
│  1. stakeholder-mapping        ──► stakeholder-map              │
│     (ALWAYS RUNS — discovery        Change-focused: who         │
│     does not produce a map)         approves, who is impacted   │
│              │                                                  │
│              ▼                                                  │
│  2. change-scoping             ──► change-scope                 │
│     Define the boundary of          In-scope / out-of-scope /   │
│     the change                      must-not-touch              │
│              │                                                  │
│              ▼                                                  │
│  3. dependency-mapping         ──► dependency-map               │
│     What the change needs           Business capabilities,      │
│     FROM the system                 data, processes, access     │
│                                     controls, external services │
│              │                                                  │
│              ▼                                                  │
│  4. impact-analysis            ──► impact-analysis              │
│     What the change does            Blast radius across         │
│     TO the business                 processes, customers, teams │
│              │                                                  │
│              ▼                                                  │
│  5. constraint-extraction      ──► constraint-register          │
│     Hard limits the change          Business, regulatory,       │
│     must operate within             operational, performance    │
│              │                                                  │
│              ▼                                                  │
│  6. process-mapping            ──► to-be process-map(s)         │
│     Map future-state                How workflows will work     │
│     workflows                       after the change            │
│              │                                                  │
│              ▼                                                  │
│  7. user-journey-mapping       ──► to-be user-journey-map(s)    │
│     Map future-state user           How the user experience     │
│     experience flows                will work after the change  │
│              │                                                  │
│              ▼                                                  │
│  8. gap-analysis               ──► gap-analysis                 │
│     Compare current vs future       Readiness gaps: tooling,    │
│     state; identify gaps            data, expertise, process    │
│              │                                                  │
│              ▼                                                  │
│  9. assumption-log             ──► assumption-log               │
│     Consolidation pass —           Review, clean up, assign     │
│     formal review before           owners, set deadlines        │
│     risk-analysis                                               │
│              │                                                  │
│              ▼                                                  │
│  10. decision-log              ──► decision-log                 │
│      Consolidation pass —           Review all decisions from   │
│      formal review before           steps 1–9                   │
│      risk-analysis                                              │
│              │                                                  │
│              ▼                                                  │
│  11. risk-analysis             ──► risk-register                │
│      Broadest risk view —           Requirements-level risks    │
│      consumes everything above      across all categories       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Step 0 — Capture the Change Description (Discovery-Skipped Only)

**This step only runs when discovery was skipped.** If discovery ran, `docs/<feature>/requirements-package/discovery/change-description.md` already exists from discovery Step 0 — skip to step 1.

**This is the first thing you do. Do not read any reference file or conduct any analysis until Step 0 is complete.**

Ask the user for the feature request. The description must identify all three of the following before you proceed:

1. **Who** — the user, role, or system actor affected by or using the new feature
2. **What** — the action, capability, or behaviour being added or changed
3. **Why** — the intended outcome or business goal it serves

Present these three requirements explicitly and ask the user to provide them. Do not infer or assume any of the three from context — they must be stated.

**If the description is incomplete:** identify which of the three items is missing and ask for it specifically. Do not proceed until all three are present.

**Once all three are confirmed**, record the feature request as a single **Change Description** statement in this format:

> *[Who] needs to be able to [what] so that [why].*

Present the Change Description to the user and ask: **"Is this an accurate description of what you want to build?"** Do not proceed until the user confirms it is correct. If they correct it, update the statement and ask again.

**Write the confirmed Change Description to `docs/<feature>/requirements-package/analysis/change-description.md`.** The file must contain:
- The confirmed Change Description statement
- The three elements listed separately: **Who**, **What**, **Why**

The file write must succeed before proceeding to Step 1. If the `docs/<feature>/requirements-package/analysis/` directory does not exist, create it.

This file is the anchor for every step that follows. Every analysis skill reads it as context — every scoping decision, every dependency traced, and every risk assessed is scoped to it.

---

## Why This Order

### Step 0 (Change Description) — Conditional Gate

Only runs if discovery was skipped. Without discovery Step 0, no confirmed change description exists. Every subsequent step needs to know what the change is before it can operate. If discovery ran, the change description already exists at `docs/<feature>/requirements-package/discovery/change-description.md`.

### Step 1 (Stakeholder Mapping) — Always First

Always runs. Discovery does not produce a stakeholder map. The BSA needs to know who to consult before scoping the change, regardless of whether discovery ran. When discovery ran, step 1 seeds the stakeholder picture from discovery outputs (`docs/<feature>/requirements-package/discovery/elicitation-outputs.md`, `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`) before consulting the user. When discovery was skipped, everything is derived from the user's description of the change.

### Step 2 (Change Scoping) Before Everything Else

Every other analysis skill operates within the boundaries change-scoping defines. Without a scope, dependency-mapping, impact-analysis, and constraint-extraction have no anchor.

### Steps 3–5 (Dependencies, Impact, Constraints) Before Steps 6–7 (Future-State Maps)

The BSA needs to know what the change plugs into (dependencies), what it affects (impact), and what limits it (constraints) before designing the future-state workflows and journeys. Future-state maps designed without constraint awareness will need rework.

### Steps 6–7 (Future-State Maps) Before Step 8 (Gap Analysis)

Gap analysis compares current state (from discovery, if available) against future state (from steps 6–7). Without to-be process maps and journey maps, gap analysis has nothing to compare against.

### Step 8 (Gap Analysis) Before Steps 9–10 (Log Consolidation)

Gap analysis identifies what is missing — including tooling, data, and organisational readiness gaps. Log consolidation then reviews all assumptions and decisions surfaced during steps 1–8 before risk-analysis consumes them.

### Steps 9–10 (Log Consolidation) Before Step 11 (Risk Analysis)

Risk analysis consumes the assumption-log as an input — unverified assumptions are risks. The consolidation pass ensures all assumptions and decisions from steps 1–8 are reviewed, cleaned up, and ready for risk-analysis to consume.

### Step 11 (Risk Analysis) Last

Risk analysis is the broadest view. It requires all prior outputs: scope, dependencies, impact, constraints, gaps, assumptions, and decisions. Running it last means it has the complete picture.

## Analysis Phase Outputs

| Output | Produced By | Consumed By |
|--------|------------|------------|
| `docs/<feature>/requirements-package/analysis/change-description.md` (if discovery skipped) | Step 0 (workflow) | all subsequent steps — every skill reads it as context |
| `docs/<feature>/requirements-package/analysis/stakeholder-map.md` | stakeholder-mapping (step 1 — always runs) | change-scoping, all subsequent steps; requirements phase: executive-summary (key stakeholders, approval chain), stakeholder-personas |
| `docs/<feature>/requirements-package/analysis/change-scope.md` | change-scoping | dependency-mapping, impact-analysis, constraint-extraction, gap-analysis, risk-analysis; requirements phase: executive-summary (scope boundaries), functional-requirements (scope pre-check and SC-xxx links), assumptions-constraints-scope (out-of-scope and must-not-touch lists) |
| `docs/<feature>/requirements-package/analysis/dependency-map.md` | dependency-mapping | impact-analysis, constraint-extraction, gap-analysis, risk-analysis; requirements phase: executive-summary (critical external dependencies), functional-requirements (DEP-xxx links for new-behavior integration points) |
| `docs/<feature>/requirements-package/analysis/impact-analysis.md` | impact-analysis | **constraint-extraction** (step 5 — required input; operational, performance, and security impacts may reveal additional constraints), gap-analysis (step 8), risk-analysis (step 11); requirements phase: content reaches requirements **indirectly through the risk-register** — see important note below |
| `docs/<feature>/requirements-package/analysis/constraint-register.md` | constraint-extraction | process-mapping, gap-analysis, risk-analysis; requirements phase: executive-summary (regulatory and contractual pressures), functional-requirements (CONST-xxx links for every requirement), assumptions-constraints-scope (all constraint entries carried forward) |
| `docs/<feature>/requirements-package/analysis/process-map-[process-name].md` | process-mapping | user-journey-mapping, gap-analysis, risk-analysis; requirements phase: user-journeys (stage sequencing and system context), functional-requirements (process steps as candidate requirements), business-rules (business rules table as input source) |
| `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md` | user-journey-mapping | gap-analysis, risk-analysis; requirements phase: user-journeys (carried forward as starting point, then re-annotated with requirements-phase satisfaction scores) |
| `docs/<feature>/requirements-package/analysis/gap-analysis.md` | gap-analysis | risk-analysis (step 11 — escalated gaps become risk entries); requirements phase: executive-summary reads the gap-analysis directly (alongside risk-register) to surface outstanding readiness gaps in the key risks section — see important note below |
| `docs/<feature>/requirements-package/analysis/assumption-log.md` | assumption-log | risk-analysis (unverified assumptions become risk entries); requirements phase: assumptions-constraints-scope (all entries carried forward into the consolidated register) |
| `docs/<feature>/requirements-package/analysis/decision-log.md` | decision-log | requirements phase: assumptions-constraints-scope (scope boundary decisions and Won't-have decisions carried forward as out-of-scope items with DEC ID as source; constraint waivers and accepted constraints carried forward into constraint register) |
| **`docs/<feature>/requirements-package/analysis/risk-register.md`** | **risk-analysis** | requirements phase: executive-summary (critical and high-severity risks summarised in key risks section), functional-requirements (risk grounding for preserved behavior items); requirements-package |

> **Important — impact-analysis and gap-analysis in the requirements phase:** Neither artifact is read directly by a requirements-phase skill other than through the risk-register and executive-summary. Operational readiness requirements (training, support model design, documentation) identified in impact-analysis but **not** escalated to a risk entry have no guaranteed path to the requirements package. To ensure all content reaches requirements: (1) every operational readiness item in impact-analysis that would not otherwise surface as a risk must be explicitly registered as a gap in the gap-analysis at the time of impact-analysis (step 4), and (2) the executive-summary skill reads the gap-analysis directly when analysis ran, surfacing outstanding unclosed readiness gaps in the key risks section alongside risk-register entries.

The **risk-register** is the analysis phase's final output. All analysis artifacts feed into the requirements phase.

## Entry Criteria

Before starting the analysis workflow, confirm:

- [ ] Either: discovery is complete (`docs/<feature>/requirements-package/discovery/change-description.md` and `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` exist), OR: the user is available to provide a change description in Step 0 and sufficient context for the analysis to proceed without discovery
- [ ] The user is available to answer questions during analysis

## Exit Criteria

Analysis is complete when:

- [ ] A confirmed Change Description exists — either from discovery (`docs/<feature>/requirements-package/discovery/change-description.md`) or from Step 0 (`docs/<feature>/requirements-package/analysis/change-description.md`)
- [ ] All steps have been executed in sequence (skipping step 0 only if discovery ran; step 1 always runs)
- [ ] All analysis artifacts are written to disk
- [ ] The assumption-log and decision-log have been formally consolidated
- [ ] The risk-register is complete and presented to the user
- [ ] The requirements phase (executive-summary → functional-requirements → remaining requirements skills) can begin from the analysis artifacts alone

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 0 | *(workflow — no reference file)* | `docs/<feature>/requirements-package/analysis/change-description.md` | Conditional — only if discovery was skipped; all three elements (who / what / why) must be present, confirmed by user, and written to file before Step 1 begins |
| 1 | `stakeholder-mapping` | `docs/<feature>/requirements-package/analysis/stakeholder-map.md` | Always runs — seeds from discovery outputs when discovery ran; derives from user when discovery skipped |
| 2 | `change-scoping` | `docs/<feature>/requirements-package/analysis/change-scope.md` | Must complete before any other analysis skill |
| 3 | `dependency-mapping` | `docs/<feature>/requirements-package/analysis/dependency-map.md` | Maps inward dependencies — what the change needs |
| 4 | `impact-analysis` | `docs/<feature>/requirements-package/analysis/impact-analysis.md` | Maps outward effects — what the change does to the business, its processes, customers, and teams |
| 5 | `constraint-extraction` | `docs/<feature>/requirements-package/analysis/constraint-register.md` | Hard limits the change must operate within |
| 6 | `process-mapping` | `docs/<feature>/requirements-package/analysis/process-map-[process-name].md` | Future-state workflows — always runs |
| 7 | `user-journey-mapping` | `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md` | Future-state user experience — always runs |
| 8 | `gap-analysis` | `docs/<feature>/requirements-package/analysis/gap-analysis.md` | Current vs future state comparison |
| 9 | `assumption-log` | `docs/<feature>/requirements-package/analysis/assumption-log.md` | Consolidation pass — formal review |
| 10 | `decision-log` | `docs/<feature>/requirements-package/analysis/decision-log.md` | Consolidation pass — formal review |
| 11 | `risk-analysis` | `docs/<feature>/requirements-package/analysis/risk-register.md` | Broadest risk view — runs last |

## Discovery-Skipped: Confidence Degradation

When discovery was skipped, the analysis operates at reduced confidence:

| Missing artifact | Effect on analysis |
|---|---|
| `current-capability-baseline` | Every skill loses its primary system context — all system claims are assumptions |
| `current-capability-inventory` | dependency-mapping cannot assess existing capability coverage |
| `documentation-currency-assessment` | constraint-extraction cannot harvest documented constraints |
| Current-state process maps | gap-analysis compares against user-stated current state, not evidence-derived maps |
| Current-state user journey maps | Same — no evidence-based current-state comparison for journeys |
| Confirmed requirements from elicitation | Requirements are unvalidated assumptions, not stakeholder-confirmed facts |

**Recommendation gate:** If during change-scoping (step 2) the change touches more than one business capability or shared process, the workflow should recommend going back and running discovery before continuing. The BSA presents this recommendation to the user — the user decides whether to proceed or pause for discovery.

## What Comes After Analysis

The analysis artifacts feed the **requirements phase** (see `requirements-writing-workflow.md`):
1. `executive-summary` — frames the feature and business context
2. `stakeholder-personas` — identifies stakeholders and defines user personas
3. `business-objectives` — defines measurable success criteria
4. `user-journeys` — maps end-to-end user experience flows
5. `functional-requirements` — the formal requirements specification (delta spec for brownfield)
6. Remaining requirements skills — business rules, data requirements, permissions, NFRs, assumptions-constraints-scope
7. `package-synthesis` — assembles the single deliverable

The requirements phase consumes all analysis artifacts. No requirement is written without an analysis foundation.

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| Analysis starts without a confirmed change description (when discovery skipped) | Step 0 captures who / what / why and writes it to file before any skill runs |
| Analysis skills run without defined scope boundaries | Step 2 (change-scoping) must complete before any other analysis skill begins |
| Future-state workflows designed without knowing constraints | Steps 3–5 (dependencies, impact, constraints) run before steps 6–7 (future-state maps) |
| Gap analysis has no future state to compare against | Steps 6–7 produce to-be maps before step 8 (gap-analysis) |
| Risk analysis misses unverified assumptions | Steps 9–10 consolidate logs before step 11 (risk-analysis) consumes them |
| BSA enters analysis without knowing who to consult | Step 1 (stakeholder-mapping) always runs — seeds from discovery outputs when available, from user when not |
| Analysis artifacts produced in inconsistent order with conflicting information | Strict sequential execution prevents parallel inconsistencies |
| Requirements written without analytical foundation | Exit criteria require all analysis artifacts before Phase 3 begins |

## Phase Handoff

After `docs/<feature>/requirements-package/analysis/risk-register.md` is complete and acknowledged, ask the user:

> Analysis is complete. The scope, dependencies, constraints, gaps, assumptions, decisions, and risks are ready to feed requirements writing. Are you ready to start requirements writing?

If yes, activate or recommend the `requirements-writing` skill. If no, stop and summarize the completed analysis outputs and the next recommended phase.
