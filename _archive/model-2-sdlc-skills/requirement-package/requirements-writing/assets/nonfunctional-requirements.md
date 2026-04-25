# Non-Functional Requirements

> **Project:** [project name]
> **Change request:** [brief description]
> **Version:** [v1.0]
> **Date:** [date]

---

## Summary Counts

| Category | Total |
|----------|-------|
| Performance (PER) | |
| Reliability (REL) | |
| Scalability (SCA) | |
| Availability (AVA) | |
| Security (SEC) | |
| Compliance (COM) | |
| Observability (OBS) | |
| Usability & Accessibility (USA) | |
| Resource Consumption (RES) | |
| Internationalisation (INT) | |
| Operational Continuity (OPC) | |
| **Total** | |

---

## NFR Entry Format

Every entry in this document uses the following structure. An entry missing any field is incomplete and must not be signed off.

```
**[NFR-CATEGORY-NNN]** [Category name]
**Context:** [One sentence: why this matters and who is affected if violated]
**Target:** [Measurable target in the format specified for this category]
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [product owner name / role, date]
**Derivation source:** [Constraint register entry ID / Stakeholder sign-off — name and date / Named benchmark — source and URL]
**Traceability:** [Functional requirement ID / stakeholder concern / compliance obligation]
**Verification method:** [Method, environment, and acceptance threshold — including environment adequacy confirmation for non-production environments]
**Acceptance criteria:**
  AC-NFR-CAT-NNN-1: [Short description]
  Given: [the system under the specified load/condition]
  When:  [the measured action or event occurs]
  Then:  [the measurable outcome meets the stated target — include the numeric threshold]
**Release milestone:** [Named milestone or effective start date]
```

---

## Performance Requirements

```
**NFR-PER-001** Performance
**Context:** [why checkout / workflow latency matters and who is affected if violated]
**Target:** The [capability/workflow name] must return a response within [Xms] in the worst case (99th percentile of all requests) under [Y simultaneous users / Z transactions per minute], as measured by [load test] in the [staging / production] environment, from [release milestone] onward.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off / Named benchmark]
**Traceability:** [FR-xxx / stakeholder concern / compliance obligation]
**Verification method:** [Load test — tool, environment, load profile, acceptance threshold. Environment adequacy: [confirmed / readiness gap RG-NNN]]
**Acceptance criteria:**
  AC-NFR-PER-001-1: [Response time under target load]
  Given: [Y simultaneous users / Z transactions per minute] in the [staging / production] environment
  When:  [capability/workflow name] requests are sustained for the test duration
  Then:  The 99th percentile response time is at or below [Xms]
**Release milestone:** [milestone]
```

---

## Reliability Requirements

```
**NFR-REL-001** Reliability
**Context:** [why reliability matters and who is affected if violated]
**Target:** The [service/feature] must not exceed an error rate of [X%] under [Y simultaneous users / Z transactions per minute] during normal operation. Mean time between failures must be at least [N hours/days]. Mean time to recovery from a detected failure must not exceed [M minutes], as measured by [method] in the [staging / production] environment, from [release milestone] onward.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off / Named benchmark]
**Traceability:** [FR-xxx / stakeholder concern / compliance obligation]
**Verification method:** [Load test at target scale with failure injection — tool, environment, load profile. Environment adequacy: [confirmed / readiness gap RG-NNN]]
**Acceptance criteria:**
  AC-NFR-REL-001-1: [Error rate within threshold]
  Given: [Y simultaneous users / Z transactions per minute] under normal operation
  When:  The [service/feature] processes requests for the test duration
  Then:  The error rate does not exceed [X%]

  AC-NFR-REL-001-2: [Recovery within MTTR]
  Given: A detected failure in the [service/feature]
  When:  Automatic or manual recovery is initiated
  Then:  The service is restored within [M minutes]
**Release milestone:** [milestone]
```

---

## Scalability Requirements

```
**NFR-SCA-001** Scalability
**Context:** [why scalability matters and who is affected if violated]
**Target:** The [service/feature] must support up to [X simultaneous users / Y transactions per minute / Z data volume] without [referenced NFR-PER-xxx] degrading beyond its stated target, as demonstrated by [load / capacity test] in the [staging / production] environment, from [release milestone] onward.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off / Named benchmark]
**Traceability:** [FR-xxx / stakeholder concern / compliance obligation]
**Verification method:** [Load / capacity test — tool, environment, target user count or data volume, degradation threshold. Environment adequacy: [confirmed / readiness gap RG-NNN]]
**Acceptance criteria:**
  AC-NFR-SCA-001-1: [Performance maintained at scale]
  Given: [X simultaneous users / Y transactions per minute / Z data volume]
  When:  The [service/feature] processes requests at scale
  Then:  [referenced NFR-PER-xxx] remains within its stated target
**Release milestone:** [milestone]
```

