# User Journey Mapping

## Purpose

Map future-state (to-be) user experience flows for all personas affected by the proposed change. Captures how user goals, touchpoints, actions, and experience will work after the change is implemented. The analysis-phase complement to discovery's user-journey-mapping (which maps as-is only). Uses the to-be process maps as the underlying workflow, then layers the user experience perspective. Feeds gap-analysis (current vs future journey comparison) and risk-analysis (UX risks in the future design). Always runs in analysis regardless of whether discovery ran.

## When to Use

- Step 7 in the analysis-workflow sequence — run after process-mapping, before gap-analysis
- Always runs regardless of whether discovery was completed — this skill maps the future state, so its output is required whether or not a current-state baseline exists
- Before gap-analysis — the comparison of current vs future journeys is a primary gap source

## What This Produces

**To-be user journey maps** for each persona affected by the proposed change — staged from the user's perspective, showing how the experience will work after the change is implemented.

## How It Differs from Discovery User Journey Mapping

| Discovery user-journey-mapping | Analysis user-journey-mapping |
|-------------------------------|-------------------------------|
| Maps as-is (current state) journeys | Maps to-be (future state) journeys |
| Derived from UI evidence in the codebase | Designed from confirmed requirements and to-be process maps |
| Describes what users experience today | Describes what users will experience after the change |
| Pain points are existing friction | Pain points are anticipated risks in the new design |

## How It Differs from Process Mapping

| Process Map | User Journey Map |
|-------------|-----------------|
| System/operational view | User experience view |
| Actors, steps, handoffs, decision points | Goals, touchpoints, actions, system responses, anticipated friction, satisfaction indicator |
| Shows what the system will do | Shows what the user will experience |
| All actors including backend systems | Focused on the human |

Both are needed. Process maps tell you *what the system will do*. Journey maps tell you *how it will feel to use it*.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| To-be process maps | analysis process-mapping (step 6) | Yes — the journey rides on top of the process |
| Change scope (in-scope list) | change-scoping | Yes — determines which journeys are affected |
| Constraint register | constraint-extraction | Yes — UX constraints the journey must respect |
| Stakeholder map | analysis stakeholder-mapping (step 1 — always runs; always present) | Yes — identifies personas |
| Current-state user journey maps | discovery user-journey-mapping | If available — provides the baseline for comparison |
| Confirmed requirements | requirements-elicitation; if that step was skipped, a direct user-provided description suffices — log each item as an assumption | Yes — defines what the future experience must achieve |

**"Confirmed requirements"** means requirements agreed by elicitation stakeholders and recorded in the elicitation output — not requirements still open for discussion or subject to unresolved disagreement.

**Degraded-input handling — partial or unconfirmed requirements:**

Requirements are rarely fully confirmed at the point journey mapping runs. Where requirements are partial or contested, apply the following:

- For each journey stage derived from an unconfirmed requirement, add an assumption-log entry: record the requirement ID (or description), what is unconfirmed, the stakeholder who must confirm it, and the latest acceptable resolution date.
- Label the stage `[ASSUMPTION: REQ-nnn]` in the draft journey map so downstream consumers (gap-analysis, risk-analysis) know which stages rest on unverified ground.
- Do not treat unconfirmed requirements as a stable design basis — stages built on them must be revisited once requirements are confirmed and may require a partial re-run of Steps 3–6 for the affected journey.
- If the majority of requirements for a given journey are unconfirmed, flag the entire journey map as provisional in its header and note it in the assumption-log. A journey map where most stages rest on unconfirmed requirements is an analytical risk, not an analytical output.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. IDENTIFY — Personas and journeys to map      │
│     Which personas are affected by the change?   │
│     Which of their journeys change?              │
│     What is the business importance of each?    │
├──────────────────────────────────────────────────┤
│  2. BASELINE — Start from the as-is journey      │
│     If discovery ran, use as-is journey maps as  │
│     the starting point. If not, build from user  │
│     input.                                       │
├──────────────────────────────────────────────────┤
│  3. DESIGN — Apply the change to the journey     │
│     Add new stages, modify existing stages,      │
│     remove obsolete stages. Layer the user       │
│     experience on top of to-be process maps.     │
│     Flag mandatory, business-critical, and       │
│     constrained stages.                          │
├──────────────────────────────────────────────────┤
│  4. ANNOTATE — Seven fields per stage            │
│     Goal, touchpoints, action, system response   │
│     (with timing threshold), anticipated         │
│     friction (rated), satisfaction indicator,    │
│     business-critical flag.                      │
├──────────────────────────────────────────────────┤
│  5. DELTA — Document the journey change delta    │
│     What stages were added, modified, or removed │
│     relative to the current journey.             │
├──────────────────────────────────────────────────┤
│  6. VALIDATE — Stakeholder review                │
│     Present draft journey maps to the business  │
│     stakeholders who own these journeys.         │
│     Incorporate corrections before assembling.  │
├──────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate journey map template     │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Identify Personas and Journeys

