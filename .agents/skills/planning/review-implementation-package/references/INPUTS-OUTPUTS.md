# review-implementation-package — Inputs and Outputs

## Inputs

| Input | Source | Required | Purpose |
|---|---|---|---|
| Implementation package directory | `{project.paths.implementation_package}/{feature-id}/` | Yes | The artifact under review |
| All `INC-XXX.md` files | `{project.paths.implementation_package}/{feature-id}/INC-*.md` | Yes | One file per increment; checked for shape, content, executability |
| Implementation package overview | `{project.paths.implementation_package}/{feature-id}/implementation-package.md` | Yes | Lists increments, dependency graph, version stamps |
| Increment status tracker | `{project.paths.implementation_package}/{feature-id}/increment-status.md` | Yes | Should be all `not-started` at review time |
| Bugs log | `{project.paths.implementation_package}/{feature-id}/bugs-and-issues-log.md` | Yes | Should exist (initialized empty) |
| Change tracker | `{project.paths.implementation_package}/{feature-id}/change-tracker.md` | Yes | Records review verdict |
| Approved Requirements Package | `{project.paths.requirements_package}/{feature-id}/` | Yes | FR coverage check; FR identifier verification |
| Approved Design Package | `{project.paths.design_package}/{feature-id}/` | Yes | Design coverage check |
| Canonical Increment Shape spec | `templates/blocks/planning/*.md` + `references/canonical-increment-shape-spec.md` | Yes | The shape conformance ground truth |
| project.toml | `{project-root}/project.toml` | Yes | Resolves all paths above |

### Missing-input guards

- If the implementation package directory is missing, halt — instruct the
  user to run `create-implementation-package` first.
- If either the requirements or design package is missing or marked
  unapproved (no GO recorded in their respective change trackers), halt —
  instruct the user to complete those stages first.
- If the package overview (`implementation-package.md`) does not stamp the
  requirements and design versions it was authored against, treat this as a
  Critical finding (cannot validate against unknown upstream versions).

## Outputs

| Output | Path | Purpose |
|---|---|---|
| Review report (in chat) | reported in conversation | Per-review verdict, per-increment findings, consolidated issue list, final GO/NO-GO |
| Verdict entry | `{project.paths.implementation_package}/{feature-id}/change-tracker.md` | Permanent record of the review outcome and date |
| Issue list (if NO-GO) | embedded in the review report | Required fixes the user / author must address before re-validation |

### Review report shape

```
# Implementation Package Review

Package: {paths.implementation_package}
Requirements version: <stamped version>
Design version:       <stamped version>
Reviewer date:        <YYYY-MM-DD>

## 1. Shape conformance        — PASS | FAIL
## 2. FR coverage              — PASS | FAIL
## 3. Design coverage          — PASS | FAIL
## 4. Independent executability — PASS | FAIL
## 5. Verification gates       — PASS | FAIL
## 6. Dependency graph         — PASS | FAIL
## 7. Support documents        — PASS | FAIL
## 8. Implementation readiness  — GO | NO-GO

## Per-increment findings

### INC-001
  - [Critical|Important|Minor] <finding>
  - ...

### INC-002
  - ...

## Consolidated issue list

| Severity | Increment | Finding | Required fix |
|---|---|---|---|
| Critical | INC-003 | AI Gate vague: "tests pass" | List specific test commands with expected results |
| ... |

## Final verdict

GO | NO-GO

(If NO-GO: required fixes before re-validation)
```

### Severity definitions

- **Critical** — blocks execution. Must be fixed before GO.
- **Important** — should be fixed; execution may proceed with documented risk
  if the user accepts it explicitly.
- **Minor** — polish. Does not block GO.
