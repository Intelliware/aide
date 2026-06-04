---
slug: feature-inventory
title: "Feature Inventory"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, qe-analyst]
optional: false
order-hint: 180
---

## 8. Feature Inventory (consumer view)

The consumer-facing index of what the suite proves: every spec / feature file mapped to the application increments, FRs, and ACs it covers, with the canonical tags it carries and the suite-side ownership. `audit-quality-coverage` consults this block as the source of truth for what is and isn't covered; `create-quality-package`'s test-design block cites entries here when claiming a new AC reuses an existing scenario.

This block carries the mapping, not the scenario bodies. The scenario bodies (Given/When/Then steps, assertion details) stay in the internal view and in the repo itself — Part B is the catalogue.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: feature-inventory
---
```

**Inventory:**

| Spec / feature | Scenarios | Tags | Maps to (INC / FR / AC) | Owner |
|---|---|---|---|---|
| `{{spec-1}}` | `{{count-1}}` | `{{tags-1}}` | `{{map-1}}` | `{{owner-1}}` |
| `{{spec-2}}` | `{{count-2}}` | `{{tags-2}}` | `{{map-2}}` | `{{owner-2}}` |
| `{{spec-3}}` | `{{count-3}}` | `{{tags-3}}` | `{{map-3}}` | `{{owner-3}}` |

**Coverage roll-up by application area:**

| Application area | Specs | Scenario count | Critical-path coverage | Last verified |
|---|---|---|---|---|
| `{{area-1}}` | `{{specs-1}}` | `{{count-1}}` | `{{crit-1}}` | `{{verified-1}}` |
| `{{area-2}}` | `{{specs-2}}` | `{{count-2}}` | `{{crit-2}}` | `{{verified-2}}` |

**Coverage roll-up by acceptance-criterion ID:**

| AC ID | Covering spec(s) | Scenario(s) | Coverage depth |
|---|---|---|---|
| `{{ac-1}}` | `{{spec-list-1}}` | `{{scen-list-1}}` | {{depth-1 — full / partial / smoke-only}} |
| `{{ac-2}}` | `{{spec-list-2}}` | `{{scen-list-2}}` | {{depth-2}} |

**Known coverage gaps (consumer-visible):**

| Application capability | Gap reason | Workaround | Tracking ticket |
|---|---|---|---|
| `{{gap-1}}` | `{{reason-1}}` | `{{workaround-1}}` | `{{ticket-1}}` |
| `{{gap-2}}` | `{{reason-2}}` | `{{workaround-2}}` | `{{ticket-2}}` |

**Mapping conventions (binding on consuming skills):**

- A scenario claims coverage of an AC ONLY when it asserts the AC's observable outcome. "Touching" the AC's code path is not coverage.
- `audit-quality-coverage` treats a row with an empty mapping cell as an orphan finding.
- When `create-quality-package` claims an AC is covered by an existing scenario, it MUST cite the scenario by `<spec-id>::<scenario-name>` from this inventory; the audit pass verifies the citation resolves.
- New scenarios authored by `execute-quality-increments` are appended to this inventory in the same change-set that lands the scenario.

**Generation hint:** this inventory is partially regenerable from the suite repo by `{{inventory-script}}`. The mapping columns (INC / FR / AC) are authored by hand and survive regeneration.

