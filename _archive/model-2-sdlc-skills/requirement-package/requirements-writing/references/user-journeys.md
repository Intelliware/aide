# User Journeys

## Purpose

Map user experience flows for all personas affected by the proposed change — how users will interact with the system to achieve their goals after the feature is implemented. If the analysis phase ran, consumes the to-be user journey maps from analysis user-journey-mapping and carries them forward into the requirements package with any refinements. If analysis was skipped, maps user journeys directly from the user's description of the desired experience and the persona definitions from stakeholder-personas. Each journey captures: the persona, their goal, the stages they pass through, the touchpoints at each stage, the actions they take, the outcomes they need to experience at each stage, and anticipated friction points. Produces user journey documents that become Section 4 of the requirements package and are consumed by functional-requirements to ensure every functional requirement can be traced to a user experience stage.

## When to Use

- After business-objectives — journeys must be grounded in who the users are and what they need to achieve
- Before functional-requirements — journey stages define the end-to-end experience the functional spec must specify and support
- When the requirements package needs user experience flows that show how personas achieve their goals
- Before permissions-access-control — journey stages reveal which personas need access to which capabilities

## What This Produces

**User journey maps** for each persona affected by the change — staged from the user's perspective, showing how the experience will work after the feature is implemented.

Each journey map contains:
1. **Journey metadata** — persona, goal, scope reference (the change-scoping identifier or, if change-scoping was skipped, the business objective ID that motivates this journey)
2. **Journey stages** — the steps the user passes through to achieve their goal
3. **Stage annotations** — for each stage: goal, touchpoints, actions, system response, anticipated friction, satisfaction indicator
4. **Journey diagram** — a Mermaid journey diagram for the happy path
5. **Friction summary** — consolidated view of anticipated friction points across all stages

## Analysis Journey Artifacts — Per-Artifact Detection

This skill checks for each analysis artifact independently.

**To-be user journey maps are available** if `docs/<feature>/requirements-package/analysis/user-journey-map.md` files exist (from analysis user-journey-mapping):
- Carry them forward as the starting point; supplement with refinements based on the persona definitions and business objectives confirmed in earlier requirements steps.

**To-be process maps are available** if `docs/<feature>/requirements-package/analysis/process-map.md` files exist (from analysis process-mapping):
- Use them to inform stage sequencing and system context when designing journey flows.

**Neither is available** (analysis was skipped, or analysis did not reach those steps):
- Map user journeys directly from the user's description of the desired experience and the persona definitions.

## How User Journeys Differ from Functional Requirements

| Functional Requirements | User Journeys |
|------------------------|---------------|
| System-centric: what the system does | User-centric: what the user experiences |
| Individual capabilities | End-to-end flows across capabilities |
| "The system sends a confirmation email" | "The user receives confirmation and knows their order was placed" |
| Structured for implementation | Structured for experience design and testing |

Both are needed. Functional requirements tell developers what to build. User journeys tell everyone what the user will experience.

## Inputs

| Input | Source | Required | If artifact not available |
|-------|--------|----------|--------------------------|
| To-be user journey maps | `docs/<feature>/requirements-package/analysis/user-journey-map.md` | If available | User describes desired experience |
| To-be process maps | `docs/<feature>/requirements-package/analysis/process-map.md` | If available | User describes workflows |
| Persona definitions | stakeholder-personas (this phase) | Yes | Completed in a prior step |
| Business objectives | business-objectives (this phase) | Yes | Completed in a prior step |
| Change-scope | `docs/<feature>/requirements-package/analysis/change-scope.md` | If available | User describes scope |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. IDENTIFY — Personas and journeys to map          │
│     Which personas are affected by the feature?      │
│     What goals do they need to accomplish?           │
├──────────────────────────────────────────────────────┤
│  2. DESIGN — Map the future-state journey            │
│     If analysis ran, carry forward to-be maps.       │
│     If not, design from user description.            │
│     Add stages, touchpoints, system responses.       │
├──────────────────────────────────────────────────────┤
│  3. ANNOTATE — Six fields per stage                  │
│     Goal, touchpoints, action, system response,      │
│     anticipated friction (rated), satisfaction       │
│     indicator.                                       │
├──────────────────────────────────────────────────────┤
│  4. ASSEMBLE — Populate journey map template         │
│     Then verify cross-persona hand-off points        │
│     for data, timing, and state consistency.         │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Identify Personas and Journeys

**Definition — what is a journey?**
A journey is a discrete end-to-end sequence of interactions a single persona undertakes to achieve one goal. A goal boundary is where the persona considers their task complete. If a persona pursues multiple distinct goals, each is a separate journey. Do not combine multiple goals into a single journey map.

