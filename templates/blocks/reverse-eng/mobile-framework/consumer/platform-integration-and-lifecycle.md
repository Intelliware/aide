---
slug: platform-integration-and-lifecycle
title: "Platform Integration and Lifecycle"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Platform Integration and Lifecycle

### 8.1 Android Lifecycle Integration

**Activity Lifecycle:**
```kotlin
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Framework initialization here
    }

    override fun onStart() {
        super.onStart()
        // Setup observers
    }

    override fun onDestroy() {
        // Cleanup
        super.onDestroy()
    }
}
```

**Fragment Lifecycle:**
```kotlin
class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // Setup components after view is created
    }
}
```

### 8.2 iOS Lifecycle Integration

**UIViewController Lifecycle:**
```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Framework initialization
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Start observing
    }

    override func viewWillDisappear(_ animated: Bool) {
        // Stop observing
        super.viewWillDisappear(animated)
    }
}
```

**SwiftUI Lifecycle:**
```swift
struct MyView: View {
    @State private var isLoaded = false

    var body: some View {
        VStack {
            // UI
        }
        .onAppear {
            // Called when view appears
        }
        .onDisappear {
            // Called when view disappears
        }
    }
}
```

### 8.3 React Native Lifecycle Integration

```typescript
import { useEffect } from 'react';

export function MyScreen() {
  useEffect(() => {
    // Setup on mount
    console.log('Component mounted');

    return () => {
      // Cleanup on unmount
      console.log('Component will unmount');
    };
  }, []);

  return (
    // UI
  );
}
```
