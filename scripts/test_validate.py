#!/usr/bin/env python3
"""
test_validate.py — regression tests for `scripts/validate.py`.

Stdlib-only (matches the ethos of `validate.py` + `build-registry.py`). Run with:

    python3 -m unittest scripts.test_validate
    # or directly:
    python3 scripts/test_validate.py

Coverage:

  * SoD negative fixtures (rules 7–12) — every fixture under
    `scripts/test_fixtures/sod-negatives/` must reject with the substring
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
FIXTURES = REPO_ROOT / "scripts" / "test_fixtures" / "sod-negatives"
FRAMEWORK_LAYER_FIXTURES = REPO_ROOT / "scripts" / "test_fixtures" / "framework-layer-negatives"


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

    def test_rule6a_unknown_qe_repo(self) -> None:
        """Rule 6a — `[project.testing].qe_repo` must resolve to `[[project.repos]].code`."""
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "unknown-qe-repo.toml")],
            must_contain=["project.testing", "qe_repo", "unknown repo", "not declared"],
        )

    def test_rule6b_bad_re_verification_gate(self) -> None:
        """Rule 6b — `re_verification_gate` must be ask | review | automated.

        Rejection matters more than it looks: a silent fallback to "ask" would make an
        unattended run fail fast while the operator believed it was self-closing, and a
        fallback the other way would imply human sign-off that never happened.
        """
        self._expect_reject(
            ["--project-toml", str(FIXTURES / "bad-re-verification-gate.toml")],
            must_contain=["re_verification_gate", "auto", "ask", "review", "automated"],
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

    def test_qe_repo_known_repo_passes(self) -> None:
        """Rule 6a passes when `[project.testing].qe_repo` names a declared QE repo."""
        p = self._write_toml("""
            [project]
            code = "qe-ok"
            [project.testing]
            qe_repo = "qe-automation"

            [[project.repos]]
            code = "app"
            path = "."
            role = "api"

            [[project.repos]]
            code = "qe-automation"
            path = "{project-root}/../qe-automation"
            role = "test-automation"
        """)
        self._expect_accept(["--project-toml", str(p)])

    def test_re_verification_gate_each_enum_value_passes(self) -> None:
        """Rule 6b accepts every documented value, and an absent key stays legal."""
        for value in ("ask", "review", "automated"):
            with self.subTest(value=value):
                p = self._write_toml(f"""
                    [project]
                    code = "re-gate-ok"
                    [project.elicitation]
                    re_verification_gate = "{value}"
                """)
                self._expect_accept(["--project-toml", str(p)])

        p = self._write_toml("""
            [project]
            code = "re-gate-absent"
            [project.elicitation]
            team_size = "10-25"
        """)
        self._expect_accept(["--project-toml", str(p)])


class TestRECloseOutGate(unittest.TestCase):
    """Check L — every reverse-engineer-* skill binds the close-out gate.

    These assert against the live tree rather than a fixture: the invariant is about
    the shipped skills, and a fixture copy would drift from them silently.
    """

    RE_DIR = REPO_ROOT / ".agents" / "skills" / "reverse-engineering"
    PATTERN = "references/elicitation-patterns/re-verification-gate-selection.md"

    def _re_skills(self) -> list[Path]:
        return sorted(
            p for p in self.RE_DIR.glob("reverse-engineer-*/SKILL.md") if p.is_file()
        )

    def test_default_run_reports_check_l(self) -> None:
        proc = run_validate()
        self.assertEqual(proc.returncode, 0, msg=proc.stdout + proc.stderr)
        self.assertIn("Check L — RE close-out gate binding", proc.stdout)

    def test_routing_pattern_exists(self) -> None:
        self.assertTrue((REPO_ROOT / self.PATTERN).is_file(), f"missing {self.PATTERN}")

    def test_every_re_skill_cites_pattern_and_review_skill(self) -> None:
        skills = self._re_skills()
        self.assertEqual(len(skills), 11, msg=f"expected 11 RE skills, found {len(skills)}")
        for skill in skills:
            text = skill.read_text(encoding="utf-8")
            with self.subTest(skill=skill.parent.name):
                self.assertIn(self.PATTERN, text)
                self.assertIn("review-reverse-engineering-package", text)

    def test_every_verify_step_declares_both_modes_and_tiers(self) -> None:
        for skill in self._re_skills():
            verify = skill.parent / "steps" / "verify.md"
            with self.subTest(skill=skill.parent.name):
                self.assertTrue(verify.is_file(), f"missing {verify}")
                text = verify.read_text(encoding="utf-8")
                self.assertIn("`automated`", text)
                self.assertIn("`review-evidence`", text)
                self.assertIn("Tier M", text)
                self.assertIn("Tier J", text)
                self.assertIn("UNVERIFIED", text)


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
        for label in ("Check A", "Check B", "Check D", "Check E", "Check F", "Check M"):
            self.assertIn(label, out, f"missing '{label}' in default-mode output")
        # And it should NOT mention Check I — that only fires in SoD-fixture mode.
        self.assertNotIn(
            "Check I", out,
            "default-mode output should not run Check I (SoD fixture mode)",
        )


class TestPathsTokenResolution(unittest.TestCase):
    """Check M — `{paths.<key>}` / `{project.paths.<key>}` token resolution.

    No fixture-mode flag exists for M (unlike I/K), so these write an
    ephemeral composition directly into the live `templates/compositions/`
    tree — the same tree `validate.py`'s hardcoded COMPOSITIONS_ROOT scans —
    and remove it in a `finally` block regardless of assertion outcome.
    """

    FIXTURE_PATH = REPO_ROOT / "templates" / "compositions" / "_check-m-test-fixture.yaml"

    def _write_fixture(self, token: str) -> None:
        self.FIXTURE_PATH.write_text(
            textwrap.dedent(
                f"""\
                name: check-m-test-fixture
                description: Ephemeral fixture for test_validate.py Check M test. Deleted immediately after the assertion.
                applies-to-flow: any
                package-type: test-fixture

                default-output-path: "{token}/{{feature-id}}-test.md"
                """
            ),
            encoding="utf-8",
        )

    def test_reject_phantom_token(self) -> None:
        """A `{paths.requirements_path}` reference (no such key declared) must be rejected."""
        self._write_fixture("{paths.requirements_path}")
        try:
            proc = run_validate()
        finally:
            self.FIXTURE_PATH.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"validator should reject a phantom {{paths.requirements_path}} reference.\noutput:\n{out}",
        )
        self.assertIn("Check M", out)
        self.assertIn("requirements_path", out)

    def test_accept_declared_key(self) -> None:
        """A `{paths.requirements_package}` reference (a real, declared key) must pass."""
        self._write_fixture("{paths.requirements_package}")
        try:
            proc = run_validate()
        finally:
            self.FIXTURE_PATH.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"validator should accept a declared [project.paths] key.\noutput:\n{out}",
        )

    def test_accept_project_paths_prefix_form(self) -> None:
        """The `{project.paths.<key>}` synonym form must resolve identically."""
        self._write_fixture("{project.paths.quality_package}")
        try:
            proc = run_validate()
        finally:
            self.FIXTURE_PATH.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"validator should accept the {{project.paths.<key>}} synonym form.\noutput:\n{out}",
        )


class TestFrameworkLayerGuardrail(unittest.TestCase):
    """Check K — `[tools.*]` is a project-layer concern; framework.* must not declare it."""

    def test_reject_tools_in_framework_layer(self) -> None:
        """A framework-layer config declaring [tools.*] must be rejected."""
        proc = run_validate(
            "--framework-toml",
            str(FRAMEWORK_LAYER_FIXTURES / "tools-in-framework.toml"),
        )
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"validator should reject [tools.*] in a framework layer but exited 0.\noutput:\n{out}",
        )
        for needle in ("tools", "project-layer"):
            self.assertIn(needle, out, f"output missing '{needle}'.\noutput:\n{out}")

    def test_accept_clean_framework_layer(self) -> None:
        """A framework-layer config with no [tools.*] must pass."""
        proc = run_validate("--framework-toml", str(REPO_ROOT / "config" / "framework.toml.example"))
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"validator should accept a clean framework layer but exited {proc.returncode}.\noutput:\n{out}",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
