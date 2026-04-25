# iOS Frontend Design Standards

**Applies to:** iOS 17+ with SwiftUI. Features gated on specific iOS versions are noted inline (e.g., `ContentUnavailableView` requires iOS 17+, `NavigationSplitView` requires iOS 16+). For apps supporting older minimum deployment targets, the standards still apply — use `@available` checks for version-gated features.

These are the baseline standards the AI uses when designing iOS frontend architecture in the solutions package. During Step 3 of the frontend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new views should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about view structure, navigation, component selection, and layout strategy. They do not prescribe implementation details. Implementation-level rules (SwiftUI APIs, lifecycle handling, App Store compliance) are covered separately in the implementation package's platform standards.

---

## 1. Navigation Architecture

### Rules

- Use **TabView** for 2–5 top-level destinations that are equally important and frequently accessed — this is the primary iOS navigation idiom
- Use **NavigationStack** with typed paths for hierarchical drill-down (list → detail → sub-detail)
- Use **NavigationSplitView** for sidebar/content/detail layouts on iPad and Mac Catalyst
- Use **sheets** (`.sheet`) for modal flows that are contextually related to the current screen but represent a separate task
- Use **full-screen covers** (`.fullScreenCover`) for immersive experiences that need the entire screen (e.g., photo viewer, onboarding)
- Never use a hamburger menu or navigation drawer — this is not an iOS idiom

### Navigation Pattern Selection

| Scenario | Pattern | Rationale |
|----------|---------|-----------|
| 2–5 equally important sections (e.g., Home, Search, Orders, Profile) | TabView | Standard iOS pattern; always visible at bottom; each tab has independent navigation stack |
| Drill-down into content (list → detail) | NavigationStack + NavigationLink / `.navigationDestination` | Hierarchical navigation with automatic back button and swipe-back gesture |
| iPad app with sidebar | NavigationSplitView (2- or 3-column) | Adapts to compact (stack) and regular (side-by-side) size classes automatically |
| Creating or editing content (new order, compose message) | Sheet (modal) | Clearly separates the creation flow from the browsing context; user can dismiss to cancel |
| Multi-step flow (checkout, onboarding) | NavigationStack inside a sheet or full-screen cover | Linear progression isolated from the main app navigation |
| Settings or infrequently accessed screens | Push via NavigationStack from profile or gear icon | Not important enough for a tab bar slot |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Hamburger menu / side drawer for primary navigation | Not an iOS idiom; TabView is expected and more discoverable |
| TabView with > 5 tabs | Overflows to a "More" tab which is hard to discover; restructure the information architecture |
| Presenting a sheet for simple drill-down (list → detail) | Sheets are for separate tasks; drill-down should use NavigationStack push |
| Custom bottom bar built from scratch instead of TabView | Misses system behaviors: long-press, scroll-to-top on tab re-tap, badge support |
| NavigationView (deprecated) | Replaced by NavigationStack; has known bugs with programmatic navigation |

---

## 2. Screen Architecture

### Rules

- Every screen is a **SwiftUI View** with a clear separation between the view (rendering) and the view model or coordinator (logic)
- Use **NavigationStack** as the root of each tab or flow — it provides the navigation bar, title, toolbar items, and search
- Use **List** for scrollable collections of homogeneous data — not `ScrollView` + `VStack` (List provides built-in swipe actions, section headers, and accessibility)
- Use **Form** for settings-like screens with grouped controls — it provides the correct inset grouped styling automatically
- Place **toolbar items** using `.toolbar { }` with proper `ToolbarItemPlacement` — never build custom navigation bar replacements

### Screen Type Selection

| Type | When to use | Example |
|------|-------------|---------|
| Full screen (via NavigationStack push) | Primary content viewing, detail screens, sub-screens in a hierarchy | Order detail, product page, settings sub-page |
| Sheet (half or full height) | Separate tasks contextually related to the current screen; creation flows | Compose message, add address, apply filters |
| Full-screen cover | Immersive experiences that need the entire screen and no interactive dismiss | Photo/video viewer, onboarding, login |
| Alert | Simple decisions with 2–3 buttons; critical messages | "Delete this item?", "Session expired" |
| Confirmation dialog | Destructive action confirmation with more context than an alert | "Are you sure?" with description and destructive button |
| Popover (iPad) / Sheet (iPhone) | Contextual options or info anchored to a specific UI element | Date picker, color picker, formatting options |
| Inspector (sidebar panel) | Supplementary detail that doesn't warrant a full navigation push | Item properties, metadata panel |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Custom navigation bar built with HStack | Loses system behaviors: large title animation, search integration, back swipe gesture, accessibility |
| ScrollView + ForEach for long lists | Misses List's built-in swipe actions, section support, separator styling, and performance optimization |
| Alert for complex multi-field input | Alerts are for simple decisions; use a sheet for complex input |
| Sheet for simple "OK" confirmation | Over-engineered; use an alert |
| Multiple sheets stacked on top of each other | Confusing navigation; restructure as a NavigationStack inside a single sheet |

