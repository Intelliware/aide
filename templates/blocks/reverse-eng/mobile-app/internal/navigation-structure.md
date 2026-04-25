---
slug: navigation-structure
title: "Navigation Structure"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 160
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
