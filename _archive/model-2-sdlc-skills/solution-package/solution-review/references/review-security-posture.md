# Review — Security Posture

## Purpose

Adversarial security review of the solution design package — evaluates threat model, authentication and authorization design, data protection, attack surface, input validation strategy, secrets management, and trust boundaries. Includes a conditional compliance section that activates when the requirements package identifies regulatory constraints (GDPR, HIPAA, SOC2, PCI-DSS). Reviews security at the design level — not code-level patterns, but whether the architectural decisions create a secure system. Uses the adversarial review technique: the reviewer must find security issues. Consumes the assembled solution-package.md, with particular focus on the security design (Section 9), API design (Section 7), integration design (Section 8), data model design (Section 6), and frontend design (Section 4). Runs after review-architecture and before review-solution-readiness.

## What This Produces

A structured security findings report that identifies design-level security vulnerabilities, gaps, and risks in the solution design package. The report categorizes findings by severity, maps each to the affected design section(s), and provides actionable remediation recommendations.

This review evaluates the **design** for security — not code patterns. It answers: "given these architectural decisions, can the system be built securely?" It catches issues like: authentication designed for one endpoint but missing on another, data classified as sensitive in the data model but not encrypted in the integration design, RBAC rules that conflict between the API and backend sections.

**What this review covers:**

| Security Domain | What the Review Checks |
|-----------------|----------------------|
| **Authentication** | Are all entry points protected? Is the auth flow consistent across frontend, API, and backend? Are token lifecycle decisions sound (storage, expiry, refresh, revocation)? |
| **Authorization / RBAC** | Do permission definitions in the requirements match the access control design? Are there endpoints or operations missing authorization checks? Can privilege escalation occur? |
| **Data protection** | Is sensitive data identified and consistently protected across all sections? Is encryption at rest and in transit specified where needed? Is PII handling consistent? |
| **Attack surface** | What entry points exist? Are they all accounted for in the security design? Are external-facing APIs minimized? Are unnecessary endpoints exposed? |
| **Input validation** | Is input validation designed at the right layer? Are validation rules consistent between frontend and backend? Are file uploads, query parameters, and request bodies validated? |
| **Secrets management** | Are new credentials, API keys, and tokens managed through the defined secrets infrastructure? Are there design decisions that would require hardcoded secrets? |
| **Trust boundaries** | Are trust boundaries explicitly identified? Does data cross trust boundaries safely? Are service-to-service communications authenticated? |
| **Dependency security** | Do new external dependencies introduce known risk categories? Are third-party integrations sandboxed appropriately? |
| **Compliance** | *(Conditional — see below)* Do design decisions satisfy regulatory requirements identified in the requirements package? |

**What this review does NOT cover:**

| Concern | Where It Is Reviewed |
|---------|---------------------|
| Architectural structure, scalability, resilience, maintainability | `review-architecture` |
| Code-level security patterns (SQL injection prevention, XSS sanitization, CSRF tokens) | Implementation phase — code review |
| Package completeness and handoff readiness | `review-solution-readiness` |

## When to Use

