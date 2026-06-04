# Step — Scaffold

Lay down the Part A and Part B file structure **before** any content
extraction so the extraction passes can target known destinations and
the verification gate has a complete file set to check.

## Procedure

### 1. Resolve identifiers

- `<test-suite-id>` — short slug used in Part B paths (default: repo
  directory name; user may override)
- `<test-suite-root>` — absolute path to the suite repo
- `<kb-root>` — `{paths.knowledge_base_path}` from `project.toml`
- `<source-version>` — current HEAD or user-supplied commit / branch /
  tag, recorded in every Part A/B frontmatter

### 2. Create Part A scaffold

Default destination: `<test-suite-root>/docs/INTERNAL.md` (override per
`config/customizations/reverse-engineer-test-suite.toml` if set).

Skeleton sections:

```markdown
# Internal Documentation — <test-suite-id>

> Source version: <source-version>
> Reverse-engineered by: reverse-engineer-test-suite
> Last extraction: <YYYY-MM-DD>

## 1. Runner and Entry Point
## 2. Project Structure
## 3. Configuration Management
## 4. Shared Utilities (by interaction type)
## 5. Fixtures and Test Data Builders
## 6. Page Objects / Step Definitions
## 7. Feature / Spec Inventory
## 8. Marker / Tag Vocabulary
## 9. Environment Matrix
## 10. Reporting and Analytics
## 11. CI Integration
## 12. Naming Conventions
## 13. Framework Patterns
## 14. Known Gaps and Anti-Patterns
## 15. Accepted Tech Debt
## Quick Reference
```

Stage 2–4 of the workflow populate these sections.

### 3. Create Part B scaffold

Default destination: 8 component files under
`<kb-root>/components/<test-suite-id>/`. Create them with frontmatter
stubs only — bodies are filled in Stages 2–4.

| File | Frontmatter stub |
|---|---|
| `runner.md` | `kind: test-suite`, `subkind: runner`, `test_suite_id: <id>`, `source_repo`, `source_version`, `last_verified_against_commit`, `tests: []`, `triggers: []` |
| `shared-utilities.md` | same shape; `subkind: shared-utilities` |
| `fixtures.md` | same shape; `subkind: fixtures` |
| `marker-vocabulary.md` | same shape; `subkind: marker-vocabulary` |
| `feature-inventory.md` | same shape; `subkind: feature-inventory` |
| `environment-matrix.md` | same shape; `subkind: environment-matrix` |
| `ci-surface.md` | same shape; `subkind: ci-surface` |
| `ownership.md` | same shape; `subkind: ownership` |

If `config/customizations/reverse-engineer-test-suite.toml`
`part_b.split` overrides the default 8-file split, honour that.

### 4. Record the scaffold in the change tracker

Invoke `track-change` with one entry per file created (Part A + each
Part B component). Trigger note: `Scaffold by reverse-engineer-test-suite`.

### 5. Verification gate

Confirm with the user:

> Scaffold complete:
> - Part A: `<part-a-path>`
> - Part B: 8 components at `<kb-root>/components/<test-suite-id>/`
>   (frontmatter stubs only)
>
> Ready to begin Stage 2 (Global Infrastructure)?

Wait for acknowledgement.

## Next

Return control to the workflow at Stage 2 (Global Infrastructure).

