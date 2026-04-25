# Requirements Writing Workflow

## Purpose

Define the entry-point sequence for the requirements phase — what the BSA does after analysis (or instead of analysis if skipped). Sequences the BSA's requirements skills in strict sequential order: (1) executive-summary to frame the feature and business context, (2) stakeholder-personas to identify who is affected and who approves (conditional — uses analysis stakeholder map if available, otherwise elicits from user), (3) business-objectives to define measurable success criteria, (4) user-journeys to map end-to-end user experience flows before the functional spec is written (conditional — uses analysis journey maps if available, otherwise maps from user input), (5) functional-requirements to specify what the system must do — grounded in the designed user journeys, (6) business-rules to extract validation logic, policies, and conditional behavior, (7) data-requirements to document business information inputs, outputs, and impact to existing information, (8) permissions-access-control to define who can do what, (9) nonfunctional-requirements to set measurable quality targets, (10) assumptions-constraints-scope to consolidate all assumptions, constraints, and and scope exclusions. The entire sequence is conditional on whether the analysis phase ran — if analysis ran, each skill consumes the relevant analysis outputs; if analysis was skipped, each skill elicits the required information from the user directly. When analysis was skipped, Step 0b gathers any existing requirements-related artifacts the user already has (PRDs, designs, user stories, meeting notes, etc.) as supplementary context — reducing elicitation burden without replacing the structured outputs of analysis. Discovery's artifact review covers existing system docs; Step 0b covers materials about the proposed change. Prevents the failure mode where requirements skills run without proper sequencing and produce inconsistent or contradictory outputs.

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
- Begin the review phase before step 11 (package-synthesis) is complete and the package file is written to disk.

If any step's output cannot be produced (e.g., no user journeys exist for a purely backend feature at step 4), explicitly state that, write a minimal artifact recording the finding, present it, and proceed.

---

## Change Tracker Protocol — Applies to Every Step

The change tracker is a cross-cutting artifact that records every discrete change to any requirements artifact across the entire requirements phase. It is initialized in Step 0a and written to by every skill. The synthesiser consumes it when assembling the package, and it becomes Section 12 of the assembled requirements package.

**The change tracker exists because individual artifact versioning is not enough.** Each skill already maintains its own revision history or changelog (executive-summary has a changelog, functional-requirements has a revision history, business-rules has a companion change log, NFRs have amendment tracking). These serve their purpose within each artifact. The change tracker consolidates all changes into a single navigable view so that:

- Downstream consumers (architects, AI agents in solution design or implementation) can identify exactly what changed between package versions without re-reading all ten artifacts
- Cross-artifact impacts are visible — a change to a functional requirement that invalidates a business rule and an NFR is traceable in one place
- The formal review phase can prioritize checks based on what was revised, not just what exists
- Post-handoff amendments are auditable — every change after the initial baseline has a named authorizer and a documented trigger

**How it works — every skill follows these rules:**

1. **After producing an artifact for the first time (initial authoring):** Append one `Added` entry per tracked item created in that artifact. For artifacts with many items (e.g., functional-requirements with 20+ REQ-xxx entries), batch the entries — one row per item ID is required, but the `Description` field may use a brief standard phrase (e.g., "Initial authoring") rather than a unique description for each. The `Trigger` field is `Initial authoring` and `Authorized By` is `BSA — initial authoring` for all first-pass entries.

2. **After revising an artifact at the hand-off gate (stakeholder correction):** Append one `Modified` entry per item that changed. The `Description` must state what changed — not just "updated." The `Trigger` is `Hand-off gate feedback` and `Authorized By` is the named individual who directed the correction. Populate the `Impact` field with item IDs in other artifacts that may be affected.

3. **After revising an artifact due to a downstream skill discovering a gap:** Append one entry per item that changed. The `Trigger` is `Downstream skill discovery` and the `Description` must name the downstream skill that surfaced the issue. Populate the `Impact` field.

