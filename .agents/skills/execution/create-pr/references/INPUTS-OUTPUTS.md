# create-pr — Inputs and Outputs

## Inputs

| Input | Source | Required | Purpose |
|---|---|---|---|
| Working-tree diff | `git diff` (uncommitted) | Yes | The artifact being packaged |
| Test runner / build tools | environment | Yes | Re-verify after fix cycle |
| Implementation package | `{project.paths.implementation_package}/{feature-id}/` | If present | Provides INC / FR traceability for commit messages and PR body |
| Requirements package | `{project.paths.requirements_package}/{feature-id}/` | If present | Cites FR IDs in PR body |
| Design package | `{project.paths.design_package}/{feature-id}/` | If present | Cites design sections in PR body |
| Coding standards | `_assets/standards/` | If present | Drives the standards-compliance review lens |
| project.toml | `{project-root}/project.toml` | Yes | Resolves paths and project name |
| `gh` CLI | environment | Yes for PR creation; not for review-only mode | Creates the PR |

### Missing-input guards

- Working tree clean → halt with "nothing to package".
- `gh` not authenticated → still run review and commit; pause before PR
  creation and ask the user to authenticate or provide a PR target.

## Outputs

| Output | Sink | Purpose |
|---|---|---|
| Adversarial review report | chat | Findings with severity (Critical / Important / Minor) across 4 lenses |
| Fixed working tree | filesystem | All Critical findings resolved; tests re-run after fixes |
| Atomic commits | git history (only after explicit user approval) | Conventional commit messages with INC / FR traceability |
| PR description | chat (and PR body if PR is created) | Summary + Test Plan + Traceability |
| PR URL | chat | After `gh pr create` |
| Changelog entry | project's changelog file | Conditional — only if project maintains a changelog |

## Conventional commit message shape

```
<type>(<scope>): <subject>

<body — why, not what>

Implements: INC-XXX
Traceability: FR-X.Y.Z, FR-X.Y.W
```

Type values: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`,
`build`, `ci`, `style`.

Scope is the project's convention (module name, package name).

## PR description shape

```markdown
## Summary

<2-4 bullets summarizing the change>

## Increments / FRs implemented

- INC-XXX (Name) — implements FR-A.B.C, FR-A.B.D
- ...

## Changes

<key changes by area: API, DB, UI, infra, tests>

## Test Plan

- [ ] Unit tests: <commands>
- [ ] Integration tests: <commands>
- [ ] E2E tests: <commands>
- [ ] Manual verification: <items from Human Gate>

## Risks / open items

<anything the reviewer should pay extra attention to>

## Related

- Requirements: <links>
- Design: <links>
- Implementation package: <link>
```

## What this skill does NOT produce

- Code (the user wrote the code or executed-increments produced it; this
  skill only reviews and packages)
- Implementation packages (that is `create-implementation-package`)
- KB updates (those are produced by `update-knowledge-base`, invoked from
  `execute-increments` per increment)
