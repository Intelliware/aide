# Review — Testability

## Purpose

Ensure every functional requirement, NFR, and business rule has verifiable acceptance criteria or a verification method with an explicit, executable pass/fail condition.

## Definitions

**BSA (Business Systems Analyst):** The named requirements owner accountable for this artifact. On teams that use a different title (Business Analyst, Product Owner, Requirements Lead), substitute the equivalent role. All references to “BSA” in this skill mean the single named individual accountable for requirements accuracy and sign-off — not a committee or a team.

## When to Use

- After acceptance criteria and the functional spec are drafted
- Before QE begins test planning — untestable requirements waste QE effort
- When a requirement describes a desired property (like security or reliability) without specifying how it can be verified
- Run after review-measurability — a requirement that is not measurable is almost certainly not testable either
- Re-run in full from Check 1 after all High findings are resolved; Medium and Low findings do not require a re-run — they require BSA written acknowledgement of accepted risk before handoff

## What This Reviews

Testability asks: **can QE write a test that definitively passes or fails against this requirement?** Measurability (does it have a number?) is a confirmed precondition from review-measurability, not re-checked here. Testability goes further — it asks whether the test is executable (can it actually be run?), observable (can the pass condition be seen from outside the system?), and isolatable (can the requirement be tested without conflating independent behaviors?).

## The Testability Criteria

A requirement is testable if it satisfies all three core criteria. Measurability is assumed confirmed by the prior review.

| Criterion | Question | Failure example |
|-----------|----------|----------------|
| **Observable** | Can the outcome be seen, measured, or recorded from outside the system without instrumentation? | "The system must be secure" — security is not a single externally observable outcome |
| **Executable** | Can a test actually be run to verify it with available tooling, data, and environment? | "The system must never fail" — cannot be exhaustively tested; no environment can prove it |
| **Isolatable** | Can this requirement be tested independently, so that a failure identifies exactly one behavior? | A requirement bundling 5 distinct behaviors makes failure analysis impossible |

These three criteria apply to all requirement types. Check 1 is a prerequisite gate — it confirms the artifact is in a state where testability analysis is meaningful before any criterion is applied. Checks 2–5 apply the criteria to functional requirements and ACs. Checks 6 and 7 apply the same criteria to NFRs and business rules, which require artifact-specific guidance.

## Inputs