4. **After a formal review finding triggers a revision:** Append one entry per item that changed. The `Trigger` is `Review finding` and the `Authorized By` is the reviewer or BSA who directed the correction. Populate the `Impact` field.

5. **When an assumption is verified as false and requirements are revised:** Append one entry per item revised. The `Trigger` is `Assumption verified false` and the `Description` must reference the ASMP-xxx that was falsified.

6. **Do not** backfill the change tracker from artifact revision histories that predate the tracker's initialization. The tracker starts from the point the requirements phase begins. Prior phase changes (discovery, analysis) are not tracked here — they are documented in those phases' own artifacts.

7. **Do not** duplicate individual artifact revision history content into the change tracker verbatim. The tracker records what changed and why at the item-ID level. The artifact's own revision history records artifact-level version increments and may include additional narrative. Both exist — neither replaces the other.

**File location:** `docs/<feature>/requirements-package/requirements/change-tracker.md`

**Template:** `../assets/change-tracker.md`

---

## Step 0a — Determine Feature Folder

Before any requirements writing begins, confirm the feature output folder. Discovery and analysis are optional — requirements may be the first phase run.

1. **Check for existing feature folder.** Look for `docs/*/requirements-package/` in the project repository. If a feature folder already exists from a previous phase, reuse it.
2. **If no existing folder**, infer the feature name from the change description. Convert to kebab-case (e.g., `refund-processing`, `user-onboarding`).
3. **Present to the user:** *"I'll organize all requirements outputs under `docs/<feature-name>/requirements-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/requirements-package/`."*
5. **Create the folder structure** if it does not exist:
   - `docs/<feature>/requirements-package/requirements/`
6. **Initialize the change tracker.** Copy `../assets/change-tracker.md` to `docs/<feature>/requirements-package/requirements/change-tracker.md`. Populate the header fields (project, feature, date, initial package version v0.1). If a change tracker already exists from a prior requirements iteration, do not overwrite it — append to it by adding a new Package Version Log entry and continuing the CHG-NNN sequence from the last used number.

All file paths in subsequent steps use `docs/<feature>/requirements-package/requirements/` as the output root.

---

## When to Use

- The entry point for the requirements phase — whether or not analysis was completed
- After the analysis phase's risk-register is complete (standard path)
- As the first phase if both discovery and analysis were skipped (standalone path)
- Before any design, architecture, or implementation work

## Scope

All requirements skills in this sequence produce **requirements for the proposed change**. This is not a full system specification. The goal is to define what the system must do, who uses it, what constraints apply, and what success looks like — scoped to the change being delivered.

## What This Does

Sequences the BSA's requirements skills in the order that maximises information quality before each step. Each skill arrives with the best available context from prior steps. This file is the workflow — it does not contain skill logic itself.

---

## Did Analysis Run?

Before starting, make one check: **look for `docs/<feature>/requirements-package/analysis/stakeholder-map.md`.**

The analysis workflow's step 1 (stakeholder-mapping) always runs when analysis ran. `docs/<feature>/requirements-package/analysis/stakeholder-map.md` is always produced when analysis ran, regardless of whether discovery ran — its presence is the most reliable single indicator that analysis ran.

**Analysis ran** if `docs/<feature>/requirements-package/analysis/stakeholder-map.md` exists:
- Each requirements skill independently checks for the specific artifacts it needs (`docs/<feature>/requirements-package/analysis/change-scope.md`, `docs/<feature>/requirements-package/analysis/constraint-register.md`, `docs/<feature>/requirements-package/analysis/risk-register.md`, etc.) and uses them if found. No single global check is applied across all skills.
- Skills that find their required artifacts consume them. Skills that do not find a specific artifact note the gap and elicit that piece of information from the user directly.
- No upfront notice is needed — artifact availability is confirmed step by step as each skill runs.

