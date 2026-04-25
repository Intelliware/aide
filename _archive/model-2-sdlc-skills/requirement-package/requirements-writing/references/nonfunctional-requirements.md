# Non-Functional Requirements

## Purpose

Elicit and document non-functional requirements with measurable targets across performance, reliability, scalability, availability, security, compliance, observability, usability and accessibility, resource consumption, internationalisation, and operational continuity. Consumes: the constraint register from constraint-extraction (performance budget constraints, compliance constraints, operational constraints that bound NFR targets) and the risk register from risk-analysis (risks that identify quality levels requiring explicit targets). Every NFR target is grounded in one of three sources: a constraint register entry, explicit stakeholder sign-off, or a named industry benchmark — not plucked from thin air. Produces a structured NFR document that feeds into the architect's performance-modelling, security-architecture, observability-design, and the QE's performance-test-creator.

## When to Use

- After the functional spec is produced — NFRs must be grounded in what the feature does before specifying how well it must do it
- Before architect handoff — performance modelling, security architecture, and observability design all consume NFRs
- Any time a stakeholder uses phrases like "must be fast," "must be secure," or "must always be available" — these are underspecified NFRs that need to become measurable targets

## What This Produces

A structured NFR document with measurable targets across performance, reliability, scalability, availability, security, compliance, observability, usability and accessibility, resource consumption, internationalisation, and operational continuity. Every target is traceable to a constraint register entry, stakeholder sign-off, or named industry benchmark.

## NFR Categories

| Category | Quality attributes covered |
|----------|-----------------------------|
| **Performance** | Response time (typical, near-peak, and worst-case), transaction throughput, batch job duration |
| **Reliability** | Error rate under normal and peak load, mean time between failures (MTBF), mean time to recovery (MTTR), partial-failure behaviour |
| **Scalability** | Concurrent user capacity, data volume growth, throughput growth requirements |
| **Availability** | Uptime SLA, planned maintenance windows, failover RTO/RPO |
| **Security** | Authentication assurance level, authorisation model, data protection at rest and in transit, vulnerability management standards |
| **Compliance** | Regulatory obligations (GDPR, PCI-DSS, HIPAA), data residency, audit log requirements |
| **Observability** | What operational signals the system must produce, their coverage, and the latency within which they must be available — not the tooling or implementation used to collect them |
| **Usability & Accessibility** | Task completion targets, error recovery, accessibility conformance level (e.g. WCAG 2.1 AA) |
| **Resource Consumption** | CPU, memory, storage, and network utilisation budgets under specified load |
| **Internationalisation** | Character encoding, locale-specific formatting, supported locales — apply only where the feature operates across locales or introduces locale-sensitive behaviour |
| **Operational Continuity** | Compatibility with existing consumers and interface contracts, deprecation policy, change communication |

> **Internationalisation applicability:** Apply this category only when the feature operates across locales or introduces locale-sensitive behaviour. If not applicable, explicitly note this in the NFR document so the omission is deliberate, not accidental.

## NFR Identifier Scheme

Every NFR is assigned a unique identifier at the time it is first written. The identifier does not change. All downstream references — performance modelling, load test plans, security architecture — must use this identifier.

> **Format: NFR-[CATEGORY]-[NNN]**
>
> Where `[CATEGORY]` is the three-letter category abbreviation and `[NNN]` is a zero-padded sequence number within that category.

| Category | Abbreviation | Example |
|----------|-------------|---------|
| Performance | PER | NFR-PER-001 |
| Reliability | REL | NFR-REL-001 |
| Scalability | SCA | NFR-SCA-001 |
| Availability | AVA | NFR-AVA-001 |
| Security | SEC | NFR-SEC-001 |
| Compliance | COM | NFR-COM-001 |
| Observability | OBS | NFR-OBS-001 |
| Usability & Accessibility | USA | NFR-USA-001 |
| Resource Consumption | RES | NFR-RES-001 |
| Internationalisation | INT | NFR-INT-001 |
| Operational Continuity | OPC | NFR-OPC-001 |

