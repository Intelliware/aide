# Discovery Workflow

## Purpose

Define the entry-point sequence for a brownfield project — what the BA/PO does first when someone says "add feature X to existing app Y." Sequences the BA/PO's discovery skills for the brownfield case: (1) codebase-discovery, where the AI reads the existing system and produces a plain-English current-capability inventory for the BA/PO to review, (2) existing-artifact-review to assess what documentation exists and whether it reflects reality, (3) process-mapping to document as-is workflows and business processes the existing system supports, (4) user-journey-mapping to map current user journeys and identify where the new feature intersects with or extends existing paths, (5) targeted requirements-elicitation informed by what the AI already learned from the system — asking the BA/PO to confirm assumptions, clarify ambiguous behaviour, and describe the desired change in context of what exists, and (6) current-capability-synthesis to synthesise all discovery outputs into a unified current-state baseline document. Process-mapping and user-journey-mapping are sequenced before elicitation so the BA/PO can ask informed questions about process and journey gaps rather than explaining workflows the system already reveals. Current-capability-synthesiser is placed at the end as the assembly step that merges all discovery outputs into the coherent baseline that feeds into the analysis phase. Prevents the failure mode where an AI agent either asks the BA/PO to explain everything the system already shows (wasting time) or makes assumptions about the existing system without verifying them (producing conflicting requirements). The discovery phase produces two outputs that feed downstream: (1) the current-capability-baseline document from current-capability-synthesis, which feeds into the analysis phase (change-scoping, dependency-mapping, impact-analysis, constraint-extraction), and (2) the elicited requirements from requirements-elicitation, which feed into the requirements phase (functional-requirements).

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

The sequence below tells you which reference file to read next. Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output artifact in full — in plain, non-technical language for the BA/PO to review.
2. Present the artifact to the BA/PO.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step because "the questions answered it."
- Proceed to requirements-elicitation before steps 1–4 are complete.
- Begin Phase 2 (Analysis) before the current-capability-baseline from step 6 is presented and acknowledged.
- Proceed past Step 0 without an explicit, confirmed feature request description.

If any step's output cannot be produced (e.g., no documentation exists for step 2), explicitly state that, write a minimal artifact recording what was found (even if empty), present it, and then proceed.

## Step 0a — Determine Feature Folder

Before any discovery work begins, determine the feature output folder.

