# [Application Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation is structured to enable AI assistants to accurately generate features, fix bugs, and make architectural changes to [Application Name]. Every section prioritizes precision, concrete examples, and explicit constraints over narrative explanation. This documentation serves both mobile app developers who work on this codebase and stakeholders who need to understand the application at a high level.
>
> **Documentation version:** [e.g., 1.0.0 — keep in sync with app version]
> **App version covered:** [e.g., 2.4.x]
> **Last updated:** [date]
> **Platforms:** [Android / iOS / React Native / All]

---

## Table of Contents

### Part 1 — Foundation and Architecture

1. [Application Overview](#1-application-overview)
2. [Platform Support and Requirements](#2-platform-support-and-requirements)
3. [Project Structure and Organization](#3-project-structure-and-organization)
4. [Build Configuration, Variants, and Schemes](#4-build-configuration-variants-and-schemes)
5. [Application Architecture](#5-application-architecture)

### Part 2 — Navigation and User Flow

6. [Navigation Structure](#6-navigation-structure)
7. [Deep Linking and URL Schemes](#7-deep-linking-and-url-schemes)

### Part 3 — State and Data Management

8. [State Management](#8-state-management)
9. [Dependency Injection and Service Locators](#9-dependency-injection-and-service-locators)
10. [Local Storage and Persistence](#10-local-storage-and-persistence)

### Part 4 — API Integration and External Services

11. [API Integration and Networking](#11-api-integration-and-networking)
12. [Authentication and Authorization](#12-authentication-and-authorization)
13. [Push Notifications](#13-push-notifications)

### Part 5 — Features and Screens

14. [Feature Inventory](#14-feature-inventory)
15. [Shared Components and Patterns](#15-shared-components-and-patterns)

### Part 6 — Platform-Specific Implementation

16. [Platform-Specific Concerns](#16-platform-specific-concerns)
17. [Permissions and Capabilities](#17-permissions-and-capabilities)
18. [Platform-Specific UI Patterns](#18-platform-specific-ui-patterns)
19. [Native Module Integration](#19-native-module-integration)

### Part 7 — Quality, Testing, and Deployment

20. [Testing Strategy and Infrastructure](#20-testing-strategy-and-infrastructure)
21. [Application Signing and Distribution](#21-application-signing-and-distribution)
22. [CI/CD Integration and Deployment](#22-cicd-integration-and-deployment)
23. [Performance Patterns and Optimization](#23-performance-patterns-and-optimization)

### Part 8 — Patterns, Anti-Patterns, and Reference

24. [Common Patterns and Recipes](#24-common-patterns-and-recipes)
25. [Anti-Patterns and Gotchas](#25-anti-patterns-and-gotchas)
26. [Glossary](#26-glossary)
27. [Quick Reference](#27-quick-reference)

---

# Part 1 — Foundation and Architecture

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

---

## 3. Project Structure and Organization

### 3.1 Directory Structure

```
[project-root]/
├── [platform-specific-directory]/
│   ├── [Android]
│   │   ├── app/
│   │   │   ├── build.gradle
│   │   │   ├── src/
│   │   │   │   ├── main/
│   │   │   │   │   ├── AndroidManifest.xml
│   │   │   │   │   ├── java/com/example/app/
│   │   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   │   ├── di/                    # Dependency injection
│   │   │   │   │   │   ├── ui/                    # UI layers: screens, components
│   │   │   │   │   │   ├── data/                  # Data layer: repositories, network, database
│   │   │   │   │   │   ├── domain/                # Domain layer: use cases, entities
│   │   │   │   │   │   └── navigation/            # Navigation setup
│   │   │   │   │   └── res/
│   │   │   │   │       ├── drawable/
│   │   │   │   │       ├── layout/
│   │   │   │   │       ├── values/
│   │   │   │   │       └── values-*/              # Resources per configuration
│   │   │   │   ├── debug/
│   │   │   │   └── test/                          # Unit tests
│   │   │   │       └── java/com/example/app/
│   │   └── gradle/
│   │
│   ├── [iOS]
│   │   ├── [AppName]/
│   │   │   ├── App/
│   │   │   │   ├── [AppName]App.swift
│   │   │   │   ├── RootView.swift
│   │   │   ├── Features/
│   │   │   │   ├── [Feature1]/
│   │   │   │   │   ├── Views/
│   │   │   │   │   ├── ViewModels/
│   │   │   │   │   ├── Models/
│   │   │   │   │   └── Services/
│   │   │   │   └── [Feature2]/
│   │   │   ├── Shared/
│   │   │   │   ├── Components/
│   │   │   │   ├── Services/
│   │   │   │   └── Models/
│   │   │   ├── Core/
│   │   │   │   ├── DI/                            # Dependency injection
│   │   │   │   ├── Navigation/
│   │   │   │   └── Network/
│   │   │   └── Info.plist
│   │   ├── [AppName]Tests/
│   │   └── [AppName].xcworkspace
│   │
│   └── [React-Native]
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx
│       │   │   └── RootNavigator.tsx
│       │   ├── features/
│       │   │   ├── [feature1]/
│       │   │   │   ├── screens/
│       │   │   │   ├── components/
│       │   │   │   ├── navigation/
│       │   │   │   ├── store/ or hooks/           # State management
│       │   │   │   └── services/
│       │   │   └── [feature2]/
│       │   ├── shared/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   ├── utils/
│       │   │   └── services/
│       │   ├── navigation/
│       │   ├── store/ or context/                 # Global state management
│       │   ├── types/
│       │   └── constants/
│       ├── android/
│       ├── ios/
│       ├── package.json
│       └── app.json
│
├── docs/
│   ├── architecture.md
│   ├── api-integration.md
│   └── [other-docs].md
│
├── .env.example
├── .gitignore
├── README.md
└── [build-config-files]
```

### 3.2 Module Organization

<!-- How are features organized? By feature? By layer? -->

**Organization approach:** [e.g., "Feature-based (feature per directory) with clear layer separation"]

**Feature Module Structure:**
```
features/
└── [feature-name]/
    ├── presentation/              # UI layer
    │   ├── screens/
    │   │   └── [ScreenName].kt/.swift/.tsx
    │   ├── components/
    │   │   └── [ComponentName].kt/.swift/.tsx
    │   ├── viewmodel/
    │   │   └── [FeatureName]ViewModel.kt
    │   └── state/                 # Feature-specific state
    │       └── [FeatureName]State.kt
    ├── domain/                    # Business logic
    │   ├── usecases/
    │   │   └── [UseCase].kt
    │   └── models/
    │       └── [Entity].kt
    └── data/                      # Data access
        ├── repositories/
        │   └── [Repository].kt
        ├── datasources/
        │   ├── local/             # Local storage
        │   └── remote/            # API calls
        └── models/                # DTOs
            └── [Model].kt
```

### 3.3 Naming Conventions

<!-- Establish consistent naming throughout the codebase -->

| Artifact | Convention | Example |
|----------|-----------|---------|
| Screens/Activities | PascalCase + "Screen" or "Activity" | `LoginScreen.kt`, `HomeActivity.kt` |
| Components | PascalCase | `UserCard.swift`, `ProfileHeader.tsx` |
| ViewModels | PascalCase + "ViewModel" | `AuthViewModel.kt`, `ProfileViewModel.swift` |
| Store/Reducer | camelCase + "Store" or "Reducer" | `authStore.ts`, `userReducer.ts` |
| Services | PascalCase + "Service" | `AuthService.kt`, `ApiService.swift` |
| Repositories | PascalCase + "Repository" | `UserRepository.kt`, `PostRepository.swift` |
| State classes | PascalCase + "State" | `LoginState.kt`, `HomeState.tsx` |
| Enums | PascalCase | `UserRole.kt`, `ScreenState.swift` |
| Files | Match class name in camelCase | `userViewModel.ts`, `authService.kt` |
| Test files | [ClassName].test.ts or [ClassName]Test.kt | `LoginViewModel.test.ts`, `UserRepositoryTest.kt` |

---

## 4. Build Configuration, Variants, and Schemes

### 4.1 Build Variants/Flavors/Schemes

<!-- What build types exist and when to use them? -->

| Variant/Scheme | Purpose | API Base URL | Features | When to Use |
|---|---|---|---|---|
| Debug | Local development | `http://localhost:8000` | All features enabled, logging verbose | During development |
| Staging | Testing before production | `https://staging.api.example.com` | All features enabled, analytics mocked | QA testing, pre-release |
| Release/Production | Production deployment | `https://api.example.com` | Feature flags controlled | App store release |

### 4.2 Android Build Configuration

```gradle
// build.gradle (Module: app)

android {
    namespace "com.example.appname"
    compileSdk 34

    defaultConfig {
        applicationId "com.example.appname"
        minSdk 26
        targetSdk 34
        versionCode 24                    // Increment on every release
        versionName "2.4.5"               // Match version in version files
    }

    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
            applicationIdSuffix ".debug"
            signingConfig signingConfigs.debug
            buildConfigField "String", "API_BASE_URL", "\"http://localhost:8000\""
        }

        release {
            debuggable false
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
            buildConfigField "String", "API_BASE_URL", "\"https://api.example.com\""
        }
    }

    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            buildConfigField "String", "API_BASE_URL", "\"http://localhost:8000\""
        }

        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            buildConfigField "String", "API_BASE_URL", "\"https://staging.api.example.com\""
        }

        prod {
            dimension "environment"
            buildConfigField "String", "API_BASE_URL", "\"https://api.example.com\""
        }
    }
}
```

**Building variants:**
```bash
# Debug variant
./gradlew assembleDebug

# Staging release
./gradlew assembleStagingRelease

# Production release
./gradlew assembleProdRelease
```

### 4.3 iOS Build Configuration

```swift
// Build Settings in Xcode

// Configurations
├── Debug
│   └── API_BASE_URL = http://localhost:8000
├── Staging
│   └── API_BASE_URL = https://staging.api.example.com
└── Release
    └── API_BASE_URL = https://api.example.com

// Schemes
├── [AppName] (Debug)      → Debug configuration
├── [AppName] (Staging)    → Staging configuration
└── [AppName] (Release)    → Release configuration
```

**Building from command line:**
```bash
# Debug
xcodebuild -scheme "[AppName]" -configuration Debug -derivedDataPath build

# Staging
xcodebuild -scheme "[AppName] (Staging)" -configuration Staging -derivedDataPath build

# Release
xcodebuild -scheme "[AppName]" -configuration Release -derivedDataPath build
```

### 4.4 React Native Build Configuration

```json
// app.json
{
  "name": "[AppName]",
  "displayName": "[App Name]",
  "version": "2.4.5",
  "expo": {
    "name": "[App Name]",
    "slug": "appname",
    "platforms": ["android", "ios"],
    "version": "2.4.5",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "bundleIdentifier": "com.example.appname",
      "deploymentTarget": "13.0"
    },
    "android": {
      "package": "com.example.appname",
      "minSdkVersion": 26
    }
  }
}

// .env files for configuration
.env.development    → http://localhost:8000
.env.staging        → https://staging.api.example.com
.env.production     → https://api.example.com
```

---

## 5. Application Architecture

### 5.1 Architecture Pattern

**Pattern:** [e.g., "MVVM with Redux for state management"]

**Why this pattern:** [Reasoning for architecture choice]

### 5.2 Architectural Layers

<!-- Describe each architectural layer -->

**Presentation Layer (UI):**
- [Screens/Activities/Views]
- [Components]
- [State management]
- Responsibility: Display data, handle user input, delegate to business logic

**Domain Layer (Business Logic):**
- [Use Cases]
- [Entities]
- [Business Rules]
- Responsibility: Core business logic, independent of UI and data source

**Data Layer (Persistence):**
- [Repositories]
- [Data Sources (local and remote)]
- [Models/Entities]
- Responsibility: Provide data from network and local storage

### 5.3 Data Flow Architecture

```
[User Input/Event]
        ↓
[Screen/Component]
        ↓
[ViewModel/State Manager]
        ↓
[Use Case/Business Logic]
        ↓
[Repository]
        ├─→ [Local Storage/Database]
        └─→ [Remote API]
        ↓
[Update State]
        ↓
[Update UI]
```

### 5.4 Key Architectural Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| [e.g., "MVVM over MVC"] | [Why was this chosen?] | [What does this affect?] |
| [e.g., "Redux for global state"] | [Why was this chosen?] | [What does this affect?] |
| [e.g., "Repository pattern for data access"] | [Why?] | [Impact?] |

### 5.5 Core Abstractions and Patterns

<!-- What are the fundamental patterns developers must understand? -->

**[Pattern 1: e.g., "The Repository Pattern"]**

Every feature has a Repository that abstracts data access. The Repository:
- Fetches from local database first (if cached)
- Falls back to remote API
- Updates local cache on API success
- Returns Flows/LiveData that the ViewModel observes

Example:
```kotlin
interface UserRepository {
    fun getUser(userId: String): Flow<Result<User>>
}

class UserRepositoryImpl : UserRepository {
    override fun getUser(userId: String): Flow<Result<User>> = flow {
        // Try local first
        val cached = localDataSource.getUser(userId)
        if (cached != null) {
            emit(Result.success(cached))
        }

        // Fetch from API
        val remote = try {
            remoteDataSource.getUser(userId)
        } catch (e: Exception) {
            return@flow emit(Result.failure(e))
        }

        // Update cache
        localDataSource.saveUser(remote)
        emit(Result.success(remote))
    }
}
```

---

## 6. Navigation Structure

### 6.1 Navigation Graph

<!-- Complete map of all screens and how they connect -->

```
[App Entry]
    ↓
[Route: / (Authentication Check)]
    ├─→ [Not Authenticated]
    │   └─→ [Route: /auth]
    │       ├─→ [Screen: LoginScreen]
    │       │   └─→ Navigates to: /auth/signup, /, /auth/forgot-password
    │       ├─→ [Screen: SignupScreen]
    │       │   └─→ Navigates to: /auth/login, /
    │       └─→ [Screen: ForgotPasswordScreen]
    │           └─→ Navigates to: /auth/login
    │
    └─→ [Authenticated]
        └─→ [Route: / (Main App)]
            ├─→ [Screen: HomeScreen]
            │   └─→ Navigates to: /feature1/detail/:id, /profile, /settings
            ├─→ [Screen: Feature1Screen]
            │   └─→ Navigates to: /feature1/detail/:id
            ├─→ [Screen: Feature1DetailScreen]
            │   └─→ Navigates back to: /feature1
            ├─→ [Screen: ProfileScreen]
            │   └─→ Navigates to: /profile/edit, /settings, /
            ├─→ [Screen: SettingsScreen]
            │   └─→ Navigates to: /
```

### 6.2 Screen Inventory

| Route | Screen Name | Purpose | Inputs | Navigation Targets |
|-------|---|---|---|---|
| `/auth` | AuthScreen | Authentication entry point | — | `/auth/login`, `/auth/signup` |
| `/auth/login` | LoginScreen | User login | email, password | `/` (on success), `/auth/signup`, `/auth/forgot-password` |
| `/auth/signup` | SignupScreen | User registration | name, email, password | `/` (on success), `/auth/login` |
| `/` | HomeScreen | Main app hub | — | `/:feature/`, `/profile`, `/settings` |
| `/:feature/list` | FeatureListScreen | List of items | — | `/:feature/detail/:id`, `/settings` |
| `/:feature/detail/:id` | DetailScreen | Item details | id | back navigation |

### 6.3 Navigation Implementation

**Android with Compose Navigation:**
```kotlin
@Composable
fun NavGraph() {
    val navController = rememberNavController()

    NavHost(navController, startDestination = "auth") {
        composable("auth") { AuthScreen(navController) }
        composable("home") { HomeScreen(navController) }
        composable(
            "detail/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) { backStackEntry ->
            DetailScreen(
                id = backStackEntry.arguments?.getString("id"),
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
```

**iOS with SwiftUI Navigation:**
```swift
@main
struct AppView: View {
    @StateObject var navigationManager = NavigationManager()
    @StateObject var authManager = AuthManager()

    var body: some View {
        if authManager.isAuthenticated {
            MainNavigationView(navigationManager: navigationManager)
        } else {
            AuthNavigationView(navigationManager: navigationManager, authManager: authManager)
        }
    }
}
```

**React Native with React Navigation:**
```typescript
export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
```

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

---

## 8. State Management

### 8.1 State Management Pattern

**Pattern:** [e.g., "Redux with async thunks for side effects"]

**Why:** [Reasoning for this choice]

### 8.2 Global State Structure

<!-- Show the complete state tree -->

```typescript
// Redux example
{
  auth: {
    isAuthenticated: boolean,
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null,
  },

  home: {
    items: Item[],
    selectedId: string | null,
    loading: boolean,
    error: string | null,
  },

  ui: {
    darkMode: boolean,
    selectedTab: 'home' | 'explore' | 'profile',
  },
}
```

### 8.3 State Mutation Pattern

<!-- How does state change? What actions/methods exist? -->

**Android MVVM with LiveData:**
```kotlin
class AuthViewModel(private val authUseCase: AuthUseCase) : ViewModel() {
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authUseCase.login(email, password)
            _authState.value = when {
                result.isSuccess -> AuthState.Success(result.getOrNull()!!)
                else -> AuthState.Error(result.exceptionOrNull()!!.message ?: "Unknown error")
            }
        }
    }
}

sealed class AuthState {
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

**iOS with Combine:**
```swift
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let authService: AuthService
    private var cancellables = Set<AnyCancellable>()

    func login(email: String, password: String) {
        isLoading = true
        authService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] user in
                self?.user = user
                self?.isAuthenticated = true
            }
            .store(in: &cancellables)
    }
}
```

**React Native with Redux:**
```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => { state.loading = true; },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Async thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginParams) => {
    const response = await authApi.login(email, password);
    return response.data;
  }
);
```

### 8.4 Side Effects and Async Operations

<!-- How are API calls, timers, and other side effects handled? -->

[Document how side effects are triggered and handled in your state management pattern]

---

## 9. Dependency Injection and Service Locators

### 9.1 DI Framework and Setup

**Framework:** [e.g., "Hilt for Android, SwiftUI DI for iOS"]

### 9.2 Service Registration

<!-- How are services registered and accessed? -->

**Android with Hilt:**
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideApiClient(): ApiClient = ApiClient()

    @Provides
    @Singleton
    fun provideAuthService(apiClient: ApiClient): AuthService = AuthService(apiClient)
}
```

**iOS with SwiftUI:**
```swift
// Using @Environment
class AppContainer {
    static let shared = AppContainer()

    let authService = AuthService()
    let apiClient = ApiClient()
}

struct AppView: View {
    @StateObject var appContainer = AppContainer.shared

    var body: some View {
        ContentView()
            .environmentObject(appContainer.authService)
            .environmentObject(appContainer.apiClient)
    }
}
```

**React Native with Context/Providers:**
```typescript
const ServiceContext = createContext<AppServices | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const services = useMemo(() => ({
    authService: new AuthService(),
    apiClient: new ApiClient(),
  }), []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const services = useContext(ServiceContext);
  if (!services) throw new Error('useServices must be used within AppProvider');
  return services;
}
```

---

## 10. Local Storage and Persistence

### 10.1 Data Persistence Strategy

**Approach:** [e.g., "Room for structured data, SharedPreferences for simple key-value, Keychain for secrets"]

### 10.2 Database Schema

<!-- Document database structure -->

**Users Table:**
```
- id: String (Primary Key)
- email: String (Unique)
- name: String
- avatarUrl: String
- createdAt: Long
- updatedAt: Long
```

**Items Table:**
```
- id: String (Primary Key)
- userId: String (Foreign Key → Users.id)
- title: String
- description: String
- createdAt: Long
- updatedAt: Long
```

### 10.3 Local Storage Implementation

**Android with Room:**
```kotlin
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val email: String,
    val name: String,
    @ColumnInfo(name = "avatar_url") val avatarUrl: String,
    val createdAt: Long,
)

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    fun getUser(id: String): Flow<UserEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
}
```

**iOS with CoreData:**
```swift
@NSManaged var id: String
@NSManaged var email: String
@NSManaged var name: String
@NSManaged var avatarUrl: String
@NSManaged var createdAt: Date
```

**React Native with SQLite/Realm:**
```typescript
const schema = {
  name: 'User',
  properties: {
    id: 'string',
    email: 'string',
    name: 'string',
    avatarUrl: 'string',
    createdAt: 'date',
  },
  primaryKey: 'id',
};
```

### 10.4 Caching Strategy

<!-- How is data cached and invalidated? -->

[Document cache invalidation, TTL, refresh patterns, etc.]

---

## 11. API Integration and Networking

### 11.1 API Base Configuration

| Environment | Base URL | Timeout | Retry Policy |
|---|---|---|---|
| Debug | `http://localhost:8000` | 30s | 3 retries, exponential backoff |
| Staging | `https://staging.api.example.com` | 30s | 3 retries, exponential backoff |
| Production | `https://api.example.com` | 30s | 3 retries, exponential backoff |

### 11.2 HTTP Client Setup

**Android with Retrofit + OkHttp:**
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(AuthInterceptor())
        .addInterceptor(LoggingInterceptor())
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .client(okHttpClient)
        .build()
}
```

**iOS with URLSession:**
```swift
class ApiClient {
    static let shared = ApiClient()

    private let session: URLSession
    private let baseURL: URL

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        self.baseURL = URL(string: Config.apiBaseURL)!
    }
}
```

**React Native with Axios:**
```typescript
const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 11.3 API Endpoints Consumed

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ token, user: User }` |
| POST | `/api/auth/signup` | User registration | `{ email, password, name }` | `{ token, user: User }` |
| GET | `/api/users/:id` | Get user profile | — | `User` |
| GET | `/api/items` | List items | Query: `?page=1&limit=20` | `{ items: Item[], total: number }` |
| POST | `/api/items` | Create item | `{ title, description }` | `Item` |

### 11.4 Error Handling

<!-- How are API errors handled? What's the retry strategy? -->

[Document error types, retry logic, fallback behaviors, etc.]

---

## 12. Authentication and Authorization

### 12.1 Authentication Mechanism

**Type:** [e.g., "JWT tokens with refresh token rotation"]

**Token Storage:**
- Android: [SharedPreferences / EncryptedSharedPreferences]
- iOS: [Keychain]
- React Native: [AsyncStorage / Secure Store]

### 12.2 Authentication Flow

```
[User enters credentials]
    ↓
[POST /api/auth/login]
    ↓
[Receive token + refreshToken]
    ↓
[Store in secure storage]
    ↓
[Set Authorization header for future requests]
    ↓
[Navigate to authenticated screens]
```

### 12.3 Token Refresh

<!-- How are expired tokens refreshed? -->

[Document refresh token flow, when it's triggered, what happens on failure, etc.]

### 12.4 Logout

<!-- How is the user logged out? -->

[Document logout flow: clear tokens, redirect to login, etc.]

---

## 13. Push Notifications

### 13.1 Push Notification Setup

**Service:** [e.g., "Firebase Cloud Messaging (FCM)"]

### 13.2 Notification Types

| Type | Payload | Behavior |
|------|---------|----------|
| Welcome | `{ title, message }` | Show notification |
| Message | `{ conversationId, message }` | Show badge, navigate to conversation |
| Reminder | `{ reminderId, title }` | Show notification with action |

### 13.3 Implementation

[Document how notifications are handled: registration, receiving, displaying, user interaction]

---

## 14. Feature Inventory

### 14.1 Feature List

<!-- Complete list of features with brief descriptions -->

- **Authentication:** User login, signup, password reset
- **Home:** Feed display, item refresh, search
- **Profile:** User profile view and editing
- **[Feature Name]:** [Description]

### 14.2 Feature Details

**Feature: Authentication**
- Screens: Login, Signup, ForgotPassword, ConfirmEmail
- State: AuthState (user, token, loading, error)
- API Endpoints: POST /auth/login, POST /auth/signup, POST /auth/reset-password
- Local Storage: JWT token, refresh token

**Feature: [Feature Name]**
- Screens: [list screens]
- State: [describe state]
- API Endpoints: [list endpoints]
- Local Storage: [list stored data]

---

## 15. Shared Components and Patterns

### 15.1 Reusable Components

<!-- Common UI components used across the app -->

| Component | Purpose | Usage |
|-----------|---------|-------|
| `LoadingIndicator` | Show loading state | Wrap async operations |
| `ErrorDialog` | Display error messages | Show API errors |
| `UserAvatar` | Display user profile pictures | User list, profiles |

### 15.2 Common Patterns

**Pattern: Loading State Pattern**
```kotlin
sealed class AsyncState<T> {
    object Loading : AsyncState<T>()
    data class Success<T>(val data: T) : AsyncState<T>()
    data class Error<T>(val exception: Throwable) : AsyncState<T>()
}
```

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

---

## 17. Permissions and Capabilities

### 17.1 Android Permissions

| Permission | Purpose | Type | Requested at |
|-----------|---------|------|--------------|
| `INTERNET` | Network access | Normal | Install time |
| `CAMERA` | Camera access | Dangerous | Runtime |
| `READ_CONTACTS` | Contact access | Dangerous | Runtime |

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

### 17.2 iOS Capabilities

| Capability | Purpose | Info.plist Key |
|-----------|---------|---------|
| Camera | Camera access | `NSCameraUsageDescription` |
| Contacts | Contact access | `NSContactsUsageDescription` |

**Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos</string>
<key>NSContactsUsageDescription</key>
<string>We need contact access to share with friends</string>
```

---

## 18. Platform-Specific UI Patterns

### 18.1 Android UI Patterns

**Material Design Components:**
[Document Material Design patterns used: Material 3, Compose, etc.]

**Jetpack Compose Patterns:**
[Document compose-specific patterns, state hoisting, recomposition, etc.]

### 18.2 iOS UI Patterns

**Human Interface Guidelines:**
[Document HIG patterns: navigation, bars, typography, etc.]

**SwiftUI Patterns:**
[Document SwiftUI patterns: view composition, property wrappers, etc.]

### 18.3 Cross-Platform Consistency

[Document how platform-specific UIs maintain consistency with each other]

---

## 19. Native Module Integration

### 19.1 Custom Native Modules

| Module | Platform | Purpose |
|--------|----------|---------|
| [Module Name] | Android/iOS | [What does it do?] |

### 19.2 Native Module Implementation

**Android Kotlin:**
```kotlin
// Native module implementation
```

**iOS Swift:**
```swift
// Native module implementation
```

**React Native Bridge (if applicable):**
```typescript
// Bridge code
```

---

## 20. Testing Strategy and Infrastructure

### 20.1 Testing Pyramid

```
        /\
       /  \        UI Tests (Espresso, XCTest, Detox)
      /----\       Integration Tests
     /      \      Unit Tests
    /--------\
```

### 20.2 Unit Testing

**Framework:** [e.g., "JUnit for Android, XCTest for iOS, Jest for RN"]

**Example:**
```kotlin
@Test
fun testLogin_success() {
    // Arrange
    val viewModel = AuthViewModel(mockAuthUseCase)
    coEvery { mockAuthUseCase.login(email, password) } returns Result.success(user)

    // Act
    viewModel.login(email, password)

    // Assert
    assertEquals(AuthState.Success(user), viewModel.authState.value)
}
```

### 20.3 Integration Testing

[Document integration tests between layers]

### 20.4 UI Testing

**Framework:** [e.g., "Espresso for Android, XCUITest for iOS, Detox for RN"]

[Document UI test structure and examples]

### 20.5 Running Tests

```bash
# Android
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest   # Instrumentation tests

# iOS
xcodebuild test -scheme [AppName]

# React Native
npm test                          # Unit tests
detox test e2e/firstTest.e2e.js # E2E tests
```

---

## 21. Application Signing and Distribution

### 21.1 Android Signing

**Keystore Requirements:**
- Location: `./app/keystore/release.jks`
- Alias: [production alias]
- Key password: [stored in secure location]

**Building signed APK:**
```bash
./gradlew bundleRelease  # Create App Bundle for Play Store
./gradlew assembleRelease # Create signed APK
```

### 21.2 iOS Signing

**Certificate and Provisioning Profile:**
- Developer Certificate: [issued to team]
- Provisioning Profile: [for bundle ID]
- Distribution Certificate: [for App Store]

**Build for distribution:**
```bash
xcodebuild archive -scheme [AppName] -archivePath build/app.xcarchive
```

### 21.3 Distribution Channels

**Android:**
- Google Play Store (primary)
- [Other channels if applicable]

**iOS:**
- Apple App Store (primary)
- TestFlight (beta testing)
- [Other channels if applicable]

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

---

## 23. Performance Patterns and Optimization

### 23.1 Startup Time Optimization

<!-- Reduce time from launch to interactive -->

[Document startup time targets, optimization patterns, profiling approach]

### 23.2 Memory Management

<!-- Prevent memory leaks and excessive memory usage -->

[Document memory patterns, tools for profiling, common issues]

### 23.3 Battery Efficiency

<!-- Minimize battery drain -->

[Document battery-efficient patterns, avoid common pitfalls]

### 23.4 Network Optimization

<!-- Minimize API calls and payload size -->

[Document caching, batching, compression patterns]

---

## 24. Common Patterns and Recipes

### 24.1 Pattern: Implementing a New Feature

**Steps:**
1. Create feature module directory
2. Create screens and navigation routes
3. Create ViewModel/State management
4. Implement API integration
5. Add local storage if needed
6. Write tests
7. Add to main navigation

**Example:** [Walk through adding a new feature with code examples]

### 24.2 Recipe: Displaying a List with Pagination

[Complete example of implementing paginated list]

### 24.3 Recipe: Form with Validation

[Complete example of form with client-side validation]

---

## 25. Anti-Patterns and Gotchas

### 25.1 DO NOT: Mutate State Directly

**Bad:**
```kotlin
state.user?.name = "New Name"  // Direct mutation
```

**Good:**
```kotlin
_state.value = state.value?.copy(user = state.value.user.copy(name = "New Name"))
```

### 25.2 DO NOT: Store Sensitive Data in SharedPreferences/UserDefaults

**Bad:**
```kotlin
SharedPreferences.put("token", token)
```

**Good:**
```kotlin
EncryptedSharedPreferences.put("token", token)  // Android
Keychain.put("token", token)  // iOS
```

### 25.3 DO NOT: Make Blocking API Calls on Main Thread

**Bad:**
```kotlin
val user = apiService.getUser(id)  // On main thread = ANR
```

**Good:**
```kotlin
viewModelScope.launch {
    val user = apiService.getUser(id)  // On IO thread
}
```

---

## 26. Glossary

- **Activity:** Android component representing a single screen with a UI
- **ViewModel:** Architecture component holding UI-related data and business logic
- **State:** Application data that drives the UI
- **Reducer:** Function that takes current state and an action, returns new state
- **Repository:** Data access layer abstraction
- **Use Case:** Business logic for a specific feature
- **[Term]:** [Definition]

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

---

