---
slug: auth-and-environment-entry
title: "Authentication and Environment Entry"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, security-reviewer]
optional: false
order-hint: 200
---

## 10. Authentication and Environment Entry

How does a scenario become an authenticated user / merchant / admin inside the suite? Document every login path the suite supports (UI login, API token, pre-seeded session, OAuth, SSO), the cost of each (slow UI form vs. cheap token reuse), and the standard pattern new scenarios should use.

This block is the single biggest contributor to suite runtime when done wrong — UI-driven login per scenario is the most common mistake. Spell out the cheap path and forbid the slow one in CI.

### Suggested template content

**Authentication paths supported:**

| Path | Mechanism | Cost (typical) | Use when | Helper |
|---|---|---|---|---|
| API-token reuse (preferred) | `{{token-mechanism}}` | <50 ms | Default for any authenticated scenario | `{{api-token-helper}}` |
| Pre-seeded session restore | `{{session-mechanism}}` | <100 ms | Scenarios needing cookie / localStorage state | `{{session-helper}}` |
| UI login | Form submission against `/login` | 2-5 s | ONLY when testing the login flow itself | `{{ui-login-helper}}` |
| OAuth / SSO | `{{oauth-mechanism}}` | varies | Scenarios specifically validating SSO | `{{sso-helper}}` |

**Standard pattern for new scenarios:**

```{{lang}}
// In a fixture / hook:
{{example-snippet — e.g. "const merchant = await auth.asMerchant({ tier: 'premium' });"}}
```

This routes through `{{api-token-helper}}`, which:

1. Looks up or creates the test user via the application's admin API.
2. Issues a token via `{{token-endpoint}}` and caches it per worker.
3. Returns a typed `{{user-type}}` ready to call domain helpers.

**Forbidden patterns in CI:**

- Driving the login form per scenario unless the scenario is testing login itself.
- Hardcoding credentials in any spec / step-def / page-object — always go through `{{api-token-helper}}` or `{{secret-helper}}`.
- Sharing an authenticated session across scenarios that mutate state — produces flakes.

**Environment-entry contract:**

| Step | Owner | What happens |
|---|---|---|
| 1. Environment ready | DevOps | Target environment up; seed data present (see fixtures block) |
| 2. Suite spin-up | Runner | Reads profile, resolves base URL, validates auth credentials are present |
| 3. Per-worker auth warm-up | Suite hooks | `{{warm-up-helper}}` issues / caches admin token, sanity-checks API |
| 4. Per-scenario auth | Scenario fixture | Calls into `{{api-token-helper}}` for the user-type needed |

**Auth credential rotation:**

- **Cadence:** {{cadence — e.g. "Test API keys rotated every 90 days"}}
- **Process:** {{process — e.g. "`{{rotate-script}}` rotates and re-seeds the vault; CI picks up automatically on next run"}}
- **Failure mode:** {{failure — e.g. "If `{{api-token-helper}}` reports 401 during warm-up, suite fails fast with a `CREDENTIAL_EXPIRED` exit code and runs no scenarios"}}

