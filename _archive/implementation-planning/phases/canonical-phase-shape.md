# Canonical SDLC Phase Shape — Reference Guide

**Purpose**

This document defines the **Canonical SDLC Phase Shape** — a standardized structure for implementation plan phases that ensures:

- **Clarity**: Every phase is independently executable
- **Traceability**: Functional Requirements (FRs) are explicitly mapped
- **Verifiability**: Clear AI and human gates for completion
- **Consistency**: Uniform structure across all phases

**When to Use**

Use this shape when:

- Creating a new phased implementation plan
- Refactoring an existing implementation plan
- Reviewing phase completeness
- Onboarding new team members to a project

---

## Canonical Phase Shape (MANDATORY)

Every phase **MUST** contain the following sections, in this exact order:

### 1. Phase Identity

**Format:**

```
#### Phase Identity

**Phase ID**: PHASE-XXX (or PHASE-XXX.Y for sub-phases)
**Phase Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]
- FR-X.Y.Z [Requirement description]
- ...
```

**Rules:**

- Phase IDs must be sequential and unique
- Phase Names should be descriptive (e.g., "Allocation Creation (API-only)")
- **FR Mapping is MANDATORY** — every phase must list at least one FR, unless explicitly foundational
- Foundational phases must state: `FR Mapping: None (foundational)`
- FRs must appear exactly as authored (IDs and names unchanged)
- A phase may implement partial FRs, but must list them explicitly
- An FR may appear in multiple phases if implementation is incremental

### 2. Goal

**Format:**

```
#### Goal

[Single sentence describing the system state after this phase completes]
```

**Rules:**

- Goals describe **system state**, not effort
- Use present tense: "The system can..." or "X exists..."
- Be specific and measurable
- Avoid implementation details (save for Plan section)

**Examples:**

- ✅ "The system can authenticate users, issue secure tokens, and enforce role-based access for protected backend endpoints."
- ✅ "Shared taxonomies used by Practitioners, Projects, Open Roles, and Matching are created and seeded with initial values."
- ❌ "Implement authentication" (too vague)
- ❌ "Work on taxonomies" (describes effort, not state)

### 3. Dependencies

**Format:**

```
#### Dependencies

PHASE-XXX [Phase Name]
PHASE-YYY [Phase Name]
```

**Rules:**

- List all phases that must complete before this phase can start
- Use Phase IDs (e.g., PHASE-002)
- If no dependencies, state: `None`
- Dependencies should reference Phase IDs, not phase numbers

### 4. Plan

**Format:**

```
#### Plan

1. [Action verb] [what] [how/where]
2. [Action verb] [what] [how/where]
3. ...
```

**Rules:**

- Plans are **instructions**, not explanations
- Use imperative mood (action verbs: create, implement, configure, add, etc.)
- Be specific enough that another AI or developer could execute blindly
- Order steps logically (dependencies first)
- Each step should be independently verifiable

**Examples:**

- ✅ "Create user_account table with constraints (unique entra_oid; case-insensitive email uniqueness)"
- ✅ "Implement Entra JWT validation"
- ✅ "Configure Spring Security OAuth2 Resource Server"
- ❌ "Set up authentication" (too vague)
- ❌ "Work on user accounts" (not an instruction)

### 5. Outcome

**Format:**

```
#### Outcome

- [Measurable deliverable 1]
- [Measurable deliverable 2]
- ...
```

**Rules:**

- Outcomes are **measurable deliverables**
- Use bullet points
- Each outcome should be verifiable
- Focus on what exists/works after the phase completes

**Examples:**

- ✅ "user_account table exists with proper constraints"
- ✅ "JWT validation works"
- ✅ "RBAC is enforced"
- ❌ "Authentication is done" (not measurable)

### 6. Automated Verification (AI Gate)

**Format:**

```
#### Automated Verification (AI Gate)

1. [Test/verification step 1]
2. [Test/verification step 2]
3. ...

**Expected**:
- [Expected result 1]
- [Expected result 2]
- ...
```

**Rules:**

