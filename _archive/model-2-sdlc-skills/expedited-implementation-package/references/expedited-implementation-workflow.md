# Expedited Implementation Workflow

## Purpose

Single orchestrator for spec-driven development of small-to-medium changes — skip requirements and solutions packages, keep all implementation discipline. The developer writes a change spec (what, where, why, acceptance criteria, delta), the agent orients on the affected code, produces an implementation plan, executes it with TDD, and delivers a reviewed PR. Five steps: (1) scope — write the change spec interactively, inserting [NEEDS CLARIFICATION] markers for any ambiguity and resolving them before proceeding; (2) orient — read the affected files, identify patterns and conventions, check for existing project context, apply the escape hatch if the change is too large for the expedited flow; (3) plan — produce an ordered implementation plan with phases conforming to the canonical phase shape (../assets/canonical-phase-shape.md), then run the clarity gate (no unresolved markers, every phase has all 8 canonical sections, AC mappings trace to the change spec); (4) execute — follow the phase execution guide (../assets/phase-execution-guide.md) for each phase: phase education, game plan, go/no-go, branch, TDD per task (RED-GREEN-REFACTOR) with 3-dimension verification (Completeness, Correctness, Coherence), approval before commit; (5) deliver — atomic commits, PR description, and adversarial 4-lens review (blind, spec compliance, standards compliance, codebase integration) where zero findings triggers re-analysis. Enforces verification-before-completion at every level: no success claim without fresh verification in the same turn. Progressive rigor: for trivial changes the spec can be a single sentence; for medium changes, the full template. Escape hatch: if orientation reveals the change is too large (many files, cross-module, new data models), recommend the full implementation package instead.

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output (artifact or inline context).
2. Present to the user.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step because a previous step seemed to cover it.
- Start coding before the change spec is agreed and the clarity gate passes.
- Claim success without fresh verification in the same turn.

---

## Step 0a — Determine Feature Folder

Before any work begins, determine the feature output folder.

1. **Check for existing feature folder.** Look for `docs/*/` in the project repository (e.g., from a prior requirements or solutions phase). If a feature folder already exists, reuse it.
2. **If no existing folder**, infer the feature name from the developer's change description. Convert to kebab-case (e.g., `refund-processing`, `user-onboarding`, `fix-login-timeout`).
3. **Present to the user:** *"I'll organize all outputs under `docs/<feature-name>/implementation-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/implementation-package/`."*
5. **Create** `docs/<feature>/implementation-package/` if it does not exist.

All file paths in subsequent steps use `docs/<feature>/implementation-package/` as the output root. There are no sub-phase folders — all artifacts are written directly under this folder.

---

## When to Use

- Small-to-medium changes that don't need a requirements package or solutions package
- The developer can describe the change in a few sentences
- No new data models, complex API endpoints, or architectural decisions
- No cross-team coordination needed

## When NOT to Use — Switch to Full Pipeline

- Change touches many files across module boundaries
- Requires new data models or API endpoint design
- Needs architectural decisions (new patterns, technology choices)
- Requires BSA or architect input
- High risk or high ambiguity

---

## The Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  EXPEDITED WORKFLOW — SPEC-DRIVEN DEVELOPMENT                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SCOPE                   ──► docs/<feature>/implementation-package/                   │
│     Write the change spec:       What, where, why, ACs,         │
│     Reference: change-spec       Delta: ADDED/MODIFIED/REMOVED │
│     [NEEDS CLARIFICATION]        Progressive rigor: trivial =   │
│     markers for ambiguity        one sentence; medium = full    │
│              │                                                   │
│              ▼                                                   │
│  2. ORIENT                  ──► docs/<feature>/implementation-package/          │
│     Read affected files:         Patterns, conventions, test     │
│     Reference: codebase-orientation  Existing context doc  │
│     ESCAPE HATCH: too big?       → recommend full pipeline      │
│              │                                                   │
│              ▼                                                   │
│  3. PLAN                    ──► docs/<feature>/implementation-package/            │
│     Produce phases conforming    Canonical phase shape:          │
│     to canonical phase shape:    Identity, Goal, Dependencies,  │
│     Reference: implementation-plan-creator                    │
│                                Plan, Outcome, AI Gate, Human Gate │
│     CLARITY GATE before          No markers; all 8 sections;    │
│     proceeding                   AC mappings present             │
│              │                                                   │
│              ▼                                                   │
│  ┌───────────┤ PER-PHASE LOOP (phase-execution-guide.md) ──────┐│
│  │           ▼                                                  ││
│  │  4. EXECUTE                                                  ││
│  │     Phase Education → Game Plan → Go/No-Go → Branch          ││
│  │     Then TDD per task:    ──► working code + tests            ││
│  │     RED: failing test         RED-GREEN-REFACTOR per task    ││
│  │     GREEN: minimal code       No production code without     ││
│  │     REFACTOR: clean up        failing test first             ││
│  │     References: feature-implementer                    ││
│  │                 tdd-workflow                           ││
│  │           │                                                  ││
│  │           ▼                                                  ││
│  │     VERIFY (3 dimensions) ──► verification result            ││
│  │     Completeness              Fresh verification in the      ││
│  │     Correctness               same turn — not from memory    ││
│  │     Coherence                                                ││
│  │     Reference: verification                            ││
│  │           │                                                  ││
│  │           ▼                                                  ││
│  │     DEBUG (if needed)    ──► root cause + fix                 ││
│  │     systematic-         4-phase RCA; no fix without    ││
│  │     debugging                 root cause                     ││
│  │           ▼                                                  ││
│  │     APPROVE + COMMIT     ──► user approves, then commit      ││
│  │     Never commit without      Conventional commit message    ││
│  │     explicit approval                                        ││
│  └───────────┤                                                  ││
│              │ (repeat for each phase)                           ││
│              ▼                                                   │
│  5. DELIVER                 ──► merge-ready PR                   │
│     REVIEW UNCOMMITTED diff      4-lens: blind → spec           │
│     before commit                compliance → standards         │
│     ADVERSARIAL REVIEW:          compliance → codebase          │
│     Reference: pr-reviewer       integration                    │
│     Then approved commits        Conventional messages + PR     │
│     Zero findings = re-analyze   description from spec + diff   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Scope

