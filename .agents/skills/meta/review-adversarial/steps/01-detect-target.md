# Step 1 — Detect target

Goal: resolve `--target`, classify the artifact, and infer `--stage` if absent. Cheap; no LLM analysis yet.

## 1.1 Resolve `--target`

- If the path does not exist → halt with: `Target path not found: <path>`. No file written.
- If the path is a file → use it directly.
- If the path is a directory → look for the canonical entry file in this priority order:
  - `requirements-package.md`
  - `design-package.md`
  - `implementation-package.md`
  - `ARCHITECTURE.md`
  - `change-brief.md` (quick-dev)
  - the lowest-numbered `<NN>-*.md` block at the root (RE Part A / Part B trees are
    composition-rendered, so `01-*.md` is the entry block — there is no `internal.md`
    or `consumer.md`)
  - the only `.md` file at the directory root, if exactly one exists
- If no canonical entry file is found → halt with: `No canonical entry file in <dir>. Pass --target to a specific file.`

For an RE tree, resolving to the entry block does **not** mean the rest of the tree is
ignored: read the sibling blocks too, and if the tree is large enough that you sample
rather than read all of it, say so in the findings file. A bounded read reported as full
coverage is the failure this whole layer exists to prevent.

Record the resolved path as `target_path`.

## 1.2 Classify `target_artifact`

Look at frontmatter and path together. Use the first match.

| Signal | `target_artifact` |
|---|---|
| Frontmatter `artifact_type: requirements-package` OR path matches `docs/*/requirements-package/requirements-package.md` or `*-requirements.md` under the requirements output directory | `requirements-package` |
| Frontmatter `artifact_type: design-package` OR path matches `docs/*/solutions-package/solution-package.md` or `*-design.md` under the design output directory | `design-package` |
| Frontmatter `artifact_type: implementation-package` OR path matches `implementation-package.md` under the implementation output directory | `implementation-package` |
| Path under `<source-repo>/docs/<domain>-internal/` or `<KB>/source-docs/<repo-slug>/<domain>-consumer/` OR frontmatter `artifact_type: re-part-a` / `re-part-b` | `reverse-engineering-doc` |
| Path under `<KB>/components/` OR frontmatter has `component_id:` | `knowledge-base-component` |
| Path equals `<KB>/ARCHITECTURE.md` OR `<KB>/CLAUDE.md` OR target is a `<KB>/` directory | `knowledge-base-instance` |
| Frontmatter `artifact_type: quick-change-brief` OR path matches `*-quick-dev-spec.md` under the requirements output directory, or the pre-2.7.5 `docs/*/quick-dev-package/*-quick-dev-spec.md` | `quick-change-brief` |
| (none of the above) | `other` |

## 1.3 Infer `--stage` if absent

If `--stage` was passed and is in the allowed set, use it.

If `--stage` was not passed, derive from `target_artifact`:

| `target_artifact` | Inferred `stage` |
|---|---|
| `requirements-package` | `requirements` |
| `design-package` | `design` |
| `implementation-package` | `planning` |
| `reverse-engineering-doc` | `reverse-engineering` |
| `knowledge-base-component` | `knowledge-base` |
| `knowledge-base-instance` | `knowledge-base` |
| `quick-change-brief` | `quick-dev` |
| `other` | `meta` |

If `--stage` was passed but not in the allowed set → halt with: `Invalid --stage: <value>. Allowed: requirements, design, planning, execution, reverse-engineering, knowledge-base, quick-dev, meta.`

## 1.4 Resolve `--target-commit`

- If `--target-commit` was passed → use it.
- Else → run `git rev-parse --short HEAD` in the directory containing the target. If git fails (target outside any repo) → record `unknown` and continue.

## 1.5 Resolve `--output-path`

- If `--output-path` was passed → use it. Ensure parent directory exists (`mkdir -p`).
- Else → derive `_review/<artifact-slug>/<ISO8601-utc>/review-adversarial.md`, where:
  - `<artifact-slug>` is the target file basename without extension, lowercased, hyphenated.
  - `<ISO8601-utc>` is the current UTC time in `YYYY-MM-DDTHH-MM-SSZ` form (colon-free for filesystem safety).

## Output of this step

A small in-memory record:

```yaml
target_path: <resolved>
target_artifact: <classified>
stage: <inferred or supplied>
target_commit: <sha or 'unknown'>
output_path: <resolved>
```

This record feeds Step 2.
