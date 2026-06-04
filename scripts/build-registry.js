#!/usr/bin/env node
/**
 * build-registry.js — Generate the skill registry artifacts for A.I.D.E.
 *
 * Purpose
 * -------
 * Walks every `.agents/skills/** /SKILL.md` file under the repo root, parses each
 * file's YAML frontmatter, validates a small set of structural invariants, and
 * emits two machine-readable artifacts the rest of the framework consumes:
 *
 *     .agents/skills/_registry/skills.csv     (header + one row per skill)
 *     .agents/skills/_registry/skills.json    (same data, JSON shape)
 *
 * When to run
 * -----------
 * After ANY of the following:
 *   - Adding a new skill (new SKILL.md created)
 *   - Removing or renaming a skill (folder rename / move between stages)
 *   - Editing SKILL.md frontmatter (`name` or `description` changed)
 *   - Adding/removing the references/ trio (OVERVIEW / INPUTS-OUTPUTS / EXAMPLE)
 *
 * The companion `.agents/skills/_registry/workflow-graph.yaml` is hand-authored
 * and is NOT touched by this script.
 *
 * Output paths
 * ------------
 *   .agents/skills/_registry/skills.csv
 *   .agents/skills/_registry/skills.json
 *
 * Both are repo-relative; the script resolves them against the repo root, which
 * is computed as the parent of this script's directory.
 *
 * Validation (warnings only, never fatal)
 * ---------------------------------------
 *   - Missing required frontmatter fields (`name`, `description`)
 *   - Mismatched folder name vs. `name` field
 *   - Missing references/ trio (OVERVIEW.md, INPUTS-OUTPUTS.md, EXAMPLE.md)
 *   - SKILL.md longer than 200 lines
 *
 * Exit codes
 * ----------
 *   0  success (warnings may have been printed)
 *   1  hard failure (no SKILL.md files found, write failure, etc.)
 *
 * Flags
 * -----
 *   --dry-run    Parse + validate + print summary; do not write files.
 *   --verbose    Print one line per skill as it is processed.
 *
 * This script depends only on Node.js built-in modules.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['name', 'description'];
const REFERENCE_FILES = ['OVERVIEW.md', 'INPUTS-OUTPUTS.md', 'EXAMPLE.md'];
const MAX_SKILL_LINES = 200;

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_ROOT = path.join(REPO_ROOT, '.agents', 'skills');
const REGISTRY_DIR = path.join(SKILLS_ROOT, '_registry');
const CSV_PATH = path.join(REGISTRY_DIR, 'skills.csv');
const JSON_PATH = path.join(REGISTRY_DIR, 'skills.json');

const CSV_COLUMNS = ['canonical_id', 'name', 'description', 'stage', 'package', 'path'];

/**
 * Parse the YAML frontmatter of a SKILL.md file.
 * Supports the narrow shape that SKILL.md files actually use:
 *   - File starts with a `---` line.
 *   - Frontmatter is closed by another `---` line.
 *   - Each entry is `key: value` on a single line.
 *   - Values may be bare strings, single-quoted, or double-quoted.
 *   - Values may run across continuation lines (indented lines appended to previous value).
 *   - List values (`key: [a, b, c]`) are returned as a comma-joined string.
 */
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
    // Never closed; treat as missing frontmatter
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
        const items = inner.split(',').map(p => unquote(p.trim())).filter(p => p);
        value = items.join(', ');
      }

      out[key] = value;
      lastKey = key;
    } else if (lastKey !== null) {
      // Continuation line: append to previous value
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

/**
 * Recursively find all SKILL.md files in a directory
 */
function findSkillFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findSkillFiles(fullPath, files);
    } else if (entry.name === 'SKILL.md') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Walk .agents/skills/** /SKILL.md and return one record per skill
 */
function discoverSkills(verbose = false) {
  if (!fs.existsSync(SKILLS_ROOT) || !fs.statSync(SKILLS_ROOT).isDirectory()) {
    console.error(`ERROR: skills directory not found at ${SKILLS_ROOT}`);
    process.exit(1);
  }

  const records = [];
  const skillFiles = findSkillFiles(SKILLS_ROOT).sort();

  for (const skillPath of skillFiles) {
    const rel = path.relative(REPO_ROOT, skillPath);
    const parts = rel.split(path.sep);
    
    // (".agents", "skills", "<stage>", "<skill>", "SKILL.md")
    // or (".agents", "skills", "<category>", "<skill>", "SKILL.md")
    if (parts.length < 5 || parts[0] !== '.agents' || parts[1] !== 'skills') {
      continue;
    }

    const stage = parts[2];
    if (stage.startsWith('_')) {
      continue; // skip _registry/, _archive/, etc.
    }

    const folder = parts[parts.length - 2];
    const text = fs.readFileSync(skillPath, 'utf-8');
    const fm = parseFrontmatter(text);

    records.push({
      stage,
      folder,
      frontmatter: fm,
      path: rel,
      absPath: skillPath,
      lineCount: text.split('\n').length
    });

    if (verbose) {
      console.log(`  parsed ${rel} (name=${fm.name || '<missing>'}, lines=${records[records.length - 1].lineCount})`);
    }
  }

  return records;
}