**Identifier retirement:** If an NFR is removed after sign-off, its identifier is retired — it is not reassigned to a new NFR. Retirement requires the same stakeholder approval as creating the NFR. The retired identifier, original target, retirement rationale, and approver must be recorded in the NFR document's **Retired Identifiers** section.

**Scope:** Identifiers are scoped to a single NFR document (i.e., one feature or change request). NFR-PER-001 in Feature A and NFR-PER-001 in Feature B are different requirements. When a downstream artifact references an NFR from a specific feature document, it must qualify the identifier with the feature or change identifier: `[CHANGE-ID]/NFR-[CATEGORY]-[NNN]` (e.g., `PROJ-1234/NFR-PER-001`). Within the NFR document itself, the short form `NFR-[CATEGORY]-[NNN]` is sufficient.

**Cross-feature consistency:** Because NFR identifiers are scoped per feature, contradictions between NFR documents targeting the same shared service are possible. When a feature's NFR sets a target on a shared service or interface already targeted by another feature's NFR, the BSA must record the cross-feature dependency inline in the affected NFR entry and in the Step 10 assumptions-constraints-scope register, then confirm with the architect that the targets are compatible. Irreconcilable cross-feature targets must be escalated to the product owner for resolution before either NFR document is signed off.

**Document versioning:** The NFR document itself must carry a version number (v1.0 at initial sign-off, incremented on each amendment). Every post-sign-off amendment must record the NFR identifier, the original target value, the new target value, and the approver. Downstream consumers must record which version of the NFR document they acted on.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available — performance budgets, compliance obligations, and SLA commitments bound NFR targets |
| Risk register | `docs/<feature>/requirements-package/analysis/risk-register.md` | If available — risk entries that identify quality levels requiring explicit targets |
| Functional spec | functional-requirements | Yes — NFRs must be scoped to what the feature actually does |
| Permissions-access-control | permissions-access-control (this phase) | Yes — observability and security NFRs must align with the permission model |

## Did Analysis Run?

**Analysis completed** if `docs/<feature>/requirements-package/analysis/constraint-register.md` and `docs/<feature>/requirements-package/analysis/risk-register.md` exist.

If analysis completed → use both artifacts to identify mandatory constraints and risks that require NFR targets.

**Analysis was skipped** if those artifacts do not exist:
- Constraint register absent: elicit hard limits from the **product owner and technical lead** during Step 2; treat limits stated directly by those stakeholders as `stakeholder-confirmed` — they are the authoritative source for business and delivery constraints. Log them in the NFR document's assumptions section **and** in the assumptions-constraints-scope register (Step 10) only where the limit is a claim about how the existing system behaves (e.g., "the current API cannot exceed X requests per second") that has not been verified against the codebase or a prior artifact.
- Risk register absent: elicit which quality levels are business-critical from the **responsible product owner**; treat quality levels stated by the product owner as `stakeholder-confirmed`. Record as an assumption only where the stated level depends on an unverified system-behavior claim — log those in both the NFR document's assumptions section and the Step 10 assumptions-constraints-scope register.

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. SCAN — Identify NFR touchpoints in the feature   │
│     Which capabilities, workflows, data volumes,     │
│     auth decisions, and compliance obligations       │
│     does the feature introduce?                      │
├──────────────────────────────────────────────────────┤
│  2. DERIVE — Set measurable targets                  │
│     Ground every target in: constraint register,     │
│     stakeholder sign-off, or named benchmark         │
├──────────────────────────────────────────────────────┤
│  3. VERIFY — Confirm measurement method              │
│     How will this NFR be verified?                   │
│     Load test, security scan, audit log review       │
├──────────────────────────────────────────────────────┤
│  4. SMART CHECK — Validate every NFR                 │
│     Specific / Measurable / Attainable /             │
│     Relevant / Time-bound  (+Traceable gate)         │
├──────────────────────────────────────────────────────┤
│  5. ASSEMBLE — Populate the NFR template             │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Identify NFR Touchpoints