| Input | Source | Required | If absent |
|-------|--------|----------|-----------|
| Acceptance criteria | `docs/<feature>/requirements-package/requirements/functional-requirements.md` (embedded in each requirement) | Yes — primary artifact under review. May be a standalone AC document or embedded within the functional spec; either format is acceptable as long as each requirement's pass conditions are explicitly stated | Halt review; record as FAIL with finding: no ACs exist to review |
| Functional spec | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes — the source of record for every requirement. If your team uses a single combined document that contains both requirements and their ACs, that document satisfies both this row and the row above | Halt review; record as FAIL; escalate to BSA |
| Business rules catalog | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes — every rule must be testable. The business rules catalog is the artifact produced by the `business-rules.md` skill. It contains discrete rule cards in BR-NNN format covering six categories: **Validation** (conditions data must satisfy to be accepted), **Calculation** (how derived values are computed), **Eligibility** (conditions a user or entity must meet to access a capability), **State transition** (conditions under which an entity changes state), **Policy** (rules derived from business or regulatory policy), and **Integration** (rules governing data exchanged with external systems). A business rule is distinct from a functional requirement: a requirement states what the system does; a rule states the precise condition and outcome the system must enforce. | If no business rules are documented, ask the BSA whether business rules are in scope for this project. If the BSA confirms they are not in scope, note "not applicable" for Check 7 and proceed. If the BSA confirms they are in scope but the catalog is missing, halt and escalate |
| Non-functional requirements | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` | Yes — NFRs must have a specified verification method | If no NFRs are documented, ask the BSA whether NFRs are in scope for this project. If the BSA confirms they are not in scope, note "not applicable" for Check 6 and proceed. If the BSA confirms they are in scope but the register is missing, halt and escalate |
| Completed review-measurability output | Review-measurability findings document | Yes — measurability is a precondition for testability | Locate the review-measurability findings document and confirm it records a PASS or PASS WITH OBSERVATIONS verdict. If no such document exists, or the recorded verdict is FAIL, do not begin this review — escalate to BSA. If the verdict is PASS WITH OBSERVATIONS, obtain the open findings list before beginning Checks 2 and 7. Open findings related to unmeasurable pass conditions in functional requirements are pre-existing High findings for Check 2. Open findings related to vague or unmeasurable predicates in business rules are pre-existing High findings for Check 7. In both cases, record each inherited finding with a reference to its review-measurability finding ID. Do not re-investigate inherited findings — they are closed only by confirming the artifact has been updated to address them. |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. AC COVERAGE GATE                                 │
│     Confirm every requirement has at least one AC    │
│     before testability analysis begins               │
├──────────────────────────────────────────────────────┤
│  2. PASS CONDITION QUALITY                           │
│     Every AC has an explicit, objective pass/fail    │
│     condition — not "it works"                       │
├──────────────────────────────────────────────────────┤
│  3. OBSERVABILITY CHECK                              │
│     The outcome required by the AC can be            │
│     observed from outside the system without         │
│     instrumentation or internal state access         │
├──────────────────────────────────────────────────────┤
│  4. EXECUTABILITY CHECK                              │
│     The test can actually be run — tooling,          │
│     environment, and test data all exist or have     │
│     a named owner and committed resolution date      │
├──────────────────────────────────────────────────────┤
│  5. ISOLATION CHECK                                  │
│     No single AC tests multiple independent          │
│     behaviors simultaneously; integration-level      │
│     ACs are explicitly scoped                        │
├──────────────────────────────────────────────────────┤
│  6. NFR VERIFICATION METHOD CHECK                    │
│     Every NFR has a named, executable verification   │
│     method with tooling, environment, timing, and    │
│     re-verification cadence specified                │
├──────────────────────────────────────────────────────┤
│  7. BUSINESS RULE TESTABILITY                        │
│     Every business rule can be verified by a         │
│     test with a known input and expected output;     │
│     confirm measurability fixes are in place         │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — AC Coverage Gate

Every requirement in the functional spec must have at least one AC set before its testability can be analyzed. For each requirement that lacks ACs, record a High finding and skip that requirement in all subsequent checks — there is nothing to analyze. Continue Check 2 analysis for requirements that do have ACs. If every requirement in the spec lacks ACs, record a FAIL verdict immediately and halt — the artifact is not ready for testability review. A partial review — where some requirements have ACs and others do not — will produce a FAIL verdict at minimum, because each requirement without ACs is a High finding. Proceed with analysis for covered requirements so QE has maximum usable output, but the verdict cannot be PASS or PASS WITH OBSERVATIONS while any requirement lacks ACs entirely.

This check is distinct from review-completeness, which verifies internal consistency of the spec. This check confirms requirements have ACs at all — a prerequisite for testability analysis, not a substitute for the completeness review that should already have passed.

### Check 2 — Pass Condition Quality

For every AC, examine the pass condition. A pass condition is testable if it states the exact observable outcome — not a description of the behavior, but the specific signal that confirms the AC passed.

**Untestable pass conditions:**
- "The feature works as expected" — judgment, not observation
- "The user experience is positive" — subjective; no signal defined
- "No errors occur" — unbounded; does not specify error type, scope, or conditions under which absence is verified
- "The system handles it correctly" — circular; defines nothing

**How to fix "no errors occur":** replace with a scoped, condition-bound formulation that stays in the functional domain: "No HTTP 5xx responses are returned when a valid order is submitted with all required fields populated." If the intent is to assert absence of errors under load, that is a performance NFR — move it to the NFR register and apply Check 6.

**Testable pass conditions:**
- API: "Successful response containing the order ID, status, and creation timestamp"
- API: "Validation error response containing the field name and the error message"
- Email: "Email is delivered to the test inbox within 5 minutes and contains the subject 'Order Confirmed'"
- UI: "The error banner is visible in the viewport, contains the text 'Please enter a valid email address', and is associated with the email input field via aria-describedby"
- Batch: "Output file contains exactly one record per input row, with no records from rows where the status column is 'inactive', and a file-level summary row as the final line"

### Check 3 — Observability Check

For each AC, ask: can a test observe the outcome required by the pass condition without reading internal system state or instrumenting the system under test?

**Public interface** means any interface a test agent can reach using the system's own externally exposed surfaces, without modifying or instrumenting the system under test: API endpoints, UI elements rendered in a browser or accessibility tree, database state queried via a stable read interface that exists as part of the target environment's standard infrastructure (such as a read replica or reporting schema provisioned during environment setup, not added to enable this specific test's observation), file system paths reachable by the test runner, or external delivery systems (email inbox, S3 bucket, webhook receiver) accessible in the test environment. A schema or query path added specifically to expose state for a test is instrumentation, not a public interface, regardless of which system grants access to it.

**Observable outcomes (testable):**
- System response status and response body content
- Rendered UI content visible in a browser or accessibility tree
- Email delivery confirmed via test inbox API
- File existence and content at a path accessible to the test runner
- Database state read through a named, stable query interface accessible to the test environment
- Timing measured externally (test runner wall clock, response time in headers)

**Non-observable outcomes — flag and rewrite:**
- Internal variable values or memory state
- Job queue depth or internal queue state (unless a public status endpoint exists)
- Cache contents (observable only through behavioral signals: response time under load, or cache-hit headers if exposed)
- Log file contents — acceptable as the sole verification **only** for audit and compliance requirements, defined as: requirements whose stated purpose is to confirm an event was recorded, not to confirm functional behavior occurred. The reviewer determines whether a requirement qualifies as audit-scope based on the requirement's written text. If the BSA disputes the reviewer's classification, escalate to the project lead for a binding determination before recording the finding. For all other requirements, logs are supplementary evidence only; a public behavioral signal must also be specified.

When the only available verification reads internal state, ask: "Is there a public behavioral signal that would be observable if the internal behavior were correct?" If yes, rewrite the pass condition around that signal. If no such signal exists, record a High finding and flag as an observability design gap — escalate to the BSA and technical architect. The requirement cannot receive a PASS verdict until either a public behavioral signal is identified and the pass condition is rewritten, or the system is redesigned to expose an observable output. A system design change required to make a requirement observable is a scope impact that must be acknowledged by the project lead.

### Check 4 — Executability Check

For each AC, ask whether the test can actually be run. When a gap is found, record it with an owner and resolution date.

| Executability risk | Example | Flag | Required gap record |
|-------------------|---------|------|---------------------|
| Test requires environment that doesn't exist | "Verify failover behavior" when no DR environment is provisioned | Yes | Owner, committed provisioning date, and gate criterion for release |
| Test requires test data that doesn't exist | "Verify behavior with 10M rows" when test DB has 1,000 rows | Yes | Owner, data generation plan, and committed completion date |
| Test requires a third-party system in a specific state | "Verify external notification delivery" when test environment cannot receive external notifications | Yes | Owner, sandbox or stub plan, and committed completion date |
| Test requires tooling that is not available or licensed | "Run load test" when the load testing tool is not procured; "Run automated UI tests" when the browser driver is incompatible with the target browser version | Yes | Owner, procurement or remediation plan, and committed completion date |
| Test requires manual steps that aren't specified | "QE verifies the email looks correct" with no defined pass criteria | Yes | Owner: AC author. Required action: rewrite the AC with explicit pass criteria specifying the exact fields, values, or conditions QE must confirm. Committed completion date before QE planning begins |

**Gap verdict impact:** Any unresolved executability gap at the time of verdict review is a High finding and triggers FAIL. A gap with a named owner and a committed resolution date that falls before QE planning begins may be recorded as Medium at reviewer discretion, provided the BSA explicitly accepts the schedule risk in writing in the findings document. If a committed resolution date passes without resolution and without a BSA-recorded revised commitment, the gap is automatically escalated to High. The reviewer must verify gap status at the time the verdict is recorded: a gap that was Medium at initial recording but has missed its resolution date is a High finding — and therefore a FAIL — at verdict time.

### Check 5 — Isolation Check

An AC that tests multiple independent behaviors in a single pass/fail condition is a problem in practice — when it fails, the failure cannot be attributed to a specific behavior.

**Semantic isolation test:** For each AC containing more than one stated outcome, ask: "If behavior A passed and behavior B failed, would this AC fail?" If yes, the AC is bundled and must be split. Syntactic signals ("and," "also," "additionally") are prompts to apply this semantic test — they are not proof of bundling on their own.

**Example — not bundled** (single behavior, one verifiable outcome):
- "Returns HTTP 422 and a response body containing the field name and error message" — the 422 status and body content are both properties of the same response event; they cannot independently fail.

**Example — bundled** (two independent behaviors):
- "Sends a confirmation email and updates the order status to 'confirmed'" — email delivery and database state update are independent operations; either can fail without the other.

**Causal dependency vs. bundling:** When outcome B cannot occur unless outcome A succeeds first — because A is a structural precondition for B, not a coincidental companion — the two outcomes are causally chained, not independently bundled. Do not split causally chained outcomes into separate ACs; a test for B run without A having succeeded cannot produce a meaningful result and will generate false failures.

**Example — causal chain (do not split):**
- "Payment is captured and order record is created with status 'confirmed'" — order creation depends on successful payment capture; the two outcomes cannot be tested independently. Test them together in sequence, confirming both outcomes in a single AC.

When an AC contains outcomes that appear bundled, confirm whether a causal dependency exists before requiring a split. If a dependency is confirmed, annotate the AC with "sequenced-outcomes" in its scope metadata and document the causal relationship so QE can structure the test correctly. If no dependency exists, split as required.

**Integration-level ACs:** Some ACs deliberately test a chain of behaviors together (e.g., end-to-end order placement). These are valid but must be explicitly labeled as integration-scope ACs. The label “integration-scope” must appear in the AC title or in a dedicated scope metadata field adjacent to the AC — it must be visible to QE during test planning without requiring access to the review findings document. They are not subject to the isolation check, but must reference the unit-level ACs they depend on, so that a failure in the integration test can be triaged against the unit-level results.

For every AC labeled as integration-scope, verify: (a) the label "integration-scope" or equivalent is present in the AC text or AC metadata, and (b) the AC lists the unit-level AC IDs it depends on. If either is missing, record a Medium finding and require the author to add the label and references before the verdict is recorded.

Split bundled functional ACs into separate, independently executable tests. Label integration-scope ACs explicitly.

### Check 6 — NFR Verification Method Check

For every NFR, verify all four verification attributes are specified:

| Attribute | What it must specify | Underspecified example | Acceptable specification |
|-----------|---------------------|----------------------|--------------------------|
| **Method** | Named technique (load test, penetration test, static analysis, chaos experiment) | "Will be tested" | "Locust load test against staging environment" |
| **Tooling** | Named tool or framework | "Load test" | "Locust 2.x with the order-placement scenario script" |
| **Environment** | Named environment. **Active testing** (load tests, penetration tests, chaos experiments, synthetic transaction tests) must not target production unless explicitly approved; if approved, the approving authority and approval reference must be recorded in the NFR specification itself. **Passive production monitoring** (observing live metrics, alert thresholds, on-call response) is not active testing and may reference production — but must still specify the metric, threshold, alerting system, and on-call rotation | "In production" without specifying active vs. passive, or active production testing with no recorded approval | Active: "Staging environment seeded with 100k representative orders." Passive: "Production — p99 latency; PagerDuty alert at 800 ms threshold; on-call: platform team rotation" |
| **Timing** | When verification runs relative to release milestones | "Before go-live" | "Pre-release regression gate: run on every release candidate; initial baseline established in Phase 1" |

**Re-verification cadence:** Specify whether the verification method runs once (initial baseline) or recurs. Performance, reliability, and security NFRs must specify a recurrence trigger and, where the trigger requires a judgment call, a named decision authority:

| Recurrence trigger | Named decision authority required |
|---|---|
| Every release | No — triggered automatically by the release pipeline |
| Every architectural change | Yes — the technical architect or equivalent role must be named as the authority who determines whether a change qualifies as architectural |
| Every quarter | No — calendar-driven |
| On-demand | Yes — the role with approval authority to initiate an on-demand run must be named |

**Common underspecified NFR verifications and required additions:**
- "Verified by load test" → add: which tool, what load profile (ramp-up, peak, soak), which environment, what is the pass threshold, when does it run, and does it recur
- "Security review will confirm" → add: automated scan (tool name) plus manual review (scope, reviewer role, approval authority), run against which environment, before which milestone
- "Monitored in production" — passive monitoring is acceptable; it is not subject to the production testing restriction. Add: which metric, what threshold triggers a breach, which alerting system, who is on-call, and what is the SLA for response

### Check 7 — Business Rule Testability

For every business rule, verify it can be stated as: "Given [known, measurable input state], when [specific trigger], then the system [specific, observable outcome]." Rules with vague conditions or outcomes cannot be tested.

**Untestable rules:**
- "Discounts apply to large orders" — "large" is undefined
- "Users are throttled when they send too many requests" — "too many" is undefined
- "The system retries failed operations" — retry count and interval are undefined

These gaps should have been caught and fixed by review-measurability. This check confirms those fixes are present in the artifact before QE begins. If a business rule still contains vague predicates here, record it as a High finding — it indicates review-measurability findings were not fully resolved — and flag the gap to the BSA before recording the verdict.

## Output

A findings list in this format:

**Finding ID convention:** Use the prefix `TEST-` followed by a three-digit sequence number starting at `001` for each review run. If a re-run is required, continue the sequence from where the prior run ended — do not restart at `001`. Record the run number in the findings document header so that IDs from different runs remain traceable. When two reviewers work in parallel on different sections of the artifact, prefix each reviewer's IDs with a distinguishing marker during the review (e.g., TEST-A-001, TEST-B-001). When findings are consolidated into a single document, reassign clean sequential TEST-NNN IDs and update all cross-references. Never publish a findings document with duplicate or prefixed IDs.

| Finding ID | Check | Location | Issue | Recommended Fix | Severity |
|-----------|-------|---------|-------|----------------|---------|
| TEST-001 | Pass condition quality | AC-005.1 | Pass condition says "the export works correctly" | Replace with: "Successful response with CSV-formatted content — header row followed by one data row per order in the date range" | High |
| TEST-002 | Executability | AC-008.3 | Verifying failover behavior requires a DR environment that is not provisioned | Owner: Infrastructure lead. Resolution date: 2026-05-15. Gate criterion: provisioned and smoke-tested before QE planning begins | High |
| TEST-003 | Isolation | AC-003.1 | Single AC tests both email content and email timing — two independent behaviors | Split into AC-003.1a (content: subject line, body fields) and AC-003.1b (timing: delivery within 5 minutes) | Medium |
| TEST-004 | NFR verification | NFR-SEC-002 | "Security review will confirm" — no tool, scope, environment, or timing specified | Specify: automated SAST scan (tool name) against staging environment before each release candidate; manual penetration test (scope: authentication and authorization flows) by security team before general availability | High |

**Severity:**
- **High** — requirement that QE cannot test; will be skipped or tested incorrectly; blocks PASS verdict
- **Medium** — requirement that can be tested but with ambiguity, judgment calls, or effort overhead; does not block PASS verdict if BSA explicitly accepts residual risk in writing
- **Low** — test that could be improved but is not fundamentally broken; does not block PASS verdict

## Verdict

- **PASS** — Every requirement has at least one executable, observable, isolated AC with a specific pass condition. All NFRs have fully specified verification methods: the four required attributes (method, tooling, environment, timing) are present, and re-verification cadence is specified for all performance, reliability, and security NFRs. No High findings remain open.
- **PASS WITH OBSERVATIONS** — No High findings remain open. One or more Medium or Low findings remain. BSA written acknowledgement of accepted risk for each open finding must be recorded in the findings document before handoff — added as a note on the relevant finding row. Acceptable forms: a written comment on the finding row in the shared findings document (BSA name and date required), or an email confirmation linked or appended to the findings document. The acknowledgement must state the finding ID and the risk accepted. In regulated environments, confirm the required form with the project lead before the review begins.
- **FAIL** — Any open High finding is a FAIL. High findings include: any requirement with no testable ACs; any NFR with no verification method whatsoever; any NFR verification method missing two or more of the four required attributes (method, tooling, environment, timing); any business rule with unmeasurable predicates that were not resolved before handoff from review-measurability.

**Underspecified vs. absent NFR verification:** An NFR with a named method that is missing one or more of the four required attributes (method, tooling, environment, timing) is underspecified — record as High if two or more attributes are missing, Medium if one attribute is missing and the others are specific. Re-verification cadence is a fifth requirement, conditional on NFR category (see Check 6); its absence is recorded separately from the four-attribute threshold. An NFR with no verification method whatsoever is absent — always FAIL. The two-attribute threshold is a deliberate, uniform rule that avoids attribute-by-attribute judgment calls; apply it consistently regardless of NFR category or attribute type.

## Failure Modes This Skill Prevents

| Failure mode | Check | How this skill prevents it |
|---|---|---|
| A requirement has no ACs and QE discovers it during sprint review | 1 | Check 1 gates testability analysis on AC existence; no ACs means immediate FAIL before QE begins |
| A sprint review debate about whether "works correctly" is met | 2 | Check 2 ensures pass conditions are objective and leave nothing to reviewer judgment |
| Pass conditions reference internal state, causing tests to break when implementation changes without any functional change | 3 | Check 3 requires pass conditions to reference externally observable behavior — internal state references are flagged and must be rewritten |
| A DR failover NFR that is never verified because no DR environment was planned | 4 | Check 4 surfaces executability gaps with named owners and resolution dates before QE begins |
| A single AC covers three behaviors; a failure leaves QE unable to identify the root cause | 5 | Check 5 splits bundled ACs into isolated, independently verifiable units |
| A performance NFR is verified once at go-live and never again; a regression is undetected | 6 | Check 6 requires re-verification cadence in addition to initial verification method |
| A business rule still contains vague predicates because review-measurability findings were not applied | 7 | Check 7 confirms measurability fixes are in place; re-escalates to BSA if they are not |

## Hand-off Gate

**Review 5 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-implementation-leakage.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS, PASS WITH OBSERVATIONS, or FAIL verdict.
3. Present findings and verdict to the BSA for review. If the BSA disputes a finding — argues that a pass condition is testable, or that a verification method is sufficient — the following rules apply. Findings classified as High due to complete absence cannot be downgraded through BSA justification: a requirement with no ACs and an NFR with no verification method can only be closed by updating the artifact to add the missing content. For all other findings, the reviewer must either: (a) acknowledge the BSA's justification, downgrade the finding to Low, and record the justification on the finding row, or (b) hold the finding at its original severity and escalate to the project lead or QE lead for a binding decision. The reviewer may not unilaterally drop a finding without recorded justification.
4. If **FAIL**: the BSA must update the affected artifacts to address all High findings. "Resolved" means: the artifact has been updated, the updated text is visible in the document, and you have re-read the affected section and confirmed the High finding no longer applies. After all High findings are resolved, re-run this review in full from Check 1. If the re-run surfaces new High findings on previously passing requirements, those findings enter the same resolution cycle — the review does not proceed to the next skill until the verdict is PASS or PASS WITH OBSERVATIONS with no open High findings.
5. If **PASS WITH OBSERVATIONS**: obtain BSA written acknowledgement of accepted risk for each open Medium or Low finding, recorded as a note on the relevant finding row in the findings document. Then read `review-implementation-leakage.md`.
6. If **PASS**: receive explicit BSA acknowledgement, then read `review-implementation-leakage.md`.

---

## Completion Criteria

Complete this checklist immediately before recording the verdict. For each item, record the result: **Pass**, **Fail** (with finding ID), or **N/A** (with written justification confirmed by the BSA). The completed checklist, with reviewer name and date recorded below, is the prerequisite for advancing to the next review skill.

- [ ] Check 1: Every requirement in the functional spec has at least one AC
- [ ] Check 2: Every AC has a specific, objective pass condition — no judgment-dependent language
- [ ] Check 3: Every pass condition is observable from outside the system via a public interface; any internal-state access is either rewritten or justified as audit-scope
- [ ] Check 4: Every AC can be executed with available tooling, data, and environment; any gap has a named owner and committed resolution date
- [ ] Check 5: No single functional AC tests multiple independent behaviors; any integration-scope ACs are explicitly labeled and reference their component unit-level ACs
- [ ] Check 6: Every NFR has a named verification method with tooling, environment, timing, and re-verification cadence specified
- [ ] Check 7: Every business rule is expressible as Given/When/Then with measurable predicates; any remaining vague predicates are escalated to BSA
- [ ] Verdict recorded (PASS / PASS WITH OBSERVATIONS / FAIL)
- [ ] If PASS WITH OBSERVATIONS: BSA written acknowledgement recorded for each open finding

**Reviewer:** _________________________ &nbsp;&nbsp; **Date:** _____________

**BSA acknowledged:** _________________ &nbsp;&nbsp; **Date:** _____________
