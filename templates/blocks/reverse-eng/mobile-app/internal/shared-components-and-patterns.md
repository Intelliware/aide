---
slug: shared-components-and-patterns
title: "Shared Components and Patterns"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 250
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