**Analysis was skipped** if `docs/<feature>/requirements-package/analysis/stakeholder-map.md` does not exist:
- Each skill elicits the required information directly from the user.
- All system claims are recorded as assumptions throughout the sequence.
- Flag to the user at the start: **"Analysis was skipped. All requirements will be elicited directly from you. Every system claim will be treated as an assumption until verified. This increases the risk of requirements rework during implementation."**
- **After the flag, run Step 0b** to gather any existing artifacts the user has related to requirements. Discovery's artifact review (if it ran) focused on existing system documentation — Step 0b targets requirements-related artifacts (PRDs, user stories, designs for the proposed change, meeting notes, decision records) that the user may already have and that would otherwise only surface piecemeal during elicitation.
- **Determine routing for Step 0:**
  - If `docs/<feature>/requirements-package/discovery/change-description.md` exists: discovery ran — skip Step 0 and proceed to Step 0b.
  - If no prior change description exists (`docs/<feature>/requirements-package/discovery/change-description.md` and `docs/<feature>/requirements-package/analysis/change-description.md` are both absent): both discovery and analysis were skipped — run Step 0 first, then proceed to Step 0b.

---

## Step 0 — Capture the Change Description (No Prior Phase Ran)

**This step only runs when no prior phase produced a change description.** If discovery ran, `docs/<feature>/requirements-package/discovery/change-description.md` exists. If analysis ran without discovery, `docs/<feature>/requirements-package/analysis/change-description.md` exists. If either file exists, skip this step — proceed to Step 0b (if analysis was skipped) or Step 1 (if analysis ran).

**This is the first thing you do. Do not read any reference file until Step 0 is complete.**

Ask the user for the feature request. The description must identify all three of the following before you proceed:

1. **Who** — the user, role, or system actor affected by or using the new feature
2. **What** — the action, capability, or behaviour being added or changed
3. **Why** — the intended outcome or business goal it serves

Present these three requirements explicitly and ask the user to provide them. Do not infer or assume any of the three from context — they must be stated.

**If the description is incomplete:** identify which of the three items is missing and ask for it specifically. Do not proceed until all three are present.

**Once all three are confirmed**, record the feature request as a single **Change Description** statement in this format:

> *[Who] needs to be able to [what] so that [why].*

Present the Change Description to the user and ask: **"Is this an accurate description of what you want to build?"** Do not proceed until the user confirms it is correct. If they correct it, update the statement and ask again.

**Write the confirmed Change Description to `requirements/change-description.md`** in the project repository. The file must contain:
- The confirmed Change Description statement
- The three elements listed separately: **Who**, **What**, **Why**

The file write must succeed before proceeding. If the `requirements/` directory does not exist, create it.

This file is the anchor for every step that follows. Every requirements skill reads it as context — every executive summary, every persona, every functional requirement is scoped to it.

---

## Step 0b — Gather Existing Artifacts (Analysis Skipped)

**This step runs whenever analysis was skipped** — regardless of whether discovery ran. If analysis ran, the analysis phase already produced structured outputs (stakeholder map, change scope, constraints, risks, etc.) that each requirements skill consumes — skip to Step 1.

Discovery's artifact review (Step 2 of the discovery workflow) focuses on *existing system documentation* — specs, ADRs, runbooks, and Figma designs for the current system. Step 0b targets a different set of artifacts: *requirements-related materials for the proposed change* — PRDs, user stories, designs for the new feature, meeting notes, and decision records that describe what should be built. Even when discovery ran, these materials are not gathered unless the user volunteers them during elicitation. Collecting them upfront means every requirements skill can cross-reference the user's existing materials instead of starting from a blank slate or relying entirely on verbal elicitation.

**This is a mandatory pause. Present the following prompt to the user and wait for their response before proceeding to Step 1.**

---

**Present this prompt to the user verbatim, substituting the confirmed change description:**

