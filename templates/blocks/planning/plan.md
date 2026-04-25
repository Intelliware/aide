---
slug: plan
title: "Plan"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, architect]
optional: false
order-hint: 4
---

## Plan

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Plan

1. [Action verb] [what] [how/where]
2. [Action verb] [what] [how/where]
3. ...
```

**Rules:**

- Plans are **instructions**, not explanations
- Use imperative mood (action verbs: create, implement, configure, add, etc.)
- Be specific enough that another AI or developer could execute blindly
- Order steps logically (dependencies first)
- Each step should be independently verifiable

**Examples:**

- ✅ "Create user_account table with constraints (unique entra_oid; case-insensitive email uniqueness)"
- ✅ "Implement Entra JWT validation"
- ✅ "Configure Spring Security OAuth2 Resource Server"
- ❌ "Set up authentication" (too vague)
- ❌ "Work on user accounts" (not an instruction)

### Common Mistake — Plans are explanations

- Bad: "Authentication is implemented using OAuth2"
- Good: "Configure Spring Security OAuth2 Resource Server"

### Worked Example

```
#### Plan

1. Configure Spring Security OAuth2 Resource Server
2. Implement Entra JWT validation
3. Implement role mapping from JWT `roles` claim
4. Create `GET /api/me` endpoint
5. Implement JIT `user_account` provisioning by Entra `oid`
6. Implement standard RFC7807 errors for authn/authz failures
```
