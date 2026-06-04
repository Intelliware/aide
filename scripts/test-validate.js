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
  for (const label of ['Check A', 'Check B', 'Check D', 'Check E', 'Check F']) {
    assertIn(label, out, `missing '${label}' in default-mode output`);
  }

  // And it should NOT mention Check I — that only fires in SoD-fixture mode
  assertNotIn(
    'Check I', out,
    'default-mode output should not run Check I (SoD fixture mode)'
  );
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
