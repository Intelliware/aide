# Pluggable Tool Add-ons (JIRA / Confluence / Doc-Conversion) — Design & Extraction Plan

| Field | Value |
|---|---|
| Status | **Implemented** on `mm/AIDE-core-changes` (Phases 1–5); tooling extracted to the `aide-addons` repo |
| Date | 2026-07-13 (implemented 2026-07-21) |
| Foundation | Builds on framework 1.6.5 (multi-root discovery, 5-layer config, managed-block AGENTS.md install runbook) |
| Backward compatibility | **Hard requirement.** Existing projects that keep JIRA/Confluence/doc-conversion in-repo, and projects that use none of them, must continue working with no change. |
| Scope | Move integration tooling out of core A.I.D.E. into one or more separately-versioned **add-on repos**, discovered as sibling workspace folders and wired into flows via config. |

---

## 0. TL;DR

- The integration skills (`jira/`, `confluence/`, `files-conversion/`) and their CLIs (`tools/packages/atlassian-cli`, `sharepoint-cli`, `shared-utils`) are already **optional leaf nodes** — no core skill, gate, or composition depends on them. Extraction is mostly organizational.
- An **add-on repo** is a normal repo carrying its own `.agents/skills/…` and `tools/…`. Opened as a sibling workspace folder, its skills are **auto-discovered today** by the host's multi-root `.agents/skills/` scan — no new discovery machinery needed for the common case.
- **Multiple add-on repos are first-class.** There is no single `{addon-root}`. Every add-on registers its tools independently under `[tools.<name>]`, and each block names its own `install_root`. N add-ons compose by union.
- Three seams carry the work: **(1) tool resolution** must move from the hardcoded `cd tools && npm run atl --` fallback to a config-resolved location; **(2) flow consumption** needs one new backward-compatible convention — a config-named *source adapter* that a core flow hands off to by name; **(3) the internal registry** learns an optional list of extra skill roots so add-on skills appear in the catalog.
- Only Seam 1 and Seam 2 are real design work, and both are additive and backward-compatible. Seam 3 is a small enhancement to `build-registry.py`. Nothing weakens an existing flow gate.

---

## 1. Goals

Support a workflow where integration tooling is **not shipped in core A.I.D.E.** but can be added per-project by cloning one or more add-on repos beside the framework and copying a small amount of config. Concretely:

1. A team using **quick-dev** can import the requirements for a change from a **JIRA story**, via a customized JIRA add-on.
2. A team using **brownfield** can import the specifications for an enhancement from a **Confluence page**, via the existing extract skill augmented by a customized tool.
3. A project can install **several** add-ons at once (e.g. an Atlassian add-on and a SharePoint add-on, or two Atlassian add-ons targeting different sites) without collision.
4. Projects that install **no** add-ons, or that keep tooling in-repo as today, are unaffected.

Non-goals: a package manager, versioned dependency resolution, or a network-fetched plugin store. Add-ons are git repos the user clones; wiring is explicit config.

---

## 2. Current state — coupling map

### 2.1 What is already decoupled

| Fact | Evidence |
|---|---|
| CLIs declare themselves non-framework and unrequired | `tools/README.md` ("not part of the A.I.D.E. framework … not required by any stage skill") |
| Integration skills are optional in flows | `.agents/skills/_registry/workflow-graph.yaml` — `jira-extract-requirements` / `confluence-extract-package` are `optional: true, role: discovery-input` (greenfield ~L68/72, brownfield ~L134/138); `jira-get`, `jira-search`, `confluence-fetch`, `document-convert` are `anytime:` utilities (~L200-203) |
| No core skill names them | `create-requirements-package`, all `quick-dev/*`, and every design/planning/execution/quality skill: zero references |
| Compositions are agnostic | `templates/compositions/brownfield-enhancement-spec.yaml`: no tool-skill references |
| CLI located by runtime probe, not hardcoded path | `jira-get/SKILL.md:111-122` (`atl --version` → direct, else `cd tools && npm run atl --`) |

### 2.2 What is coupled (must be addressed before a move)

