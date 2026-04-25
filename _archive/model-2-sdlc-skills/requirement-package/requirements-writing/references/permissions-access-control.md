# Permissions & Access Control

## Purpose

Define who can do what in the system — the permissions model, role definitions, and access control rules for the proposed change. Captures the authentication boundary (how the system establishes identity), specifies which personas, roles, and machine identities can access which capabilities, what authorization model governs access decisions, and what happens when access is denied. Also documents the permission provisioning and deprovisioning lifecycle. If the analysis phase ran, consumes the stakeholder map (roles and personas) and the constraint register (regulatory and security constraints that govern access). If analysis was skipped, the user provides role and permission information directly via structured elicitation. Produces a permissions and access control document that becomes Section 8 of the requirements package.

## Level of Abstraction — Guardrails

This skill produces a **business-level access control requirements** document — it describes WHO can do WHAT in the system, under what conditions, and what happens when access is denied. It does NOT prescribe how the system implements authorization at the code or infrastructure level.

**The architect and developers determine the technical implementation of access control.** This document defines the business requirement.

Apply these guardrails throughout every step:

| Do | Do not |
|-----|--------|
| Use plain-English names for resources (e.g., "Fund account request", "Transaction history", "Operational review record") | Use PascalCase, camelCase, or code-style naming for resources (e.g., `FundAccountRequest`, `OperationalReviewRecord`) |
| Name machine identities descriptively (e.g., "Mobile app channel service", "Payments platform service", "Interac network integration") | Use kebab-case or code-style identity names (e.g., `td-mobile-app-channel`, `payments-platform`) |
| Describe enforcement in business terms (e.g., "Mobile app authorization controls", "Operations portal access controls") | Name specific technical components (e.g., "Channel-to-payments API gateway", "Payments platform auth layer") |
| State denied access outcomes from the user's perspective (e.g., "The user sees a 'not available' message", "The record is hidden from results") | Specify HTTP status codes, response codes, or internal error-handling logic (e.g., "Returns HTTP 403", "Response code: Resource-not-found") |
| Write ACs referencing what the user experiences or what the business process does (e.g., "The system prevents the customer from proceeding") | Write ACs referencing technical signals (e.g., "The system returns HTTP 404 and logs a denied access attempt") |

**Test:** Before writing any table row, ask: "Could a business stakeholder read this and understand who can do what without knowing the system's internal architecture?" If no, rewrite at a higher level of abstraction.

## When to Use

- After functional-requirements and user-journeys — permissions must be grounded in what the system does and who does it
- When the feature introduces new capabilities that require authorization decisions
- When existing permissions change due to the feature
- When regulatory or compliance constraints impose access control requirements
- Before non-functional requirements — permissions inform security NFRs
- **Do not invoke** for features that expose no protected capabilities and have no authentication boundary (e.g., fully public, read-only, unauthenticated features). If this is the case, document that decision explicitly and proceed to the next skill.

## What This Produces

A permissions and access control document with:

1. **Authentication boundary** — how the system establishes identity, how identity binds to roles, and what the system does when authentication fails or the identity provider is unavailable
2. **Authorization model** — the approach used (role-based, attribute-based, ownership-based, or custom), least-privilege as a governing principle, and where access decisions are enforced
3. **Resource sensitivity classification** — each resource type classified by sensitivity tier, driving the stringency of the permissions and audit requirements that follow
4. **Role definitions** — every human role and machine identity that interacts with the feature, with scope, sensitivity tier, and hierarchy
5. **Permission matrix** — which roles can perform which actions on which resources, with explicit ACR cross-references for conditional permissions
6. **Access control rules** — the conditions under which access is granted or denied, including contextual, horizontal boundary, delegation, and break-glass rules
7. **Denied access behavior** — what the user experiences when access is denied, including whether the system reveals or conceals the existence of a resource
8. **Audit requirements** — what access events must be logged, with retention periods and specific regulatory obligations derived from confirmed applicable regulations
9. **Permission lifecycle** — how roles are provisioned, modified, and revoked over time, including session invalidation requirements

## Did Analysis Run?

**Analysis completed** if the following exist:
- `docs/<feature>/requirements-package/analysis/stakeholder-map.md` from stakeholder-mapping (roles and personas)
- `docs/<feature>/requirements-package/analysis/constraint-register.md` from constraint-extraction (security and regulatory constraints)

If analysis completed → derive roles from the stakeholder map and persona definitions, and derive access constraints from the constraint register.

**Analysis was skipped** if any of the above are missing.

When analysis was skipped, collect the following from the user before proceeding:

