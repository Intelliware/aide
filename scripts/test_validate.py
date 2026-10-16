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

Requires Python 3.11+: the SoD and feature-registry tests drive
`validate.py`'s `tomllib`-based fixture modes. The suite exits early with a
clear message on older interpreters rather than reporting dozens of
misleading failures.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

if sys.version_info < (3, 11):
    sys.exit(
        "test_validate.py requires Python 3.11+ (validate.py's fixture modes use "
        f"tomllib); found {sys.version.split()[0]}."
    )

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


class TestHookRuntimeBinding(unittest.TestCase):
    """Check O — every SKILL.md binds to the hook-runtime execution contract.

    Unlike Check J's enumerated 3-skill allowlist, Check O is unscoped — any
    skill can be a hook target (config/SCHEMAS.md § 2.5.1, rule 18) — so every
    SKILL.md in the live tree must cite hook-runtime.md. No fixture-mode flag
    exists for O, so the negative case writes an ephemeral skill folder
    directly into the live `.agents/skills/` tree and removes it in `finally`,
    following the same pattern as TestPathsTokenResolution's Check M tests.
    """

    REF = "references/orientation/hook-runtime.md"
    HEADING_RE = re.compile(r"^##\s+Precondition\s+—\s+hooks\b", re.MULTILINE)
    FIXTURE_DIR = REPO_ROOT / ".agents" / "skills" / "meta" / "_check-o-test-fixture"
    FIXTURE_PATH = FIXTURE_DIR / "SKILL.md"

    def test_default_run_reports_check_o(self) -> None:
        proc = run_validate()
        self.assertEqual(proc.returncode, 0, msg=proc.stdout + proc.stderr)
        self.assertIn("Check O — hook-runtime binding (all skills)", proc.stdout)

    def test_hook_runtime_reference_exists(self) -> None:
        self.assertTrue((REPO_ROOT / self.REF).is_file(), f"missing {self.REF}")

    def test_every_skill_cites_hook_runtime(self) -> None:
        skill_files = sorted((REPO_ROOT / ".agents" / "skills").rglob("SKILL.md"))
        self.assertTrue(skill_files, "expected at least one SKILL.md under .agents/skills")
        for skill in skill_files:
            text = skill.read_text(encoding="utf-8")
            with self.subTest(skill=skill.relative_to(REPO_ROOT)):
                self.assertIn(self.REF, text)
                self.assertRegex(text, self.HEADING_RE)

    def test_missing_heading_and_reference_reported(self) -> None:
        self.FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
        self.FIXTURE_PATH.write_text(
            textwrap.dedent(
                """\
                ---
                name: _check-o-test-fixture
                description: "Ephemeral fixture for test_validate.py Check O test. Deleted immediately after the assertion."
                ---

                # Check O Test Fixture

                ## Overview

                Ephemeral fixture skill used only to test Check O's negative case. Not a real skill.

                ## Workflow

                1. No-op.

                ## Next skill

                (none)
                """
            ),
            encoding="utf-8",
        )
        try:
            proc = run_validate()
        finally:
            self.FIXTURE_PATH.unlink()
            self.FIXTURE_DIR.rmdir()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"validator should reject a SKILL.md missing the hook precondition.\noutput:\n{out}",
        )
        rel = str(self.FIXTURE_PATH.relative_to(REPO_ROOT))
        self.assertIn(f"{rel}: missing top-level", out)
        self.assertIn(f"{rel}: does not reference", out)


