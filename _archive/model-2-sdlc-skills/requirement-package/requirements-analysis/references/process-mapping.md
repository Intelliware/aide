## Purpose

Map future-state (to-be) processes for all workflows affected by the proposed change. Captures how actors, steps, decision points, business rules, handoffs, system interactions, and exception flows will work after the change is implemented. The analysis-phase complement to discovery's process-mapping (which maps as-is only). Consumes the change scope (in-scope list), constraint register, dependency map, impact analysis, confirmed requirements, stakeholder map, and current-state process maps (if available) to design within known boundaries. Produces one process-map document per affected workflow. Feeds user-journey-mapping, gap-analysis, risk-analysis, and functional requirements. Always runs in analysis regardless of whether discovery ran. # Process Mapping ## Definitions **To-be process:** The process as it will operate after the proposed change is implemented. Every step must be traceable to a confirmed requirement or an unchanged step carried forward from the as-is process. **Carried-forward step:** A step from the current-state process (if discovery ran) that is unchanged by the proposed change. Carried-forward steps are included in the to-be map to maintain a complete end-to-end view — they are labeled `[UNCHANGED]` so it is clear they are not new. **New step:** A step introduced by the proposed change. Labeled `[NEW]` in the to-be map. **Modified step:** An existing step whose behavior, actor, or handoff changes due to the proposed change. Labeled `[MODIFIED]` in the to-be map, with the nature of the modification described. **Removed step:** An existing step that the proposed change eliminates. Documented in the change delta section and **not** shown in the to-be Mermaid flowchart — the flowchart represents what will exist after the change, not what is being removed. Removals are visible only in the change delta table. **System actor:** A step performed by a system without direct human involvement (automated jobs, scheduled processes, event triggers). Labeled `[SYSTEM: <system-name>]` in the actor field of a step description and rendered as a rounded rectangle (`([text])` syntax) in Mermaid diagrams to distinguish from human-actor steps. If the specific system name is not yet confirmed at requirements time, use `[SYSTEM: TBD]` — do not invent a system name. Recording a specific system name is an architectural commitment; record it only when the stakeholder has confirmed it. **Business rule:** A condition, policy, or criterion that governs how a decision point in the process behaves. Business rules are the logic behind branches — they answer "under what condition does the process go left vs right?" Examples: "orders over $10,000 require manager approval", "claims submitted after 30 days are rejected". Business rules are distinct from process steps: a step describes what happens; a business rule describes why one path is taken over another. **Handoff:** The transfer of work, information, or responsibility from one actor to another. A handoff has a sender, a receiver, a content (what is transferred), a format (how it is transferred — form, notification, document, system event), a timing constraint (by when), and a channel (email, system queue, in-person). Handoffs are not implied by flowchart arrows — they must be explicitly documented. **Process owner:** The individual role accountable for the execution, governance, and ongoing performance of a process. Every process must have exactly one process owner. The process owner is the authority who can approve the to-be map as accurate and who is accountable for the process performing within its defined targets after the change is implemented. ## When to Use - Step 6 in the analysis-workflow sequence — run after constraint-extraction, before user-journey-mapping - Always runs regardless of whether discovery was completed - The proposed change alters how a workflow operates — adding, removing, or modifying steps, actors, or handoffs - Before gap-analysis — the comparison of current vs future processes is a primary gap source ## What This Produces **To-be process maps** for every workflow affected by the proposed change. Each map shows the complete future-state process end-to-end — including the happy path, key decision branches, exception/failure flows, business rules, and handoff detail — with new, modified, and unchanged steps clearly labeled. ## What This Is Not - **Not an as-is map** — discovery's process-mapping handles current state. This skill maps where we are going, not where we are. - **Not a requirements document** — process maps visualise workflows and make them inspectable; requirements specify what the system must do. A process map informs requirements but does not replace them. - **Not a system architecture diagram.** The boundary is this: a process map operates at the business actor level. It captures what business role or named system performs an action and what business event triggers or results from that action. It does not specify technology platforms, API contracts, data schemas, message formats, or system integration protocols — those are architectural concerns. If a step can be described in a verb-object phrase that a business stakeholder would recognise without technical explanation ("Manager approves the request", "Automated process sends confirmation"), it belongs in a process map. If describing the step requires technical knowledge the business stakeholder does not hold, it has crossed into architecture and must not appear here. ## Inputs | Input | Source | Required | |

