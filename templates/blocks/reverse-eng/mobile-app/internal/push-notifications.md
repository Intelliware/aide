---
slug: push-notifications
title: "Push Notifications"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 230
---

## 13. Push Notifications

### 13.1 Push Notification Setup

**Service:** [e.g., "Firebase Cloud Messaging (FCM)"]

### 13.2 Notification Types

| Type | Payload | Behavior |
|------|---------|----------|
| Welcome | `{ title, message }` | Show notification |
| Message | `{ conversationId, message }` | Show badge, navigate to conversation |
| Reminder | `{ reminderId, title }` | Show notification with action |

### 13.3 Implementation

[Document how notifications are handled: registration, receiving, displaying, user interaction]
