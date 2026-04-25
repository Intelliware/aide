---
slug: anti-patterns-and-gotchas
title: "Anti-Patterns and Gotchas"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 350
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