------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Change scope (in-scope list)            | change-scoping                                                                          | Yes — defines which workflows are affected                                                                                                                                                                         |
| Constraint register                     | constraint-extraction                                                                   | Yes — defines limits the future process must operate within                                                                                                                                                        |
| Dependency map                          | dependency-mapping                                                                      | Yes — identifies what the future process connects to                                                                                                                                                               |
| Impact analysis                         | impact-analysis                                                                         | Yes — identifies downstream effects of process changes                                                                                                                                                             |
| Current-state process maps              | discovery process-mapping                                                               | If available — provides the baseline to modify                                                                                                                                                                     |
| Confirmed requirements                  | requirements-elicitation (discovery) or user description                                | Yes — if not yet formally documented, ask the user to state them and record each as an assumption in `docs/<feature>/requirements-package/analysis/assumption-log.md`                                                                                  |
| Stakeholder map                         | analysis stakeholder-mapping (step 1 — always runs regardless of whether discovery ran) | Yes — always available from analysis step 1; if it has not yet been completed, do not proceed with process-mapping                                                                                                 |
| Volume, frequency, and peak period data | constraint register, stakeholder interviews, or user input                              | If available — informs whether SLA constraints in the constraint register are achievable and surfaces capacity risks for risk-analysis. If not available, note the absence explicitly and log it as an assumption. |


> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. IDENTIFY — Which processes need a to-be map  │
│     Use the change scope to select workflows     │
│     that the change adds to, modifies, or        │
│     eliminates steps from. Capture process       │
│     owner, volume, and frequency per workflow.   │
├──────────────────────────────────────────────────┤
│  2. BASELINE — Start from the as-is map          │
│     If discovery ran, copy the as-is map as the  │
│     starting point. If discovery was skipped,    │
│     build the as-is understanding from user      │
│     input before designing the to-be state.      │
│     If the workflow is entirely new, skip        │
│     baseline — proceed directly to step 3.       │
├──────────────────────────────────────────────────┤
│  3. DESIGN — Apply the change                    │
│     Add new steps, modify existing steps, remove │
│     obsolete steps. Capture business rules for   │
│     every decision point and handoff detail for  │
│     every actor transition. Respect constraints. │
├──────────────────────────────────────────────────┤
│  4. VALIDATE — Check against constraints         │
│     Verify the to-be process does not violate    │
│     any constraint from the constraint register. │
│     Apply waiver-vs-blocker criteria to any      │
│     violation before escalating.                 │
├──────────────────────────────────────────────────┤
│  5. DELTA — Document the change delta            │
│     What was added, modified, or removed         │
│     relative to the current state. For removed   │
│     steps, record capability disposition.        │
├──────────────────────────────────────────────────┤
│  6. LINK — Connect to user journeys              │
│     Note which personas interact with the to-be  │
│     process at which steps. Flag fully automated │
│     processes that generate no user journey.     │
├──────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate the process map template │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Identify Which Processes Need a To-Be Map

Review the change scope's in-scope list. For each in-scope item, determine which workflows it affects:

- Does this item add a step to an existing workflow?
- Does it modify a decision point or branching condition?
- Does it introduce a new actor or remove one?
- Does it change a handoff between actors?
- Does it create an entirely new workflow that does not exist today?

Map every affected workflow. If the change creates a new workflow, map it from scratch (all steps are `[NEW]`) — see Step 2 for new-workflow handling.

**For each affected workflow, capture before proceeding:**

1. **Process owner** — the role accountable for this process. If ownership is disputed or unknown, log it as an assumption in `docs/<feature>/requirements-package/analysis/assumption-log.md` with a resolution deadline. A process map for a workflow with no identified owner can be produced as a draft, but it must be flagged `[OWNER UNRESOLVED — PENDING APPROVAL]` in the document header and cannot progress past the hand-off gate until an owner is confirmed. An unconfirmed process owner at gate time is a blocker — log it in `docs/<feature>/requirements-package/analysis/decision-log.md` and surface it to the user before proceeding.
2. **Volume, frequency, and peak period** — how often does this process run, how many transactions per period, and when are the peaks? This information is required to evaluate whether SLA constraints from the constraint register are achievable. If the information is not available, record it explicitly as unknown, log an assumption, and flag it for risk-analysis — an SLA constraint cannot be validated without capacity context.
3. **Target performance metrics** — any cycle time targets, throughput rates, or error rate thresholds stated in the constraint register or business objectives. These become the acceptance basis for the process design. If no targets exist, record that explicitly — gap-analysis cannot assess process performance without a target.

