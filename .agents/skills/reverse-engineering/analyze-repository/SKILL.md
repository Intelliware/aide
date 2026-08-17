---
name: analyze-repository
description: "Use when the user points at a code repository and asks what kind of project it is, which reverse-engineering skill to apply, how to document it, or when they describe a monorepo / hybrid / multi-project codebase without specifying the type — including mainframe / COBOL / copybook / JCL repositories. The diagnostic step between having code and knowing which reverse-engineer-* skill to invoke."
---

# Analyze Repository

Diagnostic skill that scans a repository, classifies it into one of the eleven reverse-engineering domain types, handles monorepos and hybrid repos, and recommends the next skill by name.

## Overview

Users rarely categorize their repos as "API" or "UI framework" — they say "document this thing" or "what is this monorepo." This skill performs the structural scan, applies the classification rules, and returns the exact next-skill invocation phrase. It is the entry point for the reverse-engineering stage in brownfield mode.

## When to use

- User points at a repository and asks "what is this" / "what kind of project is this" / "how should I document this"
- User says "I have this repo, can you document it?" without specifying type
- User mentions a monorepo, multi-project repo, or hybrid (API + DB migrations, web app + API)
- User says "I'm not sure if this is a framework or an application"

## When NOT to use

- User already knows the repo type and asks for `reverse-engineer-<type>` directly — invoke that skill
- The work is greenfield (no existing source) — use the requirements stage instead
- The repository is a knowledge base itself — that is `skills/knowledge-base/`, not RE

## Inputs

- Repository path (elicit from user if not in context)
- Optional: existing documentation that may exist at the path
- Optional: hint from user about repo's intended consumer (end users vs. other developers)

## Workflow

### Stage 0: Repository Registration Check

Before classification, check if this repository is registered in `project.toml`:

1. Read `project.toml` and look for a `[[project.repos]]` entry matching the given path
2. If found:
   - Note any `type` field as a classification hint
   - Note the `role` field if present (api, web-app, framework, etc.)
   - Continue to Stage 1
3. If not found:
   - Ask user: "This repository is not registered in project.toml. Would you like to add it?"
   - If yes, elicit:
     - `code` (kebab-case slug, e.g., `orderhub-api`)
     - `name` (human-readable, e.g., `OrderHub Backend API`)
     - `role` (api, web-app, ui-framework, api-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job, test-suite)
     - `type` (optional, e.g., `node-typescript-nest`, `java-spring-boot`)
     - `primary` (optional, boolean — is this the main repo?)
   - Append the entry to `project.toml`
   - Continue to Stage 1

Registration helps track which repos have been analyzed and documented, and provides hints for classification.

### Stage 1: Locate and Scan the Repository

Ask the user for the repository path (or identify from context). Then perform a structural scan:

**1a. Read the package/build file** — check in order, stop when found: `package.json` → Node/JS/TS; `pom.xml`/`build.gradle` → Java/Kotlin; `Podfile`/`Package.swift`/`*.podspec` → iOS; `build.gradle` with `com.android.*` → Android; `requirements.txt`/`setup.py`/`pyproject.toml` → Python; `go.mod` → Go; `Cargo.toml` → Rust; `*.csproj`/`*.sln` → .NET. **Mainframe repos do not use a single root manifest** — fall through to 1b/1c below.

**1b. Read the directory structure** — `ls -la` plus one level deep. Key signals: `src/routes/` + `src/controllers/` → API; `src/components/` + `public/index.html` → web app; `src/lib/` + published package → UI framework; `migrations/` + `*.sql` → database; `app/src/main/java/` + `AndroidManifest.xml` → Android; `*.xcodeproj` + `Info.plist` → iOS; `android/` + `ios/` + `App.tsx` → React Native; multiple `apps/` or `packages/` → monorepo. **Mainframe signals:** `COBOL/` + `COPYBOOK/`, `SRC/CBL/`, `JCL/PROCLIB/`, `PROCLIB/` + `JCLLIB/`, PDS-as-Git directory shapes (`SOURCE.PDS.*`), Endevor / ChangeMan staging dirs.

**1c. Check telltale dependencies** — read the dependency manifest and look for framework signals: `express`/`fastify`/`nestjs`/`spring-boot`/`flask`/`django` → API; `react`/`angular`/`vue`/`svelte` (in app context) → web app; same in library context with `peerDependencies` → UI framework; `react-native` → RN app or library; `sequelize`/`typeorm`/`prisma`/`flyway` → database-related; `retrofit`/`okhttp`/`alamofire` → mobile app.

**1c′ (mainframe). File-extension density + source-line markers** — mainframe repos have no dependency manifest. Detect by extension density and quick line-grep:

