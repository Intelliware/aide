#!/usr/bin/env python3
"""
build-registry.py — Generate the skill registry artifacts for theframework.

Purpose
-------
Walks every `.agents/skills/**/SKILL.md` file under the repo root, parses each
file's YAML frontmatter, validates a small set of structural invariants, and
emits two machine-readable artifacts the rest of the framework consumes:

    .agents/skills/_registry/skills.csv     (header + one row per skill)
    .agents/skills/_registry/skills.json    (same data, JSON shape)

When to run
-----------
After ANY of the following:
  - Adding a new skill (new SKILL.md created)
  - Removing or renaming a skill (folder rename / move between stages)
  - Editing SKILL.md frontmatter (`name` or `description` changed)
  - Adding/removing the references/ trio (OVERVIEW / INPUTS-OUTPUTS / EXAMPLE)

The companion `.agents/skills/_registry/workflow-graph.yaml` is hand-authored
and is NOT touched by this script.

Output paths
------------
  .agents/skills/_registry/skills.csv
  .agents/skills/_registry/skills.json

Both are repo-relative; the script resolves them against the repo root, which
is computed as the parent of this script's directory.

Validation (warnings only, never fatal)
---------------------------------------
  - Missing required frontmatter fields (`name`, `description`)
  - Mismatched folder name vs. `name` field
  - Missing references/ trio (OVERVIEW.md, INPUTS-OUTPUTS.md, EXAMPLE.md)
  - SKILL.md longer than 200 lines

Exit codes
----------
  0  success (warnings may have been printed)
  1  hard failure (no SKILL.md files found, write failure, etc.)

Flags
-----
  --dry-run    Parse + validate + print summary; do not write files.
  --verbose    Print one line per skill as it is processed.

This script depends only on the Python 3 standard library.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

REQUIRED_FIELDS = ("name", "description")
REFERENCE_FILES = ("OVERVIEW.md", "INPUTS-OUTPUTS.md", "EXAMPLE.md")
MAX_SKILL_LINES = 200

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_ROOT = REPO_ROOT / ".agents" / "skills"
REGISTRY_DIR = SKILLS_ROOT / "_registry"
CSV_PATH = REGISTRY_DIR / "skills.csv"
JSON_PATH = REGISTRY_DIR / "skills.json"

CSV_COLUMNS = ("canonical_id", "name", "description", "stage", "package", "path")


def parse_frontmatter(text: str) -> dict[str, str]:
    """Parse the YAML frontmatter of a SKILL.md file.

    Supports the narrow shape that SKILL.md files actually use:
      - File starts with a `---` line.
      - Frontmatter is closed by another `---` line.
      - Each entry is `key: value` on a single line.
      - Values may be bare strings, single-quoted, or double-quoted (with
        escaped \\" inside double quotes).
      - Values may run across continuation lines (folded YAML scalar) — any
        non-key indented line is appended to the previous value with a single
        space separator.
      - List values (`key: [a, b, c]`) are returned as a comma-joined string.

    No nested mappings, no block scalars (`|` / `>`), no anchors. Anything
    unexpected returns whatever was parsed so far; the caller's validators will
    flag the missing fields.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    body: list[str] = []
    for line in lines[1:]:
        if line.strip() == "---":
            break
        body.append(line)
    else:
        # Never closed; treat as missing frontmatter.
        return {}

    out: dict[str, str] = {}
    last_key: str | None = None
    key_re = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$")
    for raw in body:
        if not raw.strip():
            last_key = None
            continue
        m = key_re.match(raw)
        if m and not raw.startswith((" ", "\t")):
            key, value = m.group(1), m.group(2).strip()
            value = _unquote(value)
            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                items = [_unquote(p.strip()) for p in inner.split(",") if p.strip()]
                value = ", ".join(items)
            out[key] = value
            last_key = key
        elif last_key is not None:
            # Continuation line: append to previous value.
            out[last_key] = (out[last_key] + " " + raw.strip()).strip()
    return out


def _unquote(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        inner = value[1:-1]
        if value[0] == '"':
            inner = inner.replace('\\"', '"').replace("\\\\", "\\")
        return inner
    return value


def discover_skills(verbose: bool = False) -> list[dict[str, object]]:
    """Walk .agents/skills/**/SKILL.md and return one record per skill."""
    if not SKILLS_ROOT.is_dir():
        sys.stderr.write(f"ERROR: skills directory not found at {SKILLS_ROOT}\n")
        sys.exit(1)
    records: list[dict[str, object]] = []
    for skill_md in sorted(SKILLS_ROOT.rglob("SKILL.md")):
        rel = skill_md.relative_to(REPO_ROOT)
        parts = rel.parts  # (".agents", "skills", "<stage>", "<skill>", "SKILL.md")
        if len(parts) < 5 or parts[0] != ".agents" or parts[1] != "skills":
            continue
        stage = parts[2]
        if stage.startswith("_"):
            continue  # skip _registry/, _archive/, etc.
        folder = parts[-2]
        text = skill_md.read_text(encoding="utf-8")
        fm = parse_frontmatter(text)
        records.append({
            "stage": stage,
            "folder": folder,
            "frontmatter": fm,
            "path": str(rel),
            "abs_path": skill_md,
            "line_count": len(text.splitlines()),
        })
        if verbose:
            print(f"  parsed {rel} (name={fm.get('name', '<missing>')}, lines={records[-1]['line_count']})")
    return records


def validate(records: list[dict[str, object]]) -> list[str]:
    warnings: list[str] = []
    for rec in records:
        path = rec["path"]
        fm = rec["frontmatter"]
        for field in REQUIRED_FIELDS:
            if not fm.get(field):
                warnings.append(f"{path}: missing required frontmatter field '{field}'")
        name = fm.get("name", "")
        if name and name != rec["folder"]:
            warnings.append(
                f"{path}: frontmatter name '{name}' does not match folder '{rec['folder']}'"
            )
        skill_dir = rec["abs_path"].parent
        refs_dir = skill_dir / "references"
        if not refs_dir.is_dir():
            warnings.append(f"{path}: missing references/ directory")
        else:
            for ref in REFERENCE_FILES:
                if not (refs_dir / ref).exists():
                    warnings.append(f"{path}: references/ missing required file '{ref}'")
        if rec["line_count"] > MAX_SKILL_LINES:
            warnings.append(
                f"{path}: SKILL.md has {rec['line_count']} lines (>{MAX_SKILL_LINES})"
            )
    return warnings


def to_rows(records: list[dict[str, object]]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for rec in records:
        fm = rec["frontmatter"]
        canonical_id = fm.get("name", rec["folder"])
        rows.append({
            "canonical_id": canonical_id,
            "name": canonical_id,
            "description": fm.get("description", ""),
            "stage": str(rec["stage"]),
            "package": "",
            "path": str(rec["path"]),
        })
    rows.sort(key=lambda r: (r["stage"], r["canonical_id"]))
    return rows


def write_csv(rows: list[dict[str, str]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(CSV_COLUMNS))
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_json(rows: list[dict[str, str]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"version": 1, "skills": rows}
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the skill registry CSV/JSON.")
    parser.add_argument("--dry-run", action="store_true", help="Do not write files.")
    parser.add_argument("--verbose", action="store_true", help="Print per-skill progress.")
    args = parser.parse_args()

    print(f"Scanning {SKILLS_ROOT.relative_to(REPO_ROOT)}/ ...")
    records = discover_skills(verbose=args.verbose)
    if not records:
        sys.stderr.write("ERROR: no SKILL.md files found.\n")
        return 1

    warnings = validate(records)
    rows = to_rows(records)

    print()
    if warnings:
        print(f"Validation warnings ({len(warnings)}):")
        for w in warnings:
            print(f"  WARN  {w}")
    else:
        print("Validation: no warnings.")

    print()
    if args.dry_run:
        print(f"DRY-RUN: would write {len(rows)} rows to:")
        print(f"  {CSV_PATH.relative_to(REPO_ROOT)}")
        print(f"  {JSON_PATH.relative_to(REPO_ROOT)}")
        files_written = 0
    else:
        write_csv(rows, CSV_PATH)
        write_json(rows, JSON_PATH)
        print(f"Wrote {CSV_PATH.relative_to(REPO_ROOT)}")
        print(f"Wrote {JSON_PATH.relative_to(REPO_ROOT)}")
        files_written = 2

    print()
    print("Summary:")
    print(f"  skills found:        {len(rows)}")
    print(f"  validation warnings: {len(warnings)}")
    print(f"  files written:       {files_written}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
