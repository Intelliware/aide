---
slug: dependency-injection-and-service-locators
title: "Dependency Injection and Service Locators"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
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
