#!/usr/bin/env node
/**
 * validate.js — Deeper cross-check validation for A.I.D.E.
 *
 * Companion to `build-registry.js`. While build-registry validates the basics of
 * each SKILL.md (frontmatter, references/ trio, line cap), this script runs the
 * deeper cross-cutting validation that gates archiving legacy folders (migration
 * task #8 -> task #9):
 *
 *   A. Composition / block cross-references.
 *   B. Workflow-graph resolution against the skill registry.
 *   C. Description discipline (front-loaded triggers, no workflow tells).
 *   D. Stale "phase" language under .agents/skills/, templates/blocks/, compositions/.
 *   E. Block frontmatter integrity.
 *   F. Re-run of build-registry.js for sanity.
 *   G. Elicitation-pattern resolution (composition + skill citations resolve;
 *      orphan patterns flagged).
 *   H. RE skill output-structure binding.
 *   I. Separation-of-duties (SoD) rule enforcement against a fixture
 *      project.toml (and optional cross-cutting artifact). Run with
 *      `--project-toml PATH` to evaluate rules 7–12 from `config/SCHEMAS.md`.
 *
 * Hard errors fail the run (exit 1):
 *   - Composition references a non-existent block (A).
 *   - Unresolved workflow-graph reference (B).
 *   - Missing required block frontmatter field, missing/unclosed frontmatter,
 *     slug != filename, applies-to empty, build-registry non-zero exit (E, F).
 *   - Composition or skill cites an elicitation pattern that does not exist (G).
 *   - Any SoD rule violation when running in --project-toml mode (I).
 *
 * Everything else is a soft warning (does not fail). Stdlib-only.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_ROOT = path.join(REPO_ROOT, '.agents', 'skills');
const TEMPLATES_ROOT = path.join(REPO_ROOT, 'templates');
const BLOCKS_ROOT = path.join(TEMPLATES_ROOT, 'blocks');
const COMPOSITIONS_ROOT = path.join(TEMPLATES_ROOT, 'compositions');
const SKILLS_CSV = path.join(SKILLS_ROOT, '_registry', 'skills.csv');
const WORKFLOW_GRAPH = path.join(SKILLS_ROOT, '_registry', 'workflow-graph.yaml');
const BUILD_REGISTRY_SCRIPT = path.join(REPO_ROOT, 'scripts', 'build-registry.js');
const ELICITATION_PATTERNS_DIR = path.join(REPO_ROOT, 'references', 'elicitation-patterns');

const ELICITATION_REF_RE = /references\/elicitation-patterns\/([A-Za-z0-9][A-Za-z0-9_-]*)\.md/g;
const BLOCK_PATH_REF_RE = /templates\/blocks\/([A-Za-z0-9][\w/-]*)\.md/g;

// Legacy/archive folders excluded from the phase-language sweep.
const EXCLUDED_TOPLEVEL = new Set([
  '_archive', '_bmad', '_shared',
  'implementation-execution', 'implementation-planning',
  'model-2-sdlc-skills', 'requirements-package',
  'reverse-engineering',       // legacy top-level (NOT .agents/skills/reverse-engineering)
  'solution-design-package',
]);

// kb-instance is the umbrella value used by KB blocks; the actual composition
// is kb-instance-root (intentional — see kb-instance-root.yaml notes).
const KNOWN_APPLIES_TO_ALIASES = { 'kb-instance': 'kb-instance-root' };

const WORKFLOW_TELL_PATTERNS = [
  /\bproduces and\b/i,
  /\bfollows\s+\d+\s+steps?\b/i,
  /\bfollows the workflow\b/i,
  /\bstep[- ]by[- ]step\b/i,
  /\bexecutes the [^.]*sequence\b/i,
  /\bperforms\s+\d+\s+actions?\b/i,
  /\bimplements the [A-Za-z][A-Za-z -]+ process\b/i,
];

const DESCRIPTION_MAX_LEN = 1024;

const PHASE_PATTERNS = [
  { label: 'PHASE- prefix', pattern: /\bPHASE-\b/ },
  { label: 'phase-status.md', pattern: /\bphase-status\.md\b/ },
  { label: 'Canonical Phase Shape', pattern: /Canonical Phase Shape/i },
  { label: 'Phase Identity header', pattern: /^\s{0,3}#{1,6}\s+Phase Identity\b/ },
  { label: 'Phase N header (RE)', pattern: /^\s{0,3}#{1,6}\s+Phase\s+\d+\b/ },
  { label: 'Phase N (non-RE)', pattern: /\bPhase\s+\d+\b/ },
];

const RE_SUPPRESSED_PHASE_LABELS = new Set(['Phase N header (RE)', 'Phase N (non-RE)']);

const REQUIRED_BLOCK_FIELDS = ['slug', 'title', 'applies-to', 'requires-decision-from', 'optional', 'order-hint'];

const PHASE_VOCAB_ALLOW_PRAGMA = 'validate: allow-phase-vocab';

// SoD enum (config/SCHEMAS.md § 4 rules 9 / 10).
const SOD_ROLE_ENUM = ['BA', 'Architect', 'BSA', 'Developer', 'Tester', 'KB-Steward'];

// --- frontmatter parser (same shape as build-registry.js) -------------------

function parseFrontmatter(text) {
  // Normalize line endings to handle both Unix (\n) and Windows (\r\n)
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (!lines.length || lines[0].trim() !== '---') {
    return {};
  }

  const body = [];
  let i = 1;
  for (; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      break;
    }
    body.push(lines[i]);
  }

  if (i === lines.length) {
    return {};
  }

  const out = {};
  let lastKey = null;
  const keyRe = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/;

  for (const raw of body) {
    if (!raw.trim()) {
      lastKey = null;
      continue;
    }

    const match = raw.match(keyRe);
    if (match && !raw.match(/^[ \t]/)) {
      let [, key, value] = match;
      value = value.trim();
      value = unquote(value);

      if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        out[key] = inner ? inner.split(',').map(p => unquote(p.trim())).filter(p => p) : [];
      } else {
        out[key] = value;
      }

      lastKey = key;
    } else if (lastKey !== null && typeof out[lastKey] === 'string') {
      out[lastKey] = (out[lastKey] + ' ' + raw.trim()).trim();
    }
  }

  return out;
}

function unquote(value) {
  if (value.length >= 2 && value[0] === value[value.length - 1] && (value[0] === '"' || value[0] === "'")) {
    let inner = value.slice(1, -1);
    if (value[0] === '"') {
      inner = inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return inner;
  }
  return value;
}

// --- discovery --------------------------------------------------------------

function discoverFiles(dir, pattern) {
  const results = [];

  function walk(currentPath) {
    if (!fs.existsSync(currentPath) || !fs.statSync(currentPath).isDirectory()) {
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (!pattern || pattern(entry.name, fullPath)) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.sort();
}

function discoverBlockFiles() {
  return discoverFiles(BLOCKS_ROOT, (name, fullPath) =>
    name.endsWith('.md') && name.toUpperCase() !== 'README.MD'
  );
}

function discoverCompositionFiles() {
  if (!fs.existsSync(COMPOSITIONS_ROOT)) {
    return [];
  }
  return fs.readdirSync(COMPOSITIONS_ROOT)
    .filter(f => f.endsWith('.yaml') && fs.statSync(path.join(COMPOSITIONS_ROOT, f)).isFile())
    .map(f => path.join(COMPOSITIONS_ROOT, f))
    .sort();
}

function compositionBlockSlugs(compPath) {
  const slugs = [];
  let inBlocks = false;
  const text = fs.readFileSync(compPath, 'utf-8');
  const lines = text.split('\n');

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.trim().startsWith('blocks:')) {
      inBlocks = true;
      continue;
    }
    if (!inBlocks) {
      continue;
    }
    if (line && !line.startsWith(' ') && !line.startsWith('\t') && line.trim() && !line.trim().startsWith('#')) {
      inBlocks = false;
      continue;
    }
    const m = line.match(/^\s*-\s+slug:\s*(.+?)\s*$/);
    if (m) {
      slugs.push([m[1].trim().replace(/^["']|["']$/g, ''), idx + 1]);
    }
  }

  return slugs;
}

function compositionName(compPath) {
  const text = fs.readFileSync(compPath, 'utf-8');
  const lines = text.split('\n');

  for (const line of lines) {
    const m = line.match(/^name:\s*(.+?)\s*$/);
    if (m) {
      return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  return path.basename(compPath, '.yaml');
}

function discoverSkills() {
  const out = [];
  if (!fs.existsSync(SKILLS_ROOT) || !fs.statSync(SKILLS_ROOT).isDirectory()) {
    return out;
  }

  const skillFiles = discoverFiles(SKILLS_ROOT, (name) => name === 'SKILL.md');

  for (const skillPath of skillFiles) {
    const rel = path.relative(REPO_ROOT, skillPath);
    const parts = rel.split(path.sep);

    if (
      parts.length < 5 ||
      parts[0] !== '.agents' ||
      parts[1] !== 'skills' ||
      parts[2].startsWith('_')
    ) {
      continue;
    }

    const text = fs.readFileSync(skillPath, 'utf-8');
    out.push({
      path: rel,
      frontmatter: parseFrontmatter(text)
    });
  }

  return out;
}

function workflowGraphSkillRefs() {
  const refs = [];
  if (!fs.existsSync(WORKFLOW_GRAPH)) {
    return refs;
  }

  const text = fs.readFileSync(WORKFLOW_GRAPH, 'utf-8');
  const lines = text.split('\n');
  let inAnytime = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const stripped = line.trim();

    if (stripped.startsWith('anytime:')) {
      inAnytime = true;
      continue;
    }

    if (inAnytime) {
      if (line && !line.startsWith(' ') && !line.startsWith('\t') && !line.startsWith('#') && stripped) {
        inAnytime = false;
      } else {
        const m = line.match(/^\s*-\s+([a-zA-Z][a-zA-Z0-9-]*)\s*$/);
        if (m) {
          refs.push([m[1], `workflow-graph.yaml:${idx + 1} (anytime)`]);
          continue;
        }
      }
    }

    let m = line.match(/^\s*-?\s*skill:\s*([A-Za-z<][\w<>-]*)\s*$/);
    if (m) {
      refs.push([m[1], `workflow-graph.yaml:${idx + 1}`]);
      continue;
    }

    m = line.match(/^\s*per-increment-closing-skill:\s*([A-Za-z][\w-]*)\s*$/);
    if (m) {
      refs.push([m[1], `workflow-graph.yaml:${idx + 1} (closing-skill)`]);
    }
  }

  return refs;
}

function knownSkillNames() {
  if (!fs.existsSync(SKILLS_CSV)) {
    return new Set();
  }

  const names = new Set();
  const text = fs.readFileSync(SKILLS_CSV, 'utf-8');
  const lines = text.split('\n').slice(1); // skip header

  for (const line of lines) {
    const n = line.split(',')[0].trim();
    if (n) {
      names.add(n);
    }
  }

  return names;
}

// --- checks -----------------------------------------------------------------

function checkA() {
  const errors = [];
  const warnings = [];
  const referenced = new Set();

  for (const comp of discoverCompositionFiles()) {
    const rel = path.relative(REPO_ROOT, comp);
    for (const [slug, lineno] of compositionBlockSlugs(comp)) {
      const target = path.join(BLOCKS_ROOT, `${slug}.md`);
      if (!fs.existsSync(target)) {
        errors.push(`${rel}:${lineno}: composition references missing block '${slug}' (expected at ${path.relative(REPO_ROOT, target)})`);
      } else {
        referenced.add(path.resolve(target));
      }
    }
  }

  // Direct path references inside skills
  if (fs.existsSync(SKILLS_ROOT) && fs.statSync(SKILLS_ROOT).isDirectory()) {
    const mdFiles = discoverFiles(SKILLS_ROOT, (name) => name.endsWith('.md'));
    for (const md of mdFiles) {
      try {
        const text = fs.readFileSync(md, 'utf-8');
        const matches = text.matchAll(BLOCK_PATH_REF_RE);
        for (const match of matches) {
          const slug = match[1];
          const target = path.join(BLOCKS_ROOT, `${slug}.md`);
          if (fs.existsSync(target)) {
            referenced.add(path.resolve(target));
          }
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }

  for (const bf of discoverBlockFiles()) {
    if (!referenced.has(path.resolve(bf))) {
      warnings.push(`${path.relative(REPO_ROOT, bf)}: orphan block (no composition or skill references it)`);
    }
  }

  return [errors, warnings];
}

function checkB() {
  const errors = [];
  const warnings = [];
  const known = knownSkillNames();

  if (known.size === 0) {
    warnings.push(`${path.relative(REPO_ROOT, SKILLS_CSV)}: not found or empty — registry has not been built.`);
    return [errors, warnings];
  }

  for (const [ref, ctx] of workflowGraphSkillRefs()) {
    if (ref.includes('<dynamic>')) {
      continue;
    }
    if (!known.has(ref)) {
      errors.push(`${ctx}: skill '${ref}' not in skills registry.`);
    }
  }

  return [errors, warnings];
}

function checkC() {
  const errors = [];
  const warnings = [];

  for (const rec of discoverSkills()) {
    const fm = rec.frontmatter;
    const desc = typeof fm === 'object' && fm.description ? fm.description : '';
    if (!desc) {
      continue;
    }

    const relPath = rec.path;

    if (!desc.toLowerCase().startsWith('use when')) {
      warnings.push(`${relPath}: description flag — does not start with 'Use when'`);
    }

    for (const pat of WORKFLOW_TELL_PATTERNS) {
      if (pat.test(desc)) {
        warnings.push(`${relPath}: description flag — workflow-summary tell: /${pat.source}/`);
      }
    }

    if (desc.length > DESCRIPTION_MAX_LEN) {
      warnings.push(`${relPath}: description flag — length ${desc.length} > ${DESCRIPTION_MAX_LEN}`);
    }
  }

  return [errors, warnings];
}

function isExcluded(rel) {
  const parts = rel.split(path.sep);
  return parts.length > 0 && EXCLUDED_TOPLEVEL.has(parts[0]);
}

function inCodeFence(lines, idx) {
  let fences = 0;
  for (let i = 0; i < idx; i++) {
    if (lines[i].trim().startsWith('```')) {
      fences++;
    }
  }
  return fences % 2 === 1;
}

function checkD() {
  const errors = [];
  const warnings = [];
  const targets = [];

  // Collect files under SKILLS_ROOT
  if (fs.existsSync(SKILLS_ROOT)) {
    const mdFiles = discoverFiles(SKILLS_ROOT, (name) => name.endsWith('.md'));
    for (const p of mdFiles) {
      if (!isExcluded(path.relative(REPO_ROOT, p))) {
        targets.push(p);
      }
    }
  }

  // Add blocks and compositions
  targets.push(...discoverBlockFiles());
  targets.push(...discoverCompositionFiles());

  for (const filePath of targets.sort()) {
    const rel = path.relative(REPO_ROOT, filePath);
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      continue;
    }

    // Check for pragma
    if (text.includes(PHASE_VOCAB_ALLOW_PRAGMA)) {
      continue;
    }

    const lines = text.split('\n');
    const relStr = rel.replace(/\\/g, '/');
    const inReFolder =
      relStr.startsWith('.agents/skills/reverse-engineering/') ||
      relStr.startsWith('templates/blocks/reverse-eng/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { label, pattern } of PHASE_PATTERNS) {
        if (label === 'Phase N header (RE)' && !relStr.startsWith('.agents/skills/reverse-engineering/')) {
          continue;
        }
        if (RE_SUPPRESSED_PHASE_LABELS.has(label) && label === 'Phase N (non-RE)' && inReFolder) {
          continue;
        }

        const m = pattern.exec(line);
        if (m && label === 'Phase N (non-RE)') {
          const start = m.index;
          if (start > 0 && (line[start - 1] === '"' || line[start - 1] === "'")) {
            continue;
          }
        }

        if (m) {
          if (inCodeFence(lines, i)) {
            continue;
          }
          let snippet = line.trim();
          if (snippet.length > 160) {
            snippet = snippet.slice(0, 157) + '...';
          }
          warnings.push(`${rel}:${i + 1}: [${label}] ${snippet}`);
          break;
        }
      }
    }
  }

  return [errors, warnings];
}

function checkE() {
  const errors = [];
  const warnings = [];
  const compositionNames = new Set(discoverCompositionFiles().map(p => compositionName(p)));

  for (const bf of discoverBlockFiles()) {
    const rel = path.relative(REPO_ROOT, bf);
    const text = fs.readFileSync(bf, 'utf-8');
    const fm = parseFrontmatter(text);

    if (!fm || Object.keys(fm).length === 0) {
      errors.push(`${rel}: missing or unclosed YAML frontmatter`);
      continue;
    }

    for (const field of REQUIRED_BLOCK_FIELDS) {
      if (!(field in fm)) {
        errors.push(`${rel}: missing required block frontmatter field '${field}'`);
        continue;
      }

      const value = fm[field];
      if (field === 'applies-to') {
        if (!Array.isArray(value) || value.length === 0) {
          errors.push(`${rel}: '${field}' must be a non-empty list`);
        }
      } else if (field === 'requires-decision-from') {
        if (!Array.isArray(value)) {
          errors.push(`${rel}: '${field}' must be a list`);
        } else if (value.length === 0) {
          warnings.push(`${rel}: '${field}' is empty (acceptable only for index / tracking blocks)`);
        }
      }
    }

    const slugValue = fm.slug || '';
    const expectedSlug = path.basename(bf, '.md');
    if (typeof slugValue === 'string' && slugValue !== expectedSlug) {
      errors.push(`${rel}: frontmatter slug '${slugValue}' does not match filename '${expectedSlug}'`);
    }

    const applies = fm['applies-to'] || [];
    if (Array.isArray(applies)) {
      for (const a of applies) {
        const resolved = KNOWN_APPLIES_TO_ALIASES[a] || a;
        if (!compositionNames.has(resolved)) {
          warnings.push(`${rel}: applies-to entry '${a}' is not a known composition`);
        }
      }
    }
  }

  return [errors, warnings];
}

function scanElicitationRefs(filePath) {
  const refs = [];
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');

    for (let idx = 0; idx < lines.length; idx++) {
      const matches = lines[idx].matchAll(ELICITATION_REF_RE);
      for (const match of matches) {
        refs.push([match[1], idx + 1]);
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }

  return refs;
}

function checkG() {
  const errors = [];
  const warnings = [];
  const referenced = new Set();
  const sources = [];

  // Add composition files
  sources.push(...discoverCompositionFiles());

  // Add skill markdown files
  if (fs.existsSync(SKILLS_ROOT) && fs.statSync(SKILLS_ROOT).isDirectory()) {
    const mdFiles = discoverFiles(SKILLS_ROOT, (name) =>
      name.endsWith('.md') && !name.toUpperCase().startsWith('README')
    );
    sources.push(...mdFiles);
  }

  for (const src of sources.sort()) {
    const rel = path.relative(REPO_ROOT, src);
    for (const [stem, lineNo] of scanElicitationRefs(src)) {
      referenced.add(stem);
      const target = path.join(ELICITATION_PATTERNS_DIR, `${stem}.md`);
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        errors.push(`${rel}:${lineNo}: cites missing elicitation pattern 'references/elicitation-patterns/${stem}.md'`);
      }
    }
  }

  // Check for orphan patterns
  if (fs.existsSync(ELICITATION_PATTERNS_DIR) && fs.statSync(ELICITATION_PATTERNS_DIR).isDirectory()) {
    const onDisk = new Set();
    const files = fs.readdirSync(ELICITATION_PATTERNS_DIR);
    for (const file of files) {
      if (file.endsWith('.md') && file.toUpperCase() !== 'README.MD') {
        const filePath = path.join(ELICITATION_PATTERNS_DIR, file);
        if (fs.statSync(filePath).isFile()) {
          onDisk.add(path.basename(file, '.md'));
        }
      }
    }

    for (const stem of Array.from(onDisk).sort()) {
      if (!referenced.has(stem)) {
        warnings.push(`references/elicitation-patterns/${stem}.md: orphan pattern (no composition or skill references it)`);
      }
    }
  }

  return [errors, warnings];
}

function checkH() {
  const errors = [];
  const warnings = [];
  const reDir = path.join(SKILLS_ROOT, 'reverse-engineering');

  if (!fs.existsSync(reDir) || !fs.statSync(reDir).isDirectory()) {
    return [errors, warnings];
  }

  const sentinel = '## Output structure (mandatory)';
  const skillFiles = discoverFiles(reDir, (name) => name === 'SKILL.md');

  for (const skillMd of skillFiles) {
    const rel = path.relative(REPO_ROOT, skillMd);

    // Skip the dispatcher
    if (skillMd.includes('analyze-repository')) {
      continue;
    }

    // Domain is everything after "reverse-engineer-" in the parent folder name
    const parent = path.basename(path.dirname(skillMd));
    if (!parent.startsWith('reverse-engineer-')) {
      continue;
    }

    const domain = parent.slice('reverse-engineer-'.length);
    const text = fs.readFileSync(skillMd, 'utf-8');

    if (!text.includes(sentinel)) {
      errors.push(`${rel}: missing mandatory '${sentinel}' section — RE skill must bind output to its compositions`);
    }

    for (const part of ['internal', 'consumer']) {
      const compName = `re-${domain}-${part}.yaml`;
      if (!text.includes(compName)) {
        errors.push(`${rel}: does not cite the matched composition '${compName}' by name`);
      }

      const compPath = path.join(COMPOSITIONS_ROOT, compName);
      if (!fs.existsSync(compPath) || !fs.statSync(compPath).isFile()) {
        errors.push(`${rel}: cited composition '${compName}' does not exist on disk at ${path.relative(REPO_ROOT, compPath)}`);
        continue;
      }

      const compText = fs.readFileSync(compPath, 'utf-8');

      if (!compText.includes('default-output-shape:')) {
        warnings.push(`${path.relative(REPO_ROOT, compPath)}: missing \`default-output-shape\` field (expected for RE compositions)`);
      }

      const blockCount = (compText.match(/^\s*-\s+slug:\s*/gm) || []).length;
      if (blockCount === 0) {
        warnings.push(`${path.relative(REPO_ROOT, compPath)}: empty \`blocks:\` list (intentional stub?)`);
      }
    }
  }

  return [errors, warnings];
}

