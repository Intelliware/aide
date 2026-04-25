# Android Frontend Design Standards

**Applies to:** Android 12+ (API 31+) with Jetpack Compose and Material Design 3. Features gated on specific API levels are noted inline (e.g., dynamic color requires API 31+, predictive back requires API 34+). For apps supporting older minimum SDK versions, the standards still apply — use runtime API checks for version-gated features.

These are the baseline standards the AI uses when designing Android frontend architecture in the solutions package. During Step 3 of the frontend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new screens should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about screen structure, navigation, component selection, and layout strategy. They do not prescribe implementation details. Implementation-level rules (Compose APIs, lifecycle handling, Gradle module structure) are covered separately in the implementation package's platform standards.

---

## 1. Navigation Architecture

### Rules

- Use **bottom navigation** for 3–5 top-level destinations that are equally important and frequently accessed
- Use **navigation drawer** for 6+ destinations or when destinations have unequal importance
- Use **tabs** for peer content within a single screen (e.g., "Active Orders" / "Past Orders") — not for top-level app navigation
- Use **full-screen navigation** (stack-based) for detail flows that drill into content
- Each top-level destination owns its own back stack — switching tabs does not clear history
- Deep links must resolve to a specific screen with all required data, not just the app's home screen

### Navigation Pattern Selection

| Scenario | Pattern | Rationale |
|----------|---------|-----------|
| 3–5 equally important sections (e.g., Home, Search, Orders, Profile) | Bottom navigation | Always visible, one-tap access, each section has its own back stack |
| 6+ sections or sections with unequal importance | Navigation drawer | Scales to many destinations; less prominent items don't crowd the UI |
| Sub-categories within a screen (e.g., order statuses) | Tabs (scrollable if > 4) | Peer content at the same hierarchy level |
| Multi-step flow (e.g., checkout, onboarding) | Full-screen with progress indicator | Linear progression with clear forward/back; no tab or drawer distraction |
| Settings or infrequently accessed screens | Stack navigation from drawer or profile | Not important enough for bottom nav real estate |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Hamburger menu as primary navigation for ≤ 5 destinations | Hides key destinations; bottom nav is more discoverable on mobile |
| Bottom navigation with > 5 items | Violates Material Design guidelines; items become too small to tap reliably |
| Tabs for top-level app navigation | Tabs lack independent back stacks; swiping between tabs conflicts with in-page horizontal gestures |
| Nested bottom navigation bars | Creates confusion about which nav controls which content |

---

## 2. Screen Architecture

### Rules

- Every screen uses a **Scaffold** as its root layout container — top app bar, content area, and optional bottom bar / FAB
- Choose the **top app bar variant** based on the screen's scrolling behavior and hierarchy position
- **Dialogs** are for decisions that require immediate attention and block interaction with the screen behind
- **Bottom sheets** are for supplementary content or actions that don't require full-screen navigation
- **Full-screen screens** are for content creation, editing, or detail views that need maximum space

### Top App Bar Selection

| Variant | When to use |
|---------|-------------|
| Center-aligned | Single top-level destination with a brand identity or simple title |
| Small | Most screens — standard title with optional navigation icon and actions |
| Medium | Screens where the title is long or where visual hierarchy benefits from a larger header on initial load (collapses on scroll) |
| Large | Content-heavy screens where the title provides important context (collapses on scroll) |

### Screen Type Selection

| Type | When to use | Example |
|------|-------------|---------|
| Full screen (via stack navigation) | Primary content viewing, creation, or editing | Order detail, compose message, edit profile |
| Dialog | Binary decisions, confirmations, or alerts that need immediate response | "Delete this order?", permission rationale |
| Modal bottom sheet | Secondary actions, filters, or selection from a list | Sort options, share menu, address picker |
| Full-screen bottom sheet | Complex forms or content that needs significant space but is contextually tied to the parent screen | Multi-field filter, detailed preview |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Dialog for complex forms with many fields | Dialogs are for simple decisions; use a bottom sheet or full screen for complex input |
| Bottom sheet for critical destructive actions | Users can dismiss bottom sheets with a swipe; destructive confirmations need a dialog that requires explicit choice |
| Full-screen navigation for a simple yes/no confirmation | Over-engineered; use a dialog |
| Screen without a Scaffold | Loses consistent app bar behavior, snackbar anchoring, and FAB placement |

---

## 3. Component Selection

### Rules

- Prefer **Material Design 3 components** over custom components for standard UI patterns
- Use the correct button variant based on the action's importance in the visual hierarchy
- Use the correct text field variant consistently throughout the app — do not mix Outlined and Filled
- Cards are for **self-contained content units** — not for wrapping every piece of UI