| Coupling | Location | Why it breaks on extraction |
|---|---|---|
| Workspace-relative CLI fallback `cd tools && npm run atl --` | `jira-get/SKILL.md:111-122`, `jira-search/SKILL.md:69,145`, `jira-extract-requirements/references/quick-reference.md:39,54`, and the `confluence-*` / `document-convert` skills | `cd tools` resolves relative to the invocation cwd and assumes `tools/` lives in the AIDE repo. In an add-on repo the fallback finds nothing. |
| Doc links `../../../../tools/packages/…` | six SKILL.md files (`jira-get/SKILL.md:207-208`, `jira-search/SKILL.md:189`, `jira-extract-requirements/SKILL.md:148`, `confluence-extract-package/SKILL.md:135`, `confluence-fetch/SKILL.md:151`, `document-convert/SKILL.md:160`) | Dead links once the skill and `tools/` move together into another repo at a different relative depth. |
| Internal registry single root | `scripts/build-registry.py:142` (`SKILLS_ROOT.rglob("SKILL.md")`) | Catalog / `framework-navigator` listing would omit add-on skills. Host *discovery* is unaffected (multi-root); only the internal catalog is. |

**Key distinction.** "Customization" in A.I.D.E. is two mechanisms, and this proposal uses both:

- **Skill discovery** — the host scanning `.agents/skills/` across every workspace folder (`AGENTS.md`, multi-root). This is how an add-on's skills become invokable. It is *not* the TOML system.
- **Config customization** — the 5-layer TOML merge (`config/SCHEMAS.md`). It merges *values*; it has **no** step-injection or hook facility (`customize-framework` explicitly excludes editing skill logic). It therefore cannot, by itself, wire an add-on skill into a flow — hence Seam 2's small new convention.

---

## 3. The add-on repo

An add-on is an ordinary repo, opened as a sibling workspace folder:

```
aide-atlassian-addon/                     # sibling of the AIDE repo and the project repo
  aide-addon.toml                         # NEW: add-on manifest (see §4.3)
  .agents/skills/
    jira/{jira-get,jira-search,jira-extract-requirements}/
    confluence/{confluence-fetch,confluence-extract-package}/
  tools/packages/{atlassian-cli,shared-utils}/
  config/customizations/*.toml.example    # ready-to-copy wiring examples
  README.md                               # install runbook
```

- Its skills are discovered by the host's existing multi-root scan — **nothing to configure for discovery**.
- Its CLIs install locally (`cd aide-atlassian-addon/tools && npm install`), exactly as `tools/` does today.
- Multiple add-ons coexist because each declares its own tools and skills; the framework unions them.

A SharePoint/doc-conversion add-on is the same shape with `files-conversion/` skills and the `sharepoint-cli` package. A team can clone both.

---

## 4. Config surface (the three seams)

### 4.1 Seam 1 — tool resolution (`[tools.<name>]`)

Replace the hardcoded `cd tools && npm run atl --` fallback with a config-resolved location. New optional top-level table. Add-on capability is **project-scoped**, so it lives in the project layers, not the machine-global framework layers: the team declares *intent* in `project.toml`, and each person overrides only the *local path* in `project.user.toml` (gitignored) when their clone location differs. Because `[tools.*]` is a table, the recursive table merge (`config/SCHEMAS.md §1.3`) makes "declare in team layer, override one key in personal layer" work with no new mechanism.

```toml
# project.toml (team, committed) — declares intent: this project uses Atlassian
[tools.atlassian]
cli          = "atl"                                   # probe this on PATH first
install_root = "{workspace}/aide-atlassian-addon/tools" # fallback: cd here && npm run <cli> --
run_script   = "atl"                                   # npm script name for the fallback
setup_doc    = "{workspace}/aide-atlassian-addon/tools/packages/atlassian-cli/SETUP-ATL-CLI.md"

[tools.sharepoint]
cli          = "spt"
install_root = "{workspace}/aide-sharepoint-addon/tools"
run_script   = "spt"
```

```toml
# project.user.toml (personal, gitignored) — overrides only the local path
[tools.atlassian]
install_root = "/Users/me/somewhere-else/aide-atlassian-addon/tools"
```

