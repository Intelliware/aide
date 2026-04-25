---
slug: build-and-packaging
title: "Build and Packaging"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 260
---

## 16. Build and Packaging

Document how the framework itself is built and published: build pipeline, output artifacts, package layout (ESM vs. CJS, types, source maps), and the matrix of supported runtimes. Maintainers need this to ship correctly; plugin authors need it to consume the framework correctly. Verify by inspecting the published artifact (`npm pack`, the equivalent for your ecosystem) and confirming every documented entry point resolves.

Cover the type-export story carefully — `.d.ts` ergonomics affect every consumer's editor experience. Note any tree-shaking considerations (how `sideEffects: false` is enforced, what gets dropped). For Java/Go/etc., document the build tool's specifics (Maven coordinates, Go module path, version embedding).

### Suggested template content

**Build tool:** {{tool — e.g. "tsup, esbuild, Maven, Gradle, go build"}}

**Output structure (`dist/` after build):**

```
dist/
├── index.js              # ESM entry
├── index.cjs             # CJS entry
├── index.d.ts            # Public types
├── index.d.cts           # Public types (CJS)
├── chunks/               # Code-split modules
├── plugins/              # First-party plugin entries (one subdir each)
└── package.json          # Sub-export map
```

**`package.json` exports map:**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./testing": { ... },
    "./plugins/*": { ... }
  },
  "sideEffects": false
}
```

- Subpath imports are explicit; deep imports (`framework/dist/internal/...`) are NOT public and break on every release.

**Source files:**

- Build config: `{{path}}`
- Bundler / compiler: `{{tool-config-path}}`
- Type emission: `{{path}}`
- Pre-publish checks: `{{path}}`

**Build pipeline:**

1. `clean` — remove `dist/`.
2. `typecheck` — `tsc --noEmit` (or equivalent).
3. `bundle` — emit JS for ESM + CJS targets.
4. `emit-types` — produce `.d.ts` and `.d.cts`.
5. `verify` — run `attw`/`publint` (or ecosystem equivalent) against the packed artifact.
6. `pack` — produce the publishable tarball.

**Runtime support matrix:**

| Runtime | Min version | Notes |
|---|---|---|
| Node.js | {{min-node}} | LTS only |
| Bun | {{min-bun}} | Best-effort |
| Deno | {{min-deno}} | via npm: specifiers |
| Browser | not supported | Server-side only |

**Tree shaking:**

- `sideEffects: false` package-wide.
- Side-effecting modules listed explicitly in `sideEffects: ["./dist/polyfills/*.js"]`.
- Validated by a build-time check that imports each public export and confirms minimal bundle size.

**Source maps:**

- Inline source content: NO (privacy / size).
- External `.map` files alongside `.js`.
- `sourcesContent` populated on dev builds, omitted on production publishes.

**Versioning embedded in build:**

- `package.json` `version` is the source of truth.
- Embedded into the runtime as `framework.version` for runtime introspection.
- Build refuses to publish if `git status` is dirty or tag mismatches version.

**Multi-package monorepo (if applicable):**

- Workspace tool: {{tool — pnpm/yarn/lerna/nx}}.
- Build order: `core → plugins/* → testing → cli`.
- Inter-package deps use `workspace:*` ranges; rewritten on publish.

**CI matrix:**

- Build + test on every supported runtime version.
- Verify published artifact in a fresh project (`init` → `build` → `test`).

**Plugin packaging:**

- Plugins are independent npm packages following the same structure.
- Plugin `peerDependencies` declare `core@<range>`.

**Common pitfalls:**

- Adding a new public export and forgetting the `exports` entry → import works in dev (path-resolution), fails in production.
- Importing CJS-only deps from ESM entry without proper interop → cryptic runtime errors.
- Forgetting to bump peer-dep range when changing the plugin contract.

**Cross-references:**

- See release-process block for what happens after build.
- See compatibility-strategy block for export-stability guarantees.