---

## Availability Requirements

```
**NFR-AVA-001** Availability
**Context:** [why availability matters and who is affected if violated]
**Target:** The [service/feature] must have at least [X.XX%] uptime measured monthly, excluding planned maintenance windows of no more than [Y hours per month], as reported by [monitoring tool name] over a rolling [N-day] reporting period, effective from [release milestone].
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / SLA commitment / compliance obligation]
**Verification method:** [Service availability monitoring report — tool and reporting period]
**Acceptance criteria:**
  AC-NFR-AVA-001-1: [Uptime meets SLA]
  Given: A rolling [N-day] reporting period, excluding planned maintenance windows
  When:  Uptime is calculated from the monitoring report
  Then:  Availability is at or above [X.XX%]
**Release milestone:** [milestone]
```

```
**NFR-AVA-002** Availability — Recovery Time
**Context:** [why recovery time matters and who is affected]
**Target:** The [service/feature] must recover from a detected failure within [X hours] (Recovery Time Objective), as validated by [recovery validation method] in the [staging / production] environment, from [release milestone] onward.
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / SLA commitment]
**Verification method:** [Recovery validation — environment, method]
**Acceptance criteria:**
  AC-NFR-AVA-002-1: [Recovery within RTO]
  Given: A detected failure in the [service/feature]
  When:  Recovery procedures are initiated
  Then:  Full service is restored within [X hours]
**Release milestone:** [milestone]
```

```
**NFR-AVA-003** Availability — Recovery Point
**Context:** [why data loss tolerance matters and who is affected]
**Target:** The [service/feature] must not lose more than [X hours] of data in the event of a failure (Recovery Point Objective), as verified by [backup verification method] in the [staging / production] environment, from [release milestone] onward.
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / SLA commitment]
**Verification method:** [Backup verification — environment, method]
**Acceptance criteria:**
  AC-NFR-AVA-003-1: [Data loss within RPO]
  Given: A failure event in the [service/feature]
  When:  Data is restored from backup
  Then:  No more than [X hours] of data is lost
**Release milestone:** [milestone]
```

---

## Security Requirements

*Do not specify authentication or encryption mechanisms (e.g., OAuth, JWT, specific cipher suites). State the required assurance level and the standard to be met.*

```
**NFR-SEC-001** Security — Identity Verification
**Context:** [why identity verification matters and who is affected if violated]
**Target:** From [release milestone] onward, all access to [capability group] must require identity verification to [required assurance level — e.g., NIST IAL2, organisation-mandated MFA policy] and must be authorised against [authorisation model — e.g., RBAC as defined in the permissions-access-control document].
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / compliance obligation]
**Verification method:** [Security review / independent security assessment — scope and testing organisation]
**Acceptance criteria:**
  AC-NFR-SEC-001-1: [Unauthenticated access rejected]
  Given: A request to [capability group] without valid identity credentials
  When:  The access attempt is made
  Then:  Access is denied with the appropriate response (as defined in permissions-access-control)

  AC-NFR-SEC-001-2: [Authenticated access permitted]
  Given: A request to [capability group] with valid identity credentials meeting [required assurance level]
  When:  The access attempt is made
  Then:  Access is granted per the [authorisation model] rules
**Release milestone:** [milestone]
```

```
**NFR-SEC-002** Security — Data Protection at Rest
**Context:** [why data protection at rest matters and who is affected if violated]
**Target:** From [release milestone] onward, data at rest must be protected to [required standard — e.g., AES-256 equivalent or higher].
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / compliance obligation]
**Verification method:** [Security review — scope and reviewer]
**Acceptance criteria:**
  AC-NFR-SEC-002-1: [Data at rest encrypted to standard]
  Given: Data stored by the [service/feature]
  When:  A security review inspects the storage layer
  Then:  All data at rest is protected to [required standard] or higher
**Release milestone:** [milestone]
```

```
**NFR-SEC-003** Security — Data Protection in Transit
**Context:** [why data protection in transit matters and who is affected if violated]
**Target:** From [release milestone] onward, data in transit must be protected to [required standard — e.g., TLS 1.2 minimum].
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / compliance obligation]
**Verification method:** [Security verification — scope and reviewer]
**Acceptance criteria:**
  AC-NFR-SEC-003-1: [Data in transit encrypted to standard]
  Given: Data transmitted to or from the [service/feature]
  When:  A security review inspects the transport layer
  Then:  All data in transit is protected to [required standard] or higher
**Release milestone:** [milestone]
```

