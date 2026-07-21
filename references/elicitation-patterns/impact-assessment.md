# Elicitation pattern: Impact assessment

## Purpose

For brownfield enhancements, identifies the second-order effects of the
proposed change: which existing components / data flows / integrations
get altered or threatened, what regression risk it introduces, what
operational consequences it has (deploy, runbook, on-call), and whether
any of those effects flip a project-level decision-table flag (e.g. the
change touches the schema → the brownfield-enhancement-spec needs the
database-design block). Invoked from the `brownfield-enhancement-spec`
composition right after `change-scope-discovery`.

## Inputs needed from user

- KB cross-references for affected components (probe `consumed_by`, `depends_on`, shared entities)
- Schema changes (additive, breaking, none)
- API contract changes (new endpoint, breaking change, deprecation, none)
- Security boundary changes (new authn, new authz, new data-sensitivity flow)
- Persona / role changes (does the enhancement introduce a new user persona or role, or materially change an existing one)
- Performance impact (likely improvement / neutral / regression risk)
- Data-migration needs (backfill, rewrite, dual-write window)
- Operational impact (new runbook, alert tuning, on-call training)
- Regression-risk areas (which existing flows could break)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **For each affected component (from `change-scope-discovery`), look up its `consumed_by` edges in the KB.** Confirm: does the change break or alter the contract for any consumer?
   - **Format:** structured-list per component of `{consumer, breaking?, mitigation}`
   - **Validation:** auto-populated from `graph.json`; user confirms or amends
   - **Maps to:** `enhancement.impact.consumer_changes[]`

2. **Schema change kind?**
   - **Format:** multiple-choice
   - **Options:** `none` / `additive-only` (new columns/tables, default values for existing rows) / `breaking-with-migration` (rename/drop/retype) / `data-restructuring` (entity split or merge)
   - **Validation:** anything other than `none` flips `project.elicitation.changes_schema = true`
   - **Maps to:** `enhancement.impact.schema_change`

3. **API contract change kind?**
   - **Format:** multiple-choice
   - **Options:** `none` / `additive-new-endpoint` / `additive-new-field` / `breaking-rename-or-remove` / `deprecation-with-sunset`
   - **Validation:** anything other than `none` flips `project.elicitation.changes_api = true`
   - **Maps to:** `enhancement.impact.api_change`

4. **Security boundary change?**
   - **Format:** multiple-choice
   - **Options:** `none` / `new-data-sensitivity-flow` (new PII / PHI / financial data path) / `new-authn-method` / `new-authz-rule` / `new-cross-trust-boundary`
   - **Validation:** anything other than `none` flips `project.elicitation.changes_security_boundary = true`
   - **Maps to:** `enhancement.impact.security_change`

5. **Persona / role impact?** Does this enhancement introduce a new user persona or role, or materially change how an existing one uses the system? (existing personas already live in the KB / discovery baseline — answer for the DELTA only)
   - **Format:** multiple-choice
   - **Options:** `none` (reuses existing personas as-is) / `new-persona` (a user type that did not exist before) / `changes-existing-persona` (materially different goals/workflow for an existing type)
   - **Validation:** anything other than `none` flips `project.elicitation.changes_personas = true` (so the `requirements/stakeholders-personas` block is included and captures only the new/changed persona)
   - **Maps to:** `enhancement.impact.persona_change`

6. **Performance impact?**
   - **Format:** multiple-choice
   - **Options:** `improvement-expected` / `neutral` / `regression-risk-low` / `regression-risk-medium` / `regression-risk-high` / `unknown-need-benchmark`
   - **Validation:** any `regression-risk-*` answer requires a mitigation note
   - **Maps to:** `enhancement.impact.performance_impact`

7. **Data migration needs?**
   - **Format:** multiple-choice + structured details
   - **Options:** `none` / `additive-backfill` / `dual-write-window` / `transform-and-rewrite` / `rolling-shadow-table`
   - **Validation:** non-`none` choices require: `{rows_affected_estimate, downtime_minutes, rollback_window}`
   - **Maps to:** `enhancement.impact.migration`

8. **Operational impact.** (new runbook, alert tuning, on-call training)
   - **Format:** structured-list of `{change_kind, description, owner}` where `change_kind` ∈ `{new-runbook, alert-tuning, on-call-training, dashboard-update, capacity-plan-update}`
   - **Validation:** owner is a named role or person
   - **Maps to:** `enhancement.impact.operational[]`

9. **NFR impact.** Does this change affect any existing NFR target (positively or negatively)?
   - **Format:** structured-list of `{nfr_id, direction, magnitude}` where `direction` ∈ `{improves, neutral, degrades}` and `magnitude` is free-text
   - **Validation:** `degrades` requires a mitigation or an explicit acceptance from the sponsor
   - **Maps to:** `enhancement.impact.nfr_changes[]` ; flips `project.elicitation.changes_nfrs = true` if any entry is non-neutral

10. **Regression risk surfaces.** Which existing user flows / API consumers / batch jobs could break that aren't direct consumers? (think: shared library, shared DB query, shared cache key)
   - **Format:** structured-list of `{flow_or_consumer, hypothesized_breakage, regression_test_to_add}`
   - **Validation:** every entry must propose a regression test to add
   - **Maps to:** `enhancement.impact.regression_surfaces[]`

11. **Communication plan.** Who needs to be told before / during / after the change ships? (downstream-team owners, support, customers)
    - **Format:** structured-list of `{audience, channel, when, message}`
    - **Maps to:** `enhancement.impact.communication[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo: consumer-impact list, schema change, API change, security change, persona/role change, performance impact, migration plan, operational changes, NFR-direction summary, regression surfaces, communication plan. Surface any decision-table flag flips so the user knows which optional blocks just got pulled into the spec. Confirm before authoring the rest of the brownfield-enhancement-spec.

## Output format

Answers populate the impact section of the brownfield-enhancement-spec and flip the relevant gate flags so optional blocks are included.

```toml
[enhancement.impact]
schema_change = "additive-only"
api_change = "additive-new-endpoint"
security_change = "none"
persona_change = "none"
performance_impact = "neutral"

[[enhancement.impact.consumer_changes]]
consumer = "acme-reports/order-rollup-job"
breaking = false
mitigation = "New CSV export endpoint is additive; rollup job continues using JSON list endpoint."

[[enhancement.impact.regression_surfaces]]
flow_or_consumer = "Order list pagination"
hypothesized_breakage = "Filter+export sharing the same query path could regress on edge-case empty filters."
regression_test_to_add = "test: empty-filter export returns 200 + 0-row CSV with header only"

# Auto-flipped:
# project.elicitation.changes_api = true (so design/api-design block is included)
```

## Validation rules

- Every consumer change pulled from the KB must be confirmed (or marked `not-affected-on-review`) before the step exits.
- Non-`none` schema / API / security flags flip the corresponding `project.elicitation.changes_*` flags so the composition pulls in the right optional blocks.
- A `new-persona` / `changes-existing-persona` answer flips `project.elicitation.changes_personas = true` so the `requirements/stakeholders-personas` block is pulled in (captures only the new/changed persona, not the pre-existing roster).
- Regression-risk entries must propose a test to add.
- Migration plans of any kind require numeric estimates of rows-affected, downtime-minutes, and rollback-window.
- NFR `degrades` entries cannot pass without mitigation or explicit sponsor acceptance.

## Reusable across

- `brownfield-enhancement-spec` composition (declared as required elicitation; runs after `change-scope-discovery`)
