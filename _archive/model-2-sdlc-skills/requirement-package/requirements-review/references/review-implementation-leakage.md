# Review — Implementation Leakage

## Purpose

Flag specs that accidentally prescribe HOW (implementation details) instead of WHAT (behavior and outcomes).

## When to Use

This review is mandatory at step 6 of 10, regardless of who wrote the spec. Run it only after all inputs listed in the Inputs table are drafted, and before architect handoff.

The following conditions indicate elevated risk of leakage and warrant extra scrutiny:

- Requirements were written by engineers or technical leads who naturally think in solutions rather than behaviors
- The spec was written by adapting an existing technical design document — these almost always contain leakage

## What This Reviews

Implementation leakage asks: **does the spec prescribe HOW to build it instead of WHAT it must do?**

A requirement specifies observable behavior and outcomes — what a user sees, what a system returns, what state changes. An implementation detail specifies a technical approach — what data structure to use, which framework to call, how to structure the code.

Implementation-prescriptive specs are harmful because they:
- Unnecessarily constrain the architect's design space
- Become outdated as soon as the technical approach changes
- Confuse QE, who should test behavior, not implementation
- Create a false sense of precision — the spec looks detailed but the detail is in the wrong place

## The Core Distinction

| Behavioral requirement (correct) | Implementation detail (leakage) |
|----------------------------------|--------------------------------|
| "The system sends a confirmation email within 5 minutes of order placement" | "The system uses a Redis-backed job queue to send confirmation emails" |
| "Concurrent order placements for the same product must not oversell inventory" | "Use a database-level row lock (SELECT FOR UPDATE) to prevent oversell" |
| "The export file must be available for download within 5 minutes of the request" | "Generate the export asynchronously using a Sidekiq background job" |
| "The API must return results within 200ms at p99 under normal load" | "Add a database index on orders.created_at to improve query performance" |