### Button Hierarchy

Design the button hierarchy per screen so the most important action is visually dominant:

| Priority | Component | When to use | Example |
|----------|-----------|-------------|---------|
| Highest | Filled button | Primary action on the screen — at most one per visible area | "Submit Order", "Save" |
| High | Filled tonal button | Important but not the primary action | "Add to Cart" alongside "Buy Now" |
| Medium | Outlined button | Alternative or secondary action | "Cancel", "Save Draft" |
| Low | Text button | Tertiary or less prominent action | "Skip", "Learn More", "Forgot Password?" |
| Contextual | FAB / Extended FAB | Screen-level creation or primary action that floats above content | "Compose", "New Order" |
| Contextual | Icon button | Toolbar or inline actions where space is limited | Share, bookmark, delete in a row |

### Content Display

| Component | When to use | When NOT to use |
|-----------|-------------|-----------------|
| List item | Homogeneous collections with consistent row structure | Rich content that varies significantly per item |
| Card | Self-contained content units that can be individually acted upon (tapped, swiped, shared) | Simple lists where a list item suffices; wrapping individual text fields or buttons |
| Carousel | Horizontally browsable collections of visual content | Text-heavy content; lists where vertical scrolling is more natural |
| Grid | Visual content where items are best compared side-by-side (photos, products) | Text-heavy items that need more horizontal reading space |

### Selection Components

| Component | When to use |
|-----------|-------------|
| Checkbox | Multi-select from a list; toggling independent options |
| Radio button | Single-select from a short list (2–5 visible options) |
| Switch | Binary on/off for settings or preferences with immediate effect |
| Dropdown menu | Single-select from a long list (> 5 options) where screen space is limited |
| Chip (filter) | Multi-select filters that the user can see at a glance; removable |
| Chip (input) | Representing user-entered entities (tags, recipients) |
| Date/time picker | Date or time input — never use a free-text field for dates |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Multiple filled buttons on the same screen | Competing for attention; only the primary action should be filled |
| Switch for a destructive action | Switches imply instant, reversible toggles; destructive actions need explicit confirmation |
| Dropdown for 2–3 options | Radio buttons are faster and show all options without interaction |
| Free-text field for date input | Error-prone; use a date picker for consistent formatting and validation |

---

## 4. Theming and Design Tokens

### Rules

- Define a **color scheme** using Material 3 color roles — never reference raw hex values directly in component designs
- Define a **type scale** using Material 3 typography roles — never specify font sizes directly; reference the role
- Support **dark theme** as a first-class concern — design every screen in both light and dark
- Support **dynamic color** (Material You) on Android 12+ with a static fallback for older versions
- Define a **shape system** using Material 3 shape roles (extra-small, small, medium, large, extra-large)

### Color Role Usage

| Role | Purpose | Example usage |
|------|---------|---------------|
| Primary | Key interactive elements, FABs, prominent buttons | "Submit" button background |
| On Primary | Content on top of primary color | "Submit" button text |
| Primary Container | Less prominent containers related to the primary action | Selected chip background, active filter |
| Secondary | Less prominent interactive elements | Tonal buttons, active toggles |
| Tertiary | Accent or complementary elements | Progress indicators, tags |
| Surface | Background for cards, sheets, dialogs | Card background, bottom sheet |
| Surface Variant | Differentiated surface areas | Alternate row background, divider |
| Error | Error states, destructive actions | Error text field border, delete icon |
| Outline | Borders, dividers | Text field border, card outline |

### Typography Role Usage

| Role | Purpose | Example usage |
|------|---------|---------------|
| Display (Large/Medium/Small) | Hero text, large numbers | Dashboard total, onboarding headline |
| Headline (Large/Medium/Small) | Screen titles, section headers | Top app bar title, section heading |
| Title (Large/Medium/Small) | Card titles, dialog titles | Card header, list group title |
| Body (Large/Medium/Small) | Paragraph text, descriptions | Product description, message body |
| Label (Large/Medium/Small) | Button text, field labels, captions | Button label, input field label, timestamp |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Using `Primary` color for error states | Confuses the semantic meaning; errors must use the `Error` role |
| Hardcoding `#FF6200EE` instead of referencing `Primary` | Breaks theming, dark mode, and dynamic color |
| Using `Body Large` for button text | Buttons use `Label Large`; mixing roles creates visual inconsistency |
| Designing only for light mode | Forces a half-working dark mode or no dark mode support |

---