For each section of the functional spec:
- Which capabilities or workflows does this requirement introduce?
- What data volumes does this feature handle? (New data stored, reads from existing large datasets)
- What new authentication or authorisation decisions does this requirement introduce?
- What new regulatory obligations does this requirement create?
- Which existing published interfaces or contracts does this requirement interact with? Who consumes them?
- Does this requirement introduce a new integration contract that downstream systems will depend on?
- Does the feature present a user interface? If so, what accessibility obligations apply (legal, regulatory, or organisational)?
- Does the feature operate across locales? If so, what locale-sensitive behaviour is introduced?
- Does the feature run on shared or budget-constrained infrastructure where CPU, memory, or storage budgets must be respected?

The scope of NFRs must match the scope of the feature. Do not write system-wide NFRs for a change that only touches one capability.

### Step 2 — Set Measurable Targets

**Before setting any target, consult the constraint register if analysis ran.** The constraint register contains pre-set performance budgets, committed SLA levels, and compliance obligations that bound what targets are achievable. NFR targets must not violate constraint register entries without an explicit escalation and documented stakeholder sign-off. If a proposed target conflicts with a constraint register entry, surface the conflict to the product owner and architect before proceeding — do not silently override the constraint. If no constraint register exists (analysis was skipped), elicit the equivalent limits directly from the product owner and technical lead; treat limits they state as `stakeholder-confirmed`. Record as an assumption only where a stated limit depends on an unverified claim about how the existing system behaves.

**If an NFR conflicts with another NFR** — for example, a security NFR requiring strong encryption degrades a performance NFR target, or an observability NFR adding cross-service signal coverage affects throughput — document the conflict explicitly before proceeding:

> **NFR Conflict:** [NFR-ID-A] requires [X], which conflicts with [NFR-ID-B] because [reason].
> **Resolution options:** [option 1] / [option 2]
> **Decision required from:** [BSA / architect / product owner]
> **Decision recorded:** [outcome and who approved it]

Do not silently favour one NFR over another. Surface all NFR-to-NFR conflicts to the BSA for documented resolution before the NFR document is signed off. Record each conflict entry in the **NFR Conflicts** section of the NFR document (see Step 5).

If resolving a conflict changes the scope or target of a third NFR not party to the original conflict, re-evaluate that NFR against the SMART criteria (Step 4) before proceeding.

Every NFR must have a measurable target **and a context statement**. The following terms are not acceptable without numbers: "fast," "responsive," "low latency," "high availability," "secure," "scalable."

**Context statement (required for every NFR):**
Before writing the target, write one sentence answering: *Why does this matter, and who is affected if it is violated?*

> "This matters because checkout latency directly determines cart abandonment rate. If violated, revenue-generating transactions are abandoned and the business loses measurable revenue per affected session."

The context statement ensures NFRs are not arbitrary thresholds — it forces the BSA to confirm the business reason exists before setting a number. At handoff, architects use the context to make trade-off decisions when the ideal target is not achievable.

**Performance target format:**
> The [capability/workflow name] must return a response within [Xms] in the worst case (99th percentile of all requests) under [Y simultaneous users / Z transactions per minute], as measured by [load test] in the [staging / production] environment, from [release milestone] onward.

**Reliability target format:**
> The [service/feature] must not exceed an error rate of [X%] under [Y simultaneous users / Z transactions per minute] during normal operation. Mean time between failures must be at least [N hours/days]. Mean time to recovery from a detected failure must not exceed [M minutes], as measured by [method] in the [staging / production] environment, from [release milestone] onward.

**Availability target format:**
> The [service/feature] must have at least [X.XX%] uptime measured monthly, excluding planned maintenance windows of no more than [Y hours per month], as reported by [monitoring tool name] over a rolling [N-day] reporting period, effective from [release milestone].

**Security target format:**
> From [release milestone] onward, all access to [capability group] must require identity verification to [required assurance level — e.g., NIST IAL2, organisation-mandated MFA policy] and must be authorised against [authorisation model — e.g., RBAC as defined in the permissions-access-control document]. Data at rest must be protected to [required standard — e.g., AES-256 equivalent or higher]. Data in transit must be protected to [required standard — e.g., TLS 1.2 minimum]. Vulnerability management must comply with [standard — e.g., OWASP Top 10, CVE patch SLA].

> **Note:** Do not specify authentication or encryption mechanisms (e.g., OAuth, JWT, specific cipher suites). Mechanism selection is an architecture decision. State the required assurance level and the standard to be met; the architect selects the mechanism.