| Question | What to Record |
|----------|---------------|
| What roles exist in the system? Name each role and describe what it can do. | Role inventory |
| What authentication mechanism is in use? (SSO, username/password, API keys, etc.) | Auth mechanism |
| What happens if the authentication provider is unavailable — does the system deny all access, or fall back to another mechanism? | Fail-closed/fail-open decision |
| How does the system decide who can do what — by role, by attributes of the user or data, by ownership, or by a custom rule set? | Access control approach |
| What resources or data does this feature expose? Classify each resource type by sensitivity (e.g., public / internal / confidential / restricted). | Sensitivity classification |
| Are there any regulatory or compliance requirements that govern access? (GDPR, PCI-DSS, HIPAA, etc.) | Constraint inventory |
| Are there data-level restrictions — e.g., users can only see their own records? | Data-level rules |
| Can one user access another user's resources of the same type by guessing or manipulating an identifier? What should the system do in that case? | Horizontal access boundary |
| What is the maximum permitted session duration? Are concurrent sessions permitted? | Session policy |
| What events must cause an active session to be terminated? (e.g., role change, credential revocation, admin action) | Session invalidation triggers |
| Who grants roles to users? Who revokes them? What triggers a revocation? | Lifecycle process |
| Are there any machine identities, service accounts, or API clients that access the system? | Machine identity inventory |

Answers provided directly by the BSA or responsible stakeholder are treated as `stakeholder-confirmed` — the BSA is the authoritative source for business decisions about roles, access policies, and permission scope. Mark as `[ASSUMPTION]` only claims about how the existing system currently behaves (e.g., what the current authentication mechanism does, how roles are presently enforced) that have not been verified against the codebase or a prior analysis artifact. For each `[ASSUMPTION]`, record: the named individual or team responsible for verifying it, and the deadline by which it must be resolved before the requirements package is considered stable.

## Inputs

| Input | Source | Required | If analysis was skipped |
|-------|--------|----------|------------------------|
| Persona definitions | stakeholder-personas (this phase) | Yes | Completed in a prior step |
| Functional spec | functional-requirements (this phase) | Yes | Completed in a prior step |
| User journey maps | user-journeys (this phase) | Yes | Completed in a prior step |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available | User describes security/compliance constraints via elicitation |
| Stakeholder map | `docs/<feature>/requirements-package/analysis/stakeholder-map.md` (only present if analysis ran) | If available | User describes roles via elicitation |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. INVENTORY — Identify all actors, capabilities,    │
│     and resource sensitivity tiers.                   │
│     Human roles, machine identities, actions,         │
│     resources. Classify resources by sensitivity.     │
├──────────────────────────────────────────────────────┤
│  2. AUTH MODEL & BASELINE                             │
│     Authentication mechanism. Fail-closed behavior.  │
│     Authorization model (RBAC/ABAC/ACL/ReBAC/custom). │
│     Least-privilege principle. Session lifecycle.     │
│     Current state and enforcement point(s).           │
├──────────────────────────────────────────────────────┤
│  3. DEFINE ROLES — Specify each role                  │
│     Name, scope, sensitivity tier, hierarchy,         │
│     conflict resolution, machine identities,          │
│     mapped personas.                                  │
├──────────────────────────────────────────────────────┤
│  4. MAP PERMISSIONS — Build the permission matrix     │
│     Role × Action × Resource (at defined granularity) │
│     Condition cells reference ACR-NNN.                │
│     Enforcement point named for every row.            │
├──────────────────────────────────────────────────────┤
│  5. RULES — Document access control rules             │
│     Contextual, time-based, state-based.              │
│     Horizontal access boundaries.                     │
│     Delegation with expiry and revocation.            │
│     Break-glass.                                      │
├──────────────────────────────────────────────────────┤
│  6. DENIED — Specify denied access behavior           │
│     User-facing experience. Reveal-or-conceal decision.│
│     System logging. i18n scope.                       │
├──────────────────────────────────────────────────────┤
│  7. AUDIT — Define audit requirements                 │
│     Events, fields, retention, and specific           │
│     regulatory obligations derived from confirmed     │
│     applicable regulations (not assumed).             │
├──────────────────────────────────────────────────────┤
│  8. LIFECYCLE — Permission provisioning &             │
│     deprovisioning. Who grants, who revokes, when,    │
│     what triggers review. Session invalidation.       │
├──────────────────────────────────────────────────────┤
│  9. ASSEMBLE — Populate the permissions template      │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Inventory Roles, Capabilities, and Resource Sensitivity

From the functional spec and user journey maps, extract:
- Every human actor mentioned (user roles, personas)
- Every machine actor (service accounts, API clients, background jobs, external system identities, automated release pipelines)
- Every action each actor performs
- Every resource (business object, screen, capability) each actor accesses — name resources in plain English (e.g., "Fund account request", "Transaction history"), not in code-style naming

