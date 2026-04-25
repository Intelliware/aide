# Dependency Management Standards

## Purpose

These standards establish consistent practices for managing third-party dependencies across the software lifecycle. Proper dependency management ensures reproducible builds, minimizes supply chain risk, prevents license violations, and keeps the dependency tree healthy and up to date. These rules cover lock files, version pinning, security auditing, evaluation criteria, and ongoing maintenance.

## Applicability

These standards apply to all projects that consume third-party packages — including Node.js/TypeScript (npm, pnpm, yarn), Python (pip, Poetry), Ruby (Bundler), Go (modules), and JVM (Maven, Gradle) projects. The examples use npm/TypeScript conventions, but the principles apply to every package ecosystem.

## Rules

### DEP-01: Commit Lock Files

**Severity:** Error
**Rule:** Always commit lock files (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Gemfile.lock`, `poetry.lock`) to version control — never add them to `.gitignore`.
**Why:** Lock files ensure every developer and CI environment installs the exact same dependency tree, eliminating "works on my machine" failures caused by version drift.

**Compliant:**

```gitignore
# .gitignore
node_modules/
dist/
.env
```

```bash
# Lock file is tracked in git
git add package-lock.json
git commit -m "chore: update dependencies"
```

**Non-compliant:**

```gitignore
# .gitignore — lock file is excluded
node_modules/
package-lock.json
```

```bash
# Team members get different versions on every install
# CI builds are non-deterministic
npm install  # resolves versions differently each time
```

---

### DEP-02: Pin Exact Versions in Lock Files

**Severity:** Error
**Rule:** Use semver ranges in `package.json` (e.g., `^4.0.0`) but rely on the lock file to pin exact versions — install dependencies with deterministic commands (`npm ci`, `yarn install --frozen-lockfile`).
**Why:** Semver ranges allow controlled upgrades during development, but production and CI must use exact pinned versions from the lock file to guarantee reproducible builds.

**Compliant:**

```json
// package.json — semver ranges are fine here
{
  "dependencies": {
    "express": "^4.18.0",
    "zod": "^3.22.0"
  }
}
```

```bash
# CI pipeline — uses lock file as source of truth
npm ci  # fails if lock file is out of sync with package.json
```

**Non-compliant:**

```bash
# CI pipeline — ignores lock file, resolves versions at install time
npm install  # may install newer patch/minor versions than tested

# Or worse: lock file doesn't exist and every install is a gamble
```

```json
// package.json — exact pinning here defeats the purpose of semver
{
  "dependencies": {
    "express": "4.18.2",
    "zod": "3.22.4"
  }
}
```

---

### DEP-03: Audit Dependencies in CI

**Severity:** Error
**Rule:** Run a dependency audit (`npm audit`, `pip audit`, `bundle audit`, or equivalent) in the CI pipeline and fail builds on critical or high severity vulnerabilities.
**Why:** Known vulnerabilities in dependencies are a primary attack vector — automated auditing catches them before they reach production.

**Compliant:**

```yaml
# .github/workflows/ci.yml
- name: Audit dependencies
  run: npm audit --audit-level=high
```

```typescript
// package.json scripts
{
  "scripts": {
    "audit:ci": "npm audit --audit-level=high",
    "pretest": "npm run audit:ci"
  }
}
```

**Non-compliant:**

```yaml
# No audit step in CI — vulnerabilities ship to production undetected
- name: Install
  run: npm ci
- name: Test
  run: npm test
# Missing: npm audit
```

```bash
# Running audit manually "when someone remembers" is not a process
npm audit  # developer runs it once, forgets for 6 months
```

---

### DEP-04: Evaluate Dependency Health Before Adding

**Severity:** Warning
**Rule:** Before adding a new dependency, evaluate maintenance activity, documentation quality, community adoption, transitive dependency count, and type support — do not add unmaintained or abandoned packages.
**Why:** Every dependency is a long-term commitment; an unmaintained package becomes a liability when security patches are needed or the ecosystem moves forward.

**Compliant:**

```typescript
// Before adding a package, check:
// ✓ Last publish date: within 12 months
// ✓ Open issues / response time: maintainer is active
// ✓ Weekly downloads: >10k for niche, >100k for core utilities
// ✓ Transitive deps: fewer is better (check with `npm explain <pkg>`)
// ✓ TypeScript types: built-in or @types/ available
// ✓ License: compatible with project (see DEP-06)

// Good choice: well-maintained, focused, few transitive deps
import { z } from 'zod';  // built-in types, active maintenance, 0 deps
```

**Non-compliant:**

```typescript
// Adding a package without checking health signals
// Last commit: 3 years ago. Open issues: 200+. No TypeScript types.
import { parse } from 'abandoned-csv-parser';

// Adding a massive framework for a task a 20-line utility could handle
import _ from 'lodash';  // 400+ functions imported for _.get() alone
```

---

### DEP-05: Minimize Dependency Count

**Severity:** Warning
**Rule:** Prefer standard library functions or small focused packages over large frameworks for simple tasks — every dependency is a supply chain risk, a bundle size cost, and a maintenance obligation.
**Why:** Fewer dependencies mean a smaller attack surface, faster installs, simpler upgrades, and fewer breaking changes to absorb.

**Compliant:**

```typescript
// Use built-in Node.js APIs instead of a package
import { randomUUID } from 'node:crypto';
const id = randomUUID();

// Use a focused utility instead of a kitchen-sink library
import ms from 'ms';  // 0 dependencies, does one thing
const timeout = ms('5m');
```

**Non-compliant:**

```typescript
// Pulling in a large library for a single utility function
import { v4 as uuid } from 'uuid';  // unnecessary — node:crypto has randomUUID

// Importing an entire framework for one helper
import _ from 'lodash';
const value = _.get(obj, 'a.b.c');  // optional chaining does this: obj?.a?.b?.c
```

---

### DEP-06: Check License Compatibility

**Severity:** Error
**Rule:** All dependencies must have licenses compatible with your project's license — verify before adding and audit periodically with automated tooling.
**Why:** Incompatible licenses (e.g., GPL in a proprietary project) create legal exposure that can force code disclosure or require costly rewrites.

**Compliant:**

```bash
# Audit licenses with an automated tool
npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0"

# Or use a CI step
- name: Check licenses
  run: npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0"
```

```typescript
// Document approved licenses in the project
// allowed-licenses.json
{
  "allowedLicenses": ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]
}
```

**Non-compliant:**

```bash
# No license checking — a GPL dependency slips into a proprietary codebase
npm install cool-library  # license: GPL-3.0 — forces entire project to be GPL

