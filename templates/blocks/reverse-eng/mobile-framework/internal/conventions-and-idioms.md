---
slug: conventions-and-idioms
title: "Conventions and Idioms"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 320
---

## 22. Conventions and Idioms

### 22.1 Coding Standards

| Language | Standard | Lint / Formatter |
|----------|----------|------------------|
| TypeScript / JavaScript | `@framework/eslint-config` + Prettier | ESLint (CI-enforced) |
| Dart | `package:lints/recommended` | `dart format` |
| Swift / Obj-C | SwiftLint config in repo | SwiftLint, swift-format |
| Kotlin / Java | ktlint + detekt | ktlint, detekt |
| C++ | clang-format LLVM-style + `.clang-tidy` | clang-format, clang-tidy |

### 22.2 Threading Rules (Cardinal)

- **UI thread:** never block. Anything > 4 ms moves to a worker.
- **Runtime thread:** sole owner of runtime state — no native code mutates it directly.
- **Bridge calls:** no synchronous waits in render paths.
- **Native modules:** declare a queue; never dispatch unbounded fan-out.

### 22.3 Logging Idioms

```ts
// Use scoped loggers; no top-level console.* in framework code
const log = Log.scope("packageName.subarea");
log.info("starting");
log.error("failed", { reason }, err);
```

- Don't log PII or tokens.
- Use structured fields, not interpolated strings, for fields that may be searched.

### 22.4 Error Idioms

- All public async APIs `throw` or `reject` with a typed error class deriving from `FrameworkError`.
- Errors carry: `code` (stable string), `message` (human-readable), `cause` (chain).
- Native errors crossing the bridge are converted to the same shape.

```ts
class CameraError extends FrameworkError {
  constructor(code: "PERMISSION_DENIED" | "HARDWARE_BUSY", message: string, cause?: unknown) {
    super(`camera.${code}`, message, cause);
  }
}
```

### 22.5 Naming Idioms

| Concept | Convention | Example |
|---------|------------|---------|
| Async method | verb + noun | `loadProfile`, `sendMessage` |
| Boolean | `is` / `has` / `can` prefix | `isVisible`, `hasPermission` |
| Event handler | `on` + past-tense | `onScreenViewed`, `onPermissionGranted` |
| Internal-only function | `_` prefix or `internal/` folder | `_dispatchInternal` |
| Module name on bridge | PascalCase, no suffix | `Camera` not `CameraModule` |

### 22.6 Testing Idioms

- One assertion per `it` block where practical; otherwise grouped with descriptive title.
- Avoid mocks for trivial helpers.
- Mocks live next to the package they substitute, not in a global `mocks/` folder.
- Use `waitForIdle()` / `act()` rather than `sleep()`.

### 22.7 Documentation Idioms

- Every exported symbol has a doc-comment ending with an `@example` block.
- Markdown changelog entries grouped by `Added / Changed / Fixed / Deprecated / Removed / Security`.
- "Why" lives in code comments and ADRs; "what" lives in API docs.

### 22.8 Pull-Request Idioms

- Title prefix indicates scope: `[runtime]`, `[renderer]`, `[ios]`, etc.
- PR description follows the template:
  - **What** — one-paragraph summary
  - **Why** — motivation + ticket link
  - **How** — high-level implementation outline
  - **Testing** — what was run / added
  - **Risk** — perf, ABI, OTA, breakage
- Single concern per PR; unrelated cleanups → separate PR.

### 22.9 Decision Records

Architectural Decision Records (ADRs) live under `docs/adrs/{NNN}-{title}.md` using the {{e.g., MADR / Nygard}} format. Any change touching:
- Cross-package public API,
- Threading model,
- Bridge wire format,
- Build-system inputs,

requires a linked ADR.

### 22.10 Issue and Triage Idioms

- Bugs labelled `area:*`, `severity:*`, `affects:*`.
- Repro template required; auto-closed if not provided after 7 days.
- Performance regressions ≥ `{{n}}`% on the perf suite are P0.
