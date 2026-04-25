# Security Design

## Purpose

Design security architecture for the feature — authentication flows, RBAC implementation, data protection, and trust boundaries. Consumes: the existing-architecture-assessment (existing security architecture — auth middleware, authorization model, encryption standards, secrets management, trust boundaries), and the requirements package (nonfunctional requirements for security targets, permissions-access-control for role definitions and permission matrix, assumptions-constraints-scope for regulatory and compliance constraints like GDPR, HIPAA, PCI-DSS). For brownfield projects, the new feature plugs into the existing security infrastructure — same authentication provider, same authorization model — unless the feature introduces new security requirements (new roles, new permission scopes, new data sensitivity levels) that require extending the existing model. Covers: authentication integration (how the feature uses existing auth flows), authorization changes (new permissions, roles, or access control rules), data protection (encryption at rest and in transit for new data, PII handling), trust boundary changes (does the feature introduce new trust boundaries or cross existing ones?), secret management for new credentials or API keys, and security audit logging. Produces security design that is Section 9 of the solution design package.

## What This Produces

The security architecture for the feature — a holistic view of how the feature authenticates, authorizes, protects data, manages secrets, and logs security-relevant events. This section pulls together security decisions scattered across other design sections into a single coherent security view, and addresses security concerns not covered elsewhere.

This is Section 9 of the solution design package. It consumes:
- **API design** (Section 7) — per-operation auth and authorization requirements
- **Backend design** (Section 5) — auth middleware, error handling
- **Frontend design** (Section 4) — token storage, XSS prevention, CSP
- **Integration design** (Section 8) — service-to-service authentication
- **Data model design** (Section 6) — entities containing sensitive data

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| Token storage approach (httpOnly cookies, in-memory) | Section 4 — Frontend Design |
| Per-endpoint auth requirements (which roles access which endpoints) | Section 7 — API Design |
| Auth middleware implementation approach | Section 5 — Backend Design |
| Service-to-service auth (mTLS, API keys) | Section 8 — Integration Design |
| **Holistic auth flow (end-to-end, across all components)** | **Section 9 — This section** |
| **New roles, permissions, and access control rules** | **Section 9 — This section** |
| **Data classification and sensitivity levels** | **Section 9 — This section** |
| **Data protection (encryption at rest/in transit, PII handling)** | **Section 9 — This section** |
| **Trust boundary analysis** | **Section 9 — This section** |
| **Secrets management for new credentials** | **Section 9 — This section** |
| **Security audit logging** | **Section 9 — This section** |
| **Compliance impact (GDPR, HIPAA, PCI-DSS)** | **Section 9 — This section** |
| **Threat surface assessment** | **Section 9 — This section** |

## When to Use

