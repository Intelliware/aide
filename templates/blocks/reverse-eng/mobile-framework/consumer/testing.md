---
slug: testing
title: "Testing"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 270
---

## 17. Testing

### 17.1 Android Unit Tests

```kotlin
class ComponentNameTest {
    @Test
    fun testComponentRendersWithGivenName() {
        composeTestRule.setContent {
            ComponentName(name = "Test")
        }

        composeTestRule.onNodeWithText("Test").assertExists()
    }
}
```

### 17.2 iOS Unit Tests

```swift
class ComponentNameTests: XCTestCase {
    func testComponentRendersWithGivenName() {
        let view = ComponentNameView(name: "Test")
        // Assert view renders correctly
    }
}
```

### 17.3 React Native Tests

```typescript
import { render } from '@testing-library/react-native';

describe('ComponentName', () => {
  it('renders with given name', () => {
    const { getByText } = render(<ComponentName name="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```