**Definition — what is a persona?**
A persona represents a distinct role or user type defined at the level of the business workflow being changed — not a demographic or attitudinal segment. For this analysis, a persona is a named role (e.g. "Customer Service Agent", "Finance Approver", "External Supplier") that interacts with the changed process in a materially different way from other roles. Do not split a single role into multiple personas based on skill level or experience unless the business process diverges for those variants. Do not combine roles that interact with different touchpoints or have different goals into a single persona.

**Definition — what is a journey?**
A journey is a discrete end-to-end sequence of interactions a single persona undertakes to achieve one goal. A goal boundary is where the persona considers their task complete (e.g. "order placed", "password reset", "report exported"). If a persona pursues multiple distinct goals, each is a separate journey. Do not combine multiple goals into a single journey map.

**Naming journeys:**
Name each journey after the persona's goal in kebab-case: `[persona]-[goal-verb]-[object]`. Examples: `buyer-submit-order`, `admin-export-report`, `support-agent-resolve-ticket`. This full string is the `[journey-name]` token used in the output file path (`docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md`). The persona is embedded in the journey name — do not repeat it as a separate path segment.

**Identify affected personas** from the to-be process maps and stakeholder map:
- Which personas appear as actors in the to-be process maps?
- Which personas from the stakeholder map are end users impacted by the change?
- Does the change introduce a new persona that does not exist today?

**Record business importance for each journey before scoping:**
Before deciding which journeys to map in full and which to summarise, record the following for each identified journey:

| Field | Guidance |
|-------|---------|
| Estimated frequency | How often this journey is executed per unit time (e.g. daily, weekly, per-transaction). Obtain from the business stakeholder or stakeholder map — do not estimate without a source. If unknown, log as an assumption. |
| Estimated volume | Approximate number of users or transactions per period. Same sourcing rules as frequency. |
| Business criticality | `Critical` — failure or degradation directly causes revenue loss, regulatory breach, or operational stoppage. `Significant` — failure causes meaningful downstream impact but has a workaround. `Supporting` — failure is an inconvenience with minimal business consequence. |

This business importance record is not decoration. It determines how much analytical rigour the journey warrants and feeds risk-analysis when assessing the business impact of UX risks. A High-friction stage in a Critical, high-volume journey is a higher risk than the same stage in a Supporting, low-frequency journey.

**Scope the mapping effort:**
1. **Map first:** The journey the proposed change directly creates or modifies — in full, for all affected personas.
2. **Map second:** Adjacent journeys — those where a stage in the primary journey produces an output that the adjacent journey depends on as an input, or where the adjacent journey feeds an input into the primary journey. Adjacency is defined by this data or handoff dependency, not by subject-matter proximity. Map adjacent journeys in summary. A summary requires only four items per intersecting stage: stage name, primary label (`[NEW]`, `[MODIFIED]`, or `[UNCHANGED]`), a one-sentence description of what the stage hands off to or receives from the primary journey, and the primary journey stage it connects to. The full seven-field annotation (goal, touchpoints, action, system response, anticipated friction, satisfaction indicator, business-critical flag) is not required for secondary summary stages.
3. **Defer or skip:** Journeys unaffected by the change.

