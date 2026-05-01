#!/usr/bin/env python3
"""
test_validate.py — regression tests for `scripts/validate.py`.

Stdlib-only (matches the ethos of `validate.py` + `build-registry.py`). Run with:

    python3 -m unittest scripts.test_validate
    # or directly:
    python3 scripts/test_validate.py

Coverage:

  * SoD negative fixtures (rules 7–12) — every fixture under
    `_docs/test-fixtures/sod-negatives/` must reject with the substring
    contract documented in `_docs/skills-test-plan.md` § A.7.
  * SoD positive cases — a clean `project.toml`, a partial config in legacy
    mode, and a fully consistent SoD config all pass.
  * SoD edge cases — malformed TOML, missing fixture file, optional
    `--cross-cutting-artifact` pointing at nothing.
  * Default-mode regression — invoking `validate.py` with no `--project-toml`
    still runs the regular A–H checks against the live tree and exits 0.

Tests invoke `validate.py` via subprocess (E2E through the CLI surface)
rather than importing internals — that matches how A.7 exercises the
script, and keeps the test boundary at the documented contract.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VALIDATE = REPO_ROOT / "scripts" / "validate.py"
FIXTURES = REPO_ROOT / "_docs" / "test-fixtures" / "sod-negatives"


def run_validate(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess:
    """Invoke `python3 scripts/validate.py <args>` and return the completed process."""
    return subprocess.run(
        [sys.executable, str(VALIDATE), *args],
        cwd=str(cwd or REPO_ROOT),
        capture_output=True,
        text=True,
        timeout=60,
    )


class TestSoDNegativeFixtures(unittest.TestCase):
    """Each fixture must reject with the substring contract from skills-test-plan.md § A.7."""

    def _expect_reject(self, args: list[str], *, must_contain: list[str], must_match: list[str] | None = None) -> None:
        proc = run_validate(*args)
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"validator should reject but exited 0.\nargs={args}\noutput:\n{out}",
        )
        for needle in must_contain:
            self.assertIn(
                needle, out,
                f"output missing required substring '{needle}'.\noutput:\n{out}",
            )
        for pattern in (must_match or []):
            self.assertRegex(
                out, pattern,
                f"output missing required pattern '{pattern}'.\noutput:\n{out}",
            )

    def test_rule7_both_modes_set(self) -> None:
        """Rule 7 — `dir` and `colocate_with_source` are mutually exclusive."""
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "both-modes-set.toml")],
            must_contain=["mutually exclusive"],
        )

    def test_rule9_unknown_write_role(self) -> None:
        """Rule 9 — `write_role` outside the SOD_ROLE_ENUM is rejected."""
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "unknown-write-role.toml")],
            must_contain=["unknown role", "enum"],
        )

    def test_rule9b_role_mismatch(self) -> None:
        """Rule 9b — `[user].role` must satisfy the active stage's `write_role`."""
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "role-mismatch.toml")],
            must_contain=["role mismatch", "permission"],
        )

    def test_rule11_absolute_artifact_subdir(self) -> None:
        """Rule 11 — `[project].artifact_subdir` must be a bare relative path."""
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "absolute-artifact-subdir.toml")],
            must_contain=["must be relative", "bare path"],
        )

    def test_rule12_cross_cutting_empty_affects(self) -> None:
        """Rule 12 — cross-cutting artifact `affects_repos` must list ≥ 1 repo."""
        self._expect_reject(
            [
                "--project-toml", str(FIXTURES / "cross-cutting-empty-affects.toml"),
                "--cross-cutting-artifact", str(FIXTURES / "cross-cutting-empty-affects.md"),
            ],
            must_contain=["affects_repos", "empty"],
            # Plan also accepts "≥ 1" — we emit the literal phrase.
            must_match=[r"≥\s*1"],
        )

    def test_rule12_cross_cutting_unknown_repo(self) -> None:
        """Rule 12 — every `affects_repos` code must resolve to a declared repo."""
        self._expect_reject(
            [
                "--project-toml", str(FIXTURES / "cross-cutting-unknown-repo.toml"),
                "--cross-cutting-artifact", str(FIXTURES / "cross-cutting-unknown-repo.md"),
            ],
            must_contain=["unknown repo", "not declared"],
        )


