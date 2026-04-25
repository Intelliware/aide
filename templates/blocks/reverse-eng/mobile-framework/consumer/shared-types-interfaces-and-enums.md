---
slug: shared-types-interfaces-and-enums
title: "Shared Types, Interfaces, and Enums"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Shared Types, Interfaces, and Enums

### 7.1 `[TypeName]`

**Platform Definitions:**

Android (Kotlin):
```kotlin
data class TypeName(
    val property1: String,
    val property2: Int,
    val property3: Boolean = false
)
```

iOS (Swift):
```swift
struct TypeName: Codable {
    let property1: String
    let property2: Int
    let property3: Bool = false
}
```

React Native (TypeScript):
```typescript
interface TypeName {
  property1: string;
  property2: number;
  property3?: boolean;
}
```

**Properties:**

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `property1` | `String` | — | Yes | [What it represents] |
| `property2` | `Int` | — | Yes | [What it represents] |
| `property3` | `Boolean` | `false` | No | [What it represents] |
