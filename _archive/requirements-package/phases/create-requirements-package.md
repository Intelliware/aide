# Create Requirements Package - Training Info Dump

**Purpose:** Comprehensive reference for training new AI users on Phase 1 of the AI SDLC - Creating the Requirements Package.

**Target Audience:** Business Analysts, Product Owners, Developers new to AI-assisted requirements gathering, Project Managers.

**Source Documents:** AI-SDLC-Best-Practices-Info-Dump.md, AI-Assisted-Coding-Playbook.md, Business-Requirements-Gathering-Guide.md, Business-Requirements-Review-Guide.md, Solution-Requirements-Gathering-Guide.md, change-tracker-template.md, docs/requirements/ examples.

---

## Table of Contents

- [What is the Requirements Package?](#what-is-the-requirements-package)
- [Why Requirements Matter - Impact on Downstream Phases](#why-requirements-matter---impact-on-downstream-phases)
- [Core AI Principles for Requirements Gathering](#core-ai-principles-for-requirements-gathering)
- [The 7-Step Workflow for Requirements](#the-7-step-workflow-for-requirements)
- [Requirements Package Components](#requirements-package-components)
- [Business Requirements Gathering Process](#business-requirements-gathering-process)
- [Business Requirements Review Process](#business-requirements-review-process)
- [Scaffolding Approach - Structure Before Content](#scaffolding-approach---structure-before-content)
- [Best Practices for Requirements Gathering](#best-practices-for-requirements-gathering)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is the Requirements Package?

### Definition

The Requirements Package is **not a traditional BRD** (Business Requirements Document). It is more holistic and detailed than epics and user stories, encompassing stable business logic and functional expectations that will drive solution design and code creation.

### Key Characteristics

- **More than a BRD:** Comprehensive set of documents covering business context, stakeholders, objectives, functional requirements, business rules, data requirements, and more
- **Stable Foundation:** Contains information that is unlikely to change (business logic, functionality, key expectations)
- **Excludes UI Details:** Changeable details like UI specifics belong in the Solution Design phase
- **Functional Flow User Stories:** User stories delivered as a functional flow, more comprehensive than typical user stories, closer to Epic level

### What Belongs in Requirements vs. Solution Design

| **Requirements (Stable)** | **Solution Design (Changeable)** |
| --- | --- |
| Business objectives | UI/UX details |
| Stakeholders and personas | Technology choices |
| Functional requirements | API contracts |
| Business rules | Database schemas |
| Data requirements (what data, sources) | Implementation patterns |
| Acceptance criteria | Screen layouts |
| Permissions and roles | Color schemes, branding |
| Non-functional expectations | Specific tech stack decisions |

**Guiding Principle:** Ask yourself: "Will this change if we rebrand or change UI frameworks?" If yes → Solution Design. If no → Requirements.

---

## Why Requirements Matter - Impact on Downstream Phases

Understanding how requirements influence the other two phases helps you create better requirements.

### Impact on Solution Design (Phase 2)

The Requirements Package directly drives:

- **Technology Selection:** Data requirements inform database choices; integration requirements inform API patterns
- **Architecture Decisions:** Scalability requirements, user volumes, and performance expectations shape architecture
- **Security Design:** Permission models, authentication requirements, and data sensitivity determine security approach
- **Integration Strategy:** Business processes and data flow requirements define integration points

**Example:** If your requirements specify "system must support 500 concurrent users with sub-2-second response times," the solution design must account for this in architecture, caching, and infrastructure decisions.

### Impact on Code Creation (Phase 3)

Requirements provide the specification that code must implement:

- **Functional Requirements → Features:** Each FR becomes functionality to implement
- **Business Rules → Code Logic:** Business rules become validation logic, calculations, and workflows
- **Acceptance Criteria → Tests:** Acceptance criteria become test cases
- **Data Requirements → Models:** Entity definitions and relationships become database schemas and domain models
- **Permissions → Authorization:** Role-based access becomes security implementations

**Critical Insight:** Poor or incomplete requirements lead to:

- Rework during coding phase
- Features that don't meet business needs
- Missing edge cases and validation
- Scope creep and unclear boundaries

### The Persistent Memory Problem

AI does not retain information between sessions. Your Requirements Package serves as the "persistent memory" that:

- Bridges work sessions
- Provides context to AI in future phases
- Ensures consistency across solution design and code
- Acts as the single source of truth

**This is why documentation matters:** Without proper requirements documents, you lose continuity. Each new session with AI starts fresh—the requirements documents allow you to re-establish context.

---

## Core AI Principles for Requirements Gathering

### 1. AI is Intelligent, But Not Smart

**What this means for requirements:**

- AI can generate impressive requirements documentation, but it doesn't truly "understand" your business
- Always verify AI understands your intent before it generates content
- AI can miss edge cases or make assumptions

**How to apply:**

- Before moving forward, ask AI to summarize what you've asked it to learn
- Verify deliverables upfront: "What are the components of a requirements package? Who is the audience?"
- Review AI-generated requirements with the same scrutiny as human-written work

### 2. Context is Critical

**What this means for requirements:**

- Quality of requirements output directly correlates with quality of context you provide
- Setting clear context dramatically improves results
- Context includes: business problem, stakeholders, constraints, goals, and existing systems

**How to apply:**

- Always explain the business problem before asking for requirements
- Be explicit about what you want AND what you don't want
- Include relevant constraints (regulatory, organizational, technical)

### 3. AI Will Try to Do More Than Asked

**What this means for requirements:**

- AI will try to include prior content from the same conversation, even if unwanted
- It may generate solution-level details when you only asked for requirements
- It may create files or content you didn't request

**How to apply:**

- For a new task, start a new conversation
- Tell AI exactly what you want it to write/create, and what you don't want
- Example: "Define the functional requirements. Do not include UI mockups or technology choices."

### 4. Token Limitations Affect Depth

**What this means for requirements:**

- AI has a maximum output per call
- Asking for many topics at once results in high-level, shallow content
- Asking about one topic at a time yields detailed content

**How to apply:**

- Focused questions get detailed answers; broad questions stay high-level
- Break requirements gathering into chunks (personas, then functional requirements, then business rules, etc.)
- Don't ask AI to generate the entire requirements package at once

### 5. Verification Prompts Are Essential

**What this means for requirements:**

- Asking "Do you understand?" triggers AI to communicate back what it understands
- This ensures AI will meet the intention of your ask
- Prevents wasted effort on misunderstood requirements

**How to apply:**

- Always verify AI understands context by asking it to summarize before proceeding
- Example: "Before we create the stakeholder personas, summarize what you understand about the project."

### 6. AI Has Short Memory (Session Only)

**What this means for requirements:**

- AI does not retain information between sessions
- When you close a conversation and start new, AI has no memory of previous work
- Decisions in one session won't automatically carry forward

**Why documentation matters:**

- Requirements documents become the "persistent memory"
- At the start of each session, re-establish context by having AI read existing artifacts
- Commit and document frequently so progress isn't lost

---

## The 7-Step Workflow for Requirements

The 7-Step Workflow is repeated within the Requirements phase to ensure consistency and quality.

### Step 0: Section Relevance Check

**Purpose:** Before investing time in the full workflow for a section, confirm it applies to this project. Update the completeness tracker (`requirements-package-completeness-tracker.md`) after each decision.

**When this step is used:**

- **During initial planning (Step 4 of the gathering process):** AI reviews all files at once and presents a bulk recommendation. This is the primary mechanism for determining file relevance.
- **During content creation:** If a file's relevance comes into question while working on it (e.g., turns out to be empty or redundant), use this check to re-evaluate.

**Before starting any section, ask:**

- "Is this section relevant to your project?"
- If the section has sub-sections, ask whether the section as a whole applies — individual sub-sections can be trimmed during scaffolding.

**Possible outcomes:**

| Response | Action | Tracker Status |
|----------|--------|----------------|
| **Yes** | Proceed to Step 1 for this section | In Progress |
| **No** | Ask for the reason, record it, and move to the next section | N/A — [reason] |
| **Skip** | Move to the next section — the user will come back to this one later | Skipped |
| **Not sure** | Explain what the section covers and what kind of project would need it. Then ask again — the user must choose Yes, No, or Skip before moving on. | *(no change until user decides)* |

**After each decision**, update the completeness tracker with the new status.

**At the end of all sections**, review the completeness tracker for any files still marked "Skipped" and prompt the user to revisit them.

**Why this matters:** Not every project needs every section. Skipping irrelevant sections saves time and keeps the requirements package focused. The tracker provides a single view of progress across the entire package.

### Step 1: Set Context of Deliverable

**Purpose:** Establish what you're creating and why.

**For Requirements Phase:**

```
"We are going to gather requirements for a [PROJECT NAME] system. This system will 
[HIGH-LEVEL PURPOSE]. We are in the Requirements phase and will be creating the 
requirements package."
```

**What to include:**

- That you're in the Requirements phase
- What type of system/application you're building
- High-level business purpose

### Step 2: Set Context of Audience/Environment/Components

**Purpose:** Define who will use these requirements and what components are needed.

**Example Prompts:**

- "Who is the usual audience for requirements documents?"
- "What are the typical components of a comprehensive requirements package?"
- "What should be included in a BRD for an internal business application?"

**Have AI suggest:**

- Stakeholder types
- Required document sections
- Standard components
- Environmental constraints

### Step 3: Refine the Feedback

**Purpose:** Customize AI's suggestions to your specific needs.

**Example Prompts:**

- "Add [SPECIFIC STAKEHOLDER ROLE] to the stakeholders list"
- "We need to include compliance requirements for [REGULATION]"
- "The system must integrate with [EXISTING SYSTEM]"
- "Remove [COMPONENT] - that's out of scope for this project"

**What to refine:**

- Add missing stakeholders
- Specify organizational constraints
- Include regulatory requirements
- Adjust for your organization's standards

### Step 4: Create Scaffolding Structure

**Purpose:** Establish the file structure and headers WITHOUT content.

**Critical:** Do NOT let AI generate content at this stage. Only structure and headers.

**Example Prompt:**

```
"Propose how you would structure the requirements package. What files would we need 
and what are the major headers in each file? Show me the structure only, do not 
create the content yet."
```

**Process:**

1. AI proposes structure
2. You negotiate/refine the structure
3. Once agreed, AI creates file structure and headers ONLY
4. Review structure before proceeding

### Step 5: Create Content Chunk-by-Chunk

**Purpose:** Build requirements content incrementally with verification at each step.

**Example Prompts:**

- "Now create the stakeholder personas section"
- "Now document the functional requirements for [FEATURE AREA]"
- "Now define the business rules for [PROCESS]"

**Process:**

1. Select the next chunk (e.g., one section, one feature area)
2. Run the Section Relevance Check (Step 0) — confirm the section applies before proceeding
3. Ask AI to create it
4. Review the output
5. Refine/correct as needed
6. Move to next chunk

**Tips:**

- One chunk = one logical unit (one document section, one feature area)
- Verify each chunk before moving on
- Don't generate multiple sections simultaneously

### Step 6: Add Supporting Documents

**Purpose:** Provide additional context AI needs to understand.

**Example Documents:**

- Existing business process documentation
- Current system documentation
- Regulatory requirements
- Stakeholder interview notes
- Wireframes or concepts (for context, not UI details)
- Business rules from other systems

**How to add:**

- Upload files to the conversation
- Reference existing files in the codebase
- Paste relevant excerpts

### Step 7: Verify Understanding

**Purpose:** Ensure AI has read and understood supporting documents.

**Example Prompts:**

- "Summarize the document I just uploaded"
- "What are the key business rules from that document?"
- "What stakeholders are mentioned in that material?"
- "Do you understand the current process flow?"

**Why this matters:**

- Confirms AI has processed the information
- Reveals misunderstandings early
- Allows correction before proceeding

---

## Requirements Package Components

The requirements package is structured as **separate files — one per section** — rather than a single monolithic document. This makes it easier for AI to locate and read specific information without loading the entire package, and keeps each section focused and maintainable.

The template files live in `templates/` with numbered prefixes (`00-index.md`, `01-executive-summary-business-context.md`, etc.). When creating a project's requirements package, copy the relevant templates into the project folder and populate them.

A comprehensive requirements package typically includes these sections (each as its own file):

### 1. Executive Summary & Business Context

**Purpose:** High-level overview for executives and stakeholders.

**Contents:**

- Executive Summary (what we're building and why)
- Current State (how things work today)
- Pain Points (problems being solved)
- Business Drivers (why now)
- Success Metrics (how we'll measure success)

### 2. Stakeholders & Personas

**Purpose:** Define who is involved and who will use the system.

**Contents:**

- Key Stakeholders (primary and secondary)
  - Role and responsibilities
  - Influence level
  - Success criteria
- User Personas (for each user type)
  - Name and role
  - Goals and motivations
  - Pain points
  - Technical capabilities
  - How they'll use the system
- Approval Workflows (if applicable)

### 3. Business Objectives & Success Criteria

**Purpose:** Define what success looks like.

**Contents:**

- Primary Objectives (main goals)
- Secondary Objectives (nice-to-haves)
- Success Criteria (specific, measurable outcomes)
- Key Performance Indicators (KPIs)

### 4. Functional Requirements

**Purpose:** Define WHAT the system must do.

**Contents:**

- Organized by functional area (e.g., FR1: People Management, FR2: Project Management)
- Each requirement uniquely numbered (FR1.1, FR1.1.1)
- Clear "shall" statements
- Conditions and acceptance criteria
- Related requirements cross-referenced

**Structure Example:**

```markdown
## FR1: People Management

### FR1.1: Profile Management

**FR1.1.1**: The system shall maintain a profile for each active user.

**FR1.1.2**: Each profile shall include the following mandatory fields:
- First Name
- Last Name
- Role
- Status
```

### 5. Functional Specifications

**Purpose:** Define HOW functional requirements are implemented (workflow level).

**Contents:**

- Step-by-step workflows
- Inputs and outputs for each process
- System behavior descriptions
- Traceability to functional requirements (e.g., "Implements: FR1.1.4")

### 6. Business Logic & Rules

**Purpose:** Document the rules that govern system behavior.

**Contents:**

- Business Rules (by area: People, Projects, Allocations, etc.)
- Calculations & Formulas
- Validation Rules
- State Transitions

### 7. User Journeys

**Purpose:** Document how users interact with the system end-to-end.

**Contents:**

- Journey Framework (structure for documenting journeys)
- Journeys by Role (Resource Manager, Delivery Manager, etc.)
- Cross-functional Journeys

### 8. Acceptance Criteria

**Purpose:** Define how we verify requirements are met.

**Contents:**

- Feature Verification criteria
- Test Scenarios (happy path, error cases, edge cases)

### 9. Views & Dashboards

**Purpose:** Define information architecture (WHAT to show, not HOW it looks).

**Contents:**

- Navigation Structure
- Dashboard Views by Role
- List Views and Detail Views
- Filter and Sort Requirements

**Note:** Focus on information requirements, not UI design.

### 10. Data Requirements

**Purpose:** Define what data the system needs.

**Contents:**

- Core Entities (what data objects exist)
- Key Attributes (mandatory and optional fields)
- Relationships (one-to-many, many-to-many)
- Historical Data Requirements
- Data Retention Policies

### 11. Permissions & Access Control

**Purpose:** Define who can do what.

**Contents:**

- User Roles
- Permissions per Role
- Data Access Rules

### 12. Non-Functional Requirements

**Purpose:** Define system qualities (not features).

**Contents:**

- Performance requirements
- Scalability requirements
- Security requirements
- Usability requirements
- Reliability requirements
- Compliance requirements

### 13. Assumptions, Constraints & Out of Scope

**Purpose:** Define boundaries and limitations.

**Contents:**

- Business Assumptions
- Constraints (budget, time, technology, regulatory)
- Out of Scope (explicit list of what we're NOT building)
- Future Considerations

---

## Business Requirements Gathering Process

### Overview

The Business Requirements Gathering Guide provides a structured process for gathering all business and user-focused information needed before technical requirements.

### Step-by-Step Process

#### Step 0: Project Setup

**Goal:** Establish project name and set up version control.

**Actions:**

- Ask for project name
- Create project-specific copy of the guide
- Create version control branch
- Begin gathering requirements

#### Step 1: Project Foundation

**Goal:** Establish what you're building and why from a business perspective.

**Questions to Answer:**

- What problem are we solving?
  - What business problem or opportunity does this address?
  - What pain points exist today?
  - What happens if we don't solve this?
- What is the high-level solution?
  - What type of system/application are we building?
  - What is the core purpose in one sentence?
  - What are the main capabilities it must have?
- What are the project boundaries?
  - What is in scope?
  - What is explicitly out of scope?
  - Are there any constraints or limitations?

#### Step 2: Business Objectives and Success Criteria

**Goal:** Define what success looks like from a business perspective.

**Questions to Answer:**

- What are the business objectives?
  - What business goals does this support?
  - How will we measure success?
  - What are the key performance indicators?
- What are the success criteria?
  - What must be true for this to be considered successful?
  - What are the minimum viable outcomes?
  - What would make this a failure?
- What is the timeline?
  - When does this need to be delivered?
  - Are there critical milestones or deadlines?
  - What is the priority level?

#### Step 3: Stakeholders and Users

**Goal:** Identify who is involved and who will use the system.

**Questions to Answer:**

- Who are the stakeholders?
  - Who sponsors this project?
  - Who makes decisions?
  - Who provides input?
  - Who approves requirements?
- Who are the end users?
  - Who will use this system?
  - What are their roles/titles?
  - How many users are there?
  - What is their technical skill level?
- What are the user personas? For each user type:
  - Name and role
  - Goals and motivations
  - Pain points
  - Technical capabilities
  - How they'll use the system

#### Step 4: File Relevance Recommendation

**Goal:** Based on the context gathered so far (Steps 1-3), recommend which requirements package files should be filled in and which can be skipped or marked N/A.

**Why now:** By this point the AI knows the business problem, scope boundaries, objectives, stakeholders, and user personas — enough context to make informed recommendations about which files are relevant.

**Actions:**

1. AI reviews the full list of requirements package template files against the context gathered in Steps 1-3
2. AI presents a recommendation for each file using the completeness tracker format:

| # | Requirements Package File | Recommendation | Reasoning |
|---|--------------------------|----------------|-----------|
| 1 | Executive Summary & Business Context | Yes | [Why it applies] |
| 8 | Views & Dashboards | Skip | [Why it may not be needed yet] |
| ... | ... | ... | ... |

3. For each file, AI recommends one of: **Yes** (fill in), **No** (N/A — with reason), or **Skip** (come back later)
4. User reviews the recommendations and confirms or overrides each one
5. AI updates the completeness tracker with the agreed decisions
6. Commit the completeness tracker

**Key rule:** The user always has final say. AI recommendations are a starting point, not a decision.

#### Step 5: Scaffold Requirements Documents

**Goal:** Create the file structure for requirements documents before gathering detailed information.

**Critical Principle:** Scaffolding should happen BEFORE creating detailed content. Each section is its own file.

**Actions:**

1. Copy the template files from `templates/` into the project's requirements folder — only for files marked "Yes" or "Skip" in the completeness tracker (not files marked N/A)
2. User reviews and refines the file list and section headers
3. AI populates files with content gathered so far (Steps 1-3)
4. Commit the scaffolding

#### Step 6: Functional Requirements (Business Perspective)

**Goal:** Define what the system must do from a business/user perspective.

**Questions to Answer:**

- What are the main features?
  - What are the core features/capabilities?
  - What are the nice-to-have features?
  - How do features relate to each other?
- What are the user workflows? For each user type:
  - What tasks do they need to perform?
  - What is the step-by-step process?
  - What are the entry and exit points?
- What are the business rules?
  - What rules govern how the system behaves?
  - What validations are required?
  - What calculations or logic must be applied?
  - What are the exception cases?
- What integrations are needed? (Business View)
  - What other systems does this need to work with?
  - What business processes depend on this?
  - What data needs to flow between systems?

#### Step 7: Data Requirements (Business Perspective)

**Goal:** Define what data the system needs from a business perspective.

**Questions to Answer:**

- What existing systems or databases need to be integrated?
- Are there any other existing systems or databases from which information will need to be pulled?
- What data must be captured?
  - What information must users be able to enter?
  - What information must be stored?
  - What information must be displayed?

#### Step 8: Non-Functional Requirements (Business Expectations)

**Goal:** Define business expectations for how the system performs.

**Questions to Answer:**

- What are the performance expectations?
  - How fast should the system respond?
  - How many users will use it simultaneously?
  - Are there peak usage times?
- What are the usability requirements?
  - What is the target user experience?
  - Are there accessibility requirements?
  - What devices/platforms must be supported?

#### Step 9: Constraints and Assumptions (Business)

**Goal:** Document business limitations and assumptions.

**Questions to Answer:**

- What are the business constraints?
  - Budget constraints
  - Time constraints
  - Resource constraints
  - Regulatory/legal constraints
  - Organizational constraints
- What are the business assumptions?
  - What are we assuming about users?
  - What are we assuming about business processes?
  - What are we assuming about the business environment?

#### Step 10: Dependencies and Risks (Business)

**Goal:** Identify what could impact the project from a business perspective.

**Questions to Answer:**

- What are the business dependencies?
  - What other projects does this depend on?
  - What business decisions are pending?
  - What approvals are required?
  - What external factors affect this?
- What are the business risks?
  - What could go wrong from a business perspective?
  - What are the mitigation strategies?

### Handling Skipped Questions

- If you say "skip this question" → AI tracks it and asks again at the end
- If you say "this is not a valid question" or "out of scope" → Treated as a valid answer, not asked again

### Context Management

At the end of each step, if conversation context is at 80% or more, AI will recommend starting a new conversation to continue. When restarting, use the provided prompt to resume at the appropriate step.

### Version Control

After each step, AI will prompt to commit changes:

- Commit messages follow format: "Step X requirements" or "Step X-Y requirements"
- Commit frequently to avoid losing work

---

## Business Requirements Review Process

### Purpose

Review and validate business requirements for accuracy, completeness, and alignment with business objectives before proceeding to technical requirements or implementation.

### Review Process Overview

1. AI identifies all requirements document files
2. For each file, go through each section one by one
3. Each section's content is presented for review
4. Request changes (made in chat only until approved)
5. Once approved, write to file
6. Handle skipped sections at end of file
7. Handle cross-file impacts
8. Verify all sections reviewed
9. Commit changes

### Key Review Actions

**For each section, you can:**

- Request specific changes (AI makes them in chat)
- Say "skip" to review later
- Say "this section is invalid" or "doesn't need to be here" to mark for removal
- Confirm it's fine as-is

### Cross-File Impact Check

When a section is changed and approved:

- AI searches through other requirements files for:
  - References to changed content
  - Dependencies on changed content
  - Related requirements that may need updates
- If impacts found, AI presents them and asks if you want to update
- You review and approve each impacted file change

### Reference and Numbering Validation

At end of each file review:

- AI checks for numbering issues (FR1, FR1.1, etc.)
- Checks cross-references between sections
- Automatically corrects numbering gaps
- Shows what was changed

### Section Review States

- **Pending:** Not yet reviewed
- **Approved:** Reviewed and confirmed
- **Skipped (Temporary):** Will be asked about at end of file
- **Deferred:** Skipped again, will be reviewed after all files
- **Complete (No Review):** User confirmed they don't want to review it
- **Removed:** Marked as invalid, will be deleted

---

## Scaffolding Approach - Structure Before Content

### Why Scaffolding First?

- **Control:** You negotiate structure before content is created
- **Verification:** Can verify structure is appropriate before investing in content
- **Prevents AI Overreach:** AI doesn't generate unwanted files or sections
- **Quality:** Each section gets proper attention
- **Consistency:** Ensures all required components are included

### Scaffolding Process

```
1. AI Proposes Structure → 2. You Negotiate/Refine → 3. Structure OK? 
   ↓ No                                               ↓ Yes
   ← Back to Step 2                                   ↓
                                          4. AI Creates File Structure 
                                             and Headers ONLY
                                                     ↓
                                          5. Review Structure
                                                     ↓
                                          6. Approved? → Proceed to Content
                                             ↓ No
                                             ← Back to Step 2
```

### Example Scaffolding Prompt

```
"Now that we've gathered the project foundation, business objectives, and stakeholders, 
we have enough information to create the scaffolding for the requirements documents. 
Propose the structure of documents we'll need to capture these requirements. Show me:
- What files should we create?
- What are the major section headers in each file?

Show structure and headers ONLY, do not create content yet."
```

### What Good Scaffolding Looks Like

Each section is its own numbered file. The `00-index.md` links them all together and tracks status.

```
[project]/requirements/
├── 00-index.md                                  ← links all sections, tracks status
├── 01-executive-summary-business-context.md
├── 02-business-objectives-success-criteria.md
├── 03-stakeholders-personas.md
├── 04-functional-requirements.md
├── 05-functional-specifications.md
├── 06-business-logic-rules.md
├── 07-user-journeys.md
├── 08-views-dashboards.md
├── 09-data-requirements.md
├── 10-permissions-access-control.md
├── 11-non-functional-requirements.md
├── 12-assumptions-constraints-out-of-scope.md
├── 13-acceptance-criteria.md
├── 14-glossary.md
└── appendix-a-traceability-matrix.md            ← optional
```

Sections that don't apply are either removed from the folder or marked `N/A — [reason]` in the index.

### When to Scaffold

- **Recommended:** After Step 4 (File Relevance Recommendation) — the completeness tracker is populated and you know which files to create
- **Acceptable:** After Step 6 (Functional Requirements) - if you want more context first
- **Not Recommended:** After Step 10 - too late, misses the benefit of structure-first approach

---

## Best Practices for Requirements Gathering

### 1. Keep Requirements Stable

**Principle:** Requirements should contain information unlikely to change.

**Do Include:**

- Business objectives
- Functional requirements
- Business rules
- Data requirements
- Acceptance criteria

**Don't Include:**

- UI details (colors, layouts, specific screens)
- Technology choices
- Implementation details

**Logic:** If there's a rebranding or technology change, requirements should remain valid.

### 2. Clean Personas and Functional Requirements First

Before moving to granular requirements:

- Ensure personas are complete and accurate
- Ensure functional requirements are clean and well-organized
- These form the foundation for everything else

### 3. Review Impact Across Files

When changing one document:

```
"Review the impact of this change on other requirements documents. Which files 
need to be updated? Update all affected files."
```

### 4. Commit Frequently

- Commit after completing each step
- Commit after scaffolding
- Commit after major sections
- Use meaningful commit messages: "Step 5 requirements" or "Step 5-6 requirements"

### 5. Start New Conversations for New Tasks

- Prevents unwanted context carryover
- Keeps conversations focused
- Prevents AI scope creep

### 6. Verify Before Proceeding

After AI generates content, always:

1. Review the output
2. Ask AI to summarize what it created
3. Verify it matches your intent
4. Correct any misunderstandings
5. Then move to next section

### 7. Be Explicit About Exclusions

Always state what you DON'T want:

```
"Document the data requirements. Include what data needs to be captured and 
stored. Do NOT include database schema details or technology choices - those 
belong in solution design."
```

### 8. Focus on One Topic at a Time

Instead of: "Create all the requirements documentation"

Use:

- "Let's define the stakeholders and personas"
- "Now let's document the functional requirements for [area]"
- "Now let's define the business rules for [process]"

---

## Common Pitfalls and Solutions

### Pitfall 1: AI Generating Solution-Level Details

**Symptom:** AI includes UI mockups, technology choices, or implementation details in requirements.

**Solution:**

- Explicitly state what NOT to include
- Start new conversations for new tasks
- Use scaffolding approach

**Example:**

```
"Document the notification requirements - what notifications should be sent and 
when. Do NOT include email templates, UI designs, or implementation details."
```

### Pitfall 2: Going Too Wide, Losing Depth

**Symptom:** AI generates high-level requirements that miss important details.

**Solution:**

- Focus on one area at a time
- Use chunk-by-chunk approach
- Ask AI to verify changes were implemented everywhere

**Example:**

```
"I added a new user role 'Supervisor'. Review all requirements documents and 
ensure this role is included in all relevant permissions and workflow sections."
```

### Pitfall 3: Requirements vs Solution Boundary Confusion

**Symptom:** Unclear what belongs in requirements vs solution design.

**Solution:**

- Ask: "Will this change if we rebrand or change UI frameworks?"
- Requirements = WHAT (stable)
- Solution = HOW (changeable)

**Guideline:**

| **Put in Requirements** | **Put in Solution** |
| --- | --- |
| "Users can view their profile" | "Profile page layout with tabs" |
| "System must respond in under 2 seconds" | "Use Redis caching for performance" |
| "Support 500 concurrent users" | "AWS Auto Scaling configuration" |

### Pitfall 4: Incomplete Personas

**Symptom:** Personas lack enough detail to inform requirements.

**Solution:** Ensure each persona includes:

- Name and role
- Goals and motivations
- Pain points
- Technical capabilities
- How they'll use the system
- Success criteria

### Pitfall 5: Missing Business Rules

**Symptom:** Functional requirements exist but system behavior is unclear.

**Solution:** For each functional area, explicitly document:

- Validation rules
- Calculations and formulas
- State transitions
- Exception cases
- Business logic

### Pitfall 6: Not Verifying AI Understanding

**Symptom:** AI generates content that doesn't match your intent.

**Solution:** Always verify before proceeding:

```
"Before we create the functional requirements, summarize what you understand 
about the project, the stakeholders, and what we're building."
```

### Pitfall 7: Context Loss Across Sessions

**Symptom:** New sessions produce inconsistent requirements.

**Solution:**

- At start of each session, have AI read existing requirements documents
- Ask AI to summarize what it understands
- Verify understanding before proceeding
- Commit frequently so documents are always current

### Pitfall 8: Over-Reliance on AI for Strategic Decisions

**Symptom:** AI is making business decisions instead of humans.

**Solution:**

- Lead with human requirements and decisions
- Use AI for documentation, not strategy
- Always review and understand AI output
- Maintain ownership of requirements priorities

---

## Prompt Templates and Examples

### Template 1: Starting Requirements Gathering

```
We are going to gather requirements for [PROJECT NAME].
This system will [HIGH-LEVEL PURPOSE].

Context:
- Organization: [ORGANIZATION]
- Business Problem: [PROBLEM STATEMENT]
- Key Stakeholders: [STAKEHOLDER TYPES]

We are in the Requirements phase. Before we start, tell me:
1. What are the typical components of a requirements package?
2. Who is the usual audience for requirements documents?
3. What information should we gather first?
```

### Template 2: Defining Stakeholders

```
Let's define the stakeholders for [PROJECT NAME].

We've identified these user types:
- [USER TYPE 1]
- [USER TYPE 2]
- [USER TYPE 3]

For each user type, create a persona that includes:
- Name and role
- Goals and motivations
- Pain points with current process
- Technical capabilities
- How they'll use the new system

Do NOT include UI designs or technology details.
```

### Template 3: Documenting Functional Requirements

```
Now let's document the functional requirements for [FUNCTIONAL AREA].

Context:
- This area covers [DESCRIPTION]
- Key users: [RELEVANT PERSONAS]
- Related business rules: [RULES]

Create functional requirements that:
- Are uniquely numbered (FR1.1, FR1.1.1, etc.)
- Use "shall" statements
- Include acceptance criteria
- Cross-reference related requirements

Do NOT include implementation details or UI specifics.
```

### Template 4: Defining Business Rules

```
Let's document the business rules for [AREA].

The functional requirements for this area are:
- [LIST KEY REQUIREMENTS]

Document the business rules including:
- Validation rules
- Calculations and formulas
- State transitions
- Exception handling

Format as clear rules that can be implemented in any technology.
```

### Template 5: Scaffolding Request

```
We've gathered information about:
- Project foundation (problem, solution, scope)
- Business objectives and success criteria
- Stakeholders and personas

Now propose the scaffolding structure for the requirements documents:
- What files should we create?
- What are the major section headers in each file?

Show me ONLY the structure and headers. Do NOT create content yet.
```

### Template 6: Content Chunk Request

```
Now create the content for [SECTION NAME] in [DOCUMENT].

Based on what we've discussed:
- [KEY POINT 1]
- [KEY POINT 2]
- [KEY POINT 3]

Create detailed content for this section. Keep it focused on business 
requirements only - no solution details.
```

### Template 7: Impact Analysis

```
I've made changes to [DOCUMENT/SECTION]:
[DESCRIBE CHANGES]

Review all other requirements documents and identify:
1. What sections reference or depend on this content?
2. What needs to be updated for consistency?
3. Are there any contradictions introduced?

List all affected sections before making updates.
```

### Template 8: Verification Prompt

```
Before we proceed to the next section, summarize:
1. What you understand about [TOPIC]
2. What requirements we've documented so far
3. What's still missing

Let me verify this matches my understanding.
```

### Example Complete Interaction

**User:** "I'm starting a new project. Reference the Business Requirements Gathering Guide and tell me what information we need first."

**AI:** "According to the Business Requirements Gathering Guide, we start with Step 0: Project Setup. What would you like to name this project?"

**User:** "ResourceHub"

**AI:** "I've created a project-specific copy of the guide and set up the branch 'resourcehub-business-requirements-branch'. Now let's begin gathering requirements with Step 1: Project Foundation. The first question is: What problem are we solving? Can you tell me what business problem or opportunity this project addresses?"

**User:** "We're solving the problem of manual resource tracking. Currently, managers use spreadsheets to track who's assigned to what projects, leading to double-bookings and no visibility into availability."

**AI:** "Great! I understand the problem. Now for Question 1.2: What is the high-level solution? In one sentence, what are we building and what are its main capabilities?"

**User:** "We're building a resource management system that tracks staff assignments, shows availability, and helps match skills to project needs."

**AI:** "Now for Question 1.3: What is in scope for this project? What is explicitly out of scope? Are there any constraints or limitations we should know about?"

**[Continue through all steps...]**

---

## Quick Reference Checklist

### Before Starting Requirements Gathering

- [ ] Project name defined
- [ ] Version control set up
- [ ] New conversation started
- [ ] Project-specific guide copy created

### Project Foundation (Step 1)

- [ ] Problem statement documented
- [ ] High-level solution described
- [ ] Scope defined (in scope and out of scope)
- [ ] Constraints identified

### Business Objectives (Step 2)

- [ ] Primary business objectives defined
- [ ] Success criteria established
- [ ] KPIs identified
- [ ] Timeline and priorities set

### Stakeholders & Users (Step 3)

- [ ] Key stakeholders identified
- [ ] User personas created (for each user type)
- [ ] Approval workflows documented (if applicable)

### File Relevance Recommendation (Step 4)

- [ ] AI reviewed template files against gathered context
- [ ] Recommendations presented to user
- [ ] User confirmed or overrode each recommendation
- [ ] Completeness tracker updated and committed

### Scaffolding (Step 5)

- [ ] Template files copied for confirmed files only
- [ ] File list and headers reviewed and refined
- [ ] Files populated with content from Steps 1-3
- [ ] Scaffolding committed to version control

### Functional Requirements (Step 6)

- [ ] Main features identified
- [ ] User workflows documented
- [ ] Business rules defined
- [ ] Integration needs identified (business view)

### Data Requirements (Step 7)

- [ ] Existing systems/databases identified
- [ ] Data capture requirements documented

### Non-Functional Requirements (Step 8)

- [ ] Performance expectations defined
- [ ] Usability requirements defined

### Constraints & Assumptions (Step 9)

- [ ] Business constraints documented
- [ ] Business assumptions documented

### Dependencies & Risks (Step 10)

- [ ] Business dependencies identified
- [ ] Business risks identified
- [ ] Skipped questions revisited

### Review Process

- [ ] All files identified for review
- [ ] Each section reviewed (approved, skipped, or removed)
- [ ] Cross-file impacts checked
- [ ] Numbering and references validated
- [ ] Changes committed

### Final Verification

- [ ] All documents complete
- [ ] No conflicting requirements
- [ ] All stakeholders represented
- [ ] Requirements are stable (no UI/solution details)
- [ ] Ready for Solution Design phase

---

## Change Tracking for Requirements Documentation

> **Common Structure:** See `../_shared/templates/change-tracker-template.md` for the universal Change Tracker file structure, versioning convention, and change types.

### Applicability

The Requirements Package is a **forward engineering** deliverable — it creates new documentation rather than extracting from existing source code. Change tracking for the Requirements Package follows the same template structure but with different Parts Affected values.

### Parts Affected Values

When logging changes to requirements documentation in the Change Tracker, use the following values in the "Parts Affected" column:

| Value | Meaning |
| --- | --- |
| Executive Summary | Project overview, objectives, scope |
| Functional Requirements | FR specifications and functional flows |
| Business Rules | Business logic, calculations, validations, state machines |
| User Journeys | User stories, workflows, personas |
| Data Requirements | Data entities, attributes, relationships |
| NFRs | Non-functional requirements (performance, security, etc.) |
| Acceptance Criteria | Testable acceptance conditions |
| Traceability | Traceability matrix and cross-references |
| Multiple | When more than two components are affected, list them |

### When to Track Changes

- After each requirements gathering session
- When stakeholder feedback modifies existing requirements
- When requirements are added, modified, or removed
- When business rules are clarified or corrected
- During requirements review cycles

---

## Key Takeaways

- **Structure, context, scaffolding, and human-led direction** keep AI useful instead of noisy
- **Requirements Package ≠ Traditional BRD** — it's more comprehensive, more detailed, and focused on stable business logic
- **Scaffolding before content** gives you control and ensures quality
- **Chunk-by-chunk development** prevents AI from going too wide and losing depth
- **Requirements influence everything downstream** — poor requirements lead to poor solutions and code
- **Documentation is persistent memory** — AI doesn't remember between sessions; your documents do
- **Verify understanding constantly** — always ask AI to summarize before proceeding
- **Balance AI assistance with human judgment** — AI augments, doesn't replace critical thinking
- **Keep requirements stable** — business logic stays, UI details go in solution design
- **Commit frequently** — protect your work and maintain version history

---

## Additional Resources

- **Business Requirements Gathering Guide:** `Learning/future state/playbook/Business-Requirements-Gathering-Guide.md`
- **Business Requirements Review Guide:** `Learning/future state/playbook/Business-Requirements-Review-Guide.md`
- **AI-Assisted Development Playbook:** `Learning/future state/playbook/AI-Assisted-Coding-Playbook.md`
- **Change Tracker Template:** `../_shared/templates/change-tracker-template.md`
- **Example Requirements:** `docs/requirements/` folder
- **AI-SDLC Best Practices:** `Learning/crash course contents/AI-SDLC-Best-Practices-Info-Dump.md`