If more than five adjacent journeys are identified, present the list to the user and confirm the priority order before mapping any. Do not attempt to map all adjacent journeys without explicit direction on scope.

### Step 2 — Establish the Baseline

**If discovery ran:** Use the as-is user journey maps from discovery as the starting point. This provides the before picture for delta comparison.

**If discovery was skipped:** Ask the user to describe the current journey for each affected persona. Record each description as an assumption. Build a minimal current-state understanding before designing the to-be journey.

**Assumptions about the to-be design itself:** regardless of whether discovery ran, the to-be journey is a designed future state, not an observed fact. Any stage whose design rests on an inference — rather than a confirmed requirement, a confirmed process step from the to-be process map, or an explicit stakeholder decision — must be logged as an assumption in the assumption-log. This applies even when discovery ran and a full baseline exists.

### Step 3 — Design the To-Be Journey

Layer the user experience on top of the to-be process maps from step 6 of the analysis-workflow:

**For each new stage:**
- What user goal does this stage serve?
- What touchpoints does the user interact with?
- What does the user need to know or do at this point?
- How does the system respond from the user's perspective?

**For each modified stage:**
- What specifically changes in the user's experience?
- Does the modification improve or risk degrading the experience?
- Is the change visible to the user or invisible (backend-only)?

**For each removed stage:**
- What happened to the user's need that this stage served?
- Is the need eliminated, or is it served by a different stage now?

**For each unchanged stage:**
- Carry it forward from the as-is journey. Label `[UNCHANGED]`.

**For each stage where the new design eliminates an existing friction point:**
- Add the supplementary tag `[IMPROVED]` alongside the stage's primary label. A stage is never labeled `[IMPROVED]` alone — it is always `[NEW][IMPROVED]` or `[MODIFIED][IMPROVED]`. Note the specific friction being resolved. This feeds the IMPROVED row in the Step 5 delta table.

**For unchanged stages that benefit from upstream improvements:**
- If an `[UNCHANGED]` stage experiences reduced friction because an earlier stage in the same journey was changed (e.g. data collected upstream means less re-entry at this stage), add a note in the stage's anticipated friction field: "Friction reduced by upstream change at [stage name]." Do not apply the `[IMPROVED]` tag to `[UNCHANGED]` stages — the tag is reserved for stages whose own design changed. Capture the benefit in the delta table as a note under the upstream `[IMPROVED]` entry.

**Recover stage:**
Every journey where an error, system failure, user mistake, or time-out is possible must include a Recover stage. If no error scenario is conceivable, explicitly note that the journey was assessed and no recovery path is required.

**Abandonment scenario:**
Every journey must be assessed for the possibility that a user begins but does not complete it. If abandonment is possible, document: at which stage(s) abandonment is most likely to occur, what business consequence results from an incomplete journey (e.g. orphaned records, lost transaction, compliance gap), and whether the user can resume or must restart. Record abandonment handling as a note in the relevant stage(s) and as an entry in the delta table if the change affects it. If abandonment is not possible (e.g. a system-triggered, non-interactive journey), state this explicitly.

**Mandatory and constrained stages:**
Some stages are not optional design choices — they exist because of regulatory mandate, organisational policy, or legal obligation. For each such stage, flag it `[MANDATORY: <reason>]` (e.g. `[MANDATORY: GDPR consent requirement]`). Mandatory stages must not be altered or removed in pursuit of friction reduction without explicit approval from the owning compliance or legal stakeholder. If a mandatory stage introduces High-friction, record this in the anticipated friction field and flag it for risk-analysis — the business may need to address it through supporting materials (guidance, training) rather than process change.

