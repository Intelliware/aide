# React Native Frontend Design Standards

**Applies to:** React Native 0.72+ with the New Architecture (Fabric renderer, TurboModules), React Navigation 6+, and TypeScript. For Expo-managed projects, the same design patterns apply — Expo provides additional APIs but the architectural decisions are the same. For older React Native versions on the legacy architecture, the design patterns still apply but performance characteristics may differ.

These are the baseline standards the AI uses when designing React Native cross-platform mobile frontend architecture in the solutions package. During Step 3 of the frontend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new screens should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about screen structure, navigation, component selection, platform adaptation, and state management. They do not prescribe implementation details (native module bridging, Metro bundler configuration, Hermes engine settings). Implementation-level rules are covered separately in the implementation package's framework standards.

React Native targets both iOS and Android from a single codebase. These standards define when to share and when to diverge across platforms — the goal is maximum code sharing without compromising platform-native feel.

---

## 1. Navigation Architecture

### Rules

- Use a **stack-based navigator** as the foundation — every flow pushes and pops screens on a stack
- Use **bottom tabs** for 2–5 top-level destinations on both platforms — this is the primary navigation idiom for mobile
- Use a **drawer navigator** for 6+ destinations or when destinations have unequal importance — more common on Android; acceptable on iOS if justified
- Each tab owns its own **navigation stack** — switching tabs preserves the tab's back stack
- **Modal screens** (sheets) are for creation flows, filters, or tasks contextually related to the current screen
- Support **deep linking** from the start — every screen must be addressable via a URI scheme and Universal/App Links

### Navigation Pattern Selection

| Scenario | Pattern | Rationale |
|----------|---------|-----------|
| 3–5 equally important sections | Bottom tab navigator | Standard mobile idiom on both platforms; each tab has its own stack |
| 6+ destinations | Drawer navigator | Scales to many items; common on Android; acceptable on iOS if the app warrants it |
| Drill-down into content (list → detail) | Stack navigator (push) | Hierarchical navigation with platform-correct back gesture (swipe on iOS, back button on Android) |
| Creation or editing flow | Modal stack (presentation: 'modal') | Separate task; user can dismiss to cancel; card-style on iOS, slide-up on Android |
| Multi-step flow (checkout, onboarding) | Stack navigator inside a modal | Linear progression isolated from main navigation |
| Authentication flow | Conditional navigator (auth stack vs. app stack) | Entire navigation tree swaps based on auth state; no "back to login" after sign-in |

### Platform-Specific Navigation Behavior

| Behavior | iOS | Android | Design decision |
|----------|-----|---------|----------------|
| Back gesture | Swipe from left edge | System back button / predictive back | Both must work without custom handling |
| Tab bar position | Bottom | Bottom | Consistent on both platforms |
| Modal presentation | Card-style (iOS 13+) | Slide up from bottom | Use `presentation: 'modal'` — platform adapts automatically |
| Header style | Large title (collapsible) | Standard title | Configure per-platform via `headerLargeTitle` (iOS only) |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Hamburger menu as primary navigation on iOS | Not an iOS idiom; iOS users expect bottom tabs |
| Nesting tab navigators inside other tab navigators | Confusing for users; creates competing navigation contexts |
| Custom back gesture handling that overrides the system | Breaks platform expectations; interferes with predictive back on Android |
| No deep link URI for a screen | Screen can't be reached from push notifications, links, or external apps |

---

## 2. Screen Architecture

### Rules

- Every screen is a **screen component** connected to a navigator — it receives route params and navigation props
- Separate the **screen component** (navigation-aware, data loading) from a **content component** (pure rendering, takes props)
- Use **platform-adaptive components** from the design system — components that render differently on iOS and Android when platform feel matters
- Use **SafeAreaView** or equivalent at the screen level — content must not render behind notches, status bars, or home indicators
- Design **keyboard avoidance** for every screen with text input — content scrolls or repositions when the keyboard appears

### Screen Component Layers