## 5. Adaptive Layout

### Rules

- Design for three **window size classes**: Compact (phone portrait), Medium (phone landscape / small tablet), Expanded (tablet / foldable open / desktop)
- Use **NavigationSuiteScaffold** to automatically adapt top-level navigation across size classes (bottom bar → rail → drawer)
- Use **list-detail layout** for master-detail patterns on Medium and Expanded widths
- Never hard-code pixel dimensions for layouts — use proportion-based or constraint-based sizing
- Foldable devices: support table-top posture (content above hinge, controls below) where applicable

### Layout Adaptation by Window Size Class

| Element | Compact (< 600dp) | Medium (600–839dp) | Expanded (≥ 840dp) |
|---------|-------------------|-------------------|---------------------|
| Top-level navigation | Bottom navigation bar | Navigation rail | Navigation rail or permanent drawer |
| List-detail screens | List and detail as separate full screens | Side-by-side list (1/3) and detail (2/3) | Side-by-side list (1/3) and detail (2/3) |
| Grid columns | 1–2 columns | 2–3 columns | 3–4 columns |
| Dialogs | Full-width (with margin) | Centered, max 560dp wide | Centered, max 560dp wide |
| Bottom sheets | Full-width | Centered, max 640dp wide | Consider replacing with a side panel |
| Forms | Single column, stacked fields | Two-column for related field pairs | Two-column with preview panel |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Fixed-width layouts that don't adapt to screen size | Wastes space on tablets; text is unreadable on small phones |
| Bottom navigation on tablets | Too spread out on wide screens; use a navigation rail |
| Full-screen list + full-screen detail on tablets | Wastes the available space; use a list-detail split layout |
| Ignoring foldable postures | Hinge obscures content; table-top mode is a common usage pattern |

---

## 6. State Representation

### Rules

- Every data-loading screen defines **four states**: loading, content (success), empty, and error
- **Loading**: use skeleton/shimmer that matches the content layout shape — not a centered spinner
- **Empty**: show an illustration (or icon), a message explaining why it's empty, and a CTA to resolve it
- **Error**: show the error type, a user-friendly message, and a retry action — distinguish between recoverable (retry) and non-recoverable (navigate away) errors
- **Pull-to-refresh**: provide on all screens backed by server data
- **Pagination**: use infinite scroll with a loading indicator at the list bottom — not numbered pages

### State Design Specification

For each screen in the frontend design, specify:

| State | Required elements | Example |
|-------|-------------------|---------|
| Loading (first load) | Shimmer placeholder matching content shape; no interaction possible | Order list: 5 shimmer rows matching OrderItem layout |
| Loading (refresh) | Pull-to-refresh indicator at top; existing content remains visible and interactive | SwipeRefresh with visible order list below |
| Content | Populated layout as designed | Order list with items |
| Empty | Illustration/icon + explanatory text + primary CTA | "No orders yet" + shopping bag icon + "Browse Products" button |
| Error (recoverable) | Error icon + user-friendly message + "Retry" button; existing stale content shown if available | "Couldn't load orders" + retry button |
| Error (non-recoverable) | Error icon + message + navigation action (e.g., "Go Back") | "Order not found" + "Back to Orders" button |
| Partial error | Content loads but one section fails — show the section with an inline error and retry | Order detail loads but reviews section shows "Couldn't load reviews — Tap to retry" |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Centered spinner as the only loading state | Gives no indication of what content is loading or how the screen will look |
| Blank screen on empty state | User doesn't know if the screen is broken or if there's genuinely no data |
| Generic "Something went wrong" with no action | User is stuck with no way to recover |
| Removing visible content during refresh | Jarring experience; the user loses their scroll position and context |

---

## 7. Motion and Transitions

### Rules

- Use **container transform** when navigating from a list item to its detail screen — the item visually expands into the detail
- Use **shared axis** (horizontal) for peer navigation (tabs, pagination) and shared axis (vertical) for parent-child navigation
- Use **fade through** when switching between unrelated destinations (bottom nav tabs)
- Support **predictive back gesture** — the previous screen should be visible behind the current screen during the back swipe
- Keep transition duration between **150ms** (micro-interactions) and **400ms** (full-screen transitions)
- Never block user interaction during a transition

### Transition Selection