# Assuming "it's on npm so it must be fine"
# Many npm packages have no license (all rights reserved by default)
```

---

### DEP-07: Update Dependencies Regularly

**Severity:** Warning
**Rule:** Apply minor and patch updates monthly, evaluate major updates quarterly, and never let any dependency fall more than two major versions behind the latest release.
**Why:** Stale dependencies accumulate security vulnerabilities, miss performance improvements, and make eventual upgrades exponentially harder — small frequent updates are safer than rare big-bang migrations.

**Compliant:**

```bash
# Monthly: check for and apply minor/patch updates
npx npm-check-updates --target minor -u
npm install
npm test

# Quarterly: review major version updates
npx npm-check-updates --target latest
# Evaluate changelogs, test thoroughly, update one major at a time
```

```yaml
# Automated PR creation for dependency updates (Dependabot, Renovate)
# renovate.json
{
  "schedule": ["every weekend"],
  "packageRules": [
    { "matchUpdateTypes": ["minor", "patch"], "automerge": true },
    { "matchUpdateTypes": ["major"], "automerge": false }
  ]
}
```

**Non-compliant:**

```json
// package.json — dependencies last updated 2 years ago
{
  "dependencies": {
    "express": "^3.0.0",
    "react": "^16.8.0",
    "typescript": "^4.0.0"
  }
}
// express 3 → 5 is a painful multi-major migration
// react 16 → 19 requires rewriting class components
// typescript 4 → 5 has accumulated breaking changes
```

---

### DEP-08: Remove Unused Dependencies

**Severity:** Warning
**Rule:** Run `depcheck`, `knip`, or an equivalent tool regularly and remove dependencies that are no longer imported — unused dependencies should not remain in `package.json`.
**Why:** Unused dependencies increase install time, bundle size, and attack surface while adding noise to audit reports and upgrade efforts.

**Compliant:**

```bash
# Run depcheck to find unused dependencies
npx depcheck

# Output:
# Unused dependencies:
#   moment
#   lodash
# Remove them
npm uninstall moment lodash
```

```yaml
# Add to CI as a check
- name: Check for unused dependencies
  run: npx knip --no-exit-code
```

**Non-compliant:**

```json
// package.json — moment was replaced by date-fns months ago but never removed
{
  "dependencies": {
    "date-fns": "^3.0.0",
    "moment": "^2.29.0",
    "lodash": "^4.17.0"
  }
}
// moment and lodash are not imported anywhere
// They still get installed, audited, and upgraded for no reason
```

## Customization

- **DEP-07 (Update cadence)** varies significantly by risk tolerance and release velocity. High-compliance environments (fintech, healthcare) may require faster patching cycles for security updates while being more conservative with feature updates. Startups with rapid iteration may merge minor updates more aggressively. The "no more than 2 major versions behind" threshold can be adjusted — some teams use 1 for critical libraries and 3 for stable, low-risk ones.

- **DEP-05 (Minimize dependency count)** is intentionally subjective. What constitutes "too many dependencies" is team-dependent — a 5-person startup may tolerate a larger dependency tree to ship faster, while a security-sensitive enterprise project may enforce strict thresholds. The key principle is that each dependency should be a conscious choice, not an unconsidered default.

- **DEP-03 (Audit severity threshold)** can be adjusted from `high` to `critical`-only for teams that find high-severity audit failures too noisy (many npm audit findings are disputed or low-impact in context). Conversely, security-critical applications may fail on `moderate` and above. The important thing is that _some_ automated audit runs in CI — the exact threshold is a team decision.
