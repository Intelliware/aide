---
slug: load-increment
sequence: 1
depends-on-prior: false
---
# Step 1 — Load Increment
## Purpose
Load the next increment from the test-case plan, verify its dependencies
are satisfied, resolve the default test-artifact target repo, and confirm
prerequisites before implementation begins.
## Procedure
### 1a. Determine the next increment
Read `test-case-status.md` and find the next increment with status
`not-started` whose dependencies are all `completed`. **Scaffolding
increments take priority** over test-case increments — process all
ready scaffolding before moving on to test cases.
If no increment is available (all remaining increments have unmet
dependencies), report the blocker and halt.
If no increments remain with status `not-started`, the test-case plan is
fully executed — report completion and stop (see step 5d for the
completion summary template).
### 1b. Load the increment file
Read the increment's `TC-XXX.md` file. For scaffolding increments this is
at the plan root. For test-case increments this is in the category
sub-folder (if the plan is categorised) or the plan root (if flat).
### 1c. Verify dependencies
Cross-check `test-case-status.md` to confirm every ID listed in the
increment's Dependencies section has status `completed`. If any
dependency is not completed, halt and report which dependencies are
blocking.
### 1d. Confirm prerequisites
Read `project.toml` before presenting the increment. Resolve the
test-artifact target repo:

1. If `[project.testing].qe_repo` is set, match it to a
   `[[project.repos]].code` and use that repo as the default target.
2. If it is unset, use the current in-scope code repo fallback.
3. If the code is set but does not resolve, halt and route the user to fix
   `project.toml` (or run `start-project` / `customize-framework`) before
   continuing.

Present the increment to the user:
> **Next increment:** TC-XXX — {summary}
> **Type:** {scaffolding | test-case}
> **Category:** {category | N/A}
> **Test-artifact target repo:** {repo-code and path — QE repo from `[project.testing].qe_repo` | code-repo fallback}
> **Dependencies:** {list — all completed ✅}
> **Prerequisites:** {infrastructure, services, environment, data, etc.}
> **Estimated artifacts:** {N files — runner / fixture / feature / step-def / data}
>
> Ready to implement this increment?
Wait for explicit confirmation before proceeding.
### 1e. Update status
Flip the increment's status to `in-progress` in `test-case-status.md`.
## Next
Proceed to `steps/02-implement-artifacts.md`.
