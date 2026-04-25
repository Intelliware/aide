# Step 02 — State probe

Run the workspace probe and produce the state-probe dict that subsequent
steps consume. Full specification in `references/state-probe.md`; this file
is the operational checklist the navigator follows.

## Inputs

- The current working directory (`{cwd}`).
- Mode (from step 01) — both modes run the probe; goal mode uses the result
  to bias matching, catalog mode uses it for the contextual footer.

## Procedure

1. **Locate `project.toml`.** Walk upward from `{cwd}` until found, stopping
   at the user's home directory. Record `project_toml_present = true|false`
   and the resolved project root (`{project-root}`).
2. **If `project.toml` missing:** record `flow = None` and skip to step 7.
   The recommendation step will force `start-project` regardless of utterance.
3. **Parse `project.toml`.** Extract:
   - `[project].default_flow` (default to `framework.toml.[core].default_flow`,
     i.e. `"greenfield"`, if unset).
   - `[project.paths].requirements_package`,
     `[project.paths].design_package`,
     `[project.paths].implementation_package`,
     `[project.paths].knowledge_base_path`.
   - `[project.elicitation]` (the answer table — keep verbatim, the recommend
     step may probe specific keys).
4. **Resolve paths.** Apply token expansion per `config/SCHEMAS.md` § 1.5
   (`{project-root}`, `{framework-root}`, `{home}`, `{cwd}`). Defaults when
   unset:
   - `requirements_package` → `{project-root}/.framework-output/requirements`
   - `design_package` → `{project-root}/.framework-output/design`
   - `implementation_package` → `{project-root}/.framework-output/implementation`
5. **Stage-artifact existence checks.** For each resolved path, set the
   corresponding `stage_artifacts.<key>` to `true` iff the directory exists
   **and** is non-empty. Also check:
   - `{project-root}/quick-change-spec.md`
   - `{project-root}/quick-change-plan.md`
   - `{implementation_package}/INC-*/` glob (sets
     `stage_artifacts.execution_in_progress`).
6. **Knowledge-base check.** If `knowledge_base_path` is set, resolve it
   (often outside `{project-root}` — typically a sibling repo). Set:
   - `kb_built = true` iff `ARCHITECTURE.md` AND `components/` AND
     `graph.json` all exist at that path.
   - `kb_built = false` otherwise.
7. **RE-output check (brownfield).** If `flow == "brownfield"` and
   `[[project.repos]]` is non-empty, glob each repo for any
   `docs/`, `documentation/`, or `Part-A.md` / `Part-B.md` files. Set
   `re_outputs_present = true` if any are found.
8. **Inconsistency scan.** Walk the inconsistency list in
   `references/state-probe.md` § "orphan / inconsistent state". Append each
   detected inconsistency to `inconsistencies = []`.

## Output

The state-probe dict (shape in `references/state-probe.md`). Cached for the
rest of the workflow. Not written to disk.

## Performance notes

- The probe must be fast (< 100ms total). Use `os.path.exists` and bounded
  globs; do not read file contents except for `project.toml` itself.
- Cache results within the navigator invocation. Do not re-probe between
  steps 03 and 04.

## What this step does NOT do

- It does not write to `project.toml` or any other file.
- It does not invoke other skills.
- It does not modify the state-probe schema (defined in
  `references/state-probe.md`).
- It does not error out on missing fields — every check has a default or a
  graceful "absent" branch.