- Always — every solution design package receives a security posture review
- Runs after `review-architecture` and before `review-solution-readiness`
- Even if Section 9 (Security Design) was marked "not applicable" in the scoping step, this review still checks that the remaining sections do not inadvertently introduce security concerns

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Assembled solution design package | `docs/<feature>/solutions-package/solution-package.md` | Yes |
| Requirements package — permissions-access-control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` — roles, permissions, access control rules | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — security-related NFRs | Yes |
| Requirements package — assumptions/constraints | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — regulatory and compliance constraints (GDPR, HIPAA, SOC2, PCI-DSS) | If compliance constraints exist |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — existing security architecture, auth model, encryption standards | If discovery ran |
| Architecture review findings | Output from `review-architecture` — any security-adjacent findings (e.g., trust boundary gaps, missing auth) | Yes |

> **Missing input guard:** If any required input cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with the security posture review because [artifact name] was not found at `[expected path]`. Please ensure the artifact exists before running this review."*

## Compliance Activation

The compliance review section activates **only when the requirements package identifies regulatory constraints**. Check:

1. Read the requirements package `assumptions-constraints-scope` section (`docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md`) for mentions of GDPR, HIPAA, SOC2, PCI-DSS, CCPA, or other regulatory frameworks.
2. Read the requirements package NFRs for compliance-related requirements.
3. If regulatory constraints exist → activate the compliance section (Step 8 below).
4. If no regulatory constraints exist → skip Step 8, note "No regulatory constraints identified in the requirements package" in the output.

## Adversarial Review Technique

Same rules as `review-architecture` — the reviewer must find security issues:

1. You must find issues. Zero findings triggers re-analysis.
2. Adopt a paranoid stance — assume the system will be attacked.
3. Think like an attacker: "If I wanted to break into this system, where would I start?"
4. Look for what is **missing** — security gaps are more dangerous than security bugs.
5. Check for **inconsistencies** — the same security rule designed differently in two sections is a vulnerability.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  SECURITY POSTURE REVIEW — INTERNAL SEQUENCE                     │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read solution package + requirements + baseline       │
│     Focus on Sections 4, 6, 7, 8, 9; note arch review findings  │
├──────────────────────────────────────────────────────────────────┤
│  2. AUTHENTICATION — Review auth flow end-to-end                 │
│     Every entry point, token lifecycle, session management       │
├──────────────────────────────────────────────────────────────────┤
│  3. AUTHORIZATION — Review access control design                 │
│     RBAC completeness, privilege escalation, endpoint coverage   │
├──────────────────────────────────────────────────────────────────┤
│  4. DATA PROTECTION — Review sensitive data handling             │
│     Classification, encryption, PII, data flows across sections  │
├──────────────────────────────────────────────────────────────────┤
│  5. ATTACK SURFACE — Map and evaluate entry points               │
│     APIs, integrations, file uploads, webhooks, public endpoints │
├──────────────────────────────────────────────────────────────────┤
│  6. INPUT VALIDATION — Review validation design                  │
│     Where validation happens, what is validated, consistency     │
├──────────────────────────────────────────────────────────────────┤
│  7. SECRETS AND TRUST — Review secrets management and            │
│     trust boundaries                                             │
├──────────────────────────────────────────────────────────────────┤
│  8. COMPLIANCE — Review regulatory requirements coverage         │
│     (Conditional — only if requirements identify regulations)    │
├──────────────────────────────────────────────────────────────────┤
│  9. TRIAGE — Classify and prioritize findings                    │
├──────────────────────────────────────────────────────────────────┤
│  10. PRESENT — Deliver security findings report                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load

Read the assembled solution design package, focusing on security-relevant sections:

| Section | Security Relevance |
|---------|-------------------|
| **Section 9 — Security Design** | Primary security section — auth flows, RBAC, data protection, trust boundaries, secrets management, audit logging |
| **Section 7 — API Design** | Per-endpoint auth requirements, input validation schemas, rate limiting, CORS |
| **Section 4 — Frontend Design** | Token storage, XSS prevention, CSP, client-side validation |
| **Section 8 — Integration Design** | Service-to-service auth, external dependency trust, webhook security |
| **Section 6 — Data Model Design** | Sensitive data entities, PII fields, encryption at rest |
| **Section 5 — Backend Design** | Auth middleware, error handling (info leakage), logging (sensitive data in logs) |
| **Section 13 — Observability Design** | Security event logging, sensitive data in metrics/traces |
| **Section 14 — Testing Strategy** | Security test coverage (auth, RBAC, input validation, dependency scanning) |

Also read the architecture review findings — note any security-adjacent issues already identified.

### Step 2 — Authentication

Review the authentication design end-to-end:

| Check | What to Look For |
|-------|-----------------|
| **Entry point coverage** | List every entry point (API endpoints, webhooks, WebSocket connections, background job triggers). Is every entry point's auth requirement defined? Are there entry points with no auth specified? |
| **Auth flow consistency** | Does the auth flow in Section 9 match how Section 7 (API) expects auth to work? Does Section 4 (frontend) store and send tokens in the way Section 5 (backend middleware) expects to receive them? |
| **Token lifecycle** | Is token storage secure (httpOnly cookies, not localStorage for web)? Is token expiry reasonable? Is token refresh designed? Is token revocation possible? |
| **Session management** | Are sessions stateful or stateless? If stateful, where is session state stored? Can sessions be invalidated? Is there a session timeout? |
| **Multi-factor / step-up auth** | If the feature handles sensitive operations, is step-up authentication considered? |

### Step 3 — Authorization

Review the access control design:

| Check | What to Look For |
|-------|-----------------|
| **RBAC completeness** | Do the roles defined in the requirements package match the roles in the security design? Is every permission assigned to at least one role? Are there operations with no permission check? |
| **Endpoint-to-permission mapping** | For every API endpoint in Section 7, is there a clear mapping to the permission required? Are there endpoints that "anyone can access" that should be restricted? |
| **Privilege escalation** | Can a user with role A perform actions restricted to role B? Are there design patterns that allow bypassing authorization (e.g., internal API that trusts all callers)? |
| **Data-level access control** | If Row-Level Security or tenant isolation is needed, is it designed? Can user A access user B's data through any code path? |
| **Separation of duties** | For high-risk operations (financial transactions, data deletion, access grants), is there separation between who can initiate and who can approve? |

### Step 4 — Data Protection

Review how sensitive data is handled across the design:

| Check | What to Look For |
|-------|-----------------|
| **Data classification consistency** | Is sensitive data identified in the data model (Section 6)? Is it treated as sensitive in the API response (Section 7)? Is it protected in transit (Section 8)? Is it excluded from logs (Section 13)? |
| **Encryption at rest** | Are sensitive fields encrypted in the database? Is the encryption approach specified (column-level, application-level, transparent)? |
| **Encryption in transit** | Is TLS enforced for all external communication? Is service-to-service communication encrypted? |
| **PII handling** | Is PII identified? Are there data retention and deletion policies? Can PII be exported or deleted per user request? |
| **Data exposure in APIs** | Do API responses include only the data the consumer needs? Are there endpoints that return more data than necessary (over-fetching sensitive fields)? |
| **Data in logs and traces** | Does the observability design (Section 13) explicitly exclude sensitive data from logs, metrics labels, and trace attributes? |

### Step 5 — Attack Surface

Map and evaluate the system's attack surface:

| Check | What to Look For |
|-------|-----------------|
| **External-facing endpoints** | How many endpoints are publicly accessible? Is this the minimum necessary? Are admin/internal endpoints properly isolated? |
| **File upload paths** | If the feature accepts file uploads, are file type, size, and content validated? Is the upload path isolated from the serving path? |
| **Webhook receivers** | If the feature receives webhooks, are they authenticated (signature verification)? Are they idempotent? Are they rate-limited? |
| **Third-party dependencies** | Do new integrations (Section 8) introduce untrusted input? Are third-party API responses validated before processing? |
| **Error information leakage** | Do error responses expose internal details (stack traces, database errors, internal paths)? Is error handling consistent across all API endpoints? |

### Step 6 — Input Validation

Review the input validation design:

| Check | What to Look For |
|-------|-----------------|
| **Validation layer** | Is input validated on the server side (not just client-side)? Is validation defined at the API layer before it reaches business logic? |
| **Schema definition** | Are request body schemas defined in the API design (Section 7)? Do they include type validation, length limits, format validation, and allowed values? |
| **Consistency** | If the frontend (Section 4) validates input, does the backend (Section 5) also validate the same input? Are the validation rules identical? |
| **Injection prevention** | Is parameterized query usage mandated in the data model / backend design? Are there design patterns that could lead to SQL injection, command injection, or template injection? |
| **Rate limiting** | Are rate limits designed for endpoints that accept user input? Are there different rate limits for authenticated vs. unauthenticated requests? |

### Step 7 — Secrets and Trust Boundaries

Review secrets management and trust boundaries:

| Check | What to Look For |
|-------|-----------------|
| **New secrets** | Does the feature introduce new API keys, database credentials, or service tokens? Are they managed through the existing secrets infrastructure? |
| **Secret rotation** | Can secrets be rotated without downtime? Is rotation designed for all new secrets? |
| **Trust boundaries** | Where are the trust boundaries in the system? Is data validated when crossing a trust boundary? Are internal services assumed trusted — and is that assumption safe? |
| **Service-to-service auth** | How do internal services authenticate to each other? Is it token-based, mTLS, or assumed-trusted? Is the assumed-trust model appropriate for the threat model? |

### Step 8 — Compliance (Conditional)

**Only execute this step if regulatory constraints were identified in the requirements package.**

| Regulation | What to Check in the Design |
|-----------|---------------------------|
| **GDPR** | Is there a data processing lawful basis? Is consent management designed? Can data be exported (portability) and deleted (right to erasure)? Is data residency (EU storage) addressed? Are data processing agreements needed for third-party integrations? |
| **HIPAA** | Is Protected Health Information (PHI) identified? Are access controls to PHI appropriate? Is audit logging comprehensive for PHI access? Is encryption mandated for PHI at rest and in transit? Are Business Associate Agreements needed? |
| **SOC2** | Are access controls, change management, and monitoring sufficient for SOC2 trust service criteria? Is there an audit trail for system changes? Are security incident detection and response designed? |
| **PCI-DSS** | Is the PCI scope properly defined? Is cardholder data minimized (tokenization)? Are network segmentation and access controls designed? Is encryption mandated for cardholder data? |
| **CCPA** | Can consumer data be disclosed on request? Can consumer data be deleted on request? Is there an opt-out mechanism for data sale? |

For each applicable regulation, verify that the design decisions in the solution package satisfy the regulatory requirements identified in the requirements package. Flag gaps where the design does not address a stated compliance requirement.

### Step 9 — Triage

Classify each finding by severity, using security-specific severity definitions:

| Severity | Definition | Examples |
|----------|-----------|---------|
| **CRITICAL** | Design flaw that would allow unauthorized access, data breach, or complete security bypass if implemented as designed | Missing auth on a sensitive endpoint, PII stored unencrypted, no input validation on a public-facing API |
| **HIGH** | Significant security weakness that increases attack surface or creates exploitable vulnerability | Overly broad permissions, token stored in localStorage, missing rate limiting on auth endpoints |
| **MEDIUM** | Security gap that reduces defense-in-depth or creates inconsistency | Validation on frontend only (not backend), inconsistent error handling that could leak info, missing audit logging for sensitive operations |
| **LOW** | Minor security improvement or best-practice suggestion | Missing CSP headers in the design, no mention of dependency vulnerability scanning cadence |

### Step 10 — Present

Present the security findings report to the user.

---

## Output Structure

```
## Security Posture Review Findings

