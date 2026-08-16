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
      `default-output-path: "${token}/{feature-id}-test.md"`,
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