| Layer | Responsibility | Example |
|-------|---------------|---------|
| Screen | Reads route params; calls data hooks; handles navigation events; wraps in SafeArea | `OrderDetailScreen` |
| Content | Pure rendering based on props; no navigation awareness; testable in isolation | `OrderDetailContent` |
| Section | Reusable section of a screen; may be shared across screens | `OrderItemsSection`, `OrderSummarySection` |
| UI component | Atomic presentational element; no domain knowledge | `StatusBadge`, `PriceLabel`, `ActionButton` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Business logic in the screen component (data transformation, validation) | Hard to test; mix of concerns; put logic in hooks or a view model |
| Content that renders behind the notch or status bar | Unreadable text; obscured interactive elements |
| No keyboard avoidance on forms | Text fields hidden behind the keyboard; users can't see what they're typing |
| Single monolithic screen component (data, logic, and rendering in one file) | Hard to test and maintain; break into screen → content → section → UI layers |

---

## 3. Platform Adaptation Strategy

### Rules

- **Share by default** — use the same component, layout, and behavior on both platforms unless platform conventions genuinely differ
- **Adapt selectively** — only diverge for navigation idioms, system controls, and platform-specific design language (Material vs. HIG)
- Use **Platform.select** or platform-specific file extensions (`.ios.tsx`, `.android.tsx`) only when the design explicitly calls for different behavior — not as a habit
- Platform-specific components should be wrapped in a **cross-platform interface** so consuming code doesn't branch

### Sharing vs. Diverging Decision

| Concern | Share or diverge? | Rationale |
|---------|-------------------|-----------|
| Business logic, data hooks, state management | Share | No platform dependency |
| Screen layout and content structure | Share | Same information architecture on both platforms |
| Typography scale and spacing | Share (with platform-aware base) | Consistent visual rhythm; font rendering differs slightly but the scale is the same |
| Navigation chrome (header style, back behavior) | Diverge (via navigator config) | iOS uses large titles and swipe-back; Android uses standard titles and system back button |
| Action sheets / confirmation dialogs | Diverge (via component abstraction) | iOS uses `ActionSheet` style; Android uses Material `Dialog` or `BottomSheet` |
| Date/time pickers | Diverge (use native pickers) | Platform pickers match user expectations; custom pickers feel foreign |
| Haptic feedback patterns | Diverge (availability differs) | iOS has richer haptics; use where available, degrade gracefully |
| Notifications UI | Diverge (system handles) | Platform notification centers are fundamentally different |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Diverging layout, colors, and spacing for every screen | Doubles the design and maintenance surface; share unless there's a genuine platform reason |
| Using Material Design components on iOS | Feels foreign to iOS users; use platform-adaptive components or neutral styling |
| Custom date picker instead of native picker on both platforms | Misses platform integration (accessibility, locale, dark mode); use native pickers |
| `if (Platform.OS === 'ios')` scattered throughout business logic | Couples platform awareness to the wrong layer; isolate in platform-specific components |

---

## 4. Component Design

### Rules

- Build a **component library** with three tiers: primitives (Text, View wrappers), composites (Card, ListItem, FormField), and feature components (OrderCard, ProductTile)
- Primitive and composite components must be **platform-agnostic** in their API — platform adaptation happens internally
- Use **FlatList** for all scrollable lists (not `ScrollView` + `map`) — FlatList provides windowed rendering, scroll performance, and pull-to-refresh
- Design **touch targets** at minimum **44pt x 44pt** (iOS HIG) / **48dp x 48dp** (Material) — use the larger value (48) as the cross-platform minimum
- Define **loading, error, and empty states** for every list and data-driven component

### Component Hierarchy

| Tier | Purpose | Platform awareness | Example |
|------|---------|-------------------|---------|
| Primitive | Styled wrappers around RN core components; enforce design tokens | None — pure styling | `AppText`, `Spacer`, `Divider`, `Touchable` |
| Composite | Reusable UI patterns composed from primitives; no domain knowledge | Minimal — may use Platform.select for native control variants | `Card`, `ListItem`, `Badge`, `Avatar`, `FormField`, `EmptyState` |
| Feature | Domain-specific; composed from composites; used in specific features | None — delegates to composites | `OrderCard`, `ProductTile`, `RefundStatusBanner` |
| Screen | Navigator-connected; loads data; composes feature and composite components | Navigation-aware (reads params, triggers transitions) | `OrderListScreen`, `ProductDetailScreen` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `ScrollView` with `.map()` for long lists | Renders all items upfront; no recycling; janky scroll on large lists; use FlatList |
| Touch targets smaller than 48dp | Difficult to tap reliably; accessibility violation on both platforms |
| Feature components that directly use `<View>`, `<Text>` instead of design system primitives | Inconsistent styling; missed design token updates; bypasses the component library |
| Components that accept platform-specific props (`iosStyle`, `androidStyle`) | Leaks platform awareness to consumers; internalize platform adaptation |