const WRITE_DISCIPLINE_REF = 'references/ai-principles/write-discipline.md';
const PRECONDITIONS_HEADING_RE = /^##\s+Preconditions\b/m;
// See validate.py — bound list is enumerated by write-discipline.md itself.
const WRITE_DISCIPLINE_SKILLS = [
  'create-requirements-package',
  'create-design-package',
  'create-implementation-package',
];

function checkJ() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(SKILLS_ROOT) || !fs.statSync(SKILLS_ROOT).isDirectory()) {
    return [errors, warnings];
  }

  const refAbs = path.join(REPO_ROOT, WRITE_DISCIPLINE_REF);
  if (!fs.existsSync(refAbs) || !fs.statSync(refAbs).isFile()) {
    errors.push(`${WRITE_DISCIPLINE_REF}: target file missing — every bound create-* skill cites this path; fix the path or restore the file.`);
  }

  const found = new Set();
  const skillFiles = discoverFiles(SKILLS_ROOT, (name) => name === 'SKILL.md');
  for (const skillMd of skillFiles) {
    const skillName = path.basename(path.dirname(skillMd));
    if (!WRITE_DISCIPLINE_SKILLS.includes(skillName)) continue;
    found.add(skillName);
    const rel = path.relative(REPO_ROOT, skillMd);
    const text = fs.readFileSync(skillMd, 'utf-8');
    if (!PRECONDITIONS_HEADING_RE.test(text)) {
      errors.push(`${rel}: missing top-level \`## Preconditions\` section — bound create-* skills MUST declare write-discipline as a hard precondition (not as a bullet inside \`## Workflow\`).`);
    }
    if (!text.includes(WRITE_DISCIPLINE_REF)) {
      errors.push(`${rel}: does not reference \`${WRITE_DISCIPLINE_REF}\` — bound create-* skills MUST cite the write-discipline contract.`);
    }
  }
  for (const missing of WRITE_DISCIPLINE_SKILLS.filter(n => !found.has(n)).sort()) {
    warnings.push(`.agents/skills/**/${missing}/SKILL.md: bound write-discipline skill not found on disk (renamed or removed?)`);
  }

  return [errors, warnings];
}