- File extensions: `*.cbl`, `*.cob`, `*.cpy`, `*.pli`, `*.jcl`, `*.proc`, `*.bms`, `*.dbd`, `*.psb`
- COBOL source markers: `IDENTIFICATION DIVISION`, `PROCEDURE DIVISION`, `WORKING-STORAGE SECTION`, `LINKAGE SECTION`, `COPY <name>`, `EXEC CICS`, `EXEC SQL`, `EXEC DLI`
- JCL markers: `//<jobname> JOB`, `//STEP[0-9]* EXEC`, `//SYSIN DD`, `// IF (RC=`, `IDCAMS`, `IEBGENER`, `SORT FIELDS=`
- Header-comment markers: Endevor `*ENDEVOR*`, ChangeMan `*CHANGEMAN*`, Panvalet `++USE`, JES2 `/*JOBPARM`

**Distinguishing the three mainframe sub-types:** a COBOL repo has files with a `PROCEDURE DIVISION`; a copybook library is `.cpy` files (record layouts, no `PROCEDURE DIVISION`); a JCL repo is `.jcl/.proc` plus control cards (`SYSIN`, `SORTIN`, etc.) and contains no COBOL sources.

**1d. Check for existing documentation** — look for `docs/`, README.md, OpenAPI specs, JSDoc/Javadoc. Reveals what exists and what's missing.

### Stage 2: Classify the Repository

Apply the classification table. The eleven types are:

| Type | Key Distinguisher | Skill to Invoke |
| --- | --- | --- |
| API Repository | Exposes HTTP endpoints for external consumers | `reverse-engineer-api` |
| Web Application | Serves a UI to end users via a browser | `reverse-engineer-web-app` |
| UI Framework / Component Library | Publishes reusable UI components | `reverse-engineer-ui-framework` |
| API Framework / Backend Library | Publishes reusable backend components | `reverse-engineer-api-framework` |
| Database Repository | Contains DDL, migrations, stored procedures | `reverse-engineer-database` |
| Mobile Application | Android / iOS / React Native end-user app | `reverse-engineer-mobile-app` |
| Mobile Framework / Library | Publishes reusable mobile components | `reverse-engineer-mobile-framework` |
| COBOL Program | Repo's primary content is `.cbl/.cob/.pli` source with `PROCEDURE DIVISION` | `reverse-engineer-cobol-program` |
| Copybook Library | Repo's primary content is `.cpy` (record layouts, no `PROCEDURE DIVISION`) | `reverse-engineer-copybook-library` |
| JCL / Batch Repo | Repo's primary content is `.jcl/.proc` and control cards | `reverse-engineer-jcl-job` |
| Test-Suite Repository | Repo's primary output is **test artefacts** — features/specs, step-defs, page-objects, fixtures, runners (e.g. dedicated Cucumber / Playwright / Cypress / Selenium / pytest / RestAssured / Karate / k6 project). No production code; no end-users. Often named `*-e2e`, `*-tests`, `*-qa-suite`, or sits as a sibling to the application it tests. | `reverse-engineer-test-suite` |

**The application-vs-framework distinction** — most common ambiguity. Ask: who consumes this code? End users → application; other developers as a dependency → framework/library. Concrete signals: presence of `peerDependencies` (framework), `main`/`exports` field without a `start` script (framework), being listed as a dependency in other repos (framework), having its own deployment pipeline (application).

### Stage 2b: Unsupported Stack Detection

If none of the eleven domain types match and classification confidence is low:

1. **Present findings to user:**

   > "This repository appears to be a **[detected pattern]** which doesn't match any of my eleven reverse-engineering domain types:
   >
   > - **Detected:** [language], [framework], [architectural style]
   > - **Closest matches:** [type1] (~X% fit), [type2] (~Y% fit)
   > - **Key distinguishing signals:** [list what makes this different]
   >
   > For example: GraphQL server (not REST), serverless functions (no persistent server), ML pipeline (training/inference modes), CLI tool (command structure), message queue consumer (event-driven), etc."

2. **Offer two paths:**

   > **A) Force-fit to closest type**
   > Use `reverse-engineer-<closest>` and adapt manually. Some sections may be irrelevant; others may need manual additions.
   >
   > **B) Create a new RE skill**
   > Run `generate-re-skill` to build a tailored documentation pattern for this technology stack. This creates a reusable skill, not just one-off documentation.

3. **Route based on user choice:**
   - **A → Force-fit:** Hand off to the closest RE skill with a warning that some sections may not apply. The user can skip irrelevant sections during extraction.
   - **B → Generate new skill:** Hand off by name to `generate-re-skill`. That skill will analyze the stack, research documentation patterns, and generate a complete RE skill.

**When to trigger Stage 2b:**
- No domain type matches with >70% confidence
- User expresses doubt about the classification
- The repository has characteristics not covered by any type's key distinguisher

**When NOT to trigger Stage 2b:**
- A domain type clearly matches (>80% confidence)
- The mismatch is minor (e.g., Django REST vs. Flask — both are API)
- User already indicated willingness to force-fit

