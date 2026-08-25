# execute-increments — Inputs and Outputs

## Inputs

| Input | Source | Required | Purpose |
|---|---|---|---|
| Implementation package | `{project.paths.implementation_package}/{feature-id}/` (with GO from `review-implementation-package`) | Yes | Source of `INC-XXX.md` files and support docs |
| Target codebase | filesystem | Yes | Where Plan items operate |
| Test runner | environment (project's test framework) | Yes | Runs the AI Gate |
| Build tools | environment | Yes | Verify clean build before claiming completion |
| project.toml | `{project-root}/project.toml` | Yes | Resolves paths and execution settings |
| Knowledge base | `{project.paths.knowledge_base_path}/` | If present | Provides component context per the per-increment handoff |
| Coding standards | `_assets/standards/` | If present | Enforced during TDD and review |

### Missing-input guards

- If `review-implementation-package` has not returned GO, halt — instruct
  the user to run the review first.
- If the codebase is not in a clean state (existing tests fail), halt —
  resolve before starting; otherwise the AI Gate cannot distinguish
  pre-existing failures from increment-introduced failures.
- If the increment file references files / modules / commands that don't
  exist, halt — surface as a planning gap; recommend re-running the review.

## Outputs

Per increment:

| Output | Path / sink | Produced by step | Purpose |
|---|---|---|---|
| Working code | filesystem (target codebase) | step 02 | Realizes the increment's Plan |
| Test artifacts | filesystem (test directories) | step 02 | TDD-driven; satisfy AI Gate |
| AI Gate evidence | reported in chat (fresh from current turn) | step 03 | Verification that Plan is correctly implemented |
| Human Gate sign-off | reported in chat | step 04 | Human confirmation of intent alignment |
| Success Criteria check | reported in chat | step 05 | All 4-8 binary criteria checked |
| Updated `increment-status.md` | `{project.paths.implementation_package}/{feature-id}/increment-status.md` | step 06 | `not-started` → `in-progress` → `completed` |
| Bug entries (if any) | `{project.paths.implementation_package}/{feature-id}/bugs-and-issues-log.md` (via `manage-bugs`) | invoked by step 02-05 as needed | Defects, missed requirements, deferred work |
| KB update handoff | invokes `knowledge-base/update-knowledge-base` | step 06 | Keeps KB current after each shipped increment |

### What this skill does NOT produce

- Commits — that is `create-pr`. This skill leaves the working tree dirty
  with the increment's changes.
- PRs — that is `create-pr`.
- Bug logs directly written by this skill — bug logging routes through
  `manage-bugs`. This separation lets the user invoke `manage-bugs`
  independently (e.g., "log this bug", "review open bugs").

## Verification evidence requirements

Every "done" claim — at the increment level or for any internal step — must
cite evidence captured in the current turn. The skill does not accept:

- "I ran the tests earlier and they passed." (stale)
- "The subagent reported success." (unverified relay)
- "The previous increment's tests cover this." (different scope)

The skill **does** accept:

- Test runner output captured in the current turn, with the relevant
  pass/fail line cited
- Build output captured in the current turn, with success line cited
- VCS diff output cited as the basis for review
