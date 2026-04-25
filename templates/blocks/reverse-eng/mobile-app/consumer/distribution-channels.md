---
slug: distribution-channels
title: "Distribution Channels"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 110
---

## 1. Distribution Channels

### 1.1 Public Stores

| Platform | Store | Listing URL | Bundle / Package ID | Owner Account |
|----------|-------|-------------|---------------------|---------------|
| iOS | Apple App Store | `https://apps.apple.com/app/id{{app_store_id}}` | `{{ios_bundle_id}}` | `{{apple_team_id}}` |
| Android | Google Play | `https://play.google.com/store/apps/details?id={{android_package_id}}` | `{{android_package_id}}` | `{{play_developer_account}}` |

**Release cadence:** {{e.g., "Bi-weekly to production; weekly to TestFlight / Internal Testing"}}

### 1.2 Pre-Release / Beta Channels

| Channel | Audience | How to Join | Build Source |
|---------|----------|-------------|--------------|
| TestFlight | Internal QA + invited external testers (max 10,000) | Invitation email or public link `{{testflight_link}}` | `{{ci_pipeline_name}}` |
| Play Internal Testing | Up to 100 internal users | Add Google account to opt-in list | `{{ci_pipeline_name}}` |
| Play Closed Testing | Named beta groups | Opt-in via opt-in URL `{{play_opt_in_url}}` | `{{ci_pipeline_name}}` |
| Play Open Testing | Public early-access | Self-opt-in via Play listing | `{{ci_pipeline_name}}` |

### 1.3 Enterprise / Managed Distribution

<!-- Mark N/A if the app is not distributed via enterprise channels. -->

| Channel | Use Case | Distribution Mechanism |
|---------|----------|------------------------|
| Apple Business Manager / Custom Apps | Distribute privately to specific organisations | Custom App listing tied to Apple Business Manager IDs |
| Apple Developer Enterprise Program | In-house distribution to employees | `.ipa` hosted on internal MDM / web server |
| Managed Google Play | Private distribution to a Google Workspace org | Listed only inside the org's Managed Play store |
| Direct APK / `adb install` | Internal dev builds, kiosk devices | Hosted on `{{internal_artifact_server}}` |

### 1.4 Sideloading and Web-Based Install

| Path | Supported? | Notes |
|------|------------|-------|
| iOS direct `.ipa` install | {{yes/no}} | Requires enterprise cert or device UDID provisioning |
| Android `.apk` direct download | {{yes/no}} | User must enable "Install from unknown sources"; SHA-256 published at `{{checksum_url}}` |
| AppGallery / Galaxy Store / Amazon Appstore | {{yes/no}} | Listing URLs: `{{listing_urls}}` |

### 1.5 Build Variants Available Externally

| Variant | Bundle ID Suffix | Audience | Backend Pointed At |
|---------|------------------|----------|--------------------|
| Production | `{{ios_bundle_id}}` / `{{android_package_id}}` | All public users | `{{prod_api_base_url}}` |
| Staging | `.staging` | Partner integrators / internal QA | `{{staging_api_base_url}}` |
| Demo | `.demo` | Sales demos, partner pilots | `{{demo_api_base_url}}` |

### 1.6 What Integrators Need to Know

- **Listing assets** (icons, screenshots, marketing copy) live in `{{store_assets_repo_or_path}}`.
- **Region availability:** {{e.g., "US, CA, EU; not available in CN/RU"}}.
- **Age rating / content rating:** {{e.g., "4+ on iOS, Everyone on Play"}}.
- **Pricing model:** {{free | paid | freemium with IAP | subscription}}.
- **Refund / removal policy contact:** {{store_ops_email}}.
