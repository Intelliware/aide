# Existing Artifact Review

## Purpose

Find and assess all documentation related to a proposed feature request — in the repository and in external systems (Figma, Confluence, Jira). Surfaces what is current vs. stale, notes contradictions for the BA/PO to resolve, and extracts settled decisions and documented constraints before new requirements are written. The AI does not resolve contradictions — it flags them for the BA/PO.

## When to Use

- Any brownfield project where documentation exists in any form (specs, wikis, decision records, runbooks, API docs, Figma files)
- Before writing new requirements — to avoid contradicting settled decisions or duplicating known constraints
- When stakeholders mention "we have docs for that" — review and verify before treating them as authoritative

## What This Is Not

This skill assesses **existing documentation**. It does not:
- Read or interpret the system in depth (that is codebase-discovery)
- Create new requirements or constraints (those flow to functional-requirements and constraint-extraction)
- Conduct stakeholder interviews (that is requirements-elicitation)
- Resolve contradictions — when contradictions are found, the AI notes them and flags them for the BA/PO. Determining which source is correct is the BA/PO's responsibility.

Where a document contradicts what the system actually does, both are potentially wrong. The system reflects what was built; the document reflects what was intended or decided. When a contradiction is found, it is the BA/PO's responsibility to determine which is correct — this skill flags contradictions but does not resolve them.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Current capability inventory | codebase-discovery output | Yes — used as the ground-truth to verify document currency. If absent or incomplete when Step 4 begins, all currency ratings are recorded as "Unknown," the assessment is flagged as incomplete, and the BA/PO must be notified before proceeding. |
| Access to project documentation | Figma, Confluence, Jira, Notion, SharePoint, local `docs/`, wikis, ADR directories | Yes |
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` | Yes — needed to assess relevance of each artifact |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Document Types to Locate

The goal is to find documentation related to the proposed feature request — not to catalogue all documentation that exists. Scan broadly so that nothing relevant is missed, then narrow to what touches the change area during triage. On real projects, the most valuable documentation lives in external systems — Figma, Confluence, Jira — not in the repository. Always elicit external artifacts before scanning the repo.

| Type | Where to Look | Typically External? |
|------|--------------|---------------------|
| UI / UX designs | **Figma**, Sketch, Adobe XD, Zeplin — almost never in the project folder | **Almost always** |
| Requirements specs | Project documentation folders, Confluence, Notion, Jira epics/stories | Often |
| Decision records | Formal records of a specific architecture or design decision, typically structured (e.g., ADRs), Confluence decision pages | Sometimes |
| API / integration documentation | API specification files, integration guides, Confluence | Sometimes |
| Data dictionaries | Data documentation, entity descriptions, Confluence | Sometimes |
| Runbooks and operational guides | Operational documentation, Confluence ops spaces | Often |
| Wiki pages | Confluence spaces, Notion databases, internal wikis | Often |
| Decision logs | Informal accumulations of decisions reached over time — meeting notes, prior change requests, Jira/Linear decision tickets. Unlike decision records, these are not structured around a single decision. | Often |
| Onboarding and overview documents | README files, getting-started guides, system overview docs | Rarely |
| Prior incident reports or post-mortems | Confluence, shared drives — assess relevance during triage | Often |

**What is not an artifact for this skill:** Source code files — classes, modules, functions, controllers, services, tests, configuration files, build scripts, and any other file whose primary purpose is execution rather than communication — are not documentation artifacts. Do not include them in the inventory. Reading and interpreting the codebase is the responsibility of codebase-discovery, not this skill. If a source code file contains an embedded comment block or annotation that constitutes a design decision or constraint, extract only that comment as a quoted note in the relevant artifact entry — do not list the source file itself as an artifact.

## Workflow

```
┌─────────────────────────────────────────────────────┐
│  0. ELICIT — Ask for external documentation         │
│     Present a structured request to the BA/PO.      │
│     STOP and wait for response before proceeding.   │
│     Do not begin Step 1 until the BA/PO has replied.│
├─────────────────────────────────────────────────────┤
│  1. LOCATE — Find all documentation                 │
│     Scan the repo. Merge with external artifacts    │
│     provided in Step 0. List everything found.      │
├─────────────────────────────────────────────────────┤
│  2. TRIAGE — Assess relevance                       │
│     Filter to artifacts that touch the              │
│     change area or system fundamentals.             │
├─────────────────────────────────────────────────────┤
│  3. INGEST — Read each relevant artifact            │
│     Summarise key decisions and constraints         │
│     documented in each artifact.                   │
├─────────────────────────────────────────────────────┤
│  4. VERIFY — Compare against capability inventory   │
│     Cross-reference each document's claims          │
│     against the capability inventory.               │
│     Mark as current, stale, or unknown.             │
├─────────────────────────────────────────────────────┤
│  5. EXTRACT — Pull settled decisions and            │
│     documented constraints                         │
│     These feed into constraint-extraction          │
│     and must not be reopened without cause.         │
├─────────────────────────────────────────────────────┤
│  6. FLAG — Note contradictions and gaps             │
│     Contradictions become elicitation               │
│     questions. Gaps become targeted                 │
│     questions for requirements-elicitation.         │
├─────────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate the assessment              │
│     Write findings into the documentation-         │
│     currency-assessment template.                   │
└─────────────────────────────────────────────────────┘
```

## Step Details

### Step 0 — Elicit External Documentation (Hard Gate)

External documentation — Figma designs, Confluence pages, Jira tickets, Notion databases — almost never lives in the project repository. It must be solicited from the BA/PO before the artifact scan begins. Skipping this step produces an assessment that treats the repository as the complete documentation picture, which it is not.

**This step is a mandatory pause. Present the following request to the BA/PO and wait for their response before scanning the repository.**

---

**Present this prompt to the BA/PO verbatim, substituting the proposed change description from the codebase-discovery output:**

> Before I scan the repository for documentation, I need to know what exists outside it. For the proposed change — **[insert proposed change description from codebase-discovery output]** — please share links or attachments for any of the following that exist:
>
> | # | System | What to share |
> |---|--------|--------------|
> | 1 | **Figma** | Link to the frame, page, or file containing designs for the affected screens or the proposed feature. If a design for the new feature does not yet exist, say so. |
> | 2 | **Confluence** | Link to any space, page, or page tree covering this feature area, the product, or any relevant ADRs or decision pages. |
> | 3 | **Jira / Linear / Azure DevOps Boards / other issue tracker** | Link to the epic, story, or ticket for the proposed change, and any linked design or requirements tickets. |
> | 4 | **Notion / SharePoint / Google Drive** | Link to any relevant spec, decision log, or meeting note not covered above. |
> | 5 | **GitHub Wiki / GitLab Wiki / Azure DevOps Wiki** | Link to any wiki page covering this feature area, architecture, or data model. |
> | 6 | **Miro / FigJam / other whiteboard tool** | Link to any board containing process maps, architecture diagrams, or design explorations relevant to this area. |
> | 7 | **Loom / recorded demos** | Link to any recorded walkthrough or demo of the feature area. |
> | 8 | **Other** | Any additional documentation source not listed (Postman collections, data dictionaries hosted externally, prior incident reports, Swagger/OpenAPI portals). |
>
> For each one that does not exist, write "none." Do not skip any row — a confirmed "none" is as useful as a link.

---

**Rules for processing the response:**

- If the BA/PO provides links: add each linked artifact to the full inventory before beginning Step 1. Treat them as first-class artifacts subject to the same triage, ingest, and verify steps as in-repository documents.
- If the BA/PO provides attachments: treat each attachment as a linked artifact. If the attachment is in a readable plain-text format, ingest it during Step 3. If it is in a binary format (PDF, image), apply the same inaccessible-artifact handling as in Step 3 — request a text export or plain-text description instead.
- If the BA/PO provides "none" for all items: record that external documentation was explicitly solicited and confirmed absent. Note this in the assessment's artifact inventory. Proceed to Step 1.
- If the BA/PO says "I don't know" or "maybe": record it as an unconfirmed external artifact and flag it as a gap in the assessment. Do not treat absence of knowledge as confirmed absence — flag it as a targeted question for requirements-elicitation.
- **Do not proceed to Step 1 until this question has been asked and the BA/PO has responded.** This means: do not scan the repository, do not perform any subsequent step, and do not write any output file until the BA/PO has replied. Presenting the Step 0 prompt and then continuing with Steps 1–7 in the same response — intending to merge external links later — violates this gate. Ask the question, stop, and wait.

### Step 1 — Locate

Scan the repository for all in-repository documentation artifacts. Merge the results with any external artifacts provided in Step 0.

**The AI scans the following locations internally — the BA/PO does not need to do this:**
- Documentation, specifications, decision records, and runbook folders in the project repository
- Any API or integration specification files present in the repository
- Project wiki if one is linked from the repository
- Overview and onboarding files for links to external decision logs, wikis, or documentation not otherwise surfaced

**Do not include source code in the inventory.** Source files — classes, modules, functions, controllers, services, tests, configuration files, build scripts, package manifests, and any other file whose primary purpose is execution — are not documentation artifacts and must not appear as entries in the inventory. If a source file is encountered during the scan, skip it. If it contains an embedded comment that constitutes a design decision or constraint, extract only that comment as a quoted note — do not add the source file as an artifact entry.

**Output:** A combined inventory of all documentation artifacts — in-repository and external. For each artifact, record:
1. **Name or title** of the document
2. **Type** (from the Document Types table above)
3. **Location** — URL for external artifacts; relative file path for in-repository artifacts
4. **Source** — in-repository or external (and which system: Figma, Confluence, Jira, etc.)
5. **Initial relevance note** — one sentence on why it may be relevant to the proposed change, or "relevance unclear — assess during triage"

This inventory is carried into Step 2 for triage and into Step 7 as the artifact list in the assessment.

### Step 2 — Triage

Filter the full inventory to artifacts that warrant a full read.

**Prioritise for full review:**
- Figma designs for any screen the proposed change will add to or modify
- Requirements or acceptance criteria documents that describe the change area
- Documents that explicitly cover the feature area the proposed change touches
- Decision records for any design choice, technology decision, or constraint the change will interact with
- API or integration documentation for any capability the change will add to, modify, or depend on
- Data dictionaries for any information the change will read or write
- Runbooks for any operational process the change will affect

**Deprioritise (log but do not read in full):**
- Documentation for entirely unrelated feature areas
- Onboarding guides that, after a title-and-first-section skim, contain no technical decisions, constraints, or references to external documentation (see triage skim rules below)

Deprioritised artifacts are listed in the assessment inventory with a currency rating of "Not assessed — deprioritised during triage." No further currency analysis is performed on them. If a deprioritised artifact is later found to be relevant, update its entry and perform a full ingest.

**During triage skim — skip full ingest if:**
- The document explicitly describes itself as deprecated, superseded, or decommissioned in its title or opening section. Read only the title and first section to make this determination. If it is ambiguous, treat it as in-scope and read it in full.
- The document is an onboarding or overview guide. Read only the title and first section to determine whether it contains or references specific technology choices, constraints, or design decisions. If it does, treat it as in-scope and read it in full. If it does not, deprioritise it.

**If the artifact volume is unmanageable:** If the number of relevant artifacts is large enough that a full triage cannot be completed in a reasonable pass — for example, a Confluence space with dozens of pages or a repo with extensive overlapping specs — do not make silent scope decisions. Present the inventory to the BA/PO, explain the volume, and ask them to identify which artifacts are highest priority for the proposed change. Proceed based on their guidance and record the scope decision in the assessment.

### Step 3 — Ingest

Read each prioritised artifact and summarise what is relevant to the proposed change. The goal is not to produce a comprehensive summary of every artifact — it is to surface what bears on the feature request. Skip content that does not touch the change area.

**If an artifact cannot be read** (access denied, binary format such as PDF or Word, broken link): still log it in the inventory with its type and location. Mark it as "inaccessible — content unread" and note what format or access level is needed to read it. Do not treat it as absent — flag it as a gap and ask the BA/PO to either grant access or provide the content as readable text (e.g., plain-text export, copied annotations, or a written description). PDFs and image files are not reliably readable — text is the preferred fallback. The assessment cannot be considered complete until all flagged inaccessible artifacts have been resolved or explicitly confirmed as unreachable.

**For each artifact, capture:**
- What decisions or constraints it documents
- What it claims the system does (behavior statements)
- What it claims about data structures, API contracts, or integration interfaces
- For Figma: what screens are designed, what states are shown, what interactions are specified, what is absent or marked as to-do
- Any explicit "must not", "always", "never" statements — these are likely constraints
- Any warnings, caveats, or known limitations documented by the author

### Step 4 — Verify Currency

Before beginning this step, confirm the codebase-discovery capability inventory exists and covers the change area. If it is absent or incomplete, record all currency ratings as "Unknown" and flag this as a blocker — the assessment cannot be trusted until codebase-discovery is completed or re-run.

Cross-reference each document's claims against the codebase-discovery capability inventory.

**Currency assessment:**

| Rating | Meaning |
|--------|---------|
| **Current** | Document's claims are consistent with the codebase-discovery capability inventory — note the specific claim from the document and the corresponding entry in the capability inventory that supports it. If no supporting entry can be found, rate as "Unknown." |
| **Partially stale** | Some claims are consistent with the capability inventory, others contradict it — note each contradiction with the document claim and the conflicting inventory entry. Claims that cannot be matched to the inventory are rated "Unknown," not assumed current. |
| **Fully stale** | Document describes capabilities or behaviors that are absent from or directly contradicted by the capability inventory — note at least one specific example. |
| **Unknown** | Cannot verify — document describes behavior not visible in the capability inventory (e.g., external service behavior, infra-level concerns, or a Figma design for a screen not yet built) |

**Key verification checks:**
- Does the integration or API documentation match the capabilities listed in the capability inventory?
- Does the data dictionary match the data concepts described in the capability inventory?
- Does the specification describe features present in the capability inventory?
- Does the specification describe constraints reflected in the capability inventory?
- Are decision records consistent with the capabilities listed in the inventory?
- Do the Figma designs match the user-facing surfaces described in the capability inventory? Flag screens present in Figma but absent from the inventory (not yet built) and capabilities in the inventory with no corresponding Figma design (undocumented).

### Step 5 — Extract Settled Decisions and Documented Constraints

Settled decisions and documented constraints are the most valuable outputs of this skill. They constrain the solution space before requirements are written.

**Settled decisions** are decisions that must not be revisited without explicit justification. If the BA/PO believes a settled decision needs to be challenged, they must raise it before requirements-elicitation begins — the AI does not reopen settled decisions unilaterally. The appropriate escalation path depends on the decision type:

- **Team-level decisions** (design choices, technology choices): raise with the original decision's author or the team's architecture owner. If the original author is no longer available (e.g., has left the organisation) and no architecture owner exists, the BA/PO must identify the appropriate escalation point before any challenge is raised. The AI flags this as an open question — it does not determine the escalation path.
- **Organisational or policy-level decisions** (security policies, data standards): raise with the BA/PO's lead or the relevant policy owner.
- **Regulatory or legal constraints**: these cannot be reopened by the team at all — they must be treated as fixed. If there is uncertainty about whether a constraint is regulatory in origin, the BA/PO should confirm with their lead before any challenge is raised.

Examples:
- "The system uses a single database and no new data stores may be introduced" (decision record)
- "All monetary values are tracked in the smallest currency unit (e.g., cents, not dollars)" (data dictionary)
- "The public-facing integration interface follows an agreed standard that must not change" (integration spec)

**Documented constraints** feed into constraint-extraction. Examples:
- Performance: "The dashboard must display results in under 2 seconds for up to 10,000 records" (spec)
- Security: "Personal information must be protected at rest" (security runbook)
- Compatibility: "The integration must remain backward-compatible with existing connected systems" (integration spec)

For each: record the decision or constraint, its source document, and whether it can be confirmed in the capability inventory.

### Step 6 — Flag Contradictions and Gaps

**Contradictions** occur in two forms: a document says X and the code does Y, or two documents say different things about the same topic. Both are risks that require resolution. The general pattern for all contradictions is the same: note it, record the details, and flag it for the BA/PO to clear. The BA/PO is the point of contact at this stage; contradictions that cannot be resolved by the BA/PO alone are carried forward as open questions into requirements-elicitation.

For each contradiction, record:
- What each source claims (document vs. code, or document vs. document)
- The type of contradiction (document-to-system or document-to-document)
- The likely explanation (stale doc, implemented differently, spec divergence, bug)
- Whether BA/PO confirmation is needed before proceeding

**Gaps** occur where documentation should cover a topic relevant to the proposed change but does not. Gaps become targeted questions in requirements-elicitation.

Examples of significant gaps:
- No specification for what should happen when the capability fails or encounters an error
- No documented data retention or deletion policy for information the change will create or modify
- No specification for an existing behaviour the change will alter
- No Figma design for the proposed feature's screens (designs must be created before implementation)
- Figma designs exist but do not cover error states, empty states, or loading states

### Step 7 — Assemble the Assessment

**Before beginning this step, confirm that Step 0 is complete** — the BA/PO has responded to the external documentation request and all provided links have been added to the artifact inventory. If Step 0 has not been completed (the BA/PO has not yet replied), do not assemble or write the assessment. Hold at Step 0 until a response is received.

Before populating, confirm that `../assets/documentation-currency-assessment.md` exists at the expected path. If it does not, notify the BA/PO and do not proceed until the template is located or the BA/PO confirms it should be created from scratch using the structure defined in this step.

Populate the `documentation-currency-assessment` template with one entry per reviewed artifact.

At the bottom of the assessment, produce three consolidated lists:
1. **Settled decisions** — decisions that constrain the solution space (feed into constraint-extraction)
2. **Documented constraints** — explicit requirements already established (feed into constraint-extraction)
3. **Contradictions and gaps requiring resolution** — questions for requirements-elicitation

## Output

A populated **documentation-currency-assessment** document (use the template at `../assets/documentation-currency-assessment.md`).

### File Output

Write the completed documentation currency assessment to `docs/<feature>/requirements-package/discovery/existing-artifact-review.md`.

This document feeds into **current-capability-synthesis** (the subsequent skill that merges all discovery outputs — capability inventory, process maps, user journeys, and this assessment — into a unified current-capability-baseline), where its settled decisions and constraints are incorporated before requirements are written.

## Failure Modes and Mitigations

| Failure mode | Mitigation |
|---|---|
| AI presents the Step 0 prompt and then continues with Steps 1–7 and writes the file in the same response, intending to merge external links later — so the file is created before the user has answered | Step 0's final rule explicitly prohibits scanning the repository, performing any subsequent step, or writing any output until the BA/PO has replied; Step 7 has a prerequisite check that blocks assembly if Step 0 is incomplete; the Hand-off Gate makes Step 0 completion the first mandatory check before the file write |
| Source code files (classes, modules, services, tests, config files) are included in the artifact inventory, inflating it with non-documentation items and conflating this skill with codebase-discovery | The Document Types table and Step 1 both explicitly prohibit adding source code files to the inventory; only embedded comments that constitute a design decision or constraint may be extracted as a quoted note — the source file itself is never an artifact entry |
| Missing Figma designs, Confluence pages, or Jira tickets because the AI only searched the repository | Step 0 explicitly asks the BA/PO for external artifacts before scanning begins; the AI cannot proceed until it receives a response |
| Treating "I didn't find it in the repository" as "it doesn't exist" | Step 0 requires the BA/PO to confirm "none" explicitly — unconfirmed absence is flagged as a gap, not treated as confirmed absence |
| New requirements contradicting a settled design or technology decision | Step 5 extracts settled decisions before requirements are written |
| Duplicating a constraint that is already documented | Step 5 surfaces documented constraints so they are inherited, not re-derived |
| Treating stale documentation as authoritative | Step 4 cross-references every document against the capability inventory before trusting it |
| Missing a critical constraint buried in a runbook or integration specification | Step 1 casts a wide net before triaging |
| New requirements conflicting with an existing integration contract | Step 3 reviews integration documentation; Step 4 cross-references it against the capability inventory |
| New requirements conflicting with settled Figma designs | Step 3 reviews Figma designs; Step 4 cross-references them against the capability inventory |
| AI receives a link it cannot open (protected Confluence, Figma requiring login, expired share link) | When a linked artifact cannot be accessed, the AI records it in the inventory as "inaccessible — content unread," flags it as a gap, and asks the BA/PO to either (a) grant view access, or (b) provide the content as readable text — for example, copied design annotations, a written description of the design, or a plain-text export of the spec. PDFs and image files are not reliably readable and should not be the first option requested. The AI does not skip the artifact or treat it as absent. |
| BA/PO confirms "none" but documentation exists that they are unaware of | Step 0 cannot guarantee BA/PO awareness. This is partially mitigated by Step 1's independent repository scan, which may surface documents the BA/PO did not mention. Any discrepancy between the BA/PO's "none" and a found artifact is flagged explicitly in the assessment. |
| Currency ratings are unreliable because the codebase-discovery output is incomplete or absent | Before beginning Step 4, confirm the codebase-discovery output exists and covers the change area. If it is absent or incomplete, record all currency ratings as "Unknown" and flag this as a blocker — the assessment cannot be trusted until codebase-discovery is completed or re-run. |
| Step 7 fails because the assessment template does not exist at the referenced path | Before populating the template, confirm that `../assets/documentation-currency-assessment.md` exists. If it does not, notify the BA/PO and do not proceed until the template is located or the BA/PO confirms it should be created from scratch using the structure defined in Step 7. |
| Assessment silently omits artifacts because the BA/PO named their Figma file, Confluence space, or Jira project differently than the feature area suggests | Step 0 asks for links explicitly by system — the AI does not infer what exists from naming. The BA/PO must confirm that all relevant workspaces were covered in their Step 0 response; any unchecked workspace is recorded as a gap. |

## Hand-off Gate

**Before proceeding to the next skill in your sequence, you must:**
1. **Confirm Step 0 is complete before doing anything else in this gate.** The BA/PO must have responded to the external documentation request, and all provided links must have been incorporated into the artifact inventory before Steps 1–6 were run. If Step 0 was not completed before the repository scan began, the assessment is incomplete — re-run from Step 1 with the external artifacts included before proceeding.
2. Write the completed `documentation-currency-assessment` artifact in full — in plain language for the BA/PO to review.
3. **Write the document to `docs/<feature>/requirements-package/discovery/existing-artifact-review.md`. The file write must succeed before proceeding. If the folder structure does not exist, create it.**
4. Present it to the BA/PO.
5. Confirm the completion criteria below are satisfied.
6. Ask the BA/PO explicitly: **"Is this documentation currency assessment complete and accurate enough to proceed?"** Do not interpret silence or acknowledgement as acceptance — wait for an explicit confirmation. If the BA/PO identifies corrections, update the document, overwrite the file, and re-present before asking again.

Do not proceed to the next skill until the BA/PO has explicitly confirmed the assessment is accepted.

---

## Completion Criteria

- [ ] Step 0 was executed — the BA/PO was presented with the external documentation request and responded before the repository scan began
- [ ] External artifact solicitation result is recorded in the assessment: either links provided, or confirmed "none" per system, or flagged as "unknown"
- [ ] All in-repo documentation locations have been searched
- [ ] Every artifact found — in-repo and external — is listed in the assessment, even if deprioritised
- [ ] Figma designs (if provided) have been reviewed for screen coverage, state coverage, and divergence from the capability inventory
- [ ] Settled decisions are extracted and listed as a consolidated output
- [ ] Documented constraints are extracted and listed as a consolidated output
- [ ] Every contradiction — between a document and the capability inventory, or between two documents — is recorded with its type and likely explanation
- [ ] Gaps relevant to the proposed change are flagged for requirements-elicitation
- [ ] The three consolidated lists — settled decisions, documented constraints, and contradictions and gaps — are present and populated at the bottom of the assessment document, as required by Step 7
- [ ] Every prioritised artifact's currency rating references the specific document claim and the corresponding capability inventory entry that supports or contradicts it
