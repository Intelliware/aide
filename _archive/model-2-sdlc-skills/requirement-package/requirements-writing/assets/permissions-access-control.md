# Permissions & Access Control

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]
> **Prepared by:** [name]
> **Access control approach:** [role-based / attribute-based / ownership-based / custom — brief statement of the model used]
> **Least-privilege principle:** Applied — all permissions are limited to what is required by each role's defined function

---

## Summary

| Status | Roles | Permissions | Access Control Rules |
|--------|-------|------------|---------------------|
| Existing (unchanged) | | | |
| Modified | | | |
| New | | | |
| **Total** | | | |

---

## 1. Authentication Boundary

| Field | Value |
|-------|-------|
| **Authentication mechanism** | [Single sign-on / federated identity / username-password / shared key / certificate-based / other] |
| **Identity provider** | [IdP name or "Internal"] |
| **Identity-to-role binding** | [How a verified identity maps to a role — e.g., role claim in token / group membership lookup / directory query] |
| **Machine identity authentication** | [How service accounts and API clients prove their identity — shared key / certificate / service account token / other] |
| **Authentication failure behavior** | [What happens when authentication fails — exact redirect URL or error message] |
| **Identity provider unavailable** | [Fail-closed: all access denied / Fallback mechanism — state which — policy decision or existing behavior] |

---

## 2. Authorization Model

| Field | Value |
|-------|-------|
| **Model type** | [Role-based (RBAC) / Attribute-based (ABAC) / Ownership-based / Relationship-based (ReBAC) / Custom] |
| **Least-privilege principle** | All permissions are limited to what is required by each role's defined function. Permissions not traceable to a stated functional requirement are not granted. |
| **Enforcement point** | [the business-level boundary responsible for authorization decisions — e.g., "Mobile app authorization controls", "Operations portal access controls"] |
| **Rationale** | [why this model was chosen for this feature] |
| **Latency constraints** | [any latency requirements on authorization decisions — or "None identified"] |

---

## 3. Resource Sensitivity Classification

| Resource | Sensitivity Tier | Basis for Classification |
|----------|-----------------|--------------------------|
| [resource name — plain English] | [Public / Internal / Confidential / Restricted] | [regulatory obligation / business risk / data type — be specific] |

**Tier definitions:**
- **Public** — no access control required; intentionally exposed without restriction
- **Internal** — accessible to authenticated users; no further restriction required
- **Confidential** — accessible only to named roles; data-level restrictions may apply
- **Restricted** — highest sensitivity; tightly controlled, fully logged, subject to specific regulatory or policy obligations

---

## 4. Role Definitions

### Role: [Role Name]

| Field | Value |
|-------|-------|
| **Role name** | [human-readable name — e.g., "Branch Manager"] |
| **Scope** | [what this role has access to — all data / own branch / own account] |
| **Sensitivity tier** | [highest sensitivity tier of resources this role can access — from Section 2] |
| **Hierarchy** | [parent role name, or "No parent — top-level role"] |
| **Inheritance conflict rule** | [if hierarchy is non-empty: direct wins / parent wins / most-restrictive wins / most-permissive wins — leave blank only if no hierarchy] |
| **Mapped personas** | [persona names from stakeholder-personas] |
| **Status** | [Existing / Modified / New] |
| **Description** | [what this role represents and when it is assigned] |

### Machine Identity: [Identity Name]

| Field | Value |
|-------|-------|
| **Identity name** | [descriptive plain-English name — e.g., "Payments platform service", "Reporting batch process"] |
| **Type** | [Service account / API client / Background job / External system] |
| **Authentication method** | [shared key / certificate / service account token / other] |
| **Scope** | [resources and actions this identity requires — must satisfy least-privilege] |
| **Owner** | [team or role responsible for credentials and lifecycle] |
| **Status** | [Existing / Modified / New] |

---

## 5. Permission Matrix

> **Default deny:** Any role-action-resource combination not explicitly listed below is **Denied**. The enforcement point named in each row is responsible for implementing default deny.

### [Role Name] Permissions

| Action | Resource | Permission | Condition | Enforcement Point | Status | Req Ref |
|--------|----------|-----------|-----------|------------------|--------|---------|
| [create / read / update / delete / execute / export] | [business object / screen / capability — plain English] | [Allow / Deny] | [unconditional / ACR-NNN] | [business-level boundary — e.g., "Mobile app authorization controls"] | [Existing / Modified / New] | [REQ-xxx] |