**Compliance target format:**
> [Feature name] must comply with [regulation] from [release milestone] onward. Specific obligations: [list]. Audit log entries must be retained for [X years].

**Scalability target format:**
> The [service/feature] must support up to [X simultaneous users / Y transactions per minute / Z data volume] without [referenced performance NFR ID] degrading beyond its stated target, as demonstrated by [load / capacity test] in the [staging / production] environment, from [release milestone] onward.

**Observability target format:**
> From [release milestone] onward, [capability/workflow name] must produce operational signals covering [list of required observable states or events — including access control events as defined in the permissions-access-control document]. Signals must be available for inspection within [X seconds] of occurrence. Gaps in signal coverage constitute a readiness gap (see Step 3).

> **Note:** Do not name a specific monitoring tool, signal format (e.g., trace span, metric), or alert routing destination. These are implementation decisions for the observability-design step. State what must be observable and within what latency.

**Usability & Accessibility target format:**
> From [release milestone] onward, [feature/interface name] must conform to [accessibility standard — e.g., WCAG 2.1 Level AA]. [Specific user task] must be completable by [user group] within [X steps / Y seconds] without requiring [excluded interaction type — e.g., mouse-only interaction]. Error states must provide [recovery guidance description].

**Resource Consumption target format:**
> Under [Y simultaneous users / Z transactions per minute], [service/feature] must not consume more than [X% CPU / Y MB memory / Z GB storage] on [infrastructure type], as measured by [method] in the [staging / production] environment, from [release milestone] onward.

**Internationalisation target format (apply only if this category is in scope):**
> From [release milestone] onward, [feature name] must support [list of locales]. All user-facing text must be externalisable from source code. Date, time, currency, and number formatting must conform to locale conventions for each supported locale. Character encoding must be [standard — e.g., UTF-8] throughout all persistence and transmission boundaries.

**Operational Continuity target format:**
> From [release milestone] onward, [interface / integration contract name] must maintain compatibility with [consumer set / prior version] through [compatibility end date or milestone]. Any removal of or breaking change to a published interface requires a minimum [Y-day] advance notice to consumers before it takes effect.

**Priority assignment (required for every NFR):**

Each NFR must be assigned one of three priority levels. Priority must be confirmed with the responsible product owner or stakeholder — it is not a unilateral BSA decision.

| Priority | Definition |
|----------|------------|
| **Must-have** | Represents a regulatory, contractual, or safety obligation — the system cannot be placed in production with this NFR unmet without explicit documented exception |
| **Should-have** | Failure to meet this NFR is an accepted risk that requires documented product owner sign-off before release |
| **Could-have** | Desirable but not blocking release or requiring sign-off; to be addressed in a subsequent iteration |

> **Release gate note:** Priority classifies the importance of the requirement. Whether an unmet NFR blocks a specific release is a separate release management decision that must not be conflated with priority. A must-have NFR may be deferred to a named future milestone by a documented product owner decision — but the requirement remains must-have and the deferral must be recorded.

**Grounding the target — derivation source (required for every NFR):**

Every NFR target must be derived from one of the following sources, in priority order:

1. **Constraint register** — if a committed SLA or performance budget exists, the target must satisfy it
2. **Stakeholder sign-off** — if no constraint register entry exists, the target must be confirmed explicitly with the responsible product owner, who must acknowledge the business impact of the stated level
3. **Named industry benchmark** — only when neither of the above is available, reference a specific benchmark for the technology and use-case category; document the benchmark source

Record the derivation source in the NFR entry. A target that cannot be traced to one of these three sources must not be accepted.

### Step 3 — Specify Verification Method

Every NFR must have a named verification method:

