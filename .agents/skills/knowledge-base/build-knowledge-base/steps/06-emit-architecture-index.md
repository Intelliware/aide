---
slug: emit-architecture-index
sequence: 6
depends-on-prior: true
---

# Step 6 — Emit ARCHITECTURE.md

## Goal

Render the root index by composing the `kb-instance-root` composition (which
combines `architecture-index` and `capability-index` blocks).

## Inputs

- `templates/compositions/kb-instance-root.yaml`.
- `templates/blocks/knowledge-base/architecture-index.md`.
- `templates/blocks/knowledge-base/capability-index.md`.
- All component frontmatter (read via grep + parse).
- `graph.json` (for node count, edge count, and Mermaid generation).
- Cross-cutting pointer mapping from step 4c.
- Captured commit SHAs from step 1.

## Procedure

0. **Solution Overview pointer (§ 0).** Add a header section
   `## 0. Solution Overview` at the top of `ARCHITECTURE.md` that links
   to the three solution-level shared subtrees. Render even when those
   subtrees are still empty (so first-time readers find the doors that
   `capture-solution-context`, `generate-ai-rules`, and
   `document-operations` will fill):

   ```markdown
   ## 0. Solution Overview

   The KB has two halves: the code-grounded half (this file +
   `components/` + `graph.json`) and the human-grounded half under
   `shared/`. Read these first when grounding a discussion in the
   solution rather than in the code:

   - [`shared/solution-context/00-overview.md`](shared/solution-context/00-overview.md) — mission, value proposition, classification
   - [`shared/solution-context/10-personas-and-use-cases.md`](shared/solution-context/10-personas-and-use-cases.md) — personas and jobs-to-be-done
   - [`shared/solution-context/20-goals-and-kpis.md`](shared/solution-context/20-goals-and-kpis.md) — goals and KPIs
   - [`shared/solution-context/30-constraints-and-compliance.md`](shared/solution-context/30-constraints-and-compliance.md) — constraints and compliance
   - [`shared/solution-context/40-external-integrations.md`](shared/solution-context/40-external-integrations.md) — vendor catalog
   - [`shared/solution-context/50-ownership-and-raci.md`](shared/solution-context/50-ownership-and-raci.md) — ownership, RACI, on-call
   - [`shared/ai-rules/project-context.md`](shared/ai-rules/project-context.md) — AI coding rules and architectural must-nots
   - [`shared/operations/`](shared/operations/) — deployment topology, environments, SLOs, runbooks
   ```

   For each link, if the target file does not yet exist, render the
   link with a trailing `(pending — run <skill name>)` annotation
   instead of an `(empty)` annotation. Pending links are valid output;
   `verify-knowledge-base-coverage` warns when they persist past the
   bootstrap sequence.

1. **Solution Summary (3 paragraphs).** Distill from RE Part B "system
   purpose" sections, supplemented by `project.toml` `[project]` `domain`
   and `description`:
   - ¶1: what the system does in plain language.
   - ¶2: the architectural style (microservices? modular monolith?
     event-driven?) and the one-or-two shaping decisions.
   - ¶3: explicit boundaries and out-of-scope items.

2. **Repository Map table.** One row per `[[project.repos]]` entry:

   | Code | Role | Path | Primary Owner | Last Indexed Commit |

   `Last Indexed Commit` ← captured SHA from step 1.

3. **Component Catalog table.** One row per component:

   | Component ID | Repo | Type | Description | Doc |

   `Doc` is a relative link to `components/<repo>/<id>.md`.

4. **Capability Index (§ 4).** Render
   `templates/blocks/knowledge-base/capability-index.md` separately,
   then splice it into § 4 of the architecture-index block (per
   `kb-instance-root.yaml` notes).

   Capability rows are derived **in the build skill, not by hand**:
   - Group components by their primary verb-phrase in `description`.
   - Cluster verb-phrases that mean the same thing (e.g. `place order`
     and `submit cart` collapse to capability `place order`).
   - Each cluster becomes one row; `Component IDs` lists every
     contributing component.

   The example rows shipped with `capability-index.md` are removed from
   the final output once the real index has ≥3 rows.

5. **Dependency Graph (§ 5).** Generate Mermaid C4-Level-2 syntax from
   `graph.json`:
   - One Mermaid node per component (grouped into Mermaid `subgraph` per
     repo).
   - One Mermaid edge per graph edge, with `kind` rendered as the edge
     label.
   - Distinct line styles per edge kind: solid for `calls`, dashed for
     `consumes`, dotted for `depends-on`, double-line for `derives-from`.
   - Splice into the `{{dependency_graph_mermaid_c4_l2}}` placeholder.

6. **Cross-Cutting Concerns (§ 6).** Six rows from the mapping built in
   step 4c. Each `Doc Pointer` is a relative path into the owning repo
   under `<kb>/source-docs/<owning-repo>/`.

7. **How To Load This KB (§ 7).** Use the boilerplate text in the
   architecture-index block; substitute `{{staleness_warning_days}}` from
   `framework.toml` `[knowledge_base] staleness_warning_days` (default `30`).

8. **Maintenance Hooks (§ 8).** Keep the boilerplate; substitute the
   skill names referenced in this stage's README. The legacy hook names
   (`build-knowledge-base-index`, `verify-knowledge-base`,
   `build-component-doc`) are replaced by this stage's actual skill
   names: `build-knowledge-base` (this skill), `update-knowledge-base`,
   `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`,
   `navigate-knowledge-base`.

9. **Header metadata.** Fill the front-of-doc placeholders:
   - `{{project_name}}` ← `project.code` translated to title case via
     `project.name`.
   - `{{project_code}}` ← `project.code`.
   - `{{project_domain}}` ← `project.domain`.
   - `{{last_full_reindex_date}}` ← today's date.
   - `{{last_full_reindex_commit}}` ← primary repo's SHA.
   - `{{kb_maintainer}}` ← `framework.user.toml` `[user] name`, falling
     back to the primary repo's owning team.

10. **Write** to `<kb>/ARCHITECTURE.md`.

## Acceptance

- File exists at `<kb>/ARCHITECTURE.md`.
- All sections § 1–§ 8 are present and contain no remaining
  `{{placeholders}}`.
- The Component Catalog row count equals component file count.
- The Mermaid diagram parses (no syntax errors).
- Capability Index has ≥1 row per cluster of components with similar
  verb-phrases.

## Hand-off

`steps/07-emit-claude-md.md`.
