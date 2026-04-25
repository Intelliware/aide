# Risk Analysis

## Purpose

Identify and assess requirements-level risks that could cause the feature to fail, be delayed, or deliver less value than expected. This skill covers the broader risk landscape. Risk categories include: requirements ambiguity risks (requirements that could be interpreted multiple ways, leading to wrong implementation), dependency risks (third- party services, team availability, or data sources the feature depends on that may not be ready), unconfirmed feasibility risks (requirements whose feasibility within the existing system's constraints has not been confirmed by architecture — they may prove impossible or disproportionately expensive, but that determination belongs to design, not requirements), regulatory and compliance risks (requirements that trigger regulatory review, data privacy impact assessments, or accessibility audits), stakeholder alignment risks (conflicting priorities between stakeholders that are papered over rather than resolved), and brownfield-specific risks — existing system instability in the change area (known bugs, performance hotspots, flaky behavior), undocumented behavior that requirements were written against (the code does X but nobody knows if X is intentional or a bug), tribal knowledge dependencies (critical context held by individuals rather than documented), and stale or contradictory documentation that downstream roles may rely on. Each risk specifies: the risk description, the affected requirements, the gross likelihood and impact scores (with evidence), the risk owner, the response strategy (avoid, transfer, mitigate, or accept), the contingency plan if the response is insufficient, and the residual risk score after the response is applied. Consumes: the change-scope boundaries, dependency map, constraint register, gap register, impact analysis, and assumption log (unvalidated assumptions are risks). Produces a risk register that informs the requirements phase (high-risk items may need further clarification, scoping, or deferral) and transfers to delivery at the requirements-handoff.

## When to Use

- Step 11 in the analysis-workflow sequence (last step) — run after decision-log consolidation
- Before the requirements-package is finalised — risks inform which requirements need further clarification, deferral, or scope reduction
- Mandatory in the sequence — depth scales with uncertainty; a straightforward change may produce a short register, a complex one a substantial one

## Scope of This Skill

Risk analysis covers **requirements-level risks** — risks that could cause the feature to fail, be delayed, or deliver less value than expected. It does not replace:
- **Project / programme risk management** — which tracks delivery risks (schedule, resource, budget) across the whole programme; risks identified here are inputs to, not a substitute for, that register
- **Architecture / security threat modelling** — which assesses design-level attack vectors and technical vulnerabilities; unconfirmed-feasibility risks flagged here are inputs to that process
- **Operational risk management** — which assesses risks to production systems, service continuity, and operational runbooks
- **Business continuity and disaster recovery planning** — which covers organisational resilience beyond the scope of a single feature

This skill consumes the outputs of all prior analysis skills and synthesises them into a risk register the requirements-package carries to the requirements phase and delivery team.

## Risk Categories

| Category | Description |
|----------|-------------|
| **Requirements ambiguity** | Requirements that can be interpreted multiple ways, leading to wrong implementation even if built correctly |
| **Dependency** | Third-party services, teams, or data sources the feature depends on that may not be ready, available, or cooperative |
| **Unconfirmed feasibility** | Requirements whose feasibility within the existing system's constraints has not been confirmed by architecture — the analyst flags the gap; whether a requirement is actually undeliverable is a design determination, not a requirements one |
| **Regulatory / compliance** | Requirements that trigger regulatory review, data privacy impact assessments, or accessibility audits not yet completed |
| **Stakeholder alignment** | Conflicting priorities between stakeholders papered over rather than resolved — requirements that will be challenged late |
| **Brownfield-specific** | Risks that only apply because this is an existing system: instability in the change area, undocumented behavior, tribal knowledge dependencies, stale documentation |

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change scope | change-scoping | Yes |
| Dependency map | dependency-mapping | Yes — cross-team dependencies are dependency risks |
| Constraint register | constraint-extraction | Yes — hard constraints not yet accepted by design are feasibility risks |
| Gap register | gap-analysis | Yes — unclosed gaps are delivery risks |
| Impact analysis | impact-analysis | Yes — high-severity impacts with coordination required are risks |
| Assumption log | assumption-log | Yes — unverified assumptions are automatic risk entries |
| Existing-system-baseline (known issues section) | current-capability-synthesis | If discovery ran — brownfield-specific risks; if discovery was skipped, flag the absence and note that brownfield risk categories cannot be evidence-grounded |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. HARVEST — Collect risks from all inputs      │
│     Each prior analysis skill surfaces risks.    │
│     Gather and deduplicate them.                 │
├──────────────────────────────────────────────────┤
│  2. IDENTIFY — Add risks not yet surfaced        │
│     Ambiguity, feasibility, compliance,          │
│     stakeholder alignment, and brownfield risks. │
├──────────────────────────────────────────────────┤
│  3. OWN — Assign a risk owner                    │
│     Assign before scoring so the owner           │
│     validates the assessment.                    │
├──────────────────────────────────────────────────┤
│  4. SCORE — Likelihood × Impact (gross)          │
│     Score each risk on a 1–3 scale for each.    │
│     Combined score drives prioritisation.        │
├──────────────────────────────────────────────────┤
│  5. RESPOND — Define response strategy           │
│     Avoid, transfer, mitigate, or accept.        │
│     Define what reduces likelihood or impact.   │
├──────────────────────────────────────────────────┤
│  6. CONTINGENCY — What if response fails?        │
│     The fallback plan if the risk materialises.  │
│     Required for mitigate/transfer. For accept:  │
│     monitoring trigger + late-response (Step 5). │
├──────────────────────────────────────────────────┤
│  7. RESIDUAL SCORE — Re-score after response     │
│     What is the remaining risk after the         │
│     response strategy is executed?               │
├──────────────────────────────────────────────────┤
│  8. ASSEMBLE — Populate the risk register        │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Harvest from Prior Analysis

Each analysis skill produces risks as a side effect:

| Source | Risk type harvested |
|--------|-------------------|
| Dependency map — cross-team dependencies | Dependency risks |
| Dependency map — Gap or Uncertain readiness | Dependency risks |
| Gap register — escalated gaps | Delivery / dependency risks |
| Impact analysis — high-severity cross-team coordination | Dependency / stakeholder risks |
| Constraint register — hard constraints not yet accepted | Unconfirmed feasibility risks |
| Assumption log — unverified assumptions | All categories (depends on what the assumption is about) |
| Baseline known issues — directly in change area | Brownfield risks (known bugs and instability only — undocumented behavior, tribal knowledge, and stale documentation are identified in Step 2) |

Collect all of these into a draft risk list before adding anything new.

**Deduplication:** Two risks describe the same underlying risk if they share the same root cause and affect the same requirements — regardless of how they are worded or which source surfaced them. When two entries appear to be the same, merge them into one entry and record both source references in the risk description. When uncertain, merge and note.

### Step 2 — Identify Additional Risks

**Requirements ambiguity:** Review each confirmed requirement for terms that could be interpreted more than one way. Requirements containing words like "fast", "secure", "appropriate", "flexible", "easy to use" without measurable thresholds are ambiguity risks.

**Stakeholder alignment:** Review the stakeholder map. Look for: stakeholders with conflicting interests noted in the map; requirements marked as contested or under discussion during elicitation; stakeholders with high impact but low influence who may escalate late. If you did not conduct the elicitation sessions yourself, review the session notes or consult the analyst who did — do not rely on recollection.

**Unconfirmed feasibility:** Review the constraint register. Are there hard constraints the confirmed requirements appear to push against? For each such requirement, flag it as an unconfirmed-feasibility risk: record which constraint it conflicts with and note that architecture confirmation is required before design can proceed. Do not attempt to determine whether the requirement is deliverable — that is a design judgment.

**Regulatory / compliance:** For the feature under analysis, assess whether any of the following apply:
- Processes, stores, or transmits personal data → privacy impact assessment (GDPR, CCPA, or applicable regulation) may be required
- Changes authentication, authorisation, or data access patterns → security review required
- Modifies user-facing interfaces used by the public → accessibility audit (WCAG) may be required
- Operates in a regulated sector (financial services, healthcare, etc.) → sector-specific review (FCA, HIPAA, etc.) may be required

For each applicable review: confirm whether it is initiated, who owns it, and what the target completion date is. A required review with no owner and no scheduled date is a Critical risk (score 9).

**Brownfield-specific** (covers new risks derived from baseline entries, plus risks not represented in the baseline at all):
- For each known bug harvested in Step 1: assess whether existing workarounds will hold under the new feature's load — if not, register a separate brownfield risk for each workaround at risk of breaking
- Undocumented behavior the confirmed requirements were written against — what if that behavior turns out to be a bug?
- Tribal knowledge: are there critical people whose knowledge of the change area is not documented and who could leave the project?
- Stale documentation the architect or developer might rely on — flag which documents have low currency ratings

### Step 3 — Assign Risk Owner

Every risk must have exactly one named owner **before scoring begins.** The owner validates the gross score, confirms the response strategy is executable, and is accountable for tracking the risk through delivery.

Risk owners do not need to do the mitigation work themselves, but they must ensure it gets done. They are the escalation point if the contingency is needed.

**Typical owners by category:**

| Risk category | Typical owner |
|---------------|---------------|
| Requirements ambiguity | Business Systems Analyst (BSA) |
| Dependency | Project / delivery manager |
| Unconfirmed feasibility | Lead architect or tech lead |
| Regulatory / compliance | Compliance officer or designated Data Protection Officer (DPO) |
| Stakeholder alignment | Product owner or programme manager |
| Brownfield-specific | Lead architect or tech lead |

These are defaults. Assign the individual with the most direct accountability and context for the specific risk — not just the role.

**If no owner can be identified:** Escalate to the project manager. A risk register entry with no named owner is invalid and must not proceed to the next step.

### Step 4 — Score Each Risk (Gross)

Score each risk before any response strategy is applied. This is the gross (inherent) risk score.

**Risk threshold calibration:** The priority thresholds (Critical at 9, High at 4–6, etc.) below are defaults. They are not universal. Before scoring begins, confirm with the Accountable stakeholder that these thresholds are appropriate for this project, organisation, and regulatory context. A score of 6 may be acceptable in one context and a programme-stopping event in another. Record any agreed deviations from the defaults in the risk register header. If the Accountable stakeholder is not available to confirm thresholds, use the defaults and flag them as unvalidated.

Use a 3×3 likelihood/impact matrix:

**Likelihood:**

| Score | Description | Evidence threshold |
|-------|-------------|-------------------|
| 3 — High | Very likely to occur given current evidence | Direct evidence the condition exists now (e.g., the dependency team has confirmed they will not be ready; the requirement has been through two reviews without an ambiguity being resolved) |
| 2 — Medium | Could occur; reasonable chance | Indirect indicators or historical precedent (e.g., this team has missed readiness commitments on prior releases; ambiguous language is present but no conflicting interpretation is yet on record) |
| 1 — Low | Unlikely but possible | Theoretical possibility with no current supporting evidence |

Likelihood scores must be accompanied by a brief evidence note in the risk register entry.

**Impact:**

| Score | Description |
|-------|-------------|
| 3 — High | Would cause feature failure, major scope reduction, or regulatory incident |
| 2 — Medium | Would cause delays, rework, or reduced quality |
| 1 — Low | Manageable inconvenience; recovery is straightforward |

**Note on cross-category comparisons:** Impact type varies by risk category — a two-week delay and a regulatory breach can both score 3, but they are not interchangeable in a prioritisation decision. Do not adjust scores to force comparability across categories. Record the impact type in the risk description so the prioritisation step can account for it.

**Combined score = Likelihood × Impact:**

In a 3×3 matrix, the achievable scores are: 1, 2, 3, 4, 6, 9.

| Score | Priority |
|-------|---------|
| 9 | Critical — must be mitigated before requirements phase completes |
| 4–6 | High — must be mitigated before design begins |
| 3 | Medium — mitigation response plan must be defined before design begins; execution may occur in design |
| 1–2 | Low — monitor and review at implementation |

### Step 5 — Respond

Define the response strategy for each risk. There are four options:

| Strategy | When to use | Effect on residual score |
|----------|-------------|--------------------------|
| **Avoid** | Eliminate the risk by removing or changing the requirement that creates it | No residual score — entry is marked Closed (Avoided) and removed from active monitoring |
| **Transfer** | Flag that the financial or operational consequence should be shifted to a third party (e.g., via vendor SLA, contractual penalty clause, or insurance) — the analyst documents the recommendation; the commercial or legal mechanism is established by the delivery manager or procurement, not by requirements | Reduces impact to the organisation if the transfer arrangement holds; likelihood is unchanged — the event is equally likely to occur |
| **Mitigate** | Take action to reduce the likelihood of the risk materialising, or reduce its impact if it does | Reduces one or both dimensions |
| **Accept** | Acknowledge the risk and take no action — recorded for transparency; status moves to Open — monitoring | Residual score = gross score |

**Accept** is a valid strategy when the cost of mitigation exceeds the expected cost of the risk materialising, or when the risk is beyond the team's control. Accepted risks must be explicitly documented — silent acceptance is not valid.

Two additional fields are required for every accepted risk:
- **Monitoring trigger:** The condition or signal that would indicate the accepted risk is materialising (e.g., "dependency team misses the readiness checkpoint at the end of requirements phase"). Without a trigger, "monitoring" is meaningless.
- **Late-response action:** What the risk owner will do if the trigger fires and the risk materialises despite acceptance (e.g., "escalate to programme manager for go/no-go decision on affected scope"). Accepting a risk does not eliminate the need for a response plan — it defers it. The late-response action is not a mitigation; it is the acknowledgement that mitigation was foregone and recovery will be needed.

**Mitigation examples (requirements-phase actions only):**
- Resolve an ambiguous requirement with the product owner and rewrite it with a measurable criterion before handoff
- Escalate an unconfirmed cross-team dependency to the delivery manager with a documented readiness target date — record the commitment in the dependency map
- Flag an unconfirmed-feasibility requirement for mandatory architecture review before design begins; document the open question in the constraint register
- Initiate a required compliance or regulatory review and confirm owner and target completion date before the requirements phase closes
- Defer a requirement that depends on an unready external input to a later scope boundary — document the deferral in the gap register

**Avoid examples (requirements-phase actions only):**
- Remove a requirement that depends on an unready third-party integration, record it as a deferred item in the gap register, and confirm the scope boundary with the product owner
- Reframe a requirement to eliminate the ambiguous dimension entirely — replace vague terms with measurable criteria and obtain product owner sign-off on the rewrite

### Step 6 — Contingency Plan

What happens if the response strategy fails and the risk materialises? The contingency is not the same as the response. The contingency is the recovery plan.

**Required for:** `mitigate` and `transfer` strategies — if the mitigation or transfer arrangement fails, a contingency is needed.

**Not required for:** `avoid` (the risk is eliminated). For `accept`: a formal contingency plan is not defined here, but a **monitoring trigger** and **late-response action** are required (see Step 5 — Accept). These are recorded in the risk register entry, not in this contingency field.

Contingency examples (requirements-phase scope — the analyst documents what the delivery team should do if the response fails; delivery-phase execution belongs to the delivery manager):
- Remove the risky requirement from scope and record it as a deferred item in the gap register; confirm the revised scope boundary with the product owner before handoff
- Flag to the delivery manager that the feature may need to be scoped down at design time, with the conditions that must be met before full scope is reinstated
- If the response fails after handoff, the risk owner activates the contingency: the delivery manager and architect are notified and must decide whether to proceed with reduced scope or pause delivery pending resolution

### Step 7 — Residual Score

After the response strategy is defined, re-score the risk to reflect the expected state *after the response is executed.*

Residual likelihood and impact are scored on the same 1–3 scale. Residual score = Residual Likelihood × Residual Impact.

- For **avoid**: the risk is eliminated. Mark the entry as Closed (Avoided) and record no residual score — the entry is removed from active monitoring.
- For **accept**: residual score = gross score (unchanged). Record the monitoring trigger and late-response action in the risk register entry (see Step 5).
- For **mitigate** or **transfer**: residual score reflects the expected reduction. If mitigation only partially reduces likelihood or impact, score accordingly. Note that transfer reduces impact only (likelihood is unchanged — see Step 5).

The residual score, not the gross score, drives ongoing monitoring priority once the response strategy is in motion.

### Step 8 — Assemble

Populate the `risk-register` template. Critical risks (gross score 9) require two reviews before the requirements phase completes:

1. **Peer review for completeness and accuracy:** A reviewer who did not produce the risk register — a peer BSA, the lead architect, or the delivery manager — reviews each critical risk entry for: completeness of fields, credibility of evidence notes, plausibility of gross and residual scores, and adequacy of the response strategy. The BSA who conducted the analysis must not be the sole reviewer of their own work.
2. **Accountable stakeholder review for business acceptability:** The product owner or business sponsor reviews each critical risk and either formally accepts it or escalates it — escalation means the risk is referred to the programme manager or steering committee with a request for a go/no-go decision on the affected scope before design begins.

Both reviews must be received before handoff. If either is outstanding at the gate, the handoff does not proceed.

## Output

A populated **risk-register** document (use the template at `../assets/risk-register.md`).

### File Output

Write the completed risk register to `docs/<feature>/requirements-package/analysis/risk-register.md`.

**Risk ID format:** Use `RISK-NNN` (e.g., `RISK-001`, `RISK-012`), where NNN is a zero-padded sequential integer allocated project-wide — IDs must be unique across the entire project, not just within this document. Once assigned, IDs are permanent. When two risks are merged (see Step 1 Deduplication), retain the lower-numbered ID and record the retired ID in the description field. Do not reuse retired IDs.

Each risk entry contains: risk ID, category, description, affected requirements, owner, gross likelihood score (with evidence note), gross impact score, gross combined score, response strategy, mitigation or avoidance action, contingency plan (where applicable for mitigate/transfer), monitoring trigger (required for accepted risks), late-response action (required for accepted risks), residual likelihood, residual impact, residual combined score, and status.

Valid status values:

| Status | Meaning |
|--------|---------|
| Open — not started | Risk identified; response strategy not yet defined |
| Open — mitigation in progress | Response strategy defined; mitigation actions underway |
| Open — monitoring | Mitigation complete; or risk formally accepted (accepted risks remain open and monitored — acceptance is not closure) |
| Closed (Resolved) | The condition that created the risk no longer exists (e.g., ambiguity clarified, dependency confirmed ready) |
| Closed (Avoided) | Risk eliminated via avoid strategy |

Consumed by: the requirements phase (high-risk items may need further clarification, deferral, or scope reduction before handoff) and the requirements-handoff (the architect and delivery team inherit the risk register).

## Worked Example

The following shows a single completed risk register entry.

| Field | Value |
|-------|-------|
| **ID** | RISK-001 |
| **Category** | Requirements ambiguity |
| **Description** | REQ-047 states "the system must respond quickly" with no measurable threshold. "Quickly" has been interpreted as <200ms by the frontend team and <5s by the backend team during requirements review. |
| **Affected requirements** | REQ-047 |
| **Owner** | BSA (J. Smith) |
| **Gross likelihood** | 3 — High (two review cycles have passed without a threshold being added; conflicting interpretations are already on record) |
| **Gross impact** | 3 — High (misaligned NFR will produce a design that fails performance testing, requiring rework) |
| **Gross score** | 9 — Critical |
| **Response strategy** | Mitigate |
| **Mitigation** | BSA to facilitate a session with the product owner and lead architect to agree a measurable SLA (e.g., worst-case response time < 300ms) and update REQ-047 before handoff. Target: end of requirements phase. |
| **Contingency** | If no SLA can be agreed, remove the NFR from this release scope and record it as a deferred requirement in the gap register. |
| **Residual likelihood** | 1 — Low (rationale: once a specific, agreed threshold is written into the requirement and signed off, there is no longer a divergent interpretation to act on — the ambiguity is eliminated by the mitigation action itself, not merely reduced) |
| **Residual impact** | 2 — Medium (rationale: impact is not reduced to Low because the threshold-setting session may still produce a value that one team finds difficult to meet; some rework risk remains if the agreed SLA proves more demanding than originally assumed) |
| **Residual score** | 2 — Low |
| **Status** | Open — mitigation in progress |

## Failure Modes This Skill Reduces

This skill reduces (not eliminates) the following failure modes. Residual exposure remains in each case.

| Failure mode | How this skill reduces it | Residual exposure |
|---|---|---|
| An ambiguous requirement causes a wrong implementation that passes all tests | Step 2 explicitly reviews requirements for ambiguity risks | The analyst may not catch every ambiguous term; peer review and stakeholder walkthroughs further reduce (but do not eliminate) residual exposure |
| Stale documentation is relied on by the architect, causing a design misaligned with the actual system | Step 2 brownfield-specific check flags low-currency documentation as a risk | If discovery was skipped, there is no baseline to assess currency against; flagging the absence is the only available action |
| A tribal knowledge holder leaves mid-project | Step 2 explicitly checks for undocumented critical knowledge | The analyst can only surface knowledge gaps that are known to be gaps; undocumented knowledge that the analyst is unaware of cannot be flagged |
| Critical risk discovered during implementation — too late for phasing | Risks harvested from all prior analysis skills during the analysis phase; critical risks reviewed with the Accountable stakeholder before requirements phase completes | New risks may emerge during design and delivery that were not predictable at requirements time; this skill covers requirements-phase identification only |
| Required compliance review is not scheduled and is only discovered during design | Step 2 compliance check explicitly identifies required reviews and flags unscheduled ones as Critical risks | The analyst must know which regulatory frameworks apply; if the applicable framework is misidentified or unknown, the compliance check cannot compensate |
| Risk has no accountable owner and is not tracked after handoff | Step 3 requires a named owner before scoring; unowned risks are invalid register entries | Owner assignment does not guarantee owner engagement; delivery-phase follow-through is the delivery manager's accountability |

## Failure Modes This Skill Does Not Address

| Failure mode | Why it is out of scope |
|---|---|
| Risks that emerge during design or implementation and were not foreseeable at requirements time | This skill produces a snapshot; ongoing risk management through delivery is the delivery manager's responsibility |
| Scoring anchored by the analyst's prior assumptions or unconscious bias | The skill requires owner validation of gross scores, but groupthink in scoring sessions is not eliminated by process alone |
| Risks that cannot be identified because key stakeholders were unavailable or withheld information | The skill instructs the analyst to consult stakeholders; it cannot compel participation or detect deliberate omission |
| Architecture-level or security risks that only become visible during design | These belong to architecture risk assessment and threat modelling, which this skill explicitly does not replace |

## Hand-off Gate

**Requires all inputs from the Inputs table above are present and consumed:**
- `docs/<feature>/requirements-package/analysis/change-scope.md` — confirmed
- `docs/<feature>/requirements-package/analysis/dependency-map.md` — confirmed
- `docs/<feature>/requirements-package/analysis/constraint-register.md` — confirmed
- `docs/<feature>/requirements-package/analysis/gap-analysis.md` — confirmed
- `docs/<feature>/requirements-package/analysis/impact-analysis.md` — confirmed
- `docs/<feature>/requirements-package/analysis/assumption-log.md` — confirmed
- `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` (known issues section) — confirmed if discovery ran; if discovery was skipped, this must be explicitly noted in the risk register and all brownfield risk category entries must be flagged as evidence-ungrounded

Before the requirements phase begins, you must:
1. Write the completed `risk-register` artifact in full — every risk with its gross score, response strategy, contingency (where applicable for mitigate/transfer), monitoring trigger and late-response action (required for accepted risks), residual score, and named owner.
2. Present it to a peer reviewer (a BSA, lead architect, or delivery manager who did not produce the register) for completeness and accuracy review. Receive explicit acknowledgement. The producing BSA may not serve as their own completeness reviewer.
3. For any critical risks (score 9): present separately to the Accountable stakeholder (product owner or business sponsor) for business acceptability review. Receive explicit sign-off (accepted) or escalation decision (referred to programme manager or steering committee) on each.

---

## Completion Criteria

**Presence checks — every entry must exist:**
- [ ] All cross-team dependencies from the dependency map have risk register entries
- [ ] All escalated gaps from the gap register have risk register entries
- [ ] All unverified assumptions from the assumption log have risk register entries
- [ ] All known issues in the change area from the existing-system-baseline have been assessed (or baseline absence is explicitly noted)
- [ ] Requirements reviewed for ambiguity risks
- [ ] Stakeholder map reviewed for alignment risks
- [ ] Every risk has a named owner assigned before scoring

**Quality checks — entries must be credible, not merely present:**
- [ ] Every gross likelihood score has a specific evidence note — "see assumption log" or "historical precedent" without a citation is not sufficient
- [ ] Every residual score is lower than the gross score (or, for accepted risks, equal to it) and the reasoning for the reduction is recorded
- [ ] No risk entry with a gross score of 9 has a response strategy of Accept without explicit Accountable stakeholder sign-off
- [ ] Accepted risks each have a monitoring trigger and a late-response action recorded
- [ ] Every mitigate/transfer entry has a contingency plan that names who acts and what they do — "escalate" without a named escalation target is not sufficient
- [ ] Named risk owners have been notified and have validated their assigned gross score and response strategy — scores set without owner input must be flagged as unvalidated

**Sign-off checks:**
- [ ] Peer reviewer (not the producing BSA) has explicitly acknowledged the completed risk register for completeness and accuracy
- [ ] Critical risks (score 9) have been reviewed by the Accountable stakeholder (product owner or business sponsor) with sign-off or escalation recorded
- [ ] If discovery was skipped: risk register explicitly notes that brownfield risk entries are evidence-ungrounded

## Risk Lifecycle

The risk register produced by this skill is a snapshot at requirements phase completion. It does not manage risk through delivery. Handoff responsibilities:

- **At requirements handoff**: The risk register transfers to the architect and delivery manager. Critical (score 9) and high (score 4–6) risks must be explicitly acknowledged by the receiving team.
- **During delivery**: Risk ownership persists. Individual risk owners remain accountable for their assigned risks until the risk is closed or the contingency is activated.
- **Risk closure**: A risk is closed when the condition that created it is resolved (e.g., ambiguous requirement clarified and accepted; dependency confirmed ready). The owner marks it closed with a date and a brief note.
- **Escalation**: If a high or critical risk materialises during delivery, the risk owner activates the contingency plan and notifies the programme manager.

Ongoing risk tracking through delivery is the delivery manager's responsibility; this skill's scope ends at handoff.
