# Reverse Engineer Database Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering an existing database's schema, stored procedures, and data structures into structured, maintainable documentation. Produces three complementary documentation deliverables from a single source of truth: internal implementation docs for DBAs and database developers, a Data Dictionary and ERD as the machine-readable/visual reference, and a Database Consumer Guide for narrative content that a data dictionary alone cannot express.

**Target Audience:** Database administrators, database developers, technical architects, technical writers, developers tasked with documenting an undocumented database, and AI assistants performing documentation extraction.

**Source Documents:** canonical-reverse-engineering-shape.md (universal principles and workflow), change-tracker-template.md, Database-Doc-Template.md, reverse-engineer-api-phase.md (structural patterns), AI-SDLC-Best-Practices-Info-Dump.md.

---

## Table of Contents

- [What is Database Documentation Reverse Engineering?](#what-is-database-documentation-reverse-engineering)
- [The Three-Part Documentation Model](#the-three-part-documentation-model)
- [Why Data Dictionary Alone is Not Enough for Consumers](#why-data-dictionary-alone-is-not-enough-for-consumers)
- [Why This Matters — Impact on Downstream Consumers](#why-this-matters--impact-on-downstream-consumers)
- [Core AI Principles for Database Documentation Extraction](#core-ai-principles-for-database-documentation-extraction)
- [The 7-Step Workflow for Database Documentation](#the-7-step-workflow-for-database-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Change Tracking for Database Documentation](#change-tracking-for-database-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is Database Documentation Reverse Engineering?

### Definition

Reverse-engineering database documentation is the disciplined process of **reading an existing database's schema definition, stored procedures, functions, triggers, indexes, migrations, and security configuration** and producing structured, accurate documentation that enables both database maintainers and application developers who consume the database to work effectively.

This is NOT:
- Guessing what tables do based on their names
- Writing aspirational documentation for stored procedures that don't exist
- Using auto-generated ERD tools and calling it "documented"
- Creating only a data dictionary and assuming developers know how to use the database

This IS:
- Systematically reading the database schema definition (DDL), stored procedures, and configuration
- Producing a Data Dictionary with formal entity definitions, attributes, constraints, and relationships
- Producing an ERD (Entity-Relationship Diagram) that visually represents the schema and relationships
- Producing an Internal Database Documentation that enables DBAs and developers to understand and extend the database
- Producing a Database Consumer Guide that teaches application developers how to query and interact with the database
- Creating living documentation that can be maintained as the schema evolves

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual database DDL and code, not against assumptions or outdated documentation
- **Three-Part Output:** Internal docs (Part A), Data Dictionary & ERD (Part B1), and Database Consumer Guide (Part B2)
- **Technology-Agnostic:** Covers SQL Server, PostgreSQL, Oracle, MySQL, and other relational databases using generic principles
- **Template-Aligned:** Internal docs follow the Database Internal Documentation Template; DDL DDL and DDL follow defined structures
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate accurate SQL queries and application code

### What Belongs in Database Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Every table with columns, types, constraints, indexes | Speculative tables or planned-but-unbuilt tables |
| Actual constraints extracted from schema: PK, FK, unique, check, default values | Assumed constraints not verified against DDL |
| Real views with their underlying query logic | Views that exist in documentation but not in the database |
| All stored procedures with inputs, outputs, business rules, error conditions | Procedures from outdated documentation that were deleted |
| Actual functions, triggers, and their behavior | Speculative stored procedures not yet implemented |
| Security grants, roles, and Row-Level Security (RLS) policies | Security that "should" exist but isn't actually configured |
| Performance indexes and their creation rationale | Indexes that were dropped |
| Migration history and schema versioning | Historical versions no longer in use |
| Actual seed/reference data and retention policies | Aspirational data retention rules |

**Guiding Principle:** If you cannot point to the actual DDL statement or configuration file that proves a documented behavior, do not document it as fact. Flag it as "UNVERIFIED — needs DDL confirmation" instead.

---

## The Three-Part Documentation Model

### Overview

Database documentation is managed centrally but produced in three parts. All three derive from the same extraction process but serve different audiences with fundamentally different needs.

```
Database Schema (Single Source of Truth)
        │
        ├──→ Extraction Process (this guide)
        │         │
        │         ├──→ Part A: Internal Database Documentation
        │         │         (DBAs, database developers)
        │         │
        │         ├──→ Part B1: Data Dictionary & ERD
        │         │         (machine-readable/visual reference)
        │         │
        │         └──→ Part B2: Database Consumer Guide
        │                   (how to query, business rules, patterns)
        │
        └──→ Change Tracker (logs all documentation changes)
```

### Part A: Internal Database Documentation (Full)

**Audience:** Database administrators, database developers, contributors — people who work on the database schema itself.

**Scope:** Everything — schema internals, every table and column rationale, stored procedure implementation, triggers, indexes and their strategies, security grants, migration history, performance tuning, and complete implementation details.

**Template:** Follows the Database Internal Documentation Template structure.

**Includes (in addition to everything derivable from Parts B1/B2):**
- Database version, engine configuration, and initialization parameters
- Schema design decisions and normalization rationale
- Table naming conventions and the reasoning behind column types
- Constraint strategies (when to use check vs. triggers, FK deletion rules)
- Index creation strategies and maintenance plans
- Stored procedure implementation patterns and dependencies
- Trigger conditions and cascade behavior
- View materialization strategies and refresh schedules
- Security implementation (role-based access, RLS policies, grant hierarchies)
- Migration conventions and versioning strategy
- Backup and recovery procedures
- Data archival and retention policies
- Query optimization patterns and anti-patterns
- Monitor and alerting thresholds
- Capacity planning and growth projections

### Part B1: Data Dictionary & ERD

**Audience:** Database architects, application developers, data analysts — people who need to understand the schema structure and relationships without implementation details.

**Scope:** The data model — what the database contains, not how it's implemented internally.

**Format:**
- **Data Dictionary:** Structured metadata document (markdown or spreadsheet format) with entity definitions, attribute specifications, constraints, and relationships
- **ERD:** Entity-Relationship Diagram in visual format (PNG, PDF, or interactive diagram tool)

**Includes:**
- Database overview (purpose, environment, version)
- Entity definitions (what each table/view represents)
- Attribute definitions (column names, data types, formats, allowed values, constraints)
- Relationship definitions (cardinality, referential integrity rules)
- Primary key and unique constraint definitions
- Foreign key relationships and cascade rules
- Check constraints and their business rules
- Default values and their meaning
- View definitions and materialization strategy
- Indexes and their purposes
- Business data definitions (enumerations, status codes, reference data)

**Explicitly Excludes:**
- Internal DBA configuration and parameters
- Query optimization techniques
- Stored procedure implementation logic (only list the procedures and their contracts)
- Trigger internals
- Migration history
- Backup and recovery strategies
- Monitoring and alerting configuration

### Part B2: Database Consumer Guide

**Audience:** Application developers who query the database, business analysts who write reports, and anyone who uses the database without administering it.

**Scope:** Everything an application developer needs to know to successfully integrate with the database that is NOT expressible in the Data Dictionary/ERD format.

**Why This Exists:** See the next section for the full rationale.

**Includes:**
- Getting Started guide (connection setup, first query walkthrough, environment differences)
- Schema navigation guide (how to find the table you need, table naming patterns)
- Common data access patterns (OLTP read/write patterns, reporting queries)
- How to call stored procedures (inputs, outputs, return values, error handling, examples)
- Transaction and concurrency guidelines (ACID properties, isolation levels, deadlock avoidance)
- Data integrity patterns (constraint enforcement, referential integrity behavior)
- Performance guidelines for application developers (index usage, N+1 prevention, query patterns)
- Authentication and authorization (connection strings, credentials, RLS implications)
- Working with views (materialized vs. real-time, refresh schedules)
- Pagination and filtering strategies for large result sets
- Handling NULL values and special cases
- Working with enumerations and reference data
- Error handling and recovery (deadlock retries, constraint violations, timeout handling)
- Logging and auditing expectations
- Data retention and archival (how old data affects queries)
- Testing and development database setup
- FAQ and troubleshooting
- Code examples (SQL, ORM, common libraries)

**Explicitly Excludes:**
- Internal DBA configuration
- Backup and recovery procedures
- Database maintenance operations
- Stored procedure internals (only the contract)
- Trigger internals
- Advanced performance tuning

---

## Why Data Dictionary Alone is Not Enough for Consumers

### What a Data Dictionary Does Well

A Data Dictionary is the industry standard for describing database schema structure. It excels at machine-readable, structured descriptions of individual entities, attributes, and relationships. It powers documentation tools, SQL generators, data governance platforms, and schema analysis.

### What a Data Dictionary Cannot Express

A Data Dictionary is fundamentally an **entity-level reference**. It describes individual tables and columns in isolation. It was never designed to express:

| **Consumer Need** | **Data Dictionary Support** | **Where It Goes Instead** |
| --- | --- | --- |
| "How do I connect to this database?" | No connection information | Consumer Guide — Getting Started |
| "What's the typical query pattern to fetch orders with items?" | No multi-table query examples | Consumer Guide — Common Patterns |
| "How do I work with pagination safely?" | Column definitions exist, but no pagination strategy | Consumer Guide — Pagination Guide |
| "What happens if I violate this foreign key?" | FK definition exists, but no behavior guidance | Consumer Guide — Data Integrity |
| "How should I handle NULL values in this column?" | NULL constraint exists, but no guidance | Consumer Guide — Special Cases |
| "What happens when I update this table — are triggers involved?" | No trigger documentation | Consumer Guide — Side Effects |
| "Show me a complete example calling this stored procedure" | Procedure signature exists, no examples | Consumer Guide — Code Examples |
| "What's the business rule behind this status column?" | Enum list exists, but not the business logic | Consumer Guide — Business Rules |
| "How do I avoid deadlocks?" | No concurrency information | Consumer Guide — Concurrency Guide |
| "How do I query data that's 3 years old — is it archived?" | Data types exist, but no retention policy | Consumer Guide — Data Retention |

### The Industry Standard

Modern database development platforms (Stripe's database APIs, large RDBMS vendors) all follow the same model: a formal data dictionary combined with rich narrative documentation. Tools like Dataedo and SchemaSpy are specifically built to combine auto-generated reference from DDL with manually authored consumer content. This two-deliverable approach for consumers (dictionary + guide) is not optional — it is the baseline expectation for a well-documented database.

### Relationship Between B1 and B2

```
Part B1 (Data Dictionary & ERD)     Part B2 (Consumer Guide)
────────────────────────────────    ──────────────────────────────
Entity definitions                   Getting started and setup
Attribute specifications             Connection and authentication
Constraints and relationships        Common query patterns
Cardinality and referential rules    How to call procedures
Indexes and materialization          Transaction and concurrency
Machine-readable metadata            Performance guidelines
Auto-generates from DDL              Error handling strategies
Visual ERD representation            Code examples
                                     Business rule explanations
```

**Rules:**
- B1 and B2 must never contradict each other
- When B1 changes (new table, column change), evaluate B2 for updates
- B2 references B1 for detailed entity definitions: "See the Data Dictionary for the complete `Orders` entity definition"
- B2 provides the narrative that B1 cannot: "In practice, fetch paginated results like this..."

---

## Why This Matters — Impact on Downstream Consumers

### Impact on Application Developers

Accurate database documentation directly enables:
- **Correct integration** — developers query the right tables with the right joins
- **Faster onboarding** — getting started guide reduces time-to-first-query from hours to minutes
- **Fewer bugs** — understanding constraint behavior and transaction isolation prevents runtime errors
- **Consistent patterns** — teams use the same data access patterns
- **AI-assisted development** — AI coding assistants generate correct SQL when given accurate database documentation
- **Faster debugging** — developers understand error messages because they know the constraints

### Impact on Database Maintainers

Accurate internal documentation directly enables:
- **Consistent schema changes** — new tables follow established patterns
- **Safe refactoring** — understanding trigger cascades prevents breaking application code
- **Faster onboarding** — new DBAs understand the rationale behind design decisions
- **Accurate capacity planning** — understanding growth projections and retention policies
- **Confident optimization** — knowing which indexes are safe to add/remove

### The Quality Chain

```
Database Schema Accuracy → Documentation Accuracy → Application Accuracy
        (Truth)              (Extracted Truth)         (Applied Truth)
```

If the Data Dictionary says a column is required but the schema allows NULL, every application that assumes NOT NULL fails silently. If the Consumer Guide says to use an INNER JOIN but the foreign key has ON DELETE SET NULL, every delete operation cascades unexpectedly. If stored procedure documentation says a procedure never fails, but the code throws an error on constraint violation, every consumer fails when they hit that constraint.

---

## Core AI Principles for Database Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the Database-specific applications.

### 1. AI is Intelligent, But Not Smart — Database Application

**How to apply:**
- Have AI read schema definition files (DDL), not infer structure from names
- After AI documents a table, verify: "Show me the CREATE TABLE statement for this table"
- Check for implicit behavior: triggers, computed columns, defaults, generated columns
- Verify column purposes against actual DDL comments and code, not naming conventions alone

### 2. Context is Critical — Database Application

**How to apply:**
- Start with the schema diagram and foreign key relationships before documenting individual columns
- Read the triggers associated with a table to understand side effects on every documented column
- Check stored procedure behavior by reading actual SQL, not just the parameter list
- Verify view materialization status by checking refresh schedules and configuration, not assuming real-time

### 3. AI Will Try to Do More Than Asked — Database Application

**How to apply:**
- Be explicit: "Document ONLY the tables, columns, and procedures that exist in this DDL. Do NOT infer additional schema."
- After documenting, verify: "For each table you documented, show me the CREATE TABLE statement to confirm it exists."
- Verify all example queries work against the actual schema and constraint definitions

### 4. Token Limitations Affect Depth — Database Application

**How to apply:**
- Document one schema section at a time (e.g., all tables in a feature module together)
- For complex stored procedures, break into incremental steps: definition first, then parameters, then business logic, then examples
- Document the foreign key graph once at the global level, then reference it for each entity

### 5. Verification is Non-Negotiable — Database Application

**How to apply:**
- After AI documents a table, cross-check every column against the DDL
- Verify constraints (PK, FK, UNIQUE, CHECK, DEFAULT) against actual constraint definitions
- Check that documented trigger behavior matches the actual trigger code
- Verify stored procedure parameters match the actual DECLARE statements
- Flag anything that cannot be verified as "UNVERIFIED — needs DDL confirmation"

### 6. AI Has Short Memory (Session Only) — Database Application

**How to apply:**
- At the start of each session, have AI read the documentation produced so far and the current database DDL
- Reference the global conventions (naming, data types, constraint patterns, special patterns) before documenting new entities
- Use the Change Tracker to maintain consistency across sessions
- Commit documentation frequently so it's always current

---

## The 7-Step Workflow for Database Documentation

> **Universal Workflow:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for comprehensive methodology. Below are Database-specific implementations for each step.

### Step 1: Set Context of Deliverable — Database Specifics

**Database-specific prompt template:**
```
"We are reverse-engineering documentation for [DATABASE NAME] version [VERSION].

We are producing three documentation deliverables:
- Part A: Internal Database Documentation (for DBAs and developers)
- Part B1: Data Dictionary & ERD (machine-readable schema and visual reference)
- Part B2: Database Consumer Guide (narrative docs for application developers)

We are currently extracting documentation for [TABLE/PROCEDURE/FEATURE].
Source files to read: [list DDL files, procedure files, migrations, etc.]

Document ONLY what exists in the actual database schema. Do NOT invent tables,
columns, procedures, views, or triggers. Every documented element must be verified
against the actual DDL."
```

### Step 2: Set Context of Audience/Environment/Components — Database Specifics

**Database-specific identification checklist:**
- Database management system and version (SQL Server, PostgreSQL, Oracle, MySQL, etc.)
- Database configuration files and initialization parameters
- Complete schema definition files (DDL scripts organized by feature/module)
- Stored procedure and function files with their dependencies
- Trigger definitions and their firing conditions
- View definitions (and materialization status — real-time vs. nightly refresh)
- Migration files (showing schema evolution and version progression)
- Reference/seed data scripts (revealing expected data patterns)
- Security configuration files (role definitions, grants, RLS policies)
- Index definition and strategy files (including performance baseline)

### Step 3: Refine the Feedback — Database Specifics

**Database-specific corrections to establish:**
- "This database uses [UUID/SEQUENCE/IDENTITY] for primary keys, not [other]. Never infer other key strategies."
- "Foreign keys use [ON DELETE CASCADE/SET NULL/RESTRICT], not [other]. Document these specific cascade behaviors."
- "This view is [materialized nightly/updated on-demand/real-time]. Check the refresh definition, don't assume."
- "This table has Row-Level Security (RLS) enabled on [specific columns/rows]. Document the policy definition."
- "Triggers fire on [INSERT/UPDATE/DELETE/COMBINATION]. List all triggers and their side effects."
- "Computed or generated columns exist on [list]. Document how they're calculated."

### Step 4: Create Scaffolding Structure — Database Specifics

**Database-specific scaffolding prompt:**
```
"Based on the Database Documentation Template, create the scaffolding structure
for [DATABASE NAME] documentation. Show me:

Part A: Internal Documentation
- File structure and section headers (foundation, schema structure, infrastructure)
- Sections for each major feature/module (if splitting by feature)
- Appendices needed (walkthrough examples, anti-patterns, checklists)

Part B1: Data Dictionary & ERD
- Entity definitions section (outline only)
- Attributes table headers (ready to populate)
- Relationship/constraint definitions structure
- ERD placeholder (what entities exist, how they relate)

Part B2: Consumer Guide
- Section structure (getting started, patterns, error handling, examples)
- Code example placeholders (SQL, ORM, application code)

Show structure and headers ONLY, no content yet."
```

### Step 5: Create Content Chunk-by-Chunk — Database Specifics

**Recommended Extraction Order (customized for databases):**

1. Database overview and foundation (Part A)
2. Schema design philosophy, naming, constraints (Part A + B1)
3. Entity-Relationship Diagram (Part B1 — visual foundation)
4. Core schema structure: tables, columns, constraints (Part A + B1)
5. Foreign keys and referential integrity (Part A + B1)
6. Views, materialization strategy, indexes (Part A + B1)
7. Stored procedures and functions (Part A + B2)
8. Triggers and side effects (Part A)
9. Security implementation (Part A)
10. Consumer patterns, error handling, examples (Part B2)

### Step 6: Add Supporting Documents — Database Specifics

**Critical database source files to provide:**
- Complete DDL scripts (CREATE TABLE, VIEW, PROCEDURE, FUNCTION, TRIGGER, INDEX)
- Migration files showing schema evolution and version progression
- Trigger source code (with all side effects documented)
- Security configuration (role definitions, grant statements, RLS policy definitions)
- Reference data and seed scripts (showing expected enumeration values)
- Stored procedure source code (especially error handling and transaction logic)
- Performance baseline and index rationale documents
- Existing database documentation (if any, to maintain consistency)
- Entity-Relationship Diagram (if exists, to verify schema understanding)
- Test data setup scripts (revealing expected data patterns and constraints)

### Step 7: Verify Understanding — Database Specifics

**Database-specific verification prompts:**
- "For the [table] table, show me the CREATE TABLE statement and verify all columns I documented"
- "What foreign keys reference [this table]? Show me the actual FK constraint definitions with cascade rules"
- "What is the primary key for [table]? Show me the CREATE PRIMARY KEY statement"
- "What indexes exist on [table] and why? Show me the CREATE INDEX statements"
- "How does the [procedure] stored procedure behave when it encounters [constraint violation]?"
- "What Row-Level Security policies apply to [table]? Show me the actual RLS policy definition"
- "What triggers fire when [table] is [INSERT/UPDATE/DELETE]? List all triggers and show their code"
- "Are there any computed columns, generated columns, or default values on [table]? Show the definitions"

---

## Documentation Package Components

### File Structure

```
docs/database/
├── README.md                          # Index, relationships, how to maintain
├── CHANGE-TRACKER.md                  # All documentation changes logged here
│
├── part-a-internal/                   # Part A: Internal Database Documentation
│   ├── 01-database-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-schema-design-philosophy.md
│   ├── 04-naming-conventions.md
│   ├── 05-entity-relationship-patterns.md
│   ├── 06-constraint-strategies.md
│   ├── 07-primary-keys-and-uniqueness.md
│   ├── 08-foreign-keys-and-referential-integrity.md
│   ├── 09-views-materialization-strategy.md
│   ├── 10-indexes-and-performance.md
│   ├── 11-stored-procedures-and-functions.md
│   ├── 12-triggers-and-automation.md
│   ├── 13-security-and-access-control.md
│   ├── 14-data-types-and-standards.md
│   ├── 15-default-values-and-computed-columns.md
│   ├── 16-temporal-data-and-auditing.md
│   ├── 17-soft-delete-and-status-patterns.md
│   ├── 18-reference-and-seed-data.md
│   ├── 19-migrations-and-versioning.md
│   ├── 20-backup-and-recovery.md
│   ├── 21-data-retention-and-archival.md
│   ├── 22-capacity-planning.md
│   ├── 23-monitoring-and-alerting.md
│   ├── 24-query-optimization-patterns.md
│   ├── 25-concurrency-and-isolation.md
│   ├── 26-transaction-management.md
│   ├── 27-error-handling.md
│   ├── 28-testing-and-fixtures.md
│   ├── 29-anti-patterns.md
│   ├── 30-new-table-checklist.md
│   ├── 31-internal-types-and-enums.md
│   ├── 32-glossary.md
│   └── appendix-a-feature-walkthrough.md
│
├── part-b1-data-dictionary/           # Part B1: Data Dictionary & ERD
│   ├── data-dictionary.md             # Full entity and attribute definitions
│   │   ├── Entity Definitions (metadata for each table/view)
│   │   ├── Attribute Definitions (metadata for each column)
│   │   ├── Relationship Definitions (cardinality, FKs, cascade rules)
│   │   ├── Constraint Definitions (PKs, uniques, checks)
│   │   ├── Business Enumerations (status codes, allowed values)
│   │   └── Reference Data (lookup tables, seed data)
│   │
│   ├── entity-relationship-diagram.png  # Visual representation (or .pdf)
│   │   (Alternative: interactive diagram link or embedded SVG)
│   │
│   ├── schema-inventory.csv           # Machine-readable table/column manifest
│   └── constraint-matrix.csv          # Machine-readable constraint relationships
│
├── part-b2-consumer-guide/            # Part B2: Database Consumer Guide
│   ├── 01-getting-started.md
│   ├── 02-connection-and-authentication.md
│   ├── 03-schema-navigation.md
│   ├── 04-common-query-patterns.md
│   ├── 05-working-with-views.md
│   ├── 06-calling-stored-procedures.md
│   ├── 07-transactions-and-concurrency.md
│   ├── 08-data-integrity-and-constraints.md
│   ├── 09-handling-relationships.md
│   ├── 10-pagination-and-filtering.md
│   ├── 11-performance-guidelines.md
│   ├── 12-error-handling-and-recovery.md
│   ├── 13-working-with-nulls.md
│   ├── 14-enumerations-and-reference-data.md
│   ├── 15-temporal-and-audit-data.md
│   ├── 16-data-retention-and-archival.md
│   ├── 17-testing-and-development-database.md
│   ├── 18-code-examples.md
│   ├── 19-faq-and-troubleshooting.md
│   └── CHANGELOG.md
│
└── reference/
    ├── extraction-status.md           # Tracks what has/hasn't been documented
    ├── verification-log.md            # Records verification results
    └── schema-diff.md                 # Tracks schema changes over time
```

### Extraction Status Tracker

**Purpose:** Track which parts of the database have been documented across all three deliverables.

**Location:** `docs/database/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total entities (tables + views): [X]
- Total columns: [Y]
- Total stored procedures/functions: [Z]
- Part A complete: [n/X] entities
- Part B1 complete: [n/X] entities + ERD
- Part B2 complete: [V] sections
- Verified: [U]

## Entity Inventory

| Entity | Type | Source Path | Columns | Part A | Part B1 (Dict) | Part B2 (Guide) | Verified | Notes |
|--------|------|-----------|---------|--------|----------------|-----------------|----------|-------|
| Users | Table | schema/users.sql | 12 | ✅ | ✅ | ✅ | ✅ | |
| Orders | Table | schema/orders.sql | 15 | ✅ | ✅ | ✅ | ✅ | FK cascade ON DELETE SET NULL |
| vw_UserOrders | View | schema/views.sql | 8 | 🟡 In Progress | 🔵 Not Started | | | Materialized nightly |

## Stored Procedures

| Procedure | Source Path | Part A | Part B1 (Dict) | Part B2 (Guide) | Verified | Notes |
|-----------|-----------|--------|----------------|-----------------|----------|-------|
| usp_CreateOrder | schema/procedures/orders.sql | ✅ | ✅ | ✅ | ✅ | |
| usp_CancelOrder | schema/procedures/orders.sql | ✅ | ✅ | ✅ | ✅ | Calls triggers |
| usp_ReportOrders | schema/procedures/reports.sql | 🟡 In Progress | | | | Complex logic |

## Global Infrastructure

| Section | Part A | Part B1 | Part B2 | Verified | Notes |
|---------|--------|---------|---------|----------|-------|
| Schema design | ✅ | ✅ | N/A | ✅ | |
| Naming conventions | ✅ | ✅ | N/A | ✅ | |
| Constraint strategy | ✅ | ✅ | ✅ | ✅ | |
| Security (RLS, roles) | ✅ | N/A | ✅ | ✅ | |
| Performance (indexes) | ✅ | ✅ | ✅ | ✅ | |
| Migration conventions | ✅ | ✅ | N/A | ✅ | |

## Consumer Guide Sections

| Section | Status | Verified | Notes |
|---------|--------|----------|-------|
| Getting Started | ✅ | ✅ | |
| Connection Setup | ✅ | ✅ | |
| Common Patterns | 🟡 In Progress | | Missing report examples |
| Error Handling | ✅ | ✅ | |
| Concurrency | ✅ | ✅ | |
```

---

## Phase-by-Phase Extraction Process

### Phase 1: Database Discovery and Inventory

#### Phase Identity

**Phase ID:** DB-EXTRACT-001
**Phase Name:** Database Discovery and Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the database's tables, views, stored procedures, functions, triggers, indexes, and security configuration exists, with source file paths identified for every artifact.

#### Dependencies

None

#### Plan

1. Identify the database type, version, and environment configuration
2. Read all DDL files (.sql scripts, migration files) to extract database definition
3. Extract table inventory: table name, schema, purpose, column count, primary key
4. Extract view inventory: view name, type (materialized vs. real-time), source tables
5. Extract stored procedure/function inventory: procedure name, parameters, purpose
6. Extract trigger inventory: trigger name, firing conditions, affected tables
7. Extract index inventory: index name, table, columns, strategy
8. Identify foreign key relationships: cardinality, cascade rules
9. Extract security configuration: roles, grants, RLS policies
10. Create the `extraction-status.md` file with all identified artifacts at "Not Started" status
11. Create the `CHANGE-TRACKER.md` file with initial structure
12. Create the scaffolding structure for Part A, B1, and B2
13. Decide documentation format: single file vs. split by feature (recommend split if >50 tables)

#### Outcome

- Complete entity inventory (tables, views, procedures, functions)
- Complete constraint and relationship inventory
- Complete index and performance strategy inventory
- Complete security inventory (roles, grants, RLS)
- Extraction status tracker created and populated
- Change tracker created
- Documentation scaffolding created for all three parts

#### Automated Verification (AI Gate)

1. Compare extracted entities against DDL — every table, view, and procedure must be listed
2. Verify all source file paths in inventory resolve to actual files
3. Count entities and verify against DDL definitions

**Expected:**
- 100% of tables, views, procedures are inventoried
- All file paths resolve to actual files
- Entity count matches DDL definitions

#### Human Verification (Human Gate)

1. Review inventory for completeness — any tables, procedures, or security policies missing?
2. Verify the Part A / B1 / B2 scope classification is correct
3. Confirm database version, type, and environment are accurate
4. Approve documentation organization choice (single vs. split files)

#### Success Criteria

✅ Complete entity inventory (tables, views, procedures, functions)
✅ Complete relationship inventory (foreign keys with cascade rules)
✅ Complete index inventory with strategies
✅ Complete security inventory (roles, grants, RLS)
✅ Extraction status tracker created
✅ Change tracker created
✅ Scaffolding created for all three parts
✅ Database type, version, and environment documented

---

### Phase 2: Global Infrastructure Extraction

#### Phase Identity

**Phase ID:** DB-EXTRACT-002
**Phase Name:** Global Infrastructure Extraction (Schema Design, Naming, Constraints, Security)
**FR Mapping:** None (foundational — affects all entities)

#### Goal

The database schema design philosophy, naming conventions, constraint strategies, security configuration, and shared patterns (audit columns, soft deletes, temporal data) are fully documented for Part A, and the corresponding Data Dictionary foundation and Consumer Guide foundation sections are created for Parts B1 and B2.

#### Dependencies

DB-EXTRACT-001 Database Discovery and Inventory

#### Plan

1. **Schema Design Philosophy (Part A):**
   - Read the schema documentation or infer from DDL to extract: normalization approach, denormalization decisions, temporal data strategy
   - Document the architecture philosophy
   - Document key design decisions and their rationale
   - For Part A section 3: document the design philosophy

2. **Naming Conventions (Part A + B1 + B2):**
   - Identify naming patterns: table naming (singular/plural, prefixes), column naming (case, abbreviations), constraint naming conventions
   - Document any special patterns: junction tables, audit tables, reference data tables
   - For Part A section 4: document naming conventions and rationale
   - For Part B1 Data Dictionary: ensure consistency with documented conventions
   - For Part B2: document how to recognize table purposes from naming

3. **Constraint Strategies (Part A + B1 + B2):**
   - Read all constraint definitions: PK strategy, unique constraints, check constraints, defaults
   - Document when to use check constraints vs. application logic
   - Document primary key strategy (serial, UUID, business key)
   - For Part A section 6: document constraint strategy and rationale
   - For Part B1 Data Dictionary: list all constraints with their meanings
   - For Part B2 Consumer Guide: document constraint violation handling

4. **Referential Integrity (Part A + B1 + B2):**
   - Extract all foreign key definitions with cascade rules
   - Document referential integrity patterns: ON DELETE CASCADE, SET NULL, RESTRICT
   - Create Entity-Relationship Diagram showing all relationships
   - For Part A section 8: document foreign key strategies and cascade rules
   - For Part B1 ERD: visual representation of relationships
   - For Part B1 Data Dictionary: formal relationship definitions
   - For Part B2: document how to work with relationships safely

5. **Special Patterns (Part A + B1):**
   - Soft deletes: identify columns used for soft deletes, document deletion strategy
   - Temporal data: identify temporal tables or audit columns, document history strategy
   - Audit columns: standard_metadata patterns (created_at, updated_at, created_by)
   - Status columns: enumerations and their meanings
   - For Part A sections 16–18: document each pattern
   - For Part B1 Data Dictionary: document each pattern instance
   - For Part B2: how to query soft-deleted data, temporal queries

6. **Views and Materialization (Part A + B1):**
   - Identify all views and whether they're materialized or real-time
   - Document refresh schedules for materialized views
   - Document view purposes and usage patterns
   - For Part A section 9: document view strategy
   - For Part B1 Data Dictionary: list all views and their definitions
   - For Part B2: how to work with views, refresh expectations

7. **Indexes and Performance (Part A + B1 + B2):**
   - Identify all indexes and their creation rationale
   - Document indexing strategy: covering indexes, partial indexes, composite indexes
   - For Part A section 10: document index strategy
   - For Part B1 Data Dictionary: list indexes and their purposes
   - For Part B2: guide to index-aware queries

8. **Security and Access Control (Part A + B1 + B2):**
   - Read security configuration: roles, grants, RLS policies
   - Document role hierarchy and permission model
   - Document RLS policy logic and how it affects queries
   - For Part A section 13: document security implementation
   - For Part B1 Data Dictionary: column-level permissions
   - For Part B2: authentication/connection setup, security implications

9. **Reference and Seed Data (Part A + B1 + B2):**
   - Identify reference tables and enumeration tables
   - Document seed data requirements
   - For Part A section 18: document reference data strategy
   - For Part B1 Data Dictionary: list reference tables and their values
   - For Part B2: how to work with enumerations and reference data

10. Log all extracted content in the Change Tracker

#### Outcome

- Schema design philosophy documented (Part A)
- Naming conventions documented (Part A + B1 Data Dictionary)
- Constraint strategies documented (Part A + B1 Data Dictionary + B2 guide)
- Referential integrity documented (Part A + B1 ERD + B2 guide)
- Special patterns (soft deletes, audit, temporal) documented
- Views and materialization strategy documented
- Indexes and performance strategy documented
- Security and access control documented (Part A + B1 + B2 connection guide)
- Reference data and enumerations documented
- Entity-Relationship Diagram created for Part B1
- Data Dictionary foundation created with entity and attribute definitions

#### Automated Verification (AI Gate)

1. Verify naming conventions in B1 match documented conventions in Part A
2. Verify constraint definitions in B1 match actual DDL
3. Verify foreign key cardinality in ERD matches actual DDL
4. Validate that all special patterns are identified and documented

**Expected:**
- Naming conventions consistent across all entities
- All constraints documented in B1 match DDL exactly
- ERD relationships match actual foreign keys
- All special patterns (soft delete, audit) identified

#### Human Verification (Human Gate)

1. Review the Entity-Relationship Diagram — does it accurately represent the schema?
2. Verify naming convention documentation is clear and consistent
3. Confirm constraint strategies document the rationale, not just the syntax
4. Test that the consumer guide excerpt on constraint handling is followable

#### Success Criteria

✅ Schema design philosophy documented
✅ Naming conventions documented and consistent
✅ Constraint strategies documented with rationale
✅ All foreign keys documented with cascade rules
✅ Entity-Relationship Diagram created for Part B1
✅ Data Dictionary foundation created (entity and attribute lists)
✅ Special patterns (soft delete, audit, temporal) documented
✅ Security configuration documented
✅ Reference data documented
✅ Changes logged in Change Tracker

---

### Phase 3: Entity and Attribute Extraction (Repeat Per Entity)

#### Phase Identity

**Phase ID:** DB-EXTRACT-003.X (where X is the entity number)
**Phase Name:** Entity Extraction — [Entity Name] (e.g., Users, Orders, Products)
**FR Mapping:** Maps to the functional requirements the entity implements

#### Goal

Every table/view in the [Entity] is fully documented across all three parts: internal implementation (Part A), Data Dictionary definitions (Part B1), and relevant usage patterns (Part B2).

#### Dependencies

DB-EXTRACT-002 Global Infrastructure Extraction

#### Plan

For each entity:

**Step 1: Read DDL**
1. Read the CREATE TABLE statement to extract: columns, data types, constraints, defaults, computed columns
2. Read all indexes on this table to extract: index name, columns, strategy, purpose
3. Read all triggers on this table to extract: trigger name, firing conditions, side effects
4. Read any foreign keys referencing this table to extract: constraint name, referencing table, cascade rules

**Step 2: Extract Part A — Internal Implementation**
5. Document the table purpose and design rationale
6. Document column definitions: type, constraint, default, computed logic
7. Document indexes: creation rationale and maintenance strategy
8. Document triggers: conditions, side effects, performance implications
9. Document relationships: foreign keys, referential integrity rules
10. Document any special behavior: soft deletes, audit columns, temporal logic

**Step 3: Extract Part B1 — Data Dictionary**
11. Create entity definition: formal name, description, row count estimate, update frequency
12. Create attribute definitions for each column: formal name, description, data type, format, allowed values, constraints, examples
13. Create relationship definitions: cardinality, foreign keys, cascade rules
14. Create business enumerations: if applicable, list allowed values and their meanings
15. Update ERD if relationships changed

**Step 4: Extract Part B2 — Consumer Guide**
16. Document how to query this entity (sample queries, filtering patterns)
17. Document common operations: INSERT, UPDATE, DELETE patterns and constraints
18. Document side effects: triggers that fire, audit log entries, cascade deletes
19. Document error conditions: constraint violations, permission errors
20. Add code examples for common operations

**Step 5: Update Tracking**
21. Update `extraction-status.md` for this entity
22. Log changes in the Change Tracker

#### Outcome

- Entity fully documented in Part A (purpose, columns, indexes, triggers, relationships)
- All attributes documented in Part B1 Data Dictionary with formal definitions
- ERD updated if new relationships discovered
- Relevant usage patterns and code examples added to Part B2
- All three parts are consistent with each other

#### Automated Verification (AI Gate)

1. For each column: verify the DTO data type matches the column's SQL data type
2. For each constraint: verify the constraint definition matches the actual DDL
3. For each index: verify the index columns match the DDL
4. For each trigger: verify trigger conditions match the actual trigger code
5. Verify the entity definition in B1 matches the DDL

**Expected:**
- 100% of columns documented with accurate data types
- 100% of constraints match DDL definitions
- All indexes documented with accurate columns
- All triggers and their effects documented
- Data Dictionary matches actual schema

#### Human Verification (Human Gate)

1. Review the entity purpose and description — would a developer understand what this table stores?
2. Verify column descriptions are clear and businessperson-understandable
3. Confirm examples are realistic and useful
4. Test at least one query pattern from the Consumer Guide against actual data

#### Success Criteria

✅ Entity purpose and design documented in Part A
✅ All columns documented in Part A with types, constraints, defaults
✅ All indexes documented in Part A with rationale
✅ All triggers documented in Part A with side effects
✅ All relationships documented in Part A with cascade rules
✅ Entity definition created in Part B1 Data Dictionary
✅ All attributes documented in Part B1 with formal definitions
✅ Entity included in Part B1 ERD
✅ Usage examples and code samples added to Part B2
✅ Common error conditions documented in Part B2
✅ Extraction status updated
✅ Changes logged in Change Tracker

---

### Phase 4: Stored Procedure and Function Extraction (Repeat Per Procedure)

#### Phase Identity

**Phase ID:** DB-EXTRACT-004.X (where X is the procedure number)
**Phase Name:** Procedure Extraction — [Procedure Name] (e.g., usp_CreateOrder, sp_ReportSales)
**FR Mapping:** Maps to the functional requirement the procedure implements

#### Goal

Every stored procedure and function is fully documented across all three parts: internal implementation (Part A), procedure contract (Part B1 Data Dictionary), and consumer usage guide (Part B2).

#### Dependencies

DB-EXTRACT-002 Global Infrastructure Extraction (so we understand the context)

#### Plan

For each stored procedure/function:

**Step 1: Read Source Code**
1. Read the CREATE PROCEDURE/FUNCTION definition to extract: parameters, return type, output parameters
2. Read the procedure body to extract: business logic, error conditions, transactions, side effects
3. Identify all tables/entities this procedure touches
4. Identify error handling: TRY/CATCH, RAISE_ERROR, exception throwing
5. Read any test code to extract: expected behaviors, edge cases

**Step 2: Extract Part A — Internal Implementation**
6. Document the procedure purpose and business logic
7. Document parameters: name, type, required/optional, meaning
8. Document return values and output parameters: name, type, meaning
9. Document error conditions: what errors are thrown, when, and why
10. Document transaction boundaries and locking behavior
11. Document side effects: tables modified, triggers fired, audit entries created
12. Document dependencies: other procedures called, external services used
13. Document performance considerations: indexes used, potential N+1 issues

**Step 3: Extract Part B1 — Procedure Contract**
14. Create procedure definition: formal name, description, purpose
15. List all parameters with type, direction (IN/OUT), required/optional, description
16. List return type and output parameters
17. Document error codes and their meanings
18. Provide examples of calling the procedure with various parameter values

**Step 4: Extract Part B2 — Consumer Usage**
19. Write "How to call this procedure" section with explanation
20. Provide complete code examples (SQL, ORM, application language)
21. Document input validation: what parameters are required, what values are valid
22. Document output handling: how to interpret return values, handle errors
23. Document common error scenarios and how to recover
24. Document transaction considerations: BEGIN/COMMIT/ROLLBACK if applicable
25. Add usage warnings: performance implications, locking, side effects

**Step 5: Update Tracking**
26. Update `extraction-status.md` for this procedure
27. Log changes in the Change Tracker

#### Outcome

- Procedure fully documented in Part A (logic, parameters, returns, errors, side effects)
- Procedure contract documented in Part B1 (signature, parameters, return values, error codes)
- Procedure usage guide documented in Part B2 (how to call, examples, error handling)
- All three parts are consistent with each other

#### Automated Verification (AI Gate)

1. Verify all parameters documented in B1 match the CREATE PROCEDURE definition
2. Verify return type documented in B1 matches actual return definition
3. Verify error codes documented in B1 match error throws in procedure code
4. Verify examples compile syntactically

**Expected:**
- All parameters documented with correct types and directions
- Return type matches definition exactly
- All error conditions from code are documented
- Example code is syntactically valid

#### Human Verification (Human Gate)

1. Review the procedure documentation — would a developer understand what this does?
2. Test calling the procedure with the provided examples
3. Verify error handling guide is clear and actionable
4. Confirm side effects are clearly documented (triggers, audit, cascades)

#### Success Criteria

✅ Procedure purpose and logic documented in Part A
✅ All parameters documented with types, directions, descriptions
✅ Return values and output parameters documented
✅ Error conditions and codes documented
✅ Transaction and locking behavior documented
✅ Side effects fully documented (triggers, audit, cascades)
✅ Performance considerations documented
✅ Procedure contract documented in Part B1
✅ Code examples added to B2 Consumer Guide
✅ Error handling guide documented in B2
✅ Transaction and concurrency guidance documented
✅ Extraction status updated
✅ Changes logged in Change Tracker

---

### Phase 5: Security, Indexes, and Performance Extraction (Part A Only)

#### Phase Identity

**Phase ID:** DB-EXTRACT-005
**Phase Name:** Security, Performance, and Tuning (Part A Only)

#### Goal

The security implementation (roles, grants, RLS), index strategy, query optimization patterns, and performance tuning guidelines are fully documented for Part A.

#### Dependencies

DB-EXTRACT-002 Global Infrastructure Extraction

#### Plan

1. **Security Configuration (Part A section 13):**
   - Read role definitions: role name, permissions, hierarchy
   - Read grant statements: who has what permission on which objects
   - Read RLS policy definitions: which policies apply, their conditions
   - Document role-based access control model
   - Document column-level permissions if applicable
   - Document how to grant/revoke permissions

2. **Index Strategy (Part A section 10):**
   - Identify all indexes: name, table, columns, type (B-tree, hash, etc.)
   - Document why each index was created
   - Document index maintenance strategy
   - Identify covering indexes and composite indexes
   - Document statistics and index fragmentation strategy

3. **Query Optimization (Part A section 24):**
   - Identify query patterns: common queries, slow queries
   - Document N+1 prevention strategies
   - Document join patterns and query hints
   - Document temporary table and CTE usage
   - Document statistics and execution plan strategies

4. **Backup and Recovery (Part A section 20):**
   - Document backup strategy: full, differential, transaction log
   - Document recovery procedures
   - Document point-in-time recovery capabilities

5. **Monitoring and Alerting (Part A section 23):**
   - Document performance baselines
   - Document monitoring queries
   - Document alert thresholds

#### Outcome

- Security implementation fully documented (Part A)
- Index strategy and rationale documented (Part A)
- Query optimization patterns documented (Part A)
- Performance baselines and monitoring documented (Part A)

---

### Phase 6: Anti-Patterns, Checklists, and Reference (All Parts)

#### Plan

1. **Part A Anti-Patterns (section 29):** Document common implementation mistakes found in code review history, slow queries, or observed patterns
2. **Part A New Entity Checklist (section 30):** Create step-by-step checklist for adding a new table, derived from observed patterns
3. **Part A Feature Walkthrough (Appendix A):** Write a complete example of implementing a new feature end-to-end
4. **Part B1 Final Validation:** Verify all Data Dictionary entries are complete, ERD is comprehensive, constraint definitions are accurate
5. **Part B2 Remaining Sections:**
   - Concurrency and transaction guidelines
   - Data retention and archival instructions
   - Testing and development database setup
   - FAQ and Troubleshooting (compiled from edge cases discovered)
   - Changelog (initial version)
6. **Part B2 Code Examples:** Ensure every major operation has examples in SQL and at least one programming language/ORM

---

## Change Tracking for Database Documentation

> **Common Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking for the universal change tracking rules, versioning convention, change types, and version alignment process. See `../_shared/templates/change-tracker-template.md` for the full Change Tracker file structure.

**Parts Affected:**
- A (Internal Database Documentation)
- B1 (Data Dictionary & ERD)
- B2 (Database Consumer Guide)
- Reference (Extraction Status, Verification Log)

**Location:** `docs/database/CHANGE-TRACKER.md`

**Key Responsibility:** At the start of each session, review previous Change Tracker entries to understand what's been documented. During extraction, log every entity/procedure documented. At the end of each session, summarize changes and use the tracker to identify documentation gaps.

---

## Scaffolding Approach — Structure Before Content

> **Universal Methodology:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for comprehensive principles and why scaffolding matters. Below are the Database-specific templates.

### Database Scaffolding Prompt

```
"Based on the Database Documentation Template and the file structure defined
in this phase guide, create the scaffolding structure for [DATABASE NAME]
documentation. This should establish files and section headers with NO CONTENT.

For Part A (Internal Documentation):
- Create file structure from 01-database-overview through 32-glossary
- Include headers for: foundation (sections 1-3), schema structure (4-10),
  procedures and triggers (11-13), data patterns (14-18), maintenance (19-22),
  optimization (23-26), error handling (27-28), anti-patterns (29),
  checklist (30), internal types (31), glossary (32), appendix (A)
- DO NOT extract content, only create the outline

For Part B1 (Data Dictionary & ERD):
- Create Entity sections for each table and view (headers only: Entity Overview,
  Attributes table structure, Relationships, Constraints)
- Create Relationship Definitions section
- Create Business Enumerations section
- Create Reference Data section
- Include ERD placeholder with note on tables/relationships to document

For Part B2 (Consumer Guide):
- Create sections 01-getting-started through 19-faq-and-troubleshooting
- Include subsections for: connection setup, authentication, schema navigation,
  common patterns, stored procedures, transactions, constraints, relationships,
  pagination, performance, error handling, nulls, enumerations, temporal data,
  retention, testing, code examples, FAQ, changelog
- DO NOT extract content, only create the section outline

Show ONLY structure and headers. I will approve this before you extract content."
```

---

## Best Practices

### Documentation Quality

1. **Verify Against Source:** Every documented constraint, index, or procedure signature must be verified against the actual DDL
2. **Document the Why:** Explain design decisions and constraint strategies, not just the what
3. **Be Specific:** Use exact names, types, and cardinality — not approximations
4. **Provide Examples:** Every procedure and complex query pattern needs realistic examples
5. **Link Across Parts:** Part B2 should reference Part B1 Data Dictionary definitions; Part A should reference Part B1 for scope

### ERD and Data Dictionary Alignment

1. **ERD Shows Relationships:** The Entity-Relationship Diagram should visually match the formal relationship definitions in the Data Dictionary
2. **Cardinality Clarity:** Every relationship in the ERD must have documented cardinality (1:1, 1:N, M:N)
3. **Cascade Rules:** Foreign key cascade rules (DELETE CASCADE, SET NULL) must be documented in both ERD and Data Dictionary
4. **View Representation:** Show views in the ERD or explicitly document why they're excluded

### Consumer Guide Practical Value

1. **Real Examples:** Code examples must work against actual schema — not theoretical
2. **Common Patterns:** Focus on how developers actually use the database (SELECT with JOIN, pagination, filtering)
3. **Error Scenarios:** Document common error conditions and how to handle them
4. **Performance Context:** Help developers understand which queries are fast and why
5. **Transaction Guidance:** Explain when to use transactions, isolation levels, and deadlock prevention

### Internal Documentation Precision

1. **Constraint Rationale:** For each constraint, document not just the rule but why it exists
2. **Index Purpose:** Every index should have a documented purpose and access pattern
3. **Trigger Side Effects:** Trigger documentation should include all side effects and cascading behaviors
4. **Data Retention:** Document how old data affects query performance and archival policies
5. **Growth Projections:** Document expected data growth and capacity planning

---

## Common Pitfalls and Solutions

### Pitfall 1: Documenting Only What's In The DDL

**Problem:** Documentation becomes mechanical — just listing column names and types without explaining business meaning.

**Solution:** For each table and column, document the business concept it represents. What real-world entity or attribute does this represent? Why does it exist?

```markdown
❌ BAD:
- status_code VARCHAR(10): Status code

✅ GOOD:
- status_code VARCHAR(10): The status of the order. Valid values are:
  - PENDING: Order received but not yet confirmed
  - CONFIRMED: Order confirmed and payment verified
  - SHIPPED: Order dispatched to customer
  - DELIVERED: Customer received order
```

### Pitfall 2: ERD Without Business Context

**Problem:** The ERD shows tables and foreign keys but doesn't explain why relationships exist.

**Solution:** Document the business logic behind relationships. Why does Order reference Customer? What happens if a Customer is deleted?

```markdown
Order → Customer (many-to-one, ON DELETE RESTRICT)
Business Logic: An order must belong to a customer. We prevent customer deletion
if they have orders (on-delete RESTRICT) to maintain order history integrity.
```

### Pitfall 3: Procedure Documentation Without Examples

**Problem:** Developers know the parameter names but not how to call the procedure.

**Solution:** Always provide working examples.

```sql
-- Example 1: Create order with default payment method
CALL sp_CreateOrder(
    @customerID = 12345,
    @orderDate = GETDATE(),
    @paymentMethodID = NULL  -- Uses customer's default
);

-- Example 2: Create order with specific payment method
CALL sp_CreateOrder(
    @customerID = 12345,
    @orderDate = GETDATE(),
    @paymentMethodID = 67890
);
```

### Pitfall 4: Ignoring Constraint Violations

**Problem:** Documentation doesn't explain what happens when constraints are violated.

**Solution:** Document error conditions and recovery strategies.

```markdown
### Constraint Violations and Recovery

**Unique Constraint on email:**
- Error: "Duplicate entry for key 'uk_users_email'"
- Cause: Attempting to insert a user with an email that already exists
- Recovery: Check if user already exists before inserting; update instead if applicable

**Foreign Key Constraint on orders.customer_id:**
- Error: "Cannot add or update child row: foreign key constraint fails"
- Cause: Referencing a customer_id that doesn't exist
- Recovery: Verify the customer exists using SELECT before referencing
```

### Pitfall 5: Procedure Documentation Without Side Effects

**Problem:** Developers call a procedure and triggers fire unexpectedly.

**Solution:** Always document side effects.

```markdown
### Side Effects

When sp_CancelOrder is called:
1. The order status is set to CANCELLED
2. **Trigger `tr_OrderStatusChanged` fires:** Sends notification email to customer
3. **Trigger `tr_OrderAudit` fires:** Logs status change to audit table with timestamp and user ID
4. **Cascading Delete (if enabled):** All order items are deleted (or status set to CANCELLED based on configuration)

Developer Note: These side effects happen automatically within the procedure execution.
Budget for them in transaction handling and error scenarios.
```

### Pitfall 6: Not Updating Documentation When Schema Changes

**Problem:** Documentation drifts from actual schema over time.

**Solution:** Link documentation to migrations and update change tracker religiously.

```markdown
## Migration Track Record

| Migration Date | Change | Documentation Updated? | Notes |
|---|---|---|---|
| 2024-01-15 | Added users.middle_name column | ✅ Yes | Updated entity definition |
| 2024-02-20 | Created vw_UserOrders materialized view | ✅ Yes | Added to ERD, data dictionary |
| 2024-03-10 | Changed orders.status_code constraint | ✅ Yes | Updated constraint and error docs |
```

---

## Prompt Templates and Examples

### Template 1: Database Inventory

```
Read the following DDL files and extract a complete inventory of:
1. All tables (name, schema, column count, purpose)
2. All views (name, materialized vs. real-time)
3. All stored procedures/functions (name, purpose, parameters)
4. All triggers (name, firing condition, affected table)
5. All indexes (name, table, columns, type)
6. All foreign keys (constraint name, tables, cascade rules)

Files to read:
[list DDL files]

Format the output as a CSV with columns:
ObjectType | ObjectName | SourceFile | Properties | Purpose
```

### Template 2: Data Dictionary Extraction

```
Create Data Dictionary entries for the following tables:

Tables: Users, Orders, OrderItems

For each table, document:

## Entity: [TableName]

### Entity Overview
- Formal Name: [Name]
- Description: [Business purpose]
- Approximate row count: [estimate]
- Update frequency: [how often data changes]

### Attributes

| Attribute | Type | Nullable | Constraint | Business Definition | Example |
|-----------|------|----------|-----------|-------------------|---------|
| [column] | [type] | [Y/N] | [PK/FK/UQ/CK/DEFAULT] | [business meaning] | [example] |

Refer to DDL:
[provide CREATE TABLE statements]

Verify every column against the DDL before documenting.
```

### Template 3: Procedure Documentation

```
Document the sp_CreateOrder stored procedure for all three parts.

Part A (Internal Implementation):
- Procedure purpose and business logic
- Parameter definitions with meanings
- Return values and output parameters
- Error conditions and codes
- Transaction boundaries
- Side effects (triggers, audit logs)
- Performance considerations

Part B1 (Procedure Contract):
- Signature with parameters
- Input validation rules
- Return value interpretation
- Error codes and meanings

Part B2 (Consumer Usage):
- How to call the procedure
- Working examples (SQL, ORM)
- Error handling and recovery
- Transaction handling considerations

Source code:
[provide procedure source code]
```

### Template 4: Constraint Documentation

```
Document all constraints on the Orders table:

For each constraint, document:
1. Constraint name
2. Type (PK / FK / UNIQUE / CHECK / DEFAULT)
3. Columns involved
4. Business rule it enforces
5. Error message when violated
6. How to handle the error in application code

Constraints to document:
[list constraints]

Example format:

### Constraint: pk_orders_order_id
- **Type:** Primary Key
- **Columns:** order_id
- **Business Rule:** Each order has a unique identifier
- **Violation Error:** "Duplicate entry for key 'pk_orders_order_id'"
- **Application Handling:** Use INSERT...RETURNING to get generated ID, never specify during insert

DDL Reference:
[provide CREATE TABLE statement]
```

---

## Quick Reference Checklist

> **Full Checklist:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist for comprehensive verification items common across all documentation types. Below are Database-specific additional checks.

### Database-Specific Pre-Extraction Checks

- [ ] Database type, version, and environment documented
- [ ] All DDL files and migration files identified and accessible
- [ ] Primary key strategy identified (IDENTITY/SEQUENCE/UUID/business key)
- [ ] Foreign key cascade rules identified and noted
- [ ] Trigger inventory and dependencies mapped
- [ ] View materialization strategy understood (real-time vs. scheduled refresh)
- [ ] Change Tracker initialized (`CHANGE-TRACKER.md`)
- [ ] Extraction status tracker initialized (`extraction-status.md`)
- [ ] Documentation scaffolding created (all three parts: Part A, B1, B2)

### Database-Specific Per-Entity Checks

- [ ] CREATE TABLE statement read and verified against DDL
- [ ] All columns documented with types, constraints, defaults, and business meaning
- [ ] All foreign keys documented with cardinality and cascade rules (DELETE/UPDATE behavior)
- [ ] All indexes documented with purpose and column list
- [ ] All triggers documented with firing conditions and side effects
- [ ] Entity definition created in Data Dictionary
- [ ] Entity added to Entity-Relationship Diagram (ERD)
- [ ] Consumer guide examples provided for querying this entity
- [ ] Extraction status updated in `extraction-status.md`
- [ ] Changes logged in Change Tracker

### Database-Specific Per-Procedure Checks

- [ ] CREATE PROCEDURE statement read and verified against actual procedure code
- [ ] All parameters documented with type, direction (IN/OUT), and constraints
- [ ] Return values and output parameters documented
- [ ] Error conditions and error codes documented
- [ ] Side effects documented (tables modified, triggers fired, audit entries created)
- [ ] Transaction boundaries and locking behavior documented
- [ ] Working code examples provided (SQL, ORM, application code)
- [ ] Error handling and recovery strategies documented
- [ ] Extraction status updated in `extraction-status.md`
- [ ] Changes logged in Change Tracker

### Database-Specific Final Verification

- [ ] All tables documented across all three parts (A, B1, B2)
- [ ] All stored procedures documented across all three parts
- [ ] All foreign keys verified in ERD and match actual DDL definitions
- [ ] All constraints documented and verified against actual constraint definitions
- [ ] All special patterns (soft delete, audit, temporal, generated columns) documented
- [ ] Data Dictionary entries are complete and consistent with actual schema
- [ ] ERD is comprehensive, accurate, and matches DDL relationships
- [ ] Consumer Guide provides practical, executable examples
- [ ] Internal Documentation explains rationale, design decisions, and schema philosophy
- [ ] Change Tracker is complete and up-to-date
- [ ] No contradictions between Parts A, B1, B2
- [ ] Verification log indicates all key artifacts have been verified against DDL

---

## Additional Resources

- **canonical-reverse-engineering-shape.md:** Universal principles, workflow, and scaffolding approach that apply across all documentation types
- **change-tracker-template.md:** Complete change tracking patterns and templates
- **Database-Doc-Template.md:** Part A internal documentation template structure
- **reverse-engineer-api-phase.md:** Structural patterns applicable to database documentation
- **AI-SDLC-Best-Practices-Info-Dump.md:** Broader AI-assisted documentation best practices

---

**Document Version:** 1.0
**Created:** 2026-04-05
**Last Updated:** 2026-04-06
