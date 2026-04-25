---
slug: accessibility
title: "Accessibility"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 280
---

## 18. Accessibility

### 18.1 Android Accessibility

```kotlin
ComponentName(
    name = "Label",
    modifier = Modifier.semantics {
        contentDescription = "User-friendly description for screen readers"
    }
)
```

### 18.2 iOS Accessibility

```swift
ComponentNameView(name: "Label")
    .accessibilityLabel("User-friendly description")
    .accessibilityHint("What happens when you interact with this")
```

### 18.3 React Native Accessibility

```jsx
<ComponentName
  name="Label"
  accessible={true}
  accessibilityLabel="User-friendly description"
  accessibilityHint="What happens when you interact with this"
/>
```

---

# Part 7 — Reference