| NFR type | Verification method |
|----------|---------------------|
| Performance | Load test (specify tool, environment, load profile, and acceptance threshold) |
| Reliability | Load test at target scale with failure injection; error rate and MTTR measured (specify tool, environment, and load profile) |
| Scalability | Load / capacity test at target scale (specify tool, environment, target user count or data volume, and degradation threshold) |
| Availability | Monitoring SLA report (specify the monitoring tool and the reporting period) |
| Security | Penetration test or vulnerability scan against the stated standard (specify scope, standard, and testing organisation or role) |
| Compliance | Audit review or automated compliance scan (specify scope and reviewer) |
| Observability | Signal coverage review — confirm that all required observable states produce a detectable signal within the stated latency, validated in the target environment. Do not specify tool configuration or signal format. |
| Usability & Accessibility | Accessibility audit against the stated conformance standard (specify audit tool and manual review scope); usability testing with representative users if task completion targets are stated |
| Resource Consumption | Capacity test under stated load (specify tool, environment, and measurement method) |
| Internationalisation | Locale-specific functional test covering each supported locale (specify test scope and locales covered) |
| Operational Continuity | Interface compatibility review against declared consumers, deprecation notice log review |

If a verification method requires infrastructure or tooling that does not currently exist, record a readiness gap entry in the following format and embed it in the NFR document under a **Readiness Gaps** section:

> **Gap ID:** RG-[sequence number]
> **Affected NFR:** [NFR identifier — e.g., NFR-PER-001]
> **Missing capability:** [tool, infrastructure, or process that does not exist]
> **Owner:** [team or role responsible for resolving]
> **Resolution required by:** [milestone or date]

Alternatively, raise the missing capability as a new NFR in the Observability or Operational Continuity category. An NFR without a feasible verification method is not verifiable and must not be signed off as complete.

> **Verification environment adequacy:** Before recording a verification method that references a non-production environment, confirm that the environment is sufficiently representative of production load and configuration for the NFR being verified. If the environment is not representative, record this as a readiness gap. An NFR "verified" in an inadequate environment provides false assurance and must not be accepted as passing.

### Step 4 — SMART Self-Check

Before assembling, apply this check to every NFR. Fix any that fail.

| Criterion | Check question | Fix if failing |
|-----------|---------------|----------------|
| **Specific** | Does this NFR target one quality attribute with no ambiguity? | Split combined attributes; one row per criterion |
| **Measurable** | Is the target a number with units? Is the measurement method named? | Replace vague adjectives with numeric thresholds |
| **Attainable** | Is this target achievable given the feature's scope and the constraint register? | If the BSA cannot confirm attainability, escalate to the architect and product owner for a documented decision. Record the open question with a named owner and a resolution deadline. Do not proceed to Step 5 with an unresolved attainability question. |
| **Relevant** | Is there a context statement explaining why this matters and who is affected? | Write the context statement before accepting the NFR |
| **Time-bound** | Is this NFR tied to a named release milestone or deployment boundary by which it must be met? For ongoing SLA constraints, is the effective start point stated? | Add the target milestone or release phase |

Additionally, confirm the following traceability check for each NFR before proceeding to Step 5. This check is a required gate but is not part of the SMART acronym:

| Additional check | Check question | Fix if failing |
|------------------|---------------|----------------|
| **Traceable** | Does this NFR link to a specific functional requirement ID, stakeholder concern, or compliance obligation? Is that link recorded inline in the NFR entry itself? | Add the traceability link directly in the NFR entry text. If no source can be identified, remove the NFR. |

Any NFR that cannot answer all five SMART criteria plus the Traceable check satisfactorily must be revised before proceeding to Step 5.

### Step 5 — Assemble

Populate the `nonfunctional-requirements` template. The document has the following top-level sections, in this order:

1. **NFR entries** — grouped by category (Performance, Reliability, Scalability, Availability, Security, Compliance, Observability, Usability & Accessibility, Resource Consumption, Internationalisation, Operational Continuity)
2. **Readiness Gaps** — all RG-[NNN] entries from Step 3. Omit if none.
3. **NFR Conflicts** — all conflict entries from Step 2 with their recorded resolution decisions. Omit if none.
4. **Assumptions** — all elicited constraints treated as assumptions from the "Did Analysis Run?" fallback. Omit if none.
5. **Retired Identifiers** — all retired NFR identifiers with original target, retirement rationale, and approver. Omit if none.

**Canonical NFR entry structure:**

Every NFR entry in the document must contain all of the following fields. An entry missing any field is incomplete and must not be signed off.