### Summary

| Severity | Count |
|----------|-------|
| CRITICAL | N     |
| HIGH     | N     |
| MEDIUM   | N     |
| LOW      | N     |

### Verdict

[BLOCK / WARNING / PASS]
- BLOCK: CRITICAL security findings — must resolve before implementation
- WARNING: HIGH security findings — strongly recommended to resolve
- PASS: No CRITICAL or HIGH findings — security posture is acceptable

### Findings

#### CRITICAL

[SEC-CRITICAL-1] Title
- **Section(s):** Section N — [name]
- **Security Domain:** [Authentication / Authorization / Data Protection / Attack Surface / Input Validation / Secrets / Trust Boundary / Compliance]
- **Issue:** [specific description]
- **Attack Scenario:** [how an attacker could exploit this]
- **Recommendation:** [actionable fix]

#### HIGH
...

#### MEDIUM
...

#### LOW
...

### Security Coverage Summary

| Security Domain | Reviewed | Findings |
|-----------------|----------|----------|
| Authentication  | Yes      | N findings |
| Authorization   | Yes      | N findings |
| Data Protection | Yes      | N findings |
| Attack Surface  | Yes      | N findings |
| Input Validation| Yes      | N findings |
| Secrets / Trust | Yes      | N findings |
| Compliance      | Yes / Skipped (no regulatory constraints) | N findings |

