# Elicitation pattern: Business objectives

## Purpose

Captures the "why" of the project — measurable business outcomes, success
metrics, hard constraints, and the timebox. Invoked early in
`create-requirements-package` (step 01-discovery) so the
executive-summary-business-context block has clear objectives that every
functional requirement can be tested against ("does this FR move at least
one objective forward?").

## Inputs needed from user

- Primary business outcomes (1-5 ranked outcomes)
- Quantitative success metrics for each outcome
- Strategic drivers (compliance, competitive, efficiency, growth, retention)
- Hard constraints (budget, calendar, team, technology, regulatory)
- Timebox / deadline
- Out-of-scope statements (what we are deliberately NOT chasing)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **State the primary business outcome in one sentence.** (What changes for the business if this is successful?)
   - **Format:** free-text
   - **Validation:** non-empty; <=240 chars
   - **Maps to:** `requirements.business_outcomes[0].statement`

2. **What measurable signal will tell you the outcome was achieved?** (e.g. "order-handling time drops from 8 min to 2 min", "support tickets / week drops 30%")
   - **Format:** free-text (with units)
   - **Validation:** must include a number + a unit + a baseline (re-prompt if vague)
   - **Maps to:** `requirements.business_outcomes[0].metric`

3. **Loop: list any secondary outcomes.** (add until `done`; same statement+metric format)
   - **Format:** structured-list
   - **Validation:** each entry has both statement and metric
   - **Maps to:** `requirements.business_outcomes[]`

4. **Which strategic driver is the strongest motivator?**
   - **Format:** multiple-choice
   - **Options:** `compliance` / `competitive-pressure` / `operational-efficiency` / `revenue-growth` / `customer-retention` / `cost-reduction` / `risk-reduction` / `other`
   - **Maps to:** `requirements.strategic_driver`

5. **What is the timebox?** (deadline date or duration target)
   - **Format:** free-text (date or "N weeks")
   - **Validation:** parseable as ISO date OR a duration string
   - **Maps to:** `requirements.timebox`

6. **Loop: list the hard constraints that bound this work.** (budget cap, headcount cap, vendor lock-in, regulatory, technology constraint — add until `done`)
   - **Format:** structured-list of `{constraint_type, description}`
   - **Validation:** `constraint_type` must be one of `budget` / `calendar` / `team` / `technology` / `regulatory` / `vendor` / `other`
   - **Maps to:** `requirements.constraints[]`

7. **What is explicitly OUT of scope?** (one bullet per item; this is a hard list, not a "maybe later")
   - **Format:** structured-list (free-text bullets)
   - **Validation:** at least one entry encouraged (warn if empty)
   - **Maps to:** `requirements.out_of_scope[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Read back the ranked outcomes with their metrics, the chosen strategic driver, the timebox, the constraints, and the explicit out-of-scope list. Confirm before writing the executive-summary-business-context block.

## Output format

Answers populate `requirements/executive-summary-business-context`.

```toml
[requirements.business_context]
strategic_driver = "operational-efficiency"
timebox = "2026-Q3"

[[requirements.business_outcomes]]
statement = "Reduce order-handling time"
metric = "from 8 min to 2 min P50 within 90 days of launch"

[[requirements.constraints]]
type = "budget"
description = "Capped at $250k FY26 build cost"

[[requirements.constraints]]
type = "regulatory"
description = "Must remain SOC2-Type-II compliant"
```

## Validation rules

- At least one primary business outcome with a quantitative metric is required.
- Metrics must include a baseline + target + timeframe; vague statements like "improve performance" are re-prompted.
- `timebox` must be either an ISO date (YYYY-MM-DD), a fiscal quarter (e.g. `2026-Q3`), or a relative duration (`12 weeks`).
- Each constraint must have both a `type` (from the enum) and a one-line description.

## Reusable across

- `create-requirements-package` (step 01-discovery; the executive-summary-business-context block is built directly from these answers)
- `greenfield-requirements-package` composition (declared as required elicitation)