Produce an inventory before building the permission matrix:

| Actor | Actor Type | Actions | Resources |
|-------|-----------|---------|-----------|
| [persona / role] | [human / service / external system] | [list of actions from the functional spec] | [list of resources in plain-English names] |

Machine identities must appear in this table. They will carry through to role definitions, the permission matrix, and audit requirements. Do not defer machine identities to implementation.

#### 1b — Resource Sensitivity Classification

Before defining permissions, classify every resource type by sensitivity. This classification is a business and regulatory statement about how the resource must be protected — it is not an implementation decision. The permission matrix and audit requirements in subsequent steps must be consistent with the tiers established here.

| Resource | Sensitivity Tier | Basis for Classification |
|----------|-----------------|--------------------------|
| [resource name] | [public / internal / confidential / restricted] | [regulatory obligation / business risk / data type — be specific] |

**Sensitivity tier definitions:**
- **Public** — no access control required; the resource is intentionally exposed without restriction
- **Internal** — accessible to authenticated users of the system; no further restriction required
- **Confidential** — accessible only to named roles; data-level restrictions may apply
- **Restricted** — highest sensitivity; access is tightly controlled, logged in full, and subject to specific regulatory or policy obligations

If a resource contains data of mixed sensitivity, classify it at the highest tier that applies to any of its data.

### Step 2 — Authentication Mechanism, Authorization Model, and Session Lifecycle

#### 2a — Authentication Boundary

Establish how the system knows who is making a request before any authorization decision is made:

| Question | What to Capture |
|----------|----------------|
| What authentication mechanism is used? | Single sign-on / federated identity / username-password / shared key / certificate-based / other |
| Who is the identity provider? | IdP name or "internal" |
| How does a verified identity bind to a role? | Role assertion in identity credential / role lookup in directory / group membership / other |
| For machine identities: how are they authenticated? | Shared key / service account token / certificate / other |
| What happens if authentication fails? | Redirect to login / access denied message / error page — specify exact behavior |
| What happens if the identity provider is unavailable? | All access denied (fail-closed) / fallback mechanism — state which, and whether this is a policy decision or an existing system behavior |

The fail-closed question must be answered explicitly. "The system handles it" is not an acceptable answer — the behavior when the identity provider is unavailable is a security requirement, not an implementation detail.

If the authentication mechanism is not yet established in the existing system, specify it here — authentication mechanism selection determines what identity information is available to the authorization layer.

#### 2b — Authorization Model

Specify the authorization model for this feature:
- What approach is used to decide who can do what — by job role, by user or data attributes, by resource ownership, or by a custom rule set?
- What roles are defined for this feature?
- How are roles assigned to users?
- Where is authorization enforced? Name the business-level boundary responsible for authorization decisions (e.g., "Mobile app authorization controls", "Operations portal access controls"). "The system" or "the application" is not sufficient, but do not prescribe specific technical components — describe the boundary at a level a business stakeholder can understand.
- **Least-privilege** is a governing principle for this feature: every role's permitted actions must be limited to what is necessary to perform its defined function, and no more. This applies equally to human roles and machine identities. Document how least-privilege is verified for each role (e.g., permissions derived only from functional spec actions; any permission not traceable to a stated requirement is not granted).
- If authorization decisions may introduce latency constraints (e.g., high-throughput APIs, real-time workflows where authorization checks are on the critical path), document those constraints here. They will propagate into the non-functional requirements section.

**If analysis was skipped:**
- Collect answers via the elicitation table in the "Did Analysis Run?" section above
- Treat answers provided by the BSA or responsible stakeholder as `stakeholder-confirmed` — business decisions about roles, access policies, and permission scope are confirmed by the stakeholder who states them
- Mark as `[ASSUMPTION]` only claims about how the existing system currently behaves that have not been verified against the codebase or a prior artifact

#### 2c — Session Lifecycle Requirements

For each authenticated session, specify:

| Question | What to Capture |
|----------|----------------|
| What is the maximum permitted session duration before re-authentication is required? | Duration or "not applicable" with rationale |
| Are concurrent sessions permitted for the same identity? | Yes / No / Limited — if limited, specify the maximum count |
| What events must trigger immediate session invalidation? | Role change / credential revocation / admin action / inactivity timeout — list all that apply to this feature |
| When a role is revoked for a user with an active session, what must happen to that session? | Immediate termination / graceful drain with deadline — specify |
| For machine identities: are there credential rotation requirements? | Rotation frequency or event-triggered rotation — specify |

Session requirements here must be reflected in the deprovisioning triggers in Step 8b.

### Step 3 — Define Roles

#### 3a — Human Roles

