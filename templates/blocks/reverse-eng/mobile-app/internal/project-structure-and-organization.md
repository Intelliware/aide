---
slug: project-structure-and-organization
title: "Project Structure and Organization"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
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