### Stage 3: Handle Special Cases

**Monorepos** — If repo contains multiple projects (`apps/`, `packages/`):
1. List each sub-project
2. Classify each independently
3. Recommend an order: frameworks/libraries first (they're dependencies), then apps, then knowledge-base aggregation
4. Note shared dependencies between sub-projects

**Hybrid repos** — common patterns:
- API + DB migrations → primary `reverse-engineer-api`, secondary `reverse-engineer-database`
- Web app that also serves an API for its frontend → `reverse-engineer-web-app`; if external consumers exist, add `reverse-engineer-api`
- Mobile app with shared library → if extracted as own package, treat separately; if internal, one `reverse-engineer-mobile-app` effort
- Application + co-located test suite → if the tests live under `src/test/`, `__tests__/`, `tests/` or similar inside the application repo, document them in the application RE skill's `## Testing` section, **not** with `reverse-engineer-test-suite` (that skill is for dedicated test repos). If the application also ships a separately-deployable test-suite directory (rare), classify the sub-tree on its own.

**Mainframe monorepos** (the common shape — one PDS-as-Git repo mixing COBOL + copybooks + JCL):
1. List sub-trees by extension density (`.cbl/.cob`, `.cpy`, `.jcl/.proc`)
2. Recommend the order **copybook-library → cobol-program → jcl-job** (data layouts first because programs include them; JCL last because it invokes the programs)
3. After all three Part A passes complete, recommend `build-mainframe-data-lineage` rather than (or in addition to) the standard `build-knowledge-base` — lineage is the mainframe-specific aggregator that turns the three Part A outputs into cross-program field-level traceability
4. Mixed mainframe + DB2 DDL repo → also schedule `reverse-engineer-database` for the DB2 schema; the COBOL/lineage layer covers the embedded `EXEC SQL`, not the schema itself

**Already-documented repos** — note what exists, recommend the appropriate RE skill anyway (existing docs become input to verify against, not a replacement). Suggest a gap analysis first.

### Stage 4: Present Recommendation

Produce a structured analysis covering: repository path, primary language, framework/stack, version, classification table (one row per detected component), recommended approach (ordered list of skill invocations), existing documentation assessment. See `references/EXAMPLE.md` for the full output format.

### Stage 5: Hand Off

Tell the user the exact phrase to use to invoke the first recommended skill. Recommendations are dynamic — based on classification, you hand off by name to one of:

- `reverse-engineer-api`
- `reverse-engineer-api-framework`
- `reverse-engineer-web-app`
- `reverse-engineer-ui-framework`
- `reverse-engineer-database`
- `reverse-engineer-mobile-app`
- `reverse-engineer-mobile-framework`
- `reverse-engineer-cobol-program`
- `reverse-engineer-copybook-library`
- `reverse-engineer-jcl-job`
- `reverse-engineer-test-suite`
- `generate-re-skill` (when Stage 2b routes to option B — creating a new RE skill for an unsupported stack)

Each recommended RE skill ends at its own **close-out gate**, where it asks the user
whether to attest the extraction via automated verification or via
`review-reverse-engineering-package` (see
`references/elicitation-patterns/re-verification-gate-selection.md`). Say so when
handing off, so the user is not surprised by a question at the end of a long
extraction — and so a multi-repo run is understood to have one gate per repo, not one
for the batch.

Only after a repo's extraction carries an attestation does the user proceed to
`build-knowledge-base` to aggregate Part B docs into the knowledge base; it halts on an
extraction carrying neither. For mainframe stacks, additionally recommend
`build-mainframe-data-lineage` to produce the cross-program data-traceability artifact.

## Output

A repository analysis document containing:
- Identified repo type(s) and primary classification
- Recommended skill invocation order (with reasons)
- Existing-documentation assessment
- Exact trigger phrase for the next skill

## Next skill

Dynamic — depends on classification:
- Single-type repos → the matching `reverse-engineer-<type>` skill
- Monorepos → first the framework/library RE skill, then app RE skills, then `build-knowledge-base`
- Hybrid repos → primary RE skill first, then secondary RE skill(s)
- Unsupported stacks (Stage 2b, option B) → `generate-re-skill` to create a new RE skill

After each repo's RE work completes: that skill's close-out gate (automated verification
or `review-reverse-engineering-package`), then `build-knowledge-base` (aggregates Part B
docs into the central KB).

## Common mistakes

- Recommending an RE skill without first reading the package file and dir structure — guessing leads to wrong classification
- Treating a monorepo as a single repo — each sub-project must be classified independently
- Ignoring the application-vs-framework distinction and defaulting to "application" — check `peerDependencies`, `main`/`exports`, and consumer questions
- Skipping existing-documentation assessment — pre-existing OpenAPI/Javadoc affects the workflow
- Forgetting to emit the exact next-skill trigger phrase — handoff must be unambiguous
