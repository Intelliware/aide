# Requirements Elicitation

## Purpose

Guided questioning to extract requirements from stakeholders. One question at a time, structured choices where possible.

## When to Use

- Anytime there is a gap that the system, documentation, process maps, or journey maps could not answer
- When the BA/PO needs to confirm or correct an assumption the AI derived from the system or inferred from the change description
- When the desired behaviour of the new feature has not been stated with enough precision to write a specification

## What Makes This Different

This is **targeted elicitation** — not a blank-slate interview. By this point the AI has already produced:
- A plain-English capability inventory of what the system already does (codebase-discovery)
- An assessment of what is already documented and settled (existing-artifact-review)
- As-is process maps with annotated gaps and all actor swimlanes (process-mapping)
- As-is user journey maps with annotated gaps and all personas (user-journey-mapping)

Every question asked in elicitation must trace back to a specific gap — either a gap flagged in a prior discovery output (process-mapping, user-journey-mapping, existing-artifact-review, codebase-discovery) or a business objective, constraint, or assumption in the change description that has not yet been explicitly confirmed. Questions that the system or prior artifacts already answer clearly should not be asked.

## Core Rules

1. **One question at a time.** Never ask multiple questions in the same message. The BA/PO's attention and patience are finite.
2. **Structured choices where possible.** Present options derived from discovery before asking open-ended questions. "Should this behave like X, Y, or something else?" is easier to answer than "What should this do?"
3. **Show your work.** Prefix each question with what the AI already knows from the system or documentation. This signals that the discovery work has been done and builds confidence that the question is being asked because it genuinely could not be answered — not because it was not looked for.
4. **Accept "I don't know" as a valid answer.** Log it as an open question; do not press for a decision the stakeholder is not ready to make.
5. **Confirm before assuming.** If the AI derived an assumption from the system ("I can see the system currently does X — is that the intended behaviour we should preserve?"), confirm it explicitly before treating it as a requirement.
6. **Escalate conflicts, do not paper over them.** When two stakeholders give contradictory answers, record both and escalate to the person with approval authority over the relevant deliverable for a settled decision. Do not treat a conflict as a deferral.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Gaps flagged in process-mapping | process-mapping output | Yes — process workflow unknowns; process actor swimlanes also identify who to consult |
| Gaps flagged in user-journey-mapping | user-journey-mapping output | Yes — user experience unknowns; personas identify user groups to engage |
| Contradictions flagged in existing-artifact-review | documentation currency assessment | Yes — ambiguities between docs and code |
| Coverage gaps from codebase-discovery | current capability inventory | Yes — behavior the code doesn't explain |
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` | Yes — the who / what / why statement confirmed at the start of discovery; every elicitation question must trace back to a gap in serving this goal |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Critical Sequence Constraint

> **Do not write `requirements-elicitation.md` and do not invoke the Hand-off Gate until Steps 1–5 of the Workflow below are complete.** "Complete" means every P1 question in the compiled backlog has been asked in a live turn-by-turn exchange with a stakeholder and a response has been received and recorded. Creating the output file before elicitation is finished is a failure mode this skill is specifically designed to prevent. If the skill is invoked and no prior discovery outputs are available, surface that gap to the BA/PO and do not proceed to file creation.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. COMPILE — Consolidate all gaps into a        │
│     prioritised question backlog                 │
├──────────────────────────────────────────────────┤
│  2. PRIORITISE & SEQUENCE — Assign P1/P2/P3      │
│     tiers; order by dependency within tiers      │
├──────────────────────────────────────────────────┤
│  3. PREPARE — Frame each question                │
│     Lead with what you know, then ask precisely  │
├──────────────────────────────────────────────────┤
│  4. ELICIT — One question at a time              │
│     Ask → listen → confirm understanding →       │
│     record → next question                       │
├──────────────────────────────────────────────────┤
│  5. VALIDATE — Two-sweep assumption check        │
│     Sweep 1: business-layer assumptions from     │
│     change description not yet confirmed         │
│     Sweep 2: capability-inventory assumptions    │
│     not already covered in Steps 3–4            │
├──────────────────────────────────────────────────┤
│  6. RECORD — Capture structured outputs          │
│     Each answer becomes a confirmed requirement  │
│     or decision. Log unresolved items.           │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Compile the Question Backlog

Collect all gaps from prior discovery outputs into a single list.

**Sources:**
- Change-description — any business objective, success metric, business constraint, or delivery obligation that is stated but not yet quantified or confirmed; these become the first questions asked
- Process-mapping gaps table — workflow steps that are unclear or could not be determined
- User-journey-mapping gaps table — user intent or experience that could not be derived from available evidence
- Documentation currency assessment — contradictions between documents and the system requiring a decision
- Capability inventory coverage gaps — behaviours not visible in any available evidence
- Data and constraint observations from codebase-discovery — format, volume, or constraint assumptions that need confirmation

**For each gap, capture:**
- The source skill that flagged it
- The specific unknown
- Why it matters (what requirement depends on the answer)
- The stakeholder who can answer it (derived from process actor swimlanes and user journey personas)

### Step 2 — Prioritise and Sequence the Question Backlog

Assign a priority to every gap before sequencing. Priority determines what must be answered in this elicitation round versus what can be deferred if time or availability is constrained.

**Priority tiers:**

| Priority | Criteria | If unanswered |
|----------|----------|---------------|
| **P1 — Blocking** | The answer is needed before any other question in the same group can be asked, or before the feature can be scoped | Cannot proceed; must be resolved or explicitly deferred with an interim assumption documented |
| **P2 — Required** | The answer is needed to write the requirement, but does not block other questions | Must be answered before hand-off; acceptable to schedule a follow-up session |
| **P3 — Confirmatory** | Validates a code-derived assumption; the feature can proceed on the assumption, but it carries risk until confirmed | Can be deferred; record the assumption as pending confirmation and flag in open items |

**Automatic P1 rule:** All Business Objectives and Business Constraints questions are P1 by definition. Do not apply the tier criteria to them — the business outcome this feature must achieve and the constraints that govern it are prerequisites for assessing the priority of every other question. An AI that assigns a business objective question P2 status on the grounds that it "does not block other questions" has reasoned incorrectly. No other question's priority can be determined without knowing what the feature is for and what it is bounded by.

**Sequencing rules:**

Sequence P1 questions first within each stakeholder group. Do not begin P2 questions until all P1 answers in that group are captured.

Across stakeholder groups, order by dependency: if a P1 answer from Stakeholder A is required before any question to Stakeholder B can be meaningfully asked, engage Stakeholder A first. Where no cross-group dependency exists, order stakeholder groups by authority — engage approvers and change requestors before users, users before operators and adjacent teams — to surface the highest-authority perspective first.

**Tie-breaker — dependency conflicts with authority ordering:** When authority ordering and dependency ordering contradict each other (for example, a high-authority stakeholder is available only for P3 confirmatory questions while a lower-authority stakeholder holds all P1 blocking answers), dependency ordering takes precedence. Engage the P1 holder first regardless of authority rank, and schedule the high-authority stakeholder separately. Do not delay P1 questions in deference to seniority — unresolved P1 items are a greater risk to the engagement than sequence protocol.

**Dependency rules within groups:**
- Business objective and constraint questions first — "what outcome must this achieve, and what constraints govern it?" before any functional detail is discussed; the answers frame every subsequent question
- Scope questions next — "is this change in scope or out of scope?" before detailing requirements for it
- Behavioral questions before edge-case questions — confirm the happy path before asking about exceptions
- Data questions before UI questions — what data the feature reads/writes constrains how it can be presented
- Policy questions before implementation questions — who can do what before asking how they do it

**Grouped by stakeholder** — batch questions by who answers them to minimise context-switching during interviews.

### Step 3 — Prepare Each Question

Every question should be framed with context. The pattern:

```
[What you already know from discovery]
[The specific gap]
[Structured options if available, otherwise open-ended]
```

**Example — establishing a business objective (where the change description states intent but not a measurable outcome):**
> "The change description says this feature is intended to reduce manual effort for the finance team. How will the organisation know this feature has succeeded — is the target a reduction in processing time, a reduction in error rates, a headcount saving, or something else?"

Once the measure is identified, follow up in the next exchange:
> "You mentioned processing time as the target — is there a specific percentage or absolute reduction the business expects to see?"

Once the target is confirmed, follow up again:
> "Is there a timeframe by which that reduction should be achieved?"

**Example — confirming an assumption derived from the system:**
> "From reviewing the system, I can see that orders currently require a minimum of 3 items before checkout is permitted. Should the new bulk-order feature follow the same minimum, have a different minimum, or no minimum at all?"

**Example — filling a process gap:**
> "The order approval process shows an 'Approve' action in the admin interface, but I could not find any evidence of how approvers are notified that an order is waiting for their decision. Is that notification currently handled outside the system (for example, by email or a team communication tool), or is it something the system should be doing that we need to add?"

**Example — resolving a contradiction:**
> "The integration specification says orders can be cancelled within 24 hours of placement, but the system only appears to check the order's status — not how long ago it was placed. Which is correct: a time window, a status check, or both?"

### Step 4 — Elicit One Question at a Time

**Synchronous sessions (live or video call):**

1. **Ask the prepared question** — include the context framing
2. **Listen without interrupting** — let the stakeholder complete their answer
3. **Confirm understanding** — paraphrase back: "So you're saying that...?"
4. **Ask one clarifying follow-up if needed** — still one question, not several
5. **Record the answer** verbatim or as a close paraphrase before moving on
6. **Move to the next question**

**Asynchronous elicitation (written exchange: email, Slack, ticket comments):**

- Send one question per message. Do not batch multiple questions into a single written exchange — stakeholders scan for the first question mark and stop.
- Include the same context framing as synchronous sessions. Without it, written answers drift.
- Set an explicit response-by date on every written question. Without one, asynchronous gaps accumulate silently.
- If a written answer is ambiguous, ask one clarifying question in a follow-up message before treating the answer as confirmed.
- Log non-responses after the response-by date as deferred items with the stakeholder named as owner. Do not treat silence as confirmation.
- **Conflict detection in async channels:** After each response arrives, compare it against any prior answer recorded for the same question from a different stakeholder. Contradictions in async exchanges are easy to miss because the answers arrive in separate threads at different times. When a contradiction is detected, apply the conflict resolution procedure below before sending any further questions to either party.

**Handling stakeholder conflict:**

When two stakeholders give contradictory answers to the same question (whether in a synchronous session or detected across asynchronous responses):

1. **Do not resolve the conflict unilaterally.** Record both answers verbatim, noting which stakeholder gave each.
2. **Log it as a conflict item** — a specific output type that requires escalation, not deferral.
3. **Identify the person with approval authority** for the relevant area — the change requestor, the product owner, or the most senior accountable role for this feature area. This is the one person with final authority to resolve the conflict.
4. **Present the conflict to the authority** with both positions stated: "Stakeholder A said X; Stakeholder B said Y. Which governs?" Ask for a settled decision, not a preference.
5. **Record the resolution as a Settled decision** attributed to the authority, not to either of the original parties.

A conflict left unresolved is a P1 blocking item. Do not proceed to the hand-off gate with active conflicts unresolved.

**If the authority is unavailable:** Identify who holds that authority in their absence — their manager, a named delegate, or the project sponsor. Route the escalation there. If no substitute authority can be reached before the hand-off deadline, document the conflict with both positions, record an interim assumption derived from the higher-authority of the two conflicting answers, and flag it explicitly as a provisional decision pending formal confirmation. Do not let unavailability silently convert a conflict into an untagged assumption.

**Session time-boxing:**

Cover all P1 questions before moving to P2. Cover P2 questions before attempting P3. Watch for answer quality decay — answers that become shorter, vaguer, or hedged on topics the stakeholder addressed precisely earlier are a signal of attention decay, not genuine uncertainty. When decay sets in, close the session and schedule a follow-up rather than collecting low-quality answers for the remaining backlog. Before closing, record which questions were reached and which remain, and confirm the follow-up slot. A short session with reliable answers is more valuable than a long session where the last third of answers require re-elicitation.

**Do not:**
- Jump ahead to the next question before confirming the current answer is understood
- Ask compound questions: "What should happen when X, and also who gets notified, and how long do they have to respond?"
- Let the stakeholder's answer sprawl into territory outside the current gap without noting it for follow-up
- Treat a conflicting answer as a deferred item — conflicts have a named resolution path; deferrals do not

### Step 5 — Validate Derived Assumptions

This step is distinct from Step 3. Step 3 frames questions around specific gaps where an assumption naturally surfaces as part of addressing the gap. Step 5 is a deliberate sweep across two sources: the change description and the capability inventory. After all gap-driven questions are complete, review both for any assumption that was not already confirmed or corrected during Steps 3–4. The goal is to ensure no AI-inferred assumption — whether about business intent or system behaviour — slips into the baseline without explicit stakeholder validation.

**Sweep 1 — Business-layer assumptions from the change description:**

Review the change description for any business objective, success metric, constraint, or scope boundary the AI treated as settled without explicit confirmation. These assumptions are often invisible because they are embedded in how questions were framed rather than stated outright.

> "The change description says this feature is intended to [X]. I have been treating [specific inference] as the intended outcome — is that correct, or should it be framed differently?"

**Priority business-layer assumptions to validate:**
- The success metric the AI used to determine which gaps were P1 (if not explicitly stated in the change description)
- The scope boundary the AI applied to exclude certain questions as out of scope
- Any constraint (budget, timeline, regulatory) the AI inferred as settled when it was only implied

**Sweep 2 — System-behaviour assumptions from the capability inventory:**

Review the capability inventory for any flagged assumption that was not already confirmed or corrected during Steps 3–4.

> "I'm assuming the new feature should follow the existing approach where [X]. Is that correct, or should it work differently?"

**Priority system-behaviour assumptions to validate:**
- Business rules the AI inferred from the system's validation and enforcement behaviour
- Who is allowed to do what — inferred from the system's access control structure
- Data formats and conventions — such as how dates, currencies, and times are handled
- Whether existing performance or volume expectations should carry forward to the new feature (this is distinct from the Non-functional Expectations questions in the Question Categories section, which elicit new performance requirements for the feature itself)

### Step 6 — Record Structured Outputs

As answers come in, categorise each one immediately:

| Output Type | Definition | Feeds Into |
|------------|-----------|-----------|
| **Confirmed business outcome** | A stakeholder-stated measurable result the feature must achieve — an outcome, not a behaviour (e.g., "reduce manual reconciliation time by 40% within 90 days") | functional-requirements; acceptance-criteria; success-metrics |
| **Confirmed requirement** | A stakeholder-stated behaviour the new feature must exhibit in order to achieve the confirmed business outcome | functional-requirements |
| **Confirmed assumption** | A code-derived or change-description-derived assumption explicitly validated by a stakeholder | functional-requirements |
| **Corrected assumption** | An assumption that turns out to be wrong — whether derived from the system or from the change description | functional-requirements, risk-analysis |
| **Settled decision** | A question answered definitively that must not be revisited | constraint-extraction |
| **Conflict item** | Two stakeholders gave contradictory answers — escalate to the Accountable for a settled decision before hand-off; if Accountable is unavailable, apply the fallback in Step 4 and record as a Settled decision with Provisional: yes | Escalate to Accountable; resolves as Settled decision (or Provisional settled decision) |
| **Deferred item** | Stakeholder cannot answer now — record with a named owner and a resolution trigger (e.g., "after legal review", "before sprint planning") | Open questions in current-capability-synthesis |
| **Out of scope** | Stakeholder confirms this is not part of the current change | Change-scoping |
| **New gap discovered** | The answer reveals another unknown — before assigning a priority, explicitly check whether the new gap has dependency relationships with any existing backlog item. A gap that appears to be P2 in isolation may become P1-blocking if it unlocks or prevents another item already in progress. Only after this dependency check apply the P1/P2/P3 criteria from Step 2. Add to the active backlog if P1-blocking; log as an open item in Section 4 otherwise. | Dependency check first, then triage, before adding to question backlog |

## Question Categories and Examples

### Business Objectives and Success Criteria
- "What business outcome is this feature designed to achieve?"
- "Which metric will be used to measure whether this feature has succeeded?"
- "What is the target value for that metric — how much improvement is the business expecting?"
- "By when does the business expect to see that improvement?"
- "What is the cost of not building this feature — is there a competitive, contractual, or regulatory consequence if it does not ship?"
- "What is the minimum viable version of this feature — the subset that delivers the core business outcome even if everything else is deferred?"
- "Which team will own this feature post-launch and be responsible for its performance and operational health once it is in production?"

### Business Constraints
- "Is there a non-negotiable delivery date — contractual, regulatory, or go-to-market — that this feature must meet?"
- "What is the consequence to the business if that delivery date is missed?"
- "Is there a budget ceiling for this initiative that constrains the scope of what can be built?"
- "Are there pending regulatory changes with defined effective dates that set hard delivery windows for this feature or its data-handling requirements?"
- "Are there vendor or procurement dependencies — contracts that must be in place or third-party components that must be available — before this feature can ship?"

### Scope and Boundaries
- "Should this feature work for all user types, or only [specific role]?"
- "Is [adjacent capability] in scope for this change or a follow-up?"
- "Should existing [X] records be affected, or only new ones going forward?"

### Business Rules and Policies
- "The code enforces [rule] — is this intentional and should it apply to the new feature?"
- "Is [rule] derived from a regulatory or contractual obligation, or is it a business choice that could be revisited for this feature?"
- "Who is authorised to perform [action]?"
- "Is the set of people authorised to [action] the same as those who can [related action], or are they different groups?"
- "What should happen when [edge case]? Options: [A], [B], or [C]."
- "When [business event] occurs, does any other part of the business or an external party need to be informed or receive the resulting data?"
- "What obligation — regulatory, contractual, or policy-based — drives that notification requirement?"

### Data and State
- "What data does the user need to provide to complete [action]?"
- "Are any of those fields optional, or are all of them required?"
- "What happens to existing [entity] records when the feature is enabled?"
- "Are there data retention or deletion requirements for [entity]?"

### Non-functional Expectations

**Volume and performance:**
- "How many [entities] do you expect to exist at launch?"
- "What is the highest volume of [entities] you would expect the system to handle at peak load?"
- "Are there response time expectations — how fast should [operation] complete under normal conditions?"
- "Are there scenarios where large volumes of [entities] need to be processed at once — for example, end-of-day runs, bulk imports, or month-end reporting?"
- "If yes — how large are those volumes expected to be?"

**Security and access control:**
- "Are there data sensitivity or classification requirements for [data type]?"
- "Who should be able to see [sensitive data field] — is masking or role-based visibility required?"
- "Should [action] require multi-factor authentication or step-up verification?"

**Audit, compliance, and regulatory:**
- "Are there audit logging requirements for [action]?"
- "If yes — what is the required retention period for those logs?"
- "Are there regulatory or compliance obligations that govern how [data or action] must be handled (e.g., GDPR, SOC 2, HIPAA, PCI-DSS)?"
- "Is there an internal policy or regulatory body whose approval is required before this feature ships?"

**Availability and reliability:**
- "What is the acceptable downtime for this feature during business hours?"
- "Is this feature subject to a formal SLA?"
- "If yes — what does that SLA require in terms of uptime, response time, or recovery targets?"
- "What should happen to work in progress if a system outage occurs during [operation]?"
- "Are there disaster recovery or data backup requirements specific to [entity or action]?"

**Internationalisation and accessibility:**
- "Does this feature need to support multiple languages or locales?"
- "Are there date, currency, or number format requirements beyond what the existing system uses?"
- "Are there accessibility standards (e.g., WCAG 2.1 AA) that this feature must meet?"

### Error and Recovery
- "What should the user see if [operation] fails?"
- "Should the user be able to retry if [operation] fails?"
- "If yes — under what conditions is a retry permitted?"
- "Who gets notified when [error condition] occurs?"

### Change Management and Adoption
- "Does this feature change how any role performs their day-to-day work?"
- "If yes — what is required before go-live: training, a runbook update, a communication plan, or some combination?"
- "Who is responsible for producing that material before go-live?"
- "Will any existing manual workaround or offline process be retired when this feature ships?"
- "Who is responsible for managing that transition?"
- "What is the cut-over plan — how will the business move from the current process to the new one?"
- "What is the intended rollout approach — phased by user group, by region, feature-flagged, or a full big-bang release?"
- "What is the business's tolerance for running old and new processes in parallel during that rollout?"
- "If this feature ships and is found to be causing harm — incorrect calculations, data corruption, regulatory exposure — what is the rollback or mitigation plan?"
- "Who has authority to invoke that rollback?"

## Output

The elicitation output is a structured document written to `docs/<feature>/requirements-package/discovery/requirements-elicitation.md`. The document has four sections:

### File Output

Write the completed requirements elicitation outputs to `docs/<feature>/requirements-package/discovery/requirements-elicitation.md`.

### Section 1 — Confirmed Requirements and Business Outcomes

**Business outcomes** (one entry per confirmed measurable outcome):
```
OUT-001: [outcome statement — measurable result the feature must achieve]
  Metric: [the specific measure]
  Target: [the value or threshold to be reached]
  Timeframe: [by when]
  Confirmed by: [stakeholder name / role]
  Date confirmed: [YYYY-MM-DD]
  Source gap: [the change-description gap or assumption this addresses]
  Feeds into: functional-requirements; acceptance-criteria; success-metrics
