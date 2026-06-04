# QE Increment Shape — How the Canonical 8-Block Shape Applies to QE

The QE implementation plan uses the same canonical 8-block increment shape
as the main implementation package (`templates/blocks/planning/*.md`). This
reference describes how each block maps to QE test case specifics.

## Shape mapping

| # | Block | Main implementation | QE test case |
|---|---|---|---|
| 1 | **Increment Identity** | `INC-XXX`, FR mapping | `TC-{code}-{nnn}`, AC/FR mapping, category, tags, priority |
| 2 | **Goal** | System state after increment | What the test validates (present tense) |
| 3 | **Dependencies** | Other INC IDs | Other TCs (shared step defs), infra, running service |
| 4 | **Plan** | Imperative steps to build feature | Steps to build the test: feature file, step defs, assertions |
| 5 | **Outcome** | Production deliverables | Test artifacts: `.feature`, `.java` step def, CSV row |
| 6 | **AI Gate** | Test commands + expected results | Cucumber run command + expected scenario pass |
| 7 | **Human Gate** | Intent review | Gherkin readability, assertion coverage, fragility check |
| 8 | **Success Criteria** | Binary checkboxes | Compile, run, pass, traceable, exported |

## QE-specific rules

### Increment Identity
- ID format: `TC-{project.code}-{nnn}` (e.g., `TC-WIRE-001`)
- **Category**: From the user's Step 7 choice (e.g., `e2e`, `integration`,
  `contract`, `smoke`).
- **Tags**: Cucumber tags (e.g., `@smoke`, `@regression`, `@happy-path`).
  These drive test filtering at execution time.
- **Priority**: P1 (must-run, every deployment), P2 (regression), P3 (nice-to-have).
- **Traceability**: Map to AC IDs and FR IDs from the requirements package.

### Goal
- Single sentence, present tense, describing what truth the test proves.
- Good: "A valid wire event published to `incoming-wires-topic` is enriched
  and appears on `outgoing-wires-topic` with all required fields."
- Bad: "Test the happy path." (too vague)

### Dependencies
- Other TC IDs if this test reuses step definitions written for earlier tests.
- Infrastructure assumptions (Kafka running, topics created, service deployed).
- Shared test helpers (producer, consumer, event builder).

### Plan
- Numbered imperative steps.
- Must name the exact artifacts to create (file names, class names).
- Must specify which Gherkin steps to implement and what assertions to use.

### Outcome
- List every file produced: `.feature`, `.java`, `.csv` row.
- Include file paths relative to the project root.

### AI Gate
- Specific Cucumber command: `mvn test -Dtest=CucumberRunnerTest -Dcucumber.filter.tags="@{tag}"`
- Expected result: scenario name passes green.
- Compilation gate: `mvn compile -pl {module}` succeeds.

### Human Gate
- [ ] Gherkin scenario reads clearly in plain English (non-technical stakeholder could understand it).
- [ ] Step definitions match team's established patterns.
- [ ] Assertions cover the linked acceptance criteria fully.
- [ ] No timing-dependent assertions without proper async polling (Awaitility).

### Success Criteria
- [ ] Feature file exists and is syntactically valid Gherkin.
- [ ] Step definitions compile without error.
- [ ] Scenario runs against live infrastructure and passes.
- [ ] Traceability to AC/FR is documented in the increment file.
- [ ] CSV export row is included in the test case export file.
