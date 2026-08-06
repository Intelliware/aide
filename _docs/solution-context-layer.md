# The Solution-Context Layer

The KB has two complementary halves:

| Half | What it answers | Source | Skills |
|---|---|---|---|
| Code-grounded | What the code is, how it fits, what drifted | RE + git | `build-knowledge-base`, `navigate-knowledge-base`, `update-knowledge-base`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage` |
| Human-grounded | Why it exists, who it serves, what AI must follow, how it runs | Interactive discovery + auto-fill | `capture-solution-context`, `generate-ai-rules`, `document-operations` |

This document explains the human-grounded half — the **solution-
context layer** added in version 1.1.0.

## Why it exists

Reverse-engineering reads code and reconstructs structure, behaviour,
and contracts. It is rigorous and self-validating. But anything that
doesn't show up in code is invisible to it: business goals, KPIs,
personas, vendor relationships, on-call rotations, the AI coding rules
that the team would tell a new engineer on day one.

The layer is the answer to the gap audit in
`_docs/solution-context-gap-audit.md`. It draws inspiration from BMAD
Method's `document-project` (broad project documentation) and
`generate-project-context` (AI guardrails) skills, adapted to A.I.D.E.'s
multi-repo, KB-resident, validation-disciplined shape.

## Layout

The three skills produce sibling subtrees under `<KB>/shared/`:

```
<knowledge_base_path>/shared/
├── solution-context/
│   ├── 00-overview.md                  # mission, value prop, classification
│   ├── 10-personas-and-use-cases.md
│   ├── 20-goals-and-kpis.md
│   ├── 30-constraints-and-compliance.md
│   ├── 40-external-integrations.md
│   └── 50-ownership-and-raci.md
├── ai-rules/
│   ├── project-context.md              # canonical AI guardrails
│   └── per-repo/                       # only when stacks diverge
│       └── <repo-slug>.md
└── operations/
    ├── 00-deployment-topology.md
    ├── 10-environments-and-secrets.md
    ├── 20-slos-and-monitoring.md
    ├── 30-runbooks-and-oncall.md
    └── runbooks/                       # only when 30-...md splits
        └── <runbook-slug>.md
```

Every leaf carries the same trigger-style frontmatter as `components/`
leaves (`description: Use when …`, `triggers: [...]`), so
`navigate-knowledge-base` surfaces them when feature triggers match.

## Project scope, not feature scope

This is critical and easy to get wrong. The solution-context layer is
**project-scoped** and **persistent across features**. The
requirements stage's `current-capability-baseline.md` (produced by
`create-requirements-package/steps/01-discovery.md` in brownfield) is
**feature-scoped** and recomputed per feature.

| Lives in | Scope | Lifetime |
|---|---|---|
| `<KB>/shared/solution-context/` | Project | Years; refresh on major change |
| `docs/<feature>/requirements-package/discovery/` | One feature | One feature lifecycle |

The two layers do not overlap. Solution context informs every
requirements package; the requirements package never replaces solution
context.

## Where it slots in the flows

### Brownfield

```
start-project → analyze-repository → reverse-engineer-<dynamic>
              → build-knowledge-base → verify-knowledge-base-coverage
              → capture-solution-context
              → generate-ai-rules
              → document-operations
              → create-requirements-package → … (rest of flow unchanged)
```

### Greenfield

```
start-project → capture-solution-context           # informs requirements
              → create-requirements-package
              → create-design-package
              → generate-ai-rules                  # stack now exists
              → create-implementation-package
              → document-operations                # infra now exists
              → execute-increments → create-pr
```

### Anytime

All three skills are also runnable anytime so a team can refresh
personas, KPIs, AI rules, or runbooks independently of the active
flow.

## Validation, drift, and coverage

The layer is wired into the existing validation discipline:

- **`verify-knowledge-base-coverage`** warns when expected leaves are
  missing OR when a repo in `[[project.repos]]` has no
  solution-context references.
- **`detect-knowledge-base-drift`** L4 layer checks per-leaf staleness
  against `[knowledge_base.solution_context_max_age_days]` (default 90
  days); flags low/medium severity. Solution-context staleness never
  fires `high` because it does not block code correctness — but
  unmaintained for too long usually indicates the team has stopped
  caring about the human-grounded layer, which is worth surfacing.
- **`navigate-knowledge-base`** returns leaves alongside component
  matches without competing with the component cap, so AI agents
  always have both halves to ground in when they're relevant.

## Interactive vs non-interactive

All three skills are **interactive by default**. The value is in the
discovery conversation; auto-derivation alone produces plausible-but-
wrong stubs. A `--non-interactive` flag is supported for CI smoke
tests and bulk bootstraps, but it intentionally produces incomplete
output with `TODO(human):` markers rather than silently fabricating.

`generate-ai-rules` and `document-operations` are **hybrid** — they
auto-derive what RE Part A and CI/CD configs already prove, then
interactively elicit the unobvious parts. `capture-solution-context`
is **purely interactive** because nothing in code can prove personas,
KPIs, or RACI.

## See also

- `_docs/solution-context-gap-audit.md` — the Stage 1 gap audit.
- `.agents/skills/knowledge-base/README.md` — the stage-level summary.
- `.agents/skills/knowledge-base/{capture-solution-context, generate-ai-rules, document-operations}/references/EXAMPLE.md` — worked end-to-end examples.
