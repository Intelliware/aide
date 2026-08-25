<!-- validate: allow-phase-vocab -->

# Review Workflow

Sequential procedure the skill follows when validating an assembled
implementation package. **Run reviews strictly in order.** Do not run them
in parallel — a fix for an earlier review can change content the later
reviews would check.

After each review, present the verdict (PASS or FAIL with findings) and
proceed to the next review. Do not stop on a single FAIL — collect all
findings across all 8 reviews into a single coherent issue list at the end.
The final implementation-readiness verdict (GO / NO-GO) consolidates all
findings.

## Sequential execution rule

1. Read each review's check criteria only when about to run that review.
2. Run the review against the implementation package artifacts.
3. Record findings (with severity).
4. Present per-review verdict to the user.
5. Proceed to the next review.

After all 8 reviews complete, render the consolidated issue list and the
final GO / NO-GO verdict, and write the verdict into `change-tracker.md`.

## The 10 reviews

### 1. Shape conformance

For every `INC-XXX.md` file, verify:

- All 8 sections of the Canonical Increment Shape are present, in order
- Section headings exactly match the spec (use
  `templates/blocks/planning/<block>.md` as ground truth)
- No section is empty
- No legacy `PHASE-XXX` IDs or "Phase Identity" headings remain
- INC IDs follow `INC-XXX` or `INC-XXX.Y` format

**Severity:** missing section = Critical; legacy `PHASE-XXX` heading =
Critical; minor wording deviation in heading = Minor.

### 2. FR coverage

- Every FR in the Requirements Package appears in at least one increment's
  FR Mapping, OR is explicitly listed as out-of-scope in the package
  overview
- No invented FR IDs (every FR cited must exist in the Requirements
  Package verbatim)
- Foundational increments use `FR Mapping: None (foundational)`, not
  fabricated IDs

**Severity:** missing FR = Critical; invented FR ID = Critical.

### 3. Design coverage

- Every component in the Design Package's component map appears in the Plan
  of at least one increment
- API endpoints, data entities, and integration points from the Design
  Package are accounted for somewhere in the package

**Severity:** uncovered component = Critical (likely missing increment);
uncovered minor integration point = Important.

### 4. Independent executability

For each increment, ask: "Can another agent execute this without our
conversation context?"

- Plan items name specific files, modules, or commands
- Dependencies are listed by INC ID (no "the previous one")
- Goal is system state, not effort
- No `[NEEDS CLARIFICATION]` markers anywhere

**Severity:** unresolved `[NEEDS CLARIFICATION]` = Critical (automatic
NO-GO); vague Plan item = Important.

### 5. Verification gates

- Every AI Gate has specific verification steps (commands, test names,
  assertions) with expected results
- Every Human Gate has 2-4 judgment-requiring review items
- Success Criteria are 4-8 binary checkboxes

**Severity:** vague AI Gate ("tests pass" without specifics) = Critical;
Human Gate with 0 or >5 items = Important; Success Criteria not binary =
Minor.

### 6. Dependency graph

- INC-ID dependencies form a DAG (no cycles)
- Dependency sequencing is feasible (no increment depends on a non-existent
  INC ID)
- Foundational increments are sequenced before increments that need them

**Severity:** cycle = Critical; unknown INC ID = Critical; out-of-order
foundational dependency = Important.

### 7. Support documents

- `implementation-package.md` overview lists every increment with ID, name,
  FR mapping, dependencies, and initial status (`not-started`)
- `increment-status.md` exists with one row per increment
- `bugs-and-issues-log.md` exists (initialized empty)
- `change-tracker.md` exists with the package version recorded
- The package overview stamps the requirements and design package versions
  it was authored against

**Severity:** missing version stamp = Critical (cannot validate against
unknown upstream); missing `bugs-and-issues-log.md` = Important; missing
`change-tracker.md` = Important.

### 8. Adversarial pass (wrapper)

Follows the shared dispatcher pattern in
`references/review-patterns/adversarial-wrapper-pattern.md`:

```
meta/review-adversarial \
  --target={project.paths.implementation_package}/{feature-id}/implementation-package.md \
  --stage=planning \
  --output-path={project.paths.implementation_package}/{feature-id}/review/adversarial-findings.md
```

For a plan, the attitude lens earns its keep on increments that read as complete but
assume their own feasibility — "wire up the integration", "migrate the data", a Plan item
whose real cost is hidden behind a verb. Reviews 1–7 confirm an increment is well-formed;
this one asks whether it is honest about what it will take.

### 9. Edge-case pass (wrapper)

```
meta/review-edge-case-hunter \
  --target={project.paths.implementation_package}/{feature-id}/implementation-package.md \
  --stage=planning \
  --output-path={project.paths.implementation_package}/{feature-id}/review/edge-case-findings.md
```

Method-driven, so it targets what the dependency graph and gate reviews cannot see:
partial-failure states between increments, rollback paths that were never planned, the
increment that leaves the system working only if the one after it also ships.

**Severity mapping for both wrappers.** This skill uses Critical / Important / Minor rather
than PASS / FAIL, so findings translate per
`references/review-patterns/review-verdict-mapping.md`:

| `worst_severity` | Severity in the consolidated issue list |
|---|---|
| `critical` | Critical (forces NO-GO) |
| `high` | Important (forces NO-GO unless explicitly accepted as documented risk) |
| `medium` | Important (same treatment) |
| `low` | Minor |
| `none` | (no entry added) |

Each individual finding becomes one row in the consolidated list with its severity
translated by the same mapping — the findings files are evidence, not a substitute for the
issue list.

### 10. Implementation readiness verdict

Run last. Consolidate findings from reviews 1-9 into a single issue list.
Determine the final verdict:

- **GO** — no Critical findings, no unresolved `[NEEDS CLARIFICATION]`,
  Important findings either fixed or explicitly accepted by the user as
  documented risk.
- **NO-GO** — any Critical finding, any unresolved
  `[NEEDS CLARIFICATION]`, or unresolved Important findings the user has
  not explicitly accepted.

## Stop conditions

- A NO-GO verdict blocks handoff. The user must address findings (or
  accept Important risks explicitly), then re-invoke this skill.
- A fix that changes content checked by an earlier passed review
  invalidates that earlier verdict. Re-run affected reviews; the cleanest
  approach is to re-run the entire sequence.

## Handoff

- **GO** → `execute-increments`. Pass the implementation package path and
  the requirements/design version stamps.
- **NO-GO** → recommend `create-implementation-package` for rework. Re-run
  this skill after fixes.