```

**Behavioural requirements** (one entry per confirmed requirement, numbered sequentially):
```
REQ-001: [requirement statement — behaviour the feature must exhibit]
  Type: [Functional / Non-functional]
  Priority: [P1 / P2 / P3]
  Confirmed by: [stakeholder name / role]
  Date confirmed: [YYYY-MM-DD]
  Source gap: [the discovery gap this traces to]
  Traces to outcome: [OUT-NNN this requirement serves, if applicable]
  Acceptance criteria stub: [how this requirement will be verified — even a rough statement]
  Feeds into: functional-requirements
```

### Section 2 — Validated Assumptions
One entry per assumption — whether derived from the capability inventory (system behaviour) or inferred from the change description (business intent) — that was explicitly confirmed or corrected by a stakeholder:
```
ASMP-001: [original assumption as stated]
  Source: [Capability inventory / Change description]
  Status: Confirmed / Corrected
  Correction (if applicable): [what it should actually be]
  Confirmed by: [stakeholder name / role]
  Date confirmed: [YYYY-MM-DD]
  Feeds into: functional-requirements [; risk-analysis if corrected]
```

### Section 3 — Settled Decisions
One entry per question answered definitively that must not be revisited:
```
DEC-001: [decision statement]
  Source question: [the gap or conflict that prompted this]
  Decided by: [Accountable stakeholder name / role]
  Date decided: [YYYY-MM-DD]
  Provisional: [no / yes — pending formal confirmation by Accountable name]
  Feeds into: constraint-extraction
