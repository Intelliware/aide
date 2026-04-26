# Elicitation pattern: Customization

## Purpose

Drives the `customize-framework` skill end-to-end: chooses which override
layer to write into, identifies the target field path, picks the merge
operation, gathers the new value, previews the rendered TOML and the
predicted merged result, and confirms. Invoked exclusively by
`customize-framework` so users can author overrides without hand-editing
TOML — and so every authored file carries a managed-header and inline
intent comments for reviewers.

## Inputs needed from user

- Scope (which layer to write into): framework-global / project-team / project-personal / skill-specific
- For skill-specific scope: the target skill name (kebab-case, must exist in the catalog)
- Target field path within the chosen layer (dotted path or section + key)
- Operation (override scalar / merge table / append array entry / replace array / suppress entry)
- The new value(s)
- Intent comment (the "why" recorded inline)
- Confirmation of the merge preview

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Pick the override scope.**
   - **Format:** multiple-choice
   - **Options:**
     - `framework-global` (rare — writes to `framework.user.toml`; affects every project on this machine)
     - `project-team` (most common — writes to `{project-root}/project.toml`; team-wide)
     - `project-personal` (writes to `{project-root}/project.user.toml`; only for you)
     - `skill-specific-team` (writes to `{project-root}/customizations/<skill-name>.toml`; per-skill, team-wide)
     - `skill-specific-personal` (writes to `{project-root}/customizations/<skill-name>.user.toml`; per-skill, only for you)
   - **Validation:** `project.toml` must exist for any project-scoped layer; suggest `start-project` first if missing
   - **Maps to:** `customization.scope` (drives output file path)

2. **For skill-specific scope: which skill?**
   - **Format:** free-text with autocomplete from the skill catalog
   - **Validation:** must exist in `.agents/skills/_registry/skills.csv` (re-prompt on miss)
   - **Maps to:** `customization.target_skill`

3. **What field path inside the layer do you want to change?** (e.g. `project.elicitation.testing_strategy`, `[[project.repos]] code = "api-orders" path`, `requirements.max_user_stories`)
   - **Format:** structured-path with completion against the current effective config
   - **Validation:** path resolves against the schema for the chosen layer (re-prompt on miss; offer near-matches)
   - **Maps to:** `customization.target_path`

4. **Pick the operation.**
   - **Format:** multiple-choice
   - **Options:**
     - `override` (scalar replacement — change a single value)
     - `merge` (recursive table merge — set/update fields inside a table without disturbing siblings)
     - `append` (add an entry to an array-of-tables — requires the entry to have a unique `code`/`id`)
     - `replace-array` (REPLACE a plain array of scalars — note: this is the only array-of-scalar semantics; merging is not supported)
     - `suppress` (drop a base entry — requires the array-of-tables `code`/`id` of the entry to suppress; emits `_suppress = true`)
   - **Validation:** the operation must be valid for the field type at the path (e.g. `suppress` only works on array-of-tables entries with a `code`/`id`; `replace-array` only on plain arrays)
   - **Maps to:** `customization.operation`

5. **Gather the new value.**
   - **Format:** matches the target type — scalar / table / array-entry
   - **Validation:** type-checked against the schema; enums validated; regex-validated where the schema declares one
   - **Maps to:** `customization.new_value`

6. **Why is this override being authored?** (one sentence — recorded inline as a comment so reviewers see intent)
   - **Format:** free-text
   - **Validation:** non-empty; <=240 chars
   - **Maps to:** `customization.intent_comment`

7. **Preview the rendered TOML and the predicted merged result.**
   - **Format:** echo only — show the user the file fragment that will be written + the simulated merged config
   - **Validation:** user must confirm or amend; `amend` returns to question 5
   - **Maps to:** drives whether the skill writes the file

8. **Confirm: write the override file?**
   - **Format:** yes/no
   - **Validation:** `no` aborts the skill cleanly without writing
   - **Maps to:** drives the write step

**Wrap-up:** Confirm the answers in summary form before proceeding. Restate the chosen scope, target file path, target field path, operation, new value, and intent comment. Show the rendered TOML one final time. Get explicit yes/no before writing.

## Output format

Answers drive the file written by `customize-framework`. The file path is determined by `customization.scope`. The file contents include a managed-header, the override itself, and an inline `# intent: ...` comment.

```toml
# Managed by .agents/skills/meta/customize-framework.
# Override layer: project-team. Schema: config/project.toml.example.
# Edit via the skill or by hand; both are supported.

[project.elicitation]
# intent: Switch testing posture for FY26 audit; team agreed on 2026-04-15.
testing_strategy = "tdd-required"
```

For an array-of-tables suppression:

```toml
# Managed by .agents/skills/meta/customize-framework.
# Override layer: skill-specific-team. Schema: config/customizations/example-skill.toml.example.

[[skill.create-requirements-package.gates]]
# intent: Drop the legacy "PRFAQ-required" gate; supplanted by business-objectives elicitation.
code = "prfaq-required"
_suppress = true
```

## Validation rules

- `framework.toml` is installer-managed — never write to it. Framework-global scope must write to `framework.user.toml`.
- `_suppress = true` is meaningful only inside an array-of-tables merged by `code`/`id`. Reject on scalars and plain tables.
- Plain arrays REPLACE; only `code`/`id`-keyed arrays of tables merge. Warn if the user picks `append` on a plain array (offer `replace-array` instead).
- For skill-specific scope, the target skill must exist in `.agents/skills/_registry/skills.csv` — re-prompt on miss.
- For project scopes, `project.toml` must already exist; suggest `start-project` if not.
- `*.user.toml` files appear in `.gitignore` (the skill patches if missing) so personal overrides never leak to the team.
- The merge-preview step is mandatory; the skill cannot write without it.

## Reusable across

- `customize-framework` (entire workflow — steps 01 through 05)
