---
slug: quick-reference
title: "Quick Reference"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 370
---

## 27. Quick Reference

### Quick Command Reference

```bash
# Building
./gradlew build                  # Android debug build
./gradlew bundleRelease          # Android app bundle
xcodebuild build                 # iOS debug build
npm run android / npm run ios    # React Native

# Testing
./gradlew test                   # Unit tests
./gradlew connectedAndroidTest   # Instrumentation tests
xcodebuild test                  # iOS tests
npm test                         # React Native tests

# Debugging
logcat                           # Android logs
Console.app                      # iOS logs
react-native log-android         # React Native logs
```

### File Locations Quick Reference

- API Client Setup: `src/network/ApiClient.kt`
- Navigation Config: `src/navigation/Navigation.kt`
- Global State: `src/store/AppStore.kt`
- Authentication: `src/auth/AuthViewModel.kt`
- Database: `src/database/AppDatabase.kt`

### Key Classes/Files

| Purpose | Android | iOS | React Native |
|---------|---------|-----|--------------|
| App Entry | `MainActivity` | `AppDelegate` | `App.tsx` |
| Navigation | `Navigation.kt` | `RootView.swift` | `RootNavigator.tsx` |
| State Management | `AppViewModel` | `AppState` | `store/slices` |
| API Client | `ApiClient.kt` | `ApiClient.swift` | `api/client.ts` |