```
**NFR-SEC-004** Security — Vulnerability Management
**Context:** [why vulnerability management matters and who is affected if violated]
**Target:** From [release milestone] onward, vulnerability management must comply with [standard — e.g., OWASP Top 10, CVE patch SLA]. No critical or high vulnerabilities present at time of release.
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / compliance obligation]
**Verification method:** [Penetration test or vulnerability scan — scope, standard, and testing organisation]
**Acceptance criteria:**
  AC-NFR-SEC-004-1: [No critical/high vulnerabilities at release]
  Given: The [service/feature] scanned against [standard]
  When:  A vulnerability scan or penetration test is completed
  Then:  Zero critical or high severity vulnerabilities are present
**Release milestone:** [milestone]
```

---

## Compliance Requirements

```
**NFR-COM-001** Compliance — [Regulation / Policy name]
**Context:** [why compliance matters and who is affected if violated]
**Target:** [Feature name] must comply with [regulation] from [release milestone] onward. Specific obligations: [list]. Audit log entries must be retained for [X years].
**Priority:** Must-have — confirmed by [name, date]
**Derivation source:** [Regulation article / constraint register entry]
**Traceability:** [FR-xxx / regulatory obligation]
**Verification method:** [Compliance audit or automated compliance scan — scope and reviewer]
**Acceptance criteria:**
  AC-NFR-COM-001-1: [Compliance obligations met]
  Given: The [feature name] in production from [release milestone]
  When:  A compliance audit is conducted against [regulation]
  Then:  All specific obligations [list] are satisfied and audit logs are retained for [X years]
**Release milestone:** [milestone]
```

---

## Observability Requirements

*Do not name a specific monitoring tool, signal format, or alert routing destination. State what must be observable and within what latency.*

```
**NFR-OBS-001** Observability
**Context:** [why observability matters and who is affected if violated]
**Target:** From [release milestone] onward, [capability/workflow name] must produce operational signals covering [list of required observable states or events — including access control events as defined in the permissions-access-control document]. Signals must be available for inspection within [X seconds] of occurrence.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / audit requirement / compliance obligation]
**Verification method:** [Signal coverage review — confirm all required observable states produce a detectable signal within the stated latency, validated in the [target environment]. Environment adequacy: [confirmed / readiness gap RG-NNN]]
**Acceptance criteria:**
  AC-NFR-OBS-001-1: [Required signals produced]
  Given: [capability/workflow name] processing requests in the [target environment]
  When:  Each required observable state or event occurs
  Then:  A detectable signal is produced and available for inspection within [X seconds]
**Release milestone:** [milestone]
```

---

## Usability & Accessibility Requirements

*If this category does not apply because the feature presents no user interface, write: "Usability & Accessibility — Not applicable: [reason]. Omission is deliberate, not accidental."*

```
**NFR-USA-001** Usability & Accessibility
**Context:** [why usability and accessibility matters and who is affected if violated]
**Target:** From [release milestone] onward, [feature/interface name] must conform to [accessibility standard — e.g., WCAG 2.1 Level AA]. [Specific user task] must be completable by [user group] within [X steps / Y seconds] without requiring [excluded interaction type — e.g., mouse-only interaction]. Error states must provide [recovery guidance description].
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Legal / regulatory requirement / Stakeholder sign-off]
**Traceability:** [FR-xxx / accessibility legal obligation]
**Verification method:** [Accessibility audit against the stated conformance standard — audit tool and manual review scope; usability testing with representative users if task completion targets are stated]
**Acceptance criteria:**
  AC-NFR-USA-001-1: [Accessibility conformance]
  Given: The [feature/interface name] audited against [accessibility standard]
  When:  An accessibility audit is completed
  Then:  The interface conforms to [accessibility standard] with no critical failures

  AC-NFR-USA-001-2: [Task completion within target]
  Given: A representative user from [user group] performing [specific user task]
  When:  The task is attempted
  Then:  The task is completable within [X steps / Y seconds] without requiring [excluded interaction type]
**Release milestone:** [milestone]
```

---

## Resource Consumption Requirements

*If this category does not apply because the feature does not operate on shared or budget-constrained infrastructure, write: "Resource Consumption — Not applicable: [reason]. Omission is deliberate, not accidental."*