1. **Infer the feature name** from the change description. Convert to kebab-case (e.g., `refund-processing`, `user-onboarding`).
2. **Present to the user:** *"I'll organize all requirements outputs under `docs/<feature-name>/requirements-package/`. Does this folder name work?"*
3. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/requirements-package/`."*
4. **Create the folder structure** if it does not exist:
   - `docs/<feature>/requirements-package/discovery/`
   - `docs/<feature>/requirements-package/analysis/`
   - `docs/<feature>/requirements-package/requirements/`

All file paths in subsequent steps use `docs/<feature>/requirements-package/` as the root.

---

## Step 0 — Capture the Feature Request (Hard Gate)

**This is the first thing you do. Do not read any reference file or examine any code until Step 0 is complete.**

Ask the user for the feature request. The description must identify all three of the following before you proceed:

1. **Who** — the user, role, or system actor affected by or using the new feature
2. **What** — the action, capability, or behaviour being added or changed
3. **Why** — the intended outcome or business goal it serves

Present these three requirements explicitly and ask the user to provide them. Do not infer or assume any of the three from context — they must be stated.

**If the description is incomplete:** identify which of the three items is missing and ask for it specifically. Do not proceed until all three are present.

**Once all three are confirmed**, record the feature request as a single **Change Description** statement in this format:

> *[Who] needs to be able to [what] so that [why].*

Present the Change Description to the user and ask: **"Is this an accurate description of what you want to build?"** Do not proceed until the user confirms it is correct. If they correct it, update the statement and ask again.

**Write the confirmed Change Description to `docs/<feature>/requirements-package/discovery/change-description.md`**. The file must contain:
- The confirmed Change Description statement
- The three elements listed separately: **Who**, **What**, **Why**

The file write must succeed before proceeding to Step 1. If the folder structure does not exist, create it.

This file is the anchor for every step that follows. Every skill reads it as its first named input — every discovery activity, every elicitation question, and the final baseline document are scoped to it.

---

## When to Use

- The very first file to invoke for any brownfield (existing system) project — "add feature X to existing app Y"
- An existing system is in place and the proposed change must coexist with it
- Before any requirements, design, or implementation work begins

## Scope

All discovery skills in this sequence are **scoped to the proposed change and the areas of the existing system it will interact with**. This is not a full system audit. The goal is to understand enough of the existing system to safely design the new requirement — no more, no less.

Each skill starts from the proposed change and expands outward only as far as needed:
- Capability areas the change will directly affect → documented in full detail
- Adjacent areas that share data, workflows, or dependencies → documented for the constraints they impose
- Unrelated areas → noted as unrelated; not documented in detail

## What This Does

Sequences the discovery skills in the order that gives the BA/PO the richest picture before each step. The AI reads the system first so that every subsequent conversation with the BA/PO is about gaps and decisions — not about explaining what the system already does. This file is the workflow — it does not contain skill logic itself.

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  DISCOVERY WORKFLOW — BSA DISCOVERY SEQUENCE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0. feature-request capture     ──► confirmed change            │
│     Who / what / why —               description                │
│     confirmed by user                                           │
│              │                                                  │
│              ▼                                                  │
│  1. codebase-discovery          ──► current-capability-         │
│     Read the system as-is            inventory                  │
│     from code                                                   │
│              │                                                  │
│              ▼                                                  │
│  2. existing-artifact-review    ──► documentation-currency-     │
│     Assess what docs exist           assessment                 │
│     and whether to trust them                                   │
│              │                                                  │
│              ▼                                                  │
│  3. process-mapping             ──► process-map(s)              │
│     Map as-is workflows from                                    │
│     code + docs before talking                                  │
│     to anyone                                                   │
│              │                                                  │
│              ▼                                                  │
│  4. user-journey-mapping        ──► user-journey-map(s)         │
│     Map as-is user experience                                   │
│     from UI evidence                                            │
│              │                                                  │
│              ▼                                                  │
│  5. requirements-elicitation    ──► confirmed requirements +    │
│     Ask targeted questions —         validated assumptions      │
│     only gaps not answered                                      │
│     by steps 1–4                                                │
│              │                                                  │
│              ▼                                                  │
│  6. current-capability-synthesis    ──► current-capability-baseline    │
│     Synthesise all outputs into                                 │
│     one coherent baseline doc                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Order

### Steps 1–2 (System and Docs) Before Steps 3–4 (Process and Journey Maps)

Process maps and user journey maps are *derived* from the system and its documentation. Running codebase-discovery and existing-artifact-review first means the AI can build most of the as-is process and journey maps from evidence — without asking the BA/PO to explain what the system already shows.

### Steps 3–4 (Process and Journey Maps) Before Step 5 (Requirements Elicitation)

Elicitation is most targeted when the AI already knows what the system does. Process and journey maps reveal which actors exist, which workflows have gaps, and which user experiences are unclear. This means every elicitation question traces to a specific gap flagged in a prior discovery output — the BA/PO is not asked to explain what the system already reveals.

### Step 5 (Elicitation) Before Step 6 (Synthesis)

The baseline's confidence ratings depend on what was stakeholder-confirmed vs. AI-inferred. Running elicitation before synthesis means the baseline reflects the best available information — confirmed facts where possible, explicit inferences where not.

### Step 6 (Synthesis) Last

Current-capability-synthesiser is the assembly step. It merges all prior outputs into one coherent document. Running it last means it has everything to synthesise and does not need to revisit earlier outputs.

## Discovery Phase Outputs

| Output | Produced By | Consumed By |
|--------|------------|------------|
| `docs/<feature>/requirements-package/discovery/change-description.md` | Step 0 (workflow) | all subsequent steps — every skill reads it as its first named input |
| current-capability-inventory | codebase-discovery | current-capability-synthesis, process-mapping, user-journey-mapping |
| documentation-currency-assessment | existing-artifact-review | current-capability-synthesis, requirements-elicitation |
| process-map(s) | process-mapping | user-journey-mapping, current-capability-synthesis |
| user-journey-map(s) | user-journey-mapping | requirements-elicitation, current-capability-synthesis |
| **`docs/<feature>/requirements-package/discovery/requirements-elicitation.md`** (confirmed requirements + validated assumptions) | requirements-elicitation | current-capability-synthesis, functional-requirements (change-scoping also consumes the confirmed requirements for scope anchoring) |
| **current-capability-baseline** | **current-capability-synthesis** | **analysis phase, architect** |

The **current-capability-baseline** is the discovery phase's primary output to the rest of the project. The confirmed requirements from requirements-elicitation are the secondary output, feeding directly into functional-requirements.

## Entry Criteria

Before starting the discovery workflow, confirm:

- [ ] The AI has access to the existing system (read access to the project repository or codebase)

Step 0 captures the feature request description — do not require it upfront. The workflow asks for it.

If the AI does not have access to the existing system, the discovery workflow cannot proceed past Step 1 — the sequence depends on codebase-discovery as its foundation. Step 0 can still be completed without system access.

## Exit Criteria

Discovery is complete when:

- [ ] Step 0 produced a confirmed Change Description (who / what / why) acknowledged by the user and written to `docs/<feature>/requirements-package/discovery/change-description.md`
- [ ] All six skills have been executed in sequence
- [ ] The current-capability-baseline document is complete
- [ ] **`docs/<feature>/requirements-package/discovery/current-capability-baseline.md` has been written** — the file write must succeed before the user is asked to acknowledge
- [ ] All confirmed requirements from elicitation are recorded and ready for functional-requirements
- [ ] Open questions are logged with interim assumptions and owners
- [ ] The analysis phase (change-scoping → constraint-extraction) can begin from the baseline alone

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 0 | *(workflow — no reference file)* | `docs/<feature>/requirements-package/discovery/change-description.md` | All three elements (who / what / why) must be present, confirmed by BA/PO, and written to file before Step 1 begins |
| 1 | `codebase-discovery` | `docs/<feature>/requirements-package/discovery/codebase-discovery.md` | AI reads the system and presents a plain-English business capability inventory — no technical language in the output |
| 2 | `existing-artifact-review` | `docs/<feature>/requirements-package/discovery/existing-artifact-review.md` | AI reviews existing documents and flags what is current, what is outdated, and what conflicts with the system |
| 3 | `process-mapping` | `docs/<feature>/requirements-package/discovery/process-map.md` | AI derives as-is workflows from system knowledge; BA/PO reviews and confirms before elicitation |
| 4 | `user-journey-mapping` | `docs/<feature>/requirements-package/discovery/user-journey-map.md` | AI derives user journeys from interface evidence; BA/PO reviews, confirms, and marks where the change lands |
| 5 | `requirements-elicitation` | `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` | One question at a time; only ask the BA/PO what the system and documents could not answer |
| 6 | `current-capability-synthesis` | `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` | One coherent document — write the file first, then present to BA/PO and wait for acknowledgement before Phase 2 |

## What Comes After Discovery

The current-capability-baseline feeds the **analysis phase**:
1. `change-scoping` — define the precise boundary of what will and will not change
2. `dependency-mapping` — map business and system dependencies of the change
3. `impact-analysis` — assess what is affected and what must be preserved
4. `constraint-extraction` — formalise constraints into the requirements package

The confirmed requirements from elicitation feed the **requirements phase**:
1. `functional-requirements` — produce the formal requirements specification

Both the baseline and the requirements package are eventually handed to the architect.

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| BA/PO asked to explain the whole system from scratch | Steps 1–4 build an almost-complete system picture before the BA/PO is asked anything — the AI reads the system first |
| AI makes assumptions about the existing system and designs against them | Step 5 explicitly confirms assumptions with the BA/PO before they are locked into the baseline |
| Downstream roles receive five separate discovery documents and assemble context themselves, inconsistently | Step 6 assembles one coherent baseline that all downstream phases consume |
| Requirements contradict settled decisions from prior work | Step 2 surfaces settled decisions; Step 6 ensures they are not contradicted |
| Elicitation lacks focus — asking about things the system already reveals | Steps 1–4 narrow down what is truly unknown before the BA/PO is engaged |
| The team builds on fragile foundations without knowing it | Step 6 catalogues known issues and areas of uncertainty in the change area explicitly |

## Phase Handoff

After `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` is complete and acknowledged, ask the user:

> Discovery is complete. The current-capability baseline is ready to feed analysis. Are you ready to start requirements analysis?

If yes, activate or recommend the `requirements-analysis` skill. If no, stop and summarize the completed discovery outputs and the next recommended phase.
