---
slug: pick-scope
sequence: 1
depends-on-prior: false
---

# Step 1 — Pick scope

Decide which of the four override layers receives the change. The
choice determines the file path, the schema, and whether the file is
gitignored.

## Purpose

Make the layer choice explicit. Most users default to "project-team"
without considering whether their override should be personal or
per-skill — this step surfaces the trade-off.

## Sub-steps

1. Pre-flight: confirm `{project-root}/project.toml` exists. If
   absent, abort and direct the user to `start-project`.

2. Present the four scopes with one-line summaries and example use
   cases:

   | Scope | File written | Sharing | Best for |
   |---|---|---|---|
   | `framework-global` | `<framework-root>/framework.user.toml` | personal, machine-wide | Personal preferences across every project on this machine |
   | `project-team` | `{project-root}/project.toml` | committed | Project-wide settings the whole team should adopt |
   | `project-personal` | `{project-root}/project.user.toml` | gitignored | Per-machine deviations from the team's project setup |
   | `skill-specific` | `{project-root}/customizations/<skill>.toml` or `.user.toml` | committed or gitignored | Tuning a single skill's behavior |

3. Ask which scope to use. Default suggestion: `skill-specific` when
   the user mentions a specific skill, `project-team` otherwise.

4. For `skill-specific`, ask the follow-up: "team or personal?" —
   that's the `is_personal` flag (false → `<skill>.toml`, true →
   `<skill>.user.toml`).

5. Carry the chosen scope (and `is_personal` if applicable) forward
   to step 02.

## Hard gates

- `project.toml` MUST exist before any scope is chosen.
- Scope MUST be one of the four enum values before this step exits.

## Exit criteria

- [ ] Scope confirmed.
- [ ] For `skill-specific`, `is_personal` confirmed.
- [ ] Target file path computed but not yet written.

## Next

Step 02 — pick-target.
