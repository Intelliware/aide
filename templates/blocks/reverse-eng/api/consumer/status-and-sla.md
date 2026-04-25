---
slug: status-and-sla
title: "Status and SLA"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, ops]
optional: true
order-hint: 260
---

## 16. Status and SLA

Document where to check live API status, what SLAs are committed to (uptime, latency, error budget), and how incidents are communicated. Mark optional because not every API publishes an SLA. If the API is internal, this block becomes the contract between teams; if it's a paid third-party, it captures the commercial commitments.

Verify SLA percentiles and exclusion language against the actual contract document, not marketing pages. Document the incident response loop: how is degradation announced, where does the consumer subscribe, and what's the expected MTTR? This is what ops teams ask for first when an integration misbehaves.

### Suggested template content

**Status page:** {{status-url}}

- Auto-refreshes every 60 seconds.
- Subscribe via email / SMS / Slack at {{status-subscribe-url}}.
- Components tracked: API gateway, individual resource endpoints, webhooks, dashboard.

**Programmatic status check:**

```
GET https://status.{{domain}}/api/v2/status.json
```

Returns:

```json
{
  "status": { "indicator": "none", "description": "All systems operational" },
  "components": [ { "name": "API", "status": "operational" }, ... ]
}
```

**SLA commitments:**

| Tier | Uptime | P99 latency | Error rate | Credit |
|---|---|---|---|---|
| Free | best-effort | — | — | none |
| Standard | 99.9% | < 500 ms | < 1% (5xx) | 5% / month per 0.1% miss |
| Enterprise | 99.95% | < 250 ms | < 0.5% | Per contract |

**SLA exclusions:**

- Scheduled maintenance windows (announced ≥ 7 days ahead via status page).
- Customer-side issues (rate-limit 429s, validation 4xx).
- Force majeure / regional cloud-provider outages.
- API beta endpoints (no SLA; explicitly marked in catalog).

**Incident communication:**

- **Detection → first update:** within {{first-update-time — e.g. 15 min}}.
- **Update cadence during incident:** every {{update-cadence — e.g. 30 min}} until resolved.
- **Post-mortem:** published within {{postmortem-window — e.g. 5 business days}} for sev-1 incidents.

**Severity levels:**

| Sev | Definition | Example |
|---|---|---|
| 1 | Total outage / data loss | API returns 5xx for > 50% of requests |
| 2 | Major degradation | One resource group unavailable |
| 3 | Minor degradation | Elevated latency in one region |
| 4 | Cosmetic / dashboard-only | Status page UI bug |

**Maintenance windows:**

- Standard window: {{standard-window — e.g. "Sundays 02:00–04:00 UTC"}}.
- Emergency maintenance: announced as soon as decided; no consumer credit available.

**SLA reporting:**

- Monthly uptime report: {{report-url}} or via account dashboard.
- Credit requests: file within {{credit-window — e.g. 30 days}} via {{credit-process-url}}.