/**
 * Validate records and return array of warning messages
 */
function validate(records) {
  const warnings = [];

  for (const rec of records) {
    const { path: relPath, frontmatter: fm, folder, absPath, lineCount } = rec;

    // Check required frontmatter fields
    for (const field of REQUIRED_FIELDS) {
      if (!fm[field]) {
        warnings.push(`${relPath}: missing required frontmatter field '${field}'`);
      }
    }

    // Check name matches folder
    const name = fm.name || '';
    if (name && name !== folder) {
      warnings.push(`${relPath}: frontmatter name '${name}' does not match folder '${folder}'`);
    }

    // Check references/ directory and files
    const skillDir = path.dirname(absPath);
    const refsDir = path.join(skillDir, 'references');

    if (!fs.existsSync(refsDir) || !fs.statSync(refsDir).isDirectory()) {
      warnings.push(`${relPath}: missing references/ directory`);
    } else {
      for (const ref of REFERENCE_FILES) {
        if (!fs.existsSync(path.join(refsDir, ref))) {
          warnings.push(`${relPath}: references/ missing required file '${ref}'`);
        }
      }
    }

    // Check SKILL.md length
    if (lineCount > MAX_SKILL_LINES) {
      warnings.push(`${relPath}: SKILL.md has ${lineCount} lines (>${MAX_SKILL_LINES})`);
    }
  }

  return warnings;
}

/**
 * Convert records to CSV row objects
 */
function toRows(records) {
  const rows = [];

  for (const rec of records) {
    const fm = rec.frontmatter;
    const canonicalId = fm.name || rec.folder;

    rows.push({
      canonical_id: canonicalId,
      name: canonicalId,
      description: fm.description || '',
      stage: rec.stage,
      package: '',
      path: rec.path
    });
  }

  // Sort by stage, then canonical_id
  rows.sort((a, b) => {
    if (a.stage !== b.stage) {
      return a.stage.localeCompare(b.stage);
    }
    return a.canonical_id.localeCompare(b.canonical_id);
  });

  return rows;
}

/**
 * Write CSV file
 */
function writeCsv(rows, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const lines = [];
  lines.push(CSV_COLUMNS.join(','));

  for (const row of rows) {
    const values = CSV_COLUMNS.map(col => {
      const value = row[col] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    lines.push(values.join(','));
  }

  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
}

/**
 * Write JSON file
 */
function writeJson(rows, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const payload = {
    version: 1,
    skills: rows
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log(`Scanning ${path.relative(REPO_ROOT, SKILLS_ROOT)}/ ...`);
  const records = discoverSkills(verbose);

  if (!records.length) {
    console.error('ERROR: no SKILL.md files found.');
    process.exit(1);
  }

  const warnings = validate(records);
  const rows = toRows(records);

  console.log();
  if (warnings.length) {
    console.log(`Validation warnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  WARN  ${w}`);
    }
  } else {
    console.log('Validation: no warnings.');
  }

  console.log();
  let filesWritten = 0;

  if (dryRun) {
    console.log(`DRY-RUN: would write ${rows.length} rows to:`);
    console.log(`  ${path.relative(REPO_ROOT, CSV_PATH)}`);
    console.log(`  ${path.relative(REPO_ROOT, JSON_PATH)}`);
  } else {
    writeCsv(rows, CSV_PATH);
    writeJson(rows, JSON_PATH);
    console.log(`Wrote ${path.relative(REPO_ROOT, CSV_PATH)}`);
    console.log(`Wrote ${path.relative(REPO_ROOT, JSON_PATH)}`);
    filesWritten = 2;
  }

  console.log();
  console.log('Summary:');
  console.log(`  skills found:        ${rows.length}`);
  console.log(`  validation warnings: ${warnings.length}`);
  console.log(`  files written:       ${filesWritten}`);

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { parseFrontmatter, discoverSkills, validate, toRows };
