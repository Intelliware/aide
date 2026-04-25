---
slug: platform-support-and-requirements
title: "Platform Support and Requirements"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
---

## 2. Platform Support and Requirements

### 2.1 Android Requirements

- **Minimum SDK:** [e.g., API 26 (Android 8.0)]
- **Target SDK:** [e.g., API 34 (Android 14)]
- **Compile SDK:** [e.g., API 34]
- **Build Tools:** [e.g., 34.0.0]

**Key Dependencies:**
- Kotlin [version]
- AndroidX libraries [version]
- Jetpack Compose [version]
- [Other key dependencies]

**Gradle Configuration:**
```gradle
android {
    namespace "com.example.app"
    compileSdk 34
    defaultConfig {
        minSdk 26
        targetSdk 34
        versionCode [number]
        versionName "[version]"
    }
}
```

### 2.2 iOS Requirements

- **Minimum Deployment Target:** [e.g., iOS 13.0]
- **Supported Devices:** [e.g., iPhone, iPad]
- **XCode Version:** [e.g., 15.0+]

**Key Dependencies:**
- Swift [version]
- SwiftUI [version]
- Combine [framework]
- [Other key dependencies]

**Build Settings:**
```
MINIMUM_OS_VERSION: [e.g., 13.0]
SUPPORTED_PLATFORMS: iphoneos
SWIFT_VERSION: [e.g., 5.9]
```

### 2.3 React Native (if applicable)

- **React Native Version:** [e.g., 0.73.x]
- **Node Version:** [e.g., 18.x+]
- **Supported Platforms:** [Android / iOS / Both]

**Key Dependencies:**
- React [version]
- React Native [version]
- React Navigation [version]
- [Other key dependencies]

### 2.4 Development Environment Setup

<!-- Step-by-step setup for new developers -->

```bash
# Clone the repository
git clone [repo-url]

# Install dependencies
[Android] ./gradlew build
[iOS] pod install
[React Native] npm install or yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Run the app
[Android] ./gradlew installDebug
[iOS] xcode-select --install && open ios/[AppName].xcworkspace
[React Native] npx react-native run-android or npx react-native run-ios
```
