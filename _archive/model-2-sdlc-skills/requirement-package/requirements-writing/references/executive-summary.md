# Executive Summary & Business Context

## Purpose

Produce the executive summary and business context section of the requirements package — a concise, non-technical overview of the business need or capability gap driving this requirements effort, why it matters to the organisation, and the context surrounding it. The proposed initiative is described only to orient the reader to what response is under consideration — it is not the organising frame of the document. The business need is always articulated before the initiative — the two must never be conflated. If the analysis phase ran, consumes the change-scope (scope boundaries), risk-register (critical risks), stakeholder-map (key stakeholders and approval chain), constraint-register (regulatory and contractual pressures), dependency-map (critical external dependencies), and gap-register (outstanding readiness gaps) from the analysis folder to ground the summary in evidence. If analysis was skipped, the user provides the business context directly and the document includes a notice that content was elicited rather than evidence-derived. The executive summary is the first section any reader encounters in the requirements package — it must give a stakeholder, architect, or developer enough context to understand the business need and significance of the problem before reading detailed requirements. Produces an executive-summary.md document that becomes Section 1 of the requirements package.

## What This Produces

An executive summary document with five sections:

1. **Business need overview** — the business need or capability gap that makes this requirements effort necessary, who experiences it, and where it sits in the existing business or system landscape; the proposed initiative is stated only to orient the reader (3–5 sentences, non-technical; the need is stated before the initiative)
2. **Business context** — the business problem or opportunity driving the change, the expected directional outcome, initiative priority, cost of inaction, market or regulatory pressures, hard delivery deadlines, and strategic alignment (2–4 sentences per sub-topic)
3. **Scope summary** — what is in scope, what is out of scope, and what must not be touched (1–3 sentences per boundary area, summary-level, not exhaustive)
4. **Key risks** — all critical and high-severity risks that the reader must be aware of before reading the detailed requirements
5. **Critical dependencies** — all critical dependencies affecting delivery timing or feasibility that the reader must be aware of before reading the detailed requirements

## Did Analysis Run?

**Look for the following artifacts:**

- `docs/<feature>/requirements-package/analysis/change-scope.md` (from change-scoping)
- `docs/<feature>/requirements-package/analysis/risk-register.md` (from risk-analysis)
- `docs/<feature>/requirements-package/analysis/stakeholder-map.md` (from analysis stakeholder-mapping, if discovery was skipped)
- `docs/<feature>/requirements-package/analysis/constraint-register.md` (from constraint-extraction)
- `docs/<feature>/requirements-package/analysis/dependency-map.md` (from dependency-mapping)
- `docs/<feature>/requirements-package/analysis/gap-analysis.md` (from gap-analysis)

**Analysis ran** if `docs/<feature>/requirements-package/analysis/change-scope.md` and `docs/<feature>/requirements-package/analysis/risk-register.md` exist → follow the "If analysis ran" branch in Step 1. Read the constraint-register, dependency-map, and gap-analysis as well if they exist.

> **Note on `stakeholder-map.md`:** The analysis stakeholder-mapping step always runs (step 1 in the analysis workflow). `docs/<feature>/requirements-package/analysis/stakeholder-map.md` is always produced when analysis ran. Read it as part of analysis context alongside `docs/<feature>/requirements-package/analysis/change-scope.md` and `docs/<feature>/requirements-package/analysis/risk-register.md`.

**Analysis was skipped** if either `docs/<feature>/requirements-package/analysis/change-scope.md` or `docs/<feature>/requirements-package/analysis/risk-register.md` is missing → follow the "If analysis was skipped" branch in Step 1. The user provides all business context directly. The assembled document will include a notice that content was elicited rather than evidence-derived; any open items requiring validation are tracked in the assumptions-constraints-scope register of this requirements package.

## Inputs