**Accessibility-constrained stages:**
If the organisation has accessibility commitments (legal or policy-based), stages involving user interaction must be assessed against those commitments. Flag stages where the to-be design may create accessibility barriers as `[ACCESSIBILITY RISK]` and record the specific concern. Accessibility risks are anticipated friction points and must be rated accordingly. Do not design accessibility compliance into the journey — flag the concern and note that it requires specialist assessment.

**Process map cross-references:**
As you design each stage, record which step(s) in the to-be process map it corresponds to. Capture this inline (e.g. `Process step: PM-03`). These cross-references are required in the assembled output and are easiest to record now, not reconstructed later.

**Stage model (adapt to fit):**

| Stage | User Question | Applicability note |
|-------|--------------|-------------------|
| Discover | "Does this product or service do what I need?" | Consumer-facing products and services where user adoption is voluntary. Omit for mandatory internal systems, regulated workflows, or any context where users do not choose whether to engage. |
| Start | "How do I begin?" | Universal — apply to all journeys. |
| Do | "How do I accomplish my goal?" | Universal. May span multiple sub-stages for complex tasks. |
| Confirm | "Did it work?" | Universal. |
| Return | "How do I check progress or come back to a task I left?" | Apply only when the journey is asynchronous or multi-session — i.e. the user must re-engage after an intervening period. Omit when the journey completes in a single session. |
| Recover | "Something went wrong — what now?" | Apply to all journeys where error, failure, or mistake is possible. Omit only with explicit justification. |
| Abandon | "I need to stop — what happens to what I've done?" | Apply when partial completion is possible and has a business consequence. |

This model is a starting point, not a mandatory schema. Add stages that the journey requires; remove or rename stages that do not fit. Every deviation from the model must be noted with a brief justification.

If the journey spans multiple channels (e.g. web, mobile, email notification, phone), add a **Channel** column to the stage table to record which channel the user is on at each stage. Channel transitions are a common friction source and must be annotated.

### Step 4 — Annotate the Seven Stage Fields

This applies to all primary journey stages. Secondary summary stages (defined in Step 1) are exempt — they require only the four summary fields defined there.

For each primary stage, populate all seven fields:

**Goal** — what the user wants to achieve at this stage, written as "I want to...".

**Touchpoints** — every interface element, system surface, or communication the user interacts with at this stage (e.g. "Submit button on checkout page", "confirmation email", "error modal"). Name touchpoints specifically — not "the form" but "the Order Submission form on the Checkout page."

**Action** — what the user will do. Be specific: "clicks 'Submit'", "enters email address", "waits for confirmation email."

**System response** — what the system does from the user's perspective in response to the action: what feedback is shown, what state change is visible. Include a **timing threshold**: the maximum elapsed time the business considers acceptable for the system to respond at this stage before the experience degrades (e.g. "confirmation displayed within 3 seconds; beyond this, user uncertainty increases"). Obtain timing thresholds from the constraint register or from the business stakeholder responsible for the journey — do not estimate without a source. If the threshold is unknown, log it as an assumption. If the response is invisible to the user (backend-only), state that explicitly and note whether any interim feedback is provided to the user.

**Anticipated friction** — potential pain points in the future design:
- Will the user understand what to do at this stage without help?
- Is the system response clear and timely?
- What happens if the user makes a mistake?
- Are there new steps that add friction compared to the current journey?
- For `[MANDATORY]` stages: does the mandatory constraint create friction that cannot be removed through design? If so, what mitigation exists?

Rate each anticipated friction point:
- **High** — likely to block task completion or cause abandonment, or exposes the business to material consequence (revenue loss, regulatory breach, reputational harm) if not addressed
- **Medium** — may cause confusion but has a workaround; business consequence is contained
- **Low** — minor friction most users will tolerate with no material business consequence

