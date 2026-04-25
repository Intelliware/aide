---
slug: escape-hatch
sequence: 2
depends-on-prior: true
---

# Step 2 — Escape-hatch check

After orientation, evaluate whether the change still belongs in quick-dev.

## Trigger conditions

If **any** of the following are true, halt the quick-dev flow:

| Condition | Why it disqualifies quick-dev |
|---|---|
| Change touches more than ~5–7 files | Coordination cost grows beyond what a single increment can absorb |
| Crosses module or layer boundaries | Needs design-stage architectural reasoning |
| Requires new data models | Schema-level decisions need full requirements + design |
| Requires new API endpoint design | Contract decisions need design package + traceability |
| Affected code has complex interdependencies | Architectural analysis required |
| Plan would need >3 increments | Quick-dev's reduced shape is not the right fit |

## What to do when triggered

1. Halt — do not produce a quick-dev plan.
2. Tell the user which condition triggered the escape hatch and why.
3. Recommend the elaborate pipeline:
   - For most cases: `create-requirements-package` → `create-design-package` → `create-implementation-package`
   - When requirements already exist: skip to `create-design-package`
   - When requirements + design exist: skip to `create-implementation-package`
4. Offer to migrate the quick-dev spec content into the requirements package
   as starting material rather than discarding it.

## What NOT to do

- Do not silently bend quick-dev to fit a larger change. The reduced
  increment shape will hide problems that the elaborate shape would surface.
- Do not split a too-large change into many quick-dev plans. That re-creates
  planning overhead without the design-stage rigor.

## Hand-off prompt

> "This appears too large or risky for the expedited path because: <reasons>.
> I recommend switching to the full pipeline starting at
> `<recommended-skill>`. Want me to migrate the quick-dev spec into a
> requirements package as the starting point?"