| Input | Source | Required | If analysis was skipped |
|-------|--------|----------|------------------------|
| Business need and proposed initiative description | User or project brief | Yes | User provides directly (questions 2–3 in Step 1) |
| Primary audience for this package | `docs/<feature>/requirements-package/analysis/stakeholder-map.md` | Yes | User states directly (question 1 in Step 1) |
| Change-scope boundaries | `docs/<feature>/requirements-package/analysis/change-scope.md` | If available | User describes scope boundaries (question 9 in Step 1) |
| Risk register | `docs/<feature>/requirements-package/analysis/risk-register.md` | If available | User identifies key risks or section is marked "risks not formally assessed" |
| Stakeholder map | `docs/<feature>/requirements-package/analysis/stakeholder-map.md` (always present when analysis ran, regardless of whether discovery ran) | If available | User identifies key stakeholders |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available | Section is marked "constraints not formally assessed" |
| Dependency map | `docs/<feature>/requirements-package/analysis/dependency-map.md` | If available | Section is marked "dependencies not formally assessed" |
| Gap analysis | `docs/<feature>/requirements-package/analysis/gap-analysis.md` | If available | Section is marked "readiness gaps not formally assessed" |

## Workflow

> **Branch:** Step 1 operates differently depending on whether analysis ran.
> - **Analysis ran** → Step 1 reads analysis artifacts from the analysis folder.
> - **Analysis was skipped** → Step 1 asks the user structured questions.
>
> All other steps execute identically regardless of which path Step 1 took.

