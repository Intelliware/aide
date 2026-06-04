# Example — execute-quality-increments

> Illustrative only. The skill is framework-agnostic; substitute the test
> stack pinned in your quality package's automation-and-cicd block.

## Scenario

The `wires-poc` quality package has been reviewed (GO with one accepted
condition). The test-case plan contains 3 scaffolding increments and 11
test-case increments across two categories (`e2e/` and `integration/`).
The user invokes `/execute-quality-increments`.

The team's quality package pins:
- Build tool: `<build tool>` (e.g. Maven / Gradle / npm / pip)
- Test framework: `<framework>` (e.g. Cucumber / Vitest / pytest / Playwright)
- Runner: `<runner>` (e.g. JUnit Platform Suite / Vitest CLI / pytest CLI)

## Walkthrough

### Increment TC-WIRE-001 (Scaffolding — test framework dependencies)

**Step 1 — Load:** Read TC-WIRE-001.md. No dependencies. Status →
`in-progress`.

**Step 2 — Implement:** Add the test-framework dependencies declared in
the increment's Artifact Plan to the project's build file. (KB
cross-check: confirm no other module already exposes the same
dependencies via a parent BOM.)

**Step 3 — Verify:** Run the build's compile target — confirm success.

**Step 4 — User review:** Present diffs. User approves.

**Step 5 — Status update:** TC-WIRE-001 → `completed`. Append change-tracker
row.

### Increment TC-WIRE-002 (Scaffolding — runner + configuration)

**Step 1 — Load:** Dependencies: TC-WIRE-001 ✅. Status → `in-progress`.

**Step 2 — Implement:** Create the runner class, the framework
configuration file, and the test-profile configuration declared by the
plan. (KB cross-check: do an equivalent runner / profile pair already
exist for another feature? If so, reuse or parameterise rather than
duplicate.)

**Step 3 — Verify:** Compile the runner and execute an empty suite —
confirm the suite starts and exits cleanly with zero tests selected.

**Step 4 — User review:** User approves.

**Step 5 — Status update:** TC-WIRE-002 → `completed`.

### Increment TC-WIRE-003 (Scaffolding — shared utilities)

**Step 2 — Implement:** Create the shared producer, consumer, and test-data
builder declared in the Artifact Plan. KB cross-check: a similar producer
exists in the platform repo; confirm with the user whether to reuse,
extend, or fork.

**Step 3 — Verify:** Compile — confirm success.

### Increment TC-WIRE-004 (E2E — happy path)

**Step 2 — Implement:** Create the feature/spec file and its
step-definitions / test class per the plan's Artifact Plan section.

**Step 3 — Verify:** Confirm the feature parses, step definitions
compile, and there are no undefined steps. (Full execution deferred —
the quality package's environments block notes the underlying broker is
not available locally; the suite runs in CI per the documented profile.)

**Step 5 — Status update:** TC-WIRE-004 → `completed`.

*(Pattern continues for the remaining test-case increments.)*

### Completion

After TC-WIRE-014 (test-data export) completes:

> **Quality execution complete**
> - Scaffolding increments: 3 completed
> - Test-case increments: 11 completed
> - Key artifacts: 7 feature files, 7 step-definition classes, 1 runner,
>   3 shared utilities, 1 exported data set
>
> Run the full suite per the automation-and-cicd block in the quality
> package, or invoke `/audit-quality-coverage` to confirm every
> implementation increment is covered.

