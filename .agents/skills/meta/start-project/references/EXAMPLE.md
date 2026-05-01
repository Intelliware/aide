# Example — start-project

## Trigger phrase

> "Set up A.I.D.E. for our checkout platform. We have three repos —
> orders, billing, web — and a sibling KB repo. We're brownfield."

## What the skill did

### Step 1 — detect-existing

Looked at `{cwd}` (`/Users/mike/work/acme-checkout`). No `project.toml`
present. Greenlit a fresh bootstrap.

### Step 2 — elicit-flow

Asked: "Greenfield (new product), brownfield (existing code, reverse
engineer first), or quick-dev (single small change)?"
User answered: `brownfield`. Skill remembered this for handoff and as
the value of `project.default_flow`.

### Step 3 — elicit-project-context

Asked individually:
- `name`: "Acme Checkout Platform"
- `code`: "acme-checkout" (validated against `^[a-z][a-z0-9-]*$`)
- `domain`: "B2B SaaS checkout, billing, and refunds for marketplace merchants"
- `description`: a multi-paragraph blurb
- `paths.knowledge_base_path`: `{project-root}/../knowledge-base-repo`
- (other path fields accepted at default `{project-root}/.framework-output/...`)
- glossary: three inline entries (`Order`, `Refund`, `Settlement`) plus
  one reference path
- elicitation answers: `compliance_regime = "pci-dss"`,
  `team_size = "10-25"`, `user_facing = true`,
  `deployment_model = "saas-multi-tenant"` (others accepted as
  framework defaults)

### Step 4 — elicit-repos

User confirmed three repos. Skill looped:

| code | name | path | role | type | primary |
|---|---|---|---|---|---|
| `api-orders` | Orders Service | `{project-root}/../api-orders` | `api` | `node-typescript-nest` | true |
| `api-billing` | Billing Service | `{project-root}/../api-billing` | `api` | `dotnet-8-aspnet` | — |
| `web-portal` | Merchant Web Portal | `{project-root}/../web-portal` | `ui` | `react-vite-typescript` | — |

Validated: unique `code`s, one `primary = true`, all `role` values
within the allowed enum.

### Step 5 — write-project-toml

Wrote `{project-root}/project.toml` matching the sample at
`config/project.toml.example` byte-for-byte minus the comment block at
the top (replaced with a brief "managed by start-project" comment).

User declined to write `project.user.toml`, so step 5 left
`.gitignore` untouched.

### Step 6 — handoff

Said: "Project bootstrapped. Default flow is brownfield. Handing off to
`analyze-repository` now — pick which of the three repos to start with."

## Hand-off

> "Bootstrap complete. `project.toml` written, three repos enumerated,
> default flow brownfield. Next: `analyze-repository`. Suggested first
> target: the primary repo, `api-orders`."

## Hypothetical re-run

If the user later reruns "start the framework", step 1 detects the
existing `project.toml` and asks:

1. "Add a new repo to `[[project.repos]]`?" — loops step 4 only
2. "Re-baseline (overwrite) the whole file?" — loops every step
3. "Just open `customize-framework` instead?" — exits and hands off

That branch is the only legitimate way to mutate `project.toml`
post-bootstrap besides `customize-framework`'s targeted overrides.