> Repeat this table for each role and machine identity. Group by role, then by resource within each role.

---

## 6. Access Control Rules

| Rule ID | Description | Condition | Effect | Enforcement Point | Source |
|---------|-------------|-----------|--------|------------------|--------|
| ACR-001 | [rule name] | [when this rule applies] | [deny / restrict to own records / escalate / log] | [where this rule is evaluated] | [constraint register entry / business rule / regulatory requirement] |

> Every `Condition` cell in the Permission Matrix that references an ACR-NNN must have a corresponding row in this table.

---

## 7. Denied Access Behavior

| Scenario | What the User Experiences | What the Business Expects to Happen | Notes |
|----------|--------------------------|-------------------------------------|-------|
| Unauthenticated access | [login prompt / error page — describe the experience] | [Attempt is recorded; user is redirected to sign in] | — |
| Insufficient role | [access denied message — describe what the user sees] | [Denied attempt is recorded for audit] | — |
| Data-level restriction — resource exists but out of scope | [see information disclosure decision below] | [Filtered access attempt is recorded for audit] | See decision |
| Data-level restriction — filtered result set | ["no results" state or filtered list] | [Query filtering is recorded] | — |
| Break-glass access denied | [specific denial message] | [Security team is alerted; full context is recorded] | — |

**Information disclosure decisions:**

For each data-level restriction, document whether the system tells the user access is denied (resource existence revealed) or behaves as if the resource does not exist (resource existence concealed):

| Resource | Decision | Rationale |
|----------|----------|-----------|
| [resource name — plain English] | [Access denied / Resource hidden] | [why — e.g., "existence of this record is not sensitive" or "confirming existence would itself constitute a disclosure"] |

---

## 8. Audit Requirements

| Event Type | What Must Be Recorded | Retention Period | Regulatory Driver |
|-----------|----------------------|-----------------|-------------------|
| Successful access to sensitive data | Who accessed what, when, and the outcome | [period] | [specific obligation — cite regulation and article/requirement number] |
| Denied access attempt | Who was denied, what they tried to access, when, and why | [period] | [driver] |
| Permission change | Who changed what permission, when, and who approved | [period] | [driver] |
| Break-glass access | Full context: who, what, when, justification, and who was notified | [period] | [driver] |
| Delegation grant | Who delegated to whom, what was delegated, and when it expires | [period] | [driver] |
| Delegation expiry / revocation | Who lost delegated access, when, and whether it was automatic or manual | [period] | [driver] |
| Role provisioning | Who was given what role, when, and who approved | [period] | [driver] |
| Role deprovisioning | Who lost what role, when, and what triggered the removal | [period] | [driver] |

*Only include rows applicable to this feature. If no regulatory obligations apply, state: "No regulatory logging obligations identified — internal policy applies: [policy name]."*

---

## 9. Session Lifecycle

| Field | Value |
|-------|-------|
| **Maximum session duration** | [duration before re-authentication is required, or "Not applicable — rationale:"] |
| **Concurrent sessions** | [Permitted / Not permitted / Limited to [N] per identity] |
| **Session invalidation triggers** | [list all events that must terminate active sessions — e.g., role change, credential revocation, admin action, inactivity timeout] |
| **Mid-session role revocation behavior** | [Immediate termination / Graceful drain with deadline — specify] |
| **Machine identity credential rotation** | [Rotation frequency or event-triggered — specify] |

---

## 10. Permission Lifecycle

### Provisioning

| Question | Specified Value |
|----------|----------------|
| Who can grant each role? | [named role or team — e.g., "IT admin via access request portal"] |
| Approval required before granting? | [Self-service / Manager approval / Security team approval / None] |
| Provisioning mechanism | [Automated via [system name] / Manual — describe process] |
| Machine identity credential creation and distribution | [process for creating credentials and distributing them securely] |

### Deprovisioning

