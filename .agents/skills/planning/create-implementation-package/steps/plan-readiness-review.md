---
slug: plan-readiness-review
sequence: 6
depends-on-prior: true
---

<!-- validate: allow-phase-vocab -->

# Step 6 — Plan-Readiness Review (self-check GO / NO-GO)

## Purpose

The final self-check before handing off to `review-implementation-package`.
This step runs **inside** the create skill — it is the author's own pass
through the package, surfacing obvious issues before the formal review skill
runs. The formal review (`review-implementation-package`) is the
independently-invocable pre-execution gate; this step is the author saying
"my package is ready to be reviewed."

## When this step runs

After all increments are written and the four support documents
(`implementation-package.md`, `increment-status.md`, `bugs-and-issues-log.md`,
`change-tracker.md`) are in place. This is the last step inside
`create-implementation-package`.

## Inputs

| Input | Source | Required |
|---|---|---|
| Implementation package directory | `{project.paths.implementation_package}/{feature-id}/` | Yes |
| Canonical Increment Shape spec | `references/canonical-increment-shape.md` + `templates/blocks/planning/*.md` | Yes |
| Requirements Package | for FR coverage check | Yes |
| Solution Design Package | for design coverage check | Yes |

## Output

A GO / NO-GO verdict reported in chat plus an entry in
`change-tracker.md` recording the verdict and any issues found.

## Checklist

Run each check. A NO-GO verdict on any check blocks handoff — fix and re-run
this step.

### Shape conformance (per increment)

- [ ] All 8 sections present in order
- [ ] Section headings exactly match the Canonical Increment Shape
- [ ] No section is empty
- [ ] No legacy `PHASE-XXX` IDs or "Phase Identity" headings remain — every
      increment uses `INC-XXX` and "Increment Identity"

### FR coverage

- [ ] Every FR in the Requirements Package is covered by at least one
      increment, OR is explicitly listed as out-of-scope in the package
      overview
- [ ] No invented FR IDs — every FR cited appears in the Requirements
      Package verbatim
- [ ] Foundational increments state `FR Mapping: None (foundational)` rather
      than fabricating FR IDs

### Design coverage

- [ ] Every component in the design's component map appears in the Plan of
      at least one increment
- [ ] API endpoints, data entities, and integration points from the design
      are accounted for

### Independent executability

For each increment, ask: "Can another agent execute this without our
conversation context?"

- [ ] Plan items name specific files / modules / commands
- [ ] Dependencies are listed by INC ID (no "the previous one")
- [ ] Goal is system state, not effort
- [ ] AI Gate has specific verification steps with expected results
- [ ] Human Gate has 2-4 specific judgment items

### Naming / content consistency

- [ ] Sequential, unique INC IDs
- [ ] Increment names are descriptive
- [ ] No `[NEEDS CLARIFICATION]` markers remain
- [ ] No "TBD" or placeholder text in critical sections (Plan, AI Gate,
      Success Criteria)

### Support documents

- [ ] `implementation-package.md` lists every increment with ID, name, FR
      mapping, dependencies, and initial status
- [ ] `increment-status.md` exists with one row per increment, status =
      `not-started`
- [ ] `bugs-and-issues-log.md` exists (initialized empty)
- [ ] `change-tracker.md` exists with the package version recorded

### Requirements / design version stamp

- [ ] The implementation package overview records the version of the
      Requirements Package and Design Package it was authored against
      (so the execution stage can detect upstream drift)

## Verdict format

```
PLAN-READINESS: GO    (all checks passed)
```

OR

```
PLAN-READINESS: NO-GO

Issues:
- [check-name]: [specific issue]
- [check-name]: [specific issue]

Required fixes: [...]
```

## Acknowledgement checkpoint

Before handing off to `review-implementation-package`:

1. Surface the GO / NO-GO verdict and any issues to the user.
2. Ask: "Confirmed GO — proceed to formal review?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes or wants to address issues first, revise the package and re-run this self-check.

## What happens next

- **GO** → hand off to `review-implementation-package`. The handoff message
  must reference the implementation package path and the requirements/design
  versions stamped on it.
- **NO-GO** → fix the listed issues and re-run this step.
