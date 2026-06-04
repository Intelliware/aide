---
slug: ci-integration
title: "CI Integration"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, devops]
optional: false
order-hint: 240
---

## 14. CI Integration

Document every place the suite runs in CI: the pipeline files, the triggering conditions, the tag-subset selection, the runner image / agent pool, the artefact upload and retention, and the gating semantics ("does a failing scenario block the merge / deploy?"). The reader should be able to trace any CI failure back to the exact pipeline definition that produced it.

Be explicit about gating. "Tests run in CI" is not the same as "tests gate the deploy"; suites that report results without blocking become decorative. Spell out what each pipeline blocks, what it warns on, and what it ignores.

### Suggested template content

**Pipelines invoking the suite:**

| Pipeline | File | Trigger | Tag subset | Gating | Notification |
|---|---|---|---|---|---|
| PR validation | `{{pr-pipeline}}` | Every PR | `@smoke` + `@inc-<PR-touched>` | ✅ blocks merge | PR check status |
| Nightly regression | `{{nightly-pipeline}}` | Cron `{{cron}}` | `@regression` | ⚠️ warns; alerts on-call | Slack `#{{nightly-channel}}` |
| Pre-deploy gate | `{{deploy-pipeline}}` | On `{{trigger}}` to `{{env}}` | `@smoke` + `@critical` | ✅ blocks deploy | Deploy dashboard |
| Post-deploy smoke | `{{postdeploy-pipeline}}` | After deploy to `{{env}}` | `@smoke` against the new env | ⚠️ rollback trigger | PagerDuty |
| Scheduled prod synthetic | `{{synthetic-pipeline}}` | Cron `{{cron}}` | `@smoke @readonly` against `prod-readonly` | ❌ alerts only; no gating | PagerDuty |

**Runner image / agent pool:**

| Pipeline | Image / pool | Why |
|---|---|---|
| `{{pr-pipeline}}` | `{{pr-image}}` | Standard Linux + headed Chromium |
| `{{deploy-pipeline}}` | `{{deploy-image}}` | Same image; tighter security boundary |
| `{{nightly-pipeline}}` | `{{nightly-image}}` | Larger pool for full parallelism |

**Artefact upload:**

| Artefact | Pipeline(s) | Retention | Path |
|---|---|---|---|
| HTML report | All | 30 days | `{{html-artefact-name}}` |
| JUnit XML | All | 90 days | `{{junit-artefact-name}}` |
| Traces (failures only) | All | 14 days | `{{trace-artefact-name}}` |

**Secrets injected into CI:**

| Secret | Source | Used by |
|---|---|---|
| `{{ci-secret-1}}` | `{{secret-store}}` | API-token helper |
| `{{ci-secret-2}}` | `{{secret-store}}` | Mock-server license |

**Gating semantics in detail:**

- `@smoke` failure on the PR pipeline → merge blocked; PR author owns the triage.
- `@critical` failure on the deploy pipeline → deploy blocked; release manager owns the triage.
- `@regression` failure on the nightly → on-call alerted; not auto-blocking but tracked in the daily QE standup.
- `@smoke @readonly` failure against prod → PagerDuty page; SEV-2 incident default.

**Quarantine workflow:**

- Quarantined scenarios carry `@flaky-quarantine`; the nightly excludes them.
- A quarantine entry requires an open ticket (`{{quarantine-ticket-prefix}}-*`) referenced in the scenario comment.
- The QE lead reviews the quarantine list weekly; >14-day-old entries escalate.