---

## 5. State Management Strategy

### Rules

- Follow the same **five-category model** as React web: server state, client (shared) state, form state, navigation/URL state, and local state
- **Server state** uses React Query / TanStack Query — the same library works in React Native
- **Navigation state** is managed by the navigator — screen params replace URL query strings for passing contextual data
- **Offline state** is a first-class concern on mobile — define which data is cached locally and how conflicts are resolved
- **App state** (foreground/background/inactive) affects data freshness — define refetch behavior when the app returns to foreground

### State Categories for Mobile

| Category | Tool | Mobile-specific considerations |
|----------|------|-------------------------------|
| Server state | React Query / TanStack Query | Configure `refetchOnAppFocus` to refresh stale data when app foregrounds; define offline cache persistence strategy |
| Client (shared) | Zustand / Jotai / Context | Persisted to AsyncStorage for state that survives app restarts (theme, onboarding completed) |
| Form state | React Hook Form / Formik | Handle keyboard dismissal; form state preserved across keyboard show/hide |
| Navigation state | React Navigation state | Screen params for per-screen context; deep link params for external entry |
| Local state | useState / useReducer | Same as web |
| Offline cache | AsyncStorage / MMKV / SQLite | Define what data is available offline; stale-while-revalidate on reconnection |

### App Lifecycle and Data Freshness

| App state transition | Design decision |
|---------------------|----------------|
| Background → Foreground | Refetch stale server data; check auth token expiry |
| Offline → Online | Sync queued mutations; refetch invalidated queries; resolve conflicts |
| Cold launch | Show cached data immediately (if available); fetch fresh data in background |
| Push notification tap | Navigate to the relevant screen; refresh that screen's data |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No offline data caching | App is blank with no connectivity; poor experience on mobile networks |
| No refetch on app foreground | User sees stale data from hours ago; data appears frozen |
| Queued mutations lost on app kill | User's offline actions are silently lost; persist mutation queue |
| API data stored in Redux instead of React Query | Duplicates caching, loading state, and invalidation logic that React Query handles |

---

## 6. Error Handling and UX Feedback

### Rules

- Every data-loading screen defines **four states**: loading, content, empty, and error
- **Loading**: show skeleton placeholders matching the content shape — not a centered spinner
- **Error**: show a user-friendly message with a retry action; distinguish network errors from server errors
- **Offline**: show cached data with an offline banner — not an error screen; queue user actions for sync
- Use **platform-appropriate feedback**: haptics on button press, pull-to-refresh on lists, swipe-to-dismiss on toasts
- **Toast/snackbar** for transient feedback; **inline banners** for persistent state; **alerts** for critical decisions

### UX State Matrix

| Screen | Loading | Content | Empty | Error | Offline |
|--------|---------|---------|-------|-------|---------|
| `OrderListScreen` | Skeleton list items | FlatList of orders | Empty illustration + "No orders" + CTA | Error message + retry | Cached list + "Offline" banner |
| `OrderDetailScreen` | Skeleton layout | Order detail | N/A | "Not found" or retry | Cached if visited before |

### Feedback Patterns

| Scenario | Component | Platform behavior |
|----------|-----------|-------------------|
| Action succeeded | Toast / snackbar + haptic success | iOS: notification haptic; Android: short vibrate |
| Action failed | Toast with retry + haptic error | Both: error haptic |
| Destructive confirmation | Alert (native) | iOS: ActionSheet for bottom; Android: Material AlertDialog |
| Pull to refresh | RefreshControl on FlatList | Both: pull-to-refresh with spinner |
| Connectivity change | Persistent banner at top | Both: "You're offline" / "Back online" |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Full-screen error when offline | User can't access cached data; feels broken; show cached content with a banner |
| Custom alert dialog instead of native Alert | Misses platform styling, accessibility, and interaction patterns |
| No haptic feedback on key interactions | App feels less responsive compared to native apps |
| No pull-to-refresh on data lists | Users expect it on mobile; they'll try it and nothing will happen |