---

## 3. Component Selection

### Rules

- Prefer **system controls** (SwiftUI built-in views) over custom components — they automatically support accessibility, Dynamic Type, dark mode, and platform updates
- Use **SF Symbols** for all iconography — they scale with Dynamic Type, support variable rendering, and are consistent with iOS
- Use the correct control for the interaction type — iOS users have strong muscle memory for standard controls
- Follow the **visual hierarchy**: primary actions are prominent (`.borderedProminent`), secondary actions are standard (`.bordered`), tertiary actions are plain (`.plain` or text links)

### Button Hierarchy

| Priority | Style | When to use | Example |
|----------|-------|-------------|---------|
| Highest | `.borderedProminent` | Primary action on the screen — at most one per visible area | "Place Order", "Save" |
| High | `.bordered` | Important but not the primary action | "Add to Cart" alongside "Buy Now" |
| Medium | `.plain` or text-styled button | Secondary or tertiary action | "Cancel", "Skip" |
| Low | Text with `.foregroundStyle(.accentColor)` | Inline link-style action | "Forgot Password?", "Learn More" |
| Contextual | `.toolbar` button | Actions in the navigation bar or toolbar | "Edit", "Done", share icon |
| Destructive | `.role(.destructive)` | Actions that delete or destroy data | "Delete", "Remove" |

### Content Display

| Component | When to use | When NOT to use |
|-----------|-------------|-----------------|
| List | Homogeneous scrollable collections with standard row layouts, swipe actions, sections | Rich visual content better served by a grid; non-interactive static content |
| Grid (LazyVGrid / LazyHGrid) | Visual content where items are best compared side-by-side | Text-heavy items that need full-width reading space |
| Form | Settings screens, preference groups, account details | Data display screens that aren't editable |
| ScrollView + VStack | Heterogeneous content layouts (hero image + text + related items) | Long lists of homogeneous data (use List for performance) |
| GroupBox | Visually grouping related content within a form or settings screen | Wrapping every section; overuse diminishes the grouping signal |

### Selection Components

| Component | When to use |
|-----------|-------------|
| Toggle | Binary on/off for settings with immediate effect |
| Picker (segmented) | Single-select from 2–4 options that are always visible |
| Picker (menu / wheel) | Single-select from a longer list |
| DatePicker | Date and/or time input |
| Multi-select List (with checkmarks) | Selecting multiple items from a list in edit mode |
| Stepper | Incrementing/decrementing a numeric value by a fixed amount |
| Slider | Selecting a value from a continuous range |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Custom icon set when SF Symbols cover the need | Inconsistent with platform; misses Dynamic Type scaling and accessibility features |
| Toggle for a destructive action | Toggles imply instant, reversible settings; destructive actions need explicit confirmation |
| Menu picker for 2–3 options | Segmented picker shows all options without requiring a tap; faster for short lists |
| Custom date entry text field | Error-prone; iOS DatePicker provides built-in validation, localization, and accessibility |

---

## 4. Theming and Visual Design

### Rules

- Use **semantic colors** (`Color.primary`, `Color.secondary`, `Color.accentColor`, `Color(.systemBackground)`) — never hardcode hex values
- Use **semantic fonts** (`.body`, `.headline`, `.caption`, `.title`, etc.) — never specify fixed point sizes; this breaks Dynamic Type
- Support **dark mode** as a first-class concern — use Asset Catalogs with light/dark variants for custom colors
- Use **system materials** (`.ultraThinMaterial`, `.regularMaterial`) for translucent backgrounds — don't approximate with opacity
- Respect the user's **accessibility settings**: bold text, reduced motion, increased contrast, reduced transparency