> Before we begin writing requirements, I want to make sure I'm working with everything you already have. Since we're starting directly from the requirements phase (without discovery or analysis), any existing documents you can share will significantly improve the quality and reduce the back-and-forth.
>
> For the proposed change — **[insert confirmed change description]** — please share links or attachments for any of the following that exist:
>
> | # | Artifact type | What to share |
> |---|--------------|--------------|
> | 1 | **Product requirements / briefs** | PRDs, one-pagers, feature briefs, product proposals, or any document that describes what should be built and why |
> | 2 | **User stories / acceptance criteria** | Existing user stories, job stories, or acceptance criteria — from Jira, Linear, Azure DevOps, or any backlog tool |
> | 3 | **UI/UX designs** | Figma, Sketch, or wireframe links for the proposed feature or the screens it will affect |
> | 4 | **Business process documentation** | Workflow diagrams, process maps, SOPs, or business rules documents that describe how things work today or should work after the change |
> | 5 | **Meeting notes / decision records** | Notes from stakeholder meetings, kick-off sessions, design reviews, or any recorded decisions about this feature |
> | 6 | **Technical context** | Architecture diagrams, API documentation, data models, or system documentation for the area the change will touch |
> | 7 | **Competitor / reference material** | Screenshots, links, or descriptions of how competitors or reference products handle this capability |
> | 8 | **Other** | Anything else relevant — emails, Slack threads exported as text, customer feedback, support tickets, analytics reports |
>
> For each one that does not exist, write "none." A confirmed "none" is as useful as a link — it tells me we need to build that understanding from scratch.

---

**Rules for processing the response:**

- **If the user provides links or attachments:** Read each artifact. For each one, produce a brief summary capturing: (a) what it establishes about the feature, (b) any decisions or constraints it documents, (c) any requirements or rules it states or implies, and (d) any contradictions or ambiguities noticed. Present the consolidated summary to the user for confirmation before proceeding.
- **If the user provides "none" for all items:** Record that existing artifacts were solicited and confirmed absent. Note this in the executive summary context. Proceed to Step 1.
- **If the user says "I don't know" or "maybe" for any item:** Record it as a potential artifact and flag it as a question to revisit during relevant requirements steps. Do not treat uncertainty as confirmed absence.
- **Do not proceed to Step 1 until the user has responded.** Present the prompt, stop, and wait.

**How skills consume these artifacts:**

The gathered artifacts are not verified against a codebase or capability inventory (since discovery did not run). Every claim from these artifacts is treated as **user-provided context, not verified fact** — the same assumption-tracking rules that apply when analysis is skipped apply to artifact content. Specifically:

- Claims about the current system are recorded as assumptions unless the user explicitly confirms them as fact
- Decisions documented in artifacts are treated as **candidate constraints** — the user must confirm they are still active before they constrain requirements
- Requirements stated in artifacts are treated as **draft inputs** to be validated and refined during the relevant requirements skill, not adopted verbatim

Each requirements skill checks the gathered artifacts for content relevant to its scope before eliciting from the user. This means the skill asks targeted questions about gaps and ambiguities in the artifacts rather than starting from a blank slate.

**Write the artifact summary (if any artifacts were provided) to `requirements/existing-artifacts-summary.md`.** This file is referenced by subsequent skills as supplementary context. If no artifacts were provided, do not create the file.