- AI Gates verify **mechanics** (does it work?)
- List specific test commands or verification steps
- Include expected results
- Should be executable by CI/CD or automated test runner
- Use specific commands where possible (e.g., curl, test names, etc.)

**Examples:**

- ✅ "Run Testcontainers migration tests"
- ✅ "Integration tests for CRUD operations"
- ✅ "Test JIT provisioning creates user_account on first login"
- ✅ "Verify constraint violations are rejected"
- ❌ "Test authentication" (too vague)

### 7. Human Verification (Human Gate)

**Format:**

```
#### Human Verification (Human Gate)

1. [Review/verification step requiring human judgment]
2. [Review/verification step requiring human judgment]
3. ...
```

**Rules:**

- Human Gates verify **intent** (does it align with requirements?)
- Focus on things requiring human judgment (design review, requirement alignment, etc.)
- Should be review/validation steps, not execution steps
- Keep to 2-4 items maximum

**Examples:**

- ✅ "Review table structure matches data requirements"
- ✅ "Verify role mapping works correctly"
- ✅ "Confirm seed values match requirements"
- ❌ "Test the system" (this is automated)
- ❌ "Make sure it works" (not specific)

### 8. Success Criteria

**Format:**

```
#### Success Criteria

✅ [Criterion 1]
✅ [Criterion 2]
✅ ...
```

**Rules:**

- Success Criteria are **binary** (done or not done)
- Use checkboxes (✅) for visual clarity
- Each criterion should be independently verifiable
- Completion is binary — all criteria must be met
- Keep to 4-8 items maximum

**Examples:**

- ✅ "user_account table created"
- ✅ "JWT validation works"
- ✅ "RBAC enforced"
- ✅ "Integration tests pass"
- ❌ "Authentication is good" (not binary/verifiable)

---

## Refactoring Process

### Step 1: Identify Phase Boundaries

- Review existing phase plan
- Ensure phases are dependency-ordered
- Split phases that are too large (aim for 1-2 weeks of work)
- Merge phases that are too small (unless they represent distinct dependencies)

### Step 2: Extract FR Mappings

- For each phase, identify which Functional Requirements it implements
- List FRs explicitly (e.g., FR3.1.1, FR3.1.2)
- If phase is foundational (infrastructure, tooling), state: `FR Mapping: None (foundational)`
- **Never invent, modify, merge, or split FRs** — use them exactly as authored

### Step 3: Rewrite Each Phase

For each phase:

- **Phase Identity**: Assign Phase ID, Name, and list FRs
- **Goal**: Rewrite as system state (not effort)
- **Dependencies**: List Phase IDs that must complete first
- **Plan**: Convert deliverables/descriptions into step-by-step instructions
- **Outcome**: List measurable deliverables
- **Automated Verification**: Define testable verification steps with expected results
- **Human Verification**: Define review steps requiring human judgment
- **Success Criteria**: List binary completion criteria

### Step 4: Validate

- Every phase has all 8 sections
- FR mappings are explicit (or "None (foundational)")
- Goals describe system state
- Plans are instructions (not explanations)
- Outcomes are measurable
- Verification gates are executable
- Success criteria are binary

---

## Common Mistakes to Avoid

**❌ Goals describe effort**

- Bad: "Implement authentication system"
- Good: "The system can authenticate users and issue secure tokens"

**❌ Plans are explanations**

- Bad: "Authentication is implemented using OAuth2"
- Good: "Configure Spring Security OAuth2 Resource Server"

**❌ FR mappings are implicit**

- Bad: "This phase implements authentication"
- Good: "FR Mapping: FR1.9.1 Single Sign-On support, FR1.9.2 Microsoft Entra ID integration"

**❌ Verification is vague**

- Bad: "Test authentication"
- Good: "Integration tests for /api/me endpoint return user info for authenticated users"

**❌ Success criteria are subjective**

- Bad: "Authentication works well"
- Good: "✅ OAuth2 Resource Server configured, ✅ JWT validation works, ✅ /api/me endpoint functional"

---

## Example: Fully Compliant Phase