function checkSod(projectTomlPath, artifactPath = null) {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(projectTomlPath)) {
    errors.push(`${projectTomlPath}: file does not exist`);
    return [errors, warnings];
  }

  let data;
  try {
    // Simple TOML parser - handles basic key=value and [sections]
    const text = fs.readFileSync(projectTomlPath, 'utf-8');
    data = parseSimpleToml(text);
  } catch (err) {
    errors.push(`${projectTomlPath}: TOML parse error — ${err.message}`);
    return [errors, warnings];
  }

  const declaredRepos = new Set();
  const repoRoles = {};
  const repos = (data.project && data.project.repos) || [];
  for (const repo of repos) {
    if (repo && repo.code) {
      declaredRepos.add(repo.code);
      if (repo.role) {
        repoRoles[repo.code] = repo.role;
      }
    }
  }

  const stages = data.stages || {};
  const proj = data.project || {};

  // Rule 6a — optional QE repo target resolves to a declared repo
  const testing = proj.testing || {};
  const qeRepo = testing.qe_repo;
  if (qeRepo !== undefined) {
    if (typeof qeRepo !== 'string' || qeRepo.trim() === '') {
      errors.push(`${projectTomlPath}: [project.testing].qe_repo must be a non-empty string matching one declared [[project.repos]].code.`);
    } else if (!declaredRepos.has(qeRepo)) {
      errors.push(`${projectTomlPath}: [project.testing].qe_repo = '${qeRepo}' references unknown repo — not declared in [[project.repos]].`);
    } else if (!['test-automation', 'qe'].includes(repoRoles[qeRepo])) {
      warnings.push(`${projectTomlPath}: [project.testing].qe_repo = '${qeRepo}' references repo role '${repoRoles[qeRepo]}'; expected 'test-automation' or 'qe' for a dedicated QE repo.`);
    }
  }

  // Rule 7 — dir XOR colocate per stage
  for (const [stageName, stageCfg] of Object.entries(stages)) {
    if (typeof stageCfg !== 'object') continue;

    const hasDir = 'dir' in stageCfg;
    const hasColocate = !!stageCfg.colocate_with_source;

    if (hasDir && hasColocate) {
      errors.push(`${projectTomlPath}: [stages.${stageName}] sets both \`dir\` and \`colocate_with_source\` — these are mutually exclusive (one mode per stage).`);
    }
  }

  // Rule 8 — dir is a bare relative path
  for (const [stageName, stageCfg] of Object.entries(stages)) {
    if (typeof stageCfg !== 'object') continue;

    const d = stageCfg.dir;
    if (d === undefined) continue;

    if (typeof d !== 'string') {
      errors.push(`${projectTomlPath}: [stages.${stageName}].dir must be a string.`);
      continue;
    }

    if (d.startsWith('/') || d.startsWith('\\')) {
      errors.push(`${projectTomlPath}: [stages.${stageName}].dir = '${d}': must be relative — bare path with no leading slash.`);
    }
  }

  // Rule 9 — write_role enum
  for (const [stageName, stageCfg] of Object.entries(stages)) {
    if (typeof stageCfg !== 'object') continue;

    const wr = stageCfg.write_role;
    if (wr === undefined) continue;

    if (!SOD_ROLE_ENUM.includes(wr)) {
      errors.push(`${projectTomlPath}: [stages.${stageName}].write_role = '${wr}': unknown role — enum requires one of ${JSON.stringify(SOD_ROLE_ENUM)}.`);
    }
  }

  // Rule 10 — [user].role enum
  const user = data.user || {};
  const userRole = user.role;

  if (userRole !== undefined && !SOD_ROLE_ENUM.includes(userRole)) {
    errors.push(`${projectTomlPath}: [user].role = '${userRole}': unknown role — enum requires one of ${JSON.stringify(SOD_ROLE_ENUM)}.`);
  }

  // Rule 9b — role mismatch
  if (userRole && SOD_ROLE_ENUM.includes(userRole)) {
    for (const [stageName, stageCfg] of Object.entries(stages)) {
      if (typeof stageCfg !== 'object') continue;

      const wr = stageCfg.write_role;
      if (wr && SOD_ROLE_ENUM.includes(wr) && wr !== userRole) {
        errors.push(`${projectTomlPath}: role mismatch — [user].role='${userRole}' lacks permission to write [stages.${stageName}] (requires write_role='${wr}').`);
      }
    }
  }

  // Rule 11 — artifact_subdir bare relative path
  const asd = proj.artifact_subdir;

  if (asd !== undefined) {
    if (typeof asd !== 'string') {
      errors.push(`${projectTomlPath}: [project].artifact_subdir must be a string.`);
    } else {
      if (asd.startsWith('/') || asd.startsWith('\\')) {
        errors.push(`${projectTomlPath}: [project].artifact_subdir = '${asd}': must be relative — bare path with no leading slash.`);
      }
      if (asd.includes('{') || asd.includes('}')) {
        errors.push(`${projectTomlPath}: [project].artifact_subdir = '${asd}': must be a bare path — path tokens like {project-root} are not permitted here.`);
      }
    }
  }

  // Rule 12 — cross-cutting artifact frontmatter integrity
  if (artifactPath) {
    if (!fs.existsSync(artifactPath)) {
      errors.push(`${artifactPath}: cross-cutting artifact does not exist.`);
    } else {
      const text = fs.readFileSync(artifactPath, 'utf-8');
      const fm = parseFrontmatter(text);

      if (!('affects_repos' in fm)) {
        errors.push(`${artifactPath}: cross-cutting artifact must declare an \`affects_repos\` array in its YAML frontmatter (≥ 1 repo).`);
      } else {
        const ar = fm.affects_repos;
        if (!Array.isArray(ar) || ar.length === 0) {
          errors.push(`${artifactPath}: \`affects_repos\` is empty — cross-cutting artifacts must list ≥ 1 affected repo.`);
        } else {
          for (const code of ar) {
            if (!declaredRepos.has(code)) {
              errors.push(`${artifactPath}: \`affects_repos\` lists unknown repo '${code}' — not declared in [[project.repos]] of ${projectTomlPath}.`);
            }
          }
        }
      }
    }
  }

  return [errors, warnings];
}