### Semantic Color Usage

| Color | Purpose | Example usage |
|-------|---------|---------------|
| `.primary` | Primary text and icon content | Body text, list item titles |
| `.secondary` | Secondary text, less important information | Subtitles, timestamps, supplementary labels |
| `.accentColor` / tint | Interactive elements, links, selected states | Buttons, toggle tint, selected tab |
| `Color(.systemBackground)` | Screen backgrounds | Root view background |
| `Color(.secondarySystemBackground)` | Grouped content backgrounds (cards, sections) | Form/List section background |
| `Color(.tertiarySystemBackground)` | Nested grouped content | Content inside a grouped section |
| `Color(.systemGroupedBackground)` | Grouped table/form background | Form/List background |
| `Color(.separator)` | Dividers and borders | List separators |
| `.red` (system) | Destructive actions and error states | Delete button, error messages |

### Typography Usage

| Style | Purpose | Example usage |
|-------|---------|---------------|
| `.largeTitle` | Top-level screen titles (large navigation title) | Navigation bar large title |
| `.title` / `.title2` / `.title3` | Section headers, prominent labels | Section heading, card title |
| `.headline` | Emphasized body-level text | List item primary text, bold labels |
| `.body` | Standard readable text | Descriptions, message content |
| `.callout` | Secondary information at a slightly smaller size | Supporting details |
| `.subheadline` | Tertiary information | Metadata, timestamps |
| `.footnote` | Fine print, legal text | Terms, disclaimers |
| `.caption` / `.caption2` | Smallest text — labels on dense UI | Badge counts, timestamps in compact layouts |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `.font(.system(size: 16))` instead of `.font(.body)` | Ignores Dynamic Type; text doesn't scale with user preferences |
| Hardcoded `Color(red: 0.2, green: 0.4, blue: 0.8)` | Doesn't adapt to dark mode; breaks system appearance consistency |
| Custom translucent background with `Color.black.opacity(0.3)` | Doesn't match system materials; looks wrong in light mode and accessibility high-contrast mode |
| Ignoring `.accessibilityBoldTextEnabled` | Bold text preference not reflected in the app |

---

## 5. Adaptive Layout

### Rules

- Design for **two primary size classes**: compact (iPhone portrait) and regular (iPad, iPhone landscape)
- Use **ViewThatFits** or geometry-based conditions for layouts that adapt — never check for specific device models
- iPad apps must provide a **meaningful regular-width experience** — not just a stretched iPhone layout
- Support **multitasking** (Split View, Slide Over) on iPad — don't assume full-screen ownership
- Support **Stage Manager** window resizing on supported iPads — layouts must adapt continuously, not just at fixed breakpoints

### Layout Adaptation by Size Class

| Element | Compact (iPhone) | Regular (iPad / landscape) |
|---------|-----------------|---------------------------|
| Top-level navigation | TabView (bottom tabs) | TabView with sidebar style, or NavigationSplitView |
| List → Detail | Separate full screens (push) | Side-by-side (NavigationSplitView) |
| Grid columns | 2 columns | 3–4 columns |
| Sheets | Full height (default) | Form sheet (centered, partial height) |
| Popovers | Presented as sheets (system default) | Presented as actual popovers anchored to source |
| Toolbars | Bottom toolbar for key actions | Top toolbar (navigation bar) — more space available |
| Forms | Single column | Two columns for related field pairs |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `if UIDevice.current.userInterfaceIdiom == .pad` | Doesn't handle multitasking where an iPad can be in compact width; use size classes or `ViewThatFits` |
| Single-column list on iPad with no split view | Wastes space; looks like an unfinished iPhone app |
| Assuming full screen width | Breaks in Split View, Slide Over, and Stage Manager |
| Fixed pixel dimensions for layout | Doesn't adapt to Dynamic Type, accessibility sizes, or different devices |

---

## 6. State Representation

### Rules

- Every data-loading view defines **four states**: loading, content (success), empty, and error
- **Loading**: use `ProgressView()` or the `redacted(reason: .placeholder)` modifier to show a skeleton — not a blank screen
- **Empty**: show an SF Symbol, a message explaining why it's empty, and a CTA to resolve it — use `ContentUnavailableView` (iOS 17+) as the standard pattern
- **Error**: show the error type, a user-friendly message, and a retry action — use `ContentUnavailableView` for consistency
- **Pull-to-refresh**: provide on all `List` and `ScrollView` backed by server data using `.refreshable { }`
- Use `ProgressView` with `.progressViewStyle(.linear)` at the top of the view for background refresh (content stays visible)

