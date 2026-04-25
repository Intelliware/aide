---
slug: support-and-contact
title: "Support and Contact"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [ops]
optional: true
order-hint: 200
---

## 10. Support and Contact

> Mark this section N/A if there is no externally-published support surface for this app.

### 10.1 End-User Support

| Channel | Audience | URL / Address | SLA |
|---------|----------|---------------|-----|
| In-app help center | All users | Settings → Help (webview onto `https://help.{{host}}/...`) | self-serve |
| Email support | All users | `support@{{domain}}` | first-response within {{hours}}h business hours |
| Live chat | Subscribers (where applicable) | In-app "Contact us" → chat | first-response within {{hours}}h |
| Status page | All users | `https://status.{{domain}}` | real-time incident updates |
| Knowledge base | All users | `https://help.{{host}}/kb` | self-serve |

### 10.2 Partner / Integrator Support

| Topic | Contact | Notes |
|-------|---------|-------|
| Deep-link / Universal Link issues | `mobile-integrations@{{domain}}` | Provide AASA / assetlinks logs |
| Push delivery debugging | `push-ops@{{domain}}` | Provide `correlation_id` + payload sample |
| Analytics / attribution event questions | `analytics@{{domain}}` | Reference event name + observed property |
| Webview / embedding requests | `webview-admin@{{domain}}` | Include CSP and host-allowlist request |
| MDM / managed-config support | `mdm-support@{{domain}}` | Include EMM product + sample profile |
| Security disclosures | `security@{{domain}}` (PGP key at `https://{{domain}}/.well-known/security.txt`) | Coordinated disclosure preferred |

### 10.3 Escalation Path

```
1. Initial contact via the relevant channel above
2. If unresolved within SLA: escalate to {{partner_success_email}}
3. Severity-1 outages affecting partners: page via {{statuspage_subscription}} or {{partner_oncall_number}}
```

### 10.4 Reporting an App Bug

Users are encouraged to:
1. Open the in-app help center → "Report a bug".
2. Confirm submission of diagnostic bundle (anonymised crash + recent logs).
3. Note the **support reference ID** the app shows after submission — partners and support staff use this to look up the report.

The diagnostic bundle includes: app version, OS version, device model, locale, last 5 minutes of logs, last crash, and feature-flag state. It does **not** include account credentials, message contents, or media.

### 10.5 Security Disclosure (`security.txt`)

```
Contact: mailto:security@{{domain}}
Encryption: https://{{domain}}/.well-known/pgp-key.txt
Acknowledgments: https://{{domain}}/security/acknowledgments
Policy: https://{{domain}}/security/policy
Preferred-Languages: en
Expires: {{rfc3339_one_year_out}}
```

### 10.6 What We Need From You (Quick Triage Template)

When opening a partner support ticket, include:

```
- Issue summary: ...
- Affected platform(s): iOS / Android / both
- Affected app version(s): X.Y.Z
- OS version(s): ...
- Device(s) reproducing on: ...
- Steps to reproduce: 1) ... 2) ... 3) ...
- Expected vs. actual: ...
- Logs / correlation_id / event name: ...
- Reference ID from app (if any): ...
```