---

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUIREMENTS WORKFLOW — BSA REQUIREMENTS SEQUENCE          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0. change-description capture   ──► change-description.md      │
│     (CONDITIONAL — only if no         Confirmed who / what /    │
│     prior phase produced one)         why                       │
│              │                                                  │
│              ▼                                                  │
│  0b. gather existing artifacts   ──► existing-artifacts-        │
│      (CONDITIONAL — only if           summary.md                │
│      analysis was skipped)            User-provided PRDs,       │
│                                       designs, meeting notes    │
│                                       as supplementary context  │
│              │                                                  │
│              ▼                                                  │
│  1. executive-summary            ──► executive-summary          │
│     Frame the feature and             What, who, why, scope     │
│     business context                  summary, key risks        │
│              │                                                  │
│              ▼                                                  │
│  2. stakeholder-personas         ──► stakeholder-personas       │
│     Identify stakeholders and         Influence grid, RACI,     │
│     define user personas              persona definitions       │
│              │                                                  │
│              ▼                                                  │
│  3. business-objectives          ──► business-objectives        │
│     Define measurable business        Objectives, success       │
│     outcomes and success metrics      metrics, priorities       │
│              │                                                  │
│              ▼                                                  │
│  4. user-journeys                ──► user-journey-map(s)        │
│     Map end-to-end user               Per-persona journey maps  │
│     experience flows                  with satisfaction         │
│                                       indicators and friction   │
│              │                                                  │
│              ▼                                                  │
│  5. functional-requirements      ──► functional-requirements    │
│     Specify what the system           Forward-looking spec of   │
│     must do                           feature capabilities      │
│              │                                                  │
│              ▼                                                  │
│  6. business-rules               ──► business-rules             │
│     Extract validation logic,         Rule catalog by category  │
│     policies, conditional behavior    with lifecycle tags       │
│              │                                                  │
│              ▼                                                  │
│  7. data-requirements            ──► data-requirements          │
│     Document business information     Information requirements  │
│     inputs, outputs, and impact       with lifecycle tags       │
│              │                                                  │
│              ▼                                                  │
│  8. permissions-access-control   ──► permissions-access-control │
│     Define who can do what            Authentication boundary,  │
│                                       sensitivity classification,│
│                                       role definitions,         │
│                                       permission matrix, access │
│                                       control rules, session    │
│                                       lifecycle, audit & lifecycle│
│              │                                                  │
│              ▼                                                  │
│  9. nonfunctional-requirements   ──► nonfunctional-requirements │
│     Set measurable quality            NFRs by category with     │
│     targets                           baselines and targets     │
│              │                                                  │
│              ▼                                                  │
│  10. assumptions-constraints-    ──► assumptions-constraints-   │
│      scope                            scope                     │
│      Consolidate assumptions,         Single register for all   │
│      constraints, and scope           assumptions, constraints, │
│      exclusions                       and exclusions            │
│              │                                                  │
│              ▼                                                  │
│  11. requirements-package-       ──► requirements-package.md    │
│      synthesiser                      Single assembled doc;     │
│      Reconcile cross-artifact         cross-artifact checks     │
│      contradictions, validate         passed; traceability      │
│      traceability chain, assemble     chain validated           │
│      all 10 artifacts into one                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Order

### Step 1 (Executive Summary) First

Every subsequent skill needs to understand what the feature is, why it matters, and what the scope boundaries are. The executive summary establishes the shared context that all requirements are written within.

### Step 2 (Stakeholders & Personas) Before Objectives and Requirements

Business objectives must be grounded in who benefits. Functional requirements must be written for specific actors. Both need persona definitions before they can be produced.

### Step 3 (Business Objectives) Before Functional Requirements

Requirements answer "what must the system do?" Objectives answer "why does the system do it?" Writing requirements before objectives risks producing capabilities with no business justification. Objectives also establish the success criteria that requirements must collectively achieve.

### Step 4 (User Journeys) Before Functional Requirements

User journeys define the end-to-end experience each persona must have. Writing functional requirements before journeys risks producing capabilities that, individually, are correct but together create a fragmented or contradictory user experience. Journey maps force the question "how does this persona actually accomplish their goal?" before the question "what must the system do?" This ensures every functional requirement can be traced forward to a stage in a designed user experience — orphaned requirements that serve no user journey surface during that tracing.

**Known trade-off:** Because user journeys precede business rules, journey maps are designed without formally extracted rule knowledge. Journey stages should capture anticipated rule-driven friction points (eligibility checks, state restrictions, conditional behavior) as friction notes. If Step 6 (business-rules) reveals rule branches that significantly alter a journey stage, the affected journey must be revisited before handoff.

### Step 5 (Functional Requirements) Before Steps 6–10

