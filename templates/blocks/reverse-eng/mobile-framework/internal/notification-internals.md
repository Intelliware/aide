---
slug: notification-internals
title: "Notification Internals"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 230
---

## 13. Notification Internals

### 13.1 Notification Types

| Type | Path |
|------|------|
| Remote push (visible) | APNs / FCM → OS → app |
| Remote push (silent / data) | APNs (`content-available: 1`) / FCM data-only → app may run briefly |
| Local notification | Scheduled in-app, surfaced by OS |
| Time-sensitive / critical (iOS) | Requires entitlement |
| Foreground service (Android) | Persistent notification + privileged execution |

### 13.2 Remote Push Pipeline

```
[ APNs / FCM endpoint ]
   ↓
[ OS notification center ]
   ↓
[ Native shell delegate hooks ]
   ├─ iOS: UNUserNotificationCenterDelegate
   └─ Android: FirebaseMessagingService / NotificationManager
   ↓
[ Framework dispatcher ]
   ↓
[ App-level handlers (subscribe to NotificationModule events) ]
```

### 13.3 Token Acquisition

- iOS: `application:didRegisterForRemoteNotificationsWithDeviceToken:` → token forwarded to runtime.
- Android: FCM `onNewToken(...)` → token forwarded to runtime.
- The framework caches the latest token in storage and exposes `Notifications.getToken()`.
- Token rotation events are surfaced via an event subscription so consumers can sync with their server.

### 13.4 Permission Handling

- `requestPermission()` resolves to `granted | denied | provisional` (iOS).
- The framework persists last-known auth state to avoid re-prompting; consumers can re-check via `getPermissionState()`.
- Provisional auth (iOS): notifications delivered quietly until the user upgrades to full auth.

### 13.5 Channels and Categories

- Android channels: registered at first-show; removed channels remain (OS quirk) — surface as warning if a channel ID is unused.
- iOS categories: registered at app launch; actions surfaced via `UNNotificationAction`.
- Both wrapped under a uniform `NotificationChannel` API.

### 13.6 Foreground Behaviour

- iOS: `willPresent` decides between alert / banner / silent.
- Android: foreground notifications must be re-rendered by the app (no OS UI by default for FCM-data messages).

### 13.7 Background and Silent Push

- iOS: silent push triggers `didReceiveRemoteNotification:fetchCompletionHandler:` — limited 30-second budget.
- Android: data-only FCM dispatches to a JobIntentService / WorkManager task — survives app being killed.
- Framework provides `background-fetch` API to consumers, abstracting both.

### 13.8 Notification → Deep Link Routing

When a notification is opened:
1. Embedder forwards to runtime with payload + tap action.
2. Framework reads `deep_link` from payload (see `re-mobile-app-consumer/push-integration-from-backend`).
3. Routes via the same path as a deep-link arrival (see `navigation-and-routing-internals`).
4. Emits `notification.opened` analytics event.

### 13.9 Local Notifications and Scheduling

- Provided via `Notifications.schedule({ at: Date, repeat: ..., payload: ... })`.
- Scheduling backend:
  - iOS: `UNNotificationRequest` with calendar / interval / location triggers.
  - Android: `AlarmManager` (≤12) / `WorkManager` for non-exact / exact-alarm permission for exact (12+).

### 13.10 Where the Code Lives

```
{{repo}}/
├── packages/notifications/             # JS/Dart API
├── ios/Notifications/                  # APNs glue
└── android/.../notifications/          # FCM glue
```
