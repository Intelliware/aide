# [Framework Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation is structured to enable AI assistants to accurately generate cross-platform mobile applications and integrations using [Framework Name]. Documentation covers Android (Kotlin/Java), iOS (Swift/Objective-C), and React Native (JavaScript) implementations. Every section prioritizes precision, concrete examples, and explicit constraints over narrative explanation.
>
> **Platforms covered:** Android (API 21+) | iOS (12.0+) | React Native (0.63+)
> **Documentation version:** [e.g., 2.1.0 — keep in sync with framework version]
> **Framework version covered:** [e.g., 3.4.x]
> **Last updated:** [date]

---

## Table of Contents

### Part 1 — Foundation
1. [Framework Overview](#1-framework-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Installation and Setup](#3-installation-and-setup)

### Part 2 — Visual Design (if applicable)
4. [Design Tokens, Theming, and Styling](#4-design-tokens-theming-and-styling)

### Part 3 — API Reference
5. [Components and UI Elements](#5-components-and-ui-elements)
6. [Services and Utilities](#6-services-and-utilities)
7. [Shared Types, Interfaces, and Enums](#7-shared-types-interfaces-and-enums)
8. [Platform Integration and Lifecycle](#8-platform-integration-and-lifecycle)
9. [Permissions and Capabilities](#9-permissions-and-capabilities)

### Part 4 — Patterns and Guides
10. [Common Patterns and Recipes](#10-common-patterns-and-recipes)
11. [Anti-Patterns and Pitfalls](#11-anti-patterns-and-pitfalls)
12. [Error Handling and Debugging](#12-error-handling-and-debugging)
13. [Performance Patterns](#13-performance-patterns)
14. [Security Best Practices](#14-security-best-practices)

### Part 5 — React Native Specific
15. [Native Bridge and Module Documentation](#15-native-bridge-and-module-documentation)
16. [Linking and Configuration](#16-linking-and-configuration)

### Part 6 — Quality and Maintenance
17. [Testing](#17-testing)
18. [Accessibility](#18-accessibility)

### Part 7 — Reference
19. [Migration and Upgrade Notes](#19-migration-and-upgrade-notes)
20. [Compatibility Matrix](#20-compatibility-matrix)
21. [Glossary](#21-glossary)
22. [Quick Reference Cheat Sheet](#22-quick-reference-cheat-sheet)
23. [Appendix A: Sample Projects](#appendix-a-sample-projects)

---

# Part 1 — Foundation

---

## 1. Framework Overview

### 1.1 What This Framework Is

- **Name:** [Framework Name]
- **Purpose:** [Two sentences — e.g., "A cross-platform mobile component library and utility framework for iOS, Android, and React Native. Provides reusable UI components, services, and design system integration for building consistent mobile experiences across platforms."]
- **Platforms Supported:**
  - Android (Kotlin/Java, API level [min] and above)
  - iOS (Swift/Objective-C, deployment target [min] and above)
  - React Native ([version] and above)
- **Package(s):**

| Platform | Package Name | Package Manager | Purpose |
|----------|--------------|-----------------|---------|
| Android | `com.example:framework` | Gradle (Maven Central / jCenter) | [e.g., "Core Android library with UI components"] |
| iOS | `Framework` / `framework-ios` | CocoaPods / Swift Package Manager | [e.g., "Swift/Objective-C framework with UI components"] |
| React Native | `@example/framework` | npm | [e.g., "JavaScript module with native bridge"] |

### 1.2 Key Concepts and Architecture

<!-- This is the MENTAL MODEL section. AI models need to understand the core abstractions before they see any API. Describe the 3–7 foundational concepts that everything else builds on. -->

**[Concept 1, e.g., "Component Philosophy"]**

[Explain what the framework provides and how it differs across platforms. e.g., "This framework provides a set of reusable UI components that abstract platform-specific UI patterns. Each component has a consistent API across Android, iOS, and React Native, with platform-specific implementations handling native rendering and behavior. Components automatically respect platform design conventions (Material Design on Android, Human Interface Guidelines on iOS)."]

**[Concept 2, e.g., "State Management"]**

[e.g., "The framework provides a simple state management pattern where each component holds its own state. On Android and iOS, state is managed through view lifecycle and property observers. On React Native, state is managed through React hooks. Data flows in the same direction on all platforms: parent → child via inputs/props."]

**[Concept 3, e.g., "Theming and Styling"]**

[e.g., "Visual appearance is controlled through a centralized design token system (colors, spacing, typography, etc.). On Android, tokens are defined in resources. On iOS, tokens are provided via environment values. On React Native, tokens are available as JavaScript constants. This ensures consistent appearance across all platforms."]

**[Concept 4, e.g., "Platform Lifecycle Integration"]**

[e.g., "The framework automatically integrates with each platform's lifecycle. Android components hook into Activity/Fragment lifecycle. iOS components integrate with UIViewController or SwiftUI lifecycle. React Native components use React lifecycle (useEffect, componentDidMount). Developers don't manually manage platform lifecycle — the framework handles it."]

**How they fit together:**

[Brief paragraph or ASCII diagram showing how the core concepts relate.]

```
[Design Tokens / Theming]
         │
[Components]────────────→ [State Management]
         │                        │
         └────────[Platform Lifecycle Integration]
```

### 1.3 Core Philosophy and Design Principles

- **Principle 1:** [e.g., "Platform-consistent APIs, platform-optimized implementations — the same API across all platforms, but native implementations that respect each platform's conventions."]
- **Principle 2:** [e.g., "Composition over inheritance — build complex UIs by composing small components."]
- **Principle 3:** [e.g., "Explicit over magic — all behaviors are opt-in; no hidden side effects."]
- **Principle 4:** [e.g., "Performance-first — components are optimized for each platform; no unnecessary abstractions."]

### 1.4 When to Use / When NOT to Use

**Use this framework when:**
- [e.g., "Building cross-platform mobile apps on iOS and Android."]
- [e.g., "You need consistent theming across all platforms."]
- [e.g., "You want reusable components without reimplementing for each platform."]

**Do NOT use this framework when:**
- [e.g., "Building iOS-only or Android-only apps — use platform-native frameworks instead."]
- [e.g., "You need deep platform-specific customization not exposed by the framework."]

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

---

## 3. Installation and Setup

### 3.1 Scaffolding a New Project

#### Android Project Setup

```bash
# Create a new Android project using Android Studio template
# File → New → New Project → [Select appropriate template]

# Or use Android CLI
android create project \
  --target android-[API_LEVEL] \
  --name MyApp \
  --path ./MyApp \
  --package com.example.myapp \
  --activity MainActivity
```

**Required Initial Configuration:**
1. Add framework dependency (see Installation section)
2. Update `AndroidManifest.xml` with required permissions
3. Initialize framework in `Application.onCreate()` or via DI
4. Set up theme/styling (if framework provides design system)

#### iOS Project Setup

```bash
# Create new iOS project using Xcode
# File → New → Project → iOS → [Select template]

# Or use command line (Xcode CLI)
xcode-select --install
```

**Required Initial Configuration:**
1. Add framework via CocoaPods or SPM (see Installation section)
2. Create `Info.plist` entries for required capabilities
3. Initialize framework in `AppDelegate` or SwiftUI `App`
4. Set up theme/styling (if framework provides design system)

#### React Native Project Setup

```bash
# Using create-react-native-app
npx create-react-native-app MyApp

# Or using React Native CLI
react-native init MyApp

# Or using Expo
npx create-expo-app MyApp
```

**Required Initial Configuration:**
1. Install framework package via npm/yarn
2. Link native dependencies (if React Native < 0.60)
3. Update `app.json` if framework requires initialization
4. Initialize framework in App component
5. Set up theme/styling (if framework provides design system)

### 3.2 Required Project Structure (Platform-Specific)

#### Android Project Structure

```
MyApp/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml          # Required permissions, app metadata
│   │   │   ├── java/com/example/myapp/
│   │   │   │   ├── MyApplication.kt         # App class, framework initialization
│   │   │   │   ├── MainActivity.kt          # Entry point
│   │   │   │   ├── features/                # Feature packages
│   │   │   │   │   └── [feature-name]/
│   │   │   │   │       ├── [Feature]Activity.kt
│   │   │   │   │       ├── [Feature]ViewModel.kt
│   │   │   │   │       └── components/      # Reusable UI components
│   │   │   │   └── core/                    # Core services, utils
│   │   │   │       ├── network/
│   │   │   │       ├── storage/
│   │   │   │       └── models/
│   │   │   └── res/
│   │   │       ├── values/                  # Colors, strings, styles, dimens
│   │   │       │   └── strings.xml
│   │   │       ├── layout/                  # Android XML layouts (if used)
│   │   │       └── drawable/                # Images, vector drawables
│   │   └── test/                            # Unit tests
│   └── build.gradle.kts                     # App-level build configuration
│
└── build.gradle.kts                         # Project-level build configuration
```

**Key Files:**
- `AndroidManifest.xml` — Define permissions, activities, services, app metadata
- `MyApplication.kt` — Initialize framework and shared services
- `MainActivity.kt` — Entry point activity
- `build.gradle.kts` — Framework dependency and build configuration

#### iOS Project Structure

```
MyApp/
├── MyApp/
│   ├── AppDelegate.swift                    # App lifecycle (UIKit)
│   ├── SceneDelegate.swift                  # Scene lifecycle (iOS 13+)
│   ├── App.swift                            # SwiftUI App (if using SwiftUI)
│   ├── ContentView.swift                    # Root view
│   ├── Features/                            # Feature-specific views/logic
│   │   └── [FeatureName]/
│   │       ├── [Feature]View.swift
│   │       ├── [Feature]ViewModel.swift
│   │       └── Components/
│   ├── Core/                                # Shared services, utilities
│   │   ├── Services/
│   │   ├── Models/
│   │   └── Utilities/
│   ├── Resources/
│   │   ├── Assets.xcassets                  # Images, colors (asset catalog)
│   │   ├── Localization/                    # Strings.strings files
│   │   └── Info.plist                       # App metadata, capabilities, permissions
│   └── MyApp.entitlements                   # Capability entitlements
├── MyAppTests/                              # Unit tests
└── MyApp.xcodeproj/
    └── project.pbxproj                      # Xcode project configuration
```

**Key Files:**
- `AppDelegate.swift` / `App.swift` — Framework initialization
- `Info.plist` — Required permissions, capabilities, metadata
- `Assets.xcassets` — Color set and image assets
- `MyApp.entitlements` — Capabilities (push notifications, keychain, etc.)

#### React Native Project Structure

```
MyApp/
├── src/
│   ├── App.tsx                              # Root app component, framework init
│   ├── index.tsx                            # App entry point
│   ├── screens/                             # Screen/feature components
│   │   └── [FeatureName]/
│   │       ├── [Feature]Screen.tsx
│   │       ├── components/
│   │       └── types.ts
│   ├── components/                          # Reusable components
│   │   └── [Component].tsx
│   ├── services/                            # API, storage, shared services
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── [Service].ts
│   ├── types/                               # Shared TypeScript types
│   │   └── [Type].ts
│   ├── utils/                               # Utilities
│   └── styles/                              # Theme, design tokens (if applicable)
│
├── android/                                 # Native Android code (if needed)
│   └── app/
│       └── src/main/
│           ├── AndroidManifest.xml          # Required permissions
│           └── java/                        # Custom native modules
├── ios/                                     # Native iOS code (if needed)
│   ├── Podfile                              # CocoaPods configuration
│   └── MyApp/
│       └── Info.plist                       # Required permissions, capabilities
├── app.json                                 # Expo/React Native configuration
├── package.json                             # JavaScript dependencies
├── metro.config.js                          # Metro bundler config (if needed)
└── tsconfig.json                            # TypeScript configuration
```

**Key Files:**
- `App.tsx` / `index.tsx` — Framework initialization
- `app.json` — Framework plugin configuration
- `android/app/src/main/AndroidManifest.xml` — Required permissions
- `ios/MyApp/Info.plist` — Required permissions, capabilities
- `package.json` — Framework and other dependencies

### 3.3 Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| **Android** | | |
| Activities | PascalCase + "Activity" | `UserProfileActivity.kt` |
| Fragments | PascalCase + "Fragment" | `UserProfileFragment.kt` |
| ViewModels | PascalCase + "ViewModel" | `UserProfileViewModel.kt` |
| Services | PascalCase + "Service" | `AuthService.kt` |
| Packages | lowercase, dot-separated | `com.example.myapp.features.auth` |
| Resources | lowercase, underscores | `activity_user_profile.xml`, `color_primary` |
| | | |
| **iOS** | | |
| ViewControllers | PascalCase + "ViewController" | `UserProfileViewController.swift` |
| Views (SwiftUI) | PascalCase + "View" | `UserProfileView.swift` |
| ViewModels | PascalCase + "ViewModel" | `UserProfileViewModel.swift` |
| Services | PascalCase + "Service" | `AuthService.swift` |
| Models | PascalCase | `User.swift`, `AuthToken.swift` |
| Frameworks | PascalCase (usually) | `Framework.xcframework` |
| | | |
| **React Native** | | |
| Screens/Components | PascalCase.tsx | `UserProfileScreen.tsx`, `Button.tsx` |
| Hooks | camelCase, prefix "use" | `useAuth.ts`, `useUserProfile.ts` |
| Services | camelCase | `authService.ts`, `storageService.ts` |
| Types | PascalCase | `User.ts`, `AuthResponse.ts` |
| Utils | camelCase | `formatDate.ts`, `validateEmail.ts` |
| Modules | camelCase, npm scope | `@example/framework` |

### 3.4 Module / Dependency Registration Pattern

#### Android (Dependency Injection)

**Using Hilt (recommended):**
```kotlin
@HiltAndroidApp
class MyApplication : Application()

// In your Activity/Fragment/Service
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject
    lateinit var frameworkService: FrameworkService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // frameworkService is automatically injected
    }
}

// Define providers in a module
@Module
@InstallIn(SingletonComponent::class)
object FrameworkModule {
    @Provides
    @Singleton
    fun provideFrameworkConfig(): FrameworkConfig {
        return FrameworkConfig(
            // ... configuration
        )
    }
}
```

**Manual registration:**
```kotlin
// In MyApplication.onCreate()
val frameworkService = FrameworkService(context)
// Store as singleton or pass to activities as needed
```

#### iOS (Dependency Injection)

**Using Property Injection:**
```swift
class UserProfileViewController: UIViewController {
    var authService: AuthService?

    override func viewDidLoad() {
        super.viewDidLoad()
        // authService is injected by parent/router
    }
}
```

**Using Environment Objects (SwiftUI):**
```swift
class AuthService: ObservableObject {
    @Published var isAuthenticated = false
}

struct ContentView: View {
    @StateObject private var authService = AuthService()

    var body: some View {
        // Child views can access via @EnvironmentObject
        ChildView()
            .environmentObject(authService)
    }
}

struct ChildView: View {
    @EnvironmentObject var authService: AuthService
}
```

#### React Native (Dependency Injection)

**Using Context API:**
```javascript
// Create context for framework services
const FrameworkContext = React.createContext(null);

export function FrameworkProvider({ children }) {
  const authService = useAuth();
  const storageService = useStorage();

  return (
    <FrameworkContext.Provider value={{ authService, storageService }}>
      {children}
    </FrameworkContext.Provider>
  );
}

// Use in components
export function useFramework() {
  const context = React.useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used inside FrameworkProvider');
  }
  return context;
}

// In App.tsx
export default function App() {
  return (
    <FrameworkProvider>
      <RootNavigator />
    </FrameworkProvider>
  );
}
```

### 3.5 Minimal Boilerplate App

#### Android Minimal Example

**`AndroidManifest.xml`**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">

    <!-- Framework required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:name=".MyApplication"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**`MyApplication.kt`**
```kotlin
import android.app.Application
import com.example.framework.FrameworkConfig
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FrameworkConfig.initialize(
            context = this,
            apiBaseUrl = "https://api.example.com"
        )
    }
}
```

**`MainActivity.kt`**
```kotlin
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HelloWorldScreen()
        }
    }
}

@Composable
fun HelloWorldScreen() {
    Text("Hello from Framework!")
}
```

**`build.gradle.kts`** (App level)
```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
    id("com.google.dagger.hilt.android")
}

android {
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.x"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.compose.ui:ui:1.6.0")
    implementation("androidx.compose.material3:material3:1.1.0")

    implementation("com.example:framework:X.Y.Z")

    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
}
```

#### iOS Minimal Example

**`AppDelegate.swift`**
```swift
import UIKit
import Framework

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        FrameworkConfig.initialize(
            apiBaseUrl: "https://api.example.com"
        )

        return true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}
```

**`SceneDelegate.swift`**
```swift
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = UIViewController()
        self.window = window
        window.makeKeyAndVisible()
    }
}
```

**`Info.plist`**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>MyApp</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>NSLocalNetworkUsageDescription</key>
    <string>This app needs local network access</string>
    <key>NSBonjourServiceTypes</key>
    <array>
        <string>_myapp._tcp</string>
    </array>
</dict>
</plist>
```

**`Podfile`**
```ruby
platform :ios, '12.0'

target 'MyApp' do
  use_frameworks!

  pod 'Framework', '~> X.Y'
end
```

#### React Native Minimal Example

**`App.tsx`**
```typescript
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { FrameworkConfig } from '@example/framework';

export default function App() {
  useEffect(() => {
    FrameworkConfig.initialize({
      apiBaseUrl: 'https://api.example.com',
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello from Framework!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
```

**`package.json`**
```json
{
  "name": "MyApp",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "@example/framework": "^X.Y.Z"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "typescript": "^4.9.0"
  }
}
```

**`app.json`**
```json
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "plugins": [
      [
        "@example/framework",
        {
          "apiBaseUrl": "https://api.example.com"
        }
      ]
    ]
  }
}
```

---

# Part 2 — Visual Design

---

## 4. Design Tokens, Theming, and Styling

### 4.1 Design Tokens / Variables

<!-- Complete list for each platform. AI must use these instead of hardcoded values. -->

#### Colors

**Android** (in `res/values/colors.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="framework_primary">#[HEX]</color>
    <color name="framework_primary_light">#[HEX]</color>
    <color name="framework_on_primary">#[HEX]</color>
    <!-- ... complete list -->
</resources>
```

**iOS** (in Asset Catalog):
```
Right-click Assets.xcassets → New Color Set
Name: FrameworkPrimary
Attributes Inspector → Input Method: 8-bit
Light: #[HEX]
Dark: #[HEX]
```

Or in code:
```swift
extension UIColor {
    static let frameworkPrimary = UIColor(named: "FrameworkPrimary")!
    static let frameworkPrimaryLight = UIColor(named: "FrameworkPrimaryLight")!
}
```

**React Native** (in `src/styles/colors.ts`):
```typescript
export const colors = {
  primary: '#[HEX]',
  primaryLight: '#[HEX]',
  onPrimary: '#[HEX]',
  // ... complete list
};
```

**Complete Color Token Table:**

| Token Name | Light Mode | Dark Mode (if applicable) | Use Case |
|-----------|-----------|-------------------------|----------|
| `primary` | `#[HEX]` | `#[HEX]` | Primary brand color |
| `secondary` | `#[HEX]` | `#[HEX]` | Secondary accent |
| `success` | `#[HEX]` | `#[HEX]` | Success states |
| `warning` | `#[HEX]` | `#[HEX]` | Warning states |
| `error` | `#[HEX]` | `#[HEX]` | Error states |
| `text_primary` | `#[HEX]` | `#[HEX]` | Primary text |
| `text_secondary` | `#[HEX]` | `#[HEX]` | Secondary text |
| `background` | `#[HEX]` | `#[HEX]` | App background |
| `surface` | `#[HEX]` | `#[HEX]` | Card/surface background |
| `border` | `#[HEX]` | `#[HEX]` | Borders and dividers |

#### Spacing Scale

**Android** (in `res/values/dimens.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <dimen name="framework_spacing_xxs">4dp</dimen>
    <dimen name="framework_spacing_xs">8dp</dimen>
    <dimen name="framework_spacing_sm">12dp</dimen>
    <dimen name="framework_spacing_md">16dp</dimen>
    <dimen name="framework_spacing_lg">24dp</dimen>
    <dimen name="framework_spacing_xl">32dp</dimen>
    <dimen name="framework_spacing_xxl">48dp</dimen>
</resources>
```

**iOS** (in code):
```swift
struct Spacing {
    static let xxs: CGFloat = 4
    static let xs: CGFloat = 8
    static let sm: CGFloat = 12
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}
```

**React Native** (in `src/styles/spacing.ts`):
```typescript
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

#### Typography

**Android** (in `res/values/styles.xml`):
```xml
<style name="Framework.Text.Headline1">
    <item name="android:textSize">32sp</item>
    <item name="android:fontFamily">@font/[font_name]</item>
    <item name="android:textColor">@color/text_primary</item>
</style>
```

**iOS** (in code):
```swift
enum Typography {
    static let headline1 = UIFont.systemFont(ofSize: 32, weight: .bold)
    static let headline2 = UIFont.systemFont(ofSize: 28, weight: .bold)
    static let body = UIFont.systemFont(ofSize: 16, weight: .regular)
}
```

**React Native** (in `src/styles/typography.ts`):
```typescript
export const typography = {
  headline1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
};
```

### 4.2 Theming

#### Android Theme Configuration

```xml
<!-- res/values/styles.xml -->
<style name="Theme.MyApp" parent="Theme.Material3.Light">
    <item name="colorPrimary">@color/framework_primary</item>
    <item name="colorSecondary">@color/framework_secondary</item>
    <!-- Apply framework tokens -->
</style>

<!-- res/values-night/styles.xml (dark mode) -->
<style name="Theme.MyApp" parent="Theme.Material3.Dark">
    <item name="colorPrimary">@color/framework_primary_dark</item>
    <!-- Dark mode configuration -->
</style>
```

#### iOS Appearance Override

```swift
// In AppDelegate or SceneDelegate
if #available(iOS 13, *) {
    window?.overrideUserInterfaceStyle = .light  // or .dark, .unspecified
}

// Or per UIViewController
override func viewDidLoad() {
    super.viewDidLoad()
    if #available(iOS 13, *) {
        overrideUserInterfaceStyle = .light
    }
}
```

#### React Native Theme Provider

```typescript
// src/context/ThemeContext.tsx
import React from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => React.useContext(ThemeContext);
```

### 4.3 Responsive Breakpoints (React Native)

```typescript
// src/styles/breakpoints.ts
export const breakpoints = {
  xs: 0,      // Phone portrait
  sm: 480,    // Phone landscape
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape
  xl: 1280,   // Desktop
};

// Helper hook for responsive design
export function useResponsive(dimension: 'width' | 'height') {
  const [size, setSize] = React.useState(
    dimension === 'width' ? Dimensions.get('window').width : Dimensions.get('window').height
  );

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setSize(dimension === 'width' ? window.width : window.height);
    });
    return () => subscription?.remove();
  }, [dimension]);

  return {
    isPhone: size < breakpoints.md,
    isTablet: size >= breakpoints.md && size < breakpoints.xl,
    isDesktop: size >= breakpoints.xl,
  };
}
```

### 4.4 Styling Do's and Don'ts

- **DO:** [e.g., "Use design tokens from the spacing scale for all margins and padding."]
- **DO:** [e.g., "Use platform-native styling APIs (Material3 on Android, SwiftUI modifiers on iOS)."]
- **DO NOT:** [e.g., "Never hardcode pixel values — always use design tokens."]
- **DO NOT:** [e.g., "Never use `!important` in CSS (web) or force view sizes without considering content."]
- **DO NOT:** [e.g., "Never override framework component styles with private APIs or view hierarchy manipulation."]

---

# Part 3 — API Reference

---

## 5. Components and UI Elements

<!-- Document each component with platform-specific information -->

### 5.1 [Component Category, e.g., "Layout Components"]

#### 5.1.1 `[ComponentName]` — Platform-Specific Implementation

**Availability:**
- Android: ✅ (Kotlin Composable)
- iOS: ✅ (SwiftUI View / UIView)
- React Native: ✅ (Functional Component)

**Platform-Specific Import:**

Android (Kotlin):
```kotlin
import com.example.framework.components.ComponentName
```

iOS (Swift):
```swift
import Framework

// SwiftUI
ComponentNameView()

// UIKit
let component = ComponentNameViewController()
```

React Native (JavaScript):
```typescript
import { ComponentName } from '@example/framework';
```

**Purpose:** [One sentence describing what it does and when to use it.]

**Generic Type Parameters (if any):**

| Parameter | Constraint | Description |
|-----------|-----------|-------------|
| `T` | `extends Any` | [e.g., "Item data type"] |

**Inputs / Props / Properties:**

| Name | Type | Default | Required | Platform | Description |
|------|------|---------|----------|----------|-------------|
| `[inputName]` | `[type]` | `[default]` | Yes / No | Android / iOS / RN | [What it controls] |
| `[inputName2]` | `[type]` | `[default]` | No | RN only | [Platform-specific behavior] |

**Outputs / Events / Callbacks:**

| Name | Type | Platform | Description |
|------|------|----------|-------------|
| `[eventName]` | `(payload: Type) -> Unit` | Android | [When it fires and what the payload means] |
| `[eventName]` | `@escaping (Type) -> Void` | iOS | [When it fires and what the payload means] |
| `on[Event]` | `(payload: Type) => void` | React Native | [When it fires — note: may be async due to bridge] |

**Minimal Usage:**

Android (Kotlin):
```kotlin
ComponentName(
    name = "Value"
)
```

iOS (SwiftUI):
```swift
ComponentNameView(name: "Value")
```

React Native:
```jsx
<ComponentName name="Value" />
```

**Realistic Usage:**

Android (Kotlin):
```kotlin
var selectedValue by remember { mutableStateOf("") }

ComponentName(
    name = "Select Option",
    value = selectedValue,
    onValueChange = { newValue ->
        selectedValue = newValue
    },
    items = listOf("Option 1", "Option 2"),
    enabled = true
)
```

iOS (SwiftUI):
```swift
@State var selectedValue = ""

ComponentNameView(
    name: "Select Option",
    value: $selectedValue,
    items: ["Option 1", "Option 2"],
    onValueChange: { newValue in
        selectedValue = newValue
    }
)
```

React Native:
```jsx
const [selectedValue, setSelectedValue] = useState('');

<ComponentName
  name="Select Option"
  value={selectedValue}
  items={['Option 1', 'Option 2']}
  onValueChange={(newValue) => setSelectedValue(newValue)}
  enabled={true}
/>
```

**Edge Cases and Gotchas:**
- [e.g., "On iOS, the callback is executed on the main thread; on Android, it's on the UI thread. On React Native, it's asynchronous due to the bridge."]
- [e.g., "Must be inside a ScrollView on iOS to enable vertical scrolling, but Android handles this automatically."]

---

## 6. Services and Utilities

### 6.1 `[ServiceName]`

**Availability:**
- Android: ✅
- iOS: ✅
- React Native: ✅ (via native bridge)

**Platform-Specific Import:**

Android (Kotlin):
```kotlin
import com.example.framework.services.ServiceName

// Obtain via dependency injection
@Inject
lateinit var serviceInstance: ServiceName
```

iOS (Swift):
```swift
import Framework

let service = ServiceName()
// or access via environment object / dependency container
```

React Native (JavaScript):
```typescript
import { ServiceName } from '@example/framework';
```

**Purpose:** [What the service does and when to use it]

**Public Methods/Properties:**

| Method / Property | Android | iOS | React Native | Returns | Description |
|-------------------|---------|-----|--------------|---------|-------------|
| `methodName(param: Type): ReturnType` | Kotlin | Swift | Async | `Type` | [What it does] |

**Minimal Usage:**

Android:
```kotlin
val data = serviceInstance.fetchData()
```

iOS:
```swift
let data = try await service.fetchData()
```

React Native:
```javascript
const data = await ServiceName.fetchData();
```

**Edge Cases:**
- [e.g., "On React Native, `fetchData()` crosses the native bridge and is asynchronous."]

---

## 7. Shared Types, Interfaces, and Enums

### 7.1 `[TypeName]`

**Platform Definitions:**

Android (Kotlin):
```kotlin
data class TypeName(
    val property1: String,
    val property2: Int,
    val property3: Boolean = false
)
```

iOS (Swift):
```swift
struct TypeName: Codable {
    let property1: String
    let property2: Int
    let property3: Bool = false
}
```

React Native (TypeScript):
```typescript
interface TypeName {
  property1: string;
  property2: number;
  property3?: boolean;
}
```

**Properties:**

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `property1` | `String` | — | Yes | [What it represents] |
| `property2` | `Int` | — | Yes | [What it represents] |
| `property3` | `Boolean` | `false` | No | [What it represents] |

---

## 8. Platform Integration and Lifecycle

### 8.1 Android Lifecycle Integration

**Activity Lifecycle:**
```kotlin
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Framework initialization here
    }

    override fun onStart() {
        super.onStart()
        // Setup observers
    }

    override fun onDestroy() {
        // Cleanup
        super.onDestroy()
    }
}
```

**Fragment Lifecycle:**
```kotlin
class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // Setup components after view is created
    }
}
```

### 8.2 iOS Lifecycle Integration

**UIViewController Lifecycle:**
```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Framework initialization
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Start observing
    }

    override func viewWillDisappear(_ animated: Bool) {
        // Stop observing
        super.viewWillDisappear(animated)
    }
}
```

**SwiftUI Lifecycle:**
```swift
struct MyView: View {
    @State private var isLoaded = false

    var body: some View {
        VStack {
            // UI
        }
        .onAppear {
            // Called when view appears
        }
        .onDisappear {
            // Called when view disappears
        }
    }
}
```

### 8.3 React Native Lifecycle Integration

```typescript
import { useEffect } from 'react';

export function MyScreen() {
  useEffect(() => {
    // Setup on mount
    console.log('Component mounted');

    return () => {
      // Cleanup on unmount
      console.log('Component will unmount');
    };
  }, []);

  return (
    // UI
  );
}
```

---

## 9. Permissions and Capabilities

### 9.1 Android Permissions

**Required Permissions:**

| Permission | Purpose | Where to declare |
|-----------|---------|------------------|
| `android.permission.INTERNET` | [e.g., "API requests"] | `AndroidManifest.xml` |
| `android.permission.CAMERA` | [e.g., "Camera access"] | `AndroidManifest.xml` + runtime request |

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />

<!-- If targeting Android 6.0+, also request at runtime -->
```

**Runtime Permission Request (Android 6.0+):**
```kotlin
if (ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.CAMERA
    ) != PackageManager.PERMISSION_GRANTED
) {
    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.CAMERA),
        REQUEST_CODE
    )
}
```

### 9.2 iOS Permissions and Capabilities

**Required Permissions (Info.plist):**

| Key | Value | Purpose |
|-----|-------|---------|
| `NSCameraUsageDescription` | [User-facing reason] | Camera access |
| `NSPhotoLibraryUsageDescription` | [User-facing reason] | Photo library access |

**Info.plist entries:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

**Requesting Permissions at Runtime:**
```swift
import AVFoundation

AVCaptureDevice.requestAccess(for: .video) { granted in
    if granted {
        // Camera access granted
    }
}
```

### 9.3 React Native Permissions

**Permission Platform Mapping:**

| Feature | Android | iOS |
|---------|---------|-----|
| Camera | `CAMERA` | `NSCameraUsageDescription` |
| Photos | `READ_EXTERNAL_STORAGE` | `NSPhotoLibraryUsageDescription` |
| Location | `ACCESS_FINE_LOCATION` | `NSLocationWhenInUseUsageDescription` |

**Requesting Permissions (using `react-native-permissions`):**
```typescript
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Platform } from 'react-native';

async function requestCameraPermission() {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });

  const result = await request(permission);
  return result === RESULTS.GRANTED;
}
```

---

# Part 4 — Patterns and Guides

---

## 10. Common Patterns and Recipes

### 10.1 [Pattern Name, e.g., "CRUD List with Server-Side Pagination"]

**Android Implementation:**
```kotlin
// Complete implementation
```

**iOS Implementation:**
```swift
// Complete implementation
```

**React Native Implementation:**
```typescript
// Complete implementation
```

---

## 11. Anti-Patterns and Pitfalls

### 11.1 [Anti-Pattern, e.g., "Hardcoding Colors Instead of Using Design Tokens"]

**What's Wrong:**
```kotlin
// Bad - hardcoded color
Box(modifier = Modifier.background(Color(0xFF3498DB)))
```

**Why It's Wrong:**
[Explanation of the problem — e.g., "Hardcoded colors make theming impossible. If the design token changes, you must update every instance."]

**Correct Approach:**
```kotlin
// Good - using design token
Box(modifier = Modifier.background(FrameworkColors.primary))
```

---

## 12. Error Handling and Debugging

### 12.1 Common Error Codes

| Error Code | Platform | Meaning | Solution |
|-----------|----------|---------|----------|
| `ERR_001` | All | [What it means] | [How to fix it] |

### 12.2 Debugging Tips

- **Android:** [e.g., "Enable debug logging with `FrameworkConfig.enableLogging = true` in logcat"]
- **iOS:** [e.g., "Use Xcode console to view debug output"]
- **React Native:** [e.g., "Use `react-native log-ios` or `react-native log-android` to view console output"]

---

## 13. Performance Patterns

### 13.1 [Pattern, e.g., "Efficient List Rendering"]

**Android:**
```kotlin
// Use LazyColumn for large lists
LazyColumn {
    items(items) { item ->
        ItemRow(item)
    }
}
```

**iOS:**
```swift
// Use List with lazy evaluation or UITableView
List(items, id: \.id) { item in
    ItemRow(item: item)
}
```

**React Native:**
```typescript
// Use FlatList for large lists
<FlatList
  data={items}
  renderItem={({ item }) => <ItemRow item={item} />}
  keyExtractor={(item) => item.id}
/>
```

---

## 14. Security Best Practices

### 14.1 [Best Practice, e.g., "Storing Sensitive Data"]

**Android:**
```kotlin
// Use Android Keystore System
val keyGenParameterSpec = KeyGenParameterSpec.Builder(
    "myKeyAlias",
    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
).setBlockModes(KeyProperties.BLOCK_MODE_GCM).build()

val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES)
keyGenerator.init(keyGenParameterSpec)
val secretKey = keyGenerator.generateKey()
```

**iOS:**
```swift
// Use Keychain
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "myAccount",
    kSecValueData as String: data.data(using: .utf8)!
]
SecItemAdd(query as CFDictionary, nil)
```

**React Native:**
```typescript
// Use react-native-keychain
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('account', 'password');
const credentials = await Keychain.getGenericPassword();
```

---

# Part 5 — React Native Specific

---

## 15. Native Bridge and Module Documentation

### 15.1 [Feature, e.g., "Camera Integration"]

**JavaScript / TypeScript API:**
```typescript
export async function openCamera(): Promise<PhotoResult> {
  // Returns Promise because it crosses the native bridge
}
```

**Native Bridge (Android, Kotlin):**
```kotlin
@ReactMethod
fun openCamera(promise: Promise) {
    // Native implementation
    try {
        // Launch camera activity
        promise.resolve(/* photo URI */)
    } catch (e: Exception) {
        promise.reject("CAMERA_ERROR", e)
    }
}
```

**Native Bridge (iOS, Swift):**
```swift
@objc func openCamera(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Native implementation
    DispatchQueue.main.async {
        // Present camera picker
        resolve(/* photo URI */)
    }
}
```

**Why Async?**
[Explain that the React Native bridge is asynchronous and serializes data across platform boundaries.]

---

## 16. Linking and Configuration

### 16.1 Auto-Linking (React Native 0.60+)

No manual linking required! The framework is automatically linked when installed via npm.

### 16.2 Manual Linking (React Native < 0.60)

**Android:**
```bash
react-native link @example/framework
```

**iOS:**
```bash
react-native link @example/framework
cd ios && pod install
```

---

# Part 6 — Quality and Maintenance

---

## 17. Testing

### 17.1 Android Unit Tests

```kotlin
class ComponentNameTest {
    @Test
    fun testComponentRendersWithGivenName() {
        composeTestRule.setContent {
            ComponentName(name = "Test")
        }

        composeTestRule.onNodeWithText("Test").assertExists()
    }
}
```

### 17.2 iOS Unit Tests

```swift
class ComponentNameTests: XCTestCase {
    func testComponentRendersWithGivenName() {
        let view = ComponentNameView(name: "Test")
        // Assert view renders correctly
    }
}
```

### 17.3 React Native Tests

```typescript
import { render } from '@testing-library/react-native';

describe('ComponentName', () => {
  it('renders with given name', () => {
    const { getByText } = render(<ComponentName name="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

---

## 18. Accessibility

### 18.1 Android Accessibility

```kotlin
ComponentName(
    name = "Label",
    modifier = Modifier.semantics {
        contentDescription = "User-friendly description for screen readers"
    }
)
```

### 18.2 iOS Accessibility

```swift
ComponentNameView(name: "Label")
    .accessibilityLabel("User-friendly description")
    .accessibilityHint("What happens when you interact with this")
```

### 18.3 React Native Accessibility

```jsx
<ComponentName
  name="Label"
  accessible={true}
  accessibilityLabel="User-friendly description"
  accessibilityHint="What happens when you interact with this"
/>
```

---

# Part 7 — Reference

---

## 19. Migration and Upgrade Notes

### 19.1 Upgrading from 1.x to 2.x

**Breaking Changes:**
- `[OldAPI]` is removed. Use `[NewAPI]` instead.
- [Other breaking change]

**Migration:**

Android:
```kotlin
// Before
val data = oldMethod()

// After
val data = newMethod()
```

iOS:
```swift
// Before
let data = oldMethod()

// After
let data = newMethod()
```

React Native:
```typescript
// Before
const data = await oldMethod();

// After
const data = await newMethod();
```

---

## 20. Compatibility Matrix

| Framework Version | Min Android API | Min iOS | Min React Native | Status |
|-------------------|-----------------|---------|------------------|--------|
| 1.0.x             | 21              | 12.0    | 0.63             | Deprecated |
| 2.0.x             | 24              | 14.0    | 0.67             | Current |
| 3.0.x             | 28              | 15.0    | 0.72             | Latest |

---

## 21. Glossary

| Term | Definition |
|------|-----------|
| [Term] | [Definition] |
| Bridge (React Native) | [Explanation of the JavaScript-native communication layer] |

---

## 22. Quick Reference Cheat Sheet

### Imports

```
Android: import com.example.framework.*
iOS: import Framework
React Native: import { ... } from '@example/framework'
```

### Basic Setup

```kotlin
// Android
FrameworkConfig.initialize(context, apiBaseUrl)

// iOS
FrameworkConfig.initialize(apiBaseUrl: url)

// React Native
FrameworkConfig.initialize({ apiBaseUrl: url })
```

### Common Components

[Quick reference table of commonly-used components and their basic usage]

---

## 23. Appendix A: Sample Projects

### Android Sample

Located at: `github.com/example/framework-android-sample`

Build and run:
```bash
git clone https://github.com/example/framework-android-sample.git
cd framework-android-sample
./gradlew :app:installDebug
```

### iOS Sample

Located at: `github.com/example/framework-ios-sample`

Build and run:
```bash
git clone https://github.com/example/framework-ios-sample.git
cd framework-ios-sample
pod install
open MyApp.xcworkspace
# Run in Xcode: Product → Run
```

### React Native Sample

Located at: `github.com/example/framework-rn-sample`

Build and run:
```bash
git clone https://github.com/example/framework-rn-sample.git
cd framework-rn-sample
npm install
npx react-native run-ios
# or
npx react-native run-android
```

---

## Additional Resources

- [Framework GitHub Repository](https://github.com/example/framework)
- [Issue Tracker](https://github.com/example/framework/issues)
- [Changelog](https://github.com/example/framework/blob/main/CHANGELOG.md)
- [Contributing Guide](https://github.com/example/framework/blob/main/CONTRIBUTING.md)
