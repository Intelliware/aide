---
slug: plugin-extension-system
title: "Plugin / Extension System"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 200
---

## 10. Plugin / Extension System

Document how third-party (or first-party) plugins extend the framework: registration API, lifecycle hooks, allowed extension points, isolation/safety guarantees, and load ordering. The plugin system is the contract between the framework's core and its ecosystem — it must be specified precisely so plugin authors don't depend on undocumented internals.

Be explicit about what plugins can NOT do (post-bootstrap mutation, cross-plugin reach, core-internal access). Read the plugin registry source and confirm that the documented extension points are the only ones — undocumented hooks become accidental ABIs and compatibility-strategy nightmares.

### Suggested template content

**Plugin contract:**

```{{lang}}
interface Plugin {
  name: string;          // unique within the app
  version: string;       // semver
  dependsOn?: string[];  // names of other plugins
  register(app: PluginContext): void | Promise<void>;
  beforeStart?(app: PluginContext): void | Promise<void>;
  afterStart?(app: PluginContext): void | Promise<void>;
  beforeShutdown?(app: PluginContext): void | Promise<void>;
}
```

**`PluginContext` (the only API a plugin may use):**

| Method | Purpose |
|---|---|
| `useMiddleware(mw, opts)` | Register middleware in the pipeline |
| `addRoute(method, path, handler)` | Register a route |
| `registerEncoder(ct, encoder)` | Add response encoder |
| `registerErrorRenderer(r)` | Add error renderer |
| `registerLogSink(sink)` | Add log sink |
| `declareConfig(schema)` | Add config keys |
| `registerService(token, factory, scope)` | Register DI service |
| `on(event, handler)` | Subscribe to lifecycle events |
| `logger` | Plugin-scoped logger |
| `config.get(key)` | Read namespaced config |

**Source files:**

- Registry: `{{path}}`
- Lifecycle dispatcher: `{{path}}`
- Plugin loader (file / npm): `{{path}}`

**Lifecycle:**

```
┌─────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐
│ register│→│ beforeStart │→│ listen() │→│afterStart│→ ... → │beforeShutdown  │
└─────────┘  └─────────────┘  └──────────┘  └──────────┘  └────────────────┘
```

- `register`: synchronous-ish (may be async); ALL extension points must be registered here.
- `beforeStart`: async; resources (DB pools, etc.) initialized here.
- `afterStart`: warm caches, run readiness probes.
- `beforeShutdown`: drain in-flight, close connections.

**Load ordering:**

1. Topological sort by `dependsOn`; cycles → bootstrap error.
2. Within a topological tier, alphabetical by `name` for determinism.
3. First-party plugins load before third-party (configurable).

**Isolation guarantees:**

- Each plugin gets a child config namespace (`plugin.<name>.*`).
- Plugins MUST use the namespaced logger; the global logger is read-only to them.
- Plugins MUST NOT reach into another plugin's exports — communicate via events.
- Plugins CANNOT modify core types, the router after bootstrap, or the DI container after `beforeStart`.

**Lifecycle events (read-only):**

| Event | When | Payload |
|---|---|---|
| `plugin:registered` | After register | `{ name, version }` |
| `app:listening` | After listen | `{ host, port }` |
| `request:start` | Per request | `{ method, path }` |
| `request:end` | Per request | `{ status, duration_ms }` |
| `app:shutdown` | Pre-shutdown | `{ reason }` |

**Error semantics:**

- Plugin throws in `register` → bootstrap fails fast; clear error.
- Plugin throws in `beforeStart` → bootstrap fails; previously-started plugins are torn down.
- Plugin throws in a middleware/handler → routed through error pipeline like any other error.

**Discovery / packaging:**

- File: `app.use(plugin)` in user bootstrap code.
- Auto-discovery: from `node_modules/{{prefix}}-*` (if enabled).
- Internal: imported from `packages/plugins/*`.

**Compatibility:**

- Plugins declare `peerDep` on `core@<range>`.
- Core enforces the range at registration; mismatched plugins fail loudly.
- See compatibility-strategy block for cross-version policy.

**Common pitfalls (plugin authors):**

- Registering middleware in `beforeStart` instead of `register` → silently no-ops (pipeline already compiled).
- Reading `core` internals via `require("framework/dist/internal/...")` — will break on every release.
- Sharing mutable state between plugins via globals.