Every subsequent requirements skill depends on the functional spec:
- Business rules are extracted from the functional spec's conditional logic
- Data requirements identify business information from the functional spec
- Permissions are derived from the actors and capabilities in the functional spec
- NFRs are scoped to the endpoints and workflows in the functional spec

### Step 6 (Business Rules) After Functional Requirements

Business rules are extracted from the functional spec's conditional logic and cannot precede it. The functional spec is the primary source for all new and modified rules.

### Steps 7–9 (Data, Permissions, NFRs) After Journeys

These three skills are informed by the journeys but are relatively independent of each other. However, they run sequentially because:
- Data requirements may reveal new permission needs (e.g., data-level access controls, resource sensitivity tiers)
- Permissions may reveal new NFR needs (e.g., audit logging requirements inform observability NFRs; session lifecycle requirements inform security and availability NFRs; fail-closed behavior for IdP unavailability informs resilience NFRs)

### Step 10 (Assumptions, Constraints & Out of Scope) Last Before Review

This is the consolidation step. Every prior skill may have surfaced assumptions and constraints. Step 10 sweeps all artifacts and produces the single register. It must run after all other section-producing skills are complete.

## Requirements Phase Outputs

| Output | Produced By | Section |
|--------|------------|---------|
| executive-summary | executive-summary | 1 |
| stakeholder-personas | stakeholder-personas | 2 |
| business-objectives | business-objectives | 3 |
| user-journey-map(s) | user-journeys | 4 |
| functional-requirements | functional-requirements | 5 |
| business-rules | business-rules | 6 |
| data-requirements | data-requirements | 7 |
| permissions-access-control | permissions-access-control | 8 |
| nonfunctional-requirements | nonfunctional-requirements | 9 |
| assumptions-constraints-scope | assumptions-constraints-scope | 10 |
| change-tracker | workflow + all skills (cross-cutting) | 12 |

## Entry Criteria

Before starting the requirements workflow, confirm:

- [ ] Either: a confirmed change description exists from a prior phase (`docs/<feature>/requirements-package/discovery/change-description.md` or `docs/<feature>/requirements-package/analysis/change-description.md`), OR: the user is available to provide one in Step 0
- [ ] Either: `docs/<feature>/requirements-package/analysis/stakeholder-map.md` exists (analysis ran — each skill will check for its specific artifacts independently), OR: the user can provide sufficient context for requirements to proceed without analysis
- [ ] The user is available to answer questions during the requirements phase

## Exit Criteria

Requirements are complete when:

- [ ] A confirmed Change Description exists — from discovery, analysis, or Step 0 of this workflow
- [ ] All 10 section-producing steps have been executed in sequence
- [ ] All requirements artifacts are written
- [ ] All assumptions are consolidated in the assumptions-constraints-scope document
- [ ] All constraints are consolidated in the assumptions-constraints-scope document
- [ ] All scope exclusions are documented with decision maker and rationale
- [ ] The change tracker has been maintained throughout the phase — every tracked item across all artifacts has a corresponding `Added` entry, and all revisions have `Modified`, `Removed`, `Deferred`, or `Reinstated` entries with populated Impact fields
- [ ] `package-synthesis` has run, all cross-artifact contradictions resolved, and `requirements/requirements-package.md` is written to disk

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 0a | *(workflow — no reference file)* | Feature folder + `requirements/change-tracker.md` | Always runs — determines output folder and initializes the change tracker from `../assets/change-tracker.md` |
| 0 | *(workflow — no reference file)* | `requirements/change-description.md` | Conditional — only if no prior phase produced a change description; all three elements (who / what / why) must be confirmed and written to file before Step 0b or Step 1 |
| 0b | *(workflow — no reference file)* | `requirements/existing-artifacts-summary.md` | Conditional — only if analysis was skipped (regardless of whether discovery ran); gathers requirements-related artifacts as supplementary context; mandatory pause until user responds |
| 1 | `executive-summary` | `executive-summary.md` | Frames everything — must complete first |
| 2 | `stakeholder-personas` | `stakeholder-personas.md` | Uses analysis stakeholder map if available |
| 3 | `business-objectives` | `business-objectives.md` | Defines measurable success criteria |
| 4 | `user-journeys` | `user-journey-[name].md` | Maps experience before the functional spec is written |
| 5 | `functional-requirements` | `functional-requirements.md` | Must complete before steps 6–10 |
| 6 | `business-rules` | `business-rules.md` | Extracts rules from the functional spec |
| 7 | `data-requirements` | `data-requirements.md` | Documents business information requirements from the spec |
| 8 | `permissions-access-control` | `permissions-access-control.md` | Defines authorization for every capability |
| 9 | `nonfunctional-requirements` | `nonfunctional-requirements.md` | Measurable quality targets |
| 10 | `assumptions-constraints-scope` | `assumptions-constraints-scope.md` | Consolidation sweep — runs last |
| 11 | `package-synthesis` | **`requirements/requirements-package.md` — written to the `requirements` folder** | Reconciles cross-artifact contradictions, validates traceability chain, assembles all 10 artifacts plus the change tracker into one file; produces the version diff summary in the change tracker |