Read `references/change-spec.md` and execute it.

The developer describes the change. The agent helps refine it into a structured spec covering what, where, why, acceptance criteria, out-of-scope, and delta (ADDED/MODIFIED/REMOVED).

**Progressive rigor:**
- **Trivial** (rename, fix typo, update config): spec is a single sentence with one AC. No file needed — inline is fine.
- **Small** (add a button, update a component): short spec with 2–3 ACs. Written to `docs/<feature>/implementation-package/change-spec.md`.
- **Medium** (new component, refactor a module): full template with all sections. Written to `docs/<feature>/implementation-package/change-spec.md`.

**Forced uncertainty markers:** If the developer's description is ambiguous on any point that affects implementation, insert `[NEEDS CLARIFICATION: specific question]` and resolve with the developer before proceeding.

**Output:** `docs/<feature>/implementation-package/change-spec.md` (or inline for trivial changes)

---

## Step 2 — Orient

Read `references/codebase-orientation.md` and execute it.

Read the files that will be modified. Understand the patterns, conventions, and test structure in the affected area. This is not a full codebase audit — only the files relevant to this change.

**Escape hatch:** If orientation reveals any of the following, stop and recommend the full pipeline:
- The change touches more than ~5–7 files
- It crosses module or layer boundaries
- It requires new data models or API endpoint design
- The affected code has complex interdependencies that need architectural analysis

**Output:** `docs/<feature>/implementation-package/codebase-orientation.md` (full detail on disk) + summary presented inline

---

## Step 3 — Plan

Read `references/implementation-plan-creator.md` and execute it.

Produce an ordered implementation plan derived from the change spec and oriented against the actual codebase.

Each phase in the plan must conform to the **canonical phase shape** (see `../assets/canonical-phase-shape.md`):

1. **Phase Identity** — Phase ID, name, AC mapping to the change spec
2. **Goal** — System state after completion (not effort)
3. **Dependencies** — Phases that must complete first
4. **Plan** — Step-by-step instructions (imperative, specific, executable)
5. **Outcome** — Measurable deliverables
6. **Automated Verification (AI Gate)** — Test commands with expected results
7. **Human Verification (Human Gate)** — Review steps requiring human judgment
8. **Success Criteria** — Binary pass/fail checklist

Each phase is executed following the **phase execution guide** (see `../assets/phase-execution-guide.md`): phase education, game plan, go/no-go, branch creation, TDD execution, 3-dimension verification, approval.

**Clarity gate — must pass before execution begins:**

| Check | Pass condition |
|-------|---------------|
| No `[NEEDS CLARIFICATION]` markers | All ambiguities resolved |
| Every phase has all 8 canonical sections | Canonical phase shape is complete |
| Every phase has success criteria | Binary pass/fail defined |
| File paths specified | Each phase names the files it creates or modifies |
| AC mappings present | Every phase traces to change spec acceptance criteria |
| No speculative phases | Every phase traces to a change spec AC |

If the clarity gate fails, return to scope or orient to resolve.

**Output:** `docs/<feature>/implementation-package/implementation-plan.md`

---

## Step 4 — Execute

Execute each phase following the **phase execution guide** (`../assets/phase-execution-guide.md`). Read each execution skill when you reach it in the per-phase loop.

**Per-phase workflow (from the phase execution guide):**

