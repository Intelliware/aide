# Canonical Reverse Engineering Shape — Common Reference

**Purpose:** This document defines the shared foundations used by ALL reverse engineering phase documents. Rather than repeating identical content across every phase, each reverse engineering guide references this canonical shape for common principles, workflows, and approaches, and provides only its domain-specific adaptations.

**When to Use:** Every reverse engineering phase document (API, UI Framework, Web App, API Framework, Database, Mobile App, Mobile Framework) references this document. Read this document FIRST before reading any specific phase document.

**Relationship to Canonical Phase Shape:** The Canonical Phase Shape (`canonical-phase-shape.md`) defines the 8-section structure for **implementation plan phases** (forward engineering). This document defines the shared foundations for **reverse engineering process guides**. They serve fundamentally different purposes:

| Aspect | Canonical Phase Shape | Canonical RE Shape |
| --- | --- | --- |
| **Purpose** | Structure for implementation phases | Shared foundations for RE process guides |
| **Used By** | Implementation plans, phase execution | Reverse engineering phase documents |
| **Defines** | Phase Identity, Goal, Dependencies, Plan, Outcome, AI/Human Gates, Success Criteria | Core AI Principles, 7-Step Workflow, Scaffolding, Change Tracking, Guiding Principle |
| **Nature** | Output structure (what a phase looks like) | Process foundations (how RE guides work) |

---

## Table of Contents

