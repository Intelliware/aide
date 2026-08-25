# Per-skill customizations — Layer 5

This directory holds Layer 5 of the four-layer config model: per-skill team
overrides (`<skill-name>.toml`, committed) and personal per-skill overrides
(`<skill-name>.user.toml`, gitignored).

## Files in this directory

| File | Purpose |
|---|---|
| `example-skill.toml.example` | Comprehensive merge-behaviour reference using a hypothetical `bmad-create-prd` skill — demonstrates scalar override, array-of-tables merge by `code`, `_suppress`, and array-of-scalars replacement. Read this first. |
| `create-requirements-package.toml.example` | Realistic example: a stage-driver skill where the team pins the brownfield composition by default, deepens elicitation, suppresses the optional `competitive-analysis` artifact, and adds a custom block. |
| `analyze-repository.toml.example` | Realistic example: a dispatcher skill where the team tunes classification thresholds, pins a default domain for ambiguous monorepo cases, and lengthens the diagnostic scan budget. |
| `review-implementation-package.toml.example` | Realistic example: a review skill where the team turns on stricter coverage gates, requires a second reviewer for high-risk increments, and adds a project-specific lens. |
| `create-quality-package.toml.example` | Realistic example for the quality-stage driver: opts the team into the TC-XXX per-test-case increment flow, pins NFR floors and a BDD-first technology stack, and requires the KB reuse-analysis cross-check before any new test case is authored. |
| `execute-quality-increments.toml.example` | Realistic example for the optional per-test-case (TC-XXX) executor: locks the implementation stack, defines per-TC exit gates (tests-green / lint-clean / smoke-test / tracker-updated), and pins the artifact catalogue. |
| `audit-quality-coverage.toml.example` | Realistic example for the read-only coverage audit: sets per-category coverage floors, manages an intentionally-untested allowlist with justifications, and configures KB-tag verification. |
| `review-test-failures.toml.example` | Realistic example for the failed-run triage walk-through: appends a project-specific failure category (`intermittent-3rd-party`), pins per-category routing, and tunes severity-band keywords. |

## How files are named

Files match a skill's `name` exactly (the `name:` value from its
`SKILL.md` frontmatter — also the first column of
`.agents/skills/_registry/skills.csv`). The `customize-framework` skill writes
files for you, but if hand-authoring:

- Team file: `<skill-name>.toml` (committed)
- Personal file: `<skill-name>.user.toml` (gitignored)

A typo in the filename produces a silent no-op — the loader matches by
exact filename and ignores any file that does not correspond to a known
skill. Run `python3 scripts/build-registry.py --dry-run` to check skill
names.

## Precedence

Within Layer 5, personal beats team; both are higher than every project
or framework layer. **Presets** (reusable customization bundles) sit
between Layers 4 and 5:

```
framework.toml → framework.user.toml → project.toml → project.user.toml
  → [PRESETS: in order from presets.toml, enabled only]
    → customizations/<skill>.toml → customizations/<skill>.user.toml
```

Project-local customizations in this directory **always override** preset
values. This ensures teams can adopt presets while retaining fine-grained
control over specific behaviors.

Merge semantics (scalar override, table recursive-merge, array-of-tables
merge by `code`/`id`, array-of-scalars replace) are the same at every
layer. See `config/SCHEMAS.md` § 1.3.

## When to author a customization here vs. higher up

| Use case | Right layer |
|---|---|
| "On every project on my machine, I want elicitation depth = deep." | `framework.user.toml` (Layer 2) |
| "On *this* project, the team always uses the brownfield composition." | `project.toml` (Layer 3) |
| "On *this* project, I personally want to skip the competitive-analysis question." | `project.user.toml` (Layer 4) |
| "On *every* project, the `analyze-repository` classification needs a higher confidence threshold than the framework default." | `customizations/analyze-repository.toml` (Layer 5) |
| "Just on my machine, the `analyze-repository` skill should default to `web-app` for monorepos." | `customizations/analyze-repository.user.toml` (Layer 5 personal) |

If the customization is not skill-specific, prefer a project-level layer.
Layer 5 is the right home only when the override is intrinsic to the
skill's behaviour and applies across every project that runs it.

## How `customize-framework` interacts with this directory

The `customize-framework` skill writes to this directory (or to the
project-layer files) interactively. It will:

1. Detect which skill you want to customize (from a list).
2. Detect which scope (team file vs. personal file).
3. Walk you through the merge operation (override / append / replace /
   suppress / recursive-merge) one field at a time.
4. Preview the rendered TOML and the predicted merged result before
   writing.
5. Add the personal file to `.gitignore` if it is not already there.

You should rarely need to hand-edit Layer 5 files; the skill is the
intended authoring surface. The `.example` files in this directory are
**read-only references** for the skill to anchor on and for
hand-authors who prefer to write TOML directly.

## Hooks

Customization files can include `[[hooks]]` to chain skills automatically.
Hooks fire before or after the customized skill runs. See
`config/SCHEMAS.md` § 2.5.1 for the schema and
`references/orientation/hook-runtime.md` for the execution contract.

Example:
```toml
# In customizations/create-requirements-package.toml

[[hooks]]
code = "kb-context-load"
event = "before"
skill = "navigate-knowledge-base"
condition = "project.paths.knowledge_base_path != ''"
```

Use `customize-framework` with operation `add-hook` or `suppress-hook`
to manage hooks interactively.

## Presets

Presets are reusable bundles of customization files. They ship in add-on
repos or local `presets/` directories and are registered in
`{project-root}/presets.toml`. See `config/SCHEMAS.md` § 2.10–2.11.

Use `manage-presets` to discover, install, enable/disable, and inspect
presets. Customizations in this directory always override preset values,
so you can adopt a preset as a baseline and override specific behaviors
locally.
