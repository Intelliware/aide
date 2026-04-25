# Current Capability Synthesiser

## Purpose

Sixth and final step in the discovery-workflow sequence. Synthesises all prior discovery outputs — capability inventory, documentation currency assessment, process maps, user journey maps, and elicitation outputs — into a single coherent current-capability-baseline document. Reconciles conflicts between discovery sources, assesses confidence levels for every behavioral claim, consolidates constraints, catalogues known issues and fragility in the change area, scopes which parts of the system the proposed change touches, and logs open questions. Produces the document that feeds the entire analysis phase and forms the existing-system section of the requirements package handed to the architect.

## When to Use

- Sixth and final step in the discovery-workflow sequence — the synthesis step after all other discovery skills have completed
- All four prior discovery outputs exist: capability inventory, documentation currency assessment, process maps, and user journey maps
- Requirements elicitation has completed and confirmed/corrected the major code-derived assumptions
- The analysis phase (change-scoping, dependency-mapping, impact-analysis, constraint-extraction) is about to begin

**If not all prior outputs are available:** Do not skip this step — proceed with what exists. For each missing input, record it explicitly as a gap in the baseline, state what is unknown as a result, and log it as an open question in Step 7. A baseline that is honest about its gaps is more useful than no baseline at all. If a gap is large enough to materially undermine the analysis phase, flag it to the user and agree whether to fill it before proceeding or carry it as a tracked risk.

## What This Produces

A single, coherent **current-capability-baseline** document — not a collection of links to the five prior discovery artifacts. Downstream roles (analyst continuing to the analysis phase, architect receiving the requirements package) should be able to work from the baseline alone without reading each individual discovery document.

## What This Is Not

- Not a requirements document — the baseline describes current state; requirements describe desired future state
- Not a design document — the baseline informs design but does not constrain it beyond what the existing system already constrains
- Not a simple summary — it synthesises, reconciles conflicts between discovery outputs, and adds cross-cutting analysis that no single discovery skill captures (known issues, fragility, confidence levels)

## Inputs

| Input | Source | Required | If unavailable |
|-------|--------|----------|----------------|
| Current capability inventory | codebase-discovery output | Yes | Log the missing coverage as a gap; note which capability areas are uncharted |
| Documentation currency assessment | existing-artifact-review output | Yes | Assume all documentation is of unknown currency; flag every doc-derived claim as Inferred rather than Doc-verified |
| Process maps | process-mapping output | Yes | Reconstruct process context from elicitation notes where possible; log gaps as open questions |
| User journey maps | user-journey-mapping output | Yes | Use elicitation outputs to approximate journey context; note the absence explicitly |
| Confirmed requirements and validated assumptions | requirements-elicitation output | Yes | Treat all code-derived assumptions as Inferred (not Confirmed); flag for validation before the analysis phase begins |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. RECONCILE — Resolve conflicts between        │
│     discovery outputs before synthesising        │
│     ↓ irresolvable conflicts → Step 7            │
├──────────────────────────────────────────────────┤
│  2. SYNTHESISE — Assemble the system picture     │
│     What it does, how it does it, who uses it,  │
│     what workflows it supports                   │
├──────────────────────────────────────────────────┤
│  3. ASSESS CONFIDENCE — Documented vs. inferred  │
│     Flag what is code-inferred vs. stakeholder-  │
│     confirmed. Confidence affects downstream risk│
├──────────────────────────────────────────────────┤
│  4. EXTRACT CONSTRAINTS — From across discovery  │
│     Consolidate all constraints into one place   │
├──────────────────────────────────────────────────┤
│  5. SCOPE CHANGE AREA — Identify the zone        │
│     Which parts of the baseline the new feature  │
│     will interact with (needed before Step 6)    │
├──────────────────────────────────────────────────┤
│  6. CATALOGUE KNOWN ISSUES — Fragility audit     │
│     Bugs, hotspots, tech debt, low coverage —    │
│     each rated for relevance to the change area  │
├──────────────────────────────────────────────────┤
│  7. LOG OPEN QUESTIONS — What remains unknown    │
│     Deferred elicitation items and unresolvable  │
│     gaps that downstream phases must track       │
├──────────────────────────────────────────────────┤
│  8. ASSEMBLE — Populate the baseline template    │
│     One coherent document, not a collection      │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Reconcile Conflicts

