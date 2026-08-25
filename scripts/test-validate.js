#!/usr/bin/env node
/**
 * test-validate.js — regression tests for `scripts/validate.js`.
 *
 * Node.js-only (matches the ethos of `validate.js` + `build-registry.js`). Run with:
 *
 *     node scripts/test-validate.js
 *
 * Coverage:
 *
 *   * SoD negative fixtures (rules 7–12) — every fixture under
 *     `scripts/test_fixtures/sod-negatives/` must reject with the substring
 *     contract documented in `_docs/skills-test-plan.md` § A.7.
 *   * SoD positive cases — a clean `project.toml`, a partial config in legacy
 *     mode, and a fully consistent SoD config all pass.
 *   * SoD edge cases — malformed TOML, missing fixture file, optional
 *     `--cross-cutting-artifact` pointing at nothing.
 *   * Default-mode regression — invoking `validate.js` with no `--project-toml`
 *     still runs the regular A–H checks against the live tree and exits 0.
 *
 * Tests invoke `validate.js` via child_process (E2E through the CLI surface)
 * rather than importing internals — that matches how A.7 exercises the
 * script, and keeps the test boundary at the documented contract.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { tmpdir } = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');
const VALIDATE = path.join(REPO_ROOT, 'scripts', 'validate.js');
const FIXTURES = path.join(REPO_ROOT, 'scripts', 'test_fixtures', 'sod-negatives');
const FRAMEWORK_LAYER_FIXTURES = path.join(REPO_ROOT, 'scripts', 'test_fixtures', 'framework-layer-negatives');

let testsPassed = 0;
let testsFailed = 0;

function runValidate(...args) {
  const cwd = REPO_ROOT;
  try {
    const output = execSync(`node "${VALIDATE}" ${args.join(' ')}`, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60000
    });
    return { returncode: 0, stdout: output, stderr: '' };
  } catch (err) {
    return {
      returncode: err.status || 1,
      stdout: err.stdout || '',
      stderr: err.stderr || ''
    };
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new Error(`${message}\nExpected NOT: ${expected}\nActual: ${actual}`);
  }
}

function assertIn(needle, haystack, message) {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}\nExpected to find: "${needle}"\nIn: ${haystack.slice(0, 500)}...`);
  }
}

function assertNotIn(needle, haystack, message) {
  if (haystack.includes(needle)) {
    throw new Error(`${message}\nExpected NOT to find: "${needle}"\nIn: ${haystack.slice(0, 500)}...`);
  }
}

function assertRegex(text, pattern, message) {
  if (!pattern.test(text)) {
    throw new Error(`${message}\nExpected to match: ${pattern}\nIn: ${text.slice(0, 500)}...`);
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    testsFailed++;
  }
}

// --- Test SoD Negative Fixtures ---

function expectReject(args, mustContain, mustMatch = []) {
  const proc = runValidate(...args);
  const out = proc.stdout + proc.stderr;

  assertNotEqual(
    proc.returncode, 0,
    `validator should reject but exited 0.\nargs=${args.join(' ')}\noutput:\n${out}`
  );

  for (const needle of mustContain) {
    assertIn(
      needle, out,
      `output missing required substring '${needle}'.\noutput:\n${out}`
    );
  }

  for (const pattern of mustMatch) {
    assertRegex(
      out, pattern,
      `output missing required pattern '${pattern}'.\noutput:\n${out}`
    );
  }
}

test('Rule 7 — both modes set', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'both-modes-set.toml')],
    ['mutually exclusive']
  );
});

test('Rule 9 — unknown write role', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'unknown-write-role.toml')],
    ['unknown role', 'enum']
  );
});

test('Rule 9b — role mismatch', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'role-mismatch.toml')],
    ['role mismatch', 'permission']
  );
});

test('Rule 11 — absolute artifact subdir', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'absolute-artifact-subdir.toml')],
    ['must be relative', 'bare path']
  );
});

test('Rule 12 — cross-cutting empty affects', () => {
  expectReject(
    [
      '--project-toml', path.join(FIXTURES, 'cross-cutting-empty-affects.toml'),
      '--cross-cutting-artifact', path.join(FIXTURES, 'cross-cutting-empty-affects.md')
    ],
    ['affects_repos', 'empty'],
    [/≥\s*1/]
  );
});

test('Rule 12 — cross-cutting unknown repo', () => {
  expectReject(
    [
      '--project-toml', path.join(FIXTURES, 'cross-cutting-unknown-repo.toml'),
      '--cross-cutting-artifact', path.join(FIXTURES, 'cross-cutting-unknown-repo.md')
    ],
    ['unknown repo', 'not declared']
  );
});

// Rejection matters more than it looks: a silent fallback to "ask" would make an
// unattended run fail fast while the operator believed it was self-closing, and a
// fallback the other way would imply human sign-off that never happened.
test('Rule 6a — qe_repo names no declared repo', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'unknown-qe-repo.toml')],
    ['project.testing', 'qe_repo', 'unknown repo', 'not declared']
  );
});

test('Rule 6b — re_verification_gate out of enum', () => {
  expectReject(
    ['--project-toml', path.join(FIXTURES, 'bad-re-verification-gate.toml')],
    ['re_verification_gate', 'auto', 'ask', 'review', 'automated']
  );
});

// --- Test SoD Positive ---

function createTempToml(body) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'sod-positive-'));
  const filePath = path.join(dir, 'project.toml');
  fs.writeFileSync(filePath, body.trim().replace(/^\n/, '') + '\n', 'utf-8');
  return filePath;
}

function expectAccept(args) {
  const proc = runValidate(...args);
  const out = proc.stdout + proc.stderr;
  assertEqual(
    proc.returncode, 0,
    `validator should accept but exited ${proc.returncode}.\nargs=${args.join(' ')}\noutput:\n${out}`
  );
}

test('Legacy mode passes', () => {
  const p = createTempToml(`
[project]
code = "legacy-ok"
  `);
  expectAccept(['--project-toml', p]);
});

test('Dir-only stage passes', () => {
  const p = createTempToml(`
[project]
code = "dir-only"

[stages.requirements]
dir = "ba-repo"
write_role = "BA"
  `);
  expectAccept(['--project-toml', p]);
});

test('Colocate-only stage passes', () => {
  const p = createTempToml(`
[project]
code = "colocate-only"

[stages.execution]
colocate_with_source = true
write_role = "Developer"
  `);
  expectAccept(['--project-toml', p]);
});

test('User role matches write role', () => {
  const p = createTempToml(`
[project]
code = "role-match"

[user]
role = "Architect"

[stages.design]
dir = "architect-repo"
write_role = "Architect"
  `);
  expectAccept(['--project-toml', p]);
});

test('Artifact subdir relative passes', () => {
  const p = createTempToml(`
[project]
code = "rel-subdir"
artifact_subdir = ".framework-output"
  `);
  expectAccept(['--project-toml', p]);
});

test('Cross-cutting with known repo passes', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'sod-cc-positive-'));
  const toml = path.join(dir, 'project.toml');
  fs.writeFileSync(toml, `
[project]
code = "cc-ok"

[[project.repos]]
code = "web"
path = "{project-root}/../web"

[[project.repos]]
code = "api"
path = "{project-root}/../api"
  `.trim() + '\n', 'utf-8');

  const artifact = path.join(dir, 'feature.md');
  fs.writeFileSync(artifact, `---
title: Cross-cutting feature with all known repos
affects_repos: [web, api]
---
Body.
`, 'utf-8');

  expectAccept([
    '--project-toml', toml,
    '--cross-cutting-artifact', artifact
  ]);
});

test('QE repo naming a declared test-automation repo passes', () => {
  const p = createTempToml(`
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
  `);
  expectAccept(['--project-toml', p]);
});

test('RE verification gate accepts every enum value, and an absent key stays legal', () => {
  for (const value of ['ask', 'review', 'automated']) {
    const p = createTempToml(`
[project]
code = "re-gate-ok"

[project.elicitation]
re_verification_gate = "${value}"
    `);
    expectAccept(['--project-toml', p]);
  }

  const absent = createTempToml(`
[project]
code = "re-gate-absent"

[project.elicitation]
team_size = "10-25"
  `);
  expectAccept(['--project-toml', absent]);
});

// --- Test SoD Edge Cases ---

test('Missing project.toml exits nonzero', () => {
  const proc = runValidate('--project-toml', '/nonexistent/path/project.toml');
  assertNotEqual(proc.returncode, 0, 'Should exit with error for missing file');
  assertIn('does not exist', proc.stdout + proc.stderr, 'Should mention file does not exist');
});

test('Malformed TOML exits nonzero', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'sod-malformed-'));
  const p = path.join(dir, 'project.toml');
  // Missing closing bracket — TOML parse error
  fs.writeFileSync(p, "[project\ncode = 'bad'\n", 'utf-8');
  const proc = runValidate('--project-toml', p);
  assertNotEqual(proc.returncode, 0, 'Should exit with error for malformed TOML');
  assertIn('TOML parse error', proc.stdout + proc.stderr, 'Should mention TOML parse error');
});

test('Missing artifact when flag set', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'sod-noart-'));
  const p = path.join(dir, 'project.toml');
  fs.writeFileSync(p, "[project]\ncode = 'noart'\n", 'utf-8');
  const proc = runValidate(
    '--project-toml', p,
    '--cross-cutting-artifact', '/nonexistent/path/artifact.md'
  );
  assertNotEqual(proc.returncode, 0, 'Should exit with error for missing artifact');
  assertIn('does not exist', proc.stdout + proc.stderr, 'Should mention artifact does not exist');
});

// --- Test Default Mode Regression ---

test('Default mode exits zero', () => {
  const proc = runValidate();
  const out = proc.stdout + proc.stderr;

  assertEqual(
    proc.returncode, 0,
    `default-mode validator regression failed.\noutput:\n${out}`
  );

  // Sanity: the output should mention each labelled check at least once
  for (const label of ['Check A', 'Check B', 'Check D', 'Check E', 'Check F', 'Check L', 'Check M']) {
    assertIn(label, out, `missing '${label}' in default-mode output`);
  }

  // And it should NOT mention Check I — that only fires in SoD-fixture mode
  assertNotIn(
    'Check I', out,
    'default-mode output should not run Check I (SoD fixture mode)'
  );
});

// --- Check K — framework-layer [tools.*] guardrail ---

test('Check K — reject [tools.*] in a framework layer', () => {
  const proc = runValidate('--framework-toml', path.join(FRAMEWORK_LAYER_FIXTURES, 'tools-in-framework.toml'));
  const out = proc.stdout + proc.stderr;
  assertNotEqual(
    proc.returncode, 0,
    `validator should reject [tools.*] in a framework layer but exited 0.\noutput:\n${out}`
  );
  for (const needle of ['tools', 'project-layer']) {
    assertIn(needle, out, `output missing '${needle}'.\noutput:\n${out}`);
  }
});

test('Check K — accept a clean framework layer', () => {
  expectAccept(['--framework-toml', path.join(REPO_ROOT, 'config', 'framework.toml.example')]);
});

// --- Check L — RE close-out gate binding ---
// Asserted against the live tree, not a fixture: the invariant is about the shipped
// skills, and a fixture copy would drift from them silently.

const RE_DIR = path.join(REPO_ROOT, '.agents', 'skills', 'reverse-engineering');
const RE_GATE_PATTERN_PATH = 'references/elicitation-patterns/re-verification-gate-selection.md';

function reSkillFiles() {
  if (!fs.existsSync(RE_DIR)) return [];
  return fs.readdirSync(RE_DIR)
    .filter(d => d.startsWith('reverse-engineer-'))
    .map(d => path.join(RE_DIR, d, 'SKILL.md'))
    .filter(p => fs.existsSync(p))
    .sort();
}

test('Check L — a default run reports Check L', () => {
  const proc = runValidate();
  assertEqual(proc.returncode, 0, proc.stdout + proc.stderr);
  assertIn(
    'Check L — RE close-out gate binding', proc.stdout,
    `default run should report Check L.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check L — routing pattern exists on disk', () => {
  const abs = path.join(REPO_ROOT, RE_GATE_PATTERN_PATH);
  assert(fs.existsSync(abs), `missing ${RE_GATE_PATTERN_PATH}`);
});

test('Check L — every RE skill cites the pattern and names the review skill', () => {
  const skills = reSkillFiles();
  assertEqual(skills.length, 11, `expected 11 RE skills, found ${skills.length}`);
  for (const skill of skills) {
    const name = path.basename(path.dirname(skill));
    const text = fs.readFileSync(skill, 'utf-8');
    assertIn(RE_GATE_PATTERN_PATH, text, `${name} does not cite the routing pattern`);
    assertIn('review-reverse-engineering-package', text, `${name} does not name the review skill`);
  }
});

test('Check L — every verify step declares both modes and both tiers', () => {
  for (const skill of reSkillFiles()) {
    const name = path.basename(path.dirname(skill));
    const verify = path.join(path.dirname(skill), 'steps', 'verify.md');
    assert(fs.existsSync(verify), `${name}: missing steps/verify.md`);
    const text = fs.readFileSync(verify, 'utf-8');
    for (const needle of ['`automated`', '`review-evidence`', 'Tier M', 'Tier J', 'UNVERIFIED']) {
      assertIn(needle, text, `${name}/steps/verify.md missing '${needle}'`);
    }
  }
});

// --- Check M — {paths.<key>} / {project.paths.<key>} token resolution ---
// No fixture-mode flag exists for M (unlike I/K), so these write an ephemeral
// composition directly into the live templates/compositions/ tree — the same
// tree validate.js's hardcoded COMPOSITIONS_ROOT scans — and remove it
// afterwards regardless of assertion outcome.

const CHECK_M_FIXTURE = path.join(REPO_ROOT, 'templates', 'compositions', '_check-m-test-fixture.yaml');

function writeCheckMFixture(token) {
  fs.writeFileSync(
    CHECK_M_FIXTURE,
    [
      'name: check-m-test-fixture',
      'description: Ephemeral fixture for test-validate.js Check M test. Deleted immediately after the assertion.',
      'applies-to-flow: any',
      'package-type: test-fixture',
      '',
      // The `{feature-id}/` segment is required because Check N1 scans the same
      // tree: a fixture rooted at a feature-scoped key without one is a real N1
      // violation, and these cases must isolate M rather than trip a second check.
      `default-output-path: "${token}/{feature-id}/{feature-id}-test.md"`,
      '',
    ].join('\n'),
    'utf-8'
  );
}

test('Check M — reject a phantom {paths.requirements_path} reference', () => {
  writeCheckMFixture('{paths.requirements_path}');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_M_FIXTURE);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(
    proc.returncode, 0,
    `validator should reject a phantom {paths.requirements_path} reference.\noutput:\n${out}`
  );
  assertIn('Check M', out, `output missing 'Check M'.\noutput:\n${out}`);
  assertIn('requirements_path', out, `output missing 'requirements_path'.\noutput:\n${out}`);
});

test('Check M — accept a declared {paths.requirements_package} key', () => {
  writeCheckMFixture('{paths.requirements_package}');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_M_FIXTURE);
  }
  assertEqual(
    proc.returncode, 0,
    `validator should accept a declared [project.paths] key.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check M — accept the {project.paths.<key>} synonym form', () => {
  writeCheckMFixture('{project.paths.quality_package}');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_M_FIXTURE);
  }
  assertEqual(
    proc.returncode, 0,
    `validator should accept the {project.paths.<key>} synonym form.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// --- TOML parser — shapes the real config examples actually use ---
//
// `parseSimpleToml` is hand-rolled, because Node has no stdlib TOML reader where
// Python has `tomllib`. That asymmetry let the two validators drift: Check I
// passed in Python and failed in Node against `config/project.toml.example`,
// because a multi-line basic string (`description = """`) matched the
// quoted-string branch, mis-parsed, and then threw on the prose lines beneath
// it. Two neighbouring gaps came from the same weakness — inline arrays stayed
// raw strings, and trailing `# comments` were swallowed into the value.
//
// These cases pin the shapes the committed examples actually use, so the Node
// parser cannot quietly fall behind `tomllib` again.

const PARSER_TMP = path.join(REPO_ROOT, 'scripts', 'test_fixtures', '_parser-tmp');

function writeTmpToml(name, body) {
  fs.mkdirSync(PARSER_TMP, { recursive: true });
  const p = path.join(PARSER_TMP, name);
  fs.writeFileSync(p, body, 'utf-8');
  return p;
}

function cleanTmpToml() {
  fs.rmSync(PARSER_TMP, { recursive: true, force: true });
}

test('TOML parser — Check I parses config/project.toml.example (multi-line string)', () => {
  const proc = runValidate('--project-toml', 'config/project.toml.example');
  const out = proc.stdout + proc.stderr;
  assertNotIn('TOML parse error', out, `the committed example must parse.\noutput:\n${out}`);
  assertEqual(proc.returncode, 0, `Check I should pass on the committed example.\noutput:\n${out}`);
});

test('TOML parser — a trailing comment is not swallowed into the value', () => {
  let proc;
  try {
    const p = writeTmpToml(
      'project.toml',
      '[[project.repos]]\ncode = "api-billing"   # trailing comment\nwrite_role = "Developer"\n'
    );
    proc = runValidate('--project-toml', `"${p}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotIn('TOML parse error', out, `should parse.\noutput:\n${out}`);
  assertNotIn(
    '# trailing comment', out,
    `the comment leaked into the parsed value.\noutput:\n${out}`
  );
});

test('TOML parser — an inline array parses as an array, not a raw string', () => {
  let proc;
  try {
    const p = writeTmpToml(
      'project.toml',
      '[project.elicitation]\nparts_affected_vocabulary = ["api", "ui"]\n'
    );
    proc = runValidate('--project-toml', `"${p}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotIn('TOML parse error', out, `an inline array should parse.\noutput:\n${out}`);
});

test('TOML parser — an array spanning multiple lines closes correctly', () => {
  let proc;
  try {
    const p = writeTmpToml(
      'project.toml',
      '[project.glossary]\nreferences = [\n  "one",\n  "two",\n]\n\n[[project.repos]]\ncode = "api-billing"\n'
    );
    proc = runValidate('--project-toml', `"${p}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotIn('TOML parse error', out, `a multi-line array should parse.\noutput:\n${out}`);
});

// --- Check N1 — feature-segment / retired-placeholder guardrail ---
//
// Like Check M, N1 asserts the framework's own consistency and has no fixture
// mode, so the fixtures go into the live trees it scans and are removed in
// `finally`. The document fixture sits in `templates/` rather than
// `templates/blocks/` because a .md under blocks/ also answers to Check E's
// frontmatter rules and Check A's orphan scan, either of which would mask the
// N1 result these cases exist to observe.

const CHECK_N1_COMPOSITION = path.join(REPO_ROOT, 'templates', 'compositions', '_check-n1-test-fixture.yaml');
const CHECK_N1_DOC = path.join(REPO_ROOT, 'templates', '_check-n1-test-fixture.md');

function writeN1Composition(outPath) {
  fs.writeFileSync(
    CHECK_N1_COMPOSITION,
    [
      'name: check-n1-test-fixture',
      'description: Ephemeral fixture for test-validate.js Check N1 test. Deleted immediately after the assertion.',
      'applies-to-flow: any',
      'package-type: test-fixture',
      '',
      `default-output-path: "${outPath}"`,
      '',
    ].join('\n'),
    'utf-8'
  );
}

function writeN1Doc(body) {
  fs.writeFileSync(
    CHECK_N1_DOC,
    `# Ephemeral fixture for test-validate.js Check N1\n\n${body}\n`,
    'utf-8'
  );
}

test('Check N1 — reject a feature-scoped composition with no {feature-id}/ segment', () => {
  writeN1Composition('{paths.design_package}/{feature-id}-design.md');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_COMPOSITION);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, `N1 should reject a missing segment.\noutput:\n${out}`);
  assertIn('Check N1', out, `output missing 'Check N1'.\noutput:\n${out}`);
  assertIn('carries no', out, `output missing the segment complaint.\noutput:\n${out}`);
});

test('Check N1 — accept the same composition once the segment is present', () => {
  writeN1Composition('{paths.design_package}/{feature-id}/{feature-id}-design.md');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_COMPOSITION);
  }
  assertEqual(
    proc.returncode, 0,
    `N1 should accept a path carrying the segment.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check N1 — a KB path is keyed by repo-slug, so no segment is required', () => {
  writeN1Composition('{paths.knowledge_base_path}/source-docs/{repo-slug}/api-consumer/');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_COMPOSITION);
  }
  assertEqual(
    proc.returncode, 0,
    `N1 must not require a segment on a non-feature-scoped path.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check N1 — reject the retired docs/<feature>/ spelling', () => {
  writeN1Doc('Write the section to `docs/<feature>/requirements-package/`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, `N1 should reject docs/<feature>/.\noutput:\n${out}`);
  assertIn('retired placeholder', out, `output missing the retired-placeholder complaint.\noutput:\n${out}`);
});

test('Check N1 — reject <feature-folder> under a {paths.*} token', () => {
  writeN1Doc('Assemble to `{paths.quality_package}/<feature-folder>/x.md`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, `N1 should reject <feature-folder>.\noutput:\n${out}`);
  assertIn('retired placeholder', out, `output missing the retired-placeholder complaint.\noutput:\n${out}`);
});

test('Check N1 — accept docs/<feature-id>/, the one permitted spelling', () => {
  writeN1Doc('Write the section to `docs/<feature-id>/requirements-package/`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1 should accept docs/<feature-id>/.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check N1 — <feature> stays legal in prose, scope IDs and documented source trees', () => {
  writeN1Doc(
    'Ask "List the next behavior for <feature>." Scope IDs use `<feature>:<sub-scope>`. ' +
    'Entities live in `src/domain/<feature>/`.'
  );
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1 must not flag <feature> outside A.I.D.E. artifact paths.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// Mirrors Check M, which has exempted fenced content since it shipped. Without
// this, the doc debt the 2.4.0 entry still owes cannot be written: showing the
// old layout beside the new one is the whole point of it.
test('Check N1 — a retired spelling inside a fenced block is exempt', () => {
  writeN1Doc(
    'Rename the directory:\n\n```\ndocs/<feature>/requirements-package/\n```\n\n' +
    'becomes `docs/<feature-id>/requirements-package/`.'
  );
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1 should exempt a retired spelling inside a fence.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check N1 — the fence exemption is positional, not file-wide', () => {
  writeN1Doc('```\ndocs/<feature-id>/ok/\n```\n\nThen write to `docs/<feature-name>/x/`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, `N1 must still flag prose below a closed fence.\noutput:\n${out}`);
  assertIn('retired placeholder', out, `output missing the retired-placeholder complaint.\noutput:\n${out}`);
});

// N1c — the defect N1a could not see, in the file type that resolves it. This
// exact string shipped green in `review-design-package/SKILL.md` while the
// character-identical string in a composition was rejected by N1a. Note it is
// rooted at no `{paths.*}` token, which is why N1c keys on the filename rather
// than the root.
test('Check N1c — reject a per-feature artifact with no enclosing directory', () => {
  writeN1Doc('Single-repo: under `<repo-code>/<feature-id>-design.md`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, `N1c should reject a missing feature directory.\noutput:\n${out}`);
  assertIn('names a per-feature artifact', out, `output missing the N1c complaint.\noutput:\n${out}`);
});

test('Check N1c — accept the same path once the feature directory is present', () => {
  writeN1Doc('Single-repo: under `<repo-code>/<feature-id>/<feature-id>-design.md`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1c should accept a path carrying the feature directory.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// The assertion is containment, not adjacency: the working tree nests a package
// subdirectory between the feature directory and the file, so requiring the
// *immediate* parent to be `<feature-id>/` would reject three correct quick-dev
// paths.
test('Check N1c — the feature directory may be an ancestor, not only a parent', () => {
  writeN1Doc('Write to `docs/<feature-id>/quick-dev-package/<feature-id>-quick-dev-plan.md`.');
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1c must accept the feature directory as an ancestor.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// A filename that claims no location is not a routing defect: report templates
// display the artifact's name, and prose discusses the `<feature-id>-` prefix
// itself. Requiring a parent segment is what keeps those out of scope.
test('Check N1c — a bare filename with no path is ignored', () => {
  writeN1Doc(
    'Report line: `Quality package: <feature-id>-quality.md @ <version>`. ' +
    'Filenames keep the `<feature-id>-` prefix.'
  );
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1c must not flag a bare filename outside a path.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

test('Check N1c — a fenced block is exempt, as in N1b and M', () => {
  writeN1Doc(
    'Before:\n\n```\n<repo-code>/<feature-id>-design.md\n```\n\n' +
    'After: `<repo-code>/<feature-id>/<feature-id>-design.md`.'
  );
  let proc;
  try {
    proc = runValidate();
  } finally {
    fs.unlinkSync(CHECK_N1_DOC);
  }
  assertEqual(
    proc.returncode, 0,
    `N1c should exempt a fenced block.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// --- Check N2 — feature registry (--features-toml fixture mode) ---
//
// Reuses the temp-TOML helpers from the parser section above. Sub-rules that
// need a companion file are exercised both ways: supplied, and absent (where
// N2 must warn that it skipped rather than pass silently).

test('Check N2 — the committed example validates against project.toml.example', () => {
  const proc = runValidate(
    '--features-toml', 'config/features.toml.example',
    '--project-toml', 'config/project.toml.example'
  );
  assertEqual(
    proc.returncode, 0,
    `config/features.toml.example should validate cleanly.\noutput:\n${proc.stdout + proc.stderr}`
  );
});

// The ID is used verbatim as a directory name, so every non-slug shape is rejected.
// One test over all six shapes, mirroring test_validate.py's subTest loop, so the
// two suites' totals stay directly comparable. The rejected value is named in each
// assertion message, so a failure still says which shape broke.
test('Check N2 — reject a malformed feature id', () => {
  for (const bad of [
    'Alert-Customer',  // uppercase
    'alert_customer',  // underscore
    '-alert',          // leading hyphen
    'alert-',          // trailing hyphen
    'alert--customer', // doubled hyphen
    'alert customer',  // space
  ]) {
    let proc;
    try {
      const f = writeTmpToml('features.toml', `[[features]]\nid = "${bad}"\n`);
      proc = runValidate('--features-toml', `"${f}"`);
    } finally {
      cleanTmpToml();
    }
    const out = proc.stdout + proc.stderr;
    assertNotEqual(proc.returncode, 0, `id "${bad}" should be rejected.\noutput:\n${out}`);
    assertIn('not a lowercase kebab slug', out, `id "${bad}" rejected for the wrong reason.\noutput:\n${out}`);
  }
});

// An ordinal-prefixed id is not special-cased: lowercased, it is just a slug.
// The format rule is about what makes a safe directory name, not about banning a
// convention the framework no longer mints.
test('Check N2 — accept an ordinal-prefixed id as an ordinary slug', () => {
  let proc;
  try {
    const f = writeTmpToml(
      'features.toml',
      '[[features]]\nid = "feat-0001-alert-customer"\n'
    );
    proc = runValidate('--features-toml', `"${f}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertEqual(proc.returncode, 0, out);
});

test('Check N2 — reject a duplicate feature id', () => {
  let proc;
  try {
    const f = writeTmpToml(
      'features.toml',
      '[[features]]\nid = "refunds"\n\n[[features]]\nid = "refunds"\n'
    );
    proc = runValidate('--features-toml', `"${f}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, out);
  assertIn('duplicate', out, out);
});

test('Check N2 — reject a stale active_feature pointer', () => {
  let proc;
  try {
    const f = writeTmpToml('features.toml', '[[features]]\nid = "real-feature"\n');
    const u = writeTmpToml('project.user.toml', '[user]\nactive_feature = "nope-not-registered"\n');
    proc = runValidate('--features-toml', `"${f}"`, '--project-user-toml', `"${u}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, out);
  assertIn('resolves to no', out, out);
});

test('Check N2 — reject a repos entry naming no declared repo code', () => {
  let proc;
  try {
    const f = writeTmpToml(
      'features.toml',
      '[[features]]\nid = "real-feature"\nrepos = ["ghost-repo"]\n'
    );
    const p = writeTmpToml('project.toml', '[[project.repos]]\ncode = "api-billing"\n');
    proc = runValidate('--features-toml', `"${f}"`, '--project-toml', `"${p}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertNotEqual(proc.returncode, 0, out);
  assertIn('matches no [[project.repos]].code', out, out);
});

test('Check N2 — accept a valid registry with both companion files', () => {
  let proc;
  try {
    const f = writeTmpToml(
      'features.toml',
      '[[features]]\nid = "alert-customer"\nrepos = ["api-billing"]\n' +
      '\n[[features]]\nid = "refund-fee-waiver"\n'
    );
    const p = writeTmpToml('project.toml', '[[project.repos]]\ncode = "api-billing"\n');
    const u = writeTmpToml('project.user.toml', '[user]\nactive_feature = "refund-fee-waiver"\n');
    proc = runValidate(
      '--features-toml', `"${f}"`, '--project-toml', `"${p}"`, '--project-user-toml', `"${u}"`
    );
  } finally {
    cleanTmpToml();
  }
  assertEqual(proc.returncode, 0, `valid registry should pass.\noutput:\n${proc.stdout + proc.stderr}`);
});

test('Check N2 — companion-file sub-rules report that they were skipped', () => {
  let proc;
  try {
    const f = writeTmpToml('features.toml', '[[features]]\nid = "real-feature"\n');
    proc = runValidate('--features-toml', `"${f}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertEqual(proc.returncode, 0, out);
  assertIn('`repos` cross-reference skipped', out, `a partial run must say so.\noutput:\n${out}`);
  assertIn('`active_feature` resolution skipped', out, `a partial run must say so.\noutput:\n${out}`);
});

test('Check N2 — an empty registry is legal (opted in, nothing minted yet)', () => {
  let proc;
  try {
    const f = writeTmpToml('features.toml', '# opted in, nothing minted yet\n');
    proc = runValidate('--features-toml', `"${f}"`);
  } finally {
    cleanTmpToml();
  }
  const out = proc.stdout + proc.stderr;
  assertEqual(proc.returncode, 0, `empty registry should pass.\noutput:\n${out}`);
  assertIn('no features yet', out, out);
});

test('Check N2 — a missing registry file exits non-zero', () => {
  const proc = runValidate('--features-toml', '/nonexistent/features.toml');
  assertNotEqual(proc.returncode, 0, 'missing file should exit non-zero');
  assertIn('file not found', proc.stdout + proc.stderr, 'should say file not found');
});

test('Check N2 — malformed TOML exits non-zero', () => {
  let proc;
  try {
    const f = writeTmpToml('features.toml', '[[features]\nid = broken\n');
    proc = runValidate('--features-toml', `"${f}"`);
  } finally {
    cleanTmpToml();
  }
  assertNotEqual(proc.returncode, 0, 'malformed TOML should exit non-zero');
  assertIn('malformed TOML', proc.stdout + proc.stderr, 'should say malformed TOML');
});

// --- Summary ---

console.log('\n' + '='.repeat(60));
console.log('Test Results:');
console.log(`  Passed: ${testsPassed}`);
console.log(`  Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}