- **Where it lives:** intent in `project.toml` (so the team shares "we use Atlassian"); local-path override in `project.user.toml`. Not `framework.user.toml` — an add-on used on one project should not leak into another. The `{workspace}` token makes the default path portable enough that most teammates never need the personal override.
- **Multiple add-ons:** each `[tools.<name>]` block is independent; there is no global add-on root. Two Atlassian add-ons pointed at different sites are just `[tools.atlassian-prod]` and `[tools.atlassian-sandbox]`, each with its own `install_root`.
- **New path token `{workspace}`** — the multi-root workspace root (parent of the sibling folders). Added to the existing token set (`config/SCHEMAS.md §1.5`: `{project-root}`, `{framework-root}`, `{home}`, `{cwd}`). Absolute paths remain allowed for users who don't use a shared workspace parent.
- **Resolution order in the skill:** (1) probe `cli` on PATH → use directly; (2) else resolve `install_root` and run `cd <install_root> && npm run <run_script> --`; (3) else halt with a clear "add-on not installed" message pointing at `setup_doc`. This is exactly today's two-step probe with the literal `tools` path made configurable.
- **Backward compatibility:** if no `[tools.*]` block matches, the skill falls back to the literal `cd tools && npm run <cli> --` — i.e. **today's behavior**. In-repo installs keep working untouched.

### 4.2 Seam 2 — flow consumption (source-adapter convention)

Give the discovery step of a consuming flow an optional, config-named skill to hand off to. Per-skill Layer 5 customization:

```toml
# config/customizations/plan-quick-change.toml
[skills.plan-quick-change]
requirements_source = "jira-extract-requirements"     # add-on skill name, or unset

# config/customizations/create-requirements-package.toml
[skills.create-requirements-package]
discovery_source = "confluence-extract-package"
```

Consuming-skill logic (added to `plan-quick-change`, `document-quick-change`, `create-requirements-package`):

1. Read `requirements_source` / `discovery_source` from merged config.
2. If **unset** → behave exactly as today (no change; this is the default).
3. If **set** and the named skill is discoverable → hand off **by name** (`## Source adapter\n<name>`, the existing name-based handoff pattern; never `@`-include) to produce a structured input package, then resume the normal, still-gated flow consuming that package.
4. If **set** but not discoverable / add-on missing → surface the gap, name the add-on to install (e.g. *"set to `jira-extract-requirements`, but no such skill is discoverable — clone the Atlassian add-on to make it available"*), and offer to proceed with manual discovery. Never silently skip.

This adapter-missing branch is also **the only place a missing add-on is announced**. Core ships **no stub skills**: once extracted, `jira-get` and friends simply do not exist unless the add-on is installed and discovered. A bare `/jira-get` with no add-on is an unknown command — there is no intent to honor there — so the helpful "install the add-on" message belongs here, where the user *has* expressed intent via `requirements_source` / `discovery_source`.

This is the only genuinely new framework convention. `create-requirements-package` already has the conceptual slot — the workflow-graph documents these extract skills as "discovery-input feeding Step 1"; this makes that slot config-driven and extends the same idea to quick-dev, which has no such slot today.

### 4.3 Seam 3 — registry & add-on enumeration

Two small pieces:

- **`aide-addon.toml` manifest** (in each add-on repo root) declares what the add-on provides, so the framework can *enumerate installed add-ons* rather than infer them:

  ```toml
  [addon]
  name = "atlassian"
  description = "JIRA + Confluence extraction via the Atlassian CLI"
  provides_skills = ["jira-get", "jira-search", "jira-extract-requirements",
                     "confluence-fetch", "confluence-extract-package"]
  registers_tools = ["atlassian"]        # matches a [tools.<name>] block
  ```

- **`build-registry.py` extra roots** — accept an optional list of additional skill roots (e.g. from a `[registry].extra_skill_roots` config array or CLI flag) and include those SKILL.md files in `skills.csv`/`skills.json`, tagged with their originating add-on. Default (no extra roots) = today's single-root behavior. `framework-navigator` then lists add-on skills alongside core ones.

Host *discovery* of add-on skills does not depend on this; it is purely so the internal catalog and navigator are complete.

