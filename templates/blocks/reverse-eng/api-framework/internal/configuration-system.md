---
slug: configuration-system
title: "Configuration System"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 180
---

## 8. Configuration System

Document how configuration is sourced, layered, validated, and consumed. Frameworks typically combine several sources (defaults → file → env → CLI flag → runtime override) with explicit precedence; the bug surface is large here so be precise. Read the config loader, then trace where every config key is consumed (`grep` for the key names) to confirm the documented layering matches reality.

Cover hot-reload behavior explicitly: which keys are reloadable, what happens to in-flight requests when config changes, and how the framework signals listeners. If hot-reload is unsupported, say so loudly to prevent operators from relying on undefined behavior.

### Suggested template content

**Sources, in precedence order (highest wins):**

| # | Source | Loaded at | Mutable at runtime? |
|---|---|---|---|
| 1 | Programmatic override (`app.config.set(...)`) | any time | yes |
| 2 | CLI flag | bootstrap | no |
| 3 | Environment variable | bootstrap | no |
| 4 | File (`{{config-file-name}}`, formats: {{formats}}) | bootstrap | watched if `--watch` |
| 5 | Plugin-provided defaults | plugin register | no |
| 6 | Framework built-in defaults | bootstrap | no |

**Config schema:**

- Defined in `{{schema-path}}` using {{schema-lib}}.
- Every key must be declared; unknown keys → bootstrap error (or warning under `--lax-config`).
- Types are coerced from string sources (env, CLI) using the schema.

**Source files:**

- Loader: `{{path}}`
- Schema: `{{path}}`
- Watcher (hot-reload): `{{path}}`
- Consumers: see `grep -rn config\\.get` across the repo.

**Resolution algorithm:**

```{{lang}}
function resolve(key: string): unknown {
  for (const layer of layersHighToLow) {
    const v = layer.get(key);
    if (v !== UNDEFINED) return validate(key, v);
  }
  throw new MissingRequiredConfigError(key);
}
```

**Naming conventions:**

- Internal key: dot-separated (`server.port`, `logging.level`).
- Env var: `{{PREFIX}}_SERVER_PORT` (uppercased, double-underscore for dot).
- CLI flag: `--server-port` (kebab-cased).

**Hot-reload:**

- Reloadable keys: tagged with `reloadable: true` in the schema. Examples: `logging.level`, `rate_limit.rpm`.
- Non-reloadable keys (require restart): `server.port`, `db.url`, anything used at bootstrap.
- File-watched changes trigger schema validation; on failure, the change is rejected and the previous value is retained.
- Listeners subscribe via `app.config.onChange(key, handler)`.

**Secrets handling:**

- Keys flagged `secret: true` in the schema are redacted in logs and error renders.
- Secret values may be sourced via `{{secret-loader-mechanism — e.g. file-reference, vault}}`.
- The framework never logs secret values, even at debug level.

**Validation timing:**

- Initial load: full schema validation; failure aborts bootstrap.
- Hot-reload: per-key validation; failed keys are rejected, others applied.

**Plugin extension:**

- `plugin.declareConfig(schema)` — add keys to the global schema.
- Plugins MUST namespace their keys: `plugin-name.<key>`.

**Programmatic API:**

```{{lang}}
const port = config.get<number>("server.port");
const port = config.require<number>("server.port"); // throws if unset
config.set("logging.level", "debug");                 // requires reloadable: true
```

**Common pitfalls:**

- Reading config at module-load time → captures defaults; should read inside handler / start hook.
- Adding a config key without updating the schema → silently always-undefined.
- Using `process.env.X` directly anywhere outside the loader — bypasses validation and precedence.