```
**NFR-RES-001** Resource Consumption
**Context:** [why resource consumption limits matter and who is affected if violated]
**Target:** Under [Y simultaneous users / Z transactions per minute], [service/feature] must not consume more than [X% CPU / Y MB memory / Z GB storage] on [infrastructure type], as measured by [method] in the [staging / production] environment, from [release milestone] onward.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off / Named benchmark]
**Traceability:** [FR-xxx / infrastructure constraint]
**Verification method:** [Capacity test under stated load — tool, environment, and measurement method. Environment adequacy: [confirmed / readiness gap RG-NNN]]
**Acceptance criteria:**
  AC-NFR-RES-001-1: [Resource consumption within budget]
  Given: [Y simultaneous users / Z transactions per minute] on [infrastructure type]
  When:  The [service/feature] operates under sustained load
  Then:  CPU does not exceed [X%], memory does not exceed [Y MB], storage does not exceed [Z GB]
**Release milestone:** [milestone]
```

---

## Internationalisation Requirements

*Apply only when the feature operates across locales or introduces locale-sensitive behaviour. If not applicable, write: "Internationalisation — Not applicable: [reason]. Omission is deliberate, not accidental."*

```
**NFR-INT-001** Internationalisation
**Context:** [why internationalisation matters and who is affected if violated]
**Target:** From [release milestone] onward, [feature name] must support [list of locales]. All user-facing text must be externalisable from source code. Date, time, currency, and number formatting must conform to locale conventions for each supported locale. Character encoding must be [standard — e.g., UTF-8] throughout all persistence and transmission boundaries.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / localisation requirement]
**Verification method:** [Locale-specific functional test covering each supported locale — test scope and locales covered]
**Acceptance criteria:**
  AC-NFR-INT-001-1: [Locale-specific formatting]
  Given: The [feature name] operating in locale [specific locale from list]
  When:  Date, time, currency, and number values are displayed
  Then:  All values conform to the locale conventions for [specific locale]
**Release milestone:** [milestone]
```

---

## Operational Continuity Requirements

```
**NFR-OPC-001** Operational Continuity
**Context:** [why operational continuity matters and who is affected if violated]
**Target:** From [release milestone] onward, [interface / integration contract name] must maintain compatibility with [consumer set / prior version] through [compatibility end date or milestone]. Any removal of or breaking change to a published interface requires a minimum [Y-day] advance notice to consumers before it takes effect.
**Priority:** [Must-have / Should-have / Could-have] — confirmed by [name, date]
**Derivation source:** [Constraint register entry / Stakeholder sign-off]
**Traceability:** [FR-xxx / downstream consumer dependency]
**Verification method:** [Interface compatibility review against declared consumers; deprecation notice log review]
**Acceptance criteria:**
  AC-NFR-OPC-001-1: [Backward compatibility maintained]
  Given: [consumer set / prior version] consuming the [interface / integration contract name]
  When:  The updated [service/feature] is deployed
  Then:  All existing consumers continue to operate without modification through [compatibility end date]
**Release milestone:** [milestone]
```

---

## Readiness Gaps

NFRs that cannot be verified because required tooling or infrastructure does not yet exist.

| Gap ID | Affected NFR | Missing Capability | Owner | Resolution Required By |
|--------|-------------|-------------------|-------|----------------------|
| RG-001 | [NFR-xxx] | [what tool, infrastructure, or process is missing] | [team or role] | [milestone or date] |

*If no readiness gaps, write: No readiness gaps identified.*

---

## NFR Conflicts

NFR-to-NFR conflicts identified during derivation, with recorded resolution decisions.

| Conflict | NFRs Involved | Resolution | Approved By |
|----------|--------------|------------|-------------|
| [description of conflict] | [NFR-ID-A] vs [NFR-ID-B] | [outcome] | [approver] |

*If no conflicts, write: No NFR conflicts identified.*

---

## Assumptions

Elicited constraints treated as assumptions when analysis was skipped. Omit this section if analysis ran.

| # | Assumption | Risk if Wrong | Owner | Target Verification Date |
|---|-----------|--------------|-------|------------------------|
| 1 | [constraint elicited from stakeholder without constraint register backing] | [consequence] | [owner] | [date] |

---

## Retired Identifiers

NFR identifiers retired after sign-off. Retired IDs are not reused. Omit this section if no identifiers have been retired.

| Retired ID | Original Target | Retirement Rationale | Approved By | Date Retired |
|-----------|----------------|---------------------|-------------|-------------|
| NFR-xxx | [original target value] | [why this NFR was removed] | [approver] | [date] |
