---
slug: anti-patterns-and-pitfalls
title: "Anti-Patterns and Pitfalls"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
---

## 11. Anti-Patterns and Pitfalls

### 11.1 [Anti-Pattern, e.g., "Hardcoding Colors Instead of Using Design Tokens"]

**What's Wrong:**
```kotlin
// Bad - hardcoded color
Box(modifier = Modifier.background(Color(0xFF3498DB)))
```

**Why It's Wrong:**
[Explanation of the problem — e.g., "Hardcoded colors make theming impossible. If the design token changes, you must update every instance."]

**Correct Approach:**
```kotlin
// Good - using design token
Box(modifier = Modifier.background(FrameworkColors.primary))
```
