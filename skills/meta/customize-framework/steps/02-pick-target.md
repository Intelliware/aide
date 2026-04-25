---
slug: pick-target
sequence: 2
depends-on-prior: true
---

# Step 2 — Pick target

Identify what is being overridden — for `skill-specific`, which skill;
for the other scopes, which section/path of the merged config.

## Purpose

Bind the override to a concrete TOML path so step 03 can show only
the operations that are valid at that path (you cannot suppress a
scalar; you cannot override an array-of-tables wholesale via the
scalar operation; etc.).

## Sub-steps

### Sub-step 2A — for `skill-specific` scope

1. List skills in the catalog. Source preference (highest first):
   - `skills/_registry/skills.csv` — read directly if present
   - Fallback: glob `skills/**/SKILL.md` and parse the `name:` field
     from each frontmatter
2. Present the catalog grouped by stage. Ask the user to pick one.
3. Validate the chosen `target_skill` matches an existing skill
   folder. Re-prompt on miss (no fuzzy match — kebab-case exactness
   matters because the filename uses it).
4. Read the skill's SKILL.md and any per-skill defaults already
   declared in `customizations/<skill>.toml*`. Surface a short list
   of "currently overrideable settings" so the user can see what is
   already a known setting versus a new one they're inventing.
5. Ask: which setting (TOML dotted-path) inside that skill's
   namespace should be overridden? Free-form input. The skill
   echoes it back to confirm. Examples:
   - `max_user_stories`
   - `output.line_length`
   - `required_sections` (when authoring an array operation)
   - `elicitation.depth`
6. The full `target_path` for write is then
   `customizations/<skill>.toml` keyed at the user-supplied path
   inside that file (step 04 handles the rendering).

### Sub-step 2B — for other scopes

1. Show the merged config tree for the chosen layer (the schema's
   top-level sections plus any subsections already populated).
2. Ask: which dotted-path inside the layer should be overridden?
   Examples by layer:
   - framework-global: `core.output_language`, `user.skill_level`,
     `stages.requirements.elicitation.persona`
   - project-team: `project.default_flow`,
     `project.elicitation.compliance_regime`,
     `project.paths.knowledge_base_path`
   - project-personal: `project.default_flow`,
     `project.paths.knowledge_base_path`,
     `project.elicitation.<code>`
3. Confirm the path resolves to a known schema location. Unknown
   paths are tolerated (forward-compat) but flagged with a warning.

## Hard gates

- For skill-specific: `target_skill` MUST resolve to an existing
  skill folder before this step exits.
- The dotted-path being overridden MUST be syntactically valid TOML
  (no spaces, no array indices in non-array slots).

## Exit criteria

- [ ] Target file path locked (e.g. `customizations/create-requirements-package.toml`).
- [ ] Target dotted-path inside that file locked.
- [ ] Current value at that path (if any) surfaced to the user.

## Next

Step 03 — pick-operation.
