# Phase Refactoring Checklist

Use this checklist when creating or refactoring a phase to ensure it follows the Canonical SDLC Phase Shape.

---

## Phase Structure Checklist

### Phase Identity

- [ ] **Phase Identity** section exists
- [ ] Phase ID is unique and sequential (e.g., PHASE-002)
- [ ] Phase Name is descriptive
- [ ] FR Mapping lists explicit FRs (or "None (foundational)")

### Goal

- [ ] **Goal** section exists
- [ ] Describes system state (not effort)
- [ ] Uses present tense ("The system can...")
- [ ] Is specific and measurable

### Dependencies

- [ ] **Dependencies** section exists
- [ ] Lists Phase IDs (e.g., PHASE-001)
- [ ] Or states "None" if no dependencies

### Plan

- [ ] **Plan** section exists
- [ ] Contains step-by-step instructions
- [ ] Uses action verbs (create, implement, configure)
- [ ] Specific enough for blind execution

### Outcome

- [ ] **Outcome** section exists
- [ ] Lists measurable deliverables
- [ ] Uses bullet points
- [ ] Each outcome is verifiable

### Automated Verification (AI Gate)

- [ ] **Automated Verification (AI Gate)** section exists
- [ ] Lists specific test/verification steps
- [ ] Includes "Expected:" results
- [ ] Executable by CI/CD

### Human Verification (Human Gate)

- [ ] **Human Verification (Human Gate)** section exists
- [ ] Lists review steps requiring judgment
- [ ] 2-4 items maximum
- [ ] Focuses on intent/alignment

### Success Criteria

- [ ] **Success Criteria** section exists
- [ ] Uses ✅ checkboxes
- [ ] Binary criteria (done/not done)
- [ ] 4-8 items maximum
- [ ] Each independently verifiable

---

## Quality Checks

- [ ] All 8 sections present and in correct order
- [ ] No section is empty or placeholder
- [ ] FR mappings match Functional Requirements document exactly
- [ ] Dependencies reference valid Phase IDs
- [ ] Phase can be executed independently (dependencies satisfied)
- [ ] Phase represents 1-2 weeks of work (not too large/small)

---

## Quick Reference

### Sections (in order):

1. Phase Identity
2. Goal
3. Dependencies
4. Plan
5. Outcome
6. Automated Verification (AI Gate)
7. Human Verification (Human Gate)
8. Success Criteria

### FR Mapping:

- Required for all non-foundational phases
- Use exact FR IDs from requirements document
- Foundational phases: `FR Mapping: None (foundational)`

### Goal Format:

- ✅ "The system can [do something]"
- ❌ "Implement [something]"

### Plan Format:

- ✅ "Create table_name table with constraints"
- ❌ "Set up tables"

### Verification Format:

- ✅ "Integration tests for /api/endpoint return 200"
- ❌ "Test the endpoint"
