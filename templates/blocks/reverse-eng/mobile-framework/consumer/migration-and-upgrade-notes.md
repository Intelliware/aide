---
slug: migration-and-upgrade-notes
title: "Migration and Upgrade Notes"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
---

## 19. Migration and Upgrade Notes

### 19.1 Upgrading from 1.x to 2.x

**Breaking Changes:**
- `[OldAPI]` is removed. Use `[NewAPI]` instead.
- [Other breaking change]

**Migration:**

Android:
```kotlin
// Before
val data = oldMethod()

// After
val data = newMethod()
```

iOS:
```swift
// Before
let data = oldMethod()

// After
let data = newMethod()
```

React Native:
```typescript
// Before
const data = await oldMethod();

// After
const data = await newMethod();
```