// Simple TOML parser for basic structures
function parseSimpleToml(text) {
  const lines = text.split('\n');
  const result = {};
  let currentSection = result;

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo];
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Section header
    if (trimmed.startsWith('[') || trimmed.endsWith(']')) {
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        throw new Error(`line ${lineNo + 1}: malformed section header '${trimmed}'`);
      }

      // Handle array tables [[section]]
      if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
        const arraySection = trimmed.slice(2, -2);
        const arrayParts = arraySection.split('.');

        if (!arraySection || arrayParts.some(part => !part || !/^[A-Za-z0-9_-]+$/.test(part))) {
          throw new Error(`line ${lineNo + 1}: malformed array table header '${trimmed}'`);
        }

        let current = result;

        for (let i = 0; i < arrayParts.length - 1; i++) {
          if (!current[arrayParts[i]]) {
            current[arrayParts[i]] = {};
          }
          current = current[arrayParts[i]];
        }

        const last = arrayParts[arrayParts.length - 1];
        if (!current[last]) {
          current[last] = [];
        }
        const newItem = {};
        current[last].push(newItem);
        currentSection = newItem;
      } else {
        if (trimmed.startsWith('[[') || trimmed.endsWith(']]')) {
          throw new Error(`line ${lineNo + 1}: malformed array table header '${trimmed}'`);
        }

        const section = trimmed.slice(1, -1);
        const parts = section.split('.');

        if (!section || parts.some(part => !part || !/^[A-Za-z0-9_-]+$/.test(part))) {
          throw new Error(`line ${lineNo + 1}: malformed section header '${trimmed}'`);
        }

        // Regular section
        let current = result;
        for (let i = 0; i < parts.length; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        currentSection = current;
      }
      continue;
    }

    // Key-value pair
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(key)) {
        throw new Error(`line ${lineNo + 1}: malformed key '${key}'`);
      }

      // Parse value
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (!isNaN(value)) {
        value = parseFloat(value);
      }

      currentSection[key] = value;
      continue;
    }

    throw new Error(`line ${lineNo + 1}: expected section header or key/value pair`);
  }

  return result;
}