**Granularity:** Map at the level where each step represents one discrete action by one actor — human or system. Avoid bundling multiple decisions or handoffs into a single step. A step should be expressible in one verb-object phrase that a business stakeholder would recognise (e.g., "Manager reviews the application", "Automated process sends confirmation notice"). Reference sub-processes by name as a single atomic step unless the proposed change directly alters the sub-process internals — in that case, the sub-process itself should already appear as an affected workflow in the change scope's in-scope list and must receive its own process map. If it does not appear in the change scope, raise this with the user before proceeding — do not silently recurse into a sub-process that has not been scoped.

**Partially-scoped workflows:** If a workflow is only partially in scope (some steps affected, some not), map the full workflow end-to-end. Label changed steps as `[NEW]` or `[MODIFIED]` and all unaffected steps as `[UNCHANGED]`. Never map only the changed portion in isolation — dropping unaffected context causes downstream skills to misread the process.

### Step 2 — Establish the Baseline

**If the workflow is entirely new (all steps are `[NEW]`):** There is no as-is baseline. Do not attempt to construct one. Proceed directly to Step 3. Label the process map header `[NEW WORKFLOW — NO PRIOR AS-IS STATE]`. All steps will be `[NEW]`. The delta table will contain only NEW entries. There are no UNCHANGED or MODIFIED steps, and there is nothing to remove. Handle the entire workflow as a clean design exercise constrained by the requirements and constraint register.

**If discovery ran (existing workflow):** Use the as-is process maps from discovery as the starting point. Copy each affected process map and use it as the skeleton for the to-be version — this ensures no existing steps are accidentally dropped. If the user indicates that a discovery artifact no longer reflects reality (e.g., it was produced from a stale baseline), ask the user to describe the discrepancies and record each correction as an assumption in `docs/<feature>/requirements-package/analysis/assumption-log.md` before proceeding.

**If discovery was skipped (existing workflow):** The BSA has no evidence-derived process maps. Ask the user to describe the current workflow for each affected process. Record each description as an assumption in `docs/<feature>/requirements-package/analysis/assumption-log.md` (this file will have been created by earlier analysis steps; if it does not yet exist, create it). Build a minimal current-state understanding, then proceed to Step 3. The to-be map will have lower confidence because the current state is user-stated, not evidence-derived — label the map header with **[LOW CONFIDENCE — AS-IS USER-STATED]**.

**Step-level confidence:** If the as-is baseline is partially known — some steps evidence-derived, others user-stated — apply confidence at the step level rather than only at the document level. Annotate individual steps with `[LOW CONFIDENCE — USER-STATED]` where the basis is user input rather than a discovery artifact. This ensures reviewers can identify exactly where uncertainty lives rather than treating the entire map as uniformly uncertain.

### Step 3 — Design the To-Be Process

Apply the proposed change to each affected process. For every step type, capture the information below. The scope of this step is business process design — how the work flows between actors and what governs the flow. Do not specify how systems are implemented or what technology stack is used.

**For each new step (`[NEW]`):**

- Which actor performs it? If no human actor is involved, identify the system and label it `[SYSTEM: <system-name>]` (or `[SYSTEM: TBD]` if not yet confirmed). Confirm with the process owner or a subject matter expert that the actor assignment is correct — do not infer actor from requirements alone.
- What action do they take?
- What triggers it and what does it produce?
- Where does it fit in the sequence — between which existing steps?
- Are there timing or SLA constraints on this step (from the constraint register)? If yes, note them in the step description. Cross-reference volume and frequency data captured in Step 1 to assess whether the SLA is achievable — if volume context is absent, flag the SLA constraint as unvalidatable and log it as an assumption.
- What happens if it fails? Document at least one exception path — an error exit, a retry, or an escalation — in the flowchart. A `[NEW]` step with no documented failure path is incomplete.
- **Business rule:** If this step is a decision point (the process branches based on a condition), document the business rule: "If [condition], then [path A]; otherwise [path B]." Do not embed business rules in the step label — record them separately in the business rules section of the process map with Status `NEW`. Each decision node in the flowchart must reference a business rule by ID.

