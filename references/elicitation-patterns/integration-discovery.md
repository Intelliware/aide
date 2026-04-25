# Elicitation pattern: Integration discovery

## Purpose

Captures the external integrations the system must perform: which services
it calls, which call it, the protocols, the auth model, the data flowing
each direction, idempotency / retry semantics, and the failure handling.
Invoked from `create-design-package` step 02-design (gated by
`project.elicitation.has_external_integrations == true`) so the
`design/integration-design` block has a complete catalog of cross-system
contracts that the implementation stage can stub, test, and observe.

## Inputs needed from user

- Outbound integrations (services this system calls)
- Inbound integrations (services that call this system)
- Per-integration: protocol, transport, auth, payload schema source
- SLA expected from each external party
- Idempotency strategy per outbound call
- Retry / backoff policy
- Failure-mode handling (circuit breaker, fallback, dead-letter)
- Webhook / event subscriptions
- Batch / file-based exchanges

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Loop the outbound integrations.** For each: integration name, target system, owner, protocol, transport, auth.
   - **Format:** structured `{name, target_system, owner, protocol, transport, auth}`
   - **Validation:** `protocol` ∈ `{rest, graphql, grpc, soap, webhook-out, sftp, sql, other}`; `transport` ∈ `{https, mtls, vpn, public-internet, private-link}`; `auth` ∈ `{oauth2, api-key, basic, mtls, signed-jwt, none}`
   - **Maps to:** `design.integration.outbound[]`

2. **For each outbound integration, what data flows out?** (which entities / fields)
   - **Format:** structured-list referencing `requirements.data.entities[].attributes[]`
   - **Validation:** each field must appear in the data-requirements catalog
   - **Maps to:** `design.integration.outbound[].data_out`

3. **What data flows back?** (response shape — pointer to OpenAPI / proto / sample)
   - **Format:** free-text + optional pointer to spec file
   - **Validation:** spec pointer (if given) resolves to a real file
   - **Maps to:** `design.integration.outbound[].data_in`

4. **Idempotency strategy for this outbound call?**
   - **Format:** multiple-choice
   - **Options:** `idempotency-key-header` / `dedup-by-business-id` / `at-most-once` / `at-least-once-with-dedup-on-receiver` / `not-applicable-read-only`
   - **Maps to:** `design.integration.outbound[].idempotency`

5. **Retry / backoff policy.**
   - **Format:** structured `{strategy, max_attempts, base_delay_ms, jitter}`
   - **Validation:** `strategy` ∈ `{none, fixed, linear, exponential, exponential-with-jitter}`
   - **Maps to:** `design.integration.outbound[].retry`

6. **Failure handling — what does the system do when this integration is unreachable?**
   - **Format:** multiple-choice (multi-select)
   - **Options:** `circuit-breaker` / `fallback-to-cache` / `fallback-to-default` / `dead-letter-queue` / `surface-error-to-user` / `silent-degrade`
   - **Maps to:** `design.integration.outbound[].failure_handling`

7. **Loop the inbound integrations.** For each: who calls us, on what protocol, with what auth, expected QPS.
   - **Format:** structured `{caller, protocol, auth, expected_qps}`
   - **Validation:** caller is a named system or persona
   - **Maps to:** `design.integration.inbound[]`

8. **Webhook subscriptions:** does this system subscribe to event streams from third parties?
   - **Format:** structured-list `{publisher, event_types[], delivery_mechanism, signature_verification}`
   - **Validation:** `signature_verification` ∈ `{hmac-sha256, mtls, signed-jwt, none}` (warn if `none`)
   - **Maps to:** `design.integration.webhooks_in[]`

9. **Batch / file-based exchanges:** any SFTP, S3-drop, scheduled exports?
   - **Format:** structured-list `{partner, direction, schedule, format, encryption}`
   - **Maps to:** `design.integration.batch_exchanges[]`

10. **What SLA does each external party owe us?** (uptime, response time, support window)
    - **Format:** per integration: `{availability_pct, p99_ms, support_window}`
    - **Validation:** if no SLA exists, record `[NEEDS CLARIFICATION]`
    - **Maps to:** `design.integration.outbound[].external_sla`

**Wrap-up:** Confirm the answers in summary form before proceeding. List each integration with its protocol, auth, idempotency strategy, retry policy, and failure-handling choices. Confirm before writing the integration-design block.

## Output format

Answers feed `design/integration-design`.

```toml
[[design.integration.outbound]]
name = "billing-service-charge"
target_system = "Stripe"
owner = "Platform Team"
protocol = "rest"
transport = "https"
auth = "api-key"
idempotency = "idempotency-key-header"
retry = { strategy = "exponential-with-jitter", max_attempts = 5, base_delay_ms = 200, jitter = true }
failure_handling = ["circuit-breaker", "dead-letter-queue", "surface-error-to-user"]
external_sla = { availability_pct = 99.99, p99_ms = 500, support_window = "24x7" }

[[design.integration.inbound]]
caller = "Customer Portal"
protocol = "rest"
auth = "oauth2"
expected_qps = 50
```

## Validation rules

- Every outbound integration must declare protocol, transport, auth, idempotency, retry, and failure-handling.
- Webhook inbound entries with `signature_verification = none` raise a warning (open to spoofing).
- Data-out references must resolve against `requirements.data.entities[].attributes[]`.
- Missing SLA is recorded as `[NEEDS CLARIFICATION]`, not silently omitted.
- The full integration list is cross-checked against `project.elicitation.has_external_integrations`; if at least one integration exists but the flag is `false`, the skill prompts the user to flip it.

## Reusable across

- `create-design-package` (step 02-design; gated by `project.elicitation.has_external_integrations == true`)
- `greenfield-design-package` composition (declared as required elicitation)
