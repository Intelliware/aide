---
slug: cli-and-scaffolding
title: "CLI and Scaffolding"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: true
order-hint: 250
---

## 15. CLI and Scaffolding

If the framework ships a developer CLI (project init, code generators, dev server, doctor / diagnose commands), document its commands, the templates it emits, and how the templates stay in sync with framework conventions. Mark optional — minimalist frameworks may have no CLI. Verify generated output by running every command in a clean directory and confirming the result builds.

Pay attention to template/code drift: scaffolding templates frequently lag the framework's preferred patterns. Document where templates live, who owns them, and the test that ensures generated code passes the framework's lint/test rules. Also note any `framework upgrade` migration command and what it can/can't do automatically.

### Suggested template content

**CLI entry point:**

- Binary name: `{{cli-name}}`
- Source: `{{cli-source-path}}`
- Distribution: {{distribution — e.g. "as part of `core`, available as `npx framework`"}}

**Commands:**

| Command | Purpose |
|---|---|
| `{{cli}} init <name>` | Create a new app from a starter template |
| `{{cli}} generate route <path>` | Scaffold a new route + handler + test |
| `{{cli}} generate plugin <name>` | Scaffold a plugin |
| `{{cli}} dev` | Run the dev server with watch + hot reload |
| `{{cli}} build` | Production build |
| `{{cli}} doctor` | Diagnose env / config / dep issues |
| `{{cli}} migrate <subcmd>` | DB migration commands (if applicable) |
| `{{cli}} upgrade` | Run codemods between framework major versions |

**Templates:**

- Location: `{{templates-path}}`.
- Format: {{template-format — e.g. "Mustache + EJS"}}.
- Owner: `cli` package; updated alongside framework releases.
- Validation: a CI job runs every template through `init`, then runs lint/build/test; failures block release.

**Generated structure (from `init`):**

```
my-app/
├── src/
│   ├── server.{{ext}}        # entry point: createApp().listen()
│   ├── routes/
│   ├── plugins/
│   └── config.{{ext}}
├── tests/
│   ├── integration/
│   └── unit/
├── {{config-file}}
├── package.json (or equivalent)
├── tsconfig.json (or equivalent)
└── README.md
```

**Codemods (`upgrade`):**

- Codemods live in `{{codemods-path}}`.
- Each major version ships a migration that handles known breaking changes.
- Idempotent: safe to re-run.
- Conservative: ambiguous cases produce a comment + manual-fix hint, not silent rewriting.

**Dev server (`dev`):**

- Watches: source files, config, templates.
- Hot reload: handler-level (not full process restart) where the runtime supports it.
- Diagnostics: shows compile errors inline, request log in terminal, exposes `/__dev/state` introspection endpoint.

**Doctor:**

- Checks: runtime version, package versions vs. peerDeps, config schema validation, port availability, plugin compatibility ranges.
- Output: structured (machine-readable with `--json`) + human summary.
- Exit codes: 0 OK, 1 warnings, 2 errors.

**Plugin authors:**

- Plugins can register CLI subcommands via `plugin.registerCliCommand(...)`.
- Subcommands are namespaced: `framework <plugin-name> <subcommand>`.

**Common pitfalls:**

- Templates drifting from framework idioms — caught by CI but easy to miss between releases.
- `upgrade` codemods overwriting hand-written changes — the codemod runs through git stash logic to surface conflicts.
- Running `dev` and `build` simultaneously — they share the same build cache and corrupt each other.

**Cross-references:**

- See conventions-and-idioms block for the canonical patterns templates emit.
- See compatibility-strategy block for what `upgrade` codemods cover.
