---
slug: native-bridge
title: "Native Bridge"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
---

## 3. Native Bridge

### 3.1 Bridge Generations / Variants

| Variant | Status | When Used | Notes |
|---------|--------|-----------|-------|
| Async message-queue bridge | [legacy / current] | All current apps unless opted into the new architecture | JSON-serialised messages over a queue |
| JSI / direct synchronous bindings | [current / experimental] | Apps opting into the new architecture | C++ host objects callable from JS without serialization |
| Platform channels (Flutter) | [current] | All apps | Async, codec-driven |
| Code-generated bindings | [planned / current] | Where strict typing is required | Generated from IDL (`.flow.js` / `.idl` / `.ts`) |

### 3.2 Wire Format

#### Message-queue style

```json
{
  "module": "Camera",
  "method": "takePhoto",
  "callId": 42,
  "args": [
    { "quality": 0.8, "flash": "auto" }
  ]
}
```

- Arguments are serialised via `{{json | flatbuffers | msgpack}}` and round-trip across the bridge.
- Replies use a matching `callId`; rejections use `{ "callId": 42, "error": { "code": "...", "message": "..." } }`.
- Batching: queued calls are flushed every `{{n}}` ms or on explicit `flush()`.

#### JSI / direct call style

```cpp
// Native side exposes an object on the JS global
runtime.global().setProperty(
  rt, "__CameraHostObject",
  jsi::Object::createFromHostObject(rt, std::make_shared<CameraHostObject>())
);
```

```ts
// JS side calls synchronously (or returns a Promise from native)
__CameraHostObject.takePhoto({ quality: 0.8 });
```

### 3.3 Threading and Dispatch Rules

| Direction | Caller thread | Callee thread | Mechanism |
|-----------|---------------|---------------|-----------|
| JS → Native | JS thread | Module-declared queue (default: bg) | enqueue + GCD/Looper |
| Native → JS | Any | JS thread | post to JS runloop |
| UI mutation | JS / framework | UI thread | shadow tree → mounting on UI thread |

> **Rule of thumb:** never call a native module from the UI thread directly. Never call a JS function from a non-JS thread without explicit posting.

### 3.4 Type System Across the Bridge

| JS Type | Native (iOS) | Native (Android) | Notes |
|---------|--------------|-------------------|-------|
| `string` | `NSString *` | `String` | UTF-16 conversion is non-trivial — measure |
| `number` | `NSNumber *` / `double` | `double` | All numbers are 64-bit float over the bridge |
| `bool` | `BOOL` | `boolean` | — |
| object (plain) | `NSDictionary` | `ReadableMap` | Deep copy on cross |
| array | `NSArray` | `ReadableArray` | Deep copy on cross |
| function (callback) | block | `Callback` | One-shot — must be invoked exactly once |
| `Promise` | `RCTPromiseResolveBlock`/`Reject` | `Promise` | Must be resolved or rejected (memory leak if neither) |
| `null` / `undefined` | `nil` / `[NSNull null]` | `null` | `undefined` is not preserved |

### 3.5 Performance Characteristics

| Operation | Typical Cost |
|-----------|--------------|
| Single async bridge call (round-trip) | `{{n}}` µs — JSON encode + queue + decode |
| JSI synchronous call (read-only host fn) | sub-µs |
| 1000-element array marshal | linear in element count + structure depth |
| Large binary payload (image, audio) | should be passed by reference / shared memory, not serialised |

**Anti-patterns to surface in code review:**
- Calling the bridge in a tight render loop.
- Marshalling raw bitmap data through the bridge.
- Using callbacks instead of Promises (single-shot, easy to forget to invoke).

### 3.6 Tracing the Bridge

- Dev-mode bridge inspector: `{{tool_name}}` (e.g., Flipper, dev menu → "Show Perf Monitor").
- Per-call tracing (`__DEV__` builds): `console.time("bridge:Camera.takePhoto")`.
- Production sampling: `{{n}}%` of calls sampled into `{{apm_provider}}`.

### 3.7 Where the Code Lives

```
{{repo}}/
├── ReactCommon/                       # (RN) C++ shared bridge code
├── packages/runtime/src/bridge/       # JS-side bridge dispatcher
├── ios/Bridge/                        # Obj-C / Swift bridge module impl
└── android/.../bridge/                # Java/Kotlin bridge module impl
```
