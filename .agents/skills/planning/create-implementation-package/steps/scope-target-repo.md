# Step 0 — Scope the target source repo

Determine the target `<repo-code>` for this skill run before any other step.
This is **only relevant when the project has adopted separation-of-duties
(SoD)** for the planning stage — otherwise this step is a no-op.

## Decision order

Resolve the scope using this priority order. **Stop at the first rule that
matches** and use the resulting `<repo-code>` for all subsequent steps.

### 1. Stage in legacy mode

If the project's `[stages.planning]` entry has neither `dir` nor
`colocate_with_source`, the planning stage is in legacy mode. **Skip this
step entirely** and resolve all paths via `[project.paths]` exactly as today.

### 2. Caller-provided scope

If the caller passed an explicit `scope` value naming a `[[project.repos]].code`,
use it. No further resolution needed.

### 3. Path signal (single-repo features)

If the upstream design artifact lives under
`<host-repo>/<artifact_subdir>/design/<repo-code>/...`, the `<repo-code>`
segment is the scope. Auto-resolve. No prompt.

### 4. Frontmatter signal (cross-cutting features)

If the upstream design artifact lives under
`<host-repo>/<artifact_subdir>/design/_cross-cutting/...`, read the artifact's
YAML frontmatter and look for `affects_repos`:

- **Exactly one entry:** pin that `<repo-code>`. No prompt.
- **More than one entry:** prompt the user — *"This is a cross-cutting feature
  affecting `{affects_repos}`. Which repo are we scoping this session to?"* —
  and use their answer. **Do not pre-fill a default.** The user must choose
  deliberately.

### 5. Legacy fallback (no path or frontmatter signal)

If the upstream artifact is from a legacy / pre-SoD project (no `_cross-cutting/`
or `<repo-code>/` directory in its path, and no `affects_repos` frontmatter),
prompt the user — *"Which source repo is this work scoped to?"* — pre-filling
with the project's `primary` repo (if any) as the suggested default.

## Interactive-only contract

This skill is designed for interactive invocation. If executed in a
non-interactive context (no TTY, scripted chain, CI), and a prompt would
otherwise fire (rules 4 or 5 above with ambiguous input), **fail fast** with
a clear error rather than blocking on an unanswerable prompt:

> **Error.** `create-implementation-package` requires interactive scope
> resolution for cross-cutting or legacy artifacts. Pass an explicit `scope`
> input naming a `[[project.repos]].code`, or invoke the skill interactively.

## Permission check (post-resolution)

Once `<repo-code>` is fixed, before any write to a planning artifact:

- Look up `[stages.planning].write_role`. If set, compare against `[user].role`
  from `project.user.toml`.
- On mismatch: **refuse the write**, surface the role mismatch as a clear
  error, and exit cleanly (no partial state).
- If either field is unset, skip the check. (When SoD fields are configured
  but `[user].role` is missing, the framework emits a one-time startup
  warning: *"SoD configured without `[user].role` — write protections
  inactive."*)

## Output

The chosen `<repo-code>` is in scope for all subsequent steps and is used by
the path resolver to determine where increment artifacts land:

- Colocate mode (recommended): `<source-repo-path>/<artifact_subdir>/implementation/<feature-id>/`
- Directory mode (variant): `<host-repo>/<artifact_subdir>/implementation/<repo-code>/<feature-id>/`
- Legacy mode: `[project.paths].implementation_package/<feature-id>/`
