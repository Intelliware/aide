---
slug: support-and-contact
title: "Support and Contact"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: true
order-hint: 270
---

## 17. Support and Contact

Document the support channels available to a consumer, response-time expectations, and what information to include in a ticket so it can actually be triaged. Mark optional because internal APIs often have ad-hoc support models; for external APIs this block is high-value. Verify the channels are real and monitored — listing a stale email is worse than listing none.

Differentiate channel by purpose: bug reports vs. account questions vs. security disclosures vs. integration help. Document escalation paths for production-down situations. Include the security-vulnerability disclosure address explicitly — researchers need a clear, monitored intake.

### Suggested template content

**Channels by purpose:**

| Purpose | Channel | SLA |
|---|---|---|
| Production-down / sev-1 | {{oncall-pager — e.g. PagerDuty integration / hotline}} | < 15 min |
| Bug reports | {{bug-tracker-url}} | < 2 business days |
| Integration help | {{forum-or-slack}} | Best-effort, community |
| Account / billing | {{billing-email}} | < 1 business day |
| Security vulnerability | `security@{{domain}}` (PGP key: {{pgp-fingerprint}}) | Acknowledged < 24h |
| API change requests | {{rfc-link-or-email}} | Reviewed monthly |

**What to include in a ticket:**

1. `X-Request-ID` from a failing response (or `error.request_id` from the body).
2. Approximate timestamp (UTC) of the failure.
3. Endpoint and method.
4. Expected vs. actual behavior, with a minimal repro.
5. SDK and language version (if applicable).
6. Your account / API key prefix (NEVER the full key).

**Production-down escalation:**

- Page via {{oncall-pager}} with your account ID and a one-line description.
- Concurrent: subscribe to status page (likely already known incident).
- For active sev-1, a status update is posted within 15 minutes.

**Security disclosure:**

- Address: `security@{{domain}}`
- PGP key: {{key-url}} (fingerprint `{{fingerprint}}`)
- Bug bounty: {{program-url}} — please follow the scope before testing.
- Do NOT file public issues for vulnerabilities.

**Self-service before contacting support:**

1. Check the status page — many issues are already known incidents.
2. Re-run the request with `Accept: application/json` and capture the full error envelope.
3. Verify your authentication token is valid against the auth block.
4. Search the bug tracker for similar reports.

**Community:**

- Forum: {{forum-url}}
- Slack / Discord: {{community-link}}
- StackOverflow tag: `{{so-tag}}` (monitored by team)

**Response-time expectations by tier:**

| Tier | Bug report SLA | Sev-1 SLA |
|---|---|---|
| Free | best-effort | none |
| Standard | < 1 business day | < 1h |
| Enterprise | < 4h | < 15 min |