```
**[NFR-CATEGORY-NNN]** [Category name]
**Context:** [One sentence: why this matters and who is affected if violated]
**Target:** [Measurable target in the format specified for this category in Step 2]
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [product owner name / role, date]
**Derivation source:** [Constraint register entry ID / Stakeholder sign-off — name and date / Named benchmark — source and URL]
**Traceability:** [Functional requirement ID / stakeholder concern / compliance obligation]
**Verification method:** [Method, environment, and acceptance threshold]
**Acceptance criteria:**
  AC-NFR-CAT-NNN-1: [Short description]
  Given: [the system under the specified load/condition]
  When:  [the measured action or event occurs]
  Then:  [the measurable outcome meets the stated target — include the numeric threshold]
**Release milestone:** [Named milestone or effective start date]
```

Example entry:

```
**NFR-PER-001** Performance
**Context:** Checkout latency directly determines cart abandonment rate. If violated, revenue-generating
transactions are abandoned and measurable revenue is lost per affected session.
**Target:** The checkout workflow must return a response within 400ms at the 99th percentile under
500 simultaneous users, as measured by load test in the staging environment.
**Priority:** Must-have — confirmed by Jane Smith (Product Owner), 2024-03-15
**Derivation source:** Constraint register entry CR-007 (checkout SLA commitment to enterprise tier customers)
**Traceability:** FR-012 (checkout capability); commercial SLA contract clause 4.3
**Verification method:** Load test in staging environment, 500 virtual users, 30-minute sustained load,
p99 < 400ms pass threshold. Staging environment adequacy confirmed: mirrors production load balancer
configuration and database replica count.
**Acceptance criteria:**
  AC-NFR-PER-001-1: Checkout latency under target load
  Given: 500 simultaneous users performing the checkout workflow in the staging environment
  When:  Checkout requests are sustained for 30 minutes
  Then:  The 99th percentile response time is at or below 400ms
**Release milestone:** Release 2.4
```

**Acceptance criteria for every NFR:** Every NFR must have at least one acceptance criterion written inline at the time the NFR is authored — not deferred to a later phase. The AC translates the NFR's measurable target into a concrete Given/When/Then scenario that a test can execute. It is distinct from the verification method: the verification method describes HOW to test (tool, environment, load profile); the AC describes WHAT the pass/fail condition is.

**AC ID scheme:** `AC-NFR-[CATEGORY]-NNN-N` — e.g., `AC-NFR-PER-001-1`. The NFR-CATEGORY-NNN portion matches the NFR identifier. IDs are unique and permanent.

**AC rules for NFRs:**
- Every NFR must have at least one AC specifying the pass/fail threshold in Given/When/Then format.
- Performance, reliability, scalability, and resource consumption NFRs must include specific numeric thresholds in the `Then` clause — the same numbers from the `Target` field, restated as a testable condition.
- Availability NFRs must specify the measurement period and the threshold (e.g., "Then uptime is at or above 99.9% over the 30-day reporting period").
- Security and compliance NFRs must specify the standard or audit criteria that constitutes a pass.
- Observability NFRs must specify what signals must be detectable and within what latency.
- If a readiness gap (RG-NNN) prevents verification, the AC is still written — it records the intended pass condition even when the verification environment does not yet exist. The readiness gap tracks the blocker.

**Error-path assessment for NFRs — degraded-mode behavior:**

The threshold ACs above verify that the system meets its NFR targets under stated conditions. They do not define what the system does when a target is breached. Every NFR must be assessed for whether a degraded-mode AC is required:

1. **Performance, reliability, and availability NFRs:** These almost always require a degraded-mode AC. Write at least one AC specifying the required system behavior when the target is breached: "Given [the system is operating beyond the stated load / a failure has occurred], When [the NFR target is breached], Then [the system does X — returns a degraded response within Y ms / sheds load by rejecting lowest-priority requests / activates circuit breaker / serves cached content]." If the only acceptable behavior is total failure (no graceful degradation), state `Degraded mode: Not applicable — target breach is a total failure; no graceful degradation is required` inline.

2. **Security and compliance NFRs:** Degraded-mode behavior is rarely acceptable. If a security standard cannot be met, the system should deny access or halt the operation, not degrade gracefully. Write `Degraded mode: Not applicable — security/compliance target breach requires fail-closed behavior` inline unless the stakeholder has explicitly approved a degraded security posture for a specific scenario.