For each human role:

| Field | What to capture |
|-------|----------------|
| **Role name** | Human-readable role name (e.g., "Branch Manager", "System Administrator", "Customer") |
| **Scope** | What this role has access to (all data, own branch, own account, etc.) |
| **Sensitivity tier** | The highest sensitivity tier of resources this role can access (from Step 1b) |
| **Hierarchy** | Parent role (if role inheritance exists); leave blank if no inheritance |
| **Inheritance conflict rule** | If this role inherits from a parent: which takes precedence when a direct assignment conflicts with an inherited permission? (direct wins / parent wins / most-restrictive wins / most-permissive wins) — must be stated explicitly if hierarchy is non-empty |
| **Mapped personas** | Which personas from stakeholder-personas hold this role |

**Inheritance conflict rule must be specified for every role with a non-empty hierarchy.** "See authorization model" is not an acceptable answer — the rule must be stated in terms that can be verified without consulting implementation code.

#### 3b — Machine Identities

For each machine identity (service account, API client, background job, external system integration):

| Field | What to capture |
|-------|----------------|
| **Identity name** | Descriptive plain-English name (e.g., "Payments platform service", "Reporting batch process", "Partner API integration") — do not use kebab-case or code-style names |
| **Type** | Service account / API client / background job / external system |
| **Authentication method** | How this identity proves itself (shared key / certificate / service account token / other) |
| **Scope** | What resources and actions this identity requires — must satisfy least-privilege; permissions not traceable to a stated functional requirement must not be granted |
| **Owner** | Team or role responsible for this identity's credentials and lifecycle |

Machine identities must appear in the permission matrix (Step 4) and audit requirements (Step 7). They are not exempt from default-deny.

### Step 4 — Build the Permission Matrix

**Resource granularity:** Before populating the matrix, define what "resource" means in this system. Choose one consistent granularity level and apply it throughout the matrix:
- *Business object* — e.g., "Fund account request", "Customer profile", "Invoice record"
- *Named capability* — e.g., "Export report", "Approve payment"
- *Screen or view* — e.g., "Admin dashboard", "Order history page"

All resources must use plain-English names. Do not use code-style naming (PascalCase, camelCase) or API endpoint paths in the permission matrix — those are implementation decisions.

If the feature spans multiple granularity levels, document the mapping between them explicitly. Do not mix granularity levels within the matrix without explanation.

**Access Control Rule (ACR) IDs:** Conditional permissions reference rules defined in Step 5. An ACR ID takes the form `ACR-NNN` (e.g., `ACR-001`, `ACR-002`). ACR IDs are assigned sequentially and scoped to this feature's permissions document.

For each role-action-resource combination — including machine identities:

| Role | Action | Resource | Permission | Condition | Enforcement Point | Req Ref |
|------|--------|----------|-----------|-----------|------------------|---------|
| [role or machine identity] | [create / read / update / delete / execute / export] | [business object / screen / capability — plain English] | [Allow / Deny] | [unconditional / ACR-NNN] | [business-level boundary — e.g., "Mobile app authorization controls", "Operations portal access controls"] | [REQ-xxx] |

**Rules for the matrix:**
- **Default deny** — if a permission is not explicitly listed, it is denied. The enforcement point named in this column is responsible for implementing default deny; "implicit" or "the system handles it" is not acceptable.
- **Conditional permissions** — if a permission depends on a runtime condition, the `Condition` cell must reference the ACR ID (e.g., `ACR-003`) defined in Step 5. "Conditional — see rules" without a specific reference is not sufficient.
- **Enforcement point** — every row must name the business-level boundary that enforces this permission (e.g., "Mobile app authorization controls"). Leaving this blank means the permission has no accountable home. Do not name specific technical components — describe the boundary at a level a business stakeholder can understand.
- **Every functional requirement that mentions an actor must have a corresponding permission entry** — use the `Req Ref` column to ensure traceability.
- **Least-privilege check** — for every Allow row, verify that the action is required by the role's defined function. Any Allow permission not traceable to a functional requirement must not be granted.

### Step 5 — Document Access Control Rules

Beyond the role-based matrix, document contextual rules. Each rule here must be referenced by its ACR ID in the `Condition` column of the permission matrix.

| Rule ID | Description | Condition | Effect | Enforcement Point | Source |
|---------|-------------|-----------|--------|------------------|--------|
| ACR-001 | [rule name] | [when this rule applies — e.g., "user is accessing data outside their branch"] | [what happens — deny, restrict to own records, escalate, log] | [where this rule is evaluated] | [constraint register entry / business rule / regulatory requirement] |

