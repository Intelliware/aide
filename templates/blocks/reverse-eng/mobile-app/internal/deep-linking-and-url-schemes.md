---
slug: deep-linking-and-url-schemes
title: "Deep Linking and URL Schemes"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Deep Linking and URL Schemes

### 7.1 Deep Link Configuration

<!-- What URL schemes does the app handle? -->

**App-specific scheme:** `[appname]://`

**Universal links/App Links:**
- iOS: `https://example.com/app/...`
- Android: `https://example.com/app/...`

### 7.2 Supported Deep Links

| URL | Screen | Parameters | Notes |
|-----|--------|-----------|-------|
| `[appname]://home` | HomeScreen | — | Open home |
| `[appname]://profile` | ProfileScreen | — | Open profile |
| `[appname]://profile/:userId` | ProfileScreen | `userId` | Open specific user profile |
| `[appname]://feature/detail/:id` | DetailScreen | `id` | Open item detail |
| `https://example.com/app/invite/:code` | InviteScreen | `code` | Invitation deep link |

### 7.3 Deep Link Implementation

**Android:**
```xml
<!-- AndroidManifest.xml -->
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Deep links -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="appname" android:host="*" />
    </intent-filter>

    <!-- Universal links -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="example.com" android:pathPattern="/app/./*" />
    </intent-filter>
</activity>
```

**iOS:**
```swift
// Handle deep links in SceneDelegate or App.swift
.onOpenURL { url in
    navigationManager.handleDeepLink(url)
}
```

**React Native:**
```typescript
const linking = {
  prefixes: ['appname://', 'https://example.com'],
  config: {
    screens: {
      Home: 'home',
      Profile: 'profile/:userId',
      Detail: 'feature/detail/:id',
      Invite: 'invite/:code',
    },
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      {/* Navigation structure */}
    </NavigationContainer>
  );
}
```
