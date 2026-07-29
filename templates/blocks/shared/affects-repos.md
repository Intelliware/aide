---
slug: affects-repos
title: "Affects Repos"
applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-quality-package, brownfield-quality-package]
requires-decision-from: [architect]
optional: true
order-hint: 2
---

## Affects Repos

Cross-cutting feature scope marker. **Required when this artifact is being
authored as a cross-cutting feature in a separation-of-duties (SoD) project
layout** (artifact lives under a `_cross-cutting/` directory). Single-repo
features (artifacts placed under a `<repo-code>/` subdirectory) do not need
this block — their location already encodes the scope.

When present, this block lists every source repository whose code changes are
needed to deliver the feature. Downstream skills (`create-implementation-package`,
`execute-increments`) read these values at Step 0 to scope per-repo invocations.

---

### Frontmatter contract

The artifact's YAML frontmatter MUST include `affects_repos` as an array of
`code` values matching entries in `[[project.repos]]` from `project.toml`:

```yaml
---
feature_id: {{feature_id}}
title: {{feature_title}}
affects_repos: [{{repo_code_1}}, {{repo_code_2}}, ...]
---
```

Validation rules (enforced by a future config-loader; documented in
`config/SCHEMAS.md`):

- Cross-cutting artifacts (under `_cross-cutting/`) MUST carry `affects_repos`.
- Every value MUST resolve to a known `[[project.repos]].code`.
- Single-repo artifacts MAY omit the field; if present, must have exactly one
  entry matching the artifact's `<repo-code>` directory.

---

### Body — Affected Repositories table

| Repo Code | Role | Why this repo participates |
|---|---|---|
| {{affects_repo_1_code}} | {{affects_repo_1_role}} | {{affects_repo_1_rationale}} |
| {{affects_repo_2_code}} | {{affects_repo_2_role}} | {{affects_repo_2_rationale}} |
| {{affects_repo_n_code}} | {{affects_repo_n_role}} | {{affects_repo_n_rationale}} |

> One row per affected repo. **Repo Code** matches `[[project.repos]].code`.
> **Role** is the tech-stack hint from the same entry (`api`, `ui`, …) — not
> an RBAC role. **Why this repo participates** is one sentence naming the
> contract / surface / behaviour this feature changes in that repo.

---

### When this block applies

This block is **optional** at composition time. Include it only when the
artifact is being authored as a cross-cutting feature in a project that has
adopted the SoD layout (see `config/SCHEMAS.md` on `[stages.<stage>]` SoD
modes). For projects without SoD configured, or for artifacts under a
single-repo `<repo-code>/` directory, omit this block entirely — the
artifact's location already encodes the scope.
