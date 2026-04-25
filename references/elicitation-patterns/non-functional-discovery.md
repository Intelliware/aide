# Elicitation pattern: Non-functional discovery

## Purpose

Captures non-functional requirements (NFRs) — performance, availability,
scalability, security, compliance, observability, accessibility — with
quantitative targets, baselines, and measurement methods. Invoked from
`create-requirements-package` steps 03-analysis and 04-writing so the
`requirements/non-functional-requirements` block has testable NFRs that
the design stage can later translate to technical targets via
`nfr-translation`.

## Inputs needed from user

- NFR categories that apply (performance, availability, scalability, security, compliance, observability, accessibility, usability, maintainability, portability)
- Per-category quantitative targets with baseline + threshold + measurement method
- Compliance regimes that bind the project (cross-checked with `project.elicitation.compliance_regime`)
- Required SLAs / SLOs for the highest-priority user journeys
- Failure-mode tolerances (RTO, RPO)
- Audit / logging / retention requirements

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Which NFR categories apply to this project?** (multi-select)
   - **Format:** multiple-choice (multi-select)
   - **Options:** `performance` / `availability` / `scalability` / `security` / `compliance` / `observability` / `accessibility` / `usability` / `maintainability` / `portability`
   - **Maps to:** drives which sub-prompts run below; populates `requirements.nfrs.categories[]`

### performance (asked when `performance` is selected)

2. **What is the latency budget for the primary user-facing operation?** (state P50 + P99 + measurement method)
   - **Format:** structured `{p50_ms, p99_ms, measurement_method}`
   - **Validation:** numeric, units = ms; method must reference a real telemetry source (e.g. `RUM` / `synthetic` / `APM`)
   - **Maps to:** `requirements.nfrs.performance.latency_budget`

3. **What is the throughput target?** (requests/sec, events/sec, transactions/min)
   - **Format:** structured `{rate, unit, peak_window}`
   - **Validation:** numeric rate + named unit
   - **Maps to:** `requirements.nfrs.performance.throughput`

### availability (asked when `availability` is selected)

4. **What availability target applies?** (e.g. 99.9% / 99.95% / 99.99%)
   - **Format:** multiple-choice
   - **Options:** `99.0` / `99.5` / `99.9` / `99.95` / `99.99` / `99.999` / `other`
   - **Maps to:** `requirements.nfrs.availability.target_pct`

5. **RTO and RPO?** (recovery time objective / recovery point objective)
   - **Format:** structured `{rto_minutes, rpo_minutes}`
   - **Validation:** non-negative integers
   - **Maps to:** `requirements.nfrs.availability.rto_rpo`

### scalability (asked when `scalability` is selected)

6. **What scaling envelope must the system support?** (peak users, peak QPS, growth horizon in months)
   - **Format:** structured `{peak_users, peak_qps, growth_horizon_months}`
   - **Validation:** numeric
   - **Maps to:** `requirements.nfrs.scalability.envelope`

### security (asked when `security` is selected)

7. **Which security threat models apply?** (multi-select)
   - **Format:** multiple-choice (multi-select)
   - **Options:** `data-exfil` / `account-takeover` / `injection` / `dos` / `supply-chain` / `insider-threat` / `physical` / `other`
   - **Maps to:** `requirements.nfrs.security.threats[]`

8. **What authn / authz model is required?**
   - **Format:** multiple-choice
   - **Options:** `oauth2-oidc` / `saml` / `mtls` / `api-keys` / `custom` / `none`
   - **Maps to:** `requirements.nfrs.security.authn_authz`

### compliance (asked when `compliance` is selected OR `project.elicitation.compliance_regime != none`)

9. **Confirm the binding compliance regime(s).**
   - **Format:** multiple-choice (multi-select; pre-fill from `project.elicitation.compliance_regime`)
   - **Options:** `pci-dss` / `hipaa` / `gdpr` / `soc2` / `iso-27001` / `fedramp` / `other`
   - **Maps to:** `requirements.nfrs.compliance.regimes[]`

10. **Which controls must be evidence-able in the artifact?** (e.g. encryption-at-rest, audit-trail, separation-of-duties)
    - **Format:** structured-list
    - **Validation:** each entry references a control ID in the named regime
    - **Maps to:** `requirements.nfrs.compliance.controls[]`

### observability (asked when `observability` is selected)

11. **What signal types are required?** (logs / metrics / traces / events)
    - **Format:** multiple-choice (multi-select)
    - **Options:** `logs` / `metrics` / `traces` / `events`
    - **Maps to:** `requirements.nfrs.observability.signals[]`

12. **What retention period applies?** (logs, metrics, traces — separate values allowed)
    - **Format:** structured `{logs_days, metrics_days, traces_days}`
    - **Validation:** integer days; cross-check against compliance regime minimums
    - **Maps to:** `requirements.nfrs.observability.retention`

### accessibility (asked when `accessibility` is selected)

13. **Which accessibility standard binds this project?**
    - **Format:** multiple-choice
    - **Options:** `wcag-2.1-aa` / `wcag-2.2-aa` / `section-508` / `en-301-549` / `other` / `none`
    - **Maps to:** `requirements.nfrs.accessibility.standard`

**Wrap-up:** Confirm the answers in summary form before proceeding. Read back the selected NFR categories and the quantitative target for each. Re-prompt for any target that lacks a baseline + threshold + measurement-method triple.

## Output format

Answers populate `requirements/non-functional-requirements`. Each NFR carries an ID (`NFR<category>.<n>`).

```toml
[[requirements.nfrs]]
id = "NFR-PERF-1"
category = "performance"
statement = "Order-resolution UI loads under 2s P50, under 5s P99, measured via RUM."
target = { p50_ms = 2000, p99_ms = 5000, measurement = "RUM" }
priority = "must"
rationale = "Operator throughput goal of 30 orders/hour requires sub-2s render."

[[requirements.nfrs]]
id = "NFR-AVAIL-1"
category = "availability"
statement = "Service availability ≥99.95% measured rolling-30d, RTO ≤15min, RPO ≤1min."
target = { availability_pct = 99.95, rto_min = 15, rpo_min = 1 }
priority = "must"
```

## Validation rules

- Every NFR must have a baseline + target + measurement-method triple. Vague NFRs (`fast`, `secure`, `reliable`) are re-prompted.
- The compliance pass cross-references `project.elicitation.compliance_regime`; if the user selects a regime here that contradicts the project-level value, surface the conflict and ask which is authoritative.
- Numeric targets must include units.
- Each NFR has a priority drawn from the same MoSCoW enum the FRs use.

## Reusable across

- `create-requirements-package` (step 03-analysis seeds; step 04-writing finalizes)
- `greenfield-requirements-package` composition (declared as required elicitation)
- `nfr-translation` (consumes the resulting NFR list as input during the design stage)
