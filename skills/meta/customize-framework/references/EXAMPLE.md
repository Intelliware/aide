# Example — customize-framework

## Trigger phrase

> "I want our team's PRDs to top out at 25 user stories instead of the
> default 50, and I want to drop the 'competitive-positioning' section
> entirely. Customize that for our project."

## What the skill did

### Step 1 — pick-scope

Asked: "Where should this apply?"
- framework-global (rare; affects every project on this machine)
- project-team (most common; affects this project for everyone)
- project-personal (just you)
- skill-specific (a single skill on this project)

User chose `skill-specific`, then `is_personal = false` (team scope).

### Step 2 — pick-target

Listed skills in the catalog (globbed `skills/**/SKILL.md`). User
picked `create-requirements-package`. The skill confirmed the
folder exists at
`/Users/mike/work/acme-checkout/skills/requirements/create-requirements-package/`
and that the override file path will be
`{project-root}/customizations/create-requirements-package.toml`.

The skill then surfaced the *current* applicable values for that
skill (read from the merged config) and offered "what do you want
to change?" The user named:

1. `max_user_stories` → 25 (override scalar)
2. `required_sections` → drop `competitive-positioning` (suppress)

### Step 3 — pick-operation

Two operations queued:

- Operation A: `override` — `target_path = max_user_stories`, type
  = scalar integer.
- Operation B: `suppress` — `target_path = required_sections`,
  `key_field = code = "competitive-positioning"`.

The skill explained the merge semantics aloud: "scalars override
the lower layer; the suppression marker drops the matching base
entry from the merged result. See `config/SCHEMAS.md` § 1.4."

### Step 4 — author-override

Rendered preview:

```toml
# Managed by skills/meta/customize-framework.
# Override layer: customizations/create-requirements-package.toml
# Schema: config/customizations/example-skill.toml.example

# Shorter PRDs for marketplace tier — set 2026-04-25 by Mike.
max_user_stories = 25

# Drop the framework-default competitive-positioning section.
# To re-introduce, re-declare WITHOUT _suppress in a higher layer.
[[required_sections]]
code = "competitive-positioning"
_suppress = true
```

Showed predicted merged result for `required_sections`:

```
Lower layers contributed: executive-summary, requirements-summary,
                          competitive-positioning, scope-and-goals,
                          out-of-scope
After this override:      executive-summary, requirements-summary,
                          scope-and-goals, out-of-scope
```

User confirmed.

### Step 5 — verify-merge

Wrote
`{project-root}/customizations/create-requirements-package.toml`,
re-read it, simulated the full merge:

```
max_user_stories
Layer                                         Value
--------------------------------------------  -----
framework                                     50
this override (customizations/<skill>.toml)   25       ← winning
EFFECTIVE                                     25

required_sections (after suppression)
  - executive-summary
  - requirements-summary
  - scope-and-goals
  - out-of-scope
  (competitive-positioning suppressed at customizations/<skill>.toml)
```

Ended with: "Override active. Next time you run
`create-requirements-package`, you'll see the new max-stories cap
and the dropped section."

## Hand-off

`customize-framework` is a tail action. The user's natural next step
is to invoke `create-requirements-package` and watch the override
take effect. No automatic handoff.

## Hypothetical second-pass

If the user later says "actually, bring `competitive-positioning`
back personally on my machine", the skill writes
`{project-root}/customizations/create-requirements-package.user.toml`:

```toml
# Re-introduce competitive-positioning for personal use.
[[required_sections]]
code = "competitive-positioning"
title = "Competitive Positioning"
```

Because the personal layer is higher precedence than the team layer,
re-declaring without `_suppress` brings the entry back — but only on
this user's machine, leaving the team-wide suppression intact.
