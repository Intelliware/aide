# analyze-repository — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute or relative path to the root of the repo to analyze. Elicit from the user if not in context.

### Optional

- **Existing documentation pointer** — path to any existing docs (e.g., `docs/`, README.md, OpenAPI spec). If unspecified, the skill scans for these automatically.
- **Consumer hint** — user statement about who the repo serves ("internal team app", "published as an npm library"). Disambiguates the application-vs-framework distinction.
- **Monorepo intent** — user statement that the path is a monorepo and which sub-folders to inspect.

### What it reads from disk

- Top-level package/build files (one of: `package.json`, `pom.xml`, `build.gradle`, `Cargo.toml`, `*.csproj`, `Podfile`, `Package.swift`, `requirements.txt`, `setup.py`, `pyproject.toml`, `go.mod`).
- Top two levels of directory structure.
- Dependency manifest contents (for telltale framework signals).
- README.md, `docs/`, and any `*.yaml`/`*.json` files at the root that look like API specs.
- For monorepos, repeats the above for each `apps/<name>` and `packages/<name>` sub-tree.
- For mainframe repos (no manifest): file-extension density across `*.cbl/*.cob/*.cpy/*.pli/*.jcl/*.proc/*.bms/*.dbd/*.psb`, plus quick line-grep for `IDENTIFICATION DIVISION`, `PROCEDURE DIVISION`, `EXEC CICS|SQL|DLI`, JCL `//STEP[0-9]* EXEC`, and Endevor / ChangeMan / Panvalet header markers.

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path
- Whether the path is a monorepo
- The repo's intended consumer (end-user vs. developer)
- Any scope exclusions (deprecated folders, legacy v1, third-party vendored code)

## Outputs

### Primary artifact

A structured recommendation document with these sections:

```
## Repository Analysis: <Repo Name>

**Repository Path:** <path>
**Primary Language:** <language>
**Framework / Stack:** <detected stack>
**Version:** <from package/build file>

### Classification

| Component | Type | Skill | Priority |
| --- | --- | --- | --- |
| <component> | <type> | <skill name> | 1 / 2 / 3 |

### Recommended Approach

1. Start with <skill> because <reason>
2. Then <skill> because <reason>
3. Finally, feed Part B docs into `build-knowledge-base`

### Existing Documentation

<assessment of what exists>

### To begin, say:

> "<exact trigger phrase for the first skill>"
```

### Side effects

- None. The skill does not write to the source repository.
- Does not create files in the framework's output directories.
- The recommendation is delivered to the user inline; the user can save it themselves if desired.

## Schema validation

This skill does not write structured artifacts, so no JSON-Schema validation applies. The validation pass (task #8) will confirm:
- All ten domain skill names are referenced exactly as registered
- The recommendation table format is consistent
- The handoff trigger phrase syntax matches the slash-command vocabulary

## Hand-off contract

The next-skill invocation phrase emitted by this skill must:
1. Match a registered RE domain skill exactly.
2. Be wrapped in quotes / fenced code so the user can copy-paste.
3. Include any context the next skill needs (repo path, version, existing-docs-path) when known.

If multiple RE skills are recommended, only the FIRST trigger phrase is emitted prominently. Subsequent skills are listed in the "Recommended Approach" section but their invocation phrases are surfaced after each prior skill completes.