Before synthesising, check for conflicts between the four discovery outputs. Conflicts that are not resolved here will cause inconsistency in the baseline.

**Common conflict types:**

| Conflict | Example | Resolution |
|----------|---------|-----------|
| Document contradicts the capability inventory | Integration spec says a field is required; the system makes it optional | The capability inventory (what the system actually does) wins — note the stale documentation |
| Process map contradicts journey map | Process shows step X before Y; journey map shows Y before X | Determine whether they describe the same path or different paths (happy path vs. exception path, for example). If the same path, the process map is the authoritative source for how the system works; the journey map describes how the user experiences it. If genuinely contradictory, escalate to stakeholder confirmation |
| AI-inferred assumption contradicted by elicitation | Capability inventory suggested admin-only; stakeholder confirmed all users can access | Elicitation wins — update the capability inventory |
| Multiple process maps describe the same workflow differently | Two sources describe order approval differently | Determine which artifact is more recent; treat the other as stale and flag it in the documentation currency assessment |
| Two stakeholders give contradictory accounts | Stakeholder A says the system sends an email confirmation; Stakeholder B says it does not | Return to the capability inventory as the arbiter — what does the system actually do? If the capability inventory is itself uncertain on this point, treat the conflict as an open question (Step 7) and do not assert either account in the baseline |

For each conflict resolved, record: what conflicted, which source was treated as authoritative, and why.

**When a conflict cannot be resolved:** Do not assert either position in the baseline. Record the conflict as an open question in Step 7, state what assumption is being held in the interim (if any), and identify which downstream artifact or decision is blocked until it is resolved. A known unresolved conflict is less harmful than a false resolution.

### Step 2 — Synthesise the System Picture

Assemble a coherent narrative of the existing system from the reconciled discovery outputs.

**System overview:**
- System name, purpose, and primary users (from capability inventory and journey maps)
- Any operational or environmental context captured during codebase-discovery that bears directly on the proposed change — described in plain terms relevant to the BA/PO (e.g., "the system runs across multiple regions, which means timing and data availability may vary")
- Key feature areas and what they do (summary of capability inventory — not the full inventory, a curated plain-English summary)

**Workflows:**
- The key as-is processes, summarised (not repeated verbatim — reference the detailed process maps)
- Which processes are directly in the change area

**User experience:**
- The primary user journeys, summarised (reference the detailed journey maps)
- Which journey stages the change affects

**Integration landscape:**
- External systems and services the system depends on — described by what they do for the business, not technical protocol details (e.g., "the system sends payments to [Payment Provider]" not "REST call to payment gateway API")
- Automated background work the system performs — what it does, when it does it, and who is affected
- What the system exposes to other systems or organisations that depend on it

**Data landscape:**
- Key information the system manages — what it is, how it relates to other information, what the business significance is
- Volume and format characteristics relevant to the proposed change (e.g., "the order history is large enough that queries against it must be designed carefully")

### Step 3 — Assess Confidence Levels

Not all information in the baseline has equal confidence. Flag confidence explicitly so downstream roles understand where the baseline is solid and where it is an informed estimate.

| Confidence Level | Meaning |
|-----------------|---------|
| **Confirmed** | Stakeholder-validated in requirements-elicitation — this is how it works and what we want |
| **Code-verified** | Derived from code with specific evidence — this is what the code does, but not yet stakeholder-confirmed |
| **Doc-verified** | Documented in a current artifact assessed as current — treat as reliable. Note: for compliance, legal, or contractual requirements, a Doc-verified claim from an authoritative document may outrank what the code implements; in those cases the code is the thing that may be wrong |
| **Inferred** | Reasonable inference from code patterns but no direct evidence — treat with caution |
| **Assumed** | No code or doc evidence — explicit assumption that must be validated before the feature is built |