class TestSoDPositive(unittest.TestCase):
    """Clean SoD configs and legacy-mode configs must pass."""

    def _write_toml(self, body: str) -> Path:
        d = Path(tempfile.mkdtemp(prefix="sod-positive-"))
        p = d / "project.toml"
        p.write_text(textwrap.dedent(body).lstrip())
        return p

    def _expect_accept(self, args: list[str]) -> None:
        proc = run_validate(*args)
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"validator should accept but exited {proc.returncode}.\nargs={args}\noutput:\n{out}",
        )

    def test_legacy_mode_passes(self) -> None:
        """No `[stages.<stage>]` declared — legacy mode is fine, no SoD rules fire."""
        p = self._write_toml("""
            [project]
            code = "legacy-ok"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_dir_only_stage_passes(self) -> None:
        """Stage with `dir` and a valid `write_role` passes rules 7/8/9."""
        p = self._write_toml("""
            [project]
            code = "dir-only"
            [stages.requirements]
            dir = "ba-repo"
            write_role = "BA"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_colocate_only_stage_passes(self) -> None:
        """Stage with `colocate_with_source = true` passes rule 7."""
        p = self._write_toml("""
            [project]
            code = "colocate-only"
            [stages.execution]
            colocate_with_source = true
            write_role = "Developer"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_user_role_matches_write_role(self) -> None:
        """Rule 9b passes when `[user].role` equals the active stage's `write_role`."""
        p = self._write_toml("""
            [project]
            code = "role-match"
            [user]
            role = "Architect"
            [stages.design]
            dir = "architect-repo"
            write_role = "Architect"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_artifact_subdir_relative_passes(self) -> None:
        """Rule 11 passes when `[project].artifact_subdir` is a bare relative path."""
        p = self._write_toml("""
            [project]
            code = "rel-subdir"
            artifact_subdir = ".framework-output"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_cross_cutting_with_known_repo_passes(self) -> None:
        """Rule 12 passes when `affects_repos` lists only declared repo codes."""
        d = Path(tempfile.mkdtemp(prefix="sod-cc-positive-"))
        toml = d / "project.toml"
        toml.write_text(textwrap.dedent("""
            [project]
            code = "cc-ok"
            [[project.repos]]
            code = "web"
            path = "{project-root}/../web"
            [[project.repos]]
            code = "api"
            path = "{project-root}/../api"
        """).lstrip())
        artifact = d / "feature.md"
        artifact.write_text(textwrap.dedent("""\
            ---
            title: Cross-cutting feature with all known repos
            affects_repos: [web, api]
            ---
            Body.
        """))
        self._expect_accept([
            "--project-toml", str(toml),
            "--cross-cutting-artifact", str(artifact),
        ])


class TestSoDEdgeCases(unittest.TestCase):
    """Malformed inputs and missing files should fail loudly, not crash silently."""

    def test_missing_project_toml_exits_nonzero(self) -> None:
        proc = run_validate("--project-toml", "/nonexistent/path/project.toml")
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("does not exist", proc.stdout + proc.stderr)

    def test_malformed_toml_exits_nonzero(self) -> None:
        d = Path(tempfile.mkdtemp(prefix="sod-malformed-"))
        p = d / "project.toml"
        # Missing closing bracket — TOML parse error.
        p.write_text("[project\ncode = 'bad'\n")
        proc = run_validate("--project-toml", str(p))
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("TOML parse error", proc.stdout + proc.stderr)

    def test_missing_artifact_when_flag_set(self) -> None:
        d = Path(tempfile.mkdtemp(prefix="sod-noart-"))
        p = d / "project.toml"
        p.write_text("[project]\ncode = 'noart'\n")
        proc = run_validate(
            "--project-toml", str(p),
            "--cross-cutting-artifact", "/nonexistent/path/artifact.md",
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("does not exist", proc.stdout + proc.stderr)


class TestDefaultModeRegression(unittest.TestCase):
    """Default-mode (no --project-toml) must still pass the regular A–H checks."""

    def test_default_mode_exits_zero(self) -> None:
        proc = run_validate()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"default-mode validator regression failed.\noutput:\n{out}",
        )
        # Sanity: the output should mention each labelled check at least once.
        for label in ("Check A", "Check B", "Check D", "Check E", "Check F"):
            self.assertIn(label, out, f"missing '{label}' in default-mode output")
        # And it should NOT mention Check I — that only fires in SoD-fixture mode.
        self.assertNotIn(
            "Check I", out,
            "default-mode output should not run Check I (SoD fixture mode)",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