### State Design Specification

For each view in the frontend design, specify:

| State | Required elements | Example |
|-------|-------------------|---------|
| Loading (first load) | `redacted(reason: .placeholder)` on content shape, or `ProgressView` | Order list: 5 placeholder rows with redacted text |
| Loading (refresh) | `.refreshable { }` pull-to-refresh; content remains visible | Pull down on order list; existing orders stay visible |
| Content | Populated view as designed | Order list with items |
| Empty | `ContentUnavailableView` with SF Symbol + title + description + action button | Shopping bag symbol + "No Orders Yet" + "Start Shopping" button |
| Error (recoverable) | `ContentUnavailableView` with error icon + message + "Try Again" button | Exclamation mark symbol + "Couldn't Load Orders" + retry |
| Error (non-recoverable) | `ContentUnavailableView` with message + navigation action | "Order Not Found" + "Back to Orders" |
| Partial error | Content loads but one section fails — inline error with retry in that section | Order loads but reviews show "Couldn't load reviews — Tap to retry" |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Full-screen `ProgressView()` spinner as the only loading state | Gives no indication of what content will appear; use redacted placeholders |
| Blank view on empty state | User doesn't know if the view is broken or if there's no data |
| Alert for every error | Interrupts the user; use inline `ContentUnavailableView` for screen-level errors |
| Removing visible content during refresh | User loses scroll position and context; content should remain visible during refresh |

---

## 7. Motion and Transitions

### Rules

- Use **system-provided transitions** as the default — SwiftUI's built-in navigation transitions (push, sheet slide-up) are what users expect
- Use **matchedGeometryEffect** for hero transitions where a visual element morphs from one view to another
- Use **.animation()** modifiers with **named animations** (`.easeInOut`, `.spring`) — not custom timing curves unless justified
- Respect the **Reduce Motion** accessibility setting — provide a non-animated fallback for all custom transitions
- Keep custom transition duration between **200ms** and **400ms**
- Use `.withAnimation { }` for state changes that should animate — don't animate everything by default

### Transition Selection

| Navigation type | Transition | Notes |
|----------------|------------|-------|
| NavigationStack push/pop | System push (slide from right) | Automatic; don't override unless strongly justified |
| Sheet presentation | System slide up from bottom | Automatic; customize detents with `.presentationDetents` |
| Tab switch | System crossfade | Automatic via TabView |
| Content state change (loading → content) | `.transition(.opacity)` | Smooth fade-in of content |
| List item appear/disappear | `.transition(.move(edge: .leading))` or `.opacity` | Subtle; don't over-animate list mutations |
| Hero element (card → detail) | `matchedGeometryEffect` | Card image animates to detail header image |
| Dismiss (swipe down on sheet) | System interactive dismiss | Automatic; support with `interactiveDismissDisabled` when needed |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Custom slide-from-right replacing system NavigationStack push | Inconsistent with platform; breaks swipe-back gesture expectations |
| Ignoring Reduce Motion | Accessibility violation; users who set this preference experience motion sickness |
| Animations > 500ms | Feels sluggish; users perceive the app as slow |
| Animating every state change without `.animation` scoping | Unintended animations on unrelated views; use `withAnimation` or targeted `.animation` |

---

## 8. Accessibility Design

### Rules

- All interactive elements must have a **minimum touch target of 44pt x 44pt** (Apple Human Interface Guidelines)
- All interactive elements must have an **accessibility label** describing the action or content
- Use **semantic fonts** (`.body`, `.headline`, etc.) to support **Dynamic Type** — text must scale from xSmall to AX5 without layout breakage
- Color must never be the **sole indicator** of state — pair with an SF Symbol, text, or shape
- Support **VoiceOver**: labels, hints, traits, custom actions, and grouping
- Support **Switch Control** and **Full Keyboard Access** — all functionality must be operable without touch
- Test at **largest accessibility text size** (AX5) — layouts must remain usable

### Accessibility Label Strategy