For every behavioral claim in the baseline, tag it with a confidence level and cite the evidence.

**Composite claims:** When a single behavioral claim has parts at different confidence levels, tag the claim at the lowest confidence level of any of its parts and note which part is the weaker link.

**Threshold for proceeding:** If a significant proportion of claims in the change area are tagged Inferred or Assumed — particularly claims about the behavior the new feature will build on — flag this to the stakeholder before the analysis phase begins. The analysis phase should not proceed against a foundation that is mostly unvalidated assumption. There is no fixed percentage; use judgment and be explicit about the risk if you proceed anyway.

**Assumed items:** An Assumed claim does not self-validate. For each Assumed claim, identify the earliest downstream step at which it must be confirmed (e.g., "must be confirmed before dependency-mapping can proceed") so it does not silently carry forward.

### Step 4 — Extract Consolidated Constraints

The baseline is the single place where all constraints on the proposed change are assembled. Draw from all discovery sources:

**Constraint sources:**
- Technology and platform constraints — what the system is built on and what that rules in or out for the proposed change (described in business impact terms, not technical terms)
- Performance and scale constraints — existing speed, volume, or availability commitments that the new feature must respect
- Data constraints — how information must be stored, formatted, or retained
- Compatibility constraints — existing integrations or connected systems that must continue to work
- Regulatory and compliance constraints — legal, security, or policy obligations that govern the change area
- Settled design decisions — decisions already made and documented that must not be reopened without explicit justification

For each constraint: what it is, where it comes from, what it rules out for the proposed change, and — where applicable — what approaches it enables or simplifies (e.g., "already using the existing data store means no new data store dependency is introduced"). Constraints are not purely restrictive; recording the enabling side prevents the team from re-evaluating options that the existing system already settles.

### Step 5 — Scope the Change Area

Define explicitly which parts of the existing system the proposed change will interact with. This step must be completed before Step 6 so that known issues can be accurately classified by relevance. This is a preliminary scoping — formal change-scoping is the next phase — but the baseline must identify the affected zone clearly enough to judge whether any given issue is in scope.

**The preliminary change area captures:**
- Capability areas directly affected (from capability inventory)
- Process steps that will be added, modified, or removed (from process maps)
- Journey stages that will be extended or modified (from journey maps)
- Data entities the change will read, write, or create
- Integration points the change will use or affect

The formal change-scoping phase will refine and validate this preliminary scope. If the scope turns out to be substantially different after formal change-scoping, revisit the relevance classifications in Step 6.

### Step 6 — Catalogue Known Issues and Fragility

This is the baseline's most critical contribution to downstream risk management. Every known issue relevant to the proposed change is a project risk. Relevance is judged against the change area identified in Step 5.

**Completeness caveat:** This catalogue is evidence-driven, not exhaustive. It captures what is visible in the codebase, documentation, and discovery outputs. Issues that were not documented, not surfaced in elicitation, and leave no code evidence will not appear here. Downstream phases should treat the catalogue as a best-effort assessment, not a guarantee.

**What the AI looks for (internal — translated into plain-language findings for the BA/PO):**

| Issue Type | What the AI Looks For Internally | How It Is Described to the BA/PO |
|-----------|----------------------------------|----------------------------------|
| Known bugs or workarounds | Acknowledged issues in code comments, disabled tests, bug tickets referenced in the codebase | "There is a known issue in [capability area] where [plain description of what goes wrong]. This has not yet been fixed." |
| Performance or capacity risks | Patterns suggesting large data volumes, slow external calls, or absence of efficiency safeguards in the change area | "The [capability] currently works with large volumes of [information type] — any new queries against it will need to be designed carefully to avoid slowness." |
| Unreliable or intermittent behaviour | Retry logic and failure guards that suggest an external system or process fails regularly | "The system already has built-in retry logic for [integration/process], suggesting it fails periodically. The new feature should account for this." |
| Areas with no behavioural verification | Feature areas the change will touch that have no automated test coverage documenting expected behaviour | "There are no documented behavioural tests for [area]. This means there is no recorded baseline for what the system currently does there — changes carry higher risk." |
| Acknowledged technical debt | Debt or improvement items recorded in decision documents, issue trackers, or notes that sit in the change area | "There is acknowledged debt in [area]: [plain description]. This may need to be addressed before or alongside the proposed change." |