**Satisfaction indicator** — a provisional, internally-derived qualitative signal for the stage experience. This is not a validated user research score. It is an analytical flag to focus attention on stages most likely to require redesign or mitigation. Record as:

- **Positive** — the stage is expected to be smooth; no High friction points; addresses a confirmed existing pain point (`[IMPROVED]`)
- **Neutral** — the stage is workable; no High friction points; no improvement over current state
- **Negative** — the stage carries at least one High-severity anticipated friction point; warrants attention before the design is finalised
- **Blocked** — the stage carries two or more High-severity anticipated friction points or a single friction point assessed as likely to cause abandonment or regulatory exposure

If discovery was skipped, do not record `Positive` for any stage — no validated baseline exists to confirm an improvement. Record `Neutral` at best for stages with no anticipated friction, and note "no baseline — improvement assessment not applicable."

This indicator replaces a numerical score. The four-level scale makes the analytical intent explicit: it signals where design attention is needed, not where the user experience lands on an objective scale.

**Business-critical flag** — record `Critical` if failure or severe degradation of this stage would directly cause revenue loss, regulatory breach, or operational stoppage for the business. Record `Significant` if failure has meaningful downstream impact. Record `Supporting` for all other stages. A stage's business-critical rating must be consistent with the journey's overall criticality recorded in Step 1 — a journey rated `Supporting` overall should not contain stages rated `Critical` without explanation.

### Step 5 — Document the Journey Change Delta

Produce a delta summary for each journey. Source rows from stages labeled `[NEW]`, `[MODIFIED]`, or `[REMOVED]` in Step 3. Stages carrying the supplementary `[IMPROVED]` tag also get an IMPROVED row. `[UNCHANGED]` stages produce no delta entry unless they carry an upstream-improvement note (see Step 3), in which case that note is appended to the relevant IMPROVED entry.

| Change type | Stage | Description |
|------------|-------|-------------|
| NEW | (stage name) | What was added to the journey and why |
| MODIFIED | (stage name) | What changed in the user experience |
| REMOVED | (former stage) | What was removed and why |
| IMPROVED | (stage name) | Which existing friction point is resolved, and how — only for stages tagged `[IMPROVED]`; append upstream-benefit notes from `[UNCHANGED]` stages here |

This delta feeds into gap-analysis — every new or modified stage is a potential gap source.

### Step 6 — Stakeholder Validation

The to-be journey maps are a designed future state, not an observed one. Before assembling the final output, present the draft journey maps to the business stakeholders who own or are accountable for the affected journeys. Stakeholders are identified from the stakeholder map (Step 1 of the analysis-workflow).

**For each journey, confirm with the relevant stakeholder(s):**
- Is the persona description accurate for the role as it will exist after the change?
- Are the stages sequenced correctly from the user's perspective?
- Are the goals stated at each stage what the business intends?
- Are the timing thresholds in the system response fields consistent with business expectations?
- Are all mandatory stages correctly identified?
- Does the anticipated friction assessment align with the stakeholder's view of where users are most likely to struggle?
- Is the business-critical flag accurate for each stage?

Record the name and role of the stakeholder who validated each journey map, and the date of validation. If a stakeholder is unavailable within the time available, log this as an assumption and proceed — but note that the journey map for that persona is unvalidated and treat its friction ratings as provisional.

Incorporate any corrections before assembling. If corrections require redesigning a stage, return to Step 3 for the affected stage, re-run Steps 4–5, and re-present the corrected stage to the stakeholder before proceeding.

### Step 7 — Assemble

Populate the `user-journey-map` template (`../assets/user-journey-map.md`) for each persona/journey pair. If that template file does not exist, use the fields defined in the Completion Criteria as the document structure — one section per stage, each containing: goal, touchpoints, action, system response (with timing threshold), anticipated friction (rated), satisfaction indicator, and business-critical flag. Include:
- A Mermaid journey diagram for the to-be happy path
- Stage primary labels: `[NEW]`, `[MODIFIED]`, `[UNCHANGED]`; supplementary tag `[IMPROVED]` appended where applicable (e.g. `[MODIFIED][IMPROVED]`); `[MANDATORY]` and `[ACCESSIBILITY RISK]` tags where applicable
- The change delta table
- Process map references (recorded in Step 3) for each stage
- The stakeholder validation record (name, role, date) for each journey map