- [Guiding Principle](#guiding-principle)
- [Core AI Principles for Documentation Extraction](#core-ai-principles-for-documentation-extraction)
- [The 7-Step Workflow](#the-7-step-workflow)
- [Change Tracking](#change-tracking)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Quick Reference Checklist — Common Items](#quick-reference-checklist--common-items)
- [How Phase Documents Reference This Document](#how-phase-documents-reference-this-document)

---

## Guiding Principle

> **If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "UNVERIFIED — needs source confirmation" instead.**

This principle applies universally to every reverse engineering phase, regardless of the repository type (API, UI framework, web app, database, mobile, etc.). Every fact in every documentation deliverable must be traceable to actual source code, configuration, schema definitions, or test assertions.

---

## Core AI Principles for Documentation Extraction

These six principles apply to ALL reverse engineering documentation extraction, regardless of repository type. Each phase document provides domain-specific "How to Apply" examples, but the principles themselves are universal.

### 1. AI is Intelligent, But Not Smart

**What this means for documentation extraction:**
- AI can read source code and produce impressive documentation, but it may misinterpret intent
- AI may document what it thinks the code *should* do rather than what it *actually* does
- Always verify AI-extracted documentation against the actual source code

**Universal application:**
- Have AI read source files one at a time or one module at a time, not the entire codebase at once
- After AI documents an artifact, verify every property, method, parameter, and behavior against the source
- Check default values — AI frequently invents plausible but wrong defaults
- Verify type signatures and schemas exactly — AI may simplify or generalize

### 2. Context is Critical

**What this means for documentation extraction:**
- AI needs to understand the system's philosophy and architecture before documenting individual artifacts
- Reading an artifact in isolation may miss system-wide conventions, shared types, and cross-cutting concerns
- Configuration, security, and infrastructure patterns affect how every component works

**Universal application:**
- Start with system overview and architecture before diving into individual artifacts
- Provide dependency files (package.json, pom.xml, build.gradle, etc.) for version context
- Provide configuration files for environment context
- Have AI read shared types, interfaces, and conventions before documenting artifacts that use them

### 3. AI Will Try to Do More Than Asked

**What this means for documentation extraction:**
- AI may generate documentation for features that don't exist based on naming conventions
- AI may "improve" the documented API/schema beyond what's in the source
- AI may invent plausible but fictitious parameters, methods, columns, or configurations

**Universal application:**
- Be explicit: "Document ONLY what exists in the source code. Do NOT invent features, parameters, or behaviors."
- After documenting, ask AI to show the exact source code line that proves each documented artifact
- State what NOT to do: "Do NOT generate examples that use APIs not present in the source."

### 4. Token Limitations Affect Depth

**What this means for documentation extraction:**
- Asking AI to document an entire codebase at once yields shallow, inaccurate documentation
- Complex artifacts with many properties, rules, or relationships need focused attention
- Multiple related source files for one feature may exceed context limits

**Universal application:**
- Document one feature, module, or component at a time
- For complex artifacts, break into: structure/API first, then behavior/logic, then edge cases
- Document global infrastructure once, then reference it for each feature

### 5. Verification is Non-Negotiable

**What this means for documentation extraction:**
- Every documented artifact must be verified against its source definition
- Default values must be verified, not assumed
- Type signatures, schemas, and constraints must be exact, not approximate
- Error conditions and edge cases must be verified against actual code paths

**Universal application:**
- After AI documents an artifact, cross-check every field, property, and method against the source
- Run tests (if they exist) to verify documented behavior
- Check for existing examples, demos, or integration tests that reveal expected behavior
- Flag anything that cannot be verified as "UNVERIFIED — needs source confirmation"

### 6. AI Has Short Memory (Session Only)

**What this means for documentation extraction:**
- Each session starts without knowledge of previously extracted documentation
- AI may document the same artifact differently across sessions
- Conventions established in one session won't carry forward automatically

**Universal application:**
- At the start of each session, have AI read the documentation produced so far
- Reference the system overview and conventions before documenting new artifacts
- Commit documentation frequently so it's always current
- Use the scaffolding structure as a map for what's done and what remains

---

## The 7-Step Workflow

The 7-Step Workflow is the universal process for extracting documentation from source code. It is repeated for each section, feature, or module being documented. Each phase document provides domain-specific prompt templates and examples, but the workflow structure is identical.

### Step 1: Set Context of Deliverable

**Purpose:** Establish what you're extracting and which documentation parts you're producing.

**What to include in the context prompt:**
- Which system/repository you're documenting and its version
- Which documentation parts you're producing (e.g., Part A and Part B, or Part A, B1, and B2)
- Which section/feature/module you're currently documenting
- Which source files will be read
- The explicit instruction: "Document ONLY what exists in the source code"

### Step 2: Set Context of Audience/Environment/Components

**Purpose:** Define the technical environment and identify all relevant source files.

**What to identify:**
- All source files for the artifact being documented
- Shared types, interfaces, enums, and models used
- System-wide conventions that apply (naming, error handling, authentication)
- Test files that reveal expected behavior
- Configuration files that affect behavior

### Step 3: Refine the Feedback

**Purpose:** Correct AI's understanding before extraction begins.

**What to correct:**
- System-specific conventions AI won't know from reading code alone
- Deprecated patterns vs. current patterns
- Technology-specific nuances (e.g., "uses OnPush change detection," "uses cursor pagination not offset")
- Explicit exclusions (e.g., "ignore the v1 folder, only document v2")

### Step 4: Create Scaffolding Structure

**Purpose:** Establish the documentation file structure and headers WITHOUT content.

**Critical rule:** Do NOT let AI generate content at this stage. Only structure and headers.

**What to produce:**
- File structure for each documentation part
- Section headers within each file
- Mapping of inventory items to sections
- Recommended extraction order

### Step 5: Create Content Chunk-by-Chunk

**Purpose:** Extract documentation incrementally with verification at each step.

**Universal process for each chunk:**
1. Read the relevant source files
2. AI extracts and documents following the template
3. Human verifies against source code
4. Correct any inaccuracies
5. Determine which documentation part(s) the content belongs to
6. Log changes in the Change Tracker
7. Move to next chunk

### Step 6: Add Supporting Documents

**Purpose:** Provide additional context AI needs for accurate extraction.

**Universal supporting documents:**
- README and any existing documentation
- Dependency/package files (for version information)
- Configuration files (for environment context)
- Test files (reveal expected behavior and edge cases)
- Existing documentation (may be partially correct — useful as starting point, but must be verified)

### Step 7: Verify Understanding

**Purpose:** Ensure AI has correctly understood the source code before documenting.

**Universal verification approach:**
- Ask AI to list what it found before generating documentation
- Have AI show specific source code lines that prove documented behaviors
- Verify counts: "You said there are 12 endpoints — list them all with their route decorators"
- Check for completeness: "Are there any artifacts you found but didn't document? Why?"

---

## Change Tracking

All reverse engineering phase documents use a common Change Tracking approach. The structure, versioning convention, change types, and rules are standardized. Each phase document specifies its own **Parts Affected** values (reflecting its documentation model), while the tracking structure itself is defined in the **Change Tracker Template** (`../_shared/templates/change-tracker-template.md`).

### Versioning Convention

Documentation versions follow the source system's version with a documentation revision suffix:
- `X.Y.Z-doc.1` = Documentation revision 1 for source version X.Y.Z
- `X.Y.Z-doc.2` = Documentation revision 2 (correction) for source version X.Y.Z
- `X.Y.Z+1-doc.1` = First documentation for new source version

### Change Types

These change types are universal across all reverse engineering phases:

| Change Type | When to Use |
| --- | --- |
| **Initial Extraction** | First-time documentation of an artifact from source code |
| **Correction** | Fixing an error in existing documentation (wrong type, wrong default, wrong schema, etc.) |
| **Source Update** | Documentation update triggered by a source code change |
| **Restructure** | Reorganizing documentation structure without changing technical content |
| **Addition** | Adding documentation for a newly discovered or newly added artifact |
| **Deprecation** | Marking an artifact as deprecated in documentation |
| **Removal** | Removing documentation for a removed artifact |

### Universal Rules for Change Tracking

1. **Every documentation modification must be logged** — no exceptions
2. **Include the source version** the change corresponds to
3. **Record which Parts are affected** — use the Parts Affected values as defined in the referencing phase document (e.g., "A / B1 / B2" for API, "A / B" for frameworks)
4. **Document verification method** — how was accuracy confirmed against source code?
5. **Record cross-impact** — when changing one section, what other sections were affected?
6. **Use sequential numbering** — change numbers never reset, always increment
7. **Batch related changes** — if a source update affects many artifacts, log as one change with a list of affected items, not separate changes per artifact

### When to Update the Change Tracker

- After every extraction session
- When the source system releases a new version and documentation must be updated
- When a documentation error is discovered and corrected
- When documentation is restructured or reorganized
- When artifacts are deprecated or removed
- During documentation review cycles

### Source Version Alignment Process

When the source system releases a new version:

1. Read the CHANGELOG, release notes, or diff
2. Identify breaking changes, new features, deprecated features, and removed features
3. For each change, determine which documentation sections are affected
4. Update affected sections across all relevant documentation parts
5. Log all changes in the Change Tracker with the new source version
6. Update the "Current Version" at the top of the Change Tracker
7. Increment the documentation version
8. Update the extraction status tracker if new artifacts were added

### Parts Affected — Phase-Specific Values

Each phase document defines its own Parts Affected values in its **Change Tracking** section. The Change Tracker Template uses a "Parts Affected" column where you populate the values as defined in the referencing phase document:

| Phase Document | Parts Affected Values | Meaning |
| --- | --- | --- |
| reverse-engineer-api-phase.md | A / B1 / B2 / All | A=Internal, B1=OpenAPI, B2=Companion Guide |
| reverse-engineer-ui-framework-phase.md | A / B / Both | A=Full Framework, B=Implementer |
| reverse-engineer-web-app-phase.md | A / B / Both | A=Internal App, B=Overview & Integration |
| reverse-engineer-api-framework-phase.md | A / B / Both | A=Internal Framework, B=Implementer |
| reverse-engineer-database-phase.md | A / B1 / B2 / All | A=Internal DB, B1=Data Dictionary, B2=Consumer Guide |
| reverse-engineer-mobile-app-phase.md | A / B / Both | A=Internal App, B=Overview & Integration |
| reverse-engineer-mobile-framework-phase.md | A / B / Both | A=Internal Framework, B=Implementer |
| build-knowledge-repository-phase.md | (per component) | As defined in its change tracking section |

---

## Scaffolding Approach — Structure Before Content

### Why Scaffolding First?

- **Control:** You negotiate structure before investing in extraction
- **Inventory Alignment:** Scaffolding maps 1:1 to the artifact inventory from discovery
- **Multi-Part Consistency:** Ensures all documentation parts have a home for every piece of information
- **Prevents AI Overreach:** AI documents what exists, not what it imagines
- **Progress Tracking:** Partially filled scaffolding shows exactly what remains

### Universal Scaffolding Process

1. **Complete the discovery/inventory phase** — know what artifacts exist before creating structure
2. **Propose scaffolding** — ask AI to generate file structure and section headers based on the template, the inventory, and the documentation model (Part A, Part B, etc.)
3. **Review and negotiate** — adjust the structure based on the actual codebase (some sections may not apply; some may need expansion)
4. **Approve before extracting** — never generate content until the structure is agreed upon
5. **Use scaffolding as progress tracker** — mark sections as they're completed

### Scaffolding Prompt Pattern

```
"We have completed the [artifact] inventory. Based on the [Template Name],
propose the scaffolding for:
- Part [X] ([audience]) — file structure and section headers
- Part [Y] ([audience]) — file structure and section headers

For each file, show:
- File path
- Section headers
- Which inventory items map to each section

Show structure ONLY. Do NOT extract any content yet."
```

Each phase document provides a domain-specific version of this prompt with its actual template name, parts, and audiences.

---

## Quick Reference Checklist — Common Items

The following checklist items are common across ALL reverse engineering phases. Each phase document adds its own domain-specific checklist items.

### Before Starting Extraction (Common)

- [ ] Source code accessible and version identified
- [ ] Extraction status tracker created
- [ ] Change tracker created (using change-tracker-template.md)
- [ ] Scaffolding structure approved for all documentation parts
- [ ] New conversation started (fresh context)

### For Each Extraction Session (Common)

- [ ] AI has read existing documentation and conventions
- [ ] Source files for the feature/module/artifact are identified
- [ ] AI reads the relevant source files completely (not just summaries)
- [ ] All documentation parts updated for this artifact
- [ ] All parts are consistent with each other (no contradictions)
- [ ] Extraction status updated
- [ ] Changes logged in Change Tracker
- [ ] Documentation committed

### Change Tracker Checklist (Common)

- [ ] Every extraction session logged
- [ ] Change type specified
- [ ] Parts affected specified (using values defined in the phase document)
- [ ] Source version recorded
- [ ] Verification method documented
- [ ] Cross-part impact assessed and documented
- [ ] Change number incremented sequentially

### Final Verification (Common)

- [ ] All inventoried artifacts documented in all relevant parts
- [ ] No internal details leaked into consumer-facing parts
- [ ] Extraction status shows 100% complete and verified
- [ ] Change tracker is up to date
- [ ] Documentation version aligned with source version

---

## How Phase Documents Reference This Document

Each reverse engineering phase document should:

1. **Reference this document** in its Source Documents header:
   ```
   **Source Documents:** [domain-template].md, canonical-reverse-engineering-shape.md, change-tracker-template.md
   ```

2. **Not repeat** the Core AI Principles, 7-Step Workflow structure, Scaffolding philosophy, or Change Tracking rules. Instead, reference them:
   ```
   > **Core AI Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles
   > for Documentation Extraction. The six universal principles (AI is Intelligent But Not Smart,
   > Context is Critical, AI Will Try to Do More Than Asked, Token Limitations Affect Depth,
   > Verification is Non-Negotiable, AI Has Short Memory) apply to all extraction work.
   > Below are the domain-specific "How to Apply" examples for [this domain].
   ```

3. **Provide domain-specific content** that this canonical shape cannot generalize:
   - Domain-specific "How to Apply" examples for each AI principle
   - Domain-specific 7-Step Workflow prompt templates
   - Domain-specific extraction phases (the actual phase-by-phase extraction process)
   - Domain-specific best practices, pitfalls, and prompt templates
   - Domain-specific documentation model (which parts, what audiences)
   - Domain-specific Quick Reference Checklist items
   - Domain-specific Change Tracking Parts Affected values

4. **Define its Parts Affected values** in a Change Tracking section:
   ```
   ## Change Tracking — Parts Affected Values

   This phase produces [N] documentation parts. When logging changes in the
   Change Tracker (see `../_shared/templates/change-tracker-template.md`), use the following
   values in the "Parts Affected" column:

   | Value | Meaning |
   | --- | --- |
   | A | [Part A description] |
   | B | [Part B description] |
   | Both | All parts affected |
   ```

---

## The Quality Chain

This quality chain applies universally to all reverse engineering documentation:

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work. This is why verification is non-negotiable and change tracking is mandatory.

---

## Additional Resources

- **Change Tracker Template:** `../_shared/templates/change-tracker-template.md`
- **Canonical Phase Shape (for implementation plans):** `../implementation-planning/phases/canonical-phase-shape.md`
- **Phase Execution Guide:** `../implementation-execution/phases/phase-execution-guide.md`
