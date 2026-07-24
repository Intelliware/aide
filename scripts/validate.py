#!/usr/bin/env python3
"""
validate.py — Deeper cross-check validation for A.I.D.E.

Companion to `build-registry.py`. While build-registry validates the basics of
each SKILL.md (frontmatter, references/ trio, line cap), this script runs the
deeper cross-cutting validation that gates archiving legacy folders (migration
task #8 -> task #9):

  A. Composition / block cross-references.
  B. Workflow-graph resolution against the skill registry.
  C. Description discipline (front-loaded triggers, no workflow tells).
  D. Stale "phase" language under .agents/skills/, templates/blocks/, compositions/.
  E. Block frontmatter integrity.
  F. Re-run of build-registry.py for sanity.
  G. Elicitation-pattern resolution (composition + skill citations resolve;
     orphan patterns flagged).
  H. RE skill output-structure binding.
  I. Separation-of-duties (SoD) rule enforcement against a fixture
     project.toml (and optional cross-cutting artifact). Run with
     `--project-toml PATH` to evaluate rules 7–12 from `config/SCHEMAS.md`.
  J. Write-discipline binding — every `create-*` SKILL.md MUST contain a
     `## Preconditions` section that cites
     `references/ai-principles/write-discipline.md`. Prevents silent
     decay of the write-on-acknowledge contract.

Hard errors fail the run (exit 1):
  - Composition references a non-existent block (A).
  - Unresolved workflow-graph reference (B).
  - Missing required block frontmatter field, missing/unclosed frontmatter,
    slug != filename, applies-to empty, build-registry non-zero exit (E, F).
  - Composition or skill cites an elicitation pattern that does not exist (G).
  - Any SoD rule violation when running in --project-toml mode (I).

Everything else is a soft warning (does not fail). Stdlib-only.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_ROOT = REPO_ROOT / ".agents" / "skills"
TEMPLATES_ROOT = REPO_ROOT / "templates"
BLOCKS_ROOT = TEMPLATES_ROOT / "blocks"
COMPOSITIONS_ROOT = TEMPLATES_ROOT / "compositions"
SKILLS_CSV = SKILLS_ROOT / "_registry" / "skills.csv"
WORKFLOW_GRAPH = SKILLS_ROOT / "_registry" / "workflow-graph.yaml"
BUILD_REGISTRY_SCRIPT = REPO_ROOT / "scripts" / "build-registry.py"
ELICITATION_PATTERNS_DIR = REPO_ROOT / "references" / "elicitation-patterns"
ELICITATION_REF_RE = re.compile(
    r"references/elicitation-patterns/([A-Za-z0-9][A-Za-z0-9_-]*)\.md"
)
BLOCK_PATH_REF_RE = re.compile(r"templates/blocks/([A-Za-z0-9][\w/-]*)\.md")

# Legacy/archive folders excluded from the phase-language sweep.
EXCLUDED_TOPLEVEL = {
    "_archive", "_bmad", "_shared",
    "implementation-execution", "implementation-planning",
    "model-2-sdlc-skills", "requirements-package",
    "reverse-engineering",       # legacy top-level (NOT .agents/skills/reverse-engineering)
    "solution-design-package",
}

# kb-instance is the umbrella value used by KB blocks; the actual composition
# is kb-instance-root (intentional — see kb-instance-root.yaml notes).
KNOWN_APPLIES_TO_ALIASES = {"kb-instance": "kb-instance-root"}

WORKFLOW_TELL_PATTERNS = [
    r"\bproduces and\b",
    r"\bfollows\s+\d+\s+steps?\b",
    r"\bfollows the workflow\b",
    r"\bstep[- ]by[- ]step\b",
    r"\bexecutes the [^.]*sequence\b",
    r"\bperforms\s+\d+\s+actions?\b",
    r"\bimplements the [A-Za-z][A-Za-z -]+ process\b",
]
DESCRIPTION_MAX_LEN = 1024

PHASE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("PHASE- prefix", re.compile(r"\bPHASE-\b")),
    ("phase-status.md", re.compile(r"\bphase-status\.md\b")),
    ("Canonical Phase Shape", re.compile(r"Canonical Phase Shape", re.IGNORECASE)),
    ("Phase Identity header", re.compile(r"^\s{0,3}#{1,6}\s+Phase Identity\b")),
    ("Phase N header (RE)", re.compile(r"^\s{0,3}#{1,6}\s+Phase\s+\d+\b")),  # RE-only
    # Catches "Phase 0/1/2/N" used in body text outside RE folders. RE blocks
    # legitimately discuss "Phase N" of an analyzed system's lifecycle, so
    # this pattern is suppressed under .agents/skills/reverse-engineering/ and
    # templates/blocks/reverse-eng/ in check_d().
    ("Phase N (non-RE)", re.compile(r"\bPhase\s+\d+\b")),
]

# PHASE_PATTERNS labels that must skip RE folders (.agents/skills/reverse-engineering/
# and templates/blocks/reverse-eng/). Other labels apply project-wide.
RE_SUPPRESSED_PHASE_LABELS = {"Phase N header (RE)", "Phase N (non-RE)"}

REQUIRED_BLOCK_FIELDS = ("slug", "title", "applies-to", "requires-decision-from", "optional", "order-hint")

# SoD enum (config/SCHEMAS.md § 4 rules 9 / 10).
SOD_ROLE_ENUM = ("BA", "Architect", "BSA", "Developer", "Tester", "KB-Steward")


# --- frontmatter parser (same shape as build-registry.py) -------------------

def parse_frontmatter(text: str) -> dict[str, object]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    body: list[str] = []
    for line in lines[1:]:
        if line.strip() == "---":
            break
        body.append(line)
    else:
        return {}
    out: dict[str, object] = {}
    last_key: str | None = None
    key_re = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$")
    for raw in body:
        if not raw.strip():
            last_key = None
            continue
        m = key_re.match(raw)
        if m and not raw.startswith((" ", "\t")):
            key, value = m.group(1), m.group(2).strip()
            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                out[key] = [_unquote(p.strip()) for p in inner.split(",") if p.strip()] if inner else []
            else:
                out[key] = _unquote(value)
            last_key = key
        elif last_key is not None and isinstance(out.get(last_key), str):
            out[last_key] = (str(out[last_key]) + " " + raw.strip()).strip()
    return out


def _unquote(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        inner = value[1:-1]
        if value[0] == '"':
            inner = inner.replace('\\"', '"').replace("\\\\", "\\")
        return inner
    return value


# --- discovery --------------------------------------------------------------

def discover_block_files() -> list[Path]:
    return sorted(p for p in BLOCKS_ROOT.rglob("*.md") if p.is_file() and p.name.upper() != "README.MD")


def discover_composition_files() -> list[Path]:
    return sorted(p for p in COMPOSITIONS_ROOT.glob("*.yaml") if p.is_file())


def composition_block_slugs(comp_path: Path) -> list[tuple[str, int]]:
    slugs: list[tuple[str, int]] = []
    in_blocks = False
    for idx, line in enumerate(comp_path.read_text(encoding="utf-8").splitlines(), start=1):
        if line.strip().startswith("blocks:"):
            in_blocks = True
            continue
        if not in_blocks:
            continue
        if line and not line.startswith((" ", "\t")) and line.strip() and not line.lstrip().startswith("#"):
            in_blocks = False
            continue
        m = re.match(r"^\s*-\s+slug:\s*(.+?)\s*$", line)
        if m:
            slugs.append((m.group(1).strip().strip('"').strip("'"), idx))
    return slugs


def composition_name(comp_path: Path) -> str:
    for line in comp_path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^name:\s*(.+?)\s*$", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return comp_path.stem


def discover_skills() -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    if not SKILLS_ROOT.is_dir():
        return out
    for skill_md in sorted(SKILLS_ROOT.rglob("SKILL.md")):
        rel = skill_md.relative_to(REPO_ROOT)
        parts = rel.parts
        if (
            len(parts) < 5
            or parts[0] != ".agents"
            or parts[1] != "skills"
            or parts[2].startswith("_")
        ):
            continue
        out.append({"path": str(rel), "frontmatter": parse_frontmatter(skill_md.read_text(encoding="utf-8"))})
    return out


def workflow_graph_skill_refs() -> list[tuple[str, str]]:
    refs: list[tuple[str, str]] = []
    if not WORKFLOW_GRAPH.exists():
        return refs
    in_anytime = False
    for idx, line in enumerate(WORKFLOW_GRAPH.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith("anytime:"):
            in_anytime = True
            continue
        if in_anytime:
            if line and not line.startswith((" ", "\t", "#")) and stripped:
                in_anytime = False
            else:
                m = re.match(r"^\s*-\s+([a-zA-Z][a-zA-Z0-9-]*)\s*$", line)
                if m:
                    refs.append((m.group(1), f"workflow-graph.yaml:{idx} (anytime)"))
                    continue
        m = re.match(r"^\s*-?\s*skill:\s*([A-Za-z<][\w<>-]*)\s*$", line)
        if m:
            refs.append((m.group(1), f"workflow-graph.yaml:{idx}"))
            continue
        m = re.match(r"^\s*per-increment-closing-skill:\s*([A-Za-z][\w-]*)\s*$", line)
        if m:
            refs.append((m.group(1), f"workflow-graph.yaml:{idx} (closing-skill)"))
    return refs


def known_skill_names() -> set[str]:
    if not SKILLS_CSV.exists():
        return set()
    names: set[str] = set()
    with SKILLS_CSV.open("r", encoding="utf-8") as fh:
        fh.readline()  # header
        for line in fh:
            n = line.split(",", 1)[0].strip()
            if n:
                names.add(n)
    return names


# --- checks -----------------------------------------------------------------

def check_a() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    referenced: set[Path] = set()
    for comp in discover_composition_files():
        rel = comp.relative_to(REPO_ROOT)
        for slug, lineno in composition_block_slugs(comp):
            target = BLOCKS_ROOT / f"{slug}.md"
            if not target.exists():
                errors.append(f"{rel}:{lineno}: composition references missing block '{slug}' (expected at {target.relative_to(REPO_ROOT)})")
            else:
                referenced.add(target.resolve())
    # Direct path references inside skills (SKILL.md, steps/, references/).
    # The framework uses a "no composition wrapper for one-file-per-instance
    # outputs" pattern (see kb-component.yaml notes) — those blocks are
    # rendered directly by KB-stage skills, not via a composition manifest.
    if SKILLS_ROOT.is_dir():
        for md in SKILLS_ROOT.rglob("*.md"):
            if not md.is_file():
                continue
            try:
                text = md.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            for slug in BLOCK_PATH_REF_RE.findall(text):
                target = BLOCKS_ROOT / f"{slug}.md"
                if target.exists():
                    referenced.add(target.resolve())
    for bf in discover_block_files():
        if bf.resolve() not in referenced:
            warnings.append(f"{bf.relative_to(REPO_ROOT)}: orphan block (no composition or skill references it)")
    return errors, warnings


def check_b() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    known = known_skill_names()
    if not known:
        warnings.append(f"{SKILLS_CSV.relative_to(REPO_ROOT)}: not found or empty — registry has not been built.")
        return errors, warnings
    for ref, ctx in workflow_graph_skill_refs():
        if "<dynamic>" in ref:
            continue
        if ref not in known:
            errors.append(f"{ctx}: skill '{ref}' not in skills registry.")
    return errors, warnings


def check_c() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    for rec in discover_skills():
        fm = rec["frontmatter"]
        desc = fm.get("description", "") if isinstance(fm, dict) else ""
        if not isinstance(desc, str) or not desc:
            continue
        path = rec["path"]
        if not desc.lower().startswith("use when"):
            warnings.append(f"{path}: description flag — does not start with 'Use when'")
        for pat in WORKFLOW_TELL_PATTERNS:
            if re.search(pat, desc, flags=re.IGNORECASE):
                warnings.append(f"{path}: description flag — workflow-summary tell: /{pat}/")
        if len(desc) > DESCRIPTION_MAX_LEN:
            warnings.append(f"{path}: description flag — length {len(desc)} > {DESCRIPTION_MAX_LEN}")
    return errors, warnings


def _excluded(rel: Path) -> bool:
    return bool(rel.parts) and rel.parts[0] in EXCLUDED_TOPLEVEL


def _in_code_fence(lines: list[str], idx: int) -> bool:
    fences = sum(1 for i in range(idx) if lines[i].lstrip().startswith("```"))
    return fences % 2 == 1


PHASE_VOCAB_ALLOW_PRAGMA = "validate: allow-phase-vocab"


def check_d() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    targets: list[Path] = []
    for p in SKILLS_ROOT.rglob("*.md"):
        if not _excluded(p.relative_to(REPO_ROOT)):
            targets.append(p)
    targets.extend(BLOCKS_ROOT.rglob("*.md"))
    targets.extend(COMPOSITIONS_ROOT.glob("*.yaml"))
    for path in sorted(targets):
        rel = path.relative_to(REPO_ROOT)
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        # F-001: per-file pragma. Files documenting the legacy "phase" → "increment"
        # migration must reference the old vocabulary; opt them out by adding
        # `<!-- validate: allow-phase-vocab -->` somewhere in the file (typically
        # near the top). Honour for both .md (HTML comment) and .yaml (#-comment).
        if PHASE_VOCAB_ALLOW_PRAGMA in text:
            continue
        lines = text.splitlines()
        rel_str = str(rel)
        in_re_folder = (
            rel_str.startswith(".agents/skills/reverse-engineering/")
            or rel_str.startswith("templates/blocks/reverse-eng/")
        )
        for i, line in enumerate(lines):
            for label, pat in PHASE_PATTERNS:
                if label == "Phase N header (RE)" and not rel_str.startswith(".agents/skills/reverse-engineering/"):
                    continue
                if label in RE_SUPPRESSED_PHASE_LABELS and label == "Phase N (non-RE)" and in_re_folder:
                    continue
                m = pat.search(line)
                if m and label == "Phase N (non-RE)":
                    # Skip pedagogical / historical citations that quote
                    # "Phase N" as a negative example or refer to a legacy
                    # source by its original section title.
                    start = m.start()
                    if start > 0 and line[start - 1] in ("\"", "'"):
                        continue
                if m:
                    if _in_code_fence(lines, i):
                        continue
                    snippet = line.strip()
                    if len(snippet) > 160:
                        snippet = snippet[:157] + "..."
                    warnings.append(f"{rel}:{i+1}: [{label}] {snippet}")
                    break
    return errors, warnings


def check_e() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    composition_names: set[str] = {composition_name(p) for p in discover_composition_files()}
    for bf in discover_block_files():
        rel = bf.relative_to(REPO_ROOT)
        fm = parse_frontmatter(bf.read_text(encoding="utf-8"))
        if not fm:
            errors.append(f"{rel}: missing or unclosed YAML frontmatter")
            continue
        for field in REQUIRED_BLOCK_FIELDS:
            if field not in fm:
                errors.append(f"{rel}: missing required block frontmatter field '{field}'")
                continue
            value = fm[field]
            if field == "applies-to":
                if not isinstance(value, list) or not value:
                    errors.append(f"{rel}: '{field}' must be a non-empty list")
            elif field == "requires-decision-from":
                if not isinstance(value, list):
                    errors.append(f"{rel}: '{field}' must be a list")
                elif not value:
                    warnings.append(f"{rel}: '{field}' is empty (acceptable only for index / tracking blocks)")
        slug_value = fm.get("slug", "")
        if isinstance(slug_value, str) and slug_value != bf.stem:
            errors.append(f"{rel}: frontmatter slug '{slug_value}' does not match filename '{bf.stem}'")
        applies = fm.get("applies-to", [])
        if isinstance(applies, list):
            for a in applies:
                if KNOWN_APPLIES_TO_ALIASES.get(a, a) not in composition_names:
                    warnings.append(f"{rel}: applies-to entry '{a}' is not a known composition")
    return errors, warnings


def _scan_elicitation_refs(path: Path) -> list[tuple[str, int]]:
    """Return [(pattern_stem, line_number), ...] for elicitation refs in path."""
    refs: list[tuple[str, int]] = []
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return refs
    for idx, line in enumerate(text.splitlines(), start=1):
        for m in ELICITATION_REF_RE.finditer(line):
            refs.append((m.group(1), idx))
    return refs


def check_g() -> tuple[list[str], list[str]]:
    """G — elicitation-pattern resolution.

    For every YAML composition under templates/compositions/ and every *.md
    file under .agents/skills/ (SKILL.md, steps/, references/), find every
    `references/elicitation-patterns/<name>.md` reference. Verify the file
    exists on disk; flag missing files as ERRORS. Then flag patterns that
    exist on disk but are referenced by nothing as WARNINGS (orphans).
    """
    errors: list[str] = []
    warnings: list[str] = []

    referenced: set[str] = set()
    sources: list[Path] = []
    sources.extend(p for p in COMPOSITIONS_ROOT.glob("*.yaml") if p.is_file())
    if SKILLS_ROOT.is_dir():
        for p in SKILLS_ROOT.rglob("*.md"):
            if p.is_file() and not p.name.upper().startswith("README"):
                sources.append(p)

    for src in sorted(sources):
        rel = src.relative_to(REPO_ROOT)
        for stem, line_no in _scan_elicitation_refs(src):
            referenced.add(stem)
            target = ELICITATION_PATTERNS_DIR / f"{stem}.md"
            if not target.is_file():
                errors.append(
                    f"{rel}:{line_no}: cites missing elicitation pattern "
                    f"'references/elicitation-patterns/{stem}.md'"
                )

    if ELICITATION_PATTERNS_DIR.is_dir():
        on_disk = {
            p.stem for p in ELICITATION_PATTERNS_DIR.glob("*.md")
            if p.is_file() and p.name.upper() != "README.MD"
        }
        for stem in sorted(on_disk - referenced):
            warnings.append(
                f"references/elicitation-patterns/{stem}.md: orphan pattern "
                "(no composition or skill references it)"
            )
    return errors, warnings


def check_h() -> tuple[list[str], list[str]]:
    """H — RE skill output-structure binding.

    For every `reverse-engineer-*/SKILL.md` under .agents/skills/reverse-engineering/
    (excluding the dispatcher `analyze-repository`), verify that the file:

      1. Cites BOTH of its matched compositions by name (re-<domain>-internal.yaml
         and re-<domain>-consumer.yaml).
      2. Contains the mandatory sentinel section heading
         `## Output structure (mandatory)`.
      3. The two cited compositions exist on disk and have non-empty `blocks:` lists.

    Without this binding, agents are free to invent ad-hoc structures (see F-005).
    """
    errors: list[str] = []
    warnings: list[str] = []
    re_dir = SKILLS_ROOT / "reverse-engineering"
    if not re_dir.is_dir():
        return errors, warnings

    sentinel = "## Output structure (mandatory)"
    for skill_md in sorted(re_dir.rglob("SKILL.md")):
        rel = skill_md.relative_to(REPO_ROOT)
        # Skip the dispatcher.
        if "analyze-repository" in skill_md.parts:
            continue
        # Domain is everything after "reverse-engineer-" in the parent folder name.
        parent = skill_md.parent.name
        if not parent.startswith("reverse-engineer-"):
            continue
        domain = parent[len("reverse-engineer-"):]
        text = skill_md.read_text(encoding="utf-8")

        if sentinel not in text:
            errors.append(f"{rel}: missing mandatory '{sentinel}' section — RE skill must bind output to its compositions")

        for part in ("internal", "consumer"):
            comp_name = f"re-{domain}-{part}.yaml"
            if comp_name not in text:
                errors.append(f"{rel}: does not cite the matched composition '{comp_name}' by name")
            comp_path = COMPOSITIONS_ROOT / comp_name
            if not comp_path.is_file():
                errors.append(f"{rel}: cited composition '{comp_name}' does not exist on disk at {comp_path.relative_to(REPO_ROOT)}")
                continue
            comp_text = comp_path.read_text(encoding="utf-8")
            # Composition must declare default-output-shape and non-empty blocks list.
            if "default-output-shape:" not in comp_text:
                warnings.append(f"{comp_path.relative_to(REPO_ROOT)}: missing `default-output-shape` field (expected for RE compositions)")
            block_count = len([
                line for line in comp_text.splitlines()
                if re.match(r"^\s*-\s+slug:\s*", line)
            ])
            if block_count == 0:
                warnings.append(f"{comp_path.relative_to(REPO_ROOT)}: empty `blocks:` list (intentional stub?)")
    return errors, warnings


WRITE_DISCIPLINE_REF = "references/ai-principles/write-discipline.md"
PRECONDITIONS_HEADING_RE = re.compile(r"^##\s+Preconditions\b", re.MULTILINE)

# The write-discipline contract (references/ai-principles/write-discipline.md)
# explicitly enumerates the three package-authoring skills it binds. Other
# `create-*` skills (e.g. create-pr, create-quality-package) are intentionally
# out of scope today — extending the contract is a deliberate edit to
# write-discipline.md and a corresponding update to this list, not a silent
# expansion via folder-name pattern matching.
WRITE_DISCIPLINE_SKILLS = (
    "create-requirements-package",
    "create-design-package",
    "create-implementation-package",
)


def check_j() -> tuple[list[str], list[str]]:
    """J — write-discipline binding for package-authoring create-* skills.

    For each skill enumerated in WRITE_DISCIPLINE_SKILLS, its SKILL.md MUST:

      1. Contain a top-level `## Preconditions` section heading. A buried
         bullet inside `## Workflow` does not satisfy this — the heading must
         be top-level so it survives context decay and section-walking logic.
      2. Reference `references/ai-principles/write-discipline.md` somewhere in
         the file (typically inside the Preconditions section).

    The two checks are deliberately separate so a partial regression (heading
    present, reference removed; or reference present, heading demoted back to
    a bullet) is still surfaced.
    """
    errors: list[str] = []
    warnings: list[str] = []
    if not SKILLS_ROOT.is_dir():
        return errors, warnings
    if not (REPO_ROOT / WRITE_DISCIPLINE_REF).is_file():
        errors.append(
            f"{WRITE_DISCIPLINE_REF}: target file missing — every bound "
            f"create-* skill cites this path; fix the path or restore the file."
        )
    found: set[str] = set()
    for skill_md in sorted(SKILLS_ROOT.rglob("SKILL.md")):
        skill_name = skill_md.parent.name
        if skill_name not in WRITE_DISCIPLINE_SKILLS:
            continue
        found.add(skill_name)
        rel = skill_md.relative_to(REPO_ROOT)
        text = skill_md.read_text(encoding="utf-8")
        if not PRECONDITIONS_HEADING_RE.search(text):
            errors.append(
                f"{rel}: missing top-level `## Preconditions` section — "
                f"bound create-* skills MUST declare write-discipline as a "
                f"hard precondition (not as a bullet inside `## Workflow`)."
            )
        if WRITE_DISCIPLINE_REF not in text:
            errors.append(
                f"{rel}: does not reference `{WRITE_DISCIPLINE_REF}` — "
                f"bound create-* skills MUST cite the write-discipline contract."
            )
    for missing in sorted(set(WRITE_DISCIPLINE_SKILLS) - found):
        warnings.append(
            f".agents/skills/**/{missing}/SKILL.md: bound write-discipline "
            f"skill not found on disk (renamed or removed?)"
        )
    return errors, warnings


def check_sod(
    project_toml_path: Path,
    artifact_path: Path | None = None,
) -> tuple[list[str], list[str]]:
    """I — Separation-of-duties (SoD) rule enforcement.

    Loads `project_toml_path` (and optionally a cross-cutting artifact .md)
    and evaluates the SoD rules documented in `config/SCHEMAS.md` § 4 (rules
    7–12). Each violation produces an error with a substring matching the
    expected validator message in `_docs/skills-test-plan.md` § A.7.

    Rules covered:
      Rule 7  — `[stages.<stage>].dir` and `colocate_with_source` are mutually
                 exclusive (one mode per stage).
      Rule 8  — `[stages.<stage>].dir`, when set, is a bare relative path.
      Rule 9  — `[stages.<stage>].write_role`, when set, is in SOD_ROLE_ENUM.
      Rule 9b — `[user].role` (when set) must satisfy the active stage's
                 `write_role` — mismatch is a permission error.
      Rule 10 — `[user].role`, when set, is in SOD_ROLE_ENUM.
      Rule 11 — `[project].artifact_subdir`, when set, is a bare relative path
                 (no leading slash, no `{...}` path tokens).
      Rule 12 — Cross-cutting artifact frontmatter must declare a non-empty
                 `affects_repos` array, and every code must resolve to a known
                 `[[project.repos]].code`.
    Rule 6a — `[project.testing].qe_repo`, when set, must resolve to a
             known `[[project.repos]].code`; non-QE repo roles warn.
    """
    import tomllib

    errors: list[str] = []
    warnings: list[str] = []

    if not project_toml_path.exists():
        errors.append(f"{project_toml_path}: file does not exist")
        return errors, warnings

    try:
        with project_toml_path.open("rb") as fh:
            data = tomllib.load(fh)
    except tomllib.TOMLDecodeError as exc:
        errors.append(f"{project_toml_path}: TOML parse error — {exc}")
        return errors, warnings

    declared_repos: set[str] = set()
    repo_roles: dict[str, str] = {}
    for repo in data.get("project", {}).get("repos", []) or []:
        if isinstance(repo, dict):
            code = repo.get("code")
            if isinstance(code, str) and code:
                declared_repos.add(code)
                role = repo.get("role")
                if isinstance(role, str):
                    repo_roles[code] = role

    stages = data.get("stages", {}) or {}

    # Rule 6a — optional QE repo target resolves to a declared repo.
    proj = data.get("project", {}) or {}
    testing = proj.get("testing", {}) if isinstance(proj, dict) else {}
    qe_repo = testing.get("qe_repo") if isinstance(testing, dict) else None
    if qe_repo is not None:
        if not isinstance(qe_repo, str) or not qe_repo.strip():
            errors.append(
                f"{project_toml_path}: [project.testing].qe_repo must be a "
                f"non-empty string matching one declared [[project.repos]].code."
            )
        elif qe_repo not in declared_repos:
            errors.append(
                f"{project_toml_path}: [project.testing].qe_repo = '{qe_repo}' "
                f"references unknown repo — not declared in [[project.repos]]."
            )
        elif repo_roles.get(qe_repo) not in {"test-automation", "qe"}:
            warnings.append(
                f"{project_toml_path}: [project.testing].qe_repo = '{qe_repo}' "
                f"references repo role '{repo_roles.get(qe_repo)}'; expected "
                f"'test-automation' or 'qe' for a dedicated QE repo."
            )

    # Rule 7 — dir XOR colocate per stage.
    for stage_name, stage_cfg in stages.items():
        if not isinstance(stage_cfg, dict):
            continue
        has_dir = "dir" in stage_cfg
        has_colocate = bool(stage_cfg.get("colocate_with_source"))
        if has_dir and has_colocate:
            errors.append(
                f"{project_toml_path}: [stages.{stage_name}] sets both `dir` and "
                f"`colocate_with_source` — these are mutually exclusive (one mode "
                f"per stage)."
            )

    # Rule 8 — dir is a bare relative path.
    for stage_name, stage_cfg in stages.items():
        if not isinstance(stage_cfg, dict):
            continue
        d = stage_cfg.get("dir")
        if d is None:
            continue
        if not isinstance(d, str):
            errors.append(
                f"{project_toml_path}: [stages.{stage_name}].dir must be a string."
            )
            continue
        if d.startswith("/") or d.startswith("\\"):
            errors.append(
                f"{project_toml_path}: [stages.{stage_name}].dir = '{d}': must be "
                f"relative — bare path with no leading slash."
            )

    # Rule 9 — write_role enum.
    for stage_name, stage_cfg in stages.items():
        if not isinstance(stage_cfg, dict):
            continue
        wr = stage_cfg.get("write_role")
        if wr is None:
            continue
        if wr not in SOD_ROLE_ENUM:
            errors.append(
                f"{project_toml_path}: [stages.{stage_name}].write_role = '{wr}': "
                f"unknown role — enum requires one of {list(SOD_ROLE_ENUM)}."
            )

    # Rule 10 — [user].role enum.
    user = data.get("user", {}) or {}
    user_role = user.get("role") if isinstance(user, dict) else None
    if user_role is not None and user_role not in SOD_ROLE_ENUM:
        errors.append(
            f"{project_toml_path}: [user].role = '{user_role}': unknown role — "
            f"enum requires one of {list(SOD_ROLE_ENUM)}."
        )

    # Rule 9b — role mismatch ([user].role must satisfy write_role on every
    # stage that declares one). Permission failure if any stage's write_role
    # disagrees with [user].role.
    if user_role in SOD_ROLE_ENUM:
        for stage_name, stage_cfg in stages.items():
            if not isinstance(stage_cfg, dict):
                continue
            wr = stage_cfg.get("write_role")
            if wr in SOD_ROLE_ENUM and wr != user_role:
                errors.append(
                    f"{project_toml_path}: role mismatch — [user].role='{user_role}' "
                    f"lacks permission to write [stages.{stage_name}] "
                    f"(requires write_role='{wr}')."
                )

    # Rule 11 — artifact_subdir bare relative path.
    asd = proj.get("artifact_subdir") if isinstance(proj, dict) else None
    if asd is not None:
        if not isinstance(asd, str):
            errors.append(
                f"{project_toml_path}: [project].artifact_subdir must be a string."
            )
        else:
            if asd.startswith("/") or asd.startswith("\\"):
                errors.append(
                    f"{project_toml_path}: [project].artifact_subdir = '{asd}': "
                    f"must be relative — bare path with no leading slash."
                )
            if "{" in asd or "}" in asd:
                errors.append(
                    f"{project_toml_path}: [project].artifact_subdir = '{asd}': "
                    f"must be a bare path — path tokens like {{project-root}} "
                    f"are not permitted here."
                )

    # Rule 12 — cross-cutting artifact frontmatter integrity.
    if artifact_path is not None:
        if not artifact_path.exists():
            errors.append(
                f"{artifact_path}: cross-cutting artifact does not exist."
            )
        else:
            text = artifact_path.read_text(encoding="utf-8")
            fm = parse_frontmatter(text)
            if "affects_repos" not in fm:
                errors.append(
                    f"{artifact_path}: cross-cutting artifact must declare an "
                    f"`affects_repos` array in its YAML frontmatter (≥ 1 repo)."
                )
            else:
                ar = fm["affects_repos"]
                if not isinstance(ar, list) or len(ar) == 0:
                    errors.append(
                        f"{artifact_path}: `affects_repos` is empty — cross-cutting "
                        f"artifacts must list ≥ 1 affected repo."
                    )
                else:
                    for code in ar:
                        if code not in declared_repos:
                            errors.append(
                                f"{artifact_path}: `affects_repos` lists unknown repo "
                                f"'{code}' — not declared in [[project.repos]] of "
                                f"{project_toml_path}."
                            )

    return errors, warnings


def check_tools_layer(framework_toml_path: Path) -> tuple[list[str], list[str]]:
    """K — framework-layer guardrail: `[tools.*]` is a project-layer concern.

    Per `config/SCHEMAS.md` § 2.6, framework-layer configs (`framework.toml` /
    `framework.user.toml`) MUST NOT declare `[tools.<name>]` tables — add-on
    tool resolution is a project-layer concern only and `framework.*` cannot
    override it. Loads the given framework-layer TOML and errors if any
    `[tools.*]` table is present.
    """
    import tomllib
    errors: list[str] = []
    warnings: list[str] = []
    if not framework_toml_path.exists():
        errors.append(f"{framework_toml_path}: file does not exist")
        return errors, warnings
    try:
        with framework_toml_path.open("rb") as fh:
            data = tomllib.load(fh)
    except tomllib.TOMLDecodeError as exc:
        errors.append(f"{framework_toml_path}: TOML parse error — {exc}")
        return errors, warnings
    tools = data.get("tools")
    if isinstance(tools, dict) and tools:
        names = ", ".join(sorted(str(k) for k in tools.keys()))
        errors.append(
            f"{framework_toml_path}: framework layer must not declare [tools.*] "
            f"(found: [tools.{names}]) — `[tools.<name>]` is a project-layer concern "
            f"only; framework.* cannot override it (config/SCHEMAS.md § 2.6)."
        )
    return errors, warnings


def check_f() -> tuple[list[str], list[str], str]:
    errors: list[str] = []
    warnings: list[str] = []
    if not BUILD_REGISTRY_SCRIPT.exists():
        warnings.append(f"{BUILD_REGISTRY_SCRIPT.relative_to(REPO_ROOT)}: script not found")
        return errors, warnings, ""
    try:
        proc = subprocess.run(
            [sys.executable, str(BUILD_REGISTRY_SCRIPT), "--dry-run"],
            cwd=str(REPO_ROOT), capture_output=True, text=True, timeout=60,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        errors.append(f"build-registry.py invocation failed: {exc}")
        return errors, warnings, ""
    output = proc.stdout + (("\n" + proc.stderr) if proc.stderr else "")
    if proc.returncode != 0:
        errors.append(f"build-registry.py exited with code {proc.returncode}")
    for line in output.splitlines():
        if "WARN" in line:
            warnings.append(f"build-registry: {line.strip()}")
    return errors, warnings, output


# --- reporting --------------------------------------------------------------

def _print(title: str, errors: list[str], warnings: list[str]) -> None:
    print(f"\n=== {title} ===")
    if not errors and not warnings:
        print("  (no findings)")
        return
    for e in errors:
        print(f"  ERROR  {e}")
    for w in warnings:
        print(f"  WARN   {w}")


def _md(title: str, errors: list[str], warnings: list[str]) -> str:
    parts: list[str] = [f"## {title}", ""]
    if not errors and not warnings:
        parts.append("_No findings._")
    else:
        if errors:
            parts.append(f"### Errors ({len(errors)})\n")
            parts.extend(f"- `{e}`" for e in errors)
            parts.append("")
        if warnings:
            parts.append(f"### Warnings ({len(warnings)})\n")
            parts.extend(f"- `{w}`" for w in warnings)
            parts.append("")
    return "\n".join(parts) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Deeper cross-check validation for A.I.D.E.")
    parser.add_argument("--summary-md", type=str, help="Write a markdown summary to this path.")
    parser.add_argument(
        "--project-toml",
        type=str,
        help=(
            "Path to a project.toml fixture. Switches the validator into SoD-fixture "
            "mode (Check I): evaluates rules 7-12 from config/SCHEMAS.md against the "
            "given file. Exits non-zero on any rule violation. Skips the regular A-H "
            "checks."
        ),
    )
    parser.add_argument(
        "--cross-cutting-artifact",
        type=str,
        help=(
            "Path to a cross-cutting artifact .md (frontmatter + body) — pairs with "
            "--project-toml to evaluate rule 12 (affects_repos must be a non-empty "
            "list of declared [[project.repos]] codes)."
        ),
    )
    parser.add_argument(
        "--framework-toml",
        type=str,
        help=(
            "Path to a framework.toml / framework.user.toml fixture. Switches the "
            "validator into framework-layer guardrail mode (Check K): errors if the "
            "file declares any [tools.*] table (a project-layer-only concern per "
            "config/SCHEMAS.md § 2.6). Exits non-zero on violation. Skips A-H."
        ),
    )
    args = parser.parse_args()

    if args.framework_toml:
        ftoml = Path(args.framework_toml)
        print(f"validate.py — framework-layer guardrail check against {ftoml}")
        k_err, k_warn = check_tools_layer(ftoml)
        _print("Check K — framework-layer [tools.*] guardrail", k_err, k_warn)
        print("\n=== Summary ===")
        print(f"  errors:   {len(k_err)}")
        print(f"  warnings: {len(k_warn)}")
        return 0 if not k_err else 1

    if args.project_toml:
        ptoml = Path(args.project_toml)
        artifact = Path(args.cross_cutting_artifact) if args.cross_cutting_artifact else None
        print(f"validate.py — SoD fixture check against {ptoml}")
        if artifact:
            print(f"  cross-cutting artifact: {artifact}")
        sod_err, sod_warn = check_sod(ptoml, artifact)
        _print("Check I — SoD rules (project.toml)", sod_err, sod_warn)
        print("\n=== Summary ===")
        print(f"  errors:   {len(sod_err)}")
        print(f"  warnings: {len(sod_warn)}")
        return 0 if not sod_err else 1

    print(f"validate.py — running deeper cross-checks against {REPO_ROOT}")
    a_err, a_warn = check_a()
    b_err, b_warn = check_b()
    c_err, c_warn = check_c()
    d_err, d_warn = check_d()
    e_err, e_warn = check_e()
    g_err, g_warn = check_g()
    h_err, h_warn = check_h()
    j_err, j_warn = check_j()
    f_err, f_warn, f_out = check_f()

    titles = [
        "Check A — composition/block cross-references",
        "Check B — workflow-graph resolution",
        "Check C — description discipline",
        "Check D — stale 'phase' language",
        "Check E — block frontmatter integrity",
        "Check G — elicitation-pattern resolution",
        "Check H — RE skill output-structure binding",
        "Check J — write-discipline binding (create-* skills)",
        "Check F — build-registry.py output",
    ]
    bundles = [
        (a_err, a_warn), (b_err, b_warn), (c_err, c_warn), (d_err, d_warn),
        (e_err, e_warn), (g_err, g_warn), (h_err, h_warn), (j_err, j_warn),
        (f_err, f_warn),
    ]
    for t, (e, w) in zip(titles, bundles):
        _print(t, e, w)

    total_errors = sum(len(e) for e, _ in bundles)
    total_warnings = sum(len(w) for _, w in bundles)
    print("\n=== Summary ===")
    print(f"  errors:   {total_errors}")
    print(f"  warnings: {total_warnings}")

    if args.summary_md:
        out_path = Path(args.summary_md)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        verdict = "PASS (no errors)" if total_errors == 0 else f"FAIL ({total_errors} errors)"
        rec = (
            "**Proceed to task #9 (archive legacy folders).** No hard errors detected. Soft warnings are advisory and can be triaged after archiving."
            if total_errors == 0
            else "**Hold task #9.** Address the hard errors above first, then re-run `scripts/validate.py`."
        )
        rows = "\n".join(
            f"| {label} | {len(e)} | {len(w)} |"
            for label, (e, w) in zip(
                ["A — composition/block cross-references", "B — workflow-graph resolution",
                 "C — description discipline", "D — stale 'phase' language",
                 "E — block frontmatter integrity",
                 "G — elicitation-pattern resolution",
                 "H — RE skill output-structure binding",
                 "J — write-discipline binding (create-* skills)",
                 "F — build-registry sanity"],
                bundles,
            )
        )
        sections = [
            "# A.I.D.E. — Validation Report (task #8)",
            "",
            "_Generated by `scripts/validate.py`. Re-run after every skill add/move/rename, after authoring or editing compositions or blocks, and as the final readiness check before each archive operation._",
            "",
            "## Executive summary",
            "",
            f"- **Verdict:** {verdict}",
            f"- **Total errors:** {total_errors}",
            f"- **Total warnings:** {total_warnings}",
            "",
            "| Check | Errors | Warnings |",
            "|---|---|---|",
            rows,
            "",
            _md(titles[0], a_err, a_warn),
            _md(titles[1], b_err, b_warn),
            _md(titles[2], c_err, c_warn),
            _md(titles[3], d_err, d_warn),
            _md(titles[4], e_err, e_warn),
            _md(titles[5], g_err, g_warn),
            _md(titles[6], h_err, h_warn),
            _md(titles[7], j_err, j_warn),
            "## Check F — build-registry.py output",
            "",
        ]
        if f_err or f_warn:
            if f_err:
                sections.append(f"### Errors ({len(f_err)})\n")
                sections.extend(f"- `{e}`" for e in f_err)
                sections.append("")
            if f_warn:
                sections.append(f"### Warnings ({len(f_warn)})\n")
                sections.extend(f"- `{w}`" for w in f_warn)
                sections.append("")
        else:
            sections.append("_No findings._\n")
        sections.extend([
            "### Raw output", "", "```", (f_out.rstrip() if f_out else "(empty)"), "```", "",
            "## Open items",
            "",
            "- Six RE compositions ship with `blocks: []` by design (re-api-consumer, re-api-framework-internal, re-mobile-app-consumer, re-mobile-framework-internal, re-ui-framework-internal, re-web-app-consumer); blocks for these compositions are TBD and the corresponding source block subdirectories are intentionally empty.",
            "- The `kb-instance` value used in several KB block `applies-to` fields is an alias for the actual composition `kb-instance-root` (intentional — see `kb-instance-root.yaml` notes). Aliased automatically by the validator.",
            "- All Check D findings (if any) under `.agents/skills/planning/**/canonical-increment-shape*.md`, `.agents/skills/planning/**/review-workflow.md`, `.agents/skills/planning/create-implementation-package/references/OVERVIEW.md`, and `templates/blocks/planning/README.md` are intentional historical references documenting the PHASE→INC migration mapping; they are accepted as soft warnings.",
            "- Description discipline (Check C) is heuristic; flagged items merit human judgement, not automatic rejection.",
            "- The phase-language sweep (Check D) skips legacy folders (`_archive/`, `_bmad/`, `_shared/`, `implementation-execution/`, `implementation-planning/`, `model-2-sdlc-skills/`, `requirements-package/`, top-level `reverse-engineering/`, `solution-design-package/`) which task #9 will archive.",
            "",
            "## Recommendation",
            "",
            rec,
            "",
            "## When to re-run",
            "",
            "Re-run `scripts/validate.py --summary-md <path>` after every skill add/move/rename, after authoring or editing compositions or blocks, and as the final readiness check before each archive operation.",
            "",
        ])
        out_path.write_text("\n".join(sections), encoding="utf-8")
        print(f"\nWrote markdown report: {out_path}")

    return 0 if total_errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