**Common rule categories:**
- **Data-level access** — users must only be able to access their own records, or records within their organisational unit. State the requirement: who can see what, and what must happen when access is denied. Reference the corresponding denial behavior in Step 6.
- **Horizontal access boundaries** — one user must not be able to access another user's resources of the same type by manipulating an identifier or parameter. For each resource where this applies, state the requirement explicitly and reference the corresponding denial behavior in Step 6. Absence of a horizontal boundary rule for a resource is a statement that no such restriction applies — document that decision.
- **Time-based access** — certain operations are restricted outside business hours
- **State-based access** — certain actions are only available when an entity is in a specific state
- **Delegation** — one user can temporarily grant their permissions to another (see delegation structure below)
- **Break-glass** — emergency access that bypasses normal controls. If this feature requires break-glass access, specify: which roles are authorized to invoke it, under what conditions it is permitted, and that all break-glass access events must be fully audited (cross-reference Step 7). If break-glass does not apply to this feature, state this explicitly with a rationale.

**Delegation structure:**

Delegation rules must specify the full lifecycle, not just the grant:

| Field | What to capture |
|-------|----------------|
| **Grantor constraint** | Which roles are permitted to delegate, and to whom |
| **Scope** | What subset of the grantor's permissions can be delegated (full / specific permissions only) |
| **Duration** | Maximum permitted duration; whether indefinite delegation is allowed |
| **Expiry behavior** | What happens at expiry — permissions are automatically revoked; any dependent sessions are terminated |
| **Revocation** | How the grantor (or an admin) revokes before expiry; what is the propagation delay |
| **Audit** | Delegation grant, expiry, and revocation must all be logged (reference Step 7) |

### Step 6 — Specify Denied Access Behavior

For each denial scenario, specify exactly what happens — both what the user experiences and what the business expects to happen behind the scenes.

**Exact user-facing text** must be determined in collaboration with the team responsible for user experience and content design. If that text is not yet available at the time this document is produced, record a placeholder, mark it `[ASSUMPTION]`, and name the owner responsible for supplying the final text before this document is considered stable.

| Scenario | What the User Experiences | What the Business Expects to Happen | Notes |
|----------|--------------------------|-------------------------------------|-------|
| [unauthenticated access] | [login prompt / error page — describe the experience] | [Attempt is recorded; user is redirected to sign in] | — |
| [insufficient role] | [access denied message — describe what the user sees] | [Denied attempt is recorded for audit] | — |
| [data-level restriction — resource exists but is out of scope] | [see information disclosure note below] | [Filtered access attempt is recorded for audit] | Decide per resource — see below |
| [data-level restriction — filtered result set] | ["no results" state or filtered list] | [Query filtering is recorded] | — |
| [break-glass access denied] | [specific denial message] | [Security team is alerted; full context is recorded] | — |

Do not include HTTP status codes, response codes, or technical error-handling details in this table. Those are implementation decisions. Describe what the user experiences and what outcome the business requires.

**Information disclosure decision (required for every data-level restriction):**

When a user attempts to access a resource they cannot see, the system must decide whether to tell them the resource exists. For some resources, confirming existence is itself a disclosure. For each data-level restriction scenario, explicitly decide:

