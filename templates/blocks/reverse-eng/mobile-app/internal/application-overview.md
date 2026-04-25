---
slug: application-overview
title: "Application Overview"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Application Overview

### 1.1 What This Application Is

- **Name:** [Application Name]
- **Purpose:** [One or two sentences describing what the app does and what problem it solves]
- **Target Users:** [Who uses this app?]
- **Current Version:** [e.g., 2.4.5]

### 1.2 Key Capabilities

<!-- List the major features users interact with -->

- [Feature 1: e.g., "User authentication and profile management"]
- [Feature 2: e.g., "Real-time data sync with cloud backend"]
- [Feature 3: e.g., "Offline-first local caching"]

### 1.3 Platforms and Distribution

| Platform | Status | Minimum Version | Current Version | Distribution |
|----------|--------|-----------------|-----------------|-------------|
| Android | Active | [e.g., 8.0 (API 26)] | [e.g., 2.4.5] | Google Play Store |
| iOS | Active | [e.g., 13.0] | [e.g., 2.4.5] | Apple App Store |
| React Native | [Active/Inactive] | [e.g., 0.70.x] | [version] | [Distribution method] |

### 1.4 Core Technologies and Frameworks

| Technology | Purpose | Version |
|-----------|---------|---------|
| [State Management] | [e.g., "Redux for global state"] | [e.g., 4.x] |
| [UI Framework] | [e.g., "Jetpack Compose"] | [e.g., 1.5.x] |
| [Navigation] | [e.g., "Compose Navigation"] | [version] |
| [Database] | [e.g., "Room for local storage"] | [version] |
| [HTTP Client] | [e.g., "Retrofit with OkHttp"] | [version] |
| [Authentication] | [e.g., "JWT tokens"] | [N/A] |

### 1.5 High-Level Application Flow

<!-- ASCII diagram or text description of how a user flows through the app -->

```
[App Launch]
    ↓
[Check Authentication Status]
    ├─→ [Not Authenticated] → [Login Screen] → [Home Screen]
    └─→ [Authenticated] → [Home Screen]
        ↓
    [Navigation Hub]
    ├─→ [Feature A Screen]
    ├─→ [Feature B Screen]
    ├─→ [Feature C Screen]
    └─→ [Profile/Settings Screen]
```

### 1.6 Related Systems and Dependencies

<!-- What external services does this app depend on? -->

- [API Service]: [e.g., "REST API at https://api.example.com"]
- [Authentication Service]: [e.g., "OAuth 2.0 provider"]
- [Analytics]: [e.g., "Firebase Analytics"]
- [Crash Reporting]: [e.g., "Firebase Crashlytics"]
- [Push Notifications]: [e.g., "Firebase Cloud Messaging"]
