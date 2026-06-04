# Example — execute-qe-increments

## Scenario

The WIRES-POC QE package has been reviewed (PASS WITH OBSERVATIONS). The plan contains 3 scaffolding increments and 11 test case increments. The user invokes `/execute-qe-increments`.

## Walkthrough

### Increment TC-WIRE-001 (Scaffolding: Cucumber dependencies)

**Step 1 — Load:** Read TC-WIRE-001.md. No dependencies. Status → `in-progress`.

**Step 2 — Implement:** Add to `pom.xml`:
- `io.cucumber:cucumber-java:7.15.0`
- `io.cucumber:cucumber-junit-platform-engine:7.15.0`
- `io.cucumber:cucumber-spring:7.15.0`
- `org.junit.platform:junit-platform-suite:1.10.2`

**Step 3 — Verify:** Run `mvn compile` — BUILD SUCCESS.

**Step 4 — User review:** Present changes. User approves.

**Step 5 — Status update:** TC-WIRE-001 → `completed`.

### Increment TC-WIRE-002 (Scaffolding: Runner + config)

**Step 1 — Load:** Dependencies: TC-WIRE-001 ✅. Status → `in-progress`.

**Step 2 — Implement:**
- Create `src/test/java/com/wires/qe/RunQeTests.java` (Cucumber runner with `@Suite`, `@SelectClasspathResource("features/qe")`)
- Create `src/test/resources/cucumber.properties` (`cucumber.publish.quiet=true`)
- Create `src/test/resources/application-qe.yml` (Kafka bootstrap pointing to real broker)

**Step 3 — Verify:** Run `mvn compile -pl . -Dtest=RunQeTests` — compiles. Empty suite executes with 0 tests.

**Step 4 — User review:** User approves.

**Step 5 — Status update:** TC-WIRE-002 → `completed`.

### Increment TC-WIRE-003 (Scaffolding: Shared utilities)

**Step 2 — Implement:**
- `QeKafkaTestProducer.java` — wraps KafkaTemplate, publishes to incoming-wires-topic
- `QeKafkaTestConsumer.java` — subscribes to outgoing-wires-topic, collects records with Awaitility
- `WireEventTestDataBuilder.java` — fluent builder for valid/invalid wire events

**Step 3 — Verify:** `mvn compile` — BUILD SUCCESS.

### Increment TC-WIRE-004 (E2E: Happy path)

**Step 2 — Implement:**
- `src/test/resources/features/qe/e2e/wire-happy-path.feature` — Gherkin scenario
- `src/test/java/com/wires/qe/steps/e2e/WireHappyPathSteps.java` — Given/When/Then using QeKafkaTestProducer + QeKafkaTestConsumer

**Step 3 — Verify:** Feature parses, step definitions compile, no undefined steps. (Full execution deferred — requires running Kafka + wires-service.)

**Step 5 — Status update:** TC-WIRE-004 → `completed`.

*(Pattern continues for remaining increments...)*

### Completion

After TC-WIRE-014 (CSV export) completes:

> **QE Execution Complete**
> - Scaffolding increments: 3 completed
> - Test case increments: 11 completed
> - Key artifacts: 7 feature files, 7 step definition classes, 1 runner, 3 shared utilities, 1 CSV export
>
> Run the full suite per `execution-strategy.md`.
