---
slug: assumptions-constraints-out-of-scope
title: "Assumptions, Constraints & Out of Scope"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec, quick-dev-spec]
requires-decision-from: [stakeholder, product-owner]
optional: false
order-hint: 12
---

# 12. Assumptions, Constraints & Out of Scope

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define boundaries and limitations. This prevents scope creep and misaligned expectations.

---

## 12.1 Business Assumptions

<!-- Things we are assuming to be true. If these change, requirements may need revisiting. -->

- [e.g., Users have corporate email addresses and Entra ID accounts]
- [e.g., Practitioners have a single primary role (not multi-role)]
- [e.g., All users work in the same time zone]

## 12.2 Constraints

| Constraint Type | Constraint | Impact |
|----------------|-----------|--------|
| Budget | [e.g., Fixed budget of $X] | [e.g., Limits scope to core features] |
| Time | [e.g., Must launch by Q3 2026] | [e.g., Phased delivery approach] |
| Technology | [e.g., Must use approved corporate tech stack] | [e.g., Limits framework choices] |
| Regulatory | [e.g., Must comply with data residency requirements] | [e.g., Hosting region restricted] |
| Organizational | [e.g., Must integrate with existing HR system] | [e.g., API dependency] |

## 12.3 Out of Scope

<!-- Explicit list of what we are NOT building. This is critical for managing expectations. -->

- [e.g., Mobile native application (web responsive only)]
- [e.g., Integration with third-party project management tools]
- [e.g., Automated invoicing or billing]
- [e.g., Multi-language support (English only for v1)]

## 12.4 Future Considerations

<!-- Items explicitly deferred but acknowledged for future stages. -->

- [e.g., Mobile app — Phase 2]
- [e.g., AI-powered skill matching — Phase 3]
- [e.g., Multi-tenant support — if business requires]
