---
slug: verify
sequence: 6
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 6 (Verification and Finalization) of the parent reverse-engineer-database workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

Database verification is critical because consumers write queries against the documented schema — wrong column types, missing FK cascades, or misdescribed sproc parameters cause production data bugs.

## Inputs

- All extracted documentation (Part A, Part B1, Part B2)
- Access to the DDL / migrations / sproc source
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. section-scoped verification, and DDL accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried artifacts (tables, views, sprocs, functions, triggers, indexes) have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] All three documentation parts are populated

**Accuracy Check**
- [ ] Every documented column type, default, constraint matches the actual DDL
- [ ] FK cascade rules (ON DELETE / ON UPDATE) match constraint definitions
- [ ] Sproc parameter types and return types match actual definitions
- [ ] Index definitions match actual CREATE INDEX statements
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A, Part B1, Part B2
- [ ] No DBA-internal details (replication topology, backup schedule) leaked into Part B1/B2
- [ ] Terminology consistent
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B1 / B2 / All)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (Database)

- [ ] **DDL parity:** every column documented matches the actual `CREATE TABLE` / `ALTER TABLE` statement
- [ ] **FK cascade explicit:** every foreign key documents ON DELETE and ON UPDATE behavior
- [ ] **Sproc body verified:** every documented business rule traced to a specific line in the sproc body
- [ ] **Trigger semantics verified:** each trigger documents BEFORE/AFTER, ROW/STATEMENT, and side effects
- [ ] **Index strategy:** documented indexes cover query patterns described in the consumer guide
- [ ] **ERD parity:** every entity in the ERD corresponds to a documented table; every edge corresponds to a documented FK
- [ ] **RLS / permissions:** documented row-level security policies and grants match the actual ACLs
- [ ] **Migration strategy:** documented migration tool (Flyway / Liquibase / sqitch / custom) and rollback approach verified
- [ ] **Consumer guide patterns:** every documented query pattern works against the actual schema (run if possible)

### 4. Spot-Check Against Source

For 3-5 representative tables and 3-5 representative sprocs:
1. Read the documentation
2. Read the actual DDL / migration / sproc body
3. Compare every documented column, constraint, parameter, business rule
4. Flag discrepancies

### 5. Report Results

Produce a verification report.

### 6. Log Verification

Use `track-change` to record the verification activity.

## Output

- Verification report
- Corrections list
- Updated change-tracker entries
- GO/NO-GO determination

## Halt conditions

- Halt if DDL not accessible
- Halt if inventory missing
- NO-GO on unresolved failures (especially DDL-mismatch or FK-cascade omissions)

## Common mistakes

- Verifying ORM models instead of DDL
- Overlooking FK cascade rules
- Documenting sproc signatures without verifying business logic
- Treating spot-checks as sufficient