class TestInputsFlagParity(unittest.TestCase):
    """Check P — every `--flag` in a SKILL.md `## Inputs` table also appears in
    the skill's `references/INPUTS-OUTPUTS.md` `## Inputs` table.

    No fixture-mode flag exists for P, so the negative case writes an
    ephemeral skill folder directly into the live `.agents/skills/` tree and
    removes it in `finally`, following the same pattern as
    TestHookRuntimeBinding's Check O test.
    """

    FIXTURE_DIR = REPO_ROOT / ".agents" / "skills" / "meta" / "_check-p-test-fixture"
    FIXTURE_PATH = FIXTURE_DIR / "SKILL.md"
    FIXTURE_IO = FIXTURE_DIR / "references" / "INPUTS-OUTPUTS.md"

    def test_default_run_reports_check_p(self) -> None:
        proc = run_validate()
        self.assertEqual(proc.returncode, 0, msg=proc.stdout + proc.stderr)
        self.assertIn("Check P — Inputs flag parity (SKILL.md / INPUTS-OUTPUTS.md)", proc.stdout)

    def test_flag_missing_from_reference_reported(self) -> None:
        self.FIXTURE_IO.parent.mkdir(parents=True, exist_ok=True)
        self.FIXTURE_PATH.write_text(
            textwrap.dedent(
                """\
                ---
                name: _check-p-test-fixture
                description: "Ephemeral fixture for test_validate.py Check P test. Deleted immediately after the assertion."
                ---

                # Check P Test Fixture

                ## Inputs

                | Input | Source | Required |
                |---|---|---|
                | `--documented` | Caller | No |
                | `--undocumented` | Caller | No |

                ## Precondition — hooks

                See `references/orientation/hook-runtime.md`.

                ## Next skill

                (none)
                """
            ),
            encoding="utf-8",
        )
        self.FIXTURE_IO.write_text(
            textwrap.dedent(
                """\
                # Check P Test Fixture — Inputs & Outputs

                ## Inputs

                | Input | Type | Required |
                |---|---|---|
                | `--documented` | bool | No |
                | `--reference-only` | bool | No |
                """
            ),
            encoding="utf-8",
        )
        try:
            proc = run_validate()
        finally:
            self.FIXTURE_IO.unlink()
            self.FIXTURE_IO.parent.rmdir()
            self.FIXTURE_PATH.unlink()
            self.FIXTURE_DIR.rmdir()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"validator should reject a SKILL.md flag missing from INPUTS-OUTPUTS.md.\noutput:\n{out}",
        )
        rel = str(self.FIXTURE_PATH.relative_to(REPO_ROOT))
        self.assertIn(f"{rel}: Inputs flag `--undocumented` is missing", out)
        # SKILL.md may list a subset — a reference-only flag is not an error.
        self.assertNotIn("`--reference-only`", out)
        self.assertNotIn("`--documented` is missing", out)


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

    The fixture carries a `{feature-id}/` segment because Check N1 scans the
    same tree: a fixture rooted at a feature-scoped key without one is a real
    N1 violation, and the positive cases here must isolate M rather than trip
    a second check.
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

                default-output-path: "{token}/{{feature-id}}/{{feature-id}}-test.md"
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