## Analysis-Skipped: Confidence Degradation

When analysis was skipped, the requirements operate at reduced confidence:

| Missing artifact | Effect on requirements |
|---|---|
| `docs/<feature>/requirements-package/analysis/change-scope.md` | Scope boundaries are user-stated, not evidence-derived — scope creep risk is elevated |
| `docs/<feature>/requirements-package/analysis/constraint-register.md` | Technology, regulatory, and performance constraints are unknown — requirements may violate hard limits |
| `docs/<feature>/requirements-package/analysis/risk-register.md` | Risks are unassessed — the executive summary and objectives lack risk grounding |
| `docs/<feature>/requirements-package/analysis/assumption-log.md` | No prior assumptions have been tracked — the consolidation in step 10 starts from zero |
| `docs/<feature>/requirements-package/analysis/stakeholder-map.md` | Stakeholders are user-identified, not systematically mapped — key stakeholders may be missed |
| `docs/<feature>/requirements-package/analysis/dependency-map.md` | Data and integration dependencies are unknown — data requirements and NFRs may miss integration points |
| `docs/<feature>/requirements-package/analysis/impact-analysis.md` | The blast radius of the change is unknown — operational readiness requirements (training, support model changes, documentation), business process coordination needs, and team ownership changes will not be identified unless separately elicited; risks derived from impact analysis are also missing from the risk-register |
| `docs/<feature>/requirements-package/analysis/process-map.md` | No future-state workflows exist — user journeys are designed without process grounding |
| `docs/<feature>/requirements-package/analysis/user-journey-map.md` | No future-state experience maps exist — user journeys are designed from scratch |
| `docs/<feature>/requirements-package/analysis/gap-analysis.md` | Readiness gaps are unknown — outstanding capability and organisational gaps that could block objective achievement will not surface in the executive summary or inform requirements scoping |

**Partial offset from Step 0b:** When analysis was skipped, Step 0b gathers any existing requirements-related artifacts the user has (PRDs, designs for the proposed change, user stories, meeting notes, decision records, etc.). These artifacts may partially address some of the gaps above — for example, a PRD may contain scope boundaries, a design document may surface constraints, or meeting notes may capture prior decisions. However, artifact content is treated as unverified user-provided context, not as a substitute for the structured outputs of analysis. The confidence degradation above still applies; Step 0b reduces the elicitation burden but does not eliminate the elevated rework risk.

**Recommendation gate:** If at step 5 (functional-requirements) it becomes clear that the change touches more than one subsystem or has significant integration points, the workflow should recommend going back and running analysis before continuing. Present this recommendation to the user — the user decides whether to proceed or pause for analysis.

## What Comes After Requirements