1. **Phase Education** — Explain what, how, dependencies, deliverables
2. **Game Plan** — Order of operations, key decisions, integration points
3. **Checklist** — Granular, specific, complete, traceable tasks
4. **Definition of Done** — All success criteria from the canonical phase shape
5. **Test Coverage** — Unit, integration, component test requirements
6. **Go/No-Go** — Present to user, wait for explicit "go"
7. **Create Branch** — `feature/{phase-id-short-name}`
8. **Execute with TDD** — Per-task RED-GREEN-REFACTOR cycle:
   - **RED** — Write a minimal failing test (`tdd-workflow`)
   - **Verify fail** — Run the test, confirm it fails for the expected reason
   - **GREEN** — Write minimal code to make the test pass (`feature-implementer`)
   - **Verify pass** — Run the test, confirm it passes
   - **REFACTOR** — Clean up without changing behavior
9. **Verify (3 dimensions)** — Completeness, Correctness, Coherence (`verification`)
10. If issues arise, invoke `systematic-debugging` (4-phase RCA)
11. **Request Approval** — Present summary, wait for explicit approval before committing

**Iron rules:**
- No production code without a failing test first
- No success claim without fresh verification in the same turn
- Code written before tests must be deleted and redone
- Never commit without explicit user approval

**Output:** Working, tested code with all phases complete

---

## Step 5 — Deliver

Read `references/pr-reviewer.md` and execute the delivery flow.

1. **Adversarial review before commit** — Review the uncommitted working tree diff so critical findings are fixed before they enter history.
2. **Fix cycle** — Fix Critical and Important findings, rerun verification, and re-review affected changes.
3. **Commit after approval** — Stage and commit reviewed changes with conventional commit messages only after explicit user approval.
4. **PR description** — Generate from the change spec, implementation plan, and diff.
5. **PR handoff** — Create or prepare the PR after approval.

The adversarial review applies four lenses in sequence:

| Lens | What it does |
|------|-------------|
| **Blind review** | Review the diff alone — no spec, no story. Surface anything wrong, unclear, or fragile. |
| **Spec compliance** | Read the change spec and ACs. Re-review the diff for gaps, missing edge cases, ACs not covered by tests. |
| **Standards compliance** | Read all applicable coding standards (language, framework, common, testing). Re-review the diff for rule violations. Standards are the gold standard — existing codebase deviations are not acceptable precedent. |
| **Codebase integration** | Read the surrounding codebase context. Review for convention violations, pattern mismatches, naming inconsistencies. |

**Zero findings triggers re-analysis** — a review that finds nothing is a review that didn't look hard enough.

**Output:** Merge-ready PR

---

## Skill Reference

| Step | Skill | Location | Role |
|------|-------|----------|------|
| 1 | `change-spec` | `references/` | Developer writes the change spec |
| 2 | `codebase-orientation` | `references/` | Lightweight read of affected code |
| 3 | `implementation-plan-creator` | `references/` | Ordered task list from the spec |
| 4 | `feature-implementer` | `references/` | Execute tasks in order |
| 4 | `tdd-workflow` | `references/` | RED-GREEN-REFACTOR cycle |
| 4 | `systematic-debugging` | `references/` | 4-phase root cause analysis |
| 4 | `verification` | `references/` | 3-dimension verification |
| 5 | `pr-reviewer` | `references/` | Adversarial 4-lens review |

## Entry Criteria

- [ ] The developer has a change to make that doesn't need upstream packages
- [ ] The codebase is accessible
- [ ] Existing tests pass (clean starting state)

## Exit Criteria

- [ ] Change spec written and agreed — `docs/<feature>/implementation-package/change-spec.md` on disk (small/medium) or inline (trivial)
- [ ] Codebase orientation complete — `docs/<feature>/implementation-package/codebase-orientation.md` on disk
- [ ] Implementation plan produced and clarity gate passed — `docs/<feature>/implementation-package/implementation-plan.md` on disk
- [ ] All tasks complete with TDD and 3-dimension verification
- [ ] PR created with adversarial review — no unresolved critical findings

## Single-Skill Handoff Prompts

Use these prompts to keep the sequence lightweight while preserving user control:

1. After change spec: "The expedited change spec is agreed. Are you ready for me to orient on the affected code?"
2. After orientation: "Codebase orientation is complete. The change still fits the expedited path. Are you ready for me to create the implementation plan?"
3. If the escape hatch triggers: "This appears too large or risky for the expedited path. I recommend switching to the full `implementation-package` pipeline. Do you want to switch?"
4. After plan: "The expedited implementation plan passed the clarity gate. Are you ready to start TDD execution?"
5. After execution: "Implementation is complete and verified. Are you ready for PR review and handoff?"
6. After PR review: summarize review status, commits/PR status, and any remaining reviewer actions.

Do not read all references upfront. Read only the reference required for the current step.
