# Step 0 — Scope the target source repo

Determine the target `<repo-code>` for this skill run before loading any
increment. This is **only relevant when the project has adopted
separation-of-duties (SoD)** for the execution stage — otherwise this step
is a no-op.

## Decision order

Resolve the scope using this priority order. **Stop at the first rule that
matches** and use the resulting `<repo-code>` for all subsequent steps.

### 1. Stage in legacy mode

If the project's `[stages.execution]` entry has neither `dir` nor
`colocate_with_source`, the execution stage is in legacy mode. **Skip this
step entirely** and resolve all paths via `[project.paths]` exactly as today.

### 2. Caller-provided scope

If the caller passed an explicit `scope` value naming a `[[project.repos]].code`,
use it. No further resolution needed.

### 3. Path signal (single-repo features)

If the implementation package was authored under
`<host-repo>/<artifact_subdir>/implementation/<repo-code>/<feature-id>/...`
(directory-mode planning) or under
`<source-repo-path>/<artifact_subdir>/implementation/<feature-id>/...`
(colocate-mode planning), the `<repo-code>` is implicit from the path itself.
Auto-resolve. No prompt.

### 4. Frontmatter signal (cross-cutting features)

If the upstream design artifact (the source of truth for `affects_repos`)
lives under `<host-repo>/<artifact_subdir>/design/_cross-cutting/...`, read
its YAML frontmatter and look for `affects_repos`:

- **Exactly one entry:** pin that `<repo-code>`. No prompt.
- **More than one entry:** prompt the user — *"This is a cross-cutting feature
  affecting `{affects_repos}`. Which repo are we executing this session in?"*
  — and use their answer. **Do not pre-fill a default.** The user must choose
  deliberately, since execution writes code commits to the chosen repo.

### 5. Legacy fallback (no path or frontmatter signal)

If the artifact is from a legacy / pre-SoD project (no `<repo-code>/` or
`_cross-cutting/` directory in its path, and no `affects_repos` frontmatter),
prompt the user — *"Which source repo is this work scoped to?"* — pre-filling
with the project's `primary` repo (if any) as the suggested default.

## Interactive-only contract

This skill is designed for interactive invocation. If executed in a
non-interactive context (no TTY, scripted chain, CI), and a prompt would
otherwise fire (rules 4 or 5 above with ambiguous input), **fail fast** with
a clear error rather than blocking on an unanswerable prompt:

> **Error.** `execute-increments` requires interactive scope resolution for
> cross-cutting or legacy artifacts. Pass an explicit `scope` input naming a
> `[[project.repos]].code`, or invoke the skill interactively.

## Permission check (post-resolution)

Once `<repo-code>` is fixed, before any write to an execution artifact
(`increment-status.md`, `bugs-and-issues-log.md`, code commits, etc.):

- Look up `[stages.execution].write_role`. If set, compare against
  `[user].role` from `project.user.toml`.
- On mismatch: **refuse the write**, surface the role mismatch as a clear
  error, and exit cleanly (no partial state).
- If either field is unset, skip the check. (When SoD fields are configured
  but `[user].role` is missing, the framework emits a one-time startup
  warning: *"SoD configured without `[user].role` — write protections
  inactive."*)

## Cross-repo increment ordering

For cross-cutting features whose increments span multiple source repos
(e.g. a UI cart-redesign that depends on an API payment-retry contract),
**sequencing is the human's responsibility in MVP**. This skill does **not**
automatically check upstream-repo increment status before starting downstream
work. If the user is invoking this skill on a cross-cutting feature, they are
responsible for confirming any cross-repo dependencies are satisfied.
Automated cross-repo dependency tracking is deferred (see
`_docs/sod-multi-repo-proposal.md` § 14).

## Output

The chosen `<repo-code>` is in scope for the entire execution run and is
used by the path resolver to determine where execution artifacts land:

- Colocate mode (recommended): `<source-repo-path>/<artifact_subdir>/implementation/<feature-id>/`
- Directory mode (variant): `<host-repo>/<artifact_subdir>/implementation/<repo-code>/<feature-id>/`
- Legacy mode: `{project.paths.implementation_package}/<feature-id>/`

Code commits land in the chosen source repo per its normal git flow.
