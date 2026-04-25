---
slug: release-channel-and-codepush-or-ota
title: "Release Channels and OTA Updates"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, ops, security]
optional: true
order-hint: 280
---

## 18. Release Channels and OTA Updates

> Mark this section N/A if the framework does not support OTA updates of bundle / asset content.

### 18.1 Channel Model

| Channel | Audience | Promotion Path |
|---------|----------|----------------|
| `dev` | Engineers | Automatic on every commit to `main` |
| `staging` | Internal QA + dogfood | Promoted from `dev` on green CI |
| `beta` | TestFlight / Play Internal Testing | Promoted from `staging` after manual approval |
| `production` | Public users | Promoted from `beta` after release sign-off |

Channels are namespaces over the same artifact storage; promotions are pointer updates.

### 18.2 What Can Be OTA'd

| Asset class | OTA-able? | Why |
|-------------|-----------|-----|
| JS / Dart bundle | yes | App-supplied bundle is interpreted/AOT-on-load |
| Static assets | yes | Embedded in bundle |
| Native code | no on iOS (App Store policy) | Must ship through store |
| Native modules | no | Tied to app binary |
| Permissions / capabilities | no | Configured in store metadata |

> Apple's policy permits OTA of code that runs in the JavaScript runtime under specific guidance — track changes in `{{policy_doc_url}}`.

### 18.3 Update Service

```
[ Build pipeline produces signed bundle + manifest ]
   ↓
[ Uploaded to OTA service (e.g., Expo Updates / CodePush / custom) ]
   ↓
[ Channel pointer updated to new manifest ]
   ↓
[ App on device polls / receives push of new manifest ]
   ↓
[ Bundle downloaded + verified + activated on next launch (or hot-swap) ]
```

### 18.4 Manifest Shape

```json
{
  "id": "{{uuid}}",
  "channel": "production",
  "runtimeVersion": "2.4",
  "createdAt": "2026-04-25T10:00:00Z",
  "launchAsset": {
    "url": "https://updates.{{host}}/bundles/{{hash}}.bundle",
    "hash": "{{sha256}}",
    "contentType": "application/javascript"
  },
  "assets": [
    { "url": "...", "hash": "...", "key": "..." }
  ],
  "metadata": { "branch": "main", "git_sha": "..." }
}
```

### 18.5 Signing and Verification

- Manifests are signed with a per-channel signing key; public key embedded in the app binary.
- Hash on launch asset MUST match the hash in the signed manifest.
- Verification failure → fall back to embedded (last-known-good) bundle and report to APM.

### 18.6 Runtime Version Compatibility

- Each app binary declares a `runtimeVersion`.
- The OTA service refuses to deliver a manifest whose `runtimeVersion` doesn't match the device app's.
- This prevents OTA from breaking the contract with bundled native modules.

### 18.7 Rollout Strategy

- Gradual rollout: `0% → 1% → 10% → 50% → 100%` with monitoring gates between steps.
- Per-channel kill switch: instantly revert pointer to previous manifest.
- A/B / canary: cohort assignment by hashed device ID.

### 18.8 Rollback

- "Revert" promotes the prior manifest pointer.
- Devices on the rolled-back channel pick up the prior bundle on next launch.
- Hot rollback (force-restart) available via emergency endpoint.

### 18.9 Telemetry

| Metric | Labels |
|--------|--------|
| `ota.check` | channel, current_id, available_id, action |
| `ota.download` | size_bytes, duration_ms, network |
| `ota.verify` | result (ok / hash_mismatch / sig_invalid) |
| `ota.activate` | mode (next_launch / hot_swap), result |

### 18.10 Where the Code Lives

```
{{repo}}/
├── packages/updates/                   # client poll / verify / activate
├── services/updates-server/            # manifest store + signing
└── tools/release-promote/              # promotion CLI
```
