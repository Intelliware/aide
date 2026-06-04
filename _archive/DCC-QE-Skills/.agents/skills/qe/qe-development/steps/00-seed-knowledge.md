# Phase 0 — Seed Knowledge

## Purpose
Elicit the JIRA issue, increment file (INC-XX), or fallback instructions; verify Atlassian CLI connectivity when needed; load the context; then ensure `docs/KNOWLEDGE.md` exists before any development work begins.

## Process

### 1. Elicit input

If the user did not supply any input when invoking the skill, prompt:

> "Please provide one of the following to get started:
> - A **JIRA issue ID** (e.g. `CEAJ-1234`)
> - An **increment ID** (e.g. `INC-001`)
> - Say **no ticket** if you have neither and will describe what to test"

Wait for the response before proceeding.

### 2. Branch on response

**If a JIRA ID was given:**

a. Invoke `setup-atlassian-cli` as a prerequisite — read and execute `.agents/skills/meta/setup-atlassian-cli/SKILL.md` beginning at Step 0 (the quick-check fast-path). This confirms connectivity and emits the CLI reference. If setup fails, halt and resolve connectivity before continuing.

b. Once connectivity is confirmed, fetch the issue from `tools/atlassian-cli/`:
   ```
   node bin/atl.js jira issue <KEY>
   ```
   Hold the fetched markdown output (summary, description, acceptance criteria) as **JIRA context** for Phase 1. Tell the user: "Loaded JIRA issue `<KEY>`: `<summary>`."

**If an INC ID was given (e.g. `INC-001`):**

a. Search `TDBC-knowledge-base/features/` for the increment file. Try these paths in order:
   1. Locate a `features/<feature-folder>/implementation-package/plan/increments/` directory containing a file named `<INC-ID>.md` (e.g. `INC-001.md`).
   2. If the feature folder is ambiguous (multiple matches), ask the user once: "Which feature folder does `<INC-ID>` belong to? (e.g. `outgoing-wires-mvp2-import`)"

b. Read the INC file. Extract and hold as **INC context** for Phase 1:
   - `## 1. Increment Identity` — Name, Layer, FR Mapping
   - `## 2. Goal` — the increment goal statement
   - Any acceptance criteria listed in the file

c. Record the resolved KB feature folder path — it is used in Phase 0b to skip the discovery loop.

d. No Atlassian CLI connectivity check is needed.

e. Tell the user: "Loaded increment `<INC-ID>`: `<name>`. FR Mapping: `<FRs>`. Proceeding."

f. Use the INC ID as the working directory name: `features/<INC-ID>/` (e.g. `features/INC-001/`).

**If the user said "no ticket":**

Prompt: "Please describe the changes you want to test. Include the expected behaviour and any acceptance criteria you have."

Wait for the description. Hold it as **requirements context** for Phase 1. Use a kebab-slug of the first few words as the working directory name (e.g. `features/login-error-handling/`).

### 3. Check KNOWLEDGE.md

- Check if `BB-DCC-QE/docs/KNOWLEDGE.md` exists and is non-empty.

**If missing or empty:**
- Inform user: "docs/KNOWLEDGE.md not found. Running qe-code-scanner to seed codebase knowledge..."
- Invoke `qe-code-scanner` skill (full scan). Wait for completion.

**If exists — staleness check:**

1. Read the `Scanned:` date from the `## SCAN METADATA` section (format: `YYYY-MM-DD`).
2. Run in the BB-DCC-QE repo root:
   ```
   git log --since="<scan-date>" --oneline -- src/
   ```
3. Count the commits returned.
   - **0 commits** → file is fresh. Tell user: "KNOWLEDGE.md is up to date (scanned `<date>`, no src/ changes since). Loading..."
   - **1–5 commits** → warn:
     > "⚠️ KNOWLEDGE.md was scanned on `<date>`. `<N>` commit(s) have been made to `src/` since then. It may be slightly stale. Proceeding with existing knowledge — run `/qe-code-scanner` after this session if step defs changed."
   - **6+ commits** → prompt the user:
     > "⚠️ KNOWLEDGE.md was scanned on `<date>` and `<N>` commits have been made to `src/` since. The codebase may have changed significantly. Rescan now before proceeding? (yes / no / skip)"
     - **yes** → invoke `qe-code-scanner` (full scan), then continue.
     - **no / skip** → continue with existing KNOWLEDGE.md; note the risk in session context.

- Read KNOWLEDGE.md into session context — treat as single source of truth.

### 4. Create working directory

Create `BB-DCC-QE/features/<JIRA-ID-or-INC-ID-or-slug>/` if it doesn't exist.

### 5. Confirm readiness

Tell the user:
> "Ready. Context loaded from [JIRA `<KEY>` / INC `<INC-ID>` / user description]. Framework: [X]. [N] step defs, [N] utility methods, [N] feature files indexed. Proceeding to Phase 1."

## Exit criteria
- JIRA ID, INC ID, or fallback description is known and held as context
- If JIRA ID: Atlassian CLI connectivity confirmed and issue fetched
- If INC ID: INC file located and read; KB feature folder path recorded
- KNOWLEDGE.md exists and is loaded into session
- Working directory exists
- User is informed of readiness

## Next step
Proceed to **Phase 0c** (`steps/00c-testability-check.md`) — Testability Check.
Do NOT skip to Phase 0b or Phase 1 directly.