3. **Observability, usability, resource consumption, internationalisation, and operational continuity NFRs:** Assess on a case-by-case basis. If breaching the target has a defined fallback (e.g., locale formatting falls back to a default locale), write a degraded-mode AC. If no fallback exists or makes sense, state the determination explicitly.

## Output

A populated **nonfunctional-requirements** document (use the template at `../assets/nonfunctional-requirements.md`).

### File Output

Write the completed nonfunctional requirements to `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md`.

The NFR document must carry a version number (v1.0 at initial sign-off). Every post-sign-off amendment must increment the version and record: the NFR identifier, the original target value, the new target value, and the approver. Downstream consumers must record which version of the NFR document they acted on.

The NFR document is consumed by:
- **Requirements package** — embedded in full as a section of the deliverable
- **Architect — performance-modelling** — uses Performance, Reliability, and Scalability NFRs to size infrastructure and validate architecture decisions
- **Architect — security-architecture** — uses Security and Compliance NFRs to specify controls and audit requirements
- **Architect — observability-design** — uses Observability requirements to specify monitoring pipelines, notification rules, and dashboards
- **QE — performance-test-creator** — uses Performance, Reliability, and Scalability NFRs to define load test profiles, acceptance thresholds, and environments
- **Step 10 (assumptions-constraints-scope)** — NFR assumptions and constraint conflicts are carried forward

All downstream consumers reference individual NFRs by their NFR identifier (e.g., NFR-PER-001) and the NFR document version they consulted. Any change to an NFR target after sign-off requires a documented amendment recording the NFR identifier, the original value, the new value, and the approver.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| "Must be fast" NFRs that the developer interprets differently from the architect | Step 2 forces every NFR into a measurable format before it is written |
| NFR targets with no grounding — arbitrary numbers that nobody can defend | Step 2 requires every target to be traced to a constraint register entry, stakeholder sign-off, or named benchmark |
| Security NFRs that mandate an implementation mechanism rather than an assurance level | Step 2 security target format explicitly prohibits mechanism specification and requires an assurance level and standard instead |
| Security requirements that are vague or untestable | Step 2 security target format and Step 3 verification method requirement force specificity |
| Observability NFRs that specify tooling and alert routing instead of what must be observable | Step 2 observability target format prohibits tool and routing specification; those decisions belong to observability-design |
| NFRs that cannot be verified because the required signal coverage does not exist | Step 3 verification method specification forces the gap to be identified during requirements, not after release |
| NFRs "verified" in an environment that does not represent production | Step 3 environment adequacy check forces a readiness gap entry when the environment is insufficient |
| Interface contracts degrade silently because operational continuity was never specified | Operational Continuity requirements in Step 2 with explicit compatibility targets and deprecation policies prevent silent degradation |
| NFR-to-NFR conflicts carry forward unresolved | Step 2 requires every conflict to be documented and resolved before the document is signed off |
| Conflict resolution inadvertently breaks a third NFR | Step 2 requires re-evaluation of any NFR whose scope or target is affected by a conflict resolution |
| Accessibility obligations identified after implementation | Usability & Accessibility category ensures conformance level is a stated requirement from the start |
| NFR identifiers retired without audit trail or approval | Identifier retirement governance requires stakeholder approval and a retired identifiers log |
| Downstream consumers act on a superseded NFR target | Document versioning and the requirement to record which version was consulted prevent silent target drift |

## Hand-off Gate

**Position in sequence: Step 9 of 10 in the requirements workflow.** The step numbers in the requirements workflow (Step 9) and the internal workflow steps above (Steps 1–5) are two independent counting schemes. Workflow steps count position in the full requirements sequence; internal steps count the stages within this skill only.

This skill runs strictly after Step 8 (permissions-access-control) is complete and acknowledged. Do not begin until the permissions-access-control document has been presented and explicitly acknowledged by the BSA. No parallel execution — every prior step's output is a dependency.

**Why Step 8 must precede this step:** The permissions model may introduce activity recording and observability obligations that directly create new Observability requirements. Running NFRs before permissions are defined risks producing an observability section that does not cover access control events.

