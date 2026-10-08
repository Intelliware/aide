# Coverage Report Format

The audit always renders **three tables** in chat, in this order:
*summary*, *coverage detail*, *gaps requiring action*. The format below
is the canonical shape; the symbols may be overridden via
`config/customizations/audit-quality-coverage.toml`.

## 1. Header

```
## Coverage Audit — <feature-id>
Generated: <YYYY-MM-DD HH:MM>
Implementation package: <N> total INCs
Quality package: <feature-id>-quality.md @ <version>
KB drift check: <enabled | skipped — reason>
```

## 2. Summary table

| Status | Count |
|---|---|
| ✅ Fully covered (dev done, coverage claimed, marker verified) | N |
| 🔄 In-progress (TC `in-progress` or coverage being implemented) | N |
| ⚠️ Ready but not started (dev done, coverage required, nothing implemented) | N |
| 🔴 Not covered (blocked on dev — dev status `not-started` or `in-progress`) | N |
| ⚠️ Drift (matrix or tracker claims coverage, marker missing in the suite) | N |
| ➖ Not applicable (dev-owned-only per test-design) | N |

Default emoji set: `✅ 🔄 ⚠️ 🔴 ➖`. Overridable.

## 3. Coverage detail table

| INC | Name | Test level | Dev status | Coverage claimed | TC(s) | TC status | Markers verified | Verdict |
|---|---|---|---|---|---|---|---|---|
| INC-001 | … | E2E | done | yes | TC-OWM-004 | completed | ✅ 2 scenarios | ✅ |
| INC-002 | … | integration | done | yes | TC-OWM-006 | not-started | — | ⚠️ |
| INC-003 | … | unit (dev-owned) | done | n/a | — | — | — | ➖ |
| INC-004 | … | E2E | in-progress | planned | (none) | — | — | 🔴 |
| INC-006 | … | E2E | done | yes | TC-OWM-014 | completed | ❌ marker missing | ⚠️ Drift |

Columns omitted when the team's quality package does not produce them:

- **TC(s)** and **TC status**: blank when the team does not use the
  optional TC-XXX flow (composition gate
  `uses_test_case_increments = false`); use `Coverage claimed`
  alone in that case.
- **Markers verified**: replaced with `KB skipped` for every row when
  the KB-driven drift check was unavailable.

## 4. Gaps table

| INC | Name | Issue | Recommended action |
|---|---|---|---|
| INC-002 | … | Dev done, coverage required, TC `not-started` | `/execute-quality-increments` (next-ready: TC-OWM-006) |
| INC-004 | … | Coverage planned but no TC and INC in-progress | `/execute-increments` then `/create-quality-package` |
| INC-006 | … | Tracker says `completed` but marker `@INC-006` missing | `/detect-knowledge-base-drift` then `/execute-quality-increments` or `/create-quality-package` |

Every row in the gaps table **must** name a specific framework skill
as the recommended action. "Talk to QA" is not a valid action; route
to a skill.

## 5. Trailer

```
Summary: <N> gaps requiring action across <M> categories.
Audit recorded in: {paths.quality_package}/<feature-id>/quality/change-tracker.md (Trigger: Coverage audit)
```

## Variants

- **Lightweight mode** (quick-dev): drop the coverage-detail table; emit
  only the summary + gaps tables. Triggered when the audit is invoked
  from `quick-dev/execute-quick-change` against a single-INC scope.
- **CI-friendly mode**: render the same content as JSON alongside the
  markdown. Enabled by `config/customizations/audit-quality-coverage.toml`
  `report.emit_json = true`. Off by default.

