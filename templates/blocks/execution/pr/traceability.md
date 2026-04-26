---
slug: traceability
title: "Traceability"
applies-to: [pr-description]
requires-decision-from: [author]
optional: false
order-hint: 4
---

## Traceability

The link table that closes the loop between the upstream package and the
shipped diff. The reviewer uses this to confirm the PR delivers what was
specified — and the future maintainer uses it to find out **why** the
code looks the way it does.

**Format:**

```
## Traceability

| Type | ID | Title | Notes |
|---|---|---|---|
| Requirement | FR-X.Y | {{FR title}} | {{covered fully / partial}} |
| Increment | INC-XXX | {{increment title}} | {{covered fully / partial}} |
| Design section | {{section ref}} | {{section title}} | {{covered fully / partial}} |
| Bug | {{ticket-id}} | {{ticket title}} | {{fixes / mitigates}} |
| ADR | ADR-XXX | {{decision title}} | {{follows / supersedes}} |
```

**Rules:**

- Every row points to an artifact that already exists; do not invent IDs.
- A PR that delivers an INC must cite that INC.
- Partial coverage is allowed — note the remainder and where it lives.
- ADR rows are required when the change introduces or supersedes a
  durable architecture decision.

**Examples:**

- ✅ "FR1.9.1 | Microsoft Entra ID integration | covered fully"
- ✅ "INC-014 | Staff SSO via Entra | partial — JIT provisioning
  delivered; group sync deferred to INC-015"
- ❌ "Implements the auth feature" (not a citation)

### Common Mistake — missing the upstream artifact

If you cannot fill at least one row, the change probably should not be
landing as a single PR. Either author a quick-dev spec first, or break
the change apart so each PR has a clear upstream owner.
