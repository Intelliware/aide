---
slug: testing-strategy-and-infrastructure
title: "Testing Strategy and Infrastructure"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 300
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