```
┌──────────────────────────────────────────────────────┐
│  1. GATHER — Collect context from all available      │
│     sources. If analysis ran, read analysis outputs.  │
│     If not, ask the user structured questions.       │
│     Determine the primary audience for this package. │
├──────────────────────────────────────────────────────┤
│  2. OVERVIEW — Write the business need overview      │
│     Business need first, then the initiative         │
│     Who it serves; where it fits in the system       │
│     No technical jargon; any stakeholder can read it │
├──────────────────────────────────────────────────────┤
│  3. CONTEXTUALISE — Write the business context       │
│     Need, expected outcome, priority, cost of        │
│     inaction, pressures, deadlines, alignment        │
├──────────────────────────────────────────────────────┤
│  4. SCOPE — Summarise scope boundaries               │
│     In-scope, out-of-scope, must-not-touch           │
│     Reference analysis artifacts if they exist       │
├──────────────────────────────────────────────────────┤
│  5. RISKS — Summarise key risks                      │
│     Critical and high risks only                     │
├──────────────────────────────────────────────────────┤
│  6. DEPENDENCIES — Summarise critical dependencies   │
│     Dependencies that affect delivery timing or      │
│     feasibility; unclosed readiness gaps             │
├──────────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate the executive-summary        │
│     template; add document metadata                  │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Gather Context

**If analysis ran:**
- Read `docs/<feature>/requirements-package/analysis/change-scope.md` for scope boundaries
- Read `docs/<feature>/requirements-package/analysis/risk-register.md` for critical and high-severity risks
- Read `docs/<feature>/requirements-package/analysis/stakeholder-map.md` for key stakeholders, the approval chain, and the primary audience for this requirements package (always present when analysis ran — read regardless of whether discovery ran)
- Read `docs/<feature>/requirements-package/analysis/constraint-register.md` for regulatory, contractual, and hard operational constraints (if it exists)
- Read `docs/<feature>/requirements-package/analysis/dependency-map.md` for critical external dependencies affecting delivery timing or feasibility (if it exists)
- Read `docs/<feature>/requirements-package/analysis/gap-analysis.md` for outstanding readiness gaps — unclosed gaps that could delay or constrain delivery (if it exists)

**Conflict resolution.** If two or more analysis artifacts make contradictory claims about the same item — for example, an item is out of scope in `docs/<feature>/requirements-package/analysis/change-scope.md` but appears as a critical risk in `docs/<feature>/requirements-package/analysis/risk-register.md`, or a gap in `docs/<feature>/requirements-package/analysis/gap-analysis.md` does not appear in `docs/<feature>/requirements-package/analysis/dependency-map.md` — do not silently resolve the contradiction. Document both representations, describe the conflict explicitly, and present it to the user before proceeding to Step 2. Do not guess which artifact is correct.

**Determine the primary audience.** Before writing a single word of the summary, identify who will read this document. If analysis ran, derive the primary audience from `docs/<feature>/requirements-package/analysis/stakeholder-map.md` (the stakeholder group with the highest influence over the initiative, or the group this package is being prepared for). If analysis was skipped, ask the user: "Who is the primary audience for this requirements package — business stakeholders, technical leads, or both?" Record the answer before proceeding to Step 2. Language calibration in Step 2 depends on this answer.

**If analysis was skipped:**
Before asking the user any questions, check whether the discovery phase ran: look for elicitation outputs (e.g., `docs/<feature>/requirements-package/discovery/requirements-elicitation.md`, `docs/<feature>/requirements-package/discovery/existing-artifact-review.md`). If discovery artifacts exist, read them first — they may already contain business need statements, stakeholder descriptions, or constraint information. Use them as context when asking questions below; do not ask the user to re-state content that is already documented.

Ask the user structured questions. Ask **one question at a time** and wait for the response before asking the next:

1. **Who is the primary audience for this requirements package?** (business stakeholders, technical leads, or both — this determines language calibration)
2. **What is the business problem or capability gap this initiative addresses?** (the need, not the solution)
3. **What initiative or change is being proposed in response to that need?** (describe in plain language)
4. **Who is it for?** (primary users or beneficiaries)
5. **What business outcome does the organisation need to achieve, independent of any specific solution?** (directional result the business needs to be true — e.g., "customer churn at onboarding is reduced", "the Q3 regulatory compliance deadline is met"; frame this as what the business needs, not as what the initiative delivers; measurable targets will be formalised in business-objectives)
6. **Why is it being built now?** (urgency drivers — regulatory deadlines, competitive moves, contractual obligations, strategic timing)
7. **What is the priority of this initiative?** (critical path / strategic / planned / exploratory — and whether it has a hard delivery deadline; if yes, what date)
8. **What happens if we don't address this need?** (cost of inaction)
9. **What is in scope and what is out of scope?**
10. **What are the biggest risks or unknowns?**
11. **How does this initiative support the organisation's broader goals?** (strategic alignment)

Write down each answer. These answers become the stated basis for the executive summary content. Do not tag them as assumptions inline in the document — any open items or unresolved questions are handled by the assumptions-constraints-scope skill in the requirements phase.

### Step 2 — Write the Business Need Overview

Write a concise description (3–5 sentences) in this order:
1. **The business need or capability gap** — what problem exists, or what opportunity is being missed, that makes this initiative necessary. State the need as a business condition, not as a description of a solution.
2. **The initiative** — what is being changed or introduced in response to that need, in plain language.
3. **Who** it serves — the primary user or beneficiary. If analysis ran, draw the primary persona from the stakeholder map.
4. **Where** it fits — which area, product, or business domain it sits within.

The need must be stated before the initiative. A summary that opens with what is being built and then explains why conflates problem and response — readers may accept the initiative without evaluating whether it addresses the right need.

Rules:
- Calibrate language to the primary audience identified in Step 1. If the primary audience is business stakeholders, avoid all technical terms. If the audience includes technical leads, one level of system terminology is acceptable — but explain any term a non-technical reader would not recognise.
- If the primary audience is both business stakeholders and technical leads, write the overview for a business stakeholder. Where a system-level reference is unavoidable, add a parenthetical clarification for technical readers (e.g., "the customer portal (the web application customers use to manage their accounts)"). Do not produce two versions of the document.
- No implementation detail — do not name components, frameworks, API endpoints, or architectural patterns.
- Do not describe any proposed design decision or technical approach, even if it appears in an analysis artifact. Extract only the problem-space content.

### Step 3 — Write the Business Context

Document (2–4 sentences per sub-topic):
- **Business problem or opportunity** — what pain or capability gap drives this initiative; describe the current state and what is unsatisfactory about it
- **Expected business outcome** — the directional result the organisation needs to be true, stated independently of any specific solution (e.g., "customer churn at the onboarding stage is reduced", "the Q3 regulatory compliance deadline is met"). Do not frame this as "what the initiative achieves" — frame it as "what the business needs." Do not include measurable targets here — those are formalised in the business-objectives skill (Step 3 of the requirements workflow). State explicitly if this is unknown or unspecified.
- **Initiative priority** — whether this is critical path, strategic, planned, or exploratory; whether there is a hard delivery deadline and what that date is. If no hard deadline exists, state that explicitly rather than leaving it blank.
- **Cost of inaction** — what happens if this need is not addressed (revenue loss, compliance breach, competitive disadvantage, user churn). If the cost of inaction is unquantified or speculative, say so — do not present an estimate as a fact. **Relationship to the risks section:** the cost of inaction is the consequence of not addressing the business need at all; it is not a delivery risk. Do not duplicate risk register entries here. If a risk entry describes the same consequence, reference the risks section rather than restating it.
- **Market or regulatory pressures** — any external forces creating urgency (regulatory deadlines, competitive moves, contractual obligations)
- **Strategic alignment** — how this initiative supports the organisation's broader goals; who must sign off on this initiative (the approval chain)

**Solution content prohibition.** Do not include proposed solution design, architectural choices, or technical approaches in any sub-topic of the business context. This section describes the problem environment and organisational context — it does not describe how the problem will be solved.

**If analysis ran:** draw market and competitive pressures from the risk register. For regulatory and contractual pressures: if `docs/<feature>/requirements-package/analysis/constraint-register.md` exists, draw from its regulatory/compliance and contractual constraint categories; if it has "Assessed — none found" entries for those categories, state that explicitly rather than treating them as unknown. If the constraint-register does not exist, draw any regulatory or contractual context from the risk register's relevant risk entries instead. Draw the approval chain (who must sign off on this initiative) from `docs/<feature>/requirements-package/analysis/stakeholder-map.md` and include it in the strategic alignment sub-topic.

**If analysis was skipped:** use user-provided context from questions 5–8 and 11 in Step 1 and present it as the stated business context. Where the user could not provide a cost of inaction or delivery deadline, record "not provided" rather than omitting the sub-topic.

### Step 4 — Summarise Scope Boundaries

**If analysis ran:**
- Summarise the change-scope: count of in-scope items, count of out-of-scope items, count of must-not-touch items
- Highlight the most notable exclusions and must-not-touch areas (1–3 sentences per boundary area)
- Reference the full change-scope document

**If analysis was skipped:**
- Document the user-stated scope boundaries
- Note that scope has not been formally analysed — this is the stated project scope

**Solution content prohibition.** Scope boundaries describe what the requirements effort covers — not what will be built. Do not include implementation decisions, technical components, or architectural choices as scope items. "Implementing a new API layer" is a solution statement; "the data integration between System A and System B" is a scope boundary.

### Step 5 — Summarise Key Risks

Risks and dependencies are distinct categories and must be presented separately. Risks are probabilistic — they may or may not materialise. Dependencies are structural — they either exist and are ready, or they do not.

**If analysis ran:**
- List all critical and high-severity risks from `docs/<feature>/requirements-package/analysis/risk-register.md` (ID, one-sentence description, impact). "Critical" and "high" refer to the severity tiers defined in the risk-analysis skill; if the severity tiers are not labelled in the artifact, apply this baseline: critical = could prevent delivery or cause a regulatory breach; high = significant impact on scope, timeline, or user outcomes.
- Reference the full risk register for the complete picture

**If analysis was skipped:**
- Document all user-identified risks
- State: "Risks have not been formally assessed. The risks listed were identified during requirements elicitation."

**Solution content prohibition.** Do not include proposed risk mitigations, design decisions, or technical approaches in this section. List risks as conditions that may materialise — not as problems the initiative will solve.

### Step 6 — Summarise Critical Dependencies and Readiness Gaps

**If analysis ran:**
- If `docs/<feature>/requirements-package/analysis/dependency-map.md` exists, list all critical dependencies that affect delivery timing or feasibility (ID, one-sentence description)
- If `docs/<feature>/requirements-package/analysis/gap-analysis.md` exists, include any unclosed Hard-blocker or "Threatens business outcome" gaps that are not already captured as risk entries — these are outstanding readiness gaps that a first-time reader must be aware of before reading the detailed requirements (GAP ID and a one-sentence description of what is not yet ready)
- Reference the full dependency map and gap register for the complete picture
- If neither file exists, include a labelled placeholder in the Critical Dependencies section of the assembled document: "Dependency mapping was not completed for this initiative. Critical dependencies and readiness gaps have not been formally assessed."

**If analysis was skipped:**
- If the user identified any critical dependencies, list them and state: "Dependencies have not been formally mapped. The dependencies listed were identified during requirements elicitation."
- If the user identified no dependencies, state: "No dependencies were identified during elicitation. Dependencies have not been formally mapped."

**Solution content prohibition.** Do not include proposed integration approaches, technical architecture, or delivery plans in this section. List dependencies as external conditions required for delivery — not as things the initiative will implement.

### Step 7 — Assemble

Populate the `executive-summary` template. Do not drop items silently — a document that omits a critical risk or dependency is more dangerous than a longer one. If a section references a full analysis artifact for exhaustive detail, state that explicitly rather than silently truncating.

**Document metadata.** Before saving, add the following to the document header:
- Document version (start at v0.1 for first draft; increment the minor version — v0.1 → v0.2 → v0.3 — for each revision cycle completed through the hand-off gate)
- Date of this draft
- Author (the person or role that produced this document)
- Review status (Draft / Under Review / Approved)
- Changelog (if revisions have been made: a brief entry per version noting what changed and why)

This metadata must be present. An undated, unversioned executive summary that is updated after stakeholder review provides no signal to readers about which version they are reading. The review status field must be updated to "Approved" explicitly, only after the hand-off gate is completed and all corrections applied — it must not be left as "Draft" after approval or assumed to be approved without the field being updated.

**If analysis was skipped:** no notice banner is required. The content of the executive summary reflects the BSA's confirmed position on the business need, context, scope, and risks. Any items that require further verification (e.g., system-behavior claims) are tracked in the assumptions-constraints-scope register.

## Output

A populated **`executive-summary.md`** document saved to the requirements package folder (use the template at `../assets/executive-summary.md`).

### File Output

Write the completed executive summary to `docs/<feature>/requirements-package/requirements/executive-summary.md`.

> **Note on the template:** Before assembling, verify that the template at `../assets/executive-summary.md` contains sections matching the five sections defined in "What This Produces" above. If the template diverges from this skill's structure, the template takes precedence for formatting only — all content requirements in this skill apply regardless of template layout. If the template is missing a required section, or contains sections not defined in this skill: pause, describe the divergence to the user, and obtain explicit direction before proceeding. Do not silently omit a required section or silently populate an unknown section.

This is Section 1 of the requirements package. It is the first thing any reader sees — it frames all subsequent requirements content.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Stakeholders and developers read the initiative description as the business need — the problem and the solution are conflated | The business need overview requires the business need to be stated before the initiative; Step 2 rules prohibit opening with "what is being built" |
| Requirements are written without clear business justification | The business context section forces articulation of why this matters before requirements are specified |
| Scope boundaries are buried in analysis artifacts and not visible to requirements readers | The scope summary surfaces boundaries at the front of the requirements package |
| Critical risks are documented in analysis but not carried forward to the requirements package | The key risks section ensures high-impact risks are visible to every reader |
| Regulatory and contractual constraints are invisible to requirements readers | Step 3 draws from the constraint-register's regulatory and contractual categories when analysis ran |
| The constraint-register and dependency-map exist but are silently ignored | Both are listed as inputs; Step 1 explicitly reads them if they exist; Steps 3 and 6 conditionally reference them |
| Unclosed readiness gaps in the gap-register are not surfaced to requirements readers | The gap-register is listed as an input; Step 1 reads it if it exists; Step 6 surfaces unclosed Hard-blocker and business-outcome-threatening gaps alongside dependency entries |
| Risks and dependencies are presented together and readers underweight one or the other | Step 5 (risks) and Step 6 (dependencies) are separate steps producing separate sections |
| Initiative priority and hard deadlines are unknown to architects and developers reading detailed requirements | Business context section explicitly requires initiative priority and delivery deadline, with "not provided" if absent |
| The assembled document has no version or date — readers cannot determine which version they are reading | Step 7 requires document metadata before saving |
| Contradictions between analysis artifacts are silently resolved, embedding an undetected error in the requirements package | Step 1 requires contradictions to be surfaced to the user and a resolution obtained before proceeding |
| Discovery artifacts are ignored when analysis was skipped, forcing the user to re-state context that is already documented | Step 1 (analysis-skipped path) checks the discovery folder first and uses existing artifacts as context before asking questions |
| Solution design content — architectural choices, technical components, integration approaches — infiltrates requirements sections | Steps 2, 3, 4, 5, and 6 each carry an explicit solution-content prohibition |

## Risks This Skill Can Introduce

| Risk introduced | Mitigation |
|---|---|
| Inaccurate business context is presented as stated requirements when analysis was skipped | The hand-off gate requires the user to confirm each section is accurately stated before proceeding |
| Language level mismatches the actual audience | Step 1 requires the primary audience to be determined before writing; Step 2 applies language calibration rules against that decision |
| Cost of inaction is speculative or inflated and is presented as fact | Step 3 explicitly requires unquantified or speculative cost-of-inaction claims to be labelled as such |
| Stale analysis artifacts are consumed without the reader knowing they may be outdated | Analysis artifacts do not carry a freshness guarantee — if artifacts are known to be stale relative to the current change, flag this in the document; otherwise state when the analysis was last run if that information is available |
| The proposer of the initiative provides business context that rationalises the solution rather than describing the underlying need | Step 2 requires the need to be stated independently before the initiative; the hand-off gate asks specifically whether need and initiative are distinct |
| The initiative is presented as higher or lower in scope than the analysis artifacts support | The scope summary draws from change-scope.md when available; any summary-level scope claim that cannot be traced to a scope artifact must be flagged as user-stated |
| Business context contains commercially sensitive, legally privileged, or regulatory-sensitive information distributed without access restriction | Before assembling, consider whether any sub-topic (particularly cost of inaction and regulatory pressures) contains information that warrants a document classification header. Flag to the user if the content is potentially sensitive — do not make this determination unilaterally |
| A v0.1 draft is treated by readers as the approved baseline because the review status field is never updated | The review status field must be updated to "Approved" explicitly and only after the hand-off gate is completed and all corrections applied; the version changelog records what was changed between review cycles |

## Hand-off Gate

Before proceeding to the next requirements skill, you must:
1. Write the completed executive summary in full — business need overview, business context, scope summary, key risks, and critical dependencies.
2. Present it to the user for review with the following specific questions:
   - Does the business need overview state the business need clearly and independently, before describing the initiative? Is there any point where the need and the initiative are conflated?
   - Does the business context reflect the actual business driver — not overstated, not understated? Where the cost of inaction is unquantified, is it labelled as such? Does any sub-topic contain proposed solution content that should not be here?
   - Are the scope boundaries complete? Is anything missing from the out-of-scope or must-not-touch lists?
   - Are the listed risks the ones that matter most to a first-time reader? Are the listed dependencies and readiness gaps complete?
   - Is the initiative priority and delivery deadline accurately stated — or explicitly noted as unknown?
3. Receive a **substantive** answer to each question before proceeding. "Yes" or "looks good" is not a substantive answer. A substantive answer either (a) confirms a specific named claim — e.g., "The cost of inaction stated as regulatory breach is accurate" — or (b) identifies a specific correction — e.g., "The delivery deadline is Q2 2026, not Q3." A general expression of satisfaction does not constitute confirmation.
4. **Note on analysis-skipped path.** When analysis was skipped, the uncertainty level of every claim is higher. Apply the review questions with additional scrutiny. Any sub-topic marked "not provided" must be flagged explicitly to the user as a gap that may affect requirements completeness downstream.
5. If the user identifies any corrections, return to the relevant step (Step 2 for business need overview, Step 3 for business context, Step 4 for scope, Step 5 for risks, Step 6 for dependencies), revise the affected section, increment the document version, add a changelog entry, and re-present the full document before proceeding.
6. If the primary stakeholders who **experience** the business problem (not the project team proposing the initiative) have not reviewed the business need statement, record this as an open item. Business need statements validated only by the proposing team carry a higher risk of encoding the solution as the need.

---

## Completion Criteria

- [ ] Primary audience has been identified and recorded; business need overview and business context language is calibrated to that audience; if the audience is "both," the overview is written for business stakeholders with parenthetical clarifications for technical readers
- [ ] Business need overview states the business need before describing the initiative — need and initiative are not conflated
- [ ] Business need overview is written in non-technical language, 3–5 sentences, covering the business need, the initiative (as orientation only), who it serves, and where it fits
- [ ] Business context documents the business problem, expected directional outcome (framed as what the business needs, not what the initiative achieves), initiative priority, cost of inaction (labelled as speculative if unquantified, not duplicating risk entries), external pressures, and strategic alignment
- [ ] Business context includes the delivery deadline or explicitly states no hard deadline was identified
- [ ] Business context includes the approval chain (drawn from stakeholder map if analysis ran, or user-stated if analysis was skipped)
- [ ] No section contains proposed solution design, architectural choices, or technical approaches
- [ ] Scope summary includes in-scope, out-of-scope, and must-not-touch boundaries
- [ ] Key risks section lists all critical and high-severity risks (or explicitly states risks were not formally assessed); severity tiers are applied as defined in the risk-analysis skill or the baseline thresholds in Step 5
- [ ] Critical dependencies section lists all critical dependencies and unclosed Hard-blocker or business-outcome-threatening gaps (or contains the prescribed placeholder stating dependencies were not formally assessed)
- [ ] If analysis ran, all sections reference the relevant analysis artifacts; `docs/<feature>/requirements-package/analysis/constraint-register.md`, `docs/<feature>/requirements-package/analysis/dependency-map.md`, and `docs/<feature>/requirements-package/analysis/gap-analysis.md` are consumed if they exist; any contradictions between artifacts were flagged to the user and a resolution was obtained
- [ ] If analysis was skipped, discovery artifacts were checked and consumed if available; the prescribed notice appears at the top of the document before the business need overview
- [ ] Document metadata is present: version, date, author, review status, and changelog (if revisions were made)
- [ ] Whether the business need statement has been validated by the problem-experiencing stakeholders (not only the proposing team) is recorded; if not, this is tracked as an open item
- [ ] Sensitive or confidential content has been identified; a document classification header is added if required
- [ ] The hand-off gate review questions have been answered substantively — with specific confirmations or named corrections — and all corrections applied before proceeding
