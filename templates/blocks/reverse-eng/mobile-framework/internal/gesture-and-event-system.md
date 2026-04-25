---
slug: gesture-and-event-system
title: "Gesture and Event System"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 160
---

## 6. Gesture and Event System

### 6.1 Touch Event Pipeline

```
[ OS UITouch / MotionEvent ]
        ↓
[ Native shell dispatcher — view hierarchy hit-test ]
        ↓
[ Framework gesture system — recognisers + responder negotiation ]
        ↓
[ Synthetic event posted to runtime ]
        ↓
[ App component handler ]
```

### 6.2 Native Event Dispatch

- iOS: `hitTest(_:with:)` returns the deepest view that should receive the gesture; events flow to the responder chain.
- Android: `dispatchTouchEvent` / `onInterceptTouchEvent` cooperate to give parents a chance to steal.

The framework hooks both hierarchies so synthetic events follow the same rules across platforms.

### 6.3 Gesture Recognisers

| Recogniser | Triggered When | Conflict Strategy |
|------------|----------------|-------------------|
| Tap | Touch down + up under N px / N ms | Defers to long-press |
| Long-press | Touch down held ≥ N ms | Wins over tap |
| Pan | Touch movement above slop | Wins over scroll once direction matches |
| Swipe | Pan with min velocity in direction | Reports on touch up |
| Pinch | 2-finger | Composable with rotate |
| Rotate | 2-finger | Composable with pinch |
| Custom | App-provided gesture | Negotiates via responder system |

### 6.4 Responder / Recogniser Negotiation

- Each component declares interest via `onStartShouldSetResponder` / `onMoveShouldSetResponder` (or platform-equivalent).
- The first interested ancestor wins; descendants can ask to "reclaim" the responder via explicit hooks.
- Recognisers can be marked `simultaneous: true` to allow multiple to fire from one touch sequence.

### 6.5 Synthetic Events

A normalised event object is delivered to handlers:

```ts
interface SyntheticTouchEvent {
  nativeEvent: {
    timestamp: number;            // monotonic ms
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
    target: NodeId;
    touches: TouchPoint[];
    changedTouches: TouchPoint[];
    force?: number;               // 3D Touch / pressure where available
  };
  type: "touchstart" | "touchmove" | "touchend" | "touchcancel";
  persist(): void;                // disables event pooling
}
```

> Events are pooled by default; calling async code that retains the event must call `persist()`.

### 6.6 Keyboard, Pointer, and Hover Events

| Event | iOS | Android | Notes |
|-------|-----|---------|-------|
| Hardware keyboard | `pressesBegan/Ended` | `dispatchKeyEvent` | Required for iPad keyboard / Chromebook |
| Pointer (mouse / trackpad) | `UIPointerInteraction` | `MotionEvent.TOOL_TYPE_MOUSE` | Hover + cursor change |
| Stylus / pencil | `UITouch.type == .pencil` | `MotionEvent.TOOL_TYPE_STYLUS` | Pressure / tilt |
| Focus | `UIFocusEnvironment` | `View.OnFocusChangeListener` | Drives accessibility focus + keyboard nav |

### 6.7 Accessibility Events

- VoiceOver / TalkBack open a parallel event channel — handlers in user code receive `onAccessibilityTap`, `onAccessibilityEscape`.
- Custom recognisers SHOULD fall back to a focusable element so screen readers can drive them.

### 6.8 Threading

- Touches arrive on the UI thread.
- The framework converts and posts to the runtime thread; consumers' handlers run there.
- Long-running handlers should `await` async work — synchronous heavy work blocks the next frame.

### 6.9 Where the Code Lives

```
{{repo}}/
├── packages/gesture-handler/          # gesture recognisers
├── packages/runtime/src/events/       # synthetic event normalisation
├── ios/Events/                        # UIKit dispatch glue
└── android/.../events/                # Android touch dispatch glue
```
