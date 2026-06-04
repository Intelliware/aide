---
slug: configuration-and-profiles
title: "Configuration and Profiles"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Configuration and Profiles

Document every knob the suite exposes: runner config files, environment-selection profiles, feature flags, retry policies, timeout defaults, browser / driver options, secret-handling, and how environment variables override config. The reader needs to know what changes when they flip a profile and what the safe defaults are.

Be explicit about secret handling. Test suites are notorious for leaking credentials into git via "temporary" config commits — call out the secret source-of-truth (vault, env var, CI secret store), the local-development workaround, and the rule against checking secrets in.

### Suggested template content

**Config files:**

| File | Owns | When to edit |
|---|---|---|
| `{{config-file-1}}` | {{owns-1 — e.g. "runner defaults: workers, retries, timeout"}} | {{when-1}} |
| `{{config-file-2}}` | {{owns-2 — e.g. "browser channels, viewport, locale"}} | {{when-2}} |
| `{{config-file-3}}` | {{owns-3 — e.g. "per-environment URLs and seed credentials"}} | {{when-3}} |

**Profiles / environments:**

| Profile | Target environment | Notable overrides | When to use |
|---|---|---|---|
| `{{profile-dev}}` | {{dev-url}} | {{overrides-dev}} | Local dev work |
| `{{profile-qa}}` | {{qa-url}} | {{overrides-qa}} | Default CI target |
| `{{profile-stage}}` | {{stage-url}} | {{overrides-stage}} | Pre-prod gates |
| `{{profile-prod-readonly}}` | {{prod-url}} | {{overrides-prod}} (read-only) | Smoke / synthetic |

**Override precedence (highest wins):**

1. CLI flags / `--config` overrides
2. Environment variables (`{{env-var-prefix}}_*`)
3. Profile-specific config (`{{profile-config-path}}`)
4. Base config (`{{base-config-path}}`)

**Environment variables consumed:**

| Variable | Purpose | Required for | Default |
|---|---|---|---|
| `{{env-var-1}}` | {{purpose-1}} | {{required-for-1}} | `{{default-1}}` |
| `{{env-var-2}}` | {{purpose-2}} | {{required-for-2}} | `{{default-2}}` |

**Secret handling:**

- **Source of truth:** {{secret-store — e.g. "1Password vault `test-automation`", "GitHub Actions secrets `CI_TEST_*`"}}
- **Local-dev workaround:** {{local-workaround — e.g. "`.env.local` (gitignored) populated from the vault; `pnpm run seed-env` pulls and rewrites it"}}
- **What MUST NOT be committed:** {{forbidden — e.g. "Any value of `CI_TEST_*` env vars, any file matching `*.secret.json`"}}
- **Pre-commit guard:** {{guard — e.g. "`gitleaks` hook installed via `pre-commit`"}}

**Retry policy:** {{retry-policy — e.g. "1 retry on CI, 0 retries locally; retry-on-flake is forbidden — see anti-patterns block"}}

**Default timeouts:**

| Operation | Default | Justification |
|---|---|---|
| Page navigation | `{{nav-ms}}` ms | {{rationale-1}} |
| Element interaction | `{{elem-ms}}` ms | {{rationale-2}} |
| API call | `{{api-ms}}` ms | {{rationale-3}} |

