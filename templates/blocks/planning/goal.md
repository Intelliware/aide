---
slug: goal
title: "Goal"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, architect]
optional: false
order-hint: 2
---

## Goal

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Goal

[Single sentence describing the system state after this increment completes]
```

**Rules:**

- Goals describe **system state**, not effort
- Use present tense: "The system can..." or "X exists..."
- Be specific and measurable
- Avoid implementation details (save for Plan section)

**Examples:**

- ✅ "The system can authenticate users, issue secure tokens, and enforce role-based access for protected backend endpoints."
- ✅ "Shared taxonomies used by Practitioners, Projects, Open Roles, and Matching are created and seeded with initial values."
- ❌ "Implement authentication" (too vague)
- ❌ "Work on taxonomies" (describes effort, not state)

### Common Mistake — Goals describe effort

- Bad: "Implement authentication system"
- Good: "The system can authenticate users and issue secure tokens"
