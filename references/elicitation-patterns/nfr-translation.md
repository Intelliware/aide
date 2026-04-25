# Elicitation pattern: NFR translation

## Purpose

Translates the requirements-stage NFRs (which speak in business terms —
"95% of users see results within 2 seconds") into technical-stage targets
(specific budgets per layer — "edge cache 50ms + API 200ms + DB query
1000ms = 1250ms cumulative budget; remaining 750ms allocated to network +
client render"). Invoked from `create-design-package` step 02-design so
the `design/non-functional-requirements-technical` block has actionable
budgets that engineers can implement and observability can measure.

## Inputs needed from user

- The requirements-stage NFR list (input — no re-elicitation; pulled from `requirements.nfrs`)
- Per-NFR layer-by-layer budget allocation
- Measurement methods per layer (synthetic, RUM, APM, log-based)
- Alert thresholds (warn / critical)
- Confirmation that each budget is achievable with the chosen tech stack

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

For each NFR in `requirements.nfrs`, run the loop below.

1. **Restate the NFR.** Show the user the requirements-stage statement and target.
   - **Format:** echo only — no input
   - **Maps to:** `design.nfrs[].source = <NFR ID>`

2. **Decompose the target across layers.** (For latency NFRs, use: client → edge → API → service → database. For availability NFRs, use: per-component availability targets that compose to the overall.)
   - **Format:** structured per layer `{layer, budget, unit}`
   - **Validation:** sum of per-layer budgets ≤ overall target (latency); product of per-layer availabilities ≥ overall (availability)
   - **Maps to:** `design.nfrs[].layer_budgets`

3. **What is the measurement method for each layer?**
   - **Format:** multiple-choice per layer
   - **Options:** `synthetic-probe` / `RUM` / `APM-trace` / `log-based-aggregate` / `metric-counter` / `none-yet`
   - **Validation:** must reference a tool that exists in `project.elicitation.observability_stack` (warn on mismatch)
   - **Maps to:** `design.nfrs[].measurement[]`

4. **Set the alert thresholds.**
   - **Format:** structured `{warn_at, critical_at}` per layer
   - **Validation:** `warn_at < critical_at < layer_budget`
   - **Maps to:** `design.nfrs[].alerts`

5. **Is the budget achievable with the chosen tech stack?** (sanity-check against `design.tech_stack`)
   - **Format:** yes/no with rationale
   - **Validation:** `no` triggers an addendum to `design.adrs` recording the gap
   - **Maps to:** `design.nfrs[].feasibility_assessment`

6. **For availability NFRs, declare the failure-recovery posture.**
   - **Format:** multiple-choice
   - **Options:** `active-active` / `active-passive` / `pilot-light` / `cold-standby` / `single-region-no-dr`
   - **Maps to:** `design.nfrs[].recovery_posture`

7. **For scalability NFRs, declare the scaling strategy.**
   - **Format:** structured `{strategy, trigger_metric, scale_unit}`
   - **Validation:** `strategy` ∈ `{vertical, horizontal-stateless, horizontal-sharded, queue-based, event-driven-fanout}`
   - **Maps to:** `design.nfrs[].scaling_strategy`

8. **For security NFRs, name the technical control(s) implementing it.**
   - **Format:** structured-list `{control, location, evidence_source}`
   - **Validation:** every requirements-stage threat has at least one control listed
   - **Maps to:** `design.nfrs[].security_controls`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print a per-NFR table showing source NFR ID, layer budgets, measurement methods, alert thresholds, feasibility verdict. Re-prompt any NFR whose layer budgets do not sum/compose correctly. Confirm before writing the non-functional-requirements-technical block.

## Output format

Answers feed `design/non-functional-requirements-technical`.

```toml
[[design.nfrs]]
id = "TECH-NFR-PERF-1"
source = "NFR-PERF-1"
overall_target = "P50 ≤2000ms, P99 ≤5000ms"

[[design.nfrs.layer_budgets]]
layer = "client-render"
budget_ms = 300

[[design.nfrs.layer_budgets]]
layer = "edge-cache"
budget_ms = 50

[[design.nfrs.layer_budgets]]
layer = "api-gateway"
budget_ms = 100

[[design.nfrs.layer_budgets]]
layer = "service-handler"
budget_ms = 800

[[design.nfrs.layer_budgets]]
layer = "database-query"
budget_ms = 600

[design.nfrs.alerts]
warn_at = "P50 > 1500ms"
critical_at = "P50 > 2000ms"

feasibility_assessment = "achievable; nest-fastify + postgres pgbouncer measured at 650ms P99 in benchmark"
```

## Validation rules

- Layer budgets for a latency NFR must sum to ≤ the overall target.
- Per-component availability targets must compose (multiplicatively) to ≥ the overall availability target.
- Measurement methods must reference a tool that exists in `project.elicitation.observability_stack`; otherwise warn and prompt the user to add the tool.
- Alert thresholds satisfy `warn_at < critical_at < budget`.
- Every threat from `requirements.nfrs.security.threats` is covered by at least one control here.
- A `no` feasibility verdict cannot pass without an accompanying ADR entry recording the constraint.

## Reusable across

- `create-design-package` (step 02-design)
- `greenfield-design-package` composition (declared as required elicitation)