**For each known issue, record — in plain business language:**
- A plain-English description of the issue and what it means for users or the business
- Which capability area of the system it affects
- Relevance to the proposed change: **directly in the change area** / **shares information or processes** / **unrelated**
- Severity: **critical** (blocks the change or poses a material project risk) / **significant** (requires a plan before implementation) / **minor** (low impact, no immediate action needed)
- Implication: **must be addressed as a prerequisite** / **must be worked around** / **can be ignored for this change**

### Step 7 — Log Open Questions

Document what discovery could not resolve. Open questions that are not logged here will surface as surprises during analysis or implementation.

**Sources of open questions:**
- Irresolvable conflicts from Step 1 — where no authoritative source could adjudicate
- Deferred items from requirements-elicitation ("I'll decide later")
- Gaps that could not be filled from code, docs, or stakeholder interviews
- Assumptions that were not confirmed in elicitation and remain unvalidated

**For each open question, record:**
- What is unknown
- What interim assumption is being held (or state explicitly that no safe assumption exists)
- Which specific downstream artifact or phase is blocked or degraded if this is not resolved — be concrete (e.g., "dependency-mapping cannot confirm whether service X must be notified" rather than "affects downstream decisions")
- Whether it is **blocking** (the analysis phase cannot proceed past a specific point without resolution) or **non-blocking** (the analysis phase can proceed but must carry the uncertainty)

**If a question is blocking:** Do not proceed past the blocked step. Surface it to the stakeholder, agree on a resolution path, and record the outcome before continuing. An open question that is silently carried past the point where it was blocking is a deferred defect.

### Step 8 — Assemble the Baseline Document

Populate the `current-capability-baseline` template (at `../assets/current-capability-baseline.md`). Write it as a coherent document — prose summaries with tables for structured data — not as a list of links to discovery artifacts.

**The completed baseline must contain the following sections, in this order:**

1. **System overview** — name, purpose, primary users, and key capability areas — written in plain language
2. **Workflow summary** — key as-is processes, with cross-references to detailed process maps
3. **User experience summary** — primary journey stages, with cross-references to detailed journey maps
4. **Integration landscape** — external systems and services the system depends on, described by what they do for the business (not technical protocol details)
5. **Data landscape** — key information the system manages, how it relates, and any volume or format characteristics relevant to the proposed change
6. **Consolidated constraints** — all constraints from all discovery sources, written in plain language, with enabling implications noted alongside restrictive ones
7. **Preliminary change area** — capabilities, processes, journeys, information, and integrations the proposed change touches — stated in business terms
8. **Known issues and fragility** — full catalogue with severity, relevance, and implication for each item — written in plain language for the BA/PO
9. **Conflict resolution log** — each conflict identified in Step 1, its resolution, and the source treated as authoritative
10. **Open questions** — each unresolved item with its blocking status, interim assumption, and the specific downstream step affected

**Quality bar for the baseline:**
- A BA/PO who has not seen the individual discovery artifacts should be able to understand the existing system from this document alone
- An analyst starting change-scoping should be able to identify the preliminary change area from this document alone
- Every claim about system behaviour has a confidence level (Confirmed / Code-verified / Doc-verified / Inferred / Assumed) and a plain-English basis
- Known issues in the change area are called out with severity and clear implications in business terms
- No section is empty or placeholder — if a section has no content, state explicitly why (e.g., "no external integrations identified") rather than leaving it blank
- No technical jargon appears without a plain-English explanation of what it means for the BA/PO

## Output

A populated **current-capability-baseline** document (use the template at `../assets/current-capability-baseline.md`).

**Write the completed baseline to a file before presenting it.** Save it to `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`. Do not present the baseline to the user until after the file has been written — the file is the canonical output; the chat presentation is a preview of it.

### File Output

Write the completed current capability baseline to `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`.