**Naming journeys:**
Name each journey after the persona's goal in kebab-case: `[persona]-[goal-verb]-[object]`. Examples: `buyer-submit-order`, `admin-export-report`, `support-agent-resolve-ticket`.

**Identify affected personas** from the persona definitions in stakeholder-personas and the business objectives:
- Which personas are named in the persona definitions as actors affected by this feature?
- Which personas are implied by the business objectives — whose behavior must change for the objective to be met?
- Does the feature introduce a new persona type?

**Scope the mapping effort:**
1. **Map first:** The journey the feature directly creates or involves — in full, for all affected personas. Apply the full six-field annotation (Step 3).
2. **Map second:** Adjacent journeys — those where a stage in the primary journey produces an output the adjacent journey depends on as an input, or where the adjacent journey feeds an input into the primary journey. Adjacency is defined by this data or handoff dependency, not by subject-matter proximity. Map adjacent journeys in summary only using the format below.
3. **Defer or skip:** Journeys unaffected by the feature.

**Adjacent journey summary format** (one row per stage):

| Stage name | Description | Connected primary journey stage |
|------------|-------------|----------------------------------|

- **Stage name** — name of the stage in the adjacent journey
- **Description** — one sentence: what the user does and what the system responds
- **Connected primary journey stage** — the stage in the primary journey that shares a touchpoint or data object with this stage

Do not apply the six-field annotation to adjacent journey stages. Do not produce a Mermaid diagram for adjacent journeys.

### Step 2 — Design the Future-State Journey

**If analysis ran:** Carry forward the to-be user journey maps from analysis. Check whether the persona definitions or business objectives confirmed in earlier requirements steps clarify or expand on the analysis journey maps. Update accordingly. The functional spec does not yet exist at this step — any capability assumptions embedded in the journey stages are inputs to functional-requirements, not outputs from it.

**If analysis was skipped:** Design the journey from the user's description of the desired experience, the persona definitions from stakeholder-personas, and the business objectives. Do not reference the functional spec — it does not yet exist at this step. Any capability assumptions embedded in the journey stages become inputs to functional-requirements, not outputs from it.

**For each stage:**
- What user goal does this stage serve?
- What touchpoints does the user interact with?
- What does the user need to know or do at this point?
- How does the system respond from the user's perspective?

**Recover stage:**
Every journey where an error, system failure, or user mistake is possible must include a Recover stage. The Recover stage is annotated with all six fields and is **not** included in the Mermaid happy-path diagram — recovery paths are documented in the stage annotations only. If no error scenario is conceivable, document the assessment explicitly: state (a) what error, system failure, and user-mistake scenarios were considered, and (b) why each was determined to be not applicable for this journey. A bare assertion that no recovery path is needed is not acceptable.

**Legitimate flow variations (branching):**
A journey may have valid alternative paths that are not errors — for example, authenticated vs. guest checkout within the same goal. Handle these as follows:
- If the paths share the majority of stages, map the primary path in full and document the variant as a named branch note within the affected stage(s).
- If the paths diverge substantially (more than half the stages differ), treat them as separate journeys with distinct names.
- Do not silently pick one variant and omit the other. Document the decision explicitly.

### Step 3 — Annotate the Six Stage Fields

For each primary journey stage, populate all six fields:

**Goal** — what the user wants to achieve (written as "I want to...").

**Touchpoints** — every UI element, system surface, or communication the user interacts with at this stage.

**Action** — what the user will do. Be specific: "clicks 'Submit'", "enters email address", "waits for confirmation".

**System response** — what the system does from the user's perspective in response to the action. If the response is invisible to the user (backend-only), state that explicitly.

**Anticipated friction** — potential pain points in the designed experience. When assessing friction, ask:
- Will the user understand what to do at this stage without assistance?
- Is the expected system response clear and timely from the user's perspective?
- What happens if the user makes a mistake or provides incorrect input?
- Does this stage introduce new steps or complexity compared to the persona's current expectations?

Rate each anticipated friction point:
- **High** — likely to block task completion or cause abandonment
- **Medium** — may cause confusion but has a workaround
- **Low** — minor friction most users will tolerate

**Satisfaction indicator** — a provisional qualitative signal for the stage experience. This is not a validated user research score — it is an analytical flag to focus attention on stages most likely to need design attention before functional requirements are finalised. Record as:
- **Positive** — the stage is expected to be smooth; no High friction points; and the design addresses a known user need or pain point from the persona definitions or business objectives
- **Neutral** — the stage is workable; no High friction points; no notable improvement over the persona's current expectations
- **Negative** — the stage carries at least one High-severity anticipated friction point; warrants attention before functional requirements are finalised
- **Blocked** — the stage carries two or more High-severity anticipated friction points, or a single friction point likely to cause task abandonment