- **Tell the user access is denied** when: the existence of the resource is not sensitive (e.g., a product catalogue item the user lacks a subscription for)
- **Behave as if the resource does not exist** when: confirming the resource exists would itself constitute a disclosure (e.g., a user trying to access another user's private record, a draft document, a transaction they did not initiate)

Document the decision for each resource type. Defaulting to "access denied" for all restrictions is not a security-conscious default.

**Additional requirements:**
- Do not leave denied access behavior undefined. "The system denies access" is insufficient — specify what the user sees and what the system records.
- If the application is localised, denied access messages must be internationalised. Error messages must not reveal internal role names, resource paths, or system structure to end users.
- Access control requirements must be satisfied regardless of presentation-layer state. The permission matrix must name the enforcement point responsible for each denial. Reliance on UI element visibility (e.g., a hidden button) alone does not constitute a complete access control specification — both may exist, but only the named enforcement point in the matrix is the access control requirement.

### Step 7 — Define Audit Requirements

**Applicable regulations must be derived from the constraint register (or from elicitation answers if analysis was skipped) — not assumed.** For each regulation confirmed as applicable to this feature, document the specific access-logging obligations it imposes. Do not include regulations that have not been confirmed as applicable. If no regulatory obligations apply, state: "No regulatory logging obligations identified — internal policy applies" and name the policy.

| Event Type | What Must Be Recorded | Retention Period | Regulatory Driver |
|-----------|----------------------|-----------------|-------------------|
| Successful access to sensitive data | Who accessed what, when, and the outcome | [7 years / 90 days / per policy] | [specific obligation — cite the regulation and specific article or requirement number, not just the regulation name] |
| Denied access attempt | Who was denied, what they tried to access, when, and why | [period] | [driver] |
| Permission change | Who changed what permission, when, and who approved | [period] | [driver] |
| Break-glass access | Full context: who, what, when, justification, and who was notified | [period] | [driver] |
| Delegation grant | Who delegated to whom, what was delegated, and when it expires | [period] | [driver] |
| Delegation expiry / revocation | Who lost delegated access, when, and whether it was automatic or manual | [period] | [driver] |
| Role provisioning | Who was given what role, when, and who approved | [period] | [driver] |
| Role deprovisioning | Who lost what role, when, and what triggered the removal | [period] | [driver] |

Describe what must be recorded in business terms. Do not prescribe specific log field names or data structures — those are implementation decisions.

**Common regulatory obligations for reference** — use only for regulations confirmed as applicable. Verify each obligation against the authoritative regulation text and current version; do not treat these summaries as complete or current:

| Regulation | Commonly cited access logging obligations |
|------------|------------------------------------------|
| GDPR | Article 30: records of processing; access to special category data; ability to reconstruct what data a specific user accessed (for data subject access requests) |
| PCI-DSS | Requirement 10: access to cardholder data, actions by privileged users, invalid access attempts; minimum 12-month retention, 3 months immediately available |
| HIPAA | §164.312(b) audit controls; access to PHI; 6-year retention |
| SOX | Access to financial data, privilege changes, failed access attempts in scope |

### Step 8 — Permission Lifecycle

Permissions that exist at feature launch will drift over time unless lifecycle processes are defined here. Specify:

#### 8a — Provisioning

| Question | What to Specify |
|----------|----------------|
| Who can grant each role? | Named role or team (e.g., "HR system via automated provisioning", "IT admin via access request portal") |
| What approval is required before a role is granted? | Self-service / manager approval / security team approval / none |
| Is provisioning automated (e.g., via HR system integration or identity management tool) or manual? | Specify the mechanism |
| For machine identities: who creates credentials and how are they distributed securely? | Specify the process |

#### 8b — Deprovisioning

| Trigger | Expected Action | Deadline |
|---------|----------------|---------|
| User leaves the organisation | All roles revoked; all active sessions terminated | [e.g., same business day] |
| User changes role or team | Previous roles reviewed; out-of-scope roles revoked; active sessions for revoked roles invalidated | [e.g., within 5 business days] |
| Machine identity decommissioned | Credentials revoked; audit trail retained | [e.g., immediately] |
| Delegation expiry | Delegated permissions automatically revoked; dependent sessions terminated | [at expiry timestamp] |
| Credential revoked mid-session | Active sessions using the revoked credential are terminated | [specify the maximum propagation delay — e.g., within the session validation interval] |
| Periodic access review | All role assignments reviewed; uncertified access revoked | [e.g., quarterly] |

Session invalidation requirements from Step 2c must be reflected in this table for each relevant trigger.

#### 8c — Periodic Review

Specify whether a periodic access review (recertification) process is required for roles introduced by this feature. If yes:
- Who conducts the review?
- How frequently?
- What happens to uncertified access?

### Step 9 — Assemble

**Abstraction check before writing:** Before populating the template, review every table you are about to write. Check that:
- All resource names use plain English (no PascalCase, camelCase, or code-style names)
- All machine identity names are descriptive (no kebab-case or code-style names)
- All enforcement points describe business-level boundaries (no specific technical component names)
- The denied access behavior table describes user experience, not HTTP status codes
- Acceptance criteria reference business outcomes, not technical signals

If any entry fails the check, rewrite it at a higher level of abstraction before continuing.

Populate the `permissions-access-control` template. Structure the document as follows:
1. Authentication boundary summary (including fail-closed behavior)
2. Authorization model statement (model type, least-privilege principle, enforcement point, rationale)
3. Resource sensitivity classification
4. Role definitions — human roles, then machine identities
5. Permission matrix — grouped by role, then by resource within each role
6. Access control rules (ACR-NNN list)
7. Denied access behavior
8. Audit requirements
9. Permission lifecycle (including session invalidation requirements)
10. Acceptance criteria

**Acceptance criteria for permissions:** Every permission matrix entry with an "Allow" or conditional permission must have at least one acceptance criterion verifying the access is granted correctly. Every ACR-NNN rule must have at least one AC verifying the rule is enforced. At least one AC must verify denied access for a representative unauthorized role-action-resource combination.

**AC ID scheme:** `AC-ACR-NNN-N` — e.g., `AC-ACR-001-1`. For matrix-level ACs (not tied to a specific ACR), use `AC-PERM-NNN-N`. IDs are unique within the permissions document and are permanent.

**AC rules for permissions:**
- Every ACR-NNN rule must have at least one AC for the condition-met path and at least one AC for the condition-not-met path.
- At least one AC per role must verify that an explicitly denied or unlisted action results in the documented denied-access behavior (what the user experiences, whether the resource is revealed or concealed).
- Horizontal access boundary rules must have at least one AC verifying that one user cannot access another user's resource.
- Delegation rules must have at least one AC verifying access during the delegation period and at least one AC verifying access is revoked after expiry.
- The `Then` clause must describe the business outcome observable to the user or the business process (e.g., "The system prevents the customer from proceeding", "The record is hidden from results"). Do not reference HTTP status codes, internal logging field names, or authorization engine internals.

**Error-path assessment for permissions:**

The condition-not-met and denied-access AC rules above cover authorization-level error paths. Three additional error-path considerations apply:

1. **Identity provider unavailability:** Write at least one AC verifying the fail-closed (or documented fallback) behavior defined in Step 2a: "Given [the identity provider is unreachable], When [a user attempts to access a protected resource], Then [all access is denied / the documented fallback behavior occurs]." This AC must match the decision recorded in the authentication boundary — if the document says fail-closed, the AC must verify fail-closed.

2. **Session invalidation on mid-session revocation:** Write at least one AC for each session invalidation trigger defined in Step 2c: "Given [a user has an active session and their role is revoked], When [the revocation propagates within the stated delay], Then [the user's session ends and the user can no longer access protected capabilities]."

3. **ACR rules referencing external context:** For ACR rules whose condition depends on external context (time of day, IP range, device trust level), write an AC for what happens when the context cannot be evaluated: "Given [the context source is unavailable], When [a user attempts a context-dependent action], Then [the system denies access / applies the more restrictive default]." If no ACR depends on external context, write `External context unavailability: N/A — no context-dependent ACRs` inline.

## Output

A populated **permissions-access-control** document (use the template at `../assets/permissions-access-control.md`).

### File Output

Write the completed permissions and access control document to `docs/<feature>/requirements-package/requirements/permissions-access-control.md`.

This is Section 8 of the requirements package. It defines the authorization boundary for every capability in the feature.

## Failure Modes This Skill Addresses

| Failure mode | Requirement introduced to address it |
|---|---|
| A capability has no authorization check because it was not specified | The permission matrix requires explicit allow/deny for every role-action-resource combination, with a named enforcement point |
| A user accesses another user's data because data-level access was not specified | Step 5 requires explicit data-level access rules for applicable resources, referenced from the permission matrix |
| A user accesses another user's resource by manipulating an identifier or parameter | Step 5 requires explicit horizontal access boundary rules, with cross-reference to the denial behavior in Step 6 |
| Access denied produces a confusing or security-revealing user experience | Step 6 specifies user-facing behavior for every denial scenario, including exact text with named owner, i18n requirements, and prohibition on revealing internal system structure |
| No access event logging because it was not in the requirements | Step 7 defines audit requirements with retention periods and maps to specific regulatory obligations |
| Regulatory access constraints are missed | Step 5 derives rules from the constraint register; Step 7 derives applicable obligations from confirmed regulations rather than assuming applicability |
| Service accounts accumulate over-privileged access | Steps 1, 3, 4, and 7 treat machine identities as first-class; Step 2b applies least-privilege to all identities with an explicit traceability check |
| A child role inherits unintended permissions, enabling privilege escalation through role hierarchy | Step 3 requires an explicit inheritance conflict resolution rule for every role with a parent |
| Stale permissions accumulate after the feature evolves | Step 8 defines provisioning, deprovisioning, and periodic review processes |
| A conditional permission references a rule that was never written | Step 4 requires every conditional permission to reference a specific ACR-NNN ID defined in Step 5 |
| Temporary delegation becomes permanent | Step 5 requires a full delegation lifecycle: scope, duration, expiry behavior, and revocation mechanism |
| An active session retains access after a role is revoked | Step 2c requires session invalidation triggers to be stated; Step 8b requires session termination to be specified for every relevant deprovisioning event |
| The system fails open when the identity provider is unavailable | Step 2a requires a documented decision on fail-closed versus fail-open behavior |
| Resource sensitivity is assumed rather than stated | Step 1b requires explicit sensitivity classification before permissions are defined, grounding subsequent requirements in a stated business and regulatory expectation |
| Unverified system-behavior claims drive incorrect permissions | Claims about how the existing system currently behaves are tagged `[ASSUMPTION]` with a named owner and resolution deadline; BSA-stated business decisions are treated as stakeholder-confirmed |

**Note:** This skill does not address network-layer access controls, infrastructure firewall rules, cryptographic requirements, or secrets management. Those concerns belong in the non-functional requirements and infrastructure specifications.

## Hand-off Gate

Before proceeding to `nonfunctional-requirements.md`, you must:
1. Verify that every completion criterion below is satisfied. Do not present the document for review until all criteria pass — partial documents must not be acknowledged as complete.
2. Write the completed permissions-access-control document in full.
3. Present it to the user for review, explicitly stating which completion criteria have been met.
4. Receive explicit acknowledgement before proceeding. Explicit acknowledgement means the user has reviewed the presented document and confirmed it is ready to proceed — not merely that they have been shown the list of criteria.

---

## Completion Criteria

- [ ] Authentication mechanism is documented and the binding between identity and role is specified
- [ ] Fail-closed behavior is documented: what the system does when the identity provider is unavailable
- [ ] Access control approach is named (role-based, attribute-based, ownership-based, or custom), with enforcement point(s) and rationale
- [ ] Least-privilege is stated as a governing principle and applied to all roles and machine identities, with an explicit traceability check
- [ ] Resource sensitivity classification is completed for all resource types, with the basis for each classification stated
- [ ] All human roles from the functional spec and user journey maps are defined
- [ ] All machine identities (service accounts, API clients, background jobs) are identified and defined
- [ ] Every role and machine identity has: role name, scope, sensitivity tier, mapped personas or owner, and lifecycle status
- [ ] Every role with a parent has an explicit inheritance conflict resolution rule
- [ ] The permission matrix covers every role-action-resource combination from the functional spec, including machine identities
- [ ] Every row in the permission matrix names a specific enforcement point
- [ ] Every Allow permission in the matrix can be traced to a stated functional requirement
- [ ] Default deny is explicit — unlisted permissions are denied, and the enforcement point responsible for default deny is named
- [ ] Every conditional permission in the matrix references a specific ACR-NNN rule ID
- [ ] Access control rules (ACR-NNN) are documented with enforcement points and sources
- [ ] Horizontal access boundary rules are documented for all resources where one user could access another user's data; absence of a rule is an explicit documented decision
- [ ] Delegation rules include scope, duration, expiry behavior, and revocation mechanism — or delegation is explicitly stated as not applicable with a rationale
- [ ] Break-glass access is either fully defined (authorized roles, conditions, audit requirements) or explicitly stated as not applicable with a rationale
- [ ] Every data-level restriction scenario has an explicit "reveal or conceal resource existence" disclosure decision with justification
- [ ] Every denial scenario has defined user-facing behavior (exact text or a placeholder with named owner and resolution deadline) and system logging
- [ ] If the application is localised, denied access messages are internationalised and do not reveal internal system details — this is a stated requirement, not a deferred concern
- [ ] Audit requirements are documented with retention periods and specific regulatory obligations derived from confirmed applicable regulations, citing specific articles or requirement numbers
- [ ] Audit events include delegation grant/expiry/revocation and role provisioning/deprovisioning
- [ ] Session lifecycle requirements are specified: maximum duration, concurrency policy, and invalidation triggers
- [ ] Session invalidation on mid-session role revocation or credential revocation is specified, with maximum propagation delay stated
- [ ] Permission provisioning process is specified (who grants, what approval, what mechanism)
- [ ] Permission deprovisioning triggers and deadlines are specified for all relevant events, including credential revocation mid-session
- [ ] Every ACR-NNN rule has at least one inline acceptance criterion in Given/When/Then format for the condition-met path and at least one for the condition-not-met path
- [ ] At least one AC per role verifies that an explicitly denied or unlisted action produces the documented denied-access behavior
- [ ] Horizontal access boundary rules have at least one AC verifying cross-user access is blocked
- [ ] Delegation rules (where applicable) have at least one AC for access during delegation and at least one for access revocation after expiry
- [ ] At least one AC verifies the documented fail-closed (or fallback) behavior when the identity provider is unavailable
- [ ] At least one AC per session invalidation trigger verifies that sessions are terminated within the stated propagation delay
- [ ] ACR rules depending on external context have an AC for context-source unavailability, or `External context unavailability: N/A` is stated
- [ ] AC IDs follow the `AC-ACR-NNN-N` or `AC-PERM-NNN-N` scheme and are unique within the document
- [ ] If analysis ran, the constraint register's security and regulatory constraints are reflected in the rules and audit requirements
- [ ] If analysis was skipped, BSA-stated business decisions (roles, access policies, permission scope) are treated as stakeholder-confirmed; only claims about existing system behavior that have not been verified against the codebase or a prior artifact are recorded as `[ASSUMPTION]` with named owners and resolution deadlines