---

## 5. Worked scenarios

### 5.1 Quick-dev imports requirements from a JIRA story

Preconditions: `aide-atlassian-addon` cloned as a sibling; `[tools.atlassian]` set; `customizations/plan-quick-change.toml` sets `requirements_source = "jira-extract-requirements"`.

1. User starts `/plan-quick-change` for `PROJ-1234`.
2. Skill reads `requirements_source` → hands off by name to `jira-extract-requirements`.
3. Add-on skill probes `atl` (PATH → else `{workspace}/aide-atlassian-addon/tools`), fetches the story, writes the structured requirements package to cache.
4. `plan-quick-change` resumes with that package as its input; the rest of quick-dev is unchanged.

### 5.2 Brownfield imports specs from a Confluence page

Preconditions: same add-on; `customizations/create-requirements-package.toml` sets `discovery_source = "confluence-extract-package"`.

1. User starts `/create-requirements-package` (brownfield-enhancement composition).
2. Skill reads `discovery_source` → hands off to `confluence-extract-package`, which fetches the page (with `--with-jira` enrichment intact).
3. Extracted content feeds Step 1 (discovery); authoring proceeds normally.
4. The required `review-requirements-package` gate still fires — **no gate weakened**.

If the add-on is absent in either scenario, the skill says so and offers manual discovery.

---

## 6. Backward compatibility

| Case | Behavior |
|---|---|
| No add-on, no `[tools.*]`, no `*_source` | Identical to today. |
| Tools kept in-repo (`tools/`), no `[tools.*]` | `cd tools && npm run <cli> --` fallback still fires — unchanged. |
| Add-on installed but `*_source` unset | Add-on skills are invokable ad-hoc (as `anytime:` utilities today); no flow auto-invokes them. |
| Add-on installed and `*_source` set, add-on later removed | Skill detects the missing adapter and offers manual discovery; no crash. |

Backward compatibility is a hard requirement and is satisfied by making every new field optional with a today-equivalent default.

---

## 7. Extraction / migration plan

Ordered so each step is independently shippable and backward-compatible.

**Phase 1 — Generalize tool resolution (tools still in-repo).**
- Add the `[tools.<name>]` schema to `config/SCHEMAS.md` and `config/framework.toml.example` / `project.toml.example`; add the `{workspace}` token to the path-token section and to `resolve_config.py`.
- Rewrite the CLI probe/fallback text in all six integration skills to read `[tools.<name>]` (probe → `install_root` → literal `tools` fallback). No behavior change for in-repo installs.
- *Files:* `config/SCHEMAS.md`, `config/*.example`, `_bmad/scripts/resolve_config.py`, `.agents/skills/jira/*`, `.agents/skills/confluence/*`, `.agents/skills/files-conversion/document-convert/*`.

**Phase 2 — Source-adapter convention (additive).**
- Document the convention (new reference under `references/orientation/` or `references/ai-principles/`).
- Add the config read + name-based handoff to `plan-quick-change`, `document-quick-change`, `create-requirements-package`.
- Ship example customizations: `config/customizations/plan-quick-change.toml.example`, `create-requirements-package.toml.example` (extend existing).
- *Files:* the three consuming SKILL.md files, `config/customizations/*.example`, one reference doc.

**Phase 3 — Registry extra roots + manifest.**
- Extend `scripts/build-registry.py` (and `build-registry.js`) to accept `[registry].extra_skill_roots`; tag rows with originating add-on.
- Define `aide-addon.toml` schema; document in `config/SCHEMAS.md`.
- *Files:* `scripts/build-registry.py`, `scripts/build-registry.js`, `config/SCHEMAS.md`.

**Phase 4 — Physically extract.**
- Create `aide-atlassian-addon` and `aide-sharepoint-addon` repos with the §3 shape; move the skills and `tools/packages/*` into them; fix the `../../../../tools/…` doc links to add-on-internal paths.
- Remove the extracted skills from core `.agents/skills/`; regenerate registry/shims; remove/soften the `optional` entries in `workflow-graph.yaml` (they are `optional`, so removal is safe) or leave them as documented adapter hooks.
- Add an "install an add-on" runbook mirroring the 1.6.5 managed-block AGENTS.md install runbook.
- *Files:* new repos; `.agents/skills/{jira,confluence,files-conversion}/` (delete); `.agents/skills/_registry/*` (regenerate); `tools/` (thin to shared-only or empty); README/AGENTS install docs.

