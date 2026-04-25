---
slug: ci-cd-integration-and-deployment
title: "CI/CD Integration and Deployment"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 320
---

## 22. CI/CD Integration and Deployment

### 22.1 CI/CD Pipeline

**Platform:** [e.g., "GitHub Actions"]

**Pipeline Stages:**
1. Build
2. Unit Tests
3. Lint / Static Analysis
4. Integration Tests
5. Build Artifacts
6. Deploy to Beta / Production

### 22.2 Automated Builds

<!-- When are builds triggered automatically? -->

[Document trigger conditions, branch policies, etc.]

### 22.3 Deployment Process

**To Staging:**
```bash
# Triggered on commits to develop branch
# 1. Build staging variant
# 2. Run all tests
# 3. Deploy to TestFlight (iOS) / Firebase App Distribution (Android)
# 4. Post deployment link to Slack
```

**To Production:**
```bash
# Manual trigger via GitHub Actions
# 1. Build production variant
# 2. Run all tests
# 3. Create app bundle for Play Store / create archive for App Store
# 4. Upload to respective stores
# 5. Post changelog to release notes
```
