# Create Implementation Package - Training Info Dump

**Purpose:** Comprehensive reference for training new AI users on Phase 3 of the AI SDLC - Implementation (Phased Code Creation and Testing).

**Target Audience:** Developers, Technical Leads, QA Engineers, DevOps Engineers, and anyone involved in translating solution designs into working code.

**Source Documents:** AI-SDLC-Best-Practices-Info-Dump.md, AI-Assisted-Coding-Playbook.md, Testing-Implementation-Requirements-Guide.md, AI Bootcamp 2026 - Lessons Learned.md, CANONICAL-PHASE-SHAPE.md, PHASE-CHECKLIST.md, REFACTORING-GUIDE.md, PHASE-EXECUTION-GUIDE.md, bugs-and-issues-log.md, change-tracker-template.md, phase-status.md.

---

## Table of Contents

- [What is the Implementation Package?](#what-is-the-implementation-package)
- [Why Implementation Matters - Delivering the Vision](#why-implementation-matters---delivering-the-vision)
- [How Requirements & Solution Design Drive Implementation](#how-requirements--solution-design-drive-implementation)
- [Core AI Principles for Implementation](#core-ai-principles-for-implementation)
- [The 7-Step Workflow for Implementation](#the-7-step-workflow-for-implementation)
- [Implementation Package Components](#implementation-package-components)
- [Canonical Phase Shape - Mandatory Structure](#canonical-phase-shape---mandatory-structure)
- [Phase Execution Workflow](#phase-execution-workflow)
- [Bug & Issue Management During Implementation](#bug--issue-management-during-implementation)
- [Best Practices for AI-Assisted Implementation](#best-practices-for-ai-assisted-implementation)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is the Implementation Package?

### Definition

The Implementation Package is the **working software** that realizes the Requirements and Solution Design. It is not just code — it encompasses tested, documented, deployable functionality organized into phases that build incrementally toward the complete system.

### Key Characteristics

- **Phased Delivery:** Work is broken into phases, each independently executable and verifiable
- **Traceable to Requirements:** Every feature maps back to specific Functional Requirements (FRs)
- **Test-Verified:** Each phase includes automated tests (AI Gate) and manual verification (Human Gate)
- **Incrementally Integrated:** Each phase builds on previous phases, creating a progressively complete system
- **Documented:** Code, configuration, and decisions are documented for future reference

### What Belongs in Implementation

| **Implementation Phase Includes** | **Does NOT Include** |
| --- | --- |
| Working code (backend, frontend, database) | Requirements changes (update Requirements docs first) |
| Unit tests, integration tests, E2E tests | Solution design changes (update Solution Design first) |
| Database migrations | Business rule decisions (these come from Requirements) |
| Configuration files | Architecture decisions (these come from Solution Design) |
| API documentation | UI/UX design decisions (these come from Solution Design) |
| Deployment scripts | Technology stack changes (these come from Solution Design) |

**Guiding Principle:** Implementation realizes what was specified. If you discover a gap during implementation, update the upstream documents (Requirements or Solution Design) first, then implement.

### The Implementation Plan

The Implementation Plan organizes work into **phases**. Each phase:

- Implements specific Functional Requirements (FR mappings)
- Has clear dependencies on previous phases
- Follows the Canonical Phase Shape (8 mandatory sections)
- Is independently executable and verifiable
- Represents approximately 1-2 weeks of work

---

## Why Implementation Matters - Delivering the Vision

Understanding how implementation delivers value helps you execute phases effectively.

### Implementation Realizes the Vision

The Implementation Package is where requirements and design become reality:

- **Requirements → Features:** Functional Requirements become working functionality
- **Solution Design → Code Structure:** Architecture decisions become folder structure, modules, and components
- **API Design → Endpoints:** API specifications become working endpoints
- **Database Design → Schemas:** ERD and table designs become migrations and entities
- **Security Design → Access Control:** RBAC specifications become guards and middleware
- **Test Strategy → Test Suites:** Testing approach becomes actual test files

### The Quality Chain

Quality in implementation depends on quality in earlier phases:

```
Requirements Quality → Solution Design Quality → Implementation Quality
      (What)                  (How)                   (Working Code)
```

**Critical Insight:** Poor requirements or incomplete solution design lead to:

- Implementation assumptions that miss business intent
- Rework when gaps are discovered
- Inconsistent code that doesn't align with architecture
- Missing functionality that stakeholders expected

### The Persistent Memory Problem (Continued)

AI does not retain information between sessions. Your Implementation artifacts serve as the "persistent memory" that:

- Captures what was built and why
- Provides context for future changes
- Enables debugging and troubleshooting
- Supports onboarding new team members or AI sessions

**This is why documentation matters:** Each phase's code, tests, and documentation become the record of what was implemented. Without proper implementation documentation, you lose the ability to understand, maintain, and extend the system.

---

## How Requirements & Solution Design Drive Implementation

### The Traceability Chain

Every implementation decision should trace back through solution design to requirements:

```
FR (Requirement) → Solution Design Component → Implementation Phase → Code/Tests
```

**Example:**

```
FR3.1.1 (Create Allocation Request) 
    → API Design (POST /api/allocations) 
    → PHASE-007.2 (Allocation Creation) 
    → AllocationController.java, AllocationService.java, CreateAllocationIT.java
```

### FR Mapping in Phases

Every implementation phase must explicitly map to Functional Requirements:

```
**FR Mapping**:
- FR3.1.1 Create allocation requests with practitioner, project, dates, percentage
- FR3.1.2 Mandatory fields validation
- FR3.2.5 Alert when over-allocation detected
```

**Rules for FR Mapping:**

- **Never invent FRs** — use them exactly as authored in Requirements
- **Never modify FRs** — if changes are needed, update Requirements first
- **Foundational phases** may have `FR Mapping: None (foundational)` if they don't directly implement FRs
- **Partial implementation is allowed** — a phase may implement part of an FR, with remaining parts in later phases
- **An FR may span multiple phases** — list it in each phase that implements part of it

### Reading Upstream Documents Before Implementation

**Critical Step:** Before implementing any phase:

1. Read the Requirements Package (especially relevant FRs)
2. Read the Solution Design Package (especially relevant design docs)
3. Ask AI to summarize what it understood
4. Verify the summary is accurate
5. Correct any misunderstandings
6. Then proceed with implementation

**Example Prompt:**

```
We are going to implement PHASE-007.2 (Allocation Creation). Please read:
- docs/requirements/04-functional-requirements.md (FR3.1 Create Allocation Request)
- docs/solution-design/07-api-design.md (POST /api/allocations)
- docs/solution-design/10-workflow-business-rules.md (allocation rules)

Summarize:
1. What functionality are we implementing?
2. What are the mandatory fields and validations?
3. What business rules apply?
4. What error scenarios must be handled?
```

---

## Core AI Principles for Implementation

### 1. AI is Intelligent, But Not Smart

**What this means for implementation:**

- AI can generate impressive code but doesn't truly "understand" your architecture
- AI may write code that works but doesn't follow your patterns
- Always verify AI understands your codebase conventions before generating code

**How to apply:**

- Before coding, have AI read existing code for patterns
- Verify AI understands by asking it to describe the patterns it observed
- Review AI-generated code for consistency with existing code
- Don't assume AI will remember patterns from previous sessions

### 2. Context is Critical

**What this means for implementation:**

- Implementation quality depends on having requirements AND solution design context
- AI needs to understand both WHAT to build and HOW it should be built
- Missing context leads to code that works but doesn't fit

**How to apply:**

- Always have AI read requirements and solution design before coding
- Provide explicit technology constraints: "Use Spring Boot 3.x patterns, not Spring Boot 2.x"
- Include existing code files as context: "Follow the patterns in PractitionerController.java"
- Reference organizational standards: "Use RFC7807 for errors"

### 3. AI Will Try to Do More Than Asked

**What this means for implementation:**

- AI may generate code you didn't ask for
- AI may implement features not in the current phase
- AI may refactor code that shouldn't be changed

**How to apply:**

- Be explicit about scope: "Implement ONLY the create endpoint, not update or delete"
- State what NOT to do: "Do NOT modify existing endpoints"
- Start new conversations when switching phases
- Review AI output carefully for scope creep

### 4. Token Limitations Affect Depth

**What this means for implementation:**

- Asking AI to implement an entire feature at once yields shallow code
- Focused requests produce better quality
- Complex implementations benefit from chunk-by-chunk approach

**How to apply:**

- Implement one component at a time (controller, then service, then repository)
- Don't ask AI to generate an entire application at once
- Use scaffolding: create file structure first, then implement each file
- Verify each chunk before moving to the next

### 5. Verification Prompts Are Essential

**What this means for implementation:**

- Verify AI understands requirements before coding
- Verify AI understands existing patterns before generating new code
- Verify each implementation chunk before moving on

**How to apply:**

- "Before implementing, summarize the requirements for this endpoint"
- "What patterns does the existing codebase use for error handling?"
- "Summarize what you just implemented and how it meets the requirements"

### 6. AI Has Short Memory (Session Only)

**What this means for implementation:**

- Each session starts without knowledge of previous implementation
- AI may write code that contradicts earlier decisions
- Documentation becomes critical for consistency

**How to apply:**

- At start of each session, have AI read existing code
- Reference specific files: "Follow the patterns in AllocationController.java"
- Document implementation decisions as you make them
- Commit frequently so code is always current

---

## The 7-Step Workflow for Implementation

The 7-Step Workflow is repeated within each implementation phase to ensure consistency and quality.

### Step 1: Set Context of Deliverable

**Purpose:** Establish what phase you're implementing and why.

**For Implementation Phase:**

```
"We are implementing PHASE-007.2 (Allocation Creation). This phase creates the 
POST /api/allocations endpoint that allows authorized users to request new 
allocations. We are in the Implementation stage."
```

**What to include:**

- Phase ID and name
- What functionality is being implemented
- Reference to relevant FRs

### Step 2: Set Context of Audience/Environment/Components

**Purpose:** Define the technical environment and what components are needed.

**Example Prompts:**

- "What components are typically needed for a Spring Boot REST endpoint?"
- "What files should we create for the allocation creation feature?"
- "What existing code should we follow as patterns?"

**Have AI identify:**

- Files to create (controller, service, repository, DTOs, tests)
- Existing patterns to follow
- Integration points with existing code
- Test coverage requirements

### Step 3: Refine the Feedback

**Purpose:** Customize AI's suggestions to your specific implementation.

**Example Prompts:**

- "We must use the existing AllocationRepository, not create a new one"
- "Follow the error handling pattern from PractitionerController"
- "Include integration tests using @SpringBootTest and Testcontainers"
- "Do NOT create unit tests yet — we'll do those separately"

**What to refine:**

- Which existing components to reuse
- Which patterns to follow
- What tests are required
- What is out of scope for this phase

### Step 4: Create Scaffolding Structure

**Purpose:** Establish the file structure and method signatures WITHOUT implementation.

**Critical:** Do NOT let AI generate implementation at this stage. Only structure.

**Example Prompt:**

```
"Propose the file structure and method signatures for PHASE-007.2. Show me:
- What files will be created or modified
- Class/method signatures (no implementation)
- Test file structure

Show structure ONLY, do not implement yet."
```

**Process:**

1. AI proposes structure
2. You negotiate/refine the structure
3. Once agreed, AI creates file structure and signatures ONLY
4. Review structure before proceeding to implementation

### Step 5: Create Content Chunk-by-Chunk

**Purpose:** Implement code incrementally with verification at each step.

**Example Prompts:**

- "Now implement the CreateAllocationRequest DTO with validations"
- "Now implement the AllocationService.create() method"
- "Now implement the POST endpoint in AllocationController"
- "Now create the integration test for successful creation"

**Process:**

1. Select one chunk (e.g., one class, one method, one test)
2. Ask AI to implement it
3. Review the output
4. Run tests/linting to verify
5. Refine/correct as needed
6. Move to next chunk

**Recommended Implementation Order:**

1. DTOs (request/response)
2. Repository methods (if new)
3. Service layer
4. Controller endpoints
5. Unit tests
6. Integration tests
7. Manual verification

### Step 6: Add Supporting Documents

**Purpose:** Provide additional context AI needs for accurate implementation.

**Example Documents:**

- Requirements documents (FRs being implemented)
- Solution design documents (API design, database design)
- Existing code files (patterns to follow)
- Test examples (testing patterns)
- Configuration files

**How to add:**

- Reference files in the codebase
- Point AI to specific sections
- Paste relevant excerpts if needed

### Step 7: Verify Understanding

**Purpose:** Ensure AI has read and understood context before implementing.

**Example Prompts:**

- "Summarize the requirements for the allocation creation endpoint"
- "What validations are required based on the API design?"
- "What error scenarios must we handle?"
- "What patterns does the existing code use for similar endpoints?"

**Why this matters:**

- Confirms AI has processed the information
- Reveals misunderstandings early
- Allows correction before investing in implementation

---

## Implementation Package Components

### 1. Implementation Plan

**Purpose:** Master document organizing work into phases.

**Location:** `docs/implementation/implementation-plan.md`

**Contents:**

- Phase index (list of all phases)
- Detailed phase specifications (using Canonical Phase Shape)
- Execution workflow and process steps
- Bug-fix phases section

### 2. Phase Status Tracker

**Purpose:** Track progress of each phase.

**Location:** `docs/implementation/phase-status.md`

**Contents:**

- Status for each phase (Not Started, In Progress, Completed, Blocked, On Hold)
- Notes and completion dates
- Quick stats (total phases, completed, in progress)

**Status Values:**

- 🔵 **Not Started** - Phase not yet begun
- 🟡 **In Progress** - Active development
- 🟢 **Completed** - All success criteria met
- 🔴 **Blocked** - Blocked by dependencies or issues
- ⏸️ **On Hold** - Temporarily paused

### 3. Bugs and Issues Log

**Purpose:** Record bugs found during testing for later remediation.

**Location:** `docs/implementation/bugs-and-issues-log.md`

**Contents:**

- Bug entries with date, finder, summary, phase, status
- Analysis (where it resides, docs impacted, impact type)
- Status tracking (new, to do, priority, hold, fixed)

### 4. Change Tracker

**Purpose:** Track changes to requirements, design, and implementation.

**Location:** `docs/implementation/change-tracker.md`

**Template:** See `../_shared/templates/change-tracker-template.md` for the universal Change Tracker file structure, versioning convention, and change types.

**Parts Affected Values for Implementation:**

| Value | Meaning |
| --- | --- |
| Requirements | Changes cascading from requirements updates |
| Solution Design | Changes cascading from design updates |
| Code | Source code changes (backend, frontend, database) |
| Tests | Test code changes (unit, integration, E2E) |
| Configuration | Build, deployment, environment configuration changes |
| Documentation | Implementation documentation changes |
| Multiple | When more than two components are affected, list them |

### 5. Reference Documents

**Location:** `docs/implementation/reference/`

**Contents:**

- `CANONICAL-PHASE-SHAPE.md` - Mandatory phase structure
- `PHASE-CHECKLIST.md` - Checklist for phase creation
- `REFACTORING-GUIDE.md` - How to refactor implementation plans
- `PHASE-EXECUTION-GUIDE.md` - Complete execution workflow

### 6. Code Artifacts

**Purpose:** The actual implementation.

**Typical Structure:**

```
apps/
├── api/                    # Backend API
│   └── src/
│       ├── main/java/      # Production code
│       └── test/java/      # Test code
└── web/                    # Frontend
    └── src/                # Production code
    └── playwright/         # E2E tests
```

### 7. Test Artifacts

**Purpose:** Verify implementation correctness.

**Types:**

- **Unit tests** - Test individual components in isolation
- **Integration tests** - Test components working together
- **E2E tests** - Test complete user flows
- **Manual test plans** - Document manual verification steps

---

## Canonical Phase Shape - Mandatory Structure

Every implementation phase **MUST** contain these 8 sections in this exact order:

### 1. Phase Identity

```
#### Phase Identity

**Phase ID**: PHASE-XXX (or PHASE-XXX.Y for sub-phases)
**Phase Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]
- FR-X.Y.Z [Requirement description]
```

**Rules:**

- Phase IDs must be sequential and unique
- Phase Names should be descriptive (e.g., "Allocation Creation (API-only)")
- FR Mapping is MANDATORY — every phase must list FRs, unless foundational
- Foundational phases: `FR Mapping: None (foundational)`

### 2. Goal

```
#### Goal

[Single sentence describing the system state after this phase completes]
```

**Rules:**

- Goals describe **system state**, not effort
- Use present tense: "The system can..." or "X exists..."
- Be specific and measurable

**Examples:**

- ✅ "The system can create allocation requests with validation and conflict detection."
- ❌ "Implement allocation creation" (too vague, describes effort)

### 3. Dependencies

```
#### Dependencies

PHASE-XXX [Phase Name]
PHASE-YYY [Phase Name]
```

**Rules:**

- List all phases that must complete before this phase can start
- If no dependencies, state: `None`

### 4. Plan

```
#### Plan

1. [Action verb] [what] [how/where]
2. [Action verb] [what] [how/where]
3. ...
```

**Rules:**

- Plans are **instructions**, not explanations
- Use imperative mood (action verbs: create, implement, configure)
- Be specific enough for blind execution

**Examples:**

- ✅ "Create CreateAllocationRequest DTO with mandatory field validations"
- ❌ "Set up allocation" (too vague)

### 5. Outcome

```
#### Outcome

- [Measurable deliverable 1]
- [Measurable deliverable 2]
```

**Rules:**

- Outcomes are **measurable deliverables**
- Each outcome should be verifiable

### 6. Automated Verification (AI Gate)

```
#### Automated Verification (AI Gate)

1. [Test/verification step 1]
2. [Test/verification step 2]

**Expected**:
- [Expected result 1]
- [Expected result 2]
```

**Rules:**

- AI Gates verify **mechanics** (does it work?)
- List specific test commands or verification steps
- Include expected results

### 7. Human Verification (Human Gate)

```
#### Human Verification (Human Gate)

1. [Review/verification step requiring human judgment]
2. [Review/verification step requiring human judgment]
```

**Rules:**

- Human Gates verify **intent** (does it align with requirements?)
- Focus on things requiring human judgment
- Keep to 2-4 items maximum

### 8. Success Criteria

```
#### Success Criteria

✅ [Criterion 1]
✅ [Criterion 2]
✅ [Criterion 3]
```

**Rules:**

- Success Criteria are **binary** (done or not done)
- Each criterion should be independently verifiable
- Keep to 4-8 items maximum

---

## Phase Execution Workflow

Follow this workflow for every phase:

### Pre-Execution: Phase Analysis

Before beginning any phase:

#### Step 0: Ensure Bugs Log Exists

Confirm `docs/implementation/bugs-and-issues-log.md` exists. If not, create it.

#### 1. Phase Education

Provide comprehensive explanation covering:

**What:**

- Purpose: What is this phase trying to achieve?
- Scope: What is included and explicitly excluded?
- Context: How does this phase fit into the overall project?

**How:**

- Approach: High-level technical approach
- Architecture: How components fit together
- Patterns: Design patterns or conventions being used

**Dependencies:**

- Prerequisites: Which previous phases must be complete?
- External dependencies: Tools, services, or libraries required

**Key Deliverables:**

- Code artifacts: Files, modules, components to be created
- Tests: Test files and test coverage
- Configuration: Config files, environment setup

#### 2. Game Plan

Provide a clear implementation plan:

- **High-Level Approach**: Architecture decisions, technology choices
- **Order of Operations**: Dependency order, logical sequence
- **Key Technical Decisions**: Design patterns, API design, error handling
- **Integration Points**: How this integrates with existing code

#### 3. Implementation Checklist

Create a detailed, actionable checklist:

- [ ] **Database** (if applicable)
  - [ ] Create migration file
  - [ ] Add entity class
  - [ ] Add repository interface
- [ ] **Service Layer**
  - [ ] Create service class
  - [ ] Implement business logic
- [ ] **API Layer**
  - [ ] Create DTOs
  - [ ] Create controller
- [ ] **Tests**
  - [ ] Unit tests
  - [ ] Integration tests

#### 4. Definition of Done

List all success criteria:

- All code follows project conventions
- No linting errors
- Build succeeds
- All tests pass
- Test coverage meets requirements
- Manual testing completed

#### 5. Test Coverage Requirements

Specify testing requirements:

- **Unit Tests**: What components, coverage target
- **Integration Tests**: What integrations, test environment
- **E2E Tests**: What user flows (if applicable)

### Execution Steps

#### Step 1: Wait for Go/No-Go

After presenting Phase Education, Game Plan, Checklist, Definition of Done, and Test Coverage:

- Present the information clearly
- Ask explicitly: "Ready to proceed? Please respond with 'go' or 'no-go'"
- Wait for user response — do not proceed until user says "go"

#### Step 2: Create Branch

When user says "go":

```bash
git checkout -b feature/{phase-id-short-name}
# Example: feature/phase-7-2-allocation-creation
```

#### Step 3: Execute Implementation

Implement all checklist items:

1. Create project structure (if needed)
2. Add dependencies (if needed)
3. Write code
4. Write tests
5. Fix linting errors
6. Verify build succeeds
7. Run all tests
8. Verify test coverage

#### Step 4: Provide Manual Test Plan

After implementation, provide detailed manual test plan:

- Setup instructions
- Test scenarios (happy path, error cases, edge cases)
- Expected results

#### Step 4.5: Ask About Bugs

Before requesting approval:

*"Is there any need to track any bugs or issues before moving on to the next phase?"*

If yes, add bugs to `bugs-and-issues-log.md`.

#### Step 5: Request Approval

Present summary:

- Features implemented
- Files created/modified
- Test results
- Manual test plan reference

**Explicitly state:** "I have NOT committed any code. Waiting for your approval."

### Post-Approval

Only after user says "approved" or "commit":

1. Stage and commit changes
2. Confirm commit
3. Ask about merge preference
4. Update `phase-status.md`

---

## Bug & Issue Management During Implementation

### When to Log Bugs

Log bugs when you discover:

- **Badly implemented requirement** — requirement exists but implementation is incomplete or wrong
- **Missed/new requirement** — capability was never specified or implemented
- Issues found during manual testing that should be fixed later

### Bug Entry Format

```markdown
### Bug #X

| # | Date found | Found by | Summary | Phase when added | Status | Fixed date |
|---|------------|----------|---------|------------------|--------|------------|
| X | YYYY-MM-DD | Name | One-line description | PHASE-XXX | new | |

**Analysis**
- **Where the issue likely resides**: (backend / frontend / both)
- **Requirements/solution docs impacted**: (list with paths)
- **Impact type**: Missed/new requirement | Badly implemented requirement
- **Notes**: (optional clarification)
```

### Bug Status Values

- **new** — Just logged, not yet triaged
- **to do** — Scheduled for fixing
- **priority** — High priority, fix soon
- **hold** — Deferred, not fixing now
- **fixed** — Resolved (set Fixed date)

### Bug-Fix Phase Workflow

When user wants to fix a bug:

1. Generate a full Phase Bug*n* with same structure as normal phase
2. Output in chat for approval
3. After approval, add to `implementation-plan.md` (Bug-fix phases section)
4. Execute like any other phase

---

## Best Practices for AI-Assisted Implementation

### 1. Always Read Context First

**Principle:** Before implementing, load requirements and solution design context.

**Do:**

```
"Read the requirements in FR3.1 and the API design for POST /api/allocations. 
Summarize what we're implementing before we start."
```

**Don't:**

- Start coding without reading requirements
- Assume AI remembers previous sessions

### 2. Follow Existing Patterns

**Principle:** Maintain consistency with existing codebase.

**Do:**

```
"Read PractitionerController.java and follow the same patterns for 
error handling, validation, and response structure."
```

**Don't:**

- Let AI invent new patterns
- Mix different coding styles

### 3. Implement One Thing at a Time

**Principle:** Chunk-by-chunk development produces better quality.

**Do:**

```
"Implement the CreateAllocationRequest DTO with validations. 
Do NOT implement the service or controller yet."
```

**Don't:**

- Ask AI to implement entire features at once
- Skip verification between chunks

### 4. Verify Before Moving On

**Principle:** Test each chunk before proceeding.

**Do:**

- Run tests after each implementation chunk
- Fix linting errors immediately
- Verify build succeeds
- Get confirmation before moving to next chunk

### 5. Keep Phase Scope Strict

**Principle:** Implement only what's in the phase specification.

**Do:**

- Reference the phase's FR Mapping
- Stop when phase scope is complete
- Log out-of-scope issues as bugs

**Don't:**

- Add features not in the phase
- "While we're here" additions
- Scope creep

### 6. Commit Frequently

**Principle:** Protect your work with regular commits.

**Do:**

- Commit after each significant chunk
- Use meaningful commit messages
- Reference phase ID in commits

**Commit Message Format:**

```
feat: [Phase ID] [Phase Name] - [Brief description]

- [Key feature 1]
- [Key feature 2]

Implements: PHASE-XXX
Traceability: FR3.1.1, FR3.1.2
```

### 7. Document Decisions

**Principle:** Record why, not just what.

**Do:**

- Comment non-obvious code decisions
- Log changes in `change-tracker.md`
- Update solution design if implementation differs

### 8. Balance AI Assistance with Human Judgment

**Principle:** AI augments, doesn't replace human decision-making.

**Do:**

- Review AI-generated code carefully
- Question AI choices that seem wrong
- Maintain ownership of architecture decisions

**Don't:**

- Blindly accept AI output
- Let AI make strategic decisions
- Skip code review because AI wrote it

---

## Common Pitfalls and Solutions

### Pitfall 1: Implementing Without Context

**Symptom:** AI generates code that doesn't match requirements or doesn't follow existing patterns.

**Solution:**

- Always have AI read requirements and solution design first
- Point AI to existing code for patterns
- Verify understanding before implementing

**Example:**

```
"Before implementing, read:
1. docs/requirements/04-functional-requirements.md (FR3.1)
2. apps/api/src/main/java/.../PractitionerController.java

Summarize what patterns we should follow."
```

### Pitfall 2: Scope Creep in Phases

**Symptom:** Phase takes longer than expected because extra features were added.

**Solution:**

- Reference FR Mapping strictly
- Say "Do NOT implement X" for adjacent features
- Log out-of-scope items as future work or bugs

### Pitfall 3: AI Generating Incompatible Code

**Symptom:** AI code uses different libraries, patterns, or versions than existing code.

**Solution:**

- Specify exact versions: "Use Spring Boot 3.5.9 patterns"
- Reference existing files: "Follow AllocationService.java patterns"
- Review imports and dependencies carefully

### Pitfall 4: Tests That Don't Test

**Symptom:** Tests pass but don't actually verify the functionality.

**Solution:**

- Review test assertions carefully
- Verify tests fail when code is broken
- Include negative test cases
- Test edge cases and error conditions

### Pitfall 5: Forgetting to Update Upstream Docs

**Symptom:** Implementation differs from solution design, creating drift.

**Solution:**

- If implementation must differ, update solution design first
- Log changes in `change-tracker.md`
- Keep traceability intact

### Pitfall 6: Context Loss Across Sessions

**Symptom:** New sessions produce inconsistent code.

**Solution:**

- At start of each session, have AI read existing implementation
- Reference specific files for patterns
- Commit frequently so code is current
- Use phase documentation as context

### Pitfall 7: Skipping Manual Verification

**Symptom:** Automated tests pass but functionality doesn't work correctly.

**Solution:**

- Always complete Human Gate verification
- Test in actual browser/environment
- Verify with realistic data
- Don't skip manual testing even when automated tests pass

### Pitfall 8: Not Logging Bugs

**Symptom:** Issues found during testing are forgotten or fixed ad-hoc.

**Solution:**

- Follow Step 4.5: Ask about bugs before approval
- Log all issues in `bugs-and-issues-log.md`
- Include analysis of where issue resides
- Track status through to resolution

---

## Prompt Templates and Examples

### Template 1: Starting a New Phase

```
We are implementing [PHASE-ID] ([Phase Name]).

Please read the following context:
- Phase specification in docs/implementation/implementation-plan.md
- Requirements: [specific FRs]
- Solution Design: [specific design docs]
- Existing patterns: [reference files]

Provide:
1. Phase Education (What, How, Dependencies, Deliverables)
2. Game Plan (Approach, Order of Operations, Key Decisions)
3. Implementation Checklist
4. Definition of Done
5. Test Coverage Requirements

Then ask me for go/no-go approval.
```

### Template 2: Implementing a Component

```
Now implement [COMPONENT NAME] for [PHASE-ID].

Context:
- Requirements: [FR reference]
- Design: [solution design reference]
- Patterns to follow: [existing file reference]

Create:
- [Specific files]
- [With specific features]

Do NOT:
- [Exclusions]
- [What to avoid]

After implementing, show me the code and explain how it meets the requirements.
```

### Template 3: Creating Tests

```
Now create [test type] tests for [COMPONENT].

Test coverage requirements:
- Happy path scenarios
- Error scenarios (validation failures, not found, etc.)
- Edge cases: [list specific edge cases]
- RBAC scenarios: [role-based tests]

Follow the testing patterns in [existing test file].

Use [test framework] with [specific configuration].

Do NOT create tests for [exclusions].
```

### Template 4: Manual Test Plan

```
Create a manual test plan for [PHASE-ID].

Include:
1. Setup instructions (prerequisites, how to start services)
2. Test scenarios:
   - Happy path tests
   - Error case tests
   - Edge case tests
   - RBAC tests (test each role)
3. For each scenario:
   - Test ID
   - Description
   - Steps
   - Expected result

Format as a markdown table or checklist.
```

### Template 5: Verification Before Proceeding

```
Before we continue to [next chunk], verify:

1. Summarize what you just implemented
2. How does it meet [FR reference]?
3. What patterns did you follow from existing code?
4. What tests cover this functionality?
5. Are there any concerns or issues?

Let me review before we proceed.
```

### Template 6: Bug Logging

```
Log a bug in docs/implementation/bugs-and-issues-log.md:

Summary: [one-line description]
Phase when added: [current phase ID]

Analysis:
- Where it resides: [backend/frontend/both]
- Docs impacted: [list requirement/design docs]
- Impact type: [Missed requirement / Badly implemented requirement]
- Notes: [additional context]

Set Status to "new" and Fixed date to empty.
```

### Template 7: Phase Completion

```
Phase [PHASE-ID] implementation is complete.

Summary:
- Features implemented: [list]
- Files created: [list]
- Files modified: [list]
- Tests: [X unit, Y integration, Z E2E]
- Test coverage: [percentage]

All tests pass. Build succeeds. No linting errors.

I have NOT committed any code. Waiting for your approval.

Once approved, I will:
1. Commit with message: [commit message]
2. Update phase-status.md to Completed
```

---

## Quick Reference Checklist

### Before Starting a Phase

- [ ] Phase specification read from `implementation-plan.md`
- [ ] Requirements (FRs) reviewed
- [ ] Solution design reviewed
- [ ] Existing code patterns identified
- [ ] Dependencies (previous phases) completed
- [ ] Bugs log exists

### Phase Analysis Complete

- [ ] Phase Education provided (What, How, Dependencies, Deliverables)
- [ ] Game Plan created (Approach, Order, Decisions, Integration)
- [ ] Implementation Checklist created
- [ ] Definition of Done defined
- [ ] Test Coverage Requirements specified
- [ ] Go/No-Go approval received

### During Implementation

- [ ] Branch created (`feature/{phase-id-short-name}`)
- [ ] Implementing chunk-by-chunk
- [ ] Each chunk verified before moving on
- [ ] Tests written alongside code
- [ ] Linting errors fixed
- [ ] Build succeeds

### Before Requesting Approval

- [ ] All checklist items complete
- [ ] All tests pass
- [ ] Test coverage meets requirements
- [ ] Manual test plan provided
- [ ] Step 4.5: Asked about bugs
- [ ] Bugs logged (if any)
- [ ] Summary prepared
- [ ] Code NOT committed yet

### Phase Complete

- [ ] User approved
- [ ] Code committed with proper message
- [ ] `phase-status.md` updated to Completed
- [ ] All success criteria met

### Canonical Phase Shape (8 Sections)

- [ ] Phase Identity (ID, Name, FR Mapping)
- [ ] Goal (system state)
- [ ] Dependencies
- [ ] Plan (step-by-step instructions)
- [ ] Outcome (measurable deliverables)
- [ ] Automated Verification (AI Gate)
- [ ] Human Verification (Human Gate)
- [ ] Success Criteria (binary)

---

## Key Takeaways

- **Implementation realizes Requirements and Solution Design** — always read upstream documents before coding
- **Every phase follows the Canonical Shape** — 8 mandatory sections ensure consistency and verifiability
- **FR Mapping is mandatory** — every phase must trace to specific Functional Requirements
- **Chunk-by-chunk development** — implement one component at a time with verification at each step
- **Follow existing patterns** — AI should match existing code style, not invent new patterns
- **Test as you go** — write tests alongside code, not as an afterthought
- **Don't commit until approved** — always wait for explicit user approval before committing
- **Log bugs, don't fix ad-hoc** — use `bugs-and-issues-log.md` for systematic tracking
- **Context is persistent memory** — documentation and committed code are how AI maintains continuity
- **Human judgment drives decisions** — AI augments but doesn't replace critical thinking

---

## Additional Resources

- **Phase Execution Guide:** `docs/implementation/PHASE-EXECUTION-GUIDE.md`
- **Canonical Phase Shape:** `docs/implementation/reference/CANONICAL-PHASE-SHAPE.md`
- **Phase Checklist:** `docs/implementation/reference/PHASE-CHECKLIST.md`
- **Refactoring Guide:** `docs/implementation/reference/REFACTORING-GUIDE.md`
- **Bugs and Issues Log:** `docs/implementation/bugs-and-issues-log.md`
- **Change Tracker:** `docs/implementation/change-tracker.md` (see template at `../_shared/templates/change-tracker-template.md`)
- **Phase Status:** `docs/implementation/phase-status.md`
- **Implementation Plan:** `docs/implementation/implementation-plan.md`
- **AI-Assisted Coding Playbook:** `Learning/future state/playbook/AI-Assisted-Coding-Playbook.md`
- **Testing Implementation Guide:** `Learning/future state/playbook/Testing-Implementation-Requirements-Guide.md`
- **Requirements Info Dump:** `Learning/crash course contents/Create-Requirements-Package-Info-Dump.md`
- **Solution Design Info Dump:** `Learning/crash course contents/Create-Solution-Design-Package-Info-Dump.md`
