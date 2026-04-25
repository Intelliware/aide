---
slug: new-endpoint-feature-checklist
title: "New Endpoint / Feature Checklist"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 380
---

## 28. New Endpoint / Feature Checklist

This section is the operational checklist a downstream AI must follow when adding a new endpoint or feature to the API. It is the synthesis of every prior section: contract update, route wiring, validation, authorization, service logic, repository, error mapping, observability, tests, and feature-flag gating. Treat each item as a hard gate — if any item is skipped, the change is incomplete.

Extract the contents from the actual project conventions documented in Sections 3-26. Don't invent steps that aren't supported by the rest of the documentation, and don't omit steps just because they "usually" aren't needed. The checklist should be ordered roughly the way an implementer encounters the steps, not alphabetically.

To verify, walk through one recent feature PR and confirm every checklist item was satisfied. Adjust the checklist if the team consistently does (or skips) a step that the checklist describes differently. Distinguish *must* (blocking) items from *should* (best-practice) items so the AI knows what is non-negotiable.

Hallucination risks: do not include checklist items that depend on tooling the project doesn't have (e.g., "update Pact contract" if there is no Pact); do not omit items that are project-specific (e.g., "regenerate OpenAPI client for downstream-service"). Make the checklist concrete enough that a competent implementer could follow it without consulting other documents.

### Suggested template content

#### 28.1 Pre-Flight

- [ ] Read the OpenAPI spec at `{{path}}` — confirm the endpoint shape, path, status codes, error responses.
- [ ] Confirm the feature is gated behind a flag (Section 26) if the rollout is non-trivial.
- [ ] Confirm the SLO bucket the endpoint falls into (Section 24.1).

#### 28.2 Contract

- [ ] Update `{{openapi.yaml}}` — request schema, response schema, all status codes (200/201/400/401/403/404/409/422/429/500).
- [ ] Run `{{pnpm openapi:lint}}` — must pass.
- [ ] Regenerate any downstream client artifacts.

#### 28.3 Route & Controller

- [ ] Add route under the correct module (Section 5).
- [ ] Controller method delegates to service — no business logic in controller (Section 11).
- [ ] Apply `@Auth(...)` / `@Roles(...)` decorators (Section 8).
- [ ] Apply request validation DTO with `class-validator` / `Zod` schema (Section 9).

#### 28.4 Service

- [ ] Service method on the correct service class (Section 11).
- [ ] Constructor-injected dependencies — no static access.
- [ ] Wrap multi-step writes in a transaction (Section 11.2).
- [ ] Throw the right typed exception on each failure mode (Section 10.3).

#### 28.5 Repository / Data Access

- [ ] New repository method or extend existing (Section 15).
- [ ] Parameterized queries only — no string concatenation.
- [ ] Avoid N+1 — use eager loading or batch (Section 24.3).
- [ ] If schema change: migration written and reviewed (Section 16).

#### 28.6 Cross-Cutting

- [ ] Cache reads if the endpoint matches a cacheable pattern (Section 17).
- [ ] If the operation is slow, queue it as a background job (Section 18).
- [ ] If a downstream service is called, follow Section 19 (timeout, retry, trace propagation).
- [ ] If a file is involved, follow Section 20 (signed URL, content-type, virus scan).

#### 28.7 Observability

- [ ] Structured logs at info on success, warn on 4xx, error on 5xx (Section 21).
- [ ] Custom metric only if it adds signal beyond the default `http_request_duration_seconds`.
- [ ] Trace span propagated for any internal call.
- [ ] No PII in logs.

#### 28.8 Security

- [ ] Authorization check is present — even on a "list my own X" endpoint, scoping is explicit.
- [ ] Rate limiter rule exists for the new route, or the default applies and is sufficient.
- [ ] No secrets in code, error messages, or responses.

#### 28.9 Tests

- [ ] Unit test for the service method (happy path + each error branch).
- [ ] Integration test for the endpoint (real DB, real router).
- [ ] Contract test verifying the OpenAPI shape.
- [ ] Idempotency test if the operation is idempotent.

#### 28.10 Documentation

- [ ] OpenAPI description fields filled (summary, description, examples).
- [ ] If the endpoint introduces a new domain concept, add it to the Glossary (Section 30).
- [ ] If the endpoint changes existing behavior, note in `CHANGELOG.md` and migration guide.

#### 28.11 Rollout

- [ ] Default the feature flag (Section 26) to `false` in prod until verified.
- [ ] Confirm metrics and logs are visible in {{Datadog/Grafana}} dashboards before enabling for users.
- [ ] Have a rollback plan: flag flip + revert DB migration if needed.