// K — framework-layer guardrail: `[tools.*]` is a project-layer concern.
// Per config/SCHEMAS.md § 2.6, framework-layer configs (framework.toml /
// framework.user.toml) MUST NOT declare [tools.<name>] tables — add-on tool
// resolution is a project-layer concern only and framework.* cannot override
// it. Errors if any [tools.*] table is present.
function checkToolsLayer(frameworkTomlPath) {
  const errors = [];
  const warnings = [];
  if (!fs.existsSync(frameworkTomlPath)) {
    errors.push(`${frameworkTomlPath}: file does not exist`);
    return [errors, warnings];
  }
  let data;
  try {
    data = parseSimpleToml(fs.readFileSync(frameworkTomlPath, 'utf-8'));
  } catch (err) {
    errors.push(`${frameworkTomlPath}: TOML parse error — ${err.message}`);
    return [errors, warnings];
  }
  const tools = data.tools;
  if (tools && typeof tools === 'object' && !Array.isArray(tools) && Object.keys(tools).length > 0) {
    const names = Object.keys(tools).sort().join(', ');
    errors.push(`${frameworkTomlPath}: framework layer must not declare [tools.*] (found: [tools.${names}]) — \`[tools.<name>]\` is a project-layer concern only; framework.* cannot override it (config/SCHEMAS.md § 2.6).`);
  }
  return [errors, warnings];
}

