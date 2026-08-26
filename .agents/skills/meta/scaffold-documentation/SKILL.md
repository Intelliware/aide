---
name: scaffold-documentation
description: "Use when the user says \"scaffold the docs\", \"set up the doc structure\", \"propose the file structure\", \"create the documentation skeleton\", or after completing an inventory/discovery phase and needing to organize findings into a file structure before extraction or authoring begins. Cross-stage utility — works for RE, requirements, design, and KB packages. Enforces the \"structure before content\" principle."
---

# Scaffold Documentation

## Overview

Cross-stage utility that creates the documentation file structure (directories, file names, section headers, placeholder markers) before any content is extracted or authored. Enforces the framework's core principle: structure before content. The user reviews and approves the structure first; content fills in afterwards.

Promoted from RE-internal in the legacy framework. The same skill is also folded as `steps/scaffold.md` inside each `reverse-engineer-*` skill so RE flows can call it inline; this meta version is invoked when the caller is requirements / design / KB / quick-dev or any other non-RE context.

## When to use

- After inventory or discovery — you know the artifacts, you need a home for each
- Before any extraction or authoring — locking the structure prevents AI from inventing content
- When a new package type is being created and its file layout is being negotiated
- When restructuring an existing package — propose new structure, then migrate

## When NOT to use

- The package already exists with a stable structure — don't re-scaffold
- Content is already drafted and you want to assemble it — different job; assemble manually
- For RE workflows that explicitly call `steps/scaffold.md` — that step already covers it
- Inventory/discovery hasn't happened yet — scaffolding without inventory invents categories

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Gather inventory** — read `extraction-status.md` (RE), the requirements file-relevance recommendation, the design template, or the user's list of artifacts.
2. **Identify package type and template** — pick the matching template from `templates/compositions/<slug>.yaml` and load its block list, its `default-output-path`, and its `default-output-shape` (defaults to `tree` for RE compositions).
3. **Propose file structure** — generate the directory tree with file names, section headers from the template, mapping of inventory items to sections, and recommended fill order. **The directory and file names MUST match the composition's `default-output-path` and the per-block naming rule (`<NN>-<bare-slug>.md`); do not invent names.** For RE compositions specifically, scaffold under the canonical RE location (`<source-repo-path>/docs/<re-domain>-internal/` for Part A, `<knowledge_base_path>/source-docs/<repo-slug>/<re-domain>-consumer/` for Part B), not at any project-side path.
4. **Approval gate** — present the proposal as a tree. Do NOT create files yet. Wait for explicit user approval.
5. **Create the files** — make all directories; create each file with header, section headers, and `<!-- TODO: extract from <source> -->` placeholders. Initialize `CHANGE-TRACKER.md` from the canonical change-log block at `templates/blocks/shared/change-log.md`.
6. **Confirm readiness** — summarize files created, suggest the first section to fill, and emit the trigger phrase for the next skill (the matching authoring or extraction skill).

## Output

See `references/INPUTS-OUTPUTS.md`. A directory tree of empty-but-structured `.md` files plus an initialized change tracker.

## Next skill

The matching authoring skill for the package type:
- `create-requirements-package` — for requirements
- `create-design-package` — for design
- `create-implementation-package` — for planning
- `reverse-engineer-*` — for RE (but RE uses the inline `steps/scaffold.md` instead)
- `build-knowledge-base` — for KB

## Common mistakes

- Creating files before user approval — the approval gate is the whole point
- Scaffolding without an inventory — the structure should map 1:1 to known artifacts
- Filling in any content during scaffolding — show structure and headers ONLY
- Skipping the change-tracker initialization — every package needs one from day zero
- Using a one-size-fits-all structure — pick the right composition template per package type