---

## 7. Form Design

### Rules

- Use a **form library** (React Hook Form) — not manual state per field
- Handle **keyboard interaction** for every form: auto-scroll to focused field, next-field navigation via `returnKeyType`, dismiss keyboard on background tap
- Use **native input types** (`keyboardType`, `textContentType`, `autoComplete`) for platform autofill support
- Show validation errors **on blur** — not on every keystroke
- Place the submit button **above the keyboard** or make it sticky — never hidden behind the keyboard

### Keyboard and Input Behavior

| Behavior | Design decision |
|----------|----------------|
| Keyboard appears | Form scrolls so the focused field is visible above the keyboard |
| Return key on non-last field | `returnKeyType="next"` — moves focus to the next field |
| Return key on last field | `returnKeyType="done"` or `returnKeyType="go"` — submits the form or dismisses the keyboard |
| Tap outside form fields | Dismiss keyboard |
| Multiline text input | `returnKeyType="default"` (return key inserts newline); separate submit button |

### Input Type Configuration

| Field type | `keyboardType` | `textContentType` (iOS) / `autoComplete` (Android) |
|-----------|---------------|------------------------------------------------------|
| Email | `email-address` | `emailAddress` / `email` |
| Password | `default` | `password` / `password` |
| Phone | `phone-pad` | `telephoneNumber` / `tel` |
| Name | `default` | `name` / `name` |
| Numeric (amount) | `decimal-pad` | — |
| One-time code | `number-pad` | `oneTimeCode` / `sms-otp` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No keyboard avoidance (field hidden behind keyboard) | User can't see what they're typing |
| No `returnKeyType` configuration | User must manually tap the next field; slow and awkward |
| Plain text keyboard for email fields | No @ key easily accessible; no autofill support |
| Validating every keystroke | Shows errors while the user is still typing; frustrating |

---

## 8. Accessibility Design

### Rules

- All interactive elements must have `accessibilityLabel` (what it is) and optionally `accessibilityHint` (what happens)
- Minimum touch target: **48dp x 48dp** on both platforms
- Group related elements with `accessible={true}` on the container — screen readers announce the group as one item
- Support **Dynamic Type** (iOS) and **font scaling** (Android) — text must scale up to 200% without truncation
- Color must never be the **sole indicator** of state — pair with an icon, text, or pattern
- Test with **VoiceOver** (iOS) and **TalkBack** (Android)

### Accessibility Label Strategy

| Element | Strategy | Example |
|---------|----------|---------|
| Button with visible text | Label is inferred from text; add hint for non-obvious actions | Button title "Place Order" + hint "Charges your default payment method" |
| Icon-only button | Explicit label describing the action | `accessibilityLabel="Delete order"` |
| Decorative image | Hidden from accessibility | `accessible={false}` |
| Status indicator | Describe the status, not the visual | `accessibilityLabel="Status: Shipped"` not `"Green dot"` |
| Card (composite) | Group as one accessible element with summary | `accessibilityLabel="Order 1234, John Smith, $45, status Shipped"` |
| List item with swipe actions | Declare custom actions | `accessibilityActions=[{name: 'delete', label: 'Delete order'}]` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No `accessibilityLabel` on icon buttons | Screen reader says nothing useful; users can't identify the action |
| Fixed font sizes that ignore system scaling | Text too small for users with visual impairments |
| Color-only status (red = error, green = ok) | Unusable for color-blind users; add an icon or text |
| Touch targets smaller than 48dp | Hard to tap for users with motor impairments |
| `accessibilityLabel="Button"` or `accessibilityLabel="Image"` | Redundant — the role is already announced; describe the content or action |

---

## 9. Performance Design Targets

### Rules

- App launch to interactive content: ≤ **2 seconds** cold start on a mid-range device
- Screen transition: ≤ **300ms** to show the skeleton/placeholder; data populates afterward
- Scrolling must maintain **60fps** (16ms per frame) — no jank on any list
- Lists with **50+ items** must use **FlatList** or **FlashList** with windowed rendering
- Images must specify a **caching and sizing strategy** — load thumbnails in lists, full resolution in detail views
- Bundle size must be monitored — define a target and alert on regressions

### Performance Specification Per Screen