**For each modified step (`[MODIFIED]`):**

- What specifically changes — the actor, the action, the decision logic, the handoff?
- Why does it change — which requirement drives this modification?
- Does the modification affect downstream steps? If yes, review each downstream step for knock-on changes. Any downstream step whose effective behaviour is altered — even if its definition is nominally unchanged — must be reclassified from `[UNCHANGED]` to `[MODIFIED]` and re-evaluated before continuing.
- **Exception paths:** If the modification changes how the step can fail, or if the modification removes a previously present failure handling mechanism, document the new or updated exception path. Do not assume unchanged exception handling — verify it explicitly.
- **Business rule:** If the modification changes a decision condition, update the business rule in the business rules table, assign it a new Rule ID, and set its Status to `MODIFIED`. In the delta table Description field for this step, record both the prior rule and the replacement rule so reviewers can see what changed (e.g., "Prior: approval threshold $5,000. New: approval threshold $10,000 per REQ-022"). If the decision condition is unchanged, carry the rule forward with Status `UNCHANGED`.

**For each removed step:**

- Why is it being removed — which requirement makes it obsolete?
- **Capability disposition:** What happened to the work this step performed? Record one of: (a) absorbed by step [N] — describe how; (b) capability retired — explain why it is no longer needed; (c) deferred to a later phase — record what phase and by whom. A removed step with no documented disposition is an unresolved gap. Log any unresolved disposition in `docs/<feature>/requirements-package/analysis/assumption-log.md`.
- Are there downstream steps that depended on this step's output? If yes, each orphaned downstream step must be resolved before continuing: either (a) reclassify it as `[MODIFIED]` and describe how it will now receive its input, or (b) if the resolution is unclear, log it as an open issue in `docs/<feature>/requirements-package/analysis/assumption-log.md` and raise it with the user before proceeding.

**For each unchanged step (`[UNCHANGED]`):**

- Carry it forward verbatim from the as-is map. Do not modify unchanged steps during this skill — if they need modification, that should have been captured in change-scoping. If an unchanged step interacts with a new or modified neighbouring step in a way that alters its effective behaviour (even if its own definition is unchanged), reclassify it as `[MODIFIED]` and document the behavioural change.
- **Business rule:** If this step is a decision point, carry its existing rule forward in the business rules table with Status `UNCHANGED`. The rule text and condition must match the as-is source exactly — do not paraphrase.

**Handoff documentation:**
For every step where work or responsibility transfers from one actor to another, document the handoff explicitly. A flowchart arrow is not a handoff record. For each handoff, capture:

- **Sender:** the actor handing off (role name)
- **Receiver:** the actor receiving (role name or `[SYSTEM: <name>]`)
- **Content:** what is being transferred (document, data, decision, event)
- **Format:** how it is transferred (form submission, email, system notification, verbal instruction, queue event)
- **Timing:** by when (on demand, within N hours, by end of business day, triggered by upstream event)
- **Channel:** the medium (email, internal portal, system queue, in-person meeting)

If any handoff attribute is unknown, record it as unknown and log an assumption. Undocumented handoffs are a primary source of process failures in implementation.

**Parallel and concurrent paths:**
If the to-be process contains steps that run concurrently or in parallel (multiple actors acting simultaneously before a synchronisation point), document each parallel path explicitly. Record the synchronisation point — the condition under which the process waits for all parallel paths to complete before continuing. Do not represent concurrent execution as sequential — misrepresenting parallelism causes risk-analysis and gap-analysis to underestimate complexity.

### Step 4 — Validate Against Constraints

Review the constraint register for constraints that affect the to-be process:

- Does any new step violate a technology constraint?
- Does the to-be process exceed a performance budget?
- Does any new handoff cross a team ownership boundary requiring coordination?
- Does any new data flow trigger a regulatory constraint?
- Do the volume and frequency data from Step 1 indicate that SLA constraints are unachievable at expected load?

