---
slug: summary
title: "Summary"
applies-to: [pr-description]
requires-decision-from: [author]
optional: false
order-hint: 1
---

## Summary

The opening section of the PR description. Tells a reviewer **why** the change
exists and **what** it accomplishes — not how it was implemented.

**Format:**

```
## Summary

{{1–3 sentences: what changes, why it matters, which feature / fix it
delivers. Cite the upstream artifact (FR ID, design section, increment
ID, bug ticket) by ID, not by paraphrase.}}
```

**Rules:**

- Lead with the user-visible outcome, not the technical method.
- Cite at least one upstream artifact ID (FR-X.Y, INC-XXX, bug-id) so the
  change is traceable from the PR alone.
- Keep to ≤ 3 sentences. Detail belongs in `change-list` and `test-plan`.

**Examples:**

- ✅ "Adds Microsoft Entra SSO to the staff console (FR1.9.1, FR1.9.2,
  INC-014). New users are JIT-provisioned on first login; existing local
  accounts continue to work unchanged."
- ❌ "Implements authentication." (no outcome, no traceability)
- ❌ "Refactors the auth module to use a new client pattern across three
  services and updates the test harness to support…" (description of how,
  not why)