```

For decisions resolved via the Accountable-unavailable fallback (Step 4), record the delegate's name in `Decided by` and set `Provisional: yes` with the Accountable's name in the pending confirmation note. Provisional decisions are valid to proceed on but must be explicitly re-confirmed by the Accountable before the requirements package is finalised.

Decisions age. If new information discovered in a later session is inconsistent with a previously recorded decision, do not silently update the decision entry. Create a new `DEC-NNN` entry superseding the original and note the earlier entry as superseded in both records.

### Section 4 — Open / Deferred Items
One entry per unanswered question:
```
OPEN-001: [the question that remains unresolved]
  Priority: [P1 / P2 / P3]
  Reason deferred: [why it was not answered in this session]
  Owner: [stakeholder responsible for resolution]
  Resolution trigger: [event or milestone that unblocks this]
  Interim assumption (if any): [assumption the team will proceed on until resolved]
  Feeds into: open questions in current-capability-synthesis
```

### Appendix — Running Log (Audit Trail)

Maintain a running log entry for every question asked during elicitation, across all sessions. This log is the primary audit trail behind Sections 1–4 and must be appended to `requirements-elicitation.md` as a clearly labelled appendix. It is a required output, not optional.

For each entry, record:
- Session date and stakeholder(s) present
- The question text as asked
- The stakeholder's response (verbatim or a close paraphrase, clearly labelled)
- The output type assigned (Confirmed business outcome / Confirmed requirement / Confirmed assumption / Corrected assumption / Settled decision / Conflict item / Deferred item / Out of scope / New gap discovered)

For conflict entries, record both responses — one line per stakeholder — before logging the item as a Conflict type and initiating escalation. Do not summarise conflicting answers into a single statement; the verbatim record is what protects the analyst.

The running log must be updated continuously during elicitation, not reconstructed from memory after the session closes.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Asking the BA/PO to explain what the system already shows | Questions are restricted to gaps not resolvable from available evidence |
| Overwhelming stakeholders with a laundry list of questions | One question at a time; sequenced by priority and dependency |
| AI-inferred assumptions slipping into requirements without being confirmed | Step 5 runs two sweeps: business-layer assumptions from the change description (Sweep 1) and system-behaviour assumptions from the capability inventory (Sweep 2) — neither category can slip through unvalidated |
| Requirements that contradict settled decisions | Contradictions from existing-artifact-review are raised as explicit questions |
| Scope creep from unstructured conversation | Each question traces to a specific flagged gap — off-topic answers are logged separately |
| "I'll decide later" items never getting resolved | Deferred items are logged with a named owner and resolution trigger |
| Conflicting stakeholder answers silently overwriting each other | Conflict items are escalated to the Accountable; they cannot be deferred or resolved unilaterally |
| Conflicts in async channels going undetected | Async section explicitly requires comparing each new response against prior answers to the same question |
| Non-functional requirements discovered after design begins | Non-functional question category covers security, compliance, availability, SLAs, and accessibility |
| Requirements that satisfy stakeholders but do not achieve the stated business objective | Business Objectives and Success Criteria category anchors elicitation to measurable outcomes from the outset |
| Business value never quantified, making requirements impossible to prioritise | Business Objectives questions surface the metric, target, and timeline before any functional gap is addressed |
| Scope driven by technical possibility rather than business need | Every question traces to a flagged gap in serving the change-description goal; technically interesting gaps without business impact are out of scope |
| Hard delivery deadlines or regulatory effective dates discovered after scope is set | Business Constraints category surfaces non-negotiable timelines and budget ceilings in the first elicitation round |
| Adoption and training requirements missed until UAT or post-launch | Change Management and Adoption category captures training, cut-over, rollout, and rollback obligations as requirements, not afterthoughts |
| A superseded decision remaining in force because new information was recorded silently | Decision entries include a date; a superseding decision cross-references and voids the earlier entry |
| Elicitation outputs signed off by the person who provided the answers | Hand-off gate requires sign-off from a stakeholder distinct from the primary elicitation respondent |

## Hand-off Gate

**Before proceeding to the next skill in your sequence, you must:**
1. Confirm that elicitation (Steps 1–5 of the Workflow above) is fully complete — every P1 question has been asked and answered in a live exchange — then write the full structured output as defined in the Output section above:
   - **Confirmed business outcomes** (each OUT-NNN entry with metric, target, timeframe, and confirming stakeholder)
   - **Confirmed requirements** (each REQ-NNN entry with type, priority, date, acceptance criteria stub, and OUT-NNN trace where applicable)
   - **Validated assumptions** (confirmed or corrected, with the original assumption stated — whether system-derived or change-description-derived)
   - **Settled decisions** (each with its source question, date, and the stakeholder who settled it)
   - **Open / deferred items** (each with the reason it was deferred, the named owner, and the resolution trigger)
2. **Write this document to `docs/<feature>/requirements-package/discovery/requirements-elicitation.md`. The file write must succeed before proceeding. If the folder structure does not exist, create it.**
3. Present the document and request explicit sign-off. **Sign-off must come from a stakeholder with authority over the requirements package who is distinct from the primary elicitation respondent.** A stakeholder cannot meaningfully validate their own answers; this is not a control. If the same person filled both roles in this engagement, document that fact explicitly and note that independent review was not possible.
4. Confirm the completion criteria below are satisfied.
5. Ask the approver explicitly: **"Are these elicitation outputs complete? Are there any gaps that still need to be resolved before we proceed to the current-capability-synthesis?"** Do not interpret silence or acknowledgement as acceptance — wait for an explicit confirmation. If the approver identifies unresolved gaps, address them, update the document, overwrite the file, and re-present before asking again.

Do not proceed to the next skill until the elicitation outputs have been explicitly confirmed as complete. Answering elicitation questions is not the same as completing this step — the output artifact must be written to disk, presented, and signed off.

---

## Completion Criteria

- [ ] At least one confirmed business outcome (OUT-NNN) has been recorded, with a measurable metric, a target value, and a timeframe — if no quantified outcome could be obtained, this must be logged as an open P1 item with the business sponsor named as owner
- [ ] All gaps from process-mapping, user-journey-mapping, and existing-artifact-review have been addressed (answered, deferred, or confirmed out of scope)
- [ ] All major assumptions the AI inferred from either the system or the change description have been explicitly confirmed or corrected by a stakeholder, using the ASMP-NNN format with Source noted
- [ ] Each confirmed requirement is recorded with the stakeholder who confirmed it, using the REQ-NNN format defined in the Output section (including type, priority, date confirmed, acceptance criteria stub, and OUT-NNN trace where applicable)
- [ ] Settled decisions are recorded for constraint-extraction, each with a date and the deciding stakeholder named
- [ ] Deferred and open items are logged with a named owner and resolution trigger for current-capability-synthesis
- [ ] All conflict items have been resolved — either as a Settled decision by the Accountable stakeholder, or as a Provisional settled decision with a named delegate and a pending-confirmation flag; no conflict items remain unaddressed
- [ ] The running log appendix is complete — every question asked across all sessions has a corresponding log entry with question text, stakeholder response, and output type assigned
- [ ] `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` has been written to disk, presented for sign-off, and confirmed by a stakeholder other than the primary elicitation respondent (see Hand-off Gate)
- [ ] The business sponsor or change requestor has been engaged and has confirmed the business outcome(s), success metric(s), and any binding constraints — these cannot be confirmed by a proxy or inferred from prior artifacts
- [ ] All other stakeholders identified from process maps and user journey personas whose input was required have been engaged