If a constraint violation is found, three responses are possible — select one and document the choice in `docs/<feature>/requirements-package/analysis/decision-log.md` (this file will have been created by earlier analysis steps; if it does not yet exist, create it):

1. **Redesign:** Rework the step to comply with the constraint. Return to Step 3 for the affected step(s) and re-validate.
2. **Waiver request:** A waiver is appropriate when all of the following apply: (a) there is a named authority with the organisational mandate to grant exceptions to this type of constraint, (b) the scope and duration of the exception are defined, and (c) proceeding with the violation does not introduce a risk the organisation has assessed as unacceptable. Log the constraint, the violation, the rationale, and the named waiver authority in `docs/<feature>/requirements-package/analysis/decision-log.md`. Raise the waiver with the user before the hand-off gate — do not proceed as if the waiver is already granted.
3. **Blocker:** A violation is a blocker when any of the following apply: (a) no authority exists to grant an exception, (b) the constraint is regulatory or legal in nature and non-compliance carries external liability, or (c) the risk of proceeding is assessed as unacceptable regardless of any waiver. Log the violation as a blocker in `docs/<feature>/requirements-package/analysis/decision-log.md`, surface it to the user immediately, and halt until the user provides direction. Do not produce a partially-compliant map and continue.

The BSA does not classify a violation as waiver vs. blocker unilaterally — apply the criteria above and present the classification to the user for confirmation before logging the decision.

### Step 5 — Document the Change Delta

Produce a concise delta summary for each process:


| Change type | Step          | Requirement ID                    | Description                                 | Capability disposition (REMOVED only)                |
| ----------- | ------------- | --------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| NEW         | (step number) | (req ID, or "No req — [explain]") | What was added and why                      | N/A                                                  |
| MODIFIED    | (step number) | (req ID, or "No req — [explain]") | What changed and what requirement drives it | N/A                                                  |
| REMOVED     | (former step) | (req ID, or "N/A — [explain]")    | What was removed and why                    | Absorbed by step [N] / Retired / Deferred to [phase] |


This delta feeds directly into gap-analysis — every new or modified step is a potential gap source. Every removed step with a non-retired disposition is a potential gap source if the absorbing step has not been verified.

### Step 6 — Link to User Journeys

For each to-be process map, record the following in the persona linkage section of the process-map template:

**Human-actor steps:**

- Persona name → step number(s) → the input they provide or the output they receive

**System-only steps (no human actor):**

- `[SYSTEM: <system-name>]` → step number(s) → the event or data the system produces

System-only steps must appear in the process map for completeness but are not linked to user journeys.

**Fully automated processes:** If a workflow is entirely composed of system actors with no human touchpoints, the persona linkage table will be empty for human actors. Flag this explicitly at the top of the persona linkage section: `[FULLY AUTOMATED — NO HUMAN TOUCHPOINTS — NO USER JOURNEY GENERATED]`. User-journey-mapping reads the persona linkage table of each process map before beginning — this flag is its signal to skip this process. The flag in the process-map document is sufficient; no separate notification is required.

This prepares the hand-off to user-journey-mapping (step 7 in the analysis-workflow) for all processes that have at least one human actor.

### Step 7 — Assemble

Populate the process-map template (`../assets/process-map.md`) for each affected process. Include:

