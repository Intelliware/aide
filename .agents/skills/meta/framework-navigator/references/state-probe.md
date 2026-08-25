# State Probe — reference

The state probe is the cheap, first thing the navigator does in either mode.
Its job is to convert the workspace into a small, structured summary the
recommendation step (or the catalog footer) can use without re-reading files.
This document is the canonical specification of what gets checked, in what
order, and what each finding implies.

## When to run

Always. The probe is < 50ms and produces high-signal output. Both modes
benefit:

- **Goal mode** uses the probe to bias matching (e.g. "user said 'help me with
  requirements' but `flow=quick-dev`" → ask whether they want to switch flows).
- **Catalog mode** uses the probe only for the contextual footer ("your project
  is configured for X; the natural next step is Y").

## What the probe checks (in order)

### Step 1 — `project.toml`

Read `{cwd}/project.toml` (or walk upward from `{cwd}` until a `project.toml`
is found, stopping at the filesystem root or the user's home directory,
whichever comes first).

| Finding | Implication |
|---|---|
| File missing | Not yet a A.I.D.E. project. **Recommend `start-project`** before anything else. |
| File present, malformed | Recommend `customize-framework` or manual repair; do not guess fields. |
| File present, valid | Continue with subsequent checks; cache `[project].default_flow`, `[project.paths]`, `knowledge_base_path`, `[project.elicitation]`. |

### Step 1b — feature registry (opt-in)

Check for `features.toml` at the project root (sibling to `project.toml`).

| Finding | Implication |
|---|---|
| Missing | Project has not opted into feature-scoped paths. `active_feature` stays `None`; no downstream implication — every other check proceeds exactly as if this step did not exist. |
| Present | Resolve `[user].active_feature` from `project.user.toml` (see `config/SCHEMAS.md` § 2.9). Record it if it names a feature present in `features.toml`; otherwise record `None` and note the stale-pointer case. |

This is a probe, not a gate — the navigator never halts on a missing or stale
active feature. It only informs the recommendation (step 03 may add
`select-feature` as a prerequisite ahead of a feature-aware skill) and the
catalog-mode footer. See `references/ai-principles/feature-precondition.md`
Mode C for the full rationale.

### Step 2 — flow declaration

Inspect `[project].default_flow`:

| Value | Implication |
|---|---|
| `greenfield` | Expect to see (in order) `requirements_package/`, `design_package/`, `implementation_package/`, executed code. Recommend the first stage whose package is not yet present. |
| `brownfield` | Expect to see `knowledge_base_path/ARCHITECTURE.md` (KB built) before any stage package. If the KB is empty, recommend `analyze-repository` → domain RE skill → `build-knowledge-base`. |
| `quick-dev` | Expect to see `quick-change-spec.md`, `quick-change-plan.md`, then executed code. Recommend the first quick-dev skill whose artifact is missing. |
| unset | Use `framework.toml.[core].default_flow` (default `greenfield`). |
| unknown value | Flag and recommend `customize-framework` to fix. |

### Step 3 — stage-artifact checks

Resolve paths from `[project.paths]` (defaulting per `config/SCHEMAS.md` § 2.3
when fields are absent) and check existence + non-emptiness of each:

| Path | Stage signal |
|---|---|
| `requirements_package/` (or its TOML-configured equivalent) | Requirements stage has at least started if present and non-empty. |
| `design_package/` | Design stage started. |
| `implementation_package/` | Planning stage started — increments authored. |
| `implementation_package/INC-*/` | Execution stage in progress. |
| `quick-change-spec.md` | Quick-dev stage started. |
| `quick-change-plan.md` | Quick-dev plan exists. |

### Step 4 — knowledge base

If `[project.paths].knowledge_base_path` is set, resolve and check the KB
folder:

| Finding | Implication |
|---|---|
| Path unset | KB stage skills will error early. If flow is `brownfield`, recommend setting it (via `customize-framework`). |
| Path set but folder missing | KB never built. For `brownfield` recommend `build-knowledge-base` once RE outputs exist. |
| Folder present but no `ARCHITECTURE.md` | KB scaffolded but not built. Recommend `build-knowledge-base`. |
| `ARCHITECTURE.md` + `components/` + `graph.json` present | KB is built. Stage skills can proceed; navigator should mention `navigate-knowledge-base` for KB-aware grounding. |

### Step 5 — RE outputs (brownfield only)

Look across the project repos (`[[project.repos]]`) for any
`docs/` / `documentation/` folders containing reverse-engineered Part A or
Part B docs. Their presence indicates RE has begun for that repo. Their
**absence** when `flow=brownfield` and KB is empty is the strongest signal
to start with `analyze-repository`.

### Step 6 — orphan / inconsistent state

After collecting the above, flag any of these contradictions explicitly in the
probe output (do not silently proceed):

- `flow=greenfield` but a `quick-change-spec.md` exists at the project root.
- `flow=quick-dev` but a full `requirements_package/` exists.
- `implementation_package/INC-*/` increments exist but no
  `implementation_package/INC-XXX-plan.md` (orphan increments).
- KB folder populated but `[[project.repos]]` is empty (KB has nothing to
  source from).
- Two flows half-done — e.g. requirements package + quick-change-spec both
  present and non-trivial.

When an inconsistency is flagged, the navigator surfaces it before any
recommendation: "I see X and Y on disk, which suggests two flows may be in
progress. Which do you want to continue?"

## Output shape (in-memory)

The probe yields a small dict the recommend step consumes. There is no
on-disk artifact. Fields:

```
{
  "project_toml_present": bool,
  "flow": "greenfield" | "brownfield" | "quick-dev" | None,
  "features_toml_present": bool,
  "active_feature": <feature-id string | None>,
  "knowledge_base_path": <resolved path | None>,
  "kb_built": bool,
  "stage_artifacts": {
    "requirements_package": bool,
    "design_package": bool,
    "implementation_package": bool,
    "execution_in_progress": bool,
    "quick_change_spec": bool,
    "quick_change_plan": bool,
  },
  "re_outputs_present": bool,
  "inconsistencies": [str, ...],
}
```

The recommend step pattern-matches on this dict; the catalog-mode footer
quotes a one-line summary.