class TestFeatureSegmentGuardrail(unittest.TestCase):
    """Check N1 — feature-segment presence and retired-placeholder guardrail.

    Like Check M, N1 has no fixture-mode flag: it asserts the framework's own
    consistency, so the fixtures are written into the live trees it scans and
    removed in `finally`.
    """

    COMPOSITION = REPO_ROOT / "templates" / "compositions" / "_check-n1-test-fixture.yaml"
    # Inside TEMPLATES_ROOT (which N1 walks) but outside blocks/ — a .md under
    # blocks/ is additionally subject to Check E's frontmatter rules and Check
    # A's orphan scan, which would mask the N1 result these cases isolate.
    SKILL_DOC = REPO_ROOT / "templates" / "_check-n1-test-fixture.md"

    def _write_composition(self, out_path: str) -> None:
        self.COMPOSITION.write_text(
            textwrap.dedent(
                f"""\
                name: check-n1-test-fixture
                description: Ephemeral fixture for test_validate.py Check N1 test. Deleted immediately after the assertion.
                applies-to-flow: any
                package-type: test-fixture

                default-output-path: "{out_path}"
                """
            ),
            encoding="utf-8",
        )

    def test_reject_feature_scoped_composition_without_segment(self) -> None:
        """A per-feature stage path with no `{feature-id}/` segment must be rejected."""
        self._write_composition("{paths.design_package}/{feature-id}-design.md")
        try:
            proc = run_validate()
        finally:
            self.COMPOSITION.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1 should reject a feature-scoped path with no segment.\noutput:\n{out}",
        )
        self.assertIn("Check N1", out)
        self.assertIn("carries no", out)

    def test_accept_feature_scoped_composition_with_segment(self) -> None:
        """The same path with the segment present must pass."""
        self._write_composition("{paths.design_package}/{feature-id}/{feature-id}-design.md")
        try:
            proc = run_validate()
        finally:
            self.COMPOSITION.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1 should accept a feature-scoped path carrying the segment.\noutput:\n{out}",
        )

    def test_accept_non_feature_scoped_composition_without_segment(self) -> None:
        """A KB path is keyed by repo-slug, not feature — it must not be required to carry the segment."""
        self._write_composition("{paths.knowledge_base_path}/source-docs/{repo-slug}/api-consumer/")
        try:
            proc = run_validate()
        finally:
            self.COMPOSITION.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1 must not require a feature segment on a non-feature-scoped path.\noutput:\n{out}",
        )

    def _write_skill_doc(self, body: str) -> None:
        self.SKILL_DOC.write_text(
            f"# Ephemeral fixture for test_validate.py Check N1\n\n{body}\n",
            encoding="utf-8",
        )

    def test_reject_retired_placeholder_under_docs(self) -> None:
        """`docs/<feature>/` was retired in favour of `<feature-id>`."""
        self._write_skill_doc("Write the section to `docs/<feature>/requirements-package/`.")
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1 should reject `docs/<feature>/`.\noutput:\n{out}",
        )
        self.assertIn("retired placeholder", out)

    def test_reject_retired_placeholder_under_path_token(self) -> None:
        """The same spelling is equally wrong in an assembled path."""
        self._write_skill_doc("Assemble to `{paths.quality_package}/<feature-folder>/x.md`.")
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1 should reject `<feature-folder>` under a path token.\noutput:\n{out}",
        )
        self.assertIn("retired placeholder", out)

    def test_accept_stage_feature_directory(self) -> None:
        """`{paths.<stage>_package}/<feature-id>/` is where working files live."""
        self._write_skill_doc(
            "Write the section to `{paths.requirements_package}/<feature-id>/requirements/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1 should accept the stage feature directory.\noutput:\n{out}",
        )

    def test_n1d_reject_docs_feature_id_working_tree(self) -> None:
        """N1d — `docs/<feature-id>/` was the opted-in working tree until 2.7.0.

        It resolved under `{project-root}` whatever `[project.paths]` said, so
        a feature's working files and its assembled artifact landed in two
        different trees — possibly two different repositories.
        """
        self._write_skill_doc("Write the section to `docs/<feature-id>/requirements-package/`.")
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1d should reject `docs/<feature-id>/`.\noutput:\n{out}",
        )
        self.assertIn("roots a feature working tree", out)

    def test_n1d_exempts_fenced_migration_guidance(self) -> None:
        """Migration guidance must be able to show the layout it retires."""
        self._write_skill_doc(
            "Move the directory:\n\n```\ndocs/<feature-id>/requirements-package/\n```\n\n"
            "into `{paths.requirements_package}/<feature-id>/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1d should exempt a fenced `docs/<feature-id>/`.\noutput:\n{out}",
        )

    def test_n1d_reject_unknown_package_directory(self) -> None:
        """N1d — `design-package/` is a package directory in neither layout.

        The not-opted-in design tree is `solutions-package/`; a path naming
        `design-package/` sends a reader to a directory no skill writes.
        """
        self._write_skill_doc("Verify the package at `docs/checkout/design-package/`.")
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1d should reject `docs/checkout/design-package/`.\noutput:\n{out}",
        )
        self.assertIn("not a package directory in either layout", out)

    def test_n1d_exempts_fenced_unknown_package_directory(self) -> None:
        """A fenced example may still show the directory name it replaces."""
        self._write_skill_doc(
            "Rename it:\n\n```\ndocs/checkout/design-package/\n```\n\n"
            "to `docs/checkout/solutions-package/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1d should exempt a fenced `docs/checkout/design-package/`.\noutput:\n{out}",
        )

    def test_accept_feature_placeholder_outside_artifact_paths(self) -> None:
        """`<feature>` stays legal in prose, scope IDs, and documented source trees.

        The five `src/domain/<feature>/` rows in the RE blocks describe the
        *documented application's* layout, not ours; flagging those would make
        the check unusable and is why it keys on the parent rather than the
        placeholder alone.
        """
        self._write_skill_doc(
            'Ask "List the next behavior for <feature>." Scope IDs use '
            "`<feature>:<sub-scope>`. Entities live in `src/domain/<feature>/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1 must not flag `<feature>` outside A.I.D.E. artifact paths.\noutput:\n{out}",
        )

    def test_accept_retired_placeholder_inside_fenced_block(self) -> None:
        """Migration guidance must be able to quote the spelling it retires.

        Mirrors Check M, which has exempted fenced content since it shipped.
        Without this, the doc debt the 2.4.0 entry still owes cannot be written:
        showing the old layout beside the new one is the whole point of it.
        """
        self._write_skill_doc(
            "Rename the directory:\n\n```\ndocs/<feature>/requirements-package/\n```\n\n"
            "becomes `{paths.requirements_package}/<feature-id>/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1 should exempt a retired spelling inside a fenced block.\noutput:\n{out}",
        )

    def test_reject_retired_placeholder_after_a_fence_closes(self) -> None:
        """The exemption is positional, not file-wide — a fence earlier in the
        file must not buy amnesty for prose below it."""
        self._write_skill_doc(
            "```\ndocs/<feature-id>/ok/\n```\n\nThen write to `docs/<feature-name>/x/`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1 must still flag a retired spelling after a fence closes.\noutput:\n{out}",
        )
        self.assertIn("retired placeholder", out)

    def test_n1c_reject_sod_path_with_no_feature_directory(self) -> None:
        """N1c — the defect N1a could not see, in the file type that resolves it.

        This exact string shipped green in `review-design-package/SKILL.md`
        while the character-identical string in a composition was rejected by
        N1a. Note it is rooted at no `{paths.*}` token, which is why N1c keys on
        the filename rather than the root.
        """
        self._write_skill_doc("Single-repo: under `<repo-code>/<feature-id>-design.md`.")
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertNotEqual(
            proc.returncode, 0,
            f"N1c should reject a per-feature artifact with no enclosing directory.\noutput:\n{out}",
        )
        self.assertIn("names a per-feature artifact", out)

    def test_n1c_accept_sod_path_once_the_directory_is_present(self) -> None:
        """The same path passes once the feature directory encloses the artifact."""
        self._write_skill_doc(
            "Single-repo: under `<repo-code>/<feature-id>/<feature-id>-design.md`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1c should accept a path carrying the feature directory.\noutput:\n{out}",
        )

    def test_n1c_accepts_an_ancestor_feature_directory_not_only_a_parent(self) -> None:
        """The assertion is containment, not adjacency.

        The working tree nests a package subdirectory between the feature
        directory and the file, so requiring the *immediate* parent to be
        `<feature-id>/` would reject three correct quick-dev paths.
        """
        self._write_skill_doc(
            "Write to `{paths.design_package}/<feature-id>/design/<feature-id>-design-notes.md`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1c must accept the feature directory as an ancestor.\noutput:\n{out}",
        )

    def test_n1c_ignores_a_bare_filename_with_no_path(self) -> None:
        """A filename that claims no location is not a routing defect.

        Report templates display the artifact's name, and prose discusses the
        `<feature-id>-` prefix itself. Requiring a parent segment is what keeps
        those out of scope.
        """
        self._write_skill_doc(
            "Report line: `Quality package: <feature-id>-quality.md @ <version>`. "
            "Filenames keep the `<feature-id>-` prefix."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1c must not flag a bare filename outside a path.\noutput:\n{out}",
        )

    def test_n1c_exempts_a_fenced_block(self) -> None:
        """Migration guidance has to be able to show the pre-segment layout."""
        self._write_skill_doc(
            "Before:\n\n```\n<repo-code>/<feature-id>-design.md\n```\n\n"
            "After: `<repo-code>/<feature-id>/<feature-id>-design.md`."
        )
        try:
            proc = run_validate()
        finally:
            self.SKILL_DOC.unlink()
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"N1c should exempt a fenced block, as N1b and M do.\noutput:\n{out}",
        )


