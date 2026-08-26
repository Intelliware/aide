---
name: start-project
description: "Use when the user says \"start a new project\", \"set up A.I.D.E.\", \"bootstrap the project\", \"initialize the framework\", \"start the framework\", \"begin a new product\", \"begin a brownfield analysis\", \"start a quick fix\", or whenever the user is invoking A.I.D.E. for the first time on a repository (or wants to re-bootstrap an existing one). Single entry point that elicits flow choice, captures project super-context, writes project.toml (and optionally project.user.toml), and hands off to the first skill of the chosen flow."
---

# Start Project

## Overview

Single entry point for A.I.D.E. Detects whether a project is already bootstrapped, elicits the flow (greenfield / brownfield / quick-dev), captures the project's super-context (identity, paths, repos, optional QE/test-artifact target, glossary, elicitation answers), writes the canonical `project.toml` (committed) and optionally `project.user.toml` (gitignored), then hands off by name to the first skill of the chosen flow.

This is the only skill that creates `project.toml` from scratch — all other skills assume it already exists. Once bootstrapped, the project never re-runs this skill except to extend a multi-repo enumeration or change the default flow; for narrower edits the user invokes `customize-framework` instead.

## When to use

- The user is invoking A.I.D.E. for the first time on a repository
- The user explicitly asks to "start", "bootstrap", "initialize", or "set up" the framework
- An existing `project.toml` needs to be re-baselined (e.g. major repo restructure, new flow default)
- The user wants to add a new repo to an existing multi-repo `[[project.repos]]` enumeration

## When NOT to use

- `project.toml` already exists and the user only wants to override one field — use `customize-framework`
- The user wants to skip configuration and run a one-shot tool — direct them to the appropriate skill
- The user wants to re-run a flow that already started — direct them to the next skill in that flow's chain
- The user wants to author a per-skill override — use `customize-framework`

## Inputs

See `references/INPUTS-OUTPUTS.md`. Required:
- The current working directory (must be the intended `{project-root}`)
- A confirmed flow choice (greenfield / brownfield / quick-dev)
- Project identity (`name`, `code`, `domain`)
- For multi-repo projects: one entry per repo with `code`, `name`, `path`, `role`
- A `knowledge_base_path` (the KB lives in its own repo, almost always sibling)

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Sequenced phases. Run one step at a time. Read each `steps/<n>.md` only when about to execute it.

1. `steps/01-detect-existing.md` — check whether `project.toml` already exists; if yes, offer to extend, re-baseline, or abort. Hard gate before any further elicitation.
2. `steps/02-elicit-flow.md` — pick the flow (greenfield / brownfield / quick-dev). Defaults to `framework.toml`'s `core.default_flow` when present.
3. `steps/03-elicit-project-context.md` — `[project]`, `[project.paths]`, `[project.testing]`, `[project.glossary]`, `[project.elicitation]`. Each field is asked individually with the schema's example as the prompt's anchor.
4. `steps/04-elicit-repos.md` — only when the project is multi-repo (or when the flow is brownfield and the user confirms additional repos exist). Loops over `[[project.repos]]` entries.
5. `steps/05-write-project-toml.md` — render `project.toml` (committed) and optionally `project.user.toml` (gitignored personal preferences); pre-populate `.gitignore` for the user-layer file.
6. `steps/06-handoff.md` — invoke the first skill of the chosen flow by name.

Use elicitation prompts referenced from `references/elicitation-patterns/project-bootstrap.md`.

## Output

| Artifact | Path | Format | When |
|---|---|---|---|
| Committed project config | `{project-root}/project.toml` | TOML (schema per `config/project.toml.example`) | Always |
| Personal project config | `{project-root}/project.user.toml` | TOML (schema per `config/project.user.toml.example`) | Only when user supplies a personal override |
| `.gitignore` patch | `{project-root}/.gitignore` | line append: `project.user.toml` | Always when `project.user.toml` is written |
| Feature registry | `{project-root}/features.toml` | TOML, comment-only (schema per `config/SCHEMAS.md` § 2.8) | Only when mode = `fresh` and no artifact tree pre-exists |

The skill does NOT create `framework.toml` or `framework.user.toml` — those belong to the framework installation, not the project.

**Feature-scoped paths are the default for new projects.** A `fresh` bootstrap writes a comment-only `features.toml`, which is what makes every artifact path carry a `<feature-id>/` segment — so two features can never write over each other, and nobody has to know the option exists to get it. `features.toml` is committed; it is shared project data, unlike the personal, gitignored `[user].active_feature`.

Three deliberate limits on that default:

- **No feature is minted here, and no active feature is set.** The registry ships empty, which `config/SCHEMAS.md` § 2.8 declares legal and calls the normal post-opt-in state. The first skill that produces feature-scoped work asks for the name via its own precondition, which for `brownfield` is several skills later — `analyze-repository`, the `reverse-engineer-*` skills and `build-knowledge-base` have no active-feature precondition, because RE docs and KB components are keyed by repo-slug and domain rather than by feature. Naming a feature at bootstrap would mean inventing one for work that is not feature work, and leaving it active when the first real feature arrives.
- **`rebaseline` and `extend-repos` are excluded.** Those modes imply artifacts already on flat paths, where turning on feature scoping moves the next write and leaves everything already written behind. That is a migration, and this skill does not perform migrations.
- **Opting out is a deletion.** Remove `features.toml` and every path reverts, because presence of the file is the only signal. Say so once at handoff and move on — no question, no wait.

Existing projects are unaffected: they have no `features.toml`, they never gain one from this skill, and absence still means "behave exactly as before".

## Next skill

Determined by the flow chosen in step 2, and unaffected by whether `features.toml` was written:
- `greenfield` → `create-requirements-package`
- `brownfield` → `analyze-repository` (then onward to `build-knowledge-base` and `create-requirements-package` in brownfield mode)
- `quick-dev` → `document-quick-change`

## Common mistakes

- Re-running on top of an existing `project.toml` without checking — always run `steps/01-detect-existing.md` first.
- Asking every question in a single pass. Each phase is a discrete elicitation.
- Filling `[[project.repos]]` with a single entry for the project root — single-repo projects can omit `[[project.repos]]` entirely.
- Hard-coding paths that should use tokens. Use `{project-root}`, `{home}`, `{framework-root}` — see `config/SCHEMAS.md` § 1.5.
- Writing `framework.user.toml` from this skill. That file is owned by the framework installer; durable framework-level personal preferences go through `customize-framework` with scope `framework-global`.
- Skipping the glossary section because the project is small — even a three-term inline glossary saves later disambiguation cost.
- Setting `default_flow` and ignoring it during handoff. The handoff in step 6 must respect the just-written value.
- Forgetting to gitignore `project.user.toml` when it is written.