**Cross-persona consistency check:**
After assembling all journey maps for the change, compare hand-off points across personas. For every stage where Persona A produces an output that Persona B's journey depends on as an input, verify that the producing stage and consuming stage are consistent: same artifact, same format, compatible timing thresholds. Document any inconsistency as an anticipated friction point in the consuming stage (rated High if it blocks the downstream goal, Medium otherwise).

If resolving the inconsistency requires redesigning a stage, return to Step 3 for the affected journey, re-run Steps 4–6, and re-assemble before repeating the consistency check.

**Convergence rule:** the cross-persona consistency check may be repeated at most twice. If inconsistencies persist after two full check-and-revise cycles, do not loop further. Instead, document each unresolved inconsistency as an assumption in the assumption-log (with a named resolution owner and deadline) and as an anticipated friction point rated High. Flag the affected stages in the journey maps with `[UNRESOLVED: cross-persona inconsistency]`. Proceed to the hand-off gate. Risk-analysis will consume these as UX delivery risks.

## Output

One populated **user-journey-map** document per persona/journey combination (use the template at `../assets/user-journey-map.md`).

### File Output

Write each completed user journey map to `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md`, where `[journey-name]` is the kebab-case value assigned in Step 1.

Journey maps feed into:
- **gap-analysis** (step 8) — current vs future journey comparison identifies experience gaps
- **risk-analysis** (step 11) — anticipated friction points become UX risks; High-friction stages in Critical journeys are priority risks
- **requirements phase** — journey maps inform interaction specifications and acceptance criteria

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements describe business intent but the user experience is never analysed | To-be journey maps force the user's perspective as the primary analysis frame |
| New stages add friction that degrades the experience without anyone noticing | Step 4 explicitly rates anticipated friction for every stage |
| Gap-analysis has no future-state user experience to compare against | To-be journey maps provide the comparison target |
| Error and recovery paths missing from the future design | Step 3 requires an explicit assessment of whether a Recover stage is needed, and mandates one for every journey where an error, failure, or user mistake is possible |
| Future process maps exist but nobody checked what the user will actually experience | Journey mapping layers the experience perspective on top of the process |
| Analyst designs a journey in isolation with no business validation | Step 6 requires stakeholder review before assembly |
| High-friction stages in business-critical journeys treated with the same priority as low-impact ones | Business importance (Step 1) and business-critical flag (Step 4) provide the prioritisation signal |
| Mandatory regulatory or compliance stages removed or altered in pursuit of friction reduction | `[MANDATORY]` tag and mandatory-stage guidance in Step 3 flag these explicitly |
| Journey maps built on unconfirmed requirements with no indication of analytical risk | Degraded-input handling and `[ASSUMPTION]` stage labels make the risk visible |
| Cross-persona consistency check loops indefinitely | Convergence rule (Step 7) caps iterations at two and escalates residual inconsistencies to assumption-log and risk-analysis |

## Hand-off Gate

**Before reading `gap-analysis.md` (analysis-workflow step 8), you must:**
1. Confirm the to-be journey map content is complete for every persona/journey combination — all seven workflow steps done, all required fields populated, delta table present, stakeholder validation record present (or assumption logged if stakeholder was unavailable), cross-persona consistency check completed or residual inconsistencies logged.
2. **Write each journey map to `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md` at the root of the project repository**, where `[journey-name]` is the kebab-case value assigned in Step 1 (e.g. `buyer-submit-order`). If multiple journeys were mapped, write one file per journey. All file writes must succeed before proceeding.
3. Present all journey maps to the user.
4. Ask the user explicitly: **"Are these to-be user journey maps complete and accurate enough to proceed to gap-analysis?"** To support their review, confirm the following acceptance criteria are visible in the maps:
   - Every affected persona has at least one journey mapped
   - Every primary stage has all seven fields populated
   - Every journey has a stakeholder validation record or an assumption logged in its absence
   - Every journey has been assessed for Recover and abandonment scenarios
   - Business importance and business-critical flags are present
   - Timing thresholds are recorded or logged as assumptions
   - All mandatory and accessibility-risk stages are flagged
