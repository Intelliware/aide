# Implementation Plan Refactoring Guide

## Quick Start

To refactor an existing implementation plan to use the Canonical SDLC Phase Shape:

1. **Read the reference**: `docs/implementation/reference/CANONICAL-PHASE-SHAPE.md`
2. **Use the Cursor rule**: The `.cursor/rules/canonical-phase-shape.mdc` rule will guide you when editing `implementation-plan.md`
3. **Follow the template**: Each phase must have all 8 sections in order

---

## Step-by-Step Refactoring Process

### 1. Prepare Your Workspace

Ensure you have access to:

- Functional Requirements document (for FR mappings)
- Existing implementation plan (to refactor)
- Solution design documents (for context)

### 2. Identify Phase Boundaries

Review your existing plan and ensure:

- Phases are dependency-ordered (foundations → data → APIs → UI)
- Each phase represents 1-2 weeks of work
- Phases are independently executable

### 3. Extract FR Mappings

For each phase:

- Identify which Functional Requirements it implements
- List FRs explicitly (e.g., FR3.1.1, FR3.1.2)
- If foundational, use: `FR Mapping: None (foundational)`
- **Never modify FRs** — use them exactly as authored

### 4. Refactor Each Phase

For each phase, rewrite using this checklist:

#### Phase Identity

- Assign unique Phase ID (e.g., PHASE-002)
- Write descriptive Phase Name
- List all FR mappings explicitly

#### Goal

- Rewrite as system state (present tense)
- Remove implementation details
- Make it measurable

#### Dependencies

- List Phase IDs that must complete first
- Use format: `PHASE-XXX [Phase Name]`
- If none, state: `None`

#### Plan

- Convert to step-by-step instructions
- Use action verbs (create, implement, configure)
- Be specific enough for blind execution
- Order steps logically

#### Outcome

- List measurable deliverables
- Use bullet points
- Each outcome should be verifiable

#### Automated Verification (AI Gate)

- Define specific test/verification steps
- Include expected results
- Should be executable by CI/CD

#### Human Verification (Human Gate)

- Define review steps requiring judgment
- Keep to 2-4 items
- Focus on intent/alignment, not mechanics

#### Success Criteria

- List binary completion criteria
- Use ✅ checkboxes
- Keep to 4-8 items
- Each must be independently verifiable

### 5. Validate

Check each phase:

- [ ] All 8 sections present
- [ ] Sections in correct order
- [ ] FR mappings explicit (or "None (foundational)")
- [ ] Goal describes system state
- [ ] Plan contains instructions
- [ ] Outcomes are measurable
- [ ] Verification gates are executable
- [ ] Success criteria are binary

---

## Common Refactoring Patterns

### Converting "Deliverables" to "Plan"

**Before:**

```
Deliverables:
- Authentication endpoints
- JWT token issuance
```

**After:**

```
Plan:
1. Create authentication endpoints (register, login)
2. Implement JWT token issuance on successful authentication
3. Configure token signing and expiration
```

### Converting "Goal" from Effort to State

**Before:**

```
Goal: Implement authentication system
```

**After:**

```
Goal: The system can authenticate users, issue secure tokens, and enforce role-based access for protected backend endpoints.
```

### Extracting FR Mappings

**Before:**

```
This phase implements user authentication and authorization.
```

**After:**

```
FR Mapping:
- FR1.9.1 Single Sign-On support
- FR1.9.2 Microsoft Entra ID integration
- FR1.9.4 Role-based access control enforcement
```

### Converting Vague Verification to Specific

**Before:**

```
Verification: Test authentication works
```

**After:**

```
Automated Verification (AI Gate):
1. Integration tests for `/api/auth/login` endpoint
2. Test JWT tokens are issued on successful authentication
3. Test protected endpoints enforce authentication

Expected:
- Login returns valid token
- Protected endpoints return 200 for authenticated users
- Protected endpoints return 401 for unauthenticated users
```

---

## Automation Tips

### Using AI Assistance

When refactoring with AI assistance:

- **Provide context**: Share the Functional Requirements document
- **Show examples**: Reference completed phases from `implementation-plan.md`
- **Iterate**: Refactor one phase at a time, validate, then continue
- **Use the rule**: The Cursor rule will guide the AI automatically

### Batch Refactoring

For large plans:

1. Start with foundational phases (Phase 0, 1.x)
2. Then API phases (Phase 2-14)
3. Finally UI phases (Phase 15-23)
4. Validate dependencies as you go

---

## Quality Checklist

Before marking refactoring complete:

- [ ] Every phase has all 8 sections
- [ ] Phase IDs are sequential and unique
- [ ] FR mappings are explicit for all non-foundational phases
- [ ] Dependencies reference correct Phase IDs
- [ ] Goals describe system state (not effort)
- [ ] Plans are step-by-step instructions
- [ ] Outcomes are measurable deliverables
- [ ] Verification gates are executable
- [ ] Success criteria are binary
- [ ] No phase is too large (>2 weeks) or too small (<1 day)

---

## Troubleshooting

### "I can't find FR mappings"

- Check Functional Requirements document
- Look for implicit requirements in phase descriptions
- If truly foundational (infrastructure), use: `FR Mapping: None (foundational)`

### "Phase is too large"

- Split into sub-phases (e.g., Phase 7.1, 7.2, 7.3)
- Ensure each sub-phase has clear dependencies
- Each sub-phase should be independently executable

### "Verification is too vague"

- Ask: "What specific test would prove this works?"
- Use concrete commands: curl, test names, specific assertions
- Include expected results explicitly

### "Success criteria are subjective"

- Ask: "Is this done or not done?"
- Use binary criteria: "✅ Table exists" not "✅ Table is good"
- Each criterion should be independently verifiable

---

## Next Steps

After refactoring:

1. Review with team/stakeholders
2. Update phase status tracking (`reference/phase-status.md`)
3. Use phases to guide sprint planning
4. Update phases as requirements evolve

---

## References

- **Complete Reference**: `docs/implementation/reference/CANONICAL-PHASE-SHAPE.md`
- **Example Phases**: `docs/implementation/implementation-plan.md` (Phases 0-7.5)
- **Cursor Rule**: `.cursor/rules/canonical-phase-shape.mdc`