class TestFeatureRegistry(unittest.TestCase):
    """Check N2 — feature registry validation (`--features-toml` fixture mode)."""

    def _write(self, tmp: Path, name: str, body: str) -> Path:
        path = tmp / name
        path.write_text(textwrap.dedent(body), encoding="utf-8")
        return path

    def test_committed_example_is_valid(self) -> None:
        """The shipped example must satisfy its own schema, paired with project.toml.example."""
        proc = run_validate(
            "--features-toml", "config/features.toml.example",
            "--project-toml", "config/project.toml.example",
        )
        out = proc.stdout + proc.stderr
        self.assertEqual(
            proc.returncode, 0,
            f"config/features.toml.example should validate cleanly.\noutput:\n{out}",
        )

    def test_reject_malformed_id(self) -> None:
        """The ID is used verbatim as a directory name, so every non-slug shape is rejected."""
        for bad in (
            "Alert-Customer",   # uppercase
            "alert_customer",   # underscore
            "-alert",           # leading hyphen
            "alert-",           # trailing hyphen
            "alert--customer",  # doubled hyphen
            "alert customer",   # space
        ):
            with self.subTest(bad=bad):
                with tempfile.TemporaryDirectory() as td:
                    tmp = Path(td)
                    f = self._write(
                        tmp, "features.toml", f'[[features]]\nid = "{bad}"\n'
                    )
                    proc = run_validate("--features-toml", str(f))
                out = proc.stdout + proc.stderr
                self.assertNotEqual(proc.returncode, 0, out)
                self.assertIn("not a lowercase kebab slug", out)

    def test_accept_ordinal_prefixed_id_as_an_ordinary_slug(self) -> None:
        """An ordinal-prefixed id is not special-cased — lowercased, it is just a slug.

        Nothing rejects `feat-0001-alert-customer`; it is a legal (if redundant) slug.
        The format rule is about what makes a safe directory name, not about banning a
        convention the framework no longer mints.
        """
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(
                tmp, "features.toml", '[[features]]\nid = "feat-0001-alert-customer"\n'
            )
            proc = run_validate("--features-toml", str(f))
        out = proc.stdout + proc.stderr
        self.assertEqual(proc.returncode, 0, out)

    def test_reject_duplicate_id(self) -> None:
        """Two features cannot share a directory."""
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(
                tmp, "features.toml",
                '[[features]]\nid = "refunds"\n\n[[features]]\nid = "refunds"\n',
            )
            proc = run_validate("--features-toml", str(f))
        out = proc.stdout + proc.stderr
        self.assertNotEqual(proc.returncode, 0, out)
        self.assertIn("duplicate", out)

    def test_skipped_sub_rules_are_reported(self) -> None:
        """A partial run must announce what it could not check, not pass silently."""
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(tmp, "features.toml", '[[features]]\nid = "real-feature"\n')
            proc = run_validate("--features-toml", str(f))
        out = proc.stdout + proc.stderr
        self.assertEqual(proc.returncode, 0, out)
        self.assertIn("`repos` cross-reference skipped", out)
        self.assertIn("`active_feature` resolution skipped", out)

    def test_reject_stale_active_feature(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(tmp, "features.toml", '[[features]]\nid = "real-feature"\n')
            u = self._write(tmp, "project.user.toml", '[user]\nactive_feature = "nope-not-registered"\n')
            proc = run_validate("--features-toml", str(f), "--project-user-toml", str(u))
        out = proc.stdout + proc.stderr
        self.assertNotEqual(proc.returncode, 0, out)
        self.assertIn("resolves to no", out)

    def test_reject_unknown_repo_code(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(
                tmp, "features.toml",
                '[[features]]\nid = "real-feature"\nrepos = ["ghost-repo"]\n',
            )
            p = self._write(
                tmp, "project.toml",
                '[[project.repos]]\ncode = "api-billing"\n',
            )
            proc = run_validate("--features-toml", str(f), "--project-toml", str(p))
        out = proc.stdout + proc.stderr
        self.assertNotEqual(proc.returncode, 0, out)
        self.assertIn("matches no [[project.repos]].code", out)

    def test_accept_valid_registry_with_both_companions(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(
                tmp, "features.toml",
                '[[features]]\nid = "alert-customer"\nrepos = ["api-billing"]\n'
                '\n[[features]]\nid = "refund-fee-waiver"\n',
            )
            p = self._write(tmp, "project.toml", '[[project.repos]]\ncode = "api-billing"\n')
            u = self._write(
                tmp, "project.user.toml",
                '[user]\nactive_feature = "refund-fee-waiver"\n',
            )
            proc = run_validate(
                "--features-toml", str(f), "--project-toml", str(p), "--project-user-toml", str(u),
            )
        out = proc.stdout + proc.stderr
        self.assertEqual(proc.returncode, 0, f"valid registry should pass.\noutput:\n{out}")

    def test_empty_registry_is_legal(self) -> None:
        """An empty-but-present file means 'opted in, no features yet' (SCHEMAS § 2.8.3)."""
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = self._write(tmp, "features.toml", "# opted in, nothing minted yet\n")
            proc = run_validate("--features-toml", str(f))
        out = proc.stdout + proc.stderr
        self.assertEqual(proc.returncode, 0, f"empty registry should pass.\noutput:\n{out}")
        self.assertIn("no features yet", out)

    def test_missing_file_exits_nonzero(self) -> None:
        proc = run_validate("--features-toml", "/nonexistent/features.toml")
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("file not found", proc.stdout + proc.stderr)

    def test_malformed_toml_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            f = self._write(Path(td), "features.toml", "[[features]\nid = broken\n")
            proc = run_validate("--features-toml", str(f))
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("malformed TOML", proc.stdout + proc.stderr)


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
