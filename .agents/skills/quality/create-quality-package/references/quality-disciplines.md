# Quality disciplines — goals, activities, and AI augmentation

The Quality Package consolidates three related but distinct disciplines. Each
maps to a section group of the package: quality assurance analysis drives the
strategy and gates, software testing drives the test design, and quality
engineering drives automation and the delivery-side quality system.

## Software Testing

**Full definition.** Software testing is the practice of evaluating software
behavior against expected outcomes to find defects, verify requirements, and
provide evidence that the product is ready for use. It focuses on the product
itself: what the system does, how it behaves under expected and unexpected
conditions, and whether defects are visible before release.

**Where used in the SDLC.** Heaviest during implementation, integration,
verification, release readiness, and maintenance; begins during requirements and
design when test conditions are identified.

| Primary goal | Core activity | AI-augmented activity |
|---|---|---|
| Detect product defects and verify expected behavior before release. | Design manual and automated test cases from requirements and acceptance criteria. | Generate baseline and edge-case test cases from requirements, user flows, and recent code changes. |
| | Execute functional and non-functional tests to compare actual behavior with expected outcomes. | Prioritize high-risk test scenarios and regression checks using change impact and defect history signals. |
| | Reproduce, document, and report product defects with clear severity, evidence, and steps. | Draft defect reports from logs, screenshots, and test output; cluster similar failures for triage. |

## Quality Assurance Analysis

**Full definition.** Quality assurance analysis is the practice of evaluating
and improving the processes, standards, requirements, and controls used to build
software. It focuses on preventing defects before they reach the product by
ensuring scope is clear, risks are understood, quality expectations are
measurable, and delivery practices are followed consistently.

**Where used in the SDLC.** Earliest in the lifecycle and continuing through
delivery governance: requirements, planning, design review, test strategy,
release readiness, retrospectives, and post-incident process improvement.

| Primary goal | Core activity | AI-augmented activity |
|---|---|---|
| Prevent defects by improving software delivery processes and quality controls. | Review requirements for clarity, consistency, and testability. | Flag ambiguous, conflicting, or non-testable requirements before implementation starts. |
| | Define quality criteria, entry/exit conditions, and release gates. | Recommend measurable release criteria and gate thresholds based on historical outcomes. |
| | Analyze delivery risk, traceability, and coverage gaps across the agreed scope. | Map scope items to missing quality evidence and predict release risk from defect and cycle-time trends. |
| | Audit adherence to standards, checkpoints, and agreed process controls. | Surface recurring process escape patterns and suggest targeted process improvements. |
| | Review defect trends and escaped issues to improve upstream quality practices. | Identify common defect sources and recommend preventive actions for requirements, design, or process checkpoints. |

## Quality Engineering

**Full definition.** Quality engineering is the technical discipline of
designing, building, and operating systems that make quality continuous,
measurable, and scalable. It extends beyond testing by embedding automation,
observability, quality gates, test data management, reliability practices,
performance checks, and security validation into the delivery platform and
engineering workflow.

**Where used in the SDLC.** Spans the full lifecycle from design through
production operations: architecture and design, implementation, CI/CD pipeline
design, automated verification, release governance, monitoring, incident
learning, and continuous improvement.

| Primary goal | Core activity | AI-augmented activity |
|---|---|---|
| Engineer continuous, scalable quality across the full delivery lifecycle. | Build and maintain reusable automation frameworks and test utilities. | Propose framework abstractions and generate scaffolding for stable, reusable automation. |
| | Embed quality checks and policy gates directly in CI/CD pipelines. | Optimize test selection and parallelization per change set to reduce feedback time. |
| | Design and manage reliable test data pipelines and environment controls. | Generate synthetic test data, detect data drift, and recommend refresh strategies for repeatable validation. |
| | Implement observability-driven quality signals for reliability and incident prevention. | Correlate logs, metrics, traces, and failures to accelerate root-cause identification. |
| | Integrate performance and security validation into standard delivery workflows. | Auto-generate performance baselines and security checks from architecture and risk profiles. |

## Quick distinction

- Software testing detects defects in the product.
- QA analysis improves the process to prevent defects.
- Quality engineering builds systems where quality is continuous and scalable.