- Included when the feature changes authentication, authorization, data protection, or introduces new trust boundaries
- Runs after `integration-design` (Step 8) and before `workflow-business-rules-design` (Step 10)
- May be omitted only if the feature has no security impact — no new roles, no new data sensitivity, no new trust boundaries (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — per-operation auth requirements, consumer tagging | Yes (if API design ran) | Yes |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — auth middleware, error handling approach | Yes (if backend design ran) | Yes |
| Frontend design | `docs/<feature>/solutions-package/design/04-frontend-design.md` — token storage, XSS/CSRF/CSP decisions | Yes (if frontend design ran) | Yes |
| Integration design | `docs/<feature>/solutions-package/design/08-integration-design.md` — service-to-service auth, external system auth | Yes (if integration design ran) | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities, columns, which contain sensitive data | Yes (if data model design ran) | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 7 (Security Architecture: existing auth flow, authorization model, encryption standards, secrets management, trust boundaries) | If discovery ran — identifies existing security infrastructure | Identifies security from codebase or user input |
| Requirements package — permissions-access-control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` — role definitions, permission matrix, access control rules | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — security targets, compliance requirements, data protection standards | Yes | Yes |
| Requirements package — assumptions-constraints-scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — regulatory constraints (GDPR, HIPAA, PCI-DSS), security mandates | Yes | Yes |
| Access to the codebase | Local filesystem or repository — auth config, middleware, RBAC setup, encryption config, secrets references | Yes (brownfield) — the AI reads the actual code to extract existing security patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 7 (Security Architecture) — existing authentication flow (provider, protocol, token format), authorization model (RBAC, ABAC, ACL), encryption standards (at rest, in transit), secrets management approach, and trust boundaries.
- The new feature plugs into this existing security infrastructure unless the feature requires something the existing model does not support. Any extensions must be compatible with and build on the existing model.
- Then proceed to Step 2, where the AI reads the actual codebase to extract security implementations.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI reads auth configuration, middleware, RBAC setup, and encryption configuration from the codebase to understand the existing security posture.
- For brownfield projects without codebase access: ask the user to describe the existing security architecture. Record as `user-stated`.
- For greenfield projects: no existing security to reference. Design from scratch based on requirements.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  SECURITY DESIGN — INTERNAL SEQUENCE                             │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read all upstream design sections for security decisions.    │
│     Read requirements: permissions-access-control, NFRs,         │
│     compliance constraints.                                      │
│     If discovery ran: read baseline Section 7.                   │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     security patterns (Brownfield only)                          │
│     Read auth config, middleware, RBAC setup, encryption config, │
│     secrets references, audit logging.                           │
├──────────────────────────────────────────────────────────────────┤
│  3. CONSOLIDATE — Pull security decisions from all sections      │
│     Gather auth, authz, data protection decisions from Sections  │
│     4, 5, 6, 7, 8 into a unified view. Identify gaps.           │
├──────────────────────────────────────────────────────────────────┤
│  4. AUTH FLOW — Design end-to-end authentication flow            │
│     How users and services authenticate, token lifecycle,        │
│     session management, MFA (if required).                       │
├──────────────────────────────────────────────────────────────────┤
│  5. AUTHORIZATION — Design new roles, permissions, access rules  │
│     New permissions the feature introduces, role-permission      │
│     mapping, ownership-based and attribute-based rules.          │
├──────────────────────────────────────────────────────────────────┤
│  6. DATA CLASSIFICATION — Classify data by sensitivity           │
│     For each new or modified entity: what sensitivity level,     │
│     what protection is required, what regulatory rules apply.    │
├──────────────────────────────────────────────────────────────────┤
│  7. DATA PROTECTION — Design encryption and PII handling         │
│     Encryption at rest and in transit for sensitive data.         │
│     PII handling: what is collected, stored, retained, deleted.  │
├──────────────────────────────────────────────────────────────────┤
│  8. TRUST BOUNDARIES — Identify boundary changes                 │
│     Does the feature introduce new trust boundaries or cross     │
│     existing ones? What validation occurs at each boundary.      │
├──────────────────────────────────────────────────────────────────┤
│  9. SECRETS — Design secrets management for new credentials      │
│     New API keys, certificates, tokens the feature needs.        │
│     How they are stored, rotated, and accessed.                  │
├──────────────────────────────────────────────────────────────────┤
│  10. AUDIT LOGGING — Design security event logging               │
│      What security-relevant events must be logged.               │
│      What is NOT logged (sensitive data exclusions).             │
├──────────────────────────────────────────────────────────────────┤
│  11. THREAT SURFACE — Assess new attack surface                  │
│      What new attack vectors does the feature introduce?        │
│      What mitigations are in place from the design?             │
├──────────────────────────────────────────────────────────────────┤
│  12. COMPLIANCE — Assess regulatory impact                       │
│      GDPR, HIPAA, PCI-DSS, SOC2 implications (if applicable).  │
├──────────────────────────────────────────────────────────────────┤
│  13. VALIDATE — Check against requirements and constraints       │
├──────────────────────────────────────────────────────────────────┤
│  14. ASSEMBLE — Write the security design section                │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This skill depends on upstream design sections having been completed — it reads their security-relevant decisions and builds a unified security view.

From the requirements package, pay particular attention to:
- **Permissions-access-control** — role definitions, permission matrix, access rules that must be enforced
- **NFRs** — security-related non-functional requirements (encryption standards, audit requirements, compliance mandates)
- **Assumptions-constraints-scope** — regulatory constraints (GDPR, HIPAA, PCI-DSS) and organizational security mandates

### Step 2 — Extract Existing Security Patterns from the Codebase (Brownfield Only)

Read security-related source files to understand the existing security posture.

| Pattern Area | What to Read |
|-------------|-------------|
| **Authentication** | Auth provider configuration (Keycloak, Auth0, Cognito, Firebase Auth), OAuth/OIDC setup, JWT validation config, session management |
| **Authorization** | RBAC/ABAC configuration, permission guards/decorators, role definitions, policy files |
| **Encryption** | TLS configuration, database encryption settings, field-level encryption, key management references |
| **Secrets** | Secrets manager references (Vault, AWS Secrets Manager, Azure Key Vault), environment variable usage for sensitive config |
| **Audit logging** | Security event logging — login attempts, permission checks, data access logging |
| **Input validation** | Validation middleware, sanitization libraries, CSP headers |

Present the extracted patterns: **"I've read the existing security infrastructure and identified the following patterns. Please confirm these are accurate, and let me know if there are security mechanisms the code doesn't fully reflect (e.g., network-level security, infrastructure-managed encryption, organizational security policies)."**

For greenfield projects, skip this step.

### Step 3 — Consolidate Security Decisions from All Design Sections

Pull together security-relevant decisions already made in upstream sections:

| Section | Security Decisions Already Made |
|---------|-------------------------------|
| **Frontend (Section 4)** | Token storage approach, XSS prevention, CSP, CSRF protection |
| **Backend (Section 5)** | Auth middleware, error handling (no sensitive data in errors), correlation IDs |
| **Data Model (Section 6)** | Entities and columns — identify which contain sensitive/PII data |
| **API (Section 7)** | Per-operation auth requirements, roles/permissions per endpoint |
| **Integration (Section 8)** | Service-to-service auth (mTLS, API keys), external system credentials |

After consolidating, identify **gaps** — security concerns not yet addressed by any upstream section:
- Data classification and protection requirements
- New roles or permissions not yet defined
- Trust boundary changes
- Secrets management
- Audit logging requirements
- Compliance implications

These gaps are what the remaining steps address.

### Step 4 — Design End-to-End Authentication Flow

Document how authentication works for the feature, end to end:

**For brownfield projects** — confirm the feature plugs into the existing auth flow:

| Auth Stage | Mechanism | Status |
|-----------|-----------|--------|
| *(User login)* | *(Existing: Keycloak OIDC, redirect-based)* | *(Unchanged)* |
| *(Token issuance)* | *(Existing: JWT access token + refresh token)* | *(Unchanged)* |
| *(Token storage)* | *(Existing: httpOnly cookie)* | *(Unchanged — confirmed in Section 4)* |
| *(Token validation)* | *(Existing: middleware validates JWT on every request)* | *(Unchanged)* |
| *(Token refresh)* | *(Existing: silent refresh via refresh token endpoint)* | *(Unchanged)* |
| *(Service-to-service auth)* | *(Existing: mTLS between internal services)* | *(Extended — new Refund Service needs mTLS certificate)* |

If the feature introduces new auth requirements:
- **MFA** — does the feature require multi-factor authentication for certain operations? (e.g., approving refunds above a threshold)
- **Elevated privileges** — does the feature require step-up authentication?
- **API key auth** — does the feature expose endpoints for external consumers that use API keys instead of user tokens?

**For greenfield projects** — design the full auth flow: provider selection, protocol (OIDC, SAML, API keys), token format (JWT, opaque), token lifecycle (expiry, refresh), session management.

### Step 5 — Design Authorization Changes

Document new roles, permissions, and access control rules the feature introduces.

**Permission matrix — new permissions:**

| Permission | Description | Roles Granted | Requirement |
|-----------|-------------|--------------|-------------|
| *(refund:create)* | *(Create a refund request)* | *(user, admin)* | *(FR-01)* |
| *(refund:approve)* | *(Approve or reject a refund)* | *(refund_manager, admin)* | *(FR-05)* |
| *(refund:view_all)* | *(View all refunds, not just own)* | *(refund_manager, admin, support)* | *(FR-03)* |

**New roles (if any):**

| Role | Description | Inherits From | Requirement |
|------|-------------|--------------|-------------|
| *(refund_manager)* | *(Can approve/reject refunds and view all refund data)* | *(user)* | *(PAC-02)* |

**Ownership-based access rules:**

| Resource | Rule | Example |
|----------|------|---------|
| *(Refund)* | *(Users can only view/create refunds for their own orders)* | *(User A cannot see User B's refunds)* |
| *(Refund approval)* | *(The user who created the refund cannot approve it — separation of duties)* | *(Prevent self-approval)* |

**Cross-check:** Every permission listed here must match the per-operation auth from the API design (Section 7). If there is a discrepancy, surface it.

### Step 6 — Classify Data by Sensitivity

For each new or modified entity from the data model (Section 6), classify the data:

| Entity | Column / Field | Sensitivity | Classification | Regulatory Implication |
|--------|---------------|-------------|---------------|----------------------|
| *(Refund)* | *(id, status, created_at)* | *(Internal)* | *(Business data)* | *(None)* |
| *(Refund)* | *(reason — free text from user)* | *(Internal)* | *(Business data)* | *(May contain PII if user mentions personal details)* |
| *(User — existing)* | *(email, name)* | *(Confidential)* | *(PII)* | *(GDPR: right to access, right to erasure)* |
| *(Payment — existing)* | *(card_last_four, payment_method_id)* | *(Restricted)* | *(PCI-related)* | *(PCI-DSS: must not store full card numbers)* |

**Classification levels:**

| Level | Description | Examples |
|-------|-------------|---------|
| **Public** | Available to anyone, no protection needed | Marketing content, public API docs |
| **Internal** | Available to authenticated users within the organization | Order status, refund status |
| **Confidential** | Available only to authorized users/roles; contains PII or business-sensitive data | Customer email, financial reports |
| **Restricted** | Highest sensitivity; regulatory requirements apply | Payment card data, health records, credentials |

### Step 7 — Design Data Protection

For each data classification that requires protection:

**Encryption at rest:**

| Data | Classification | Encryption | Key Management | Notes |
|------|---------------|-----------|----------------|-------|
| *(All database data)* | *(Various)* | *(Existing: AES-256 — database-level transparent encryption)* | *(Cloud provider KMS)* | *(Unchanged — new tables inherit database encryption)* |
| *(Refund reason — free text)* | *(Internal)* | *(Database-level encryption sufficient)* | *(Same as above)* | *(No field-level encryption needed — not PII by default)* |

**Encryption in transit:**

| Connection | Encryption | Notes |
|-----------|-----------|-------|
| *(Client → API)* | *(TLS 1.2+ — existing)* | *(Unchanged)* |
| *(Service → Service)* | *(mTLS — existing)* | *(New Refund Service needs its own certificate)* |
| *(Service → Database)* | *(TLS — existing)* | *(Unchanged)* |
| *(Service → External API)* | *(TLS 1.2+)* | *(Verified per integration design)* |

**PII handling (if applicable):**

| PII Concern | Design Decision |
|------------|----------------|
| *(Data minimization)* | *(Collect only what is needed; refund reason is optional)* |
| *(Right to access)* | *(Existing user data export includes refund history)* |
| *(Right to erasure)* | *(Refund records retained for financial audit; PII is anonymized after retention period)* |
| *(Data retention)* | *(Refund records: 7 years for financial compliance; anonymize PII after retention)* |
| *(Cross-border transfer)* | *(Data stays in the same region as existing data — no new cross-border concern)* |

### Step 8 — Identify Trust Boundary Changes

A trust boundary is a point where the level of trust changes — data crosses from a trusted zone to an untrusted zone or vice versa. Each boundary requires validation.

**Existing trust boundaries (from architecture baseline):**

| Boundary | What Crosses It | Validation |
|----------|----------------|-----------|
| *(Internet → API Gateway)* | *(User requests)* | *(TLS termination, JWT validation, rate limiting)* |
| *(API Gateway → Backend Services)* | *(Authenticated requests)* | *(mTLS, forwarded auth context)* |
| *(Backend → Database)* | *(Queries)* | *(Connection pool with credentials, TLS)* |

**New or changed trust boundaries:**

| Boundary | Change | What Crosses It | Validation Required |
|----------|--------|----------------|-------------------|
| *(Backend → Stripe API)* | *(New — refund processing)* | *(Payment reversal requests with sensitive data)* | *(TLS, API key auth, request signing, response validation)* |
| *(Accounting Service → Backend)* | *(New — event consumption)* | *(Refund events via Kafka)* | *(mTLS between services, message schema validation, consumer authorization)* |

For each new trust boundary:
- What validation occurs at the boundary?
- What happens if validation fails?
- Is there an anti-corruption layer (from integration design)?

### Step 9 — Design Secrets Management

For each new credential, API key, certificate, or secret the feature requires:

| Secret | Purpose | Storage | Rotation | Access |
|--------|---------|---------|----------|--------|
| *(Stripe API key)* | *(Payment gateway auth)* | *(AWS Secrets Manager — existing approach)* | *(Annual, or on compromise)* | *(Refund Service only)* |
| *(Refund Service mTLS certificate)* | *(Service-to-service auth)* | *(Certificate manager — existing approach)* | *(Auto-renewed 30 days before expiry)* | *(Refund Service)* |
| *(Kafka consumer credentials)* | *(Event broker auth)* | *(AWS Secrets Manager)* | *(Annual)* | *(Refund Service, Accounting Service consumer)* |

**Rules:**
- Secrets must never appear in source code, configuration files committed to version control, logs, or error messages
- All secrets use the existing secrets management infrastructure (from architecture baseline or technology stack)
- Every secret has a defined rotation policy
- Every secret has a defined blast radius — what is affected if the secret is compromised

### Step 10 — Design Security Audit Logging

Define security-relevant events that must be logged for audit purposes. These are distinct from operational logs (covered in observability, Section 13) — audit logs answer "who did what to which resource and when?"

| Event | Data Logged | Data NOT Logged | Severity |
|-------|-----------|----------------|----------|
| *(Refund created)* | *(userId, orderId, refundId, amount, timestamp)* | *(Payment details, full user profile)* | *(INFO)* |
| *(Refund approved)* | *(approverId, refundId, amount, timestamp)* | *(Approver's full profile)* | *(INFO)* |
| *(Refund approval denied — insufficient permissions)* | *(userId, refundId, required permission, timestamp)* | *(User credentials)* | *(WARN)* |
| *(Repeated failed permission checks from same user)* | *(userId, resource, attempt count, timestamps)* | *(Request bodies)* | *(ALERT)* |

**Audit log design decisions:**
- **Immutability** — audit logs must not be modifiable after creation (append-only store or write-once storage)
- **Retention** — how long audit logs are retained (driven by compliance requirements)
- **Access** — who can read audit logs (typically restricted to security/compliance team)
- **Sensitive data exclusion** — audit logs must never contain passwords, tokens, PII, or payment details. Log identifiers (userId, refundId), not content.

### Step 11 — Assess New Threat Surface

For each new capability the feature introduces, identify the threat surface and the design-level mitigations already in place. This is not a full threat model — it is a design-level assessment that identifies obvious attack vectors and confirms they are addressed.

| New Attack Surface | Threat | Mitigation (from design) | Residual Risk |
|-------------------|--------|--------------------------|---------------|
| *(Refund creation endpoint)* | *(Unauthorized refund — user refunds someone else's order)* | *(Ownership check in backend service; API requires auth + user can only refund own orders)* | *(Low — covered by authorization design)* |
| *(Refund approval endpoint)* | *(Self-approval — user creates and approves their own refund)* | *(Separation of duties rule: creator ≠ approver)* | *(Low — covered by authorization design)* |
| *(Refund amount manipulation)* | *(User submits refund amount exceeding order total)* | *(Backend validates refund amount ≤ order total; DB CHECK constraint)* | *(Low — covered by backend + data model design)* |
| *(Bulk refund abuse)* | *(User creates many refund requests rapidly)* | *(Rate limiting on refund creation endpoint)* | *(Low — covered by API design rate limiting)* |
| *(Payment gateway credential exposure)* | *(Stripe API key leaked via logs or errors)* | *(Secrets in Secrets Manager; never logged; generic error messages to client)* | *(Low — covered by secrets management + error handling)* |

For each residual risk rated Medium or above, note what additional mitigation should be considered.

### Step 12 — Assess Compliance Impact (If Applicable)

Only include this step if the project is subject to regulatory requirements.

| Regulation | Applicable? | Impact of This Feature | Design Response |
|-----------|------------|----------------------|----------------|
| *(GDPR)* | *(Yes)* | *(Refund records reference user data — subject to right of access and erasure)* | *(Data retention policy: 7 years for financial records, PII anonymized after retention; user data export includes refund history)* |
| *(PCI-DSS)* | *(Yes — payment processing)* | *(Refund triggers payment reversal via Stripe; no card data stored locally)* | *(Stripe handles PCI scope; system only stores payment_method_id, not card numbers; confirmed in data model)* |
| *(HIPAA)* | *(No)* | *(N/A)* | *(N/A)* |
| *(SOC2)* | *(If applicable)* | *(Audit logging required for security-relevant events)* | *(Audit logging designed in Step 10; immutable, retained per policy)* |

If no regulatory requirements apply, state: **"No regulatory compliance requirements apply to this feature. If this changes, security design must be revisited."**

### Step 13 — Validate

Check the completed security design against:

- **Permissions-access-control** — does every role and permission from the requirements have a corresponding entry in the authorization design?
- **API design** — do the per-operation auth requirements in Section 7 match the authorization model here?
- **Frontend design** — is the token storage approach from Section 4 consistent with the auth flow designed here?
- **Integration design** — are service-to-service auth decisions from Section 8 reflected in the trust boundary analysis?
- **Data model** — is every entity with sensitive columns classified and protected?
- **NFRs** — are security-related NFRs addressed (encryption standards, audit requirements)?
- **Compliance** — are all applicable regulatory requirements addressed?
- **Traceability** — does every new security decision trace to a requirement?

### Step 14 — Assemble

Combine all sections into the security design output. This becomes Section 9 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/09-security-architecture.md` using the template at `../assets/security-architecture-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Security Posture** — current auth flow, authorization model, encryption, secrets management, trust boundaries (from Steps 2–3)

**2. Security Decisions from Upstream Sections** — consolidated view of security decisions already made in Sections 4, 5, 6, 7, 8 (from Step 3)

**3. Authentication Flow** — end-to-end auth flow, noting what is unchanged and what is extended (from Step 4)

**4. Authorization Changes** — new permissions, roles, ownership rules, and permission matrix (from Step 5)

**5. Data Classification** — sensitivity classification for all new and modified data entities (from Step 6)

**6. Data Protection** — encryption at rest and in transit, PII handling, data retention, data minimization (from Step 7)

**7. Trust Boundaries** — existing and new trust boundaries with validation at each (from Step 8)

**8. Secrets Management** — new secrets with storage, rotation, and access policies (from Step 9)

**9. Security Audit Logging** — security-relevant events with logging rules and sensitive data exclusions (from Step 10)

**10. Threat Surface Assessment** — new attack vectors with mitigations and residual risks (from Step 11)

**11. Compliance Impact** — regulatory implications and design responses (from Step 12, if applicable)

**12. Requirements Traceability** — every new security decision traces to the requirement that drives it

### For Greenfield Projects

Same structure, with Section 1 covering the designed (not existing) security architecture, and all items as new rather than extensions.

---

## Requirements Traceability

Every new or modified security decision must trace to the requirement that drives it. Existing unchanged security mechanisms carry forward without traceability.

| Security Decision | Change Type | Requirement ID | Requirement Summary |
|------------------|------------|---------------|---------------------|
| *(refund:create permission)* | *(new)* | *(PAC-01)* | *(Authenticated users can create refund requests for their own orders)* |
| *(refund:approve permission)* | *(new)* | *(PAC-02)* | *(Only refund managers and admins can approve refunds)* |
| *(refund_manager role)* | *(new)* | *(PAC-02)* | *(New role for refund approval workflow)* |
| *(Separation of duties — creator ≠ approver)* | *(new)* | *(PAC-03)* | *(Refund creator cannot approve their own refund)* |
| *(Refund data retention — 7 years)* | *(new)* | *(NFR-09, GDPR)* | *(Financial records retention; PII anonymized after period)* |
| *(Stripe API key in Secrets Manager)* | *(new)* | *(NFR-07)* | *(All secrets managed via secrets management infrastructure)* |

If a security decision cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `workflow-business-rules-design`, you must:

1. Write the completed security design in full.
2. Present it to the user for review with the following questions:
   - **Auth flow:** Is the authentication flow correct? Does the feature plug into the existing auth correctly?
   - **Authorization:** Are the new permissions and roles correct? Is the permission matrix complete? Are ownership-based rules right?
   - **Data classification:** Are the sensitivity levels correct for all new data? Is anything under- or over-classified?
   - **Data protection:** Is the encryption approach sufficient? Are PII handling rules correct?
   - **Trust boundaries:** Are all boundary crossings identified? Is the validation at each boundary adequate?
   - **Secrets:** Are all new secrets identified? Are storage and rotation policies correct?
   - **Audit logging:** Are the right events being logged? Is sensitive data correctly excluded?
   - **Threats:** Are the identified threats realistic? Are the mitigations adequate? Are there threats I've missed?
   - **Compliance:** Are all applicable regulations addressed?
   - **Traceability:** Is every new security decision connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the security design is accurate.

## Completion Criteria

- [ ] For brownfield: existing security patterns are extracted from the codebase and confirmed by the user
- [ ] Security decisions from all upstream sections (frontend, backend, data model, API, integration) are consolidated into a unified view
- [ ] Gaps between upstream security decisions and requirements are identified and addressed
- [ ] End-to-end authentication flow is documented (existing, extended, or new)
- [ ] Every new permission and role from the requirements (permissions-access-control) has a corresponding entry in the authorization design
- [ ] Authorization model includes ownership-based access rules where applicable
- [ ] Per-operation auth requirements in the API design (Section 7) are consistent with the authorization model
- [ ] Every new or modified data entity is classified by sensitivity level
- [ ] Data protection decisions (encryption at rest, in transit) are defined for data above the Public classification
- [ ] PII handling is defined: data minimization, right to access, right to erasure, retention periods
- [ ] All trust boundaries (existing and new) are documented with validation at each boundary
- [ ] Every new secret (API key, certificate, credential) has defined storage, rotation, and access policies
- [ ] Security audit logging is defined: what events, what data is logged, what data is excluded
- [ ] Audit logs are immutable and have a defined retention period
- [ ] Threat surface assessment identifies obvious attack vectors and confirms design-level mitigations
- [ ] Residual risks rated Medium or above have documented consideration for additional mitigation
- [ ] Compliance impact is assessed for all applicable regulations (or stated as not applicable)
- [ ] Requirements traceability is complete — every new security decision traces to a requirement
- [ ] The user has explicitly confirmed the security design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Security decisions are scattered across multiple design sections with no unified view, leading to gaps and inconsistencies | Step 3 consolidates all security decisions from upstream sections into one view and identifies gaps |
| A new endpoint is deployed without proper authorization because the permission was defined in the requirements but never mapped to the implementation | Step 5 maps every permission from the requirements to the authorization design; Step 13 validates against the API design's per-operation auth |
| Sensitive data is stored without encryption because no one classified it as sensitive during design | Step 6 classifies every new data entity by sensitivity; Step 7 defines protection for each classification |
| PII is collected without a retention or erasure strategy, creating compliance risk | Step 7 defines PII handling: data minimization, retention periods, right to access, right to erasure |
| A new external system integration is set up without considering the trust boundary, and data is passed without validation | Step 8 identifies every trust boundary and requires validation at each crossing |
| A new API key is needed for an external service, but no one plans how to store, rotate, or restrict access to it | Step 9 requires every new secret to have defined storage, rotation, and access policies |
| A security-relevant event (permission denial, data access) is never logged, making incident investigation impossible | Step 10 defines security audit events with explicit logging rules |
| Passwords or tokens are accidentally logged in audit logs, creating a new vulnerability | Step 10 explicitly defines what data is NOT logged — sensitive data exclusion is mandatory |
| The feature introduces a new attack vector that is obvious in hindsight but never considered during design | Step 11 assesses the threat surface for each new capability and confirms design-level mitigations exist |
| The feature handles payment data but no one considers PCI-DSS implications until a compliance audit | Step 12 assesses regulatory impact for all applicable regulations at design time |
| Authorization is designed without considering ownership — users can see each other's data | Step 5 includes ownership-based access rules as a first-class concern |
| The frontend stores tokens insecurely, but the security section doesn't know because it only looks at the backend | Step 3 consolidates security decisions from all sections, including frontend token storage (Section 4) |