**Phase 5 — Docs & test pass.**
- Update `README.md` / `AGENTS.md` "tools are optional" language to "tools ship as add-ons."
- Re-run the skills test pass (`_docs/skills-test-*`) for quick-dev and brownfield with and without an add-on present.

Phases 1–3 land in core with zero extraction and full backward compatibility; Phase 4 is the actual move and is the only step that touches two repos.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Add-on skills invisible to `framework-navigator` | Phase 3 extra-roots + manifest; until then, they are still host-discoverable and slash-invokable. |
| `{workspace}` undefined outside a multi-root workspace | Absolute paths and `{home}` remain valid in `install_root`; document both. |
| Name collisions across add-ons (two `jira-get`) | `aide-addon.toml` manifests + registry tagging surface collisions; recommend unique skill names per add-on (`jira-get` vs `jira-sandbox-get`). |
| Silent skip when adapter configured but missing | §4.2 step 4 mandates surfacing the gap, never silent skip (consistent with the write-discipline "no silent truncation" norm). |
| Dead relative doc links after move | Phase 4 explicitly rewrites the six `../../../../tools/…` links. |

---

## 9. Decisions

1. **Config location — decided.** `[tools.*]` is **project-scoped**: intent declared in `project.toml` (committed, shared), local-path override in `project.user.toml` (gitignored). Not `framework.user.toml` — an add-on used on one project must not leak machine-wide to others. Recursive table merge makes the split work with no new mechanism (§4.1).
2. **Handoff mechanism — decided.** The source adapter **writes a structured package to cache** (e.g. `cache/jira/…`); the flow reads it from disk. Matches the existing integration-skill cache contract, the write-on-acknowledge invariant, and keeps the pulled input re-runnable and inspectable across context resets. Not in-memory (§4.2, §5).
3. **Missing add-on — decided.** **No stub skills.** Once extracted, an add-on skill exists only when its repo is installed and discovered; a bare `/jira-get` without the add-on is simply an unknown command. The "install the add-on" hint is surfaced by the flow's adapter-missing branch (§4.2 step 4), where the user has expressed intent, not by a core stub.

No open questions remain; the proposal is ready for implementation planning (Phase 1).

---

## 10. Implementation notes (as built)

Implemented across five commits on `mm/AIDE-core-changes`, plus a new sibling
repo `aide-addons`. Deviations from the plan above, all deliberate:

- **One add-on repo, not per-vendor.** All integration tooling (Atlassian +
  SharePoint skills and CLIs, sharing `shared-utils`) lives in a single
  `aide-addons` repo with manifest `[addon].name = "atlassian-sharepoint"`.
- **Quick-dev hook is `document-quick-change`, not `plan-quick-change`.** The
  requirements-import point is the spec's existing-artifact intake (Step 3 of
  `document-quick-change`), which is where tickets/PRs are already gathered.
  `plan-quick-change` only reads the finished spec, so it carries no adapter.
- **`{workspace}` token added** to `config/SCHEMAS.md` §1.5 for sibling-repo
  resolution; `[tools.*]` documented in §2.6, `aide-addon.toml` in §2.7.
- **Doc links preserved for free.** Because `tools/` moved to the add-on repo
  root (same `.agents/skills/ → tools/` geometry as core), the skills'
  `../../../../tools/…` links resolve unchanged; only the CLI *invocation* text
  became config-driven (`[tools.*].install_root`).
- **Registry parity fix.** `build-registry.py` was pinned to LF + `ensure_ascii=
  False` so it and `build-registry.js` now produce byte-identical output; both
  gained `--extra-skill-root` and an `origin` column.
- **The whole `tools/` dir was add-on tooling** — including
  `organize-requirements-package.js` (it organizes a fetched *Confluence* page
  tree), so nothing from `tools/` stayed in core.
