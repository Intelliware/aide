---
slug: file-storage-and-external-integrations
title: "File Storage and External Integrations"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect, security]
optional: true
order-hint: 300
---

## 20. File Storage and External Integrations

This section documents file storage (object storage, blob storage, attached volumes) and third-party SaaS/integration touchpoints (Stripe, Twilio, SendGrid, Auth0, etc.) — anything outside the organization's control that the API depends on. The goal is to enable a downstream AI to add a new file upload endpoint or wire a new third-party integration without re-inventing patterns or leaking credentials. Extract from the source: the storage SDK in use (AWS SDK v3, GCS client, Azure Blob), bucket/container naming convention, signed-URL strategy, content-type handling, and per-integration config (API keys, webhook secrets, sandbox vs prod URLs).

To verify, walk one upload and one download flow end-to-end and confirm the bucket name comes from configuration, not a hardcoded literal. For each third-party integration, find the credential source (env var, secret manager, vault) and confirm that no secrets appear in logs or error messages. Identify webhook receiver endpoints and confirm they verify signatures (HMAC, JWT, etc.) before processing.

Be careful: developers commonly hardcode bucket names "temporarily" — flag any literal that doesn't come from config. Webhook handlers are commonly missing signature verification — flag and document any gaps. Some integrations have separate sandbox/prod modes that look identical in code but produce wildly different behavior; document the toggle explicitly.

Hallucination risks: do not assume signed URLs are short-lived unless code sets `expiresIn`; do not assume PII is encrypted at rest unless server-side encryption is configured; do not invent SDK methods that don't match the actual library version.

### Suggested template content

#### 20.1 File / Object Storage

- **Provider:** {{e.g., AWS S3, GCS, Azure Blob, MinIO (dev)}}
- **SDK / client:** {{e.g., @aws-sdk/client-s3 v3}}
- **Buckets / containers:**

| Bucket | Purpose | Access | Lifecycle |
|--------|---------|--------|-----------|
| {{e.g., svc-uploads-prod}} | {{user uploads}} | {{private, signed URL only}} | {{30d → glacier}} |
| {{e.g., svc-public-assets}} | {{logos, static}} | {{public CDN}} | {{never expire}} |

#### 20.2 Upload Flow

```{{language}}
// Canonical upload pattern: validate → presign → client uploads → record metadata
{{example}}
```

- **Max upload size:** {{e.g., 50MB}}
- **Allowed content types:** {{whitelist}}
- **Virus scanning:** {{e.g., ClamAV sidecar / none}}

#### 20.3 Download / Signed-URL Flow

```{{language}}
// Canonical signed-URL generation with auth check
{{example}}
```

- **Signed URL TTL:** {{e.g., 5 minutes}}

#### 20.4 Third-Party Integrations

| Integration | Purpose | Client Library | Credentials Source | Sandbox URL | Prod URL |
|-------------|---------|----------------|---------------------|-------------|----------|
| {{e.g., Stripe}} | {{payments}} | {{stripe-node}} | {{Vault: stripe/api-key}} | {{api.stripe.com (test mode)}} | {{api.stripe.com (live)}} |
| {{e.g., SendGrid}} | {{transactional email}} | {{@sendgrid/mail}} | {{env: SENDGRID_API_KEY}} | {{n/a}} | {{api.sendgrid.com}} |
| {{e.g., Twilio}} | {{SMS}} | {{twilio}} | {{Vault: twilio/auth-token}} | {{n/a}} | {{api.twilio.com}} |

#### 20.5 Inbound Webhooks

| Provider | Endpoint | Signature Method | Header / Secret |
|----------|----------|------------------|------------------|
| {{e.g., Stripe}} | `{{POST /webhooks/stripe}}` | {{HMAC-SHA256}} | {{Stripe-Signature, STRIPE_WEBHOOK_SECRET}} |
| {{e.g., GitHub}} | `{{POST /webhooks/github}}` | {{HMAC-SHA1}} | {{X-Hub-Signature-256, GH_WEBHOOK_SECRET}} |

```{{language}}
// Signature verification — MUST happen before any payload parsing
{{example}}
```

#### 20.6 Failure / Retry Behavior

- **Transient failure:** {{e.g., retry with backoff via job queue}}
- **Permanent failure:** {{e.g., quarantine + alert}}
- **Idempotency:** {{e.g., Stripe-Idempotency-Key header set on every charge call}}