The friction summary, not the indicator alone, is the complete picture of anticipated friction — the indicator signals where to look, the friction detail explains why.

### Step 4 — Assemble

Populate the `user-journeys` template for each persona/journey pair. Include:
- A Mermaid journey diagram for the to-be happy path with satisfaction indicators
- The six-field stage annotations
- Cross-persona consistency check (see below)

**Cross-persona consistency check:**
A hand-off point is any stage where one persona's journey ends and another persona's journey begins, or where two personas interact with the same system object at the same time (e.g., one persona submits a record that another persona then reviews).

For each hand-off point, verify:
1. **Data consistency** — the object or data passed from one persona matches what the receiving persona expects at the corresponding stage of their journey.
2. **Timing consistency** — the stage sequence across personas is compatible (e.g., Persona A's "submit" stage occurs before Persona B's "review" stage, not after).
3. **State consistency** — the system state assumed at the start of the receiving persona's stage matches the system state produced at the end of the handing-off persona's stage.

Document each hand-off point in a table:

| Hand-off | From persona / stage | To persona / stage | Consistent? | Issue (if any) |
|----------|---------------------|--------------------|-------------|----------------|

If an inconsistency is found: correct the affected journey stage(s) before completing this step. Do not proceed with an unresolved inconsistency.

## Output

One populated **user-journeys** document per persona/journey combination (use the template at `../assets/user-journeys.md`). If the template file does not exist, produce the output using the structure defined in "What This Produces" above — do not block or skip the step.

### File Output

Write the completed user journeys to `docs/<feature>/requirements-package/requirements/user-journeys.md`.

This is Section 4 of the requirements package. Journey maps are consumed by functional-requirements — every functional requirement must be traceable to at least one journey stage. Journey maps also inform interaction design, acceptance criteria, and testing flows.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Journey stages describe internal system mechanics rather than what the user experiences | Journey stages capture the user's goal, action, and observable outcome at each step — not the system's internal behaviour |
| New stages add friction that degrades the experience without anyone noticing | Step 3 requires friction assessment using concrete questions for every stage |
| Error and recovery paths missing from the future design | Step 2 requires a Recover stage or an explicit, evidenced assessment of why no recovery path applies |
| Cross-persona hand-off points are inconsistent | Step 4 requires a cross-persona consistency check |
| Journeys are accepted without traceability to what the business needs to achieve | Every journey must trace to at least one business objective ID |
| End-to-end flows are never considered during requirements review or testing | Journey maps inform acceptance criteria and QA planning — each journey stage can become an end-to-end test scenario |

## Hand-off Gate

Before proceeding to the next requirements skill, you must:
1. Write the completed user journey maps for every affected persona/journey combination.
2. Present all journey maps to the user.
3. Receive explicit acknowledgement that the user confirms: (a) all affected personas and journeys are represented, (b) the stage sequence and descriptions are accurate, (c) any flagged experience friction points are acknowledged or addressed, and (d) the maps are approved as the basis for functional-requirements.

---

## Completion Criteria

- [ ] All personas affected by the feature have been identified
- [ ] Each affected persona has at least one journey mapped (primary or adjacent summary)
- [ ] Each journey is named using the `[persona]-[goal-verb]-[object]` convention
- [ ] Every journey traces to at least one business objective ID from business-objectives
- [ ] Primary journeys: each stage has all six fields: goal, touchpoints, action, system response, anticipated friction, satisfaction indicator
- [ ] Adjacent journeys: each stage has the three-field summary (stage name, description, connected primary journey stage)
- [ ] A Mermaid journey diagram is present for each **primary** journey (happy path only; Recover stage is in annotations, not the diagram)
- [ ] Every primary journey stage names a specific user action, a specific system surface or touchpoint, and a specific observable outcome the user experiences — sufficient for a functional requirement to be derived from it
- [ ] Every journey has been assessed for whether a Recover stage is needed; if no Recover stage is included, the assessment explicitly states what error, failure, and user-mistake scenarios were considered and why each is not applicable
- [ ] Any legitimate flow variations are documented as named branch notes or as separate journeys
- [ ] Cross-persona hand-off points table is present; all inconsistencies are resolved before proceeding
- [ ] If analysis ran, the analysis to-be journey maps have been reviewed and carried forward with any updates documented
- [ ] If analysis was skipped, journey stages are designed from user description and persona definitions
