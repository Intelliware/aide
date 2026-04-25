---
slug: push-integration-from-backend
title: "Push Integration From Backend"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, architect, security]
optional: false
order-hint: 130
---

## 3. Push Integration From Backend

This section defines the **server-to-app** push contract for any backend (first-party or partner) that needs to deliver notifications to this app.

### 3.1 Push Providers

| Platform | Provider | App ID / Sender ID | Credential Type |
|----------|----------|--------------------|-----------------|
| iOS | APNs (via {{provider, e.g., FCM HTTP v1, OneSignal, Pusher}}) | `{{ios_bundle_id}}` | APNs auth key (`.p8`) or APNs certificate |
| Android | FCM | `{{fcm_sender_id}}` | OAuth2 service-account credentials JSON |
| Web push (if supported) | VAPID | `{{vapid_public_key}}` | VAPID key pair |

> Senders MUST be on the access list configured in `{{push_console_admin_ref}}`. Request access via `{{push_admin_contact}}`.

### 3.2 Token Lifecycle

- **Token type returned to clients:** {{e.g., "FCM registration token (single token used for both iOS and Android)" | "APNs device token + FCM token"}}.
- **Format:** opaque string, max length {{e.g., 4096}} bytes.
- **App registers token via:** `POST {{api_base_url}}/v1/devices`
  ```json
  {
    "user_id": "...",
    "platform": "ios | android | web",
    "token": "...",
    "app_version": "2.4.5",
    "locale": "en-US",
    "timezone": "America/New_York"
  }
  ```
- **Token rotation events:** app reuploads on (a) login, (b) every cold start if older than 24h, (c) FCM `onNewToken` callback, (d) APNs `didRegisterForRemoteNotificationsWithDeviceToken`.
- **Token invalidation signals:** APNs/FCM responses `Unregistered`, `InvalidRegistration`, `NotRegistered`, HTTP 404 on token refresh — backend MUST mark the token inactive and stop sending.

### 3.3 Topic / Audience Model

| Channel | How Devices Subscribe | Use Case |
|---------|-----------------------|----------|
| Per-user push (token list) | Token registered against `user_id` on login | Transactional, account-specific notifications |
| Topic subscription | App calls `messaging().subscribeToTopic("{{topic}}")` after user opt-in | Broad campaigns, geographic broadcasts |
| Segment / audience | Server-side targeting in `{{push_provider}}` UI | Marketing pushes |
| Silent / data-only | Sent with `content-available: 1` (iOS) or `data` only (Android) | Background sync, badge update |

**Topic naming convention:** `{{env}}.{{feature}}.{{audience}}` — e.g., `prod.orders.subscribed-users`.

### 3.4 Payload Shape

#### Visible (alert) payload

```json
{
  "message": {
    "token": "{{device_token}}",
    "notification": {
      "title": "Your order shipped",
      "body": "Tracking #{{tracking_number}}"
    },
    "data": {
      "type": "order.shipped",
      "order_id": "{{order_id}}",
      "deep_link": "{{app_scheme}}://order/{{order_id}}"
    },
    "apns": {
      "headers": { "apns-priority": "10", "apns-push-type": "alert" },
      "payload": {
        "aps": {
          "alert": { "title": "Your order shipped", "body": "Tracking #{{tracking_number}}" },
          "sound": "default",
          "badge": 1,
          "thread-id": "orders",
          "category": "ORDER_ACTIONS"
        }
      }
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "orders",
        "click_action": "OPEN_ORDER"
      }
    }
  }
}
```

#### Silent (data-only) payload

```json
{
  "message": {
    "token": "{{device_token}}",
    "data": { "type": "sync.required", "since": "2026-04-25T10:00:00Z" },
    "apns": {
      "headers": { "apns-priority": "5", "apns-push-type": "background" },
      "payload": { "aps": { "content-available": 1 } }
    },
    "android": { "priority": "NORMAL" }
  }
}
```

### 3.5 Required `data` Fields

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `type` | yes | string | One of the documented event types below |
| `deep_link` | conditional | string | Required for any tappable notification |
| `correlation_id` | yes | string (UUID) | For end-to-end tracing |
| `expires_at` | no | RFC3339 | App may discard if past expiry |
| `dedup_key` | no | string | Drops duplicate sends within 5 min |

**Documented `type` values:** `order.shipped`, `order.delivered`, `chat.message`, `sync.required`, `account.security`, `marketing.campaign`. Adding a new type requires a code change in the app and SHOULD be coordinated with mobile.

### 3.6 Notification Channels (Android) and Categories (iOS)

| Channel ID | iOS Category | User Label | Default Importance | Notes |
|------------|--------------|------------|--------------------|-------|
| `orders` | `ORDER_ACTIONS` | Orders | High | Cannot be disabled in some markets |
| `messages` | `MESSAGE_REPLY` | Messages | High | Supports inline reply action |
| `marketing` | `MARKETING` | Promotions | Low | Opt-in only |
| `account` | `ACCOUNT_SECURITY` | Account & security | Max | Cannot be silenced |

### 3.7 Rate Limits and Best Practices

- APNs: ~1000 notifications/sec/topic for HTTP/2; FCM: 600k messages/min per project (project-wide).
- Use `apns-collapse-id` / FCM `collapse_key` for state-replacing pushes (e.g., score updates).
- Silent pushes: APNs allows ~2–3/hr per device; over-quota pushes are silently dropped by iOS.
- Time-sensitive pushes on iOS require the `time-sensitive` interruption level **and** an entitlement.
- Always set `apns-push-type` (required by APNs since iOS 13).

### 3.8 Testing a Push Payload

```bash
# Via FCM HTTP v1 (replace OAuth token + project-id)
curl -X POST "https://fcm.googleapis.com/v1/projects/{{fcm_project_id}}/messages:send" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @payload.json

# Via APNs HTTP/2 directly (using token-based auth)
curl -v -d '{"aps":{"alert":"Hello"}}' \
  -H "apns-topic: {{ios_bundle_id}}" \
  -H "apns-push-type: alert" \
  -H "authorization: bearer ${APNS_JWT}" \
  --http2 \
  "https://api.push.apple.com/3/device/${DEVICE_TOKEN}"
```