| Trigger | Expected Action | Deadline |
|---------|----------------|---------|
| User leaves the organisation | All roles revoked; all active sessions terminated | [e.g., same business day] |
| User changes role or team | Out-of-scope roles revoked; active sessions for revoked roles invalidated | [e.g., within 5 business days] |
| Machine identity decommissioned | Credentials revoked; audit trail retained | [e.g., immediately] |
| Delegation expiry | Delegated permissions automatically revoked; dependent sessions terminated | [at expiry timestamp] |
| Credential revoked mid-session | Active sessions using the revoked credential are terminated | [maximum propagation delay — e.g., within [N] minutes] |
| Periodic access review | All role assignments reviewed; uncertified access revoked | [e.g., quarterly] |

### Periodic Review

| Field | Value |
|-------|-------|
| **Review required?** | [Yes / No — if No, state rationale] |
| **Conducted by** | [role or team] |
| **Frequency** | [quarterly / annually / other] |
| **Uncertified access outcome** | [automatic revocation / escalation for manual decision] |

---

## Acceptance Criteria

Acceptance criteria verifying that the permission model is correctly enforced. Each AC targets a specific authorization decision — allow, deny, conditional, or boundary enforcement.

### Access Control Rule Criteria

```
AC-ACR-NNN-1: [Condition met — access granted]
Given: [A user/identity with role meeting ACR-NNN condition]
When:  [The controlled action is attempted on the target resource]
Then:  [Access is granted — state the observable outcome]

AC-ACR-NNN-2: [Condition not met — access denied]
Given: [A user/identity with role NOT meeting ACR-NNN condition]
When:  [The controlled action is attempted on the target resource]
Then:  [Access is denied — describe what the user experiences and the business outcome]
```

### Permission Matrix Criteria

```
AC-PERM-NNN-1: [Authorized role — access granted]
Given: [A user with role [role name] authenticated to the system]
When:  [The user performs [action] on [resource]]
Then:  [The action succeeds — state the observable outcome]

AC-PERM-NNN-2: [Unauthorized role — access denied]
Given: [A user with role [role name] that does NOT have permission for [action] on [resource]]
When:  [The user attempts [action] on [resource]]
Then:  [The system prevents the action — describe what the user experiences per the disclosure decision]
```

### Horizontal Boundary Criteria

```
AC-PERM-NNN-3: [Cross-user access blocked]
Given: [User A owns resource X; User B has the same role but does NOT own resource X]
When:  [User B attempts to access resource X]
Then:  [Access is denied — describe what User B experiences per the disclosure decision]
```

### Delegation Criteria (if applicable)

```
AC-PERM-NNN-4: [Delegated access active]
Given: [User A has delegated [permission] to User B, delegation period is active]
When:  [User B performs the delegated action]
Then:  [Access is granted and the delegation is recorded for audit]

AC-PERM-NNN-5: [Delegated access expired]
Given: [The delegation period for User B has expired]
When:  [User B attempts the formerly delegated action]
Then:  [Access is denied — delegation is no longer active]
```

*If delegation is not applicable, write: Delegation acceptance criteria — not applicable: [rationale].*

### Infrastructure Error-Path Criteria

```
AC-PERM-NNN-6: [Identity provider unavailable — fail-closed]
Given: [The identity provider is unreachable or unresponsive]
When:  [A user attempts to access any protected resource]
Then:  [All access is denied / documented fallback behavior occurs — must match the decision in the Authentication Boundary section]
```

```
AC-PERM-NNN-7: [Session terminated on mid-session role revocation]
Given: [A user has an active session and their role or credential is revoked]
When:  [The revocation propagates within the stated maximum delay]
Then:  [The user's session ends and the user can no longer access protected capabilities]
```

### External Context Unavailability Criteria (if applicable)

```
AC-ACR-NNN-3: [Context source unavailable — access denied]
Given: [An ACR rule depends on [context type — e.g., IP range, device trust, time-of-day] and the context source is unavailable]
When:  [A user attempts the context-dependent action]
Then:  [Access is denied / the more restrictive default is applied]
```

*If no ACR depends on external context, write: External context unavailability — not applicable: no context-dependent ACR rules.*

---

## Assumptions

| # | Assumption | Owner | Resolution Deadline | Impact if Wrong |
|---|-----------|-------|--------------------|----|
| 1 | [assumption about permissions or authorization model] | [named individual or team responsible for verifying this] | [date or milestone] | [consequence if the assumption is invalidated] |

*If all permissions are derived from analysis artifacts or system-verified, write: All permission definitions are evidence-backed — no assumptions.*

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| [date] | Initial draft | |