| Concern | Design decision |
|---------|----------------|
| List rendering | FlatList with `getItemLayout` for fixed-height items; `keyExtractor` for stable identity |
| Image loading | Cached thumbnails (e.g., FastImage) in lists; progressive loading in detail views |
| Data prefetching | Prefetch detail data when a list item is likely to be tapped (e.g., on long press or hover preview) |
| Animation | Use native driver (`useNativeDriver: true`) for all animations on the UI thread |
| Bundle size | Monitor per-platform; alert if JS bundle exceeds target |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `ScrollView` with `map()` for long lists | All items rendered upfront; no windowing; janky scroll |
| JS-driven animations without native driver | Runs on the JS thread; drops frames when JS is busy |
| Full-resolution images in list thumbnails | Excessive memory; slow decode; unnecessary bandwidth |
| No `keyExtractor` on FlatList | React can't diff efficiently; entire list re-renders on data change |
| No image caching (re-downloading on every render) | Slow rendering; excessive bandwidth usage |

---

## 10. Security Design

### Rules

- Store auth tokens in **platform-secure storage** (iOS Keychain, Android EncryptedSharedPreferences) — never in AsyncStorage in plaintext
- **Certificate pinning** for API communication — prevent man-in-the-middle attacks on mobile networks
- **Sensitive screens** (account balance, PII) should support app-level authentication (biometric prompt) on re-entry from background
- **No sensitive data in logs** — tokens, PII, and credentials must never appear in console output or crash reports
- **Root/jailbreak detection** — define the app's behavior on compromised devices (warn, degrade, block) based on the feature's security requirements

### Secure Storage Decision

| Data type | Storage mechanism | Rationale |
|-----------|-------------------|-----------|
| Auth tokens (access/refresh) | iOS Keychain / Android EncryptedSharedPreferences | Encrypted at rest; not accessible by other apps |
| User preferences (non-sensitive) | AsyncStorage / MMKV | No security concern; fast read/write |
| Cached API data | AsyncStorage / SQLite / MMKV | Not sensitive; available offline; cleared on logout |
| Encryption keys | iOS Keychain / Android KeyStore | Hardware-backed security on supported devices |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Auth token in AsyncStorage (plaintext) | Accessible to rooted/jailbroken devices and backup extraction |
| No certificate pinning | Vulnerable to man-in-the-middle on public WiFi |
| Logging API responses that contain PII | Crash reports and logs may be shipped to third-party services |
| No re-authentication after long background period | Sensitive data visible to anyone who picks up an unlocked phone |

---

## Customization

- **Section 1 (Navigation Architecture):** React Navigation is the default. Projects using Expo Router, react-native-navigation (Wix), or other navigation libraries should adapt the design patterns while preserving the principles: type-safe params, deep link support, screen lifecycle management. Document the chosen library and the rationale.

- **Section 3 (Platform Adaptation):** The extent of platform-specific design depends on the app's audience. Apps targeting a single platform (iOS-first with Android parity later) may minimize platform branching. Apps requiring pixel-perfect native look-and-feel on both platforms need more `Platform.select` usage. The design should specify the platform parity target.

- **Section 4 (Component Design — FlatList vs. FlashList):** `FlashList` (Shopify) is recommended for performance but adds a dependency. Projects that prefer minimal dependencies can use `FlatList` with proper optimization (`getItemLayout`, `removeClippedSubviews`, `windowSize` tuning). The design should document the list rendering strategy.

- **Section 5 (State Management):** The specific library choices (React Query vs. Apollo Client for server state; Zustand vs. Jotai for client state; AsyncStorage vs. MMKV for persistence) are project decisions. The design should document the state management strategy and which library fills each role — not default to a specific one.

- **Section 9 (Performance):** Performance budgets (cold start time, JS bundle size, scroll frame rate) should be calibrated to the app's NFRs and target device tier. Apps targeting low-end Android devices need stricter budgets than iOS-only apps targeting recent iPhones.

- **Section 10 (Security):** Secure storage library choice (react-native-keychain vs. expo-secure-store vs. react-native-sensitive-info) is a project decision. The design standard requires that sensitive data uses platform-secure storage — not which library provides it. Root/jailbreak detection sensitivity (block vs. warn vs. ignore) depends on the app's security posture and regulatory requirements.