The right column belongs in the architect's design document, not in the requirements spec.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Functional spec | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes — primary artifact under review |
| Acceptance criteria | `docs/<feature>/requirements-package/requirements/functional-requirements.md` (embedded in each requirement) | Yes — ACs sometimes contain implementation details in their pass conditions |
| Business rules catalog | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes — rules sometimes prescribe implementation (e.g., "use regex to validate email") |
| Non-functional requirements | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` | Yes — NFRs sometimes prescribe infrastructure rather than quality attributes |
| User journeys | `docs/<feature>/requirements-package/requirements/user-journeys.md` | Yes — user journeys sometimes prescribe CSS, component libraries, or DOM structure rather than describing the user flow and field behaviors |
| Assumptions, constraints & out of scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` | Yes — required to determine whether a named technology or approach is a documented constraint rather than leakage |
| Data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` | Yes — required to determine whether a named entity or field is already defined there, rather than being prescribed in the wrong artifact |

> **Missing input guard:** If any required input listed above cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with this review because [artifact name] was not found at `[expected path]`. This input is required. Please ensure the artifact exists before running this review."*

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. TECHNOLOGY PRESCRIPTION SCAN                     │
│     Named technologies, frameworks, libraries,       │
│     patterns in requirements language                │
├──────────────────────────────────────────────────────┤
│  2. DATA STRUCTURE PRESCRIPTION SCAN                 │
│     Named database tables, columns, indexes,         │
│     caches, queues in requirements language          │
├──────────────────────────────────────────────────────┤
│  3. ALGORITHM PRESCRIPTION SCAN                      │
│     Named algorithms, data structures, or            │
│     processing approaches in requirements language   │
├──────────────────────────────────────────────────────┤
│  4. UI IMPLEMENTATION PRESCRIPTION SCAN              │
│     Named CSS classes, component library internals,  │
│     DOM structure in functional requirements or      │
│     user journeys                                    │
├──────────────────────────────────────────────────────┤
│  5. AC PASS CONDITION SCAN                           │
│     Pass conditions that check implementation        │
│     state rather than observable behavior            │
├──────────────────────────────────────────────────────┤
│  6. NFR PRESCRIPTION SCAN                            │
│     NFRs that prescribe infrastructure rather than   │
│     quality attributes                               │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Technology Prescription

Scan every requirement for named technologies, frameworks, or architectural patterns. The test is simple: if the named technology does not appear as a constraint in the assumptions, constraints & out of scope document, it is leakage.

**Trigger words and phrases to flag:**
- Named databases: "store in PostgreSQL," "cache in Redis," "index in Elasticsearch"
- Named frameworks: "using React," "via Django REST Framework," "through Spring Boot"
- Named patterns: "use an event-driven approach," "implement as a microservice," "via REST API"
- Named queuing systems: "via Sidekiq," "using SQS," "through RabbitMQ"

**Exception:** If the named technology appears explicitly as a constraint in the assumptions, constraints & out of scope document, referencing it is not leakage — it is a constraint reference. Open that document and verify before accepting any technology name as legitimate.

### Check 2 — Data Structure Prescription

Scan for any reference to specific database or storage structures.

**Trigger phrases:**
- "Add a column to the orders table"
- "Create a new index on..."
- "Store in a separate cache key"
- "Write to the audit_log table"
- "Queue the job in the background_jobs table"

The requirement should specify what data must persist and for how long — not where or how it is stored. The data requirements document defines entities and their attributes; the requirements spec should not duplicate or prescribe schema detail.

**Rewrite guidance:** Convert the data structure prescription into a persistence requirement. After rewriting, check whether the entity already exists in the data requirements document — if it does, the attribute belongs there, not in the functional spec.

| Prescriptive (leakage) | Behavioral (correct) |
|---|---|
| "Add a queued_at column to the orders table" | "The system must record when an order was queued for processing" |
| "Write to the audit_log table" | "All permission changes must be auditable, with the acting user and timestamp retained for [X] years" |

### Check 3 — Algorithm Prescription

Scan for requirements that specify a computational approach rather than a required outcome.

**Rewrite guidance:**

| Prescriptive (leakage) | Behavioral (correct) |
|---|---|
| "Use a hash map to look up user permissions" | "Permission lookup must return the correct result within [Xms] for authenticated users" — the architect decides the data structure |
| "Sort the results using merge sort" | "Results must be returned in [specified order] — e.g., most recent first" — the architect decides the sorting algorithm |
| "Process orders in batches of 100" | "The system must process all queued orders within [X minutes/hours] of receipt" — the architect decides batch strategy |

**Distinguishing legitimate processing constraints from algorithm prescription:** A batch size is leakage when it is an arbitrary implementation choice. It is a legitimate constraint when it is driven by a downstream system limit, a regulatory boundary, or an agreed operational requirement — in which case it belongs in the assumptions, constraints & out of scope document, not embedded in a functional requirement. If a batch size appears in a requirement, ask: "Would the business care if the architect processed them differently, so long as the throughput target was met?" If not, it is leakage.

### Check 4 — UI Implementation Prescription

Scan functional requirements and user journeys for references to UI implementation internals.

**Trigger phrases:**
- CSS class names or style property values (unless the project uses a defined design system with documented component names — see exception below)
- Component library internal props ("use the `variant='outlined'` prop on the TextField")
- DOM structure ("wrap the form in a div with class 'container'")
- JavaScript event handler patterns ("on button click, call the handleSubmit function and debounce for 300ms")

Functional requirements and user journeys should specify user flows, field behaviors, and states — not the CSS or component API implementation.

**Exception:** If the project uses a defined design system with documented component names (e.g., "use the DS Button component"), referencing the component by name is acceptable — it is a design constraint, not an implementation prescription.

### Check 5 — AC Pass Condition Prescription

Scan acceptance criteria pass conditions for checks that verify internal state rather than observable behavior.

For each prescriptive pass condition, identify the user-observable outcome it was trying to verify, then rewrite the condition to check that outcome directly.

| Prescriptive (leakage) | Behavioral (correct) |
|---|---|
| "Pass: the job record in background_jobs table has status 'completed'" | "Pass: the exported file is available for download within 5 minutes of the request" |
| "Pass: the Redis cache key 'user_permissions_{id}' is set" | "Pass: the permission check returns the correct result within 200ms for an authenticated user" |
| "Pass: the database query executes in under 10ms" | "Pass: the page displays results within [Xms] of the user's action" |

### Check 6 — NFR Prescription

Scan NFRs for requirements that prescribe infrastructure or architecture rather than quality attributes.

**Trigger heuristic:** An NFR specifies a mechanism (leakage) when it names what to use. An NFR specifies a quality attribute (correct) when it names a measurable level of service the system must achieve. Ask: "Does this NFR tell the architect *what to implement*, or *what level of service must be delivered*?" If the former, it is leakage.

**Trigger words and phrases to flag:**
- "Must use [technology]" — names a mechanism
- "Must implement [pattern or component]" — names an architectural approach
- "Must be deployed on / via / through [infrastructure]" — names a delivery mechanism
- Any NFR that cannot be verified by measuring a user-observable outcome (response time, availability, error rate, throughput) without inspecting the infrastructure

| Prescriptive (leakage) | Behavioral (correct) |
|---|---|
| "Must use an in-memory cache" | "Read response time for [endpoint] must not exceed [Xms] at p99 under normal load" — the architect decides how to meet it |
| "Must use a CDN for static assets" | "Static assets must load within [Xms] for users in [target regions] under normal load" |
| "Must use database connection pooling with a minimum of 10 connections" | "The system must sustain [X] concurrent users without degradation in response time below the targets defined in NFR-[n]" |

## Output

A findings list in this format:

| Finding ID | Check | Location | Leaked Detail | Recommended Action | Severity |
|-----------|-------|---------|--------------|----------------------|---------|
| LEAK-001 | Technology prescription | REQ-005 | "The system uses Redis to cache user permission lookups" | Rewrite: "Permission lookups must return within 50ms for authenticated users" | High |
| LEAK-002 | Data structure prescription | REQ-008 | "Add a queued_at column to the orders table" | Remove from functional spec. Rewrite as: "The system must record when an order was queued for processing." Confirm the order entity in data requirements captures this attribute. | High |
| LEAK-003 | AC pass condition | AC-003.1 | "Pass: background_jobs table record shows status complete" | Rewrite: "Pass: the notification is delivered to the user's email within 5 minutes" | High |

**Severity:** Apply the highest applicable rating. If a finding meets the High definition, rate it High regardless of which artifact it appears in.

- **High** — constrains the architect's design in a way not justified by a business requirement; must be removed, rewritten, or moved to the assumptions & constraints document
- **Medium** — implementation detail that creates confusion and has a clear fix, but does not constrain the architect's design space (e.g., a named tool referenced descriptively rather than prescriptively)
- **Low** — minor phrasing that leans toward implementation without fully prescribing it; still worth correcting but will not mislead the architect or QE

## Verdict

- **PASS** — No High findings. Medium and Low findings either corrected or accepted. For any accepted finding, update its Recommended Action cell to: "Accept — [rationale]" before recording the verdict.
- **FAIL** — One or more High findings remain unresolved.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Architect's design is constrained by technology choices that were never stakeholder requirements | Check 1 removes technology prescriptions from the spec before handoff |
| The spec becomes outdated the moment the architect chooses a different approach | Behavioral requirements remain valid regardless of architectural approach |
| QE writes tests that check implementation internals and break when the implementation changes | Check 5 ensures pass conditions test observable behavior |
| A requirement specifies a schema change that the architect would have designed differently | Check 2 removes data structure prescriptions and leaves them in the data requirements document where they belong |
| The architect is locked into a specific algorithm or batch strategy with no business justification | Check 3 replaces computational prescriptions with outcome-based requirements |
| The front-end is locked into specific CSS, component props, or DOM structure with no design-system justification | Check 4 removes UI implementation prescriptions from functional requirements and user journeys |

## Hand-off Gate

**Review 6 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-data-completeness.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings, updates the affected artifacts, and you re-run this review. Do not proceed until the verdict is PASS.
5. If **PASS**: receive explicit BSA acknowledgement, then read `review-data-completeness.md`.

---

## Completion Criteria

**Check coverage:**
- [ ] Check 1 (technology prescription) — run against: functional spec, business rules, NFRs, user journeys
- [ ] Check 2 (data structure prescription) — run against: functional spec, business rules
- [ ] Check 3 (algorithm prescription) — run against: functional spec, business rules
- [ ] Check 4 (UI implementation prescription) — run against: functional requirements, user journeys
- [ ] Check 5 (AC pass condition prescription) — run against: acceptance criteria
- [ ] Check 6 (NFR prescription) — run against: non-functional requirements

**Resolution:**
- [ ] All High findings corrected — implementation details removed and replaced with behavioral equivalents or moved to the correct artifact
- [ ] All technology prescriptions verified against the assumptions, constraints & out of scope document; those not listed as constraints removed
- [ ] All data structure prescriptions verified against the data requirements document; those not defined there either removed or converted to persistence requirements
- [ ] All AC pass conditions verify observable behavior, not internal state
- [ ] All NFRs specify quality attributes with measurable targets, not infrastructure choices
- [ ] Any Medium or Low findings accepted without correction have their rationale recorded in the findings table under the Recommended Action column
- [ ] Verdict recorded
