---
slug: deprecation-policy
title: "Deprecation Policy"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 210
---

## 11. Deprecation Policy

<!-- The contract for changing or removing public surface. Embedders need
to know how much warning they get and how to plan migrations. -->

### 11.1 What Counts as a Breaking Change

- Removing or renaming an SDK method, Web Component attribute/slot/event, postMessage method, REST endpoint, or theme token.
- Changing a required field's type, required-ness, or accepted enum values.
- Changing observable runtime behavior in a way the docs previously contradicted.
- Tightening browser baseline (dropping a previously supported version).
- Changing minimum required host configuration (CSP, HTTPS, etc.) in a way that requires embedder action.

### 11.2 What Is NOT a Breaking Change

- Adding a new method, attribute, slot, event, REST endpoint, or token.
- Adding a new optional field to an event or response payload.
- Bug fixes that bring behavior in line with documented contract.
- Performance improvements that don't change observable behavior.
- Internal refactors, even visible in DevTools, as long as the public contract holds.

### 11.3 Deprecation Lifecycle

```
   announce          available        scheduled            removed
   in MINOR          + warning        for next MAJOR
      ●─────────────────●──────────────────●───────────────────●
      │                 │                  │                   │
      │                 ├── runtime warns  │                   │
      │                 ├── docs marked    │                   │
      │                 │   "deprecated"   │                   │
      │                 │                  │                   │
      └─ at least {{N}} months ────────────┘                   │
                                                               │
                            └─ next MAJOR release ─────────────┘
```

- **Minimum deprecation window:** [e.g., "Two minors OR {{n}} months, whichever is longer, before a removal MAY land in the next major."]
- **Removal happens only at a major version bump.**

### 11.4 Communication Channels

| Channel | What lands here | Cadence |
|---------|------------------|---------|
| Release notes | Every minor + patch | per release |
| `_deprecated` console warnings | At runtime when deprecated APIs are used | continuous |
| Email to registered embedders | Major version preview, breaking-change notices | at least {{n}} months ahead of major |
| Status page / changelog page | All public deprecations | continuous |
| Migration guide | Per-major upgrade doc with codemods | with each major |

### 11.5 Deprecation Markers

- **In code:** `@deprecated` JSDoc tag with `@since` and `@removeIn`.
- **At runtime:** a single console warning per deprecated API per page load (`[{{prefix}}] Deprecated: …`). Suppress via `sdk.init({ silenceDeprecationWarnings: true })` if needed for production logs.
- **In docs:** a yellow "Deprecated since v{{n}}" callout linking to the replacement.

### 11.6 Emergency Breaking Changes

- **Security:** if a vulnerability requires a breaking change, we publish a fix in a patch and a CVE on the same day. We notify registered embedders via email and the status page.
- **Legal / compliance:** rare; same notification path as security.
- **Browser-mandated:** when a browser change forces a behavior shift, we ship a compatibility shim for at least one major where feasible.

### 11.7 Embedder Recourse

- Lock to a major version (see version-compatibility) — minors and patches in that major won't break you.
- Subscribe to the embedder mailing list at [e.g., "embedder-news@{{embed-host}}"].
- File a "deprecation hardship" ticket if the migration window is genuinely insufficient — we evaluate case-by-case.

### 11.8 Currently Deprecated Surface

| API | Deprecated since | Scheduled removal | Replacement |
|-----|------------------|-------------------|-------------|
| `sdk.legacyMethod()` | v3.2 | v4.0 | `sdk.method()` |
| postMessage `setSelection` | v3.4 | v4.0 | `select` (typed envelope) |
| Theme token `--{{prefix}}-old-color` | v3.0 | v4.0 | `--{{prefix}}-color-brand` |
| [API] | [version] | [target] | [replacement] |
