---
slug: support-and-contact
title: "Support and Contact"
applies-to: [re-web-app-consumer]
requires-decision-from: [ops]
optional: true
order-hint: 220
---

## 12. Support and Contact

<!-- Optional. How embedders reach a human, what to include in a report,
and what response time to expect. -->

### 12.1 Support Channels

| Channel | Use for | Response target |
|---------|---------|-----------------|
| Status page | Real-time incident state | live |
| Public docs / FAQ | Self-serve answers | n/a |
| Embedder forum / community | Peer help, integration patterns | best effort |
| Email support — `support@{{embed-host}}` | Bug reports, integration questions | {{n}} business days |
| Priority email — `priority-support@{{embed-host}}` | Production incidents (paid plans) | {{n}} hours |
| Security disclosures — `security@{{embed-host}}` | CVE-class issues only | {{n}} business hours |

### 12.2 What to Include in a Report

To get a useful first reply, include:

- **Embed mode** (iframe / Web Component / SDK / proxy mount).
- **SDK or Web Component version** (`sdk.version` or check the loader URL).
- **Browser and OS** with versions.
- **Tenant ID** and a representative **user / item ID**.
- **Steps to reproduce.**
- **What you expected vs. what happened.**
- **Console output** and any `[{{prefix}}]` log lines.
- **Network HAR** if the issue involves API calls.
- **Reproduction URL** if possible (a publicly reachable host page).

### 12.3 Severity Levels

| Severity | Definition | First-response target |
|----------|------------|------------------------|
| S1 — Critical | Production embed unusable for many users; no workaround | {{n}} hours |
| S2 — High | Major feature broken or partial outage; workaround exists | {{n}} business hours |
| S3 — Medium | Minor feature impaired or cosmetic | {{n}} business days |
| S4 — Low | Question or enhancement | best effort |

### 12.4 Status Page and Incident Updates

- **Status page:** [e.g., "https://status.{{embed-host}}"]
- **Incident updates:** [e.g., "Posted at least every {{n}} minutes for S1/S2 incidents."]
- **Subscribe:** email or RSS — embedders should subscribe per environment.

### 12.5 Feature Requests and Roadmap

- **Public roadmap:** [e.g., "Quarterly themes published on the docs site."]
- **Voting / requests:** [e.g., "Submit via the embedder portal or `feedback@{{embed-host}}`."]
- **Customer advisory:** [e.g., "Quarterly call open to embedders on paid plans."]

### 12.6 Security Reporting

- **Responsible disclosure:** [e.g., "Email `security@{{embed-host}}` with details. PGP key at {{url}}."]
- **Acknowledgement:** [e.g., "Within {{n}} business hours."]
- **Public disclosure:** coordinated; default 90-day window from confirmed fix.
- **Bug bounty:** [yes/no — link if yes].

### 12.7 Escalation Path

If a ticket stalls past its target, escalate via:

1. Reply to the ticket with `ESCALATE` in the subject line.
2. Cc your account contact (paid plans).
3. Last resort: `escalations@{{embed-host}}`.