| Element type | Strategy | Example |
|-------------|----------|---------|
| Button with visible text | System infers label from text; add hint if non-obvious | Button("Place Order") — label is automatic; add `.accessibilityHint("Charges your default payment method")` |
| Icon-only button | Provide explicit label describing the action | `.accessibilityLabel("Share this product")` |
| Decorative image | Hide from accessibility | `.accessibilityHidden(true)` |
| Informational image | Describe the content | `.accessibilityLabel("Photo of Nike Air Max 90 in white")` |
| Status indicator | Describe the status, not the visual | `.accessibilityLabel("Status: Shipped")` not `.accessibilityLabel("Green checkmark")` |
| Card (composite view) | Combine elements into one accessible unit | `.accessibilityElement(children: .combine)` — VoiceOver reads title, subtitle, status as one item |
| Custom interactive component | Define trait and value | `.accessibilityAddTraits(.isButton)`, `.accessibilityValue("3 of 5 stars")` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Fixed font sizes via `.font(.system(size: 14))` | Doesn't scale with Dynamic Type; text unreadable at large accessibility sizes |
| Using only red/green to indicate error/success | Unusable for color-blind users; add an SF Symbol (checkmark.circle / xmark.circle) |
| Touch target smaller than 44pt | Difficult for users with motor impairments |
| `.accessibilityLabel("Button")` or `.accessibilityLabel("Image")` | Redundant — VoiceOver already announces the trait; describe the content or action |
| Ignoring `@Environment(\.sizeCategory)` at largest sizes | Layout breaks at AX5; text overlaps or gets truncated |

---

## 9. Form Design

### Rules

- Use **Form** and **Section** for settings-like input screens — they provide the correct grouped styling automatically
- Use **LabeledContent** for display-only rows within a Form
- Show **inline validation errors** below the field after the user leaves it — not during typing
- Use the correct **keyboard type** (`.keyboardType(.emailAddress)`, `.keyboardType(.phonePad)`) and **text content type** (`.textContentType(.emailAddress)`) for autofill support
- Place the **primary action** in the navigation bar (`.toolbar`) as a "Done" or "Save" button — or as a prominent button below the form if the form scrolls
- Support **autofill** by setting text content types correctly — this is critical for login, address, and payment forms

### Form Layout

| Complexity | Layout | Example |
|-----------|--------|---------|
| Simple (1–4 fields) | Single Form with one Section | Login, simple search |
| Medium (5–10 fields) | Form with multiple Sections, each with a header | Profile edit, shipping address |
| Complex (10+ fields or conditional logic) | Multi-step flow with a step indicator; each step is a separate view in a NavigationStack inside a sheet | Application, multi-page survey |

### Input Validation Display

| Scenario | Behavior |
|----------|----------|
| Required field left empty | Show error on focus loss; red text below the field: "Required" |
| Format validation fails | Show on focus loss with expected format: "Enter a valid email address" |
| Server-side validation fails | Map server error to the specific field; scroll to the first error |
| Cross-field validation (password confirmation) | Validate when the second field loses focus |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Custom form layout with VStack instead of Form | Loses system styling (grouped inset), separator management, and keyboard avoidance |
| Real-time validation on every keystroke | Annoying; shows errors before the user has finished typing |
| All errors only on submission | User must scroll back to find errors; poor experience |
| Plain text field for date input | Error-prone; use DatePicker for validation, localization, and accessibility |
| No `.textContentType` on login fields | Blocks password autofill and passkey support |

---

## 10. Notification and Feedback Design

### Rules

- Use **HUD-style toast** or **banner** for brief non-critical feedback — SwiftUI doesn't have a built-in snackbar, so define the pattern in the design system
- Use **Alert** (`.alert`) for critical messages that require acknowledgment or a binary choice
- Use **Confirmation Dialog** (`.confirmationDialog`) for destructive actions with multiple options
- Use **in-line banners** within the content area for persistent contextual messages (offline mode, warnings)
- Use **haptic feedback** (`.sensoryFeedback`) for important interactions — success, error, selection changes
- Never present multiple alerts simultaneously — queue them or consolidate

### Feedback Component Selection

