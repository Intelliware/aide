---
slug: outcome
title: "Outcome"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev]
optional: false
order-hint: 5
---

## Outcome

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Outcome

- [Measurable deliverable 1]
- [Measurable deliverable 2]
- ...
```

**Rules:**

- Outcomes are **measurable deliverables**
- Use bullet points
- Each outcome should be verifiable
- Focus on what exists/works after the increment completes

**Examples:**

- ✅ "user_account table exists with proper constraints"
- ✅ "JWT validation works"
- ✅ "RBAC is enforced"
- ❌ "Authentication is done" (not measurable)

### Worked Example

```
#### Outcome

- Spring Security OAuth2 Resource Server is configured
- Entra JWT validation works
- Role mapping from JWT works
- `/api/me` endpoint exists and returns user info
- JIT user provisioning works
```
