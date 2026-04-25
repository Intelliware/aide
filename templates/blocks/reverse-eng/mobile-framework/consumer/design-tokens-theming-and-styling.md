---
slug: design-tokens-theming-and-styling
title: "Design Tokens, Theming, and Styling"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Design Tokens, Theming, and Styling

### 4.1 Design Tokens / Variables

<!-- Complete list for each platform. AI must use these instead of hardcoded values. -->

#### Colors

**Android** (in `res/values/colors.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="framework_primary">#[HEX]</color>
    <color name="framework_primary_light">#[HEX]</color>
    <color name="framework_on_primary">#[HEX]</color>
    <!-- ... complete list -->
</resources>
```

**iOS** (in Asset Catalog):
```
Right-click Assets.xcassets → New Color Set
Name: FrameworkPrimary
Attributes Inspector → Input Method: 8-bit
Light: #[HEX]
Dark: #[HEX]
```

Or in code:
```swift
extension UIColor {
    static let frameworkPrimary = UIColor(named: "FrameworkPrimary")!
    static let frameworkPrimaryLight = UIColor(named: "FrameworkPrimaryLight")!
}
```

**React Native** (in `src/styles/colors.ts`):
```typescript
export const colors = {
  primary: '#[HEX]',
  primaryLight: '#[HEX]',
  onPrimary: '#[HEX]',
  // ... complete list
};
```

**Complete Color Token Table:**

| Token Name | Light Mode | Dark Mode (if applicable) | Use Case |
|-----------|-----------|-------------------------|----------|
| `primary` | `#[HEX]` | `#[HEX]` | Primary brand color |
| `secondary` | `#[HEX]` | `#[HEX]` | Secondary accent |
| `success` | `#[HEX]` | `#[HEX]` | Success states |
| `warning` | `#[HEX]` | `#[HEX]` | Warning states |
| `error` | `#[HEX]` | `#[HEX]` | Error states |
| `text_primary` | `#[HEX]` | `#[HEX]` | Primary text |
| `text_secondary` | `#[HEX]` | `#[HEX]` | Secondary text |
| `background` | `#[HEX]` | `#[HEX]` | App background |
| `surface` | `#[HEX]` | `#[HEX]` | Card/surface background |
| `border` | `#[HEX]` | `#[HEX]` | Borders and dividers |

#### Spacing Scale

**Android** (in `res/values/dimens.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <dimen name="framework_spacing_xxs">4dp</dimen>
    <dimen name="framework_spacing_xs">8dp</dimen>
    <dimen name="framework_spacing_sm">12dp</dimen>
    <dimen name="framework_spacing_md">16dp</dimen>
    <dimen name="framework_spacing_lg">24dp</dimen>
    <dimen name="framework_spacing_xl">32dp</dimen>
    <dimen name="framework_spacing_xxl">48dp</dimen>
</resources>
```

**iOS** (in code):
```swift
struct Spacing {
    static let xxs: CGFloat = 4
    static let xs: CGFloat = 8
    static let sm: CGFloat = 12
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}
```

**React Native** (in `src/styles/spacing.ts`):
```typescript
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

#### Typography

**Android** (in `res/values/styles.xml`):
```xml
<style name="Framework.Text.Headline1">
    <item name="android:textSize">32sp</item>
    <item name="android:fontFamily">@font/[font_name]</item>
    <item name="android:textColor">@color/text_primary</item>
</style>
```

**iOS** (in code):
```swift
enum Typography {
    static let headline1 = UIFont.systemFont(ofSize: 32, weight: .bold)
    static let headline2 = UIFont.systemFont(ofSize: 28, weight: .bold)
    static let body = UIFont.systemFont(ofSize: 16, weight: .regular)
}
```

**React Native** (in `src/styles/typography.ts`):
```typescript
export const typography = {
  headline1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
};
```

### 4.2 Theming

#### Android Theme Configuration

```xml
<!-- res/values/styles.xml -->
<style name="Theme.MyApp" parent="Theme.Material3.Light">
    <item name="colorPrimary">@color/framework_primary</item>
    <item name="colorSecondary">@color/framework_secondary</item>
    <!-- Apply framework tokens -->
</style>

<!-- res/values-night/styles.xml (dark mode) -->
<style name="Theme.MyApp" parent="Theme.Material3.Dark">
    <item name="colorPrimary">@color/framework_primary_dark</item>
    <!-- Dark mode configuration -->
</style>
```

#### iOS Appearance Override

```swift
// In AppDelegate or SceneDelegate
if #available(iOS 13, *) {
    window?.overrideUserInterfaceStyle = .light  // or .dark, .unspecified
}

// Or per UIViewController
override func viewDidLoad() {
    super.viewDidLoad()
    if #available(iOS 13, *) {
        overrideUserInterfaceStyle = .light
    }
}
```

#### React Native Theme Provider

```typescript
// src/context/ThemeContext.tsx
import React from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => React.useContext(ThemeContext);
```

### 4.3 Responsive Breakpoints (React Native)

```typescript
// src/styles/breakpoints.ts
export const breakpoints = {
  xs: 0,      // Phone portrait
  sm: 480,    // Phone landscape
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape
  xl: 1280,   // Desktop
};

// Helper hook for responsive design
export function useResponsive(dimension: 'width' | 'height') {
  const [size, setSize] = React.useState(
    dimension === 'width' ? Dimensions.get('window').width : Dimensions.get('window').height
  );

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setSize(dimension === 'width' ? window.width : window.height);
    });
    return () => subscription?.remove();
  }, [dimension]);

  return {
    isPhone: size < breakpoints.md,
    isTablet: size >= breakpoints.md && size < breakpoints.xl,
    isDesktop: size >= breakpoints.xl,
  };
}
```

### 4.4 Styling Do's and Don'ts

- **DO:** [e.g., "Use design tokens from the spacing scale for all margins and padding."]
- **DO:** [e.g., "Use platform-native styling APIs (Material3 on Android, SwiftUI modifiers on iOS)."]
- **DO NOT:** [e.g., "Never hardcode pixel values — always use design tokens."]
- **DO NOT:** [e.g., "Never use `!important` in CSS (web) or force view sizes without considering content."]
- **DO NOT:** [e.g., "Never override framework component styles with private APIs or view hierarchy manipulation."]

---

# Part 3 — API Reference
