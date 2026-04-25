---
slug: environment-and-configuration
title: "Environment and Configuration"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 120
---

## 2. Environment and Configuration

### 2.1 Prerequisites and Version Requirements

| Dependency | Android | iOS | React Native | Notes |
|-----------|---------|-----|--------------|-------|
| OS Version | API [X]+ | [X.0]+ | Requires Android/iOS |  |
| Language | Kotlin 1.x / Java 8+ | Swift 5.x | JavaScript (ES6+) | Swift preferred on iOS |
| Build Tool | Gradle [version] | Xcode [version] | Expo or React Native CLI | [version] |
| Package Manager | Gradle | CocoaPods / SPM | npm / yarn | [required versions] |
| [Dependency] | [version] | [version] | [version] | [notes] |

### 2.2 Platform-Specific Requirements

#### Android
- **Minimum API Level:** [X] (reason: [e.g., "Use of AndroidX and modern Android libraries"])
- **Target API Level:** [X] (must be kept up-to-date for Play Store)
- **Build Tools Version:** [X.X.X]
- **Gradle Plugin Version:** [X.X.X]

#### iOS
- **Minimum Deployment Target:** [X.0]
- **Xcode Version:** [X.0]+ (required for building)
- **Supported Architectures:** arm64 (required for App Store)
- **Supported Interfaces:** UIKit and SwiftUI (both supported)

#### React Native
- **React Native Version:** [X.XX]+ (earlier versions may not work)
- **Metro Bundler:** [version] (bundled with React Native)
- **Node Version:** [X.X]+
- **npm / yarn:** [version recommendations]

### 2.3 Installation

#### Android Installation

```bash
# Step 1: Add repository (if needed) to build.gradle.kts (Project level)
repositories {
    mavenCentral()  // or your custom Maven repository
}

# Step 2: Add dependency to build.gradle.kts (App level)
dependencies {
    implementation("com.example:framework:X.Y.Z")
    // Include any required transitive dependencies listed below
}
```

**Transitive Dependencies:**
| Dependency | Version | Reason |
|-----------|---------|--------|
| `androidx.appcompat:appcompat` | [version] | [e.g., "Core Android compatibility"] |
| `com.google.android.material:material` | [version] | [e.g., "Material Design components"] |
| `[dependency]` | [version] | [reason] |

**Build Configuration Changes:**

Add to your app's `build.gradle.kts`:
```kotlin
android {
    compileSdk = [XX]
    defaultConfig {
        minSdk = [XX]
        targetSdk = [XX]
        // Add any required default configuration
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_[VERSION]
        targetCompatibility = JavaVersion.VERSION_[VERSION]
    }
}
```

#### iOS Installation

**Via CocoaPods:**

Add to your `Podfile`:
```ruby
pod 'Framework', '~> X.Y'
# or
pod 'Framework', :podspec => 'https://github.com/example/framework.podspec'
```

Then run:
```bash
pod install
```

**Via Swift Package Manager (SPM):**

In Xcode:
1. File → Add Packages
2. Enter repository URL: `https://github.com/example/framework.git`
3. Select version range: `X.Y.Z` or `X.Y.Z ..< X.Y+1.0`
4. Select target to add to

Or in `Package.swift`:
```swift
dependencies: [
    .package(url: "https://github.com/example/framework.git", from: "X.Y.Z")
]
```

**Platform-Specific Dependencies:**

| Package | Version | Source | Reason |
|---------|---------|--------|--------|
| [Dependency] | [version] | CocoaPods / SPM | [reason] |
| [Dependency] | [version] | Xcode built-in | [reason] |

#### React Native Installation

```bash
# Step 1: Install the npm package
npm install @example/framework@X.Y.Z
# or
yarn add @example/framework@X.Y.Z

# Step 2: Link native dependencies (if using React Native < 0.60)
react-native link @example/framework

# Step 3: For Expo projects (if applicable)
expo install @example/framework
```

**Native Dependencies:**
React Native modules may have native dependencies on Android and iOS. These are automatically linked if using React Native 0.60+ (autolinking). For React Native < 0.60, see "Linking and Configuration" section.

### 2.4 Required Build Configuration Changes

#### Android (`build.gradle.kts`)

```kotlin
// Must set sourceCompatibility and targetCompatibility for the framework
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    // Required Gradle configurations
    buildFeatures {
        // Configure as needed for framework
    }
}
```

#### iOS (`Xcode Build Settings`)

No additional build settings required beyond the target iOS deployment target.

**Bridging Header (if using Objective-C in Swift):**

If your project uses Objective-C frameworks, you may need a bridging header:
```objc
// [ProjectName]-Bridging-Header.h
//
//  Created for Framework integration

#ifndef [ProjectName]_Bridging_Header_h
#define [ProjectName]_Bridging_Header_h

#import <Framework/Framework-Swift.h>

#endif /* [ProjectName]_Bridging_Header_h */
```

Configure in Build Settings: `Build Settings → Bridging Header → [path to header]`

#### React Native (`package.json` and `app.json`)

```json
{
  "dependencies": {
    "@example/framework": "^X.Y.Z",
    "react-native": "^0.XX.0"
  }
}
```

**app.json** (if framework requires initialization):
```json
{
  "expo": {
    "plugins": [
      [
        "@example/framework",
        {
          "option1": "value",
          "option2": "value"
        }
      ]
    ]
  }
}
```

### 2.5 Framework Runtime Configuration

#### Android Configuration

```kotlin
// Initialize in Application.onCreate() or as a dependency
import com.example.framework.FrameworkConfig

// Option A: Programmatic initialization
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FrameworkConfig.initialize(
            context = this,
            apiBaseUrl = BuildConfig.API_URL,
            // ... other configuration options
        )
    }
}

// Option B: Dependency injection (if framework supports it)
val frameworkModule = module {
    single { FrameworkConfig(/* ... */) }
}
```

#### iOS Configuration

```swift
// Initialize in UIApplicationDelegate or SwiftUI App

// Option A: UIKit
import Framework

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        FrameworkConfig.initialize(
            apiBaseUrl: Config.apiURL,
            // ... other configuration options
        )
        return true
    }
}

// Option B: SwiftUI
import SwiftUI
import Framework

@main
struct App: SwiftUI.App {
    init() {
        FrameworkConfig.initialize(
            apiBaseUrl: Config.apiURL,
            // ... other configuration options
        )
    }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

#### React Native Configuration

```javascript
// Initialize in App.tsx or at app entry point
import { FrameworkConfig } from '@example/framework';

FrameworkConfig.initialize({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
  // ... other configuration options
});

export default function App() {
  return (
    // ... your app
  );
}
```

**Configuration Options Reference:**

| Option Key | Type | Default | Platform | Description |
|-----------|------|---------|----------|-------------|
| `apiBaseUrl` | `string` | `'/'` | All | [Base URL for framework API calls] |
| `enableLogging` | `boolean` | `false` | All | [Enable debug logging] |
| `[option]` | `[type]` | `[default]` | [Platform(s)] | [Description] |
