---
slug: navigation-and-routing-internals
title: "Navigation and Routing Internals"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 190
---

## 9. Navigation and Routing Internals

### 9.1 Navigation Models Supported

| Model | Description | Native Backing |
|-------|-------------|----------------|
| Stack | Push / pop a stack of screens | `UINavigationController` / `FragmentManager` back stack |
| Tab | Sibling root sections | `UITabBarController` / `BottomNavigationView` |
| Drawer | Slide-out side menu | Custom view + gesture |
| Modal | Above-stack overlay | `presentViewController:` / `DialogFragment` |
| Nested | Stacks inside tabs inside drawers | Hierarchical composition |

### 9.2 Route Description

Routes are described declaratively:

```ts
const routes = {
  Home: { component: HomeScreen, options: { title: "Home" } },
  Order: { component: OrderScreen, options: { title: "Order" } },
  Modal: { component: ModalScreen, options: { presentation: "modal" } },
};
```

The router converts the declaration into:
- A linking schema (deep-link mapping).
- A navigation graph (allowed transitions).
- A typed API (`navigate("Order", { id: "..." })`).

### 9.3 Navigator Lifecycle

```
[ App mounts ]
   ↓
[ Navigator computes initial state from links / restored state ]
   ↓
[ Push / pop / replace mutates state ]
   ↓
[ Transition begins (animation driver) ]
   ↓
[ Old screen onWillBlur / onDidBlur ]
   ↓
[ New screen onWillFocus / onDidFocus ]
   ↓
[ Transition ends ]
```

### 9.4 Transition Coordination

- Transition driver runs on the UI / render thread, decoupled from the JS / VM thread, so JS work doesn't stall the animation.
- Per-route options: `gestureEnabled`, `animation: "slide" | "fade" | "modal" | "none"`, `swipeBackEnabled`.
- Hardware back button (Android) routes through the navigator; intercept hooks let screens consume it.

### 9.5 Deep-Link Routing Internals

- The linking schema is registered with the embedder (Universal Links / App Links / custom URI scheme entries in `Info.plist` / `AndroidManifest`).
- When a deep link arrives:
  1. Embedder forwards the URL to the runtime.
  2. Linking module matches the URL against the schema.
  3. A "navigation diff" is computed — minimal stack to land the user on the target.
  4. Diff is applied; pre-existing state is preserved where the schema allows.
- Auth-required routes are intercepted: redirect to login, then resume.

### 9.6 Route Params and Type Safety

Code-generated route types ensure params are validated at build time:

```ts
type RouteMap = {
  Home: undefined;
  Order: { id: string };
  Profile: { userId: string; tab?: "posts" | "likes" };
};

navigation.navigate("Order", { id: "abc" });   // ok
navigation.navigate("Order", {});              // type error
```

### 9.7 State Persistence and Restoration

- Stack state can be serialised to JSON and persisted (on background / foreground).
- Restoration policy:
  - Always restore deep-link routes.
  - Optionally restore modal stacks.
  - Never restore screens flagged `dontRestore` (e.g., login, payment).

### 9.8 Integration with Native Containers

Some apps use native navigation (`UINavigationController`) at the top level and embed framework screens. The framework cooperates by:
- Reporting screen titles, large-title prefs, hide-bar-on-scroll preferences via native APIs.
- Forwarding `viewWillAppear` / `onResume` events into the framework's lifecycle.

### 9.9 Where the Code Lives

```
{{repo}}/
├── packages/navigation/                # router / state / typed APIs
├── packages/linking/                   # URL → route resolver
├── ios/Navigation/                     # UIKit interop
└── android/.../navigation/             # Android interop
```
