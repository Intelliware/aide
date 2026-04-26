---
slug: success-criteria
title: "Success Criteria"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, product-owner]
optional: false
order-hint: 8
---

## Success Criteria

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Success Criteria

✅ [Criterion 1]
✅ [Criterion 2]
✅ ...
```

**Rules:**

- Success Criteria are **binary** (done or not done)
- Use checkboxes (✅) for visual clarity
- Each criterion should be independently verifiable
- Completion is binary — all criteria must be met
- Keep to 4-8 items maximum

**Examples:**

- ✅ "user_account table created"
- ✅ "JWT validation works"
- ✅ "RBAC enforced"
- ✅ "Integration tests pass"
- ❌ "Authentication is good" (not binary/verifiable)

### Common Mistake — Success criteria are subjective

- Bad: "Authentication works well"
- Good: "✅ OAuth2 Resource Server configured, ✅ JWT validation works, ✅ /api/me endpoint functional"

### Common Mistake — FR mappings are implicit

- Bad: "This increment implements authentication"
- Good: "FR Mapping: FR1.9.1 Single Sign-On support, FR1.9.2 Microsoft Entra ID integration"

### Worked Example

```
#### Success Criteria

✅ OAuth2 Resource Server configured
✅ JWT validation works
✅ Role mapping works
✅ `/api/me` endpoint functional
✅ JIT provisioning works
✅ RFC7807 errors implemented
```
