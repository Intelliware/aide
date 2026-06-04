---
slug: ci-surface
title: "CI Surface"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, devops]
optional: false
order-hint: 190
---

## 9. CI Surface

The CI integration points a consumer needs to know about: which pipelines invoke the suite, what each one gates, where the artefacts land, and how to read the results. `create-quality-package` cites the gating semantics in its release-gates block; the deploy and operations skills consume the artefact paths.

This block is a consumer-grade summary, not the full pipeline-by-pipeline detail (that's the internal view's `ci-integration` block). What appears here is what every consumer can rely on without reading the pipeline YAML.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: ci-surface
---
```

**Gating pipelines (what blocks what):**

| Pipeline | Triggers on | Scope | Gates |
|---|---|---|---|
| PR validation | Every PR to a covered application repo | `@smoke` + `@inc-<PR-touched>` | Merge blocked on failure |
| Pre-deploy gate (per env) | Deploy initiation to `qa` / `stage` / `prod` | `@smoke` + `@critical` against the target env | Deploy blocked on failure |
| Nightly regression | Cron `{{cron}}` | `@regression` across all envs | Alerts on-call; does not auto-block |
| Post-deploy smoke | After a deploy completes | `@smoke` against the new deploy | Rollback trigger on failure |
| Scheduled prod synthetic | Cron `{{cron}}` | `@smoke @readonly` against `prod-readonly` | PagerDuty page on failure (no block) |

**Artefact paths (CI-uploaded, retention listed):**

| Artefact | Path | Retention | Use case |
|---|---|---|---|
| HTML report | `{{ci-html-path}}` | 30 days | Triage failed runs visually |
| JUnit XML | `{{ci-junit-path}}` | 90 days | Trend dashboards |
| JSON results | `{{ci-json-path}}` | 30 days | `audit-quality-coverage` ingest |
| Traces (failures only) | `{{ci-trace-path}}` | 14 days | `review-test-failures` step-by-step replay |

**Dashboards (consumer-readable, no auth beyond company SSO):**

| Dashboard | URL | What it answers |
|---|---|---|
| Pass-rate trend | `{{pass-rate-url}}` | "Is the suite getting greener or redder over time?" |
| Duration trend | `{{duration-url}}` | "Is the suite getting slower?" |
| Flake-rate trend | `{{flake-url}}` | "Which scenarios flake most often?" |
| Coverage roll-up | `{{coverage-url}}` | "Which application areas are under-covered?" |

**Notification channels:**

| Channel | Audience | What it carries |
|---|---|---|
| `#{{slack-pass-channel}}` | All engineering | Daily summary: nightly pass-rate, top flakes, queue size |
| `#{{slack-fail-channel}}` | On-call + QE | Real-time alerts on `@critical` failures |
| PagerDuty `{{pd-service}}` | On-call | Prod synthetic failures, deploy-gate failures |

**How quality-stage skills use this surface:**

- `create-quality-package` cites the gating pipelines in its release-gates block; the package's exit criteria match the suite's actual blocking behaviour.
- `audit-quality-coverage` reads JSON results from the artefact paths to compute coverage.
- `review-test-failures` consumes the HTML report + traces during triage, and surfaces the notification channel that fired so triage can be cross-referenced with the original alert.

