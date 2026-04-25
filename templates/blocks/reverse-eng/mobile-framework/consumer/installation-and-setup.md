---
slug: installation-and-setup
title: "Installation and Setup"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
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