function checkF() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(BUILD_REGISTRY_SCRIPT)) {
    warnings.push(`${path.relative(REPO_ROOT, BUILD_REGISTRY_SCRIPT)}: script not found`);
    return [errors, warnings, ''];
  }

  let output = '';
  try {
    output = execSync(`node "${BUILD_REGISTRY_SCRIPT}" --dry-run`, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 60000
    });
  } catch (err) {
    if (err.status !== undefined && err.status !== 0) {
      errors.push(`build-registry.js exited with code ${err.status}`);
      output = (err.stdout || '') + '\n' + (err.stderr || '');
    } else {
      errors.push(`build-registry.js invocation failed: ${err.message}`);
      return [errors, warnings, ''];
    }
  }

  const lines = output.split('\n');
  for (const line of lines) {
    if (line.includes('WARN')) {
      warnings.push(`build-registry: ${line.trim()}`);
    }
  }

  return [errors, warnings, output];
}

// --- reporting --------------------------------------------------------------

function printCheck(title, errors, warnings) {
  console.log(`\n=== ${title} ===`);
  if (errors.length === 0 && warnings.length === 0) {
    console.log('  (no findings)');
    return;
  }

  for (const e of errors) {
    console.log(`  ERROR  ${e}`);
  }
  for (const w of warnings) {
    console.log(`  WARN   ${w}`);
  }
}

