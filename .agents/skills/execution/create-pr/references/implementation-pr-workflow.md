# Implementation PR Workflow

Sequential procedure the skill follows to package a working tree into a
reviewed, committed PR. **Execute one step at a time.** Wait for explicit
user approval at the gates marked GATE.

## Steps

```
1. DIFF REVIEW (4 lenses)              → review report
       │
       ▼
   1a. FIX CYCLE                       → clean working tree
       Fix Critical/Important
       findings; re-run tests;
       re-review if Critical existed
       │
       ▼
2. COMMIT CREATION       (GATE)        → atomic commits
       Wait for user approval
       │
       ▼
3. PR DESCRIPTION                      → PR body draft
       │
       ▼
4. PR CREATION           (GATE)        → PR URL
       Wait for user approval; run gh pr create
       │
       ▼
5. CHANGELOG ENTRY (conditional)        → CHANGELOG.md updated
       Only if project maintains a changelog
```

## Step 1 — Diff Review (four lenses)

Apply lenses **in order**. Each lens reads different context and finds
different classes of issues.

### Lens 1 — Blind review

Read **only** the diff. Surface anything that looks wrong, unclear, or
fragile based purely on the code changes. Don't read the spec or
standards yet.

### Lens 2 — Spec compliance

Read the increment file (if applicable), the FRs the diff maps to, and the
design sections the diff realizes. Re-review the diff for:

- Gaps between spec and implementation
- Missing edge cases the spec calls out
- Acceptance criteria not covered by tests

### Lens 3 — Standards compliance

Read `_assets/standards/` (common, language, framework). Re-review the
diff for rule violations. Standards are the gold standard; existing
codebase patterns that deviate are not acceptable precedent.

### Lens 4 — Codebase integration

Read `project-context.md` (if present) and the surrounding files. Review
for convention drift, naming inconsistencies, and integration issues that
the diff alone cannot reveal.

### Severity tagging

Each finding gets a severity:

- **Critical** — blocks commit. Defect, spec gap, security issue, broken
  contract.
- **Important** — should be fixed before commit. Standards violation,
  missing test, convention drift in a hot area.
- **Minor** — fix if easy; otherwise note in PR body.

### Zero findings rule

A review that finds zero issues across all four lenses is suspicious. Re-
analyze: was the diff trivial? Did the lenses run? Are there blind spots?
Make this challenge explicit before claiming review pass.

## Step 1a — Fix Cycle

Fix all Critical findings. Fix all Important findings unless the user
explicitly accepts them as documented risk. Fix Minor findings only if
trivial.

After fixes:

- Re-run the project's test suite
- Re-run review lenses 1-3 if any Critical fix changed code in their
  scope
- Re-confirm clean before proceeding to Step 2

## Step 2 — Commit Creation (GATE)

Group the diff into atomic commits. **One logical change per commit.**
Determine the conventional commit type for each:

| Type | When |
|---|---|
| `feat` | New capability |
| `fix` | Defect fix |
| `refactor` | No behavior change |
| `test` | Test-only change |
| `docs` | Docs-only change |
| `chore` | Tooling, deps |
| `perf` | Performance |
| `build` / `ci` | Build / CI |
| `style` | Formatting / style |

Commit message body explains **why**, not **what** (the diff is the
what).

Every commit ends with traceability footers:

```
Implements: INC-XXX
Traceability: FR-A.B.C, FR-A.B.D
```

(Omit footers when the commit is genuinely outside the increment scope —
e.g., a chore commit fixing a typo.)

**GATE:** Present the proposed commit list to the user. Wait for explicit
"approve / edit / no". Never run `git commit` without authorization.

## Step 3 — PR Description

Generate from commit history and diff. Required sections:

- **Summary** — 2-4 bullets
- **Increments / FRs implemented** — links / IDs
- **Changes** — by area
- **Test Plan** — commands run + their pass status; manual verification
  items from Human Gate (if applicable)
- **Risks / open items** — anything reviewers should focus on
- **Related** — requirements, design, implementation package links

## Step 4 — PR Creation (GATE)

**GATE:** Confirm PR target (base branch, repo). Wait for explicit user
approval before running any PR creation command.

### Detect the git host and pick the right tool

Before running anything, probe the remote URL and available CLIs:

```
git remote get-url origin
```

Then follow this decision table:

| Remote URL pattern | Preferred tool | Fallback |
|---|---|---|
| `github.com` | `gh pr create` | browser URL |
| `dev.azure.com` or `visualstudio.com` | `az repos pr create` | browser URL |
| `gitlab.com` or self-hosted GitLab | browser URL | — |
| `bitbucket.org` | browser URL | — |
| Other / unknown | browser URL | — |

### GitHub (`gh pr create`)

Probe first: `gh auth status`. If authenticated, run:

```
gh pr create \
  --base <target-branch> \
  --title "<title>" \
  --body "<description>"
```

If `gh` is absent or not authenticated, fall through to the browser URL fallback.

### Azure DevOps (`az repos pr create`)

Probe first: `az --version`. If present, ensure the DevOps extension is
installed (`az extension add --name azure-devops` — idempotent) and the
user is logged in (`az account show`). If not logged in, instruct the
user to run `az login` then retry. Once authenticated, run:

```
az repos pr create \
  --project "<ADO project name>" \
  --repository "<repo name>" \
  --source-branch <source-branch> \
  --target-branch <target-branch> \
  --title "<title>" \
  --description "<description>"
```

The `--project` and `--repository` values can be derived from the remote
URL. For `https://dev.azure.com/ORG/PROJECT/_git/REPO` or
`git@ssh.dev.azure.com:v3/ORG/PROJECT/REPO`, extract `PROJECT` and `REPO`
directly from the URL segments.

If `az` is absent, fall through to the browser URL fallback.

### Browser URL fallback

When no CLI is available or authenticated, construct the platform's
PR-creation URL and present it to the user:

- **GitHub:** `https://github.com/<owner>/<repo>/compare/<target>...<source>?expand=1`
- **Azure DevOps:** `https://dev.azure.com/<org>/<project>/_git/<repo>/pullrequestcreate?sourceRef=<source>&targetRef=<target>`
- **GitLab:** `https://gitlab.com/<owner>/<repo>/-/merge_requests/new?merge_request[source_branch]=<source>&merge_request[target_branch]=<target>`

Provide the full URL and the PR description text so the user can paste it
into the browser form.

Capture the PR URL from CLI output (if a CLI was used) and report it.

## Step 5 — Changelog Entry (conditional)

Only if the project maintains a changelog (e.g., `CHANGELOG.md`,
`CHANGES.md`). Append an entry under the unreleased section using the
project's conventions (Keep a Changelog, Conventional Changelog, or
project-specific). Reference the PR number.

## Output

- Adversarial review findings (chat)
- Clean working tree (Critical findings resolved)
- Atomic commits in git history
- PR description
- PR URL
- Changelog entry (if applicable)
