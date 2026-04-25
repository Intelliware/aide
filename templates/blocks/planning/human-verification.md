---
slug: human-verification
title: "Human Verification (Human Gate)"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, product-owner, qa]
optional: false
order-hint: 7
---

## Human Verification (Human Gate)

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Human Verification (Human Gate)

1. [Review/verification step requiring human judgment]
2. [Review/verification step requiring human judgment]
3. ...
```

**Rules:**

- Human Gates verify **intent** (does it align with requirements?)
- Focus on things requiring human judgment (design review, requirement alignment, etc.)
- Should be review/validation steps, not execution steps
- Keep to 2-4 items maximum

**Examples:**

- ✅ "Review table structure matches data requirements"
- ✅ "Verify role mapping works correctly"
- ✅ "Confirm seed values match requirements"
- ❌ "Test the system" (this is automated)
- ❌ "Make sure it works" (not specific)

### Worked Example

```
#### Human Verification (Human Gate)

1. Entra app roles configured and assigned
2. Verify a real login can call `/api/me` end-to-end
3. Verify role mapping works correctly
```