function toMarkdown(title, errors, warnings) {
  const parts = [`## ${title}`, ''];

  if (errors.length === 0 && warnings.length === 0) {
    parts.push('_No findings._');
  } else {
    if (errors.length > 0) {
      parts.push(`### Errors (${errors.length})\n`);
      parts.push(...errors.map(e => `- \`${e}\``));
      parts.push('');
    }
    if (warnings.length > 0) {
      parts.push(`### Warnings (${warnings.length})\n`);
      parts.push(...warnings.map(w => `- \`${w}\``));
      parts.push('');
    }
  }

  return parts.join('\n') + '\n';
}

// --- main -------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const summaryMdIdx = args.indexOf('--summary-md');
  const summaryMd = summaryMdIdx >= 0 ? args[summaryMdIdx + 1] : null;

  const projectTomlIdx = args.indexOf('--project-toml');
  const projectTomlPath = projectTomlIdx >= 0 ? args[projectTomlIdx + 1] : null;

  const crossCuttingIdx = args.indexOf('--cross-cutting-artifact');
  const crossCuttingPath = crossCuttingIdx >= 0 ? args[crossCuttingIdx + 1] : null;

  const frameworkTomlIdx = args.indexOf('--framework-toml');
  const frameworkTomlPath = frameworkTomlIdx >= 0 ? args[frameworkTomlIdx + 1] : null;

  if (frameworkTomlPath) {
    console.log(`validate.js — framework-layer guardrail check against ${frameworkTomlPath}`);
    const [kErr, kWarn] = checkToolsLayer(frameworkTomlPath);
    printCheck('Check K — framework-layer [tools.*] guardrail', kErr, kWarn);
    console.log('\n=== Summary ===');
    console.log(`  errors:   ${kErr.length}`);
    console.log(`  warnings: ${kWarn.length}`);
    return kErr.length > 0 ? 1 : 0;
  }

  if (projectTomlPath) {
    const ptoml = projectTomlPath;
    const artifact = crossCuttingPath;

    console.log(`validate.js — SoD fixture check against ${ptoml}`);
    if (artifact) {
      console.log(`  cross-cutting artifact: ${artifact}`);
    }

    const [sodErr, sodWarn] = checkSod(ptoml, artifact);
    printCheck('Check I — SoD rules (project.toml)', sodErr, sodWarn);

    console.log('\n=== Summary ===');
    console.log(`  errors:   ${sodErr.length}`);
    console.log(`  warnings: ${sodWarn.length}`);

    return sodErr.length > 0 ? 1 : 0;
  }

  console.log(`validate.js — running deeper cross-checks against ${REPO_ROOT}`);

  const [aErr, aWarn] = checkA();
  const [bErr, bWarn] = checkB();
  const [cErr, cWarn] = checkC();
  const [dErr, dWarn] = checkD();
  const [eErr, eWarn] = checkE();
  const [gErr, gWarn] = checkG();
  const [hErr, hWarn] = checkH();
  const [jErr, jWarn] = checkJ();
  const [fErr, fWarn, fOut] = checkF();

  const titles = [
    'Check A — composition/block cross-references',
    'Check B — workflow-graph resolution',
    'Check C — description discipline',
    'Check D — stale \'phase\' language',
    'Check E — block frontmatter integrity',
    'Check G — elicitation-pattern resolution',
    'Check H — RE skill output-structure binding',
    'Check J — write-discipline binding (create-* skills)',
    'Check F — build-registry.js output',
  ];

  const bundles = [
    [aErr, aWarn], [bErr, bWarn], [cErr, cWarn], [dErr, dWarn],
    [eErr, eWarn], [gErr, gWarn], [hErr, hWarn], [jErr, jWarn],
    [fErr, fWarn],
  ];

  for (let i = 0; i < titles.length; i++) {
    printCheck(titles[i], bundles[i][0], bundles[i][1]);
  }

  const totalErrors = bundles.reduce((sum, [e]) => sum + e.length, 0);
  const totalWarnings = bundles.reduce((sum, [, w]) => sum + w.length, 0);

  console.log('\n=== Summary ===');
  console.log(`  errors:   ${totalErrors}`);
  console.log(`  warnings: ${totalWarnings}`);

  if (summaryMd) {
    const outPath = summaryMd;
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const verdict = totalErrors === 0 ? 'PASS (no errors)' : `FAIL (${totalErrors} errors)`;
    const rec = totalErrors === 0
      ? '**Proceed to task #9 (archive legacy folders).** No hard errors detected. Soft warnings are advisory and can be triaged after archiving.'
      : '**Hold task #9.** Address the hard errors above first, then re-run `scripts/validate.js`.';

    const rows = bundles.map((bundle, i) => {
      const label = titles[i].replace('Check ', '').replace(' — ', ' — ');
      return `| ${label} | ${bundle[0].length} | ${bundle[1].length} |`;
    }).join('\n');

    const sections = [
      '# A.I.D.E. — Validation Report (task #8)',
      '',
      '_Generated by `scripts/validate.js`. Re-run after every skill add/move/rename, after authoring or editing compositions or blocks, and as the final readiness check before each archive operation._',
      '',
      '## Executive summary',
      '',
      `- **Verdict:** ${verdict}`,
      `- **Total errors:** ${totalErrors}`,
      `- **Total warnings:** ${totalWarnings}`,
      '',
      '| Check | Errors | Warnings |',
      '|---|---|---|',
      rows,
      '',
      toMarkdown(titles[0], aErr, aWarn),
      toMarkdown(titles[1], bErr, bWarn),
      toMarkdown(titles[2], cErr, cWarn),
      toMarkdown(titles[3], dErr, dWarn),
      toMarkdown(titles[4], eErr, eWarn),
      toMarkdown(titles[5], gErr, gWarn),
      toMarkdown(titles[6], hErr, hWarn),
      toMarkdown(titles[7], jErr, jWarn),
      '## Check F — build-registry.js output',
      '',
    ];

    if (fErr.length > 0 || fWarn.length > 0) {
      if (fErr.length > 0) {
        sections.push(`### Errors (${fErr.length})\n`);
        sections.push(...fErr.map(e => `- \`${e}\``));
        sections.push('');
      }
      if (fWarn.length > 0) {
        sections.push(`### Warnings (${fWarn.length})\n`);
        sections.push(...fWarn.map(w => `- \`${w}\``));
        sections.push('');
      }
    } else {
      sections.push('_No findings._\n');
    }

    sections.push('### Raw output', '', '```', fOut.trim() || '(empty)', '```', '');
    sections.push(
      '## Open items',
      '',
      '- Six RE compositions ship with `blocks: []` by design (re-api-consumer, re-api-framework-internal, re-mobile-app-consumer, re-mobile-framework-internal, re-ui-framework-internal, re-web-app-consumer); blocks for these compositions are TBD and the corresponding source block subdirectories are intentionally empty.',
      '- The `kb-instance` value used in several KB block `applies-to` fields is an alias for the actual composition `kb-instance-root` (intentional — see `kb-instance-root.yaml` notes). Aliased automatically by the validator.',
      '- All Check D findings (if any) under `.agents/skills/planning/**/canonical-increment-shape*.md`, `.agents/skills/planning/**/review-workflow.md`, `.agents/skills/planning/create-implementation-package/references/OVERVIEW.md`, and `templates/blocks/planning/README.md` are intentional historical references documenting the PHASE→INC migration mapping; they are accepted as soft warnings.',
      '- Description discipline (Check C) is heuristic; flagged items merit human judgement, not automatic rejection.',
      '- The phase-language sweep (Check D) skips legacy folders (`_archive/`, `_bmad/`, `_shared/`, `implementation-execution/`, `implementation-planning/`, `model-2-sdlc-skills/`, `requirements-package/`, top-level `reverse-engineering/`, `solution-design-package/`) which task #9 will archive.',
      '',
      '## Recommendation',
      '',
      rec,
      '',
      '## When to re-run',
      '',
      'Re-run `scripts/validate.js --summary-md <path>` after every skill add/move/rename, after authoring or editing compositions or blocks, and as the final readiness check before each archive operation.',
      '',
    );

    fs.writeFileSync(outPath, sections.join('\n'), 'utf-8');
    console.log(`\nWrote markdown report: ${outPath}`);
  }

  return totalErrors > 0 ? 1 : 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  parseFrontmatter,
  checkA,
  checkB,
  checkC,
  checkD,
  checkE,
  checkF,
  checkG,
  checkH,
  checkJ,
  checkSod
};
