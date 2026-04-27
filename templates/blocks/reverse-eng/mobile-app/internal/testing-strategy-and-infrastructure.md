---
slug: testing-strategy-and-infrastructure
title: "Testing Strategy and Infrastructure"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 300
---

## 20. Testing Strategy and Infrastructure

<!-- Replace each [bracketed example] with the tooling actually used in this app's
codebase. Mobile testing varies sharply by platform and cross-platform approach
— the rows below cover common stacks but are not exhaustive. -->

### 20.1 Testing Pyramid

```
        /\
       /  \        UI / E2E Tests   [e.g., Espresso, XCUITest, Detox, Maestro, Appium, Patrol, integration_test]
      /----\       Integration Tests
     /      \      Unit Tests        [e.g., JUnit5, XCTest, Jest, Vitest, flutter_test, KotlinTest]
    /--------\
```

### 20.2 Unit Testing

**Framework:** [discover from the codebase — e.g., "JUnit5 / MockK on Android (Kotlin)", "XCTest on iOS (Swift)", "Jest / Vitest on React Native (TypeScript)", "flutter_test on Flutter (Dart)", "Kotlin Multiplatform `kotlin.test`", ".NET MAUI MSTest / xUnit / NUnit", "Xamarin NUnit"]

**Example (illustrative — Android / Kotlin / JUnit + MockK):**
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

The Arrange-Act-Assert structure is universal; only the syntax changes. Equivalent shapes:
- **iOS / Swift / XCTest:** `func testLogin_success() { ... XCTAssertEqual(...) }` with a stubbed dependency.
- **React Native / Jest:** `test('login success', async () => { ... expect(...).toBe(...) })` with `jest.fn()` mocks.
- **Flutter / Dart:** `test('login success', () async { ... expect(actual, equals(expected)); })` with `Mockito` / `mocktail`.

### 20.3 Integration Testing

[Document integration tests between layers — e.g., ViewModel ↔ Repository ↔ data source — using the codebase's actual harness (Robolectric, instrumented tests, EarlGrey, Detox, integration_test, etc.).]

### 20.4 UI Testing

**Framework:** [discover — e.g., "Espresso / Compose UI Test on Android", "XCUITest on iOS", "Detox / Maestro on React Native", "flutter_test integration_test on Flutter", "Appium for cross-platform black-box", ".NET MAUI Appium / Xamarin.UITest"]

[Document UI test structure and examples in the language and framework actually used.]

### 20.5 Running Tests

<!-- Replace with the commands this codebase actually exposes (Makefile / fastlane
lanes / CI scripts often consolidate these). -->

```bash
# Android (Gradle)
./gradlew test                    # Unit tests (JVM)
./gradlew connectedAndroidTest    # Instrumentation tests on a device/emulator

# iOS (Xcode)
xcodebuild test -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 15'
# Or via fastlane:
fastlane scan

# React Native (npm / pnpm / yarn)
<pm> test                         # Unit tests
<pm> run e2e                      # E2E (Detox/Maestro), often `detox test` or `maestro test flows/`

# Flutter
flutter test                      # Unit + widget tests
flutter test integration_test/    # Integration / E2E

# Kotlin Multiplatform Mobile (KMM)
./gradlew :shared:test            # Common + platform unit tests

# .NET MAUI / Xamarin
dotnet test                       # All unit / integration test projects
```
