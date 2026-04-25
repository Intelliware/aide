---
slug: services-and-utilities
title: "Services and Utilities"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
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
