---
slug: framework-overview
title: "Framework Overview"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Framework Overview

### 1.1 What This Framework Is

- **Name:** [Framework Name]
- **Purpose:** [Two sentences — e.g., "A cross-platform mobile component library and utility framework for iOS, Android, and React Native. Provides reusable UI components, services, and design system integration for building consistent mobile experiences across platforms."]
- **Platforms Supported:**
  - Android (Kotlin/Java, API level [min] and above)
  - iOS (Swift/Objective-C, deployment target [min] and above)
  - React Native ([version] and above)
- **Package(s):**

| Platform | Package Name | Package Manager | Purpose |
|----------|--------------|-----------------|---------|
| Android | `com.example:framework` | Gradle (Maven Central / jCenter) | [e.g., "Core Android library with UI components"] |
| iOS | `Framework` / `framework-ios` | CocoaPods / Swift Package Manager | [e.g., "Swift/Objective-C framework with UI components"] |
| React Native | `@example/framework` | npm | [e.g., "JavaScript module with native bridge"] |

### 1.2 Key Concepts and Architecture

<!-- This is the MENTAL MODEL section. AI models need to understand the core abstractions before they see any API. Describe the 3–7 foundational concepts that everything else builds on. -->

**[Concept 1, e.g., "Component Philosophy"]**

[Explain what the framework provides and how it differs across platforms. e.g., "This framework provides a set of reusable UI components that abstract platform-specific UI patterns. Each component has a consistent API across Android, iOS, and React Native, with platform-specific implementations handling native rendering and behavior. Components automatically respect platform design conventions (Material Design on Android, Human Interface Guidelines on iOS)."]

**[Concept 2, e.g., "State Management"]**

[e.g., "The framework provides a simple state management pattern where each component holds its own state. On Android and iOS, state is managed through view lifecycle and property observers. On React Native, state is managed through React hooks. Data flows in the same direction on all platforms: parent → child via inputs/props."]

**[Concept 3, e.g., "Theming and Styling"]**

[e.g., "Visual appearance is controlled through a centralized design token system (colors, spacing, typography, etc.). On Android, tokens are defined in resources. On iOS, tokens are provided via environment values. On React Native, tokens are available as JavaScript constants. This ensures consistent appearance across all platforms."]

**[Concept 4, e.g., "Platform Lifecycle Integration"]**

[e.g., "The framework automatically integrates with each platform's lifecycle. Android components hook into Activity/Fragment lifecycle. iOS components integrate with UIViewController or SwiftUI lifecycle. React Native components use React lifecycle (useEffect, componentDidMount). Developers don't manually manage platform lifecycle — the framework handles it."]

**How they fit together:**

[Brief paragraph or ASCII diagram showing how the core concepts relate.]

```
[Design Tokens / Theming]
         │
[Components]────────────→ [State Management]
         │                        │
         └────────[Platform Lifecycle Integration]
```

### 1.3 Core Philosophy and Design Principles

- **Principle 1:** [e.g., "Platform-consistent APIs, platform-optimized implementations — the same API across all platforms, but native implementations that respect each platform's conventions."]
- **Principle 2:** [e.g., "Composition over inheritance — build complex UIs by composing small components."]
- **Principle 3:** [e.g., "Explicit over magic — all behaviors are opt-in; no hidden side effects."]
- **Principle 4:** [e.g., "Performance-first — components are optimized for each platform; no unnecessary abstractions."]

### 1.4 When to Use / When NOT to Use

**Use this framework when:**
- [e.g., "Building cross-platform mobile apps on iOS and Android."]
- [e.g., "You need consistent theming across all platforms."]
- [e.g., "You want reusable components without reimplementing for each platform."]

**Do NOT use this framework when:**
- [e.g., "Building iOS-only or Android-only apps — use platform-native frameworks instead."]
- [e.g., "You need deep platform-specific customization not exposed by the framework."]