This is the single document that feeds the entire analysis phase:
- **Change-scoping** — uses the change area section to define scope
- **Dependency-mapping** — uses the integration landscape and data entities
- **Impact-analysis** — uses the capability inventory and process maps
- **Constraint-extraction** — uses the consolidated constraints section
- **Risk-analysis** — uses the known issues and fragility catalogue

It also forms the existing-system section of the requirements package handed to the architect.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Downstream roles receive five separate discovery artifacts and assemble context themselves — inconsistently | One coherent baseline document replaces the collection |
| The team builds a new feature on top of a fragile foundation without knowing it | Step 6 explicitly catalogues fragility in the change area with severity and implications |
| Design decisions made against the wrong confidence level of information | Step 3 tags every claim with its evidence confidence |
| Constraints from different discovery sources are applied inconsistently | Step 4 consolidates all constraints into one place |
| Open questions become surprises during implementation | Step 7 makes open questions explicit, identifies blocking vs. non-blocking status, and names the specific downstream step affected |

## Failure Modes This Skill Can Introduce

| Failure mode | How to guard against it |
|---|---|
| Baseline over-confidence: the document looks authoritative but contains significant Inferred or Assumed claims that are not noticed by downstream roles | Step 3 requires explicit confidence tagging on every behavioral claim; Step 8 requires no section to be left as empty placeholder; the Hand-off Gate requires the Completion Criteria to be reviewed before proceeding |
| Baseline staleness: the document is written and treated as canonical, but new information emerges during the analysis phase | Treat the baseline as a living document during Phase 2. If the analysis phase reveals that a baseline claim is materially wrong, update the baseline and note the revision rather than silently proceeding on stale information |
| False completeness: open questions are logged as "handled" even though no resolution path exists | Step 7 requires every open question to be explicitly classified as blocking or non-blocking. A blocking question that has no resolution path must be surfaced to the stakeholder before proceeding — it cannot simply be logged and forgotten |

## Hand-off Gate

**Discovery is not complete until this step is done. Before proceeding to Phase 2 (Analysis — starting with `change-scoping.md`):**
1. Write the completed `current-capability-baseline` document in full, covering all ten required sections from Step 8 — in plain language throughout.
2. **Save it to `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`**. This file write must succeed before proceeding.
3. Present it to the BA/PO, noting that it has been saved and where.
4. Ask the BA/PO to confirm the Completion Criteria below are satisfied before acknowledging that the analysis phase can begin.

This is the terminal gate for Phase 1. The analysis phase does not start from elicitation answers — it starts from the baseline this step produces. Do not proceed to Phase 2 until this is done.

---

## Completion Criteria

- [ ] Conflicts between discovery outputs have been identified; each is either resolved (with the authoritative source recorded) or logged as an open question in Step 7
- [ ] The baseline covers all ten required sections from Step 8: system overview, workflow summary, user experience summary, integration landscape, data landscape, consolidated constraints, preliminary change area, known issues and fragility, conflict resolution log, and open questions
- [ ] Every behavioural claim has a confidence level (Confirmed / Code-verified / Doc-verified / Inferred / Assumed) and a plain-English basis for that confidence
- [ ] All constraints from all discovery sources are consolidated; enabling implications are noted alongside restrictive ones
- [ ] The preliminary change area is explicitly scoped — which capabilities, processes, journeys, information, and integrations the proposed change touches — in plain business terms
- [ ] Known issues in the change area are catalogued with severity (critical / significant / minor), relevance, and implication (must be addressed as prerequisite / must be worked around / can be ignored) — all described in plain language
- [ ] Open questions are logged with blocking status, interim assumption (or an explicit statement that no safe assumption exists), and the specific downstream step each one affects
- [ ] No section is left empty or as a placeholder — absent content is explained explicitly
- [ ] The baseline reads as a single coherent plain-English document for the BA/PO — not a set of discovery artifact summaries, not a technical report
- [ ] **`docs/<feature>/requirements-package/discovery/current-capability-baseline.md` has been written before the BA/PO is asked to acknowledge**