| Navigation type | Transition | Duration |
|----------------|------------|----------|
| List item → detail screen | Container transform | 300ms |
| Tab switch (bottom nav) | Fade through | 300ms |
| Forward in a flow (e.g., step 1 → step 2) | Shared axis (horizontal, forward) | 300ms |
| Back in a flow | Shared axis (horizontal, backward) or predictive back | 300ms |
| Dialog appearing | Fade in + scale up from center | 150ms |
| Bottom sheet appearing | Slide up from bottom edge | 250ms |
| Snackbar appearing | Fade in + slide up | 150ms |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No transitions (instant screen swap) | Feels jarring; user loses spatial context of where they are in the app |
| Slide-left for everything | Doesn't communicate the relationship between screens (peer vs. parent-child) |
| Transitions longer than 400ms | Feels sluggish; users perceive the app as slow |
| Custom bouncy/elastic animations for navigation | Distracting and inconsistent with platform feel |

---

## 8. Accessibility Design

### Rules

- All interactive elements must have a **minimum touch target of 48dp x 48dp** (Material Design guideline)
- All meaningful visual elements must have a **content description** — decorative elements must be explicitly marked as decorative
- Group related elements using **semantic merging** so screen readers announce them as a single unit (e.g., a card with title, subtitle, and status becomes one announcement)
- Color must never be the **sole indicator** of state — always pair with an icon, text, or pattern
- Text contrast ratio must meet WCAG 2.1 AA: **4.5:1** for body text, **3:1** for large text (≥ 18sp or ≥ 14sp bold)
- Custom components must define **accessibility roles** (button, checkbox, switch, heading) and **state descriptions** (selected, expanded, disabled)
- Support **font scaling** up to 200% without text truncation or layout breakage

### Content Description Strategy

| Element type | Strategy | Example |
|-------------|----------|---------|
| Icon button (standalone) | Describe the action | "Delete order", "Share product" |
| Decorative icon (next to text) | Mark as decorative (null description) | Shopping cart icon next to "3 items" text |
| Status indicator | Describe the status, not the visual | "Status: Shipped" not "Green circle" |
| Image (informational) | Describe the content | "Photo of Nike Air Max 90 in white" |
| Image (decorative) | Mark as decorative | Background pattern, brand illustration |
| Card (composite) | Merge descendants; provide summary | "Order #1234, John Smith, $45.00, status Shipped" |
| List with actions | Each item: merged description + custom actions | "Order #1234 — double tap to view, swipe right to archive" |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Using only red/green to distinguish error/success | Unusable for color-blind users (8% of males); add an icon or text label |
| Touch target smaller than 48dp | Difficult to tap for users with motor impairments |
| Content description that says "Image" or "Button" | Redundant (screen reader already announces the role); describe the content or action instead |
| Long content descriptions that read the entire screen | Overwhelming; merge and summarize related elements |

---

## 9. Form Design

### Rules

- Use **one text field variant consistently** throughout the app — either Outlined or Filled, not both
- Show **inline validation errors** below the field immediately after the user leaves the field (on blur), not on every keystroke
- Place the **primary action button** at the bottom of the form, always visible (not hidden behind the keyboard)
- Use **appropriate keyboard types** for each field (email, phone, number, URL, password)
- Multi-step forms show a **progress indicator** (stepper or progress bar) and allow back navigation to previous steps
- Pre-fill fields from known data when possible (e.g., saved addresses, previous entries)

### Text Field Error Display

| Scenario | Behavior |
|----------|----------|
| Required field left empty | Show error on blur: "Required" |
| Format validation fails | Show error on blur with expected format: "Enter a valid email address" |
| Server-side validation fails after submit | Map server error to the specific field; scroll to the first error |
| Multiple errors on a field | Show the most specific error, not all errors simultaneously |

### Form Layout by Complexity

| Complexity | Layout | Example |
|-----------|--------|---------|
| Simple (1–4 fields) | Single section, single column | Login form, search filters |
| Medium (5–10 fields) | Grouped sections with headers, single column | Profile edit, shipping address |
| Complex (10+ fields or conditional logic) | Multi-step with stepper; one section per step | Account application, multi-page survey |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Validating every keystroke (real-time) | Annoying for the user; shows errors before they've finished typing |
| All errors shown only after form submission | User has to scroll back to find and fix errors; poor experience |
| Mixing Outlined and Filled text fields on the same screen | Visual inconsistency; choose one variant |
| Submit button inside a scrollable area, hidden by the keyboard | User can't find or tap the submit button |
| Placeholder text as the only field label | Label disappears when the user starts typing; they forget what the field is for |

---

## 10. Notification and Feedback Design

### Rules