See `docs/implementation/implementation-plan.md` for complete examples. Here's a condensed example:

### Phase 2 — Security baseline (API-only)

#### Phase Identity

**Phase ID**: PHASE-002
**Phase Name**: Security Baseline (API-only)
**FR Mapping**:

- FR1.9.1 Single Sign-On support
- FR1.9.2 Microsoft Entra ID integration
- FR1.9.4 Role-based access control enforcement

#### Goal

Identity, RBAC, and data-scope enforcement are centralized for every endpoint before any domain APIs ship.

#### Dependencies

PHASE-001.1 DB/ORM Core Platform

#### Plan

1. Configure Spring Security OAuth2 Resource Server
2. Implement Entra JWT validation
3. Implement role mapping from JWT `roles` claim
4. Create `GET /api/me` endpoint
5. Implement JIT `user_account` provisioning by Entra `oid`
6. Implement standard RFC7807 errors for authn/authz failures

#### Outcome

- Spring Security OAuth2 Resource Server is configured
- Entra JWT validation works
- Role mapping from JWT works
- `/api/me` endpoint exists and returns user info
- JIT user provisioning works

#### Automated Verification (AI Gate)

1. Unit tests for role mapping
2. Unit tests for 401/403 behavior
3. Integration tests for `/api/me` endpoint
4. Test JIT provisioning creates `user_account` on first login

**Expected**:

- Role mapping extracts roles from JWT correctly
- Unauthenticated requests return 401
- `/api/me` returns user info for authenticated users
- JIT provisioning creates accounts correctly

#### Human Verification (Human Gate)

1. Entra app roles configured and assigned
2. Verify a real login can call `/api/me` end-to-end
3. Verify role mapping works correctly

#### Success Criteria

✅ OAuth2 Resource Server configured
✅ JWT validation works
✅ Role mapping works
✅ `/api/me` endpoint functional
✅ JIT provisioning works
✅ RFC7807 errors implemented

---

## Template for New Phases

Copy this template when creating new phases:

```markdown
### Phase X — [Phase Name]

#### Phase Identity

**Phase ID**: PHASE-XXX
**Phase Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]
- FR-X.Y.Z [Requirement description]

#### Goal

[Single sentence describing system state after completion]

#### Dependencies

PHASE-XXX [Phase Name]
PHASE-YYY [Phase Name]

#### Plan

1. [Action verb] [what] [how/where]
2. [Action verb] [what] [how/where]
3. [Action verb] [what] [how/where]

#### Outcome

- [Measurable deliverable 1]
- [Measurable deliverable 2]
- [Measurable deliverable 3]

#### Automated Verification (AI Gate)

1. [Test/verification step 1]
2. [Test/verification step 2]
3. [Test/verification step 3]

**Expected**:
- [Expected result 1]
- [Expected result 2]
- [Expected result 3]

#### Human Verification (Human Gate)

1. [Review/verification step 1]
2. [Review/verification step 2]

#### Success Criteria

✅ [Criterion 1]
✅ [Criterion 2]
✅ [Criterion 3]
✅ [Criterion 4]
```

---

## Integration with Project Management

### Phase Status Tracking

Maintain a `phase-status.md` file that tracks:

- Phase ID
- Status (Not Started, In Progress, Completed, Blocked)
- Completion date
- Blockers (if any)

### Phase Completion Checklist

Before marking a phase complete:

- All Success Criteria met
- Automated Verification passes
- Human Verification completed
- FR mappings verified
- Dependencies for next phases satisfied

---

## Change Tracking

> **Not Applicable — Meta Document:** This document defines the mandatory structure for implementation phases. It does not itself produce documentation deliverables and therefore does not have its own Parts Affected values. For change tracking within implementation phases, see `../_shared/templates/change-tracker-template.md` for the universal Change Tracker structure and `create-implementation-package.md` for implementation-specific Parts Affected values.

---

## Questions?

- Review existing phases in `docs/implementation/implementation-plan.md` for examples
- Ensure every phase follows the canonical shape exactly
- When in doubt, ask: "Can another AI execute this phase blindly?"