- **Process owner** — the role identified in Step 1, recorded at the top of the document. If ownership is unresolved, record `Process owner: unresolved — see assumption-log [ID]`.
- **Confidence header** — if the as-is baseline was user-stated rather than discovery-derived, include `[LOW CONFIDENCE — AS-IS USER-STATED]` at the top of the document. If the workflow is entirely new, include `[NEW WORKFLOW — NO PRIOR AS-IS STATE]`. If step-level confidence variations apply, annotate those steps with `[LOW CONFIDENCE — USER-STATED]`.
- **Volume, frequency, and target metrics** — a brief record at the top of the document: process frequency, expected transaction volume, peak periods (or "unknown — see assumption-log [ID]"), and any target cycle time, throughput, or error rate thresholds from Step 1. These provide the baseline for gap-analysis and risk-analysis to assess process performance.
- **Mermaid flowchart** covering: the to-be happy path, key decision branches, parallel paths with synchronisation points, and at least one exception or failure exit per `[NEW]` step that can fail and per `[MODIFIED]` step whose failure mode has changed. If the workflow has alternative paths (e.g., approval granted vs. rejected), all meaningful branches must appear. Removed steps do not appear in the flowchart — they are documented in the delta table only.
- **Step labels:** `[NEW]`, `[MODIFIED]`, `[UNCHANGED]` on every step.
- **System actor nodes** rendered as rounded rectangles (`([text])` in Mermaid) to distinguish from human-actor steps (standard rectangles).
- **Business rules table** — one row per decision node in the flowchart:

  | Rule ID | Status | Decision node (step #)   | Condition             | Path if true            | Path if false         |
  | ------- | ------ | ------------------------ | --------------------- | ----------------------- | --------------------- |
  | BR-001  | NEW    | Step 4 — Approve request | Order value > $10,000 | Route to senior manager | Route to line manager |

  **Status values:** `NEW` — rule did not exist in the as-is process; `MODIFIED` — rule existed but its condition has changed (record the prior rule text in the delta table Description field); `UNCHANGED` — rule is carried forward from the as-is process without alteration.
  Every decision node in the Mermaid flowchart must reference a Rule ID from this table. A decision node with no business rule is an incomplete process map.
- **Handoff summary table** — one row per handoff between actors:

  | Handoff # | From         | To           | Content                 | Format     | Timing                            | Channel         |
  | --------- | ------------ | ------------ | ----------------------- | ---------- | --------------------------------- | --------------- |
  | HO-001    | Line manager | Finance team | Approved purchase order | Signed PDF | Within 1 business day of approval | Internal portal |

- **The change delta table** (from Step 5, including Capability disposition column).
- **Persona linkage table** (human actors and system actors, as populated in Step 6). If fully automated, include the `[FULLY AUTOMATED — NO HUMAN TOUCHPOINTS — NO USER JOURNEY GENERATED]` flag at the top of the persona linkage section.

## Mid-Analysis Updates

Process maps are produced mid-analysis. If an upstream input changes after a process map has been produced — the change scope is revised, the constraint register is updated, a confirmed requirement is modified — the affected process maps must be re-validated:

1. Identify which process maps reference the changed input (scope item, constraint, or requirement).
2. Re-run the affected steps for each affected map, based on what changed:
  - **Change scope revised** — restart from Step 1 for any newly added or removed scope items; existing maps that are no longer in scope must be withdrawn and their withdrawal logged in `docs/<feature>/requirements-package/analysis/decision-log.md`.
  - **Constraint register updated** — re-run Step 4 (validate) for all maps. If a new or tightened constraint affects the process design, re-run Step 3 (design) for affected steps before re-validating.
  - **Confirmed requirement changed** — re-run Step 3 for the steps that trace to the changed requirement, then re-run Step 4 for those steps.
3. Revise the affected maps, rewrite the files, and flag them for re-approval at the hand-off gate.
4. Log the update event in `docs/<feature>/requirements-package/analysis/decision-log.md`: which input changed, which maps were affected, and what was revised.

Do not proceed to the hand-off gate with a process map that was produced against a superseded input. A map built on a stale constraint or out-of-scope requirement is not a reliable basis for gap-analysis or functional requirements.

## Output

One populated **process-map** document per affected process (use the template at `../assets/process-map.md`).

### File Output

Write each completed process map to `docs/<feature>/requirements-package/analysis/process-map-[process-name].md`, where `[process-name]` is the workflow name (lowercase, hyphens for spaces).

Process maps feed into:

- **user-journey-mapping** (step 7) — the to-be journey rides on top of the to-be process, using the persona linkage table as the entry point. Fully automated processes do not generate user journeys.
- **gap-analysis** (step 8) — current vs future process comparison identifies readiness gaps; the change delta table and business rules table are the primary inputs
- **risk-analysis** (step 11) — new or modified steps, exception paths, logged constraint violations, unresolved handoff attributes, and parallel path complexity are risk sources
- **functional requirements** — each `[NEW]` and `[MODIFIED]` step that references a system action is a candidate functional requirement; the business rules table is a candidate source for business rules requirements; the requirements author uses the process maps to enumerate system behaviours and rules that must be specified

## Failure Modes This Skill Can Introduce


| Risk                                                                                                                                                                | How to mitigate                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| To-be map built on incorrect user-stated as-is assumptions (when discovery was skipped) creates false confidence that propagates into gap-analysis and requirements | Label maps `[LOW CONFIDENCE — AS-IS USER-STATED]`; apply step-level confidence annotations where confidence varies within a map; log all as-is claims as assumptions; validate with the process owner before the hand-off gate |
| Premature process design locks in workflow decisions before requirements are validated, making later changes expensive                                              | Trace every `[NEW]` and `[MODIFIED]` step to a confirmed requirement; flag untraced steps explicitly — do not treat a designed step as implicitly approved                                                                     |
| Exception and alternative flows are omitted, causing risk-analysis and user-journey-mapping to underestimate complexity                                             | Step 7 requires exception flows and decision branches for `[NEW]` and failure-mode-changed `[MODIFIED]` steps, not just the happy path                                                                                         |
| A partially-scoped workflow is mapped as if only the changed portion exists, dropping context for unchanged steps                                                   | Step 1 requires full end-to-end mapping of any touched workflow, with unchanged portions labeled `[UNCHANGED]`                                                                                                                 |
| Process maps produced without input from subject matter experts or process owners misrepresent operational reality                                                  | Step 1 requires process owner identification; actor assignments for `[NEW]` steps must be confirmed with the process owner or a subject matter expert, not inferred from requirements alone                                    |
| Recording specific system names in process maps creates premature architectural commitment before solution design has confirmed the technology approach             | Use `[SYSTEM: TBD]` when the specific system is not yet confirmed. Record a specific system name only when a stakeholder has explicitly confirmed it. This is a requirements artefact — not a design specification.            |
| Parallel or concurrent paths are omitted or misrepresented as sequential, causing risk-analysis and gap-analysis to underestimate concurrency complexity            | Step 3 requires explicit documentation of parallel paths and synchronisation points                                                                                                                                            |
| Removed steps whose capability destination is unresolved create silent gaps that propagate into implementation                                                      | Step 5 requires a Capability disposition for every removed step; unresolved dispositions must be logged as assumptions and raised before the hand-off gate                                                                     |


## Failure Modes This Skill Prevents


| Failure mode                                                                                                          | How this skill prevents it                                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Requirements describe what the system should do but not how the workflow changes                                      | To-be process maps make workflow changes explicit and traceable                                                  |
| New steps violate existing constraints                                                                                | Step 4 validates against the constraint register before the design is locked                                     |
| Existing steps are accidentally dropped from the future workflow                                                      | Step 2 starts from the as-is map and carries forward all unchanged steps                                         |
| Gap-analysis has no future state to compare against                                                                   | To-be maps provide the comparison target for current vs future gap identification                                |
| User-journey-mapping has no process foundation to build on                                                            | Step 6 links personas to process steps, providing the skeleton for journey mapping                               |
| Decision points have no documented governing logic                                                                    | Business rules table requires every decision node to reference a named, documented rule                          |
| Handoffs are implied by flowchart arrows but never formally documented, causing implementation-time surprises         | Handoff summary table requires sender, receiver, content, format, timing, and channel for every actor transition |
| SLA constraints in the constraint register are treated as achievable without validating against actual process volume | Step 1 captures volume and frequency; Step 4 cross-references SLA constraints against that data                  |
| A fully automated process triggers an empty user journey mapping exercise                                             | Step 6 flags fully automated processes and excludes them from user-journey-mapping                               |


## Hand-off Gate

**Before reading `user-journey-mapping.md` (analysis-workflow step 7), you must:**

1. Write the completed to-be process-map artifact in full — one entry per affected process. Use the template at `../assets/process-map.md`.
2. **Write each process map to `docs/<feature>/requirements-package/analysis/process-map-[process-name].md`, where `[process-name]` is the workflow name as it appears in the change scope's in-scope list (lowercase, hyphens for spaces — e.g., `process-map-order-fulfilment.md`). If multiple processes were mapped, write one file per process. All file writes must succeed before proceeding.**
3. Present all process maps to the user.
4. Ask the user to review each map against the **Completion Criteria checklist** at the end of this skill. The completion criteria define completeness — approval means every applicable criterion is satisfied, not that the map looks reasonable at a glance. Present the checklist alongside the maps.
5. Ask the user explicitly: **"Have you reviewed these process maps against the completion criteria checklist? Do they satisfy every applicable criterion, and are they approved to proceed to user-journey-mapping?"** The process owner identified in Step 1 is the appropriate approval authority for each map — if the user and the process owner are different people, confirm whether the process owner has been consulted.
6. If the user approves all maps, proceed to user-journey-mapping. User-journey-mapping will read the persona linkage tables and generate journeys only for processes with human actors — processes flagged `[FULLY AUTOMATED — NO HUMAN TOUCHPOINTS — NO USER JOURNEY GENERATED]` require no action from user-journey-mapping. Skip user-journey-mapping entirely only if every approved process map carries the fully automated flag.
7. If the user requests changes to specific maps: revise only the identified maps, rewrite the affected files, re-present the revised maps, and ask for confirmation again. Do not re-present maps the user has already approved. Do not proceed until all maps are approved.
8. If the user raises a blocker (an unresolvable constraint violation, an unresolved process owner, or an open assumption that prevents confident process design): log it in `docs/<feature>/requirements-package/analysis/decision-log.md`, surface it explicitly, and halt until the user provides resolution direction.

---

## Completion Criteria

- All workflows in the change scope's in-scope list have been evaluated — none skipped without rationale
- Each affected process has a process owner recorded (or `unresolved` with an assumption-log entry and resolution deadline)
- Volume, frequency, and peak period information is recorded for each process (or explicitly noted as unknown with an assumption-log entry)
- Target performance metrics (cycle time, throughput, error rate) are recorded where stated in the constraint register or business objectives (or explicitly noted as not defined)
- Each affected process has a to-be map with all steps labeled `[NEW]`, `[MODIFIED]`, or `[UNCHANGED]`
- Entirely new workflows are labeled `[NEW WORKFLOW — NO PRIOR AS-IS STATE]` and contain only `[NEW]` steps
- Every `[NEW]` and `[MODIFIED]` step traces to a confirmed requirement (Requirement ID recorded in the delta table)
- Every removed step is documented in the change delta table with rationale, Requirement ID, and Capability disposition
- The to-be process does not violate any constraint in the constraint register (or violations are logged in `docs/<feature>/requirements-package/analysis/decision-log.md` with waiver or blocker decisions confirmed with the user)
- Each to-be map includes a Mermaid flowchart covering the happy path, key decision branches, parallel paths with synchronisation points, and at least one exception/failure exit per fallible `[NEW]` step and per `[MODIFIED]` step whose failure mode has changed
- Removed steps are absent from the Mermaid flowchart and present in the change delta table
- System-only steps are labeled `[SYSTEM: <system-name>]` (or `[SYSTEM: TBD]` if unconfirmed) and rendered as rounded rectangles in Mermaid
- Every decision node in the Mermaid flowchart references a business rule by ID in the business rules table
- The business rules table is complete — no decision node is undocumented, and every rule has a Status of `NEW`, `MODIFIED`, or `UNCHANGED`
- The handoff summary table is complete — every actor-to-actor transition has sender, receiver, content, format, timing, and channel recorded (or unknown attributes flagged as assumptions)
- Persona linkage is recorded for each process (human actors and system actors noted separately)
- Fully automated processes are flagged `[FULLY AUTOMATED — NO HUMAN TOUCHPOINTS — NO USER JOURNEY GENERATED]` in the persona linkage section
- If discovery was skipped, all current-state claims are logged as assumptions in `docs/<feature>/requirements-package/analysis/assumption-log.md` and maps are labeled `[LOW CONFIDENCE — AS-IS USER-STATED]`
- Step-level `[LOW CONFIDENCE — USER-STATED]` annotations are applied where confidence varies within a single map
- All skipped-workflow rationale, constraint waivers, blocker decisions, and mid-analysis update events are logged in `docs/<feature>/requirements-package/analysis/decision-log.md`
- If any upstream input changed after process maps were initially produced, affected maps have been re-validated and the update event is logged in `docs/<feature>/requirements-package/analysis/decision-log.md`
- The process owner (or a confirmed delegate) has been consulted on the accuracy of each process map before gate approval
