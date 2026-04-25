---
slug: performance-patterns
title: "Performance Patterns"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 230
---

## 13. Performance Patterns

### 13.1 [Pattern, e.g., "Efficient List Rendering"]

**Android:**
```kotlin
// Use LazyColumn for large lists
LazyColumn {
    items(items) { item ->
        ItemRow(item)
    }
}
```

**iOS:**
```swift
// Use List with lazy evaluation or UITableView
List(items, id: \.id) { item in
    ItemRow(item: item)
}
```

**React Native:**
```typescript
// Use FlatList for large lists
<FlatList
  data={items}
  renderItem={({ item }) => <ItemRow item={item} />}
  keyExtractor={(item) => item.id}
/>
```