**Required inputs confirmed present before proceeding:**
- functional-requirements (Step 5) — NFR scope is derived from the feature's capabilities and workflows
- permissions-access-control (Step 8) — observability and security NFRs must align with the permission model

Before proceeding to Step 10:
1. Write the completed NFR document in full — every NFR with its NFR identifier, measurable target, context statement, measurement method, verification environment, traceability link, release milestone, priority, and derivation source.
2. Present it to the **reviewing stakeholder** — a named product owner or delegated domain expert who is not the BSA who authored the document. The author of a document cannot be its sign-off authority.
3. Receive explicit acknowledgement — defined as the reviewing stakeholder's recorded approval (written comment, signed review, or system-recorded approval action) that explicitly names the individual, states the NFR document version being approved, and confirms that all NFR targets have been reviewed.

NFRs with unavailable verification tooling must be explicitly flagged as readiness gaps before proceeding.

---

## Completion Criteria

- [ ] Every NFR has a unique NFR identifier (NFR-[CATEGORY]-[NNN])
- [ ] Every NFR has a measurable target with units — no vague quality adjectives
- [ ] Every NFR has a context statement explaining why it matters and who is affected
- [ ] Every NFR specifies the measurement method and environment
- [ ] Every NFR is tied to a named release milestone or states an effective start point for ongoing SLA constraints
- [ ] Every NFR target is traced to a constraint register entry, stakeholder sign-off, or named industry benchmark — the derivation source is recorded in the NFR entry
- [ ] SMART self-check (Step 4) passed for every NFR — all five SMART criteria satisfied, plus the Traceable check passed with the traceability link recorded inline in the NFR entry
- [ ] Every NFR has a named verification method
- [ ] Verification environment adequacy confirmed for every NFR referencing a non-production environment — if inadequate, a readiness gap entry (RG-[NNN]) exists
- [ ] NFRs requiring unavailable tooling or infrastructure are flagged as readiness gaps with a complete RG-[NNN] entry in the Readiness Gaps section
- [ ] Every NFR has a priority (must-have, should-have, or could-have) confirmed with the responsible product owner or stakeholder
- [ ] All NFR-to-NFR conflicts are documented with a recorded resolution decision before sign-off
- [ ] If analysis ran, all NFR targets are checked against the constraint register — no target violates a constraint register entry without documented escalation and stakeholder sign-off
- [ ] Security NFRs state assurance levels and standards — no authentication or encryption mechanism is specified
- [ ] Observability NFRs state what must be observable and within what latency — no specific tool, signal format, or alert routing destination is specified
- [ ] Usability & Accessibility NFRs are present for every feature that presents a user interface — accessibility conformance level is stated, or the category is explicitly noted as not applicable with a reason
- [ ] Resource Consumption NFRs are present where the feature operates on shared or budget-constrained infrastructure, or the category is explicitly noted as not applicable with a reason
- [ ] Internationalisation NFRs are present where the feature operates across locales, or the category is explicitly noted as not applicable with a reason
- [ ] All assumptions from skipped analysis are recorded in the NFR document's assumptions section and flagged for the Step 10 assumptions-constraints-scope register
- [ ] NFR document carries a version number; any post-sign-off amendments record NFR identifier, original value, new value, and approver
- [ ] Sign-off reviewer is a named individual distinct from the BSA who authored the document; explicit acknowledgement records the reviewer's name and the document version approved
- [ ] Every NFR has at least one inline acceptance criterion in Given/When/Then format with a numeric threshold in the `Then` clause matching the NFR target
- [ ] Every performance, reliability, and availability NFR has a degraded-mode AC specifying the required system behavior when the target is breached, or states `Degraded mode: Not applicable — [reason]`
- [ ] Every security and compliance NFR states `Degraded mode: Not applicable — security/compliance target breach requires fail-closed behavior` unless a degraded posture is explicitly stakeholder-approved
- [ ] AC IDs follow the `AC-NFR-[CATEGORY]-NNN-N` scheme and are unique within the document
- [ ] All retired NFR identifiers are recorded in the Retired Identifiers section with original target, retirement rationale, and approver