Once step 10 (assumptions-constraints-scope) is complete, the requirements artifacts feed the **package synthesiser** and then the **formal review phase**:

1. `package-synthesis` — cross-checks all ten artifacts for contradictions and orphaned content, validates the traceability chain, and assembles `requirements-package.md` as a single coherent document
2. Formal review skills (`review/`) — assess the assembled package for completeness, consistency, testability, and feasibility; `review-requirements-readiness.md` is the final gate before architect handoff
3. The assembled and reviewed `requirements-package.md` is handed to the architect for design

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| Requirements start without a confirmed change description (when both prior phases skipped) | Step 0 captures who / what / why and writes it to file before any skill runs |
| Analysis skipped and every skill starts from zero — user must verbally explain everything, including context they already have documented (PRDs, user stories, designs for the proposed change) | Step 0b solicits existing requirements-related artifacts so skills can cross-reference existing materials instead of relying entirely on verbal elicitation |
| User has existing documents with decisions or constraints but they are not surfaced until mid-way through the requirements sequence, causing rework | Step 0b gathers all available artifacts upfront before any requirements skill runs — decisions and constraints from artifacts are visible from Step 1 onward |
| Discovery's artifact review covered existing system docs but not requirements-related materials for the proposed change (PRDs, user stories, meeting notes about the new feature) | Step 0b targets a different artifact set than discovery — focused on materials about what should be built, not what currently exists |
| Artifact content is treated as verified fact when no prior phase validated it | Step 0b explicitly treats all artifact claims as user-provided context, not verified fact — system claims are recorded as assumptions; decisions require user confirmation that they are still active |
| Requirements written without knowing who the users are | Step 2 (stakeholder-personas) must complete before functional requirements |
| Requirements written without measurable success criteria | Step 3 (business-objectives) defines success before requirements are specified |
| Functional requirements written without understanding the user experience they must support | Step 4 (user-journeys) produces journey maps before the functional spec is written — every requirement must be traceable to a journey stage |
| Business rules, data, permissions, and NFRs written before the functional spec exists | Step 5 (functional-requirements) must complete before steps 6–10 |
| Assumptions scattered across artifacts with no consolidation | Step 10 (assumptions-constraints-scope) sweeps all artifacts |
| Requirements package has placeholders, contradictions, or scope creep | Step 11 (package-synthesis) catches contradictions and orphaned content before the package is assembled |
| Analysis outputs exist but are not consumed by requirements skills | Each skill explicitly checks for analysis artifacts and consumes them if available |
| Analysis was skipped but requirements proceed as if analysis ran | The "Did Analysis Run?" check at the start flags the confidence degradation to the user |
| NFRs written without knowing the permission model | Step 8 (permissions) runs before step 9 (NFRs) |
| A requirement is revised during the phase but the revision is invisible — downstream consumers act on the original version without knowing it changed | The Change Tracker Protocol requires every revision to be logged with the item ID, what changed, what triggered the change, and which other items are impacted |
| Cross-artifact impact of a change is missed — a functional requirement changes but the dependent business rule and NFR are not updated | The change tracker's Impact field creates a forward pointer from every change to the items it affects; the synthesiser validates that impacted items were actually updated |
| Post-review amendments are untraceable — corrections applied during formal review cannot be distinguished from original content | Every change after the initial baseline carries a distinct package version number, a named authorizer, and a trigger classification in the change tracker |
| Downstream consumers (architects, AI agents) must re-read the entire package to identify what changed between versions | The Version Diff Summary in the change tracker provides a structured diff per package version — added, modified, removed items with field-level detail |

## Phase Handoff

After `docs/<feature>/requirements-package/requirements-package.md` is assembled and acknowledged, ask the user:

> Requirements writing is complete. The assembled package is ready for formal review. Are you ready to start requirements review?

If yes, activate or recommend the `requirements-review` skill. If no, stop and summarize the completed requirements outputs and the next recommended phase.