- Use **snackbars** for brief, non-critical feedback on a completed action — auto-dismiss after 4–10 seconds
- Use **dialogs** for critical alerts, confirmations, or errors that require explicit user acknowledgment
- Use **in-line banners** for persistent, contextual messages (e.g., "Offline mode — changes will sync when connected")
- Use **toasts** only for fire-and-forget messages with no action — prefer snackbars since they support an action button
- Never stack multiple snackbars — if a new message arrives, it replaces the current one

### Feedback Component Selection

| Scenario | Component | Behavior |
|----------|-----------|----------|
| Action completed successfully | Snackbar with optional undo action | "Order deleted" + "Undo" — auto-dismiss 6s |
| Action failed (recoverable) | Snackbar with retry action | "Couldn't save — Retry" — persists until dismissed or retried |
| Action failed (non-recoverable) | Dialog with explanation | "Payment declined" + message + "OK" |
| Destructive action confirmation | Dialog with two buttons | "Delete this order?" + "Cancel" / "Delete" |
| Connectivity change | Persistent banner at top of content | "You're offline" — dismisses automatically when connected |
| Background process progress | Progress indicator (linear, at top of screen) | Upload progress bar |
| Form submission in progress | Disabled submit button + loading indicator on button | Button shows spinner, fields become non-editable |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Dialog for "Item added to cart" | Over-interrupts the user for a non-critical action; use a snackbar |
| Snackbar for "Are you sure you want to delete?" | Snackbars auto-dismiss — a destructive confirmation needs a persistent dialog with explicit choice |
| Multiple simultaneous snackbars stacked | Clutters the UI; only one snackbar at a time |
| No feedback after a user action (silent success) | User doesn't know if their action worked |

---

## 11. Performance Design Targets

### Rules

- Define performance targets for each screen type and validate them during design review
- Cold app launch to interactive content must be ≤ **1.5 seconds** on a mid-range device
- Screen transition to meaningful content must be ≤ **300ms** (skeleton visible immediately, data populates after)
- Lists with **50+ items** must specify a virtualization strategy (lazy loading)
- Images must specify a **loading strategy** (progressive, placeholder, thumbnail-first)
- Offline-capable screens must specify what **data is cached** and the cache freshness policy

### Screen Performance Specification

For each screen in the frontend design, specify:

| Concern | Design decision |
|---------|----------------|
| Data loading | How much data is loaded initially vs. paginated; page size |
| Image loading | Placeholder strategy (color, thumbnail, shimmer); resolution selection |
| Caching | Which data is cached locally; stale-while-revalidate policy; cache expiry |
| Prefetching | Which screens or data can be prefetched based on likely next navigation |
| Heavy computation | Any client-side sorting, filtering, or transformation that needs background processing |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Loading all items in a list at once | Slow initial load, excessive memory usage, jank on scroll |
| Full-resolution images loaded immediately | Slow rendering, excessive bandwidth, poor experience on slow networks |
| No caching — re-fetching on every navigation | Unnecessary network calls; slow perceived performance |
| Blocking the UI thread with data transformation | Dropped frames, janky scroll, unresponsive taps |

---

## Customization

- **Section 1 (Navigation Architecture):** Alternative navigation frameworks (Voyager, Decompose, Appyx) are acceptable if they provide equivalent type-safe routing and deep link support. Document the chosen framework and its rationale in the design.

- **Section 3 (Component Selection — Material Design 3):** Projects with a custom design system may override M3 components with their own component library. The design should still specify which custom component maps to which standard role (e.g., "our `BrandButton` replaces M3 `Button`"). Custom component libraries must still follow the touch target, accessibility, and theming rules.

- **Section 4 (Theming — Dynamic Color):** Dynamic color requires Android 12+ (API 31). Apps with lower `minSdk` must provide a static fallback color scheme. For apps targeting API 28–30 only, skip the dynamic color rule and design with static color tokens.

- **Section 5 (Adaptive Layout):** Adaptive layout complexity scales with the device matrix. Apps targeting phones only may simplify to a single layout dimension (compact). Apps targeting phones + tablets + foldables need the full canonical layout set. State which form factors are in scope early in the design.

- **Section 8 (Accessibility):** WCAG compliance level may vary by organization or regulatory requirement. The baseline here is WCAG 2.1 AA. Organizations with stricter requirements (e.g., AAA for government apps) should extend the rules; organizations with different targets should override the specific thresholds.

- **Section 11 (Performance):** Pagination strategy (cursor-based vs. offset-based) and image caching library (Coil vs. Glide) are project decisions. The design standard requires that a choice is made and documented, not which library is selected. Performance budgets (initial load time, scroll frame rate) should be calibrated to the app's NFRs rather than the generic thresholds listed here.
