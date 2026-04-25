---
slug: platform-specific-concerns
title: "Platform-Specific Concerns"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Platform-Specific Concerns

### 16.1 Android-Specific Implementation

<!-- Android-only concerns: Activities, Fragments, Lifecycle, etc. -->

**Activity Lifecycle Integration:**
```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // App initialization
    }
}
```

### 16.2 iOS-Specific Implementation

<!-- iOS-only concerns: View Controllers, SceneDelegate, App Delegate, etc. -->

[Document iOS lifecycle, SceneDelegate setup, etc.]

### 16.3 React Native Platform-Specific Code

<!-- How is platform-specific code organized? -->

```
src/
├── components/
│   └── Button.tsx
│   ├── Button.ios.tsx    # iOS-specific
│   └── Button.android.tsx # Android-specific
```