5. Do not proceed until the user has explicitly confirmed.

**If the user rejects or requests changes:**
- Identify which journey maps require revision and which specific steps (1–7) need to be re-run.
- Re-run only the affected steps; do not re-run the full workflow for journeys the user accepted.
- Overwrite the corresponding output files with the revised maps.
- Re-present the revised maps and repeat the confirmation question before proceeding.

---

## Completion Criteria

- [ ] All personas affected by the proposed change have been identified
- [ ] Each persona is defined at the role level of the business workflow being changed — not at demographic or skill-level granularity unless the business process materially diverges for those variants
- [ ] Each affected persona has at least one to-be journey mapped
- [ ] Business importance is recorded for each journey: frequency (sourced or logged as assumption), volume (sourced or logged as assumption), and business criticality tier (Critical / Significant / Supporting)
- [ ] Each journey is named using the `[persona]-[goal-verb]-[object]` convention and a corresponding output file exists at `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md`
- [ ] Each journey is staged from the user's perspective
- [ ] The stage model has been adapted to the deployment context — the Discover stage is omitted for mandatory internal or regulated workflows; the Return stage is omitted for single-session journeys
- [ ] Each primary journey stage has all seven fields: user goal, touchpoints, action, system response (with timing threshold or assumption logged), anticipated friction (rated), satisfaction indicator, and business-critical flag
- [ ] Stages derived from unconfirmed requirements are labeled `[ASSUMPTION: REQ-nnn]` and logged in the assumption-log
- [ ] If the journey spans multiple channels, each stage records its channel
- [ ] A to-be Mermaid journey diagram is present for each mapped journey
- [ ] Every stage carries a primary label (`[NEW]`, `[MODIFIED]`, or `[UNCHANGED]`); stages that also resolve existing friction carry the supplementary `[IMPROVED]` tag (e.g. `[MODIFIED][IMPROVED]`); mandatory stages carry `[MANDATORY: <reason>]`; accessibility risks carry `[ACCESSIBILITY RISK]`
- [ ] Every `[NEW]` and `[MODIFIED]` stage traces to a confirmed requirement (or is labeled `[ASSUMPTION]` if the requirement is unconfirmed)
- [ ] Every journey has been assessed for whether a Recover stage is needed; one is present or the omission is explicitly justified
- [ ] Every journey has been assessed for abandonment; abandonment handling is documented or explicitly confirmed as not applicable
- [ ] The change delta table is complete, including IMPROVED rows for all `[IMPROVED]` stages and upstream-benefit notes from `[UNCHANGED]` stages
- [ ] Each journey map references the to-be process map steps it corresponds to
- [ ] Cross-persona hand-off points have been checked for consistency across all mapped journeys; residual inconsistencies after two cycles are logged in the assumption-log and flagged `[UNRESOLVED]` in the maps
- [ ] Adjacent (secondary) journeys are mapped in summary: journey name listed, intersecting stages identified with stage name, primary label, one-sentence hand-off description, and connected primary journey stage; adjacency is defined by data or handoff dependency
- [ ] Each journey map carries a stakeholder validation record (name, role, date) or an assumption-log entry noting the stakeholder was unavailable
- [ ] If discovery was skipped, all current-state claims are logged as assumptions
- [ ] If discovery was skipped, the satisfaction indicator is not recorded as `Positive` for any stage, and improvement assessments are noted as "no baseline — improvement assessment not applicable"