### Compliance Status (if applicable)

| Regulation | Requirements Identified | Design Coverage | Gaps |
|-----------|------------------------|-----------------|------|
| GDPR      | N requirements         | N addressed     | [gap descriptions] |
| ...       | ...                    | ...             | ... |
```

---

## Hand-off Gate

Before proceeding to `review-solution-readiness`:

1. Present the security findings report in full.
2. For each CRITICAL finding, discuss the remediation and confirm the design will be updated. Security CRITICAL findings **must** be resolved — there is no "acknowledge the risk" option for security CRITICAL.
3. For HIGH findings, confirm resolution approach — security HIGH findings are strongly recommended to resolve before implementation.
4. If CRITICAL findings exist, the design must be updated and this review re-runs on the updated package.
5. If no CRITICAL findings: proceed to `review-solution-readiness` once the user confirms.

## Completion Criteria

- [ ] All security domains (authentication, authorization, data protection, attack surface, input validation, secrets/trust boundaries) have been evaluated
- [ ] The adversarial review technique was applied — security findings exist, or specific evidence explains why not
- [ ] Every entry point (API endpoint, webhook, WebSocket, background job) has been checked for authentication and authorization coverage
- [ ] Sensitive data has been traced across all sections — identified in data model, protected in API responses, excluded from logs, encrypted at rest and in transit
- [ ] If regulatory constraints exist in the requirements package: compliance section has been evaluated and gaps identified
- [ ] If no regulatory constraints exist: explicitly noted in the output
- [ ] Every finding has severity, affected section(s), security domain, issue description, attack scenario (for CRITICAL/HIGH), and recommendation
- [ ] Architecture review findings have been cross-referenced — security-adjacent findings are not duplicated but complemented
- [ ] The user has reviewed the findings and confirmed resolution approach for CRITICAL and HIGH items
- [ ] The verdict (BLOCK / WARNING / PASS) is stated

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Security design (Section 9) looks complete but contradicts API design (Section 7) — e.g., API allows unauthenticated access to an endpoint that Section 9 assumes is protected | Cross-section consistency checks (Steps 2, 3) compare security design against API, frontend, backend, and integration sections |
| Sensitive data is classified in the data model but exposed unprotected in an API response or logged in observability | Data protection trace (Step 4) follows sensitive data across all sections |
| Compliance requirements exist in the requirements package but are not addressed in the design | Conditional compliance section (Step 8) maps regulatory requirements to design decisions and identifies gaps |
| The security review says "looks fine" without genuine analysis | Adversarial technique requires finding issues — think like an attacker, find vulnerabilities |
| New endpoints added in the API design have no auth requirement specified | Entry point coverage check (Step 2) lists every endpoint and verifies auth coverage |
| RBAC defined in requirements does not match RBAC implemented in the design | Authorization review (Step 3) compares requirements package roles/permissions against Section 9 RBAC |
| Attack surface grows because internal endpoints are accidentally exposed | Attack surface mapping (Step 5) identifies all external-facing endpoints and questions whether each needs to be public |
| Compliance review runs on every project, wasting time on non-regulated features | Compliance activation check only runs compliance (Step 8) when the requirements package identifies regulatory constraints |