| Scenario | Component | Behavior |
|----------|-----------|----------|
| Action completed successfully | Toast/banner (custom overlay or SPM package) + haptic `.success` | "Order placed" — auto-dismiss after 3s |
| Action failed (recoverable) | Toast/banner with retry action + haptic `.error` | "Couldn't save — Retry" — persists until dismissed or retried |
| Action failed (non-recoverable) | Alert with OK button | "Payment declined" + explanation + "OK" |
| Destructive action confirmation | Confirmation dialog with destructive button | "Delete this order?" + "Delete" (red) / "Cancel" |
| Connectivity change | Persistent banner at top of content area | "You're offline — changes will sync when connected" |
| Background task progress | ProgressView (linear) in toolbar or below navigation bar | Upload/sync progress |
| Form submission in progress | Button with ProgressView replacing label; fields disabled | "Saving..." with spinner |
| Selection feedback | Haptic `.selection` | Picker value change, toggle tap |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Alert for "Item added to cart" | Over-interrupts for a non-critical action; use a toast/banner |
| No confirmation for destructive actions | User accidentally deletes data with no recourse |
| Multiple alerts stacked | SwiftUI queues them awkwardly; consolidate into one dialog or handle sequentially |
| No haptic feedback on key interactions | App feels less responsive and polished compared to system apps |

---

## 11. Performance Design Targets

### Rules

- Define performance targets for each view and validate them during design review
- Cold app launch to interactive content must be ≤ **1 second** on recent devices (Apple's expectation)
- Navigation transitions must feel **instantaneous** — data loading happens after the transition, not before
- Lists with **50+ items** must use `List` (not `ScrollView` + `ForEach`) for automatic cell recycling
- Images must specify a **loading strategy**: `AsyncImage` with placeholder for remote images; pre-cached thumbnails for lists
- Define what data is **prefetched** based on likely navigation paths

### View Performance Specification

For each view in the frontend design, specify:

| Concern | Design decision |
|---------|----------------|
| Data loading | Initial data size, pagination strategy (cursor vs. offset), page size |
| Image loading | `AsyncImage` with `placeholder:` and `content:` phases; thumbnail vs. full resolution |
| Caching | SwiftData for offline-capable data; in-memory cache for session data; URL cache for images |
| Prefetching | Which views or data to prefetch based on likely navigation |
| List performance | Use `List` with stable identifiers; specify if custom `id:` is needed for diffing |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Fetching data before navigation (blocking the transition) | Navigation feels slow; fetch after the push and show a loading state |
| `ScrollView { ForEach(0..<10000) { ... } }` | Creates all views upfront; no recycling; massive memory usage and slow rendering |
| Full-resolution images in list thumbnails | Excessive memory; slow rendering; unnecessary bandwidth |
| No stable identifiers on list items | SwiftUI can't diff efficiently; entire list re-renders on any change |
| Loading all pages of data at once | Slow initial load; excessive memory; unnecessary API calls |

---

## Customization

- **Section 1 (Navigation Architecture):** Apps targeting iOS 16 must use `NavigationStack` (not the deprecated `NavigationView`). Apps that also support iOS 15 may use `NavigationView` with a plan to migrate. Document the minimum deployment target and its navigation implications in the design.

- **Section 3 (Component Selection):** Projects with a custom design system may override system controls. The design should map each custom component to its system control equivalent (e.g., "our `BrandTextField` replaces `TextField`") and confirm the custom component meets the same accessibility and Dynamic Type requirements as the system control.

- **Section 6 (State Representation — @Observable vs. ObservableObject):** `@Observable` requires iOS 17+. Projects targeting iOS 16 must use `ObservableObject` with `@Published` properties and `@StateObject` / `@ObservedObject`. If the deployment target is iOS 17+, prefer `@Observable` for simpler observation. Document which observation model the design uses and why.

- **Section 7 (Motion and Transitions):** Custom transitions and matched geometry effects add visual polish but increase complexity. For MVP or time-constrained designs, standard SwiftUI transitions (`.slide`, `.opacity`) are acceptable. Call out any custom transitions that are critical to the UX vs. nice-to-have.

- **Section 8 (Accessibility):** WCAG compliance level may vary by organization. The baseline here is WCAG 2.1 AA. Organizations with stricter requirements should extend the rules. VoiceOver audit depth (per-screen vs. key flows only) should be calibrated to the project's accessibility NFRs.

- **Section 10 (Notification and Feedback):** Haptic feedback availability varies by device (e.g., older iPads lack the Taptic Engine). Design should specify fallback behavior (visual-only feedback) for devices that don't support haptics. Push notification patterns depend on whether the app uses APNs directly or a third-party service (Firebase, OneSignal) — document the chosen approach.
