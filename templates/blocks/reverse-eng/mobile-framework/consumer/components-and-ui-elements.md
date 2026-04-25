---
slug: components-and-ui-elements
title: "Components and UI Elements"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Components and UI Elements

<!-- Document each component with platform-specific information -->

### 5.1 [Component Category, e.g., "Layout Components"]

#### 5.1.1 `[ComponentName]` — Platform-Specific Implementation

**Availability:**
- Android: ✅ (Kotlin Composable)
- iOS: ✅ (SwiftUI View / UIView)
- React Native: ✅ (Functional Component)

**Platform-Specific Import:**

Android (Kotlin):
```kotlin
import com.example.framework.components.ComponentName
```

iOS (Swift):
```swift
import Framework

// SwiftUI
ComponentNameView()

// UIKit
let component = ComponentNameViewController()
```

React Native (JavaScript):
```typescript
import { ComponentName } from '@example/framework';
```

**Purpose:** [One sentence describing what it does and when to use it.]

**Generic Type Parameters (if any):**

| Parameter | Constraint | Description |
|-----------|-----------|-------------|
| `T` | `extends Any` | [e.g., "Item data type"] |

**Inputs / Props / Properties:**

| Name | Type | Default | Required | Platform | Description |
|------|------|---------|----------|----------|-------------|
| `[inputName]` | `[type]` | `[default]` | Yes / No | Android / iOS / RN | [What it controls] |
| `[inputName2]` | `[type]` | `[default]` | No | RN only | [Platform-specific behavior] |

**Outputs / Events / Callbacks:**

| Name | Type | Platform | Description |
|------|------|----------|-------------|
| `[eventName]` | `(payload: Type) -> Unit` | Android | [When it fires and what the payload means] |
| `[eventName]` | `@escaping (Type) -> Void` | iOS | [When it fires and what the payload means] |
| `on[Event]` | `(payload: Type) => void` | React Native | [When it fires — note: may be async due to bridge] |

**Minimal Usage:**

Android (Kotlin):
```kotlin
ComponentName(
    name = "Value"
)
```

iOS (SwiftUI):
```swift
ComponentNameView(name: "Value")
```

React Native:
```jsx
<ComponentName name="Value" />
```

**Realistic Usage:**

Android (Kotlin):
```kotlin
var selectedValue by remember { mutableStateOf("") }

ComponentName(
    name = "Select Option",
    value = selectedValue,
    onValueChange = { newValue ->
        selectedValue = newValue
    },
    items = listOf("Option 1", "Option 2"),
    enabled = true
)
```

iOS (SwiftUI):
```swift
@State var selectedValue = ""

ComponentNameView(
    name: "Select Option",
    value: $selectedValue,
    items: ["Option 1", "Option 2"],
    onValueChange: { newValue in
        selectedValue = newValue
    }
)
```

React Native:
```jsx
const [selectedValue, setSelectedValue] = useState('');

<ComponentName
  name="Select Option"
  value={selectedValue}
  items={['Option 1', 'Option 2']}
  onValueChange={(newValue) => setSelectedValue(newValue)}
  enabled={true}
/>
```

**Edge Cases and Gotchas:**
- [e.g., "On iOS, the callback is executed on the main thread; on Android, it's on the UI thread. On React Native, it's asynchronous due to the bridge."]
- [e.g., "Must be inside a ScrollView on iOS to enable vertical scrolling, but Android handles this automatically."]
