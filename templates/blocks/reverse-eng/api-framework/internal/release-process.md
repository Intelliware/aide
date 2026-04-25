---
slug: release-process
title: "Release Process"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 270
---

## 17. Release Process

Document how a release is planned, cut, validated, and published, plus how regressions are mitigated. Maintainers need a written process to avoid one-off releases that drift from policy. Verify by walking through the most recent release against this block — gaps usually indicate undocumented tribal knowledge.

Cover the cadence (regular vs. on-demand), the versioning policy (semver, calver, or hybrid), the changelog discipline, and the rollback procedure. Note specifically what triggers a major bump — see compatibility-strategy block for the contract definition.

### Suggested template content

**Versioning policy:** {{policy — e.g. "semver: MAJOR.MINOR.PATCH; date-based for API versions per consumer block"}}

**Cadence:**

- Patch: as needed; aimed for within {{patch-target}} of merged fix.
- Minor: roughly {{minor-cadence}}.
- Major: planned, ≥ {{major-leadtime}} of advance notice.

**Pre-release channels:**

| Channel | Tag | Audience |
|---|---|---|
| `next` | npm dist-tag `next` | Internal, plugin authors |
| `rc` | `vX.Y.0-rc.N` | Public preview |
| `latest` | default | Production |

**Release pipeline:**

1. Cut release branch from `main`: `release/vX.Y`.
2. Run `pnpm release:check` (build, typecheck, full test, attw / publint, license scan).
3. Update `CHANGELOG.md` (see changelog block).
4. Bump version (`pnpm version <bump>`), produce git tag.
5. Push tag → CI runs identical pipeline + publishes.
6. Publish: `npm publish --provenance`.
7. Create GitHub release with changelog excerpt.
8. Announce: deprecation list, blog (major only), Slack (`#framework-releases`).

**Source files:**

- Release scripts: `{{path}}`
- Changelog automation: `{{path}}`
- CI release pipeline: `{{path}}`

**Changelog discipline:**

- Every PR adds a changelog fragment (`changesets`, conduit, etc.).
- Fragment classifies the change as: breaking / feature / fix / docs / internal.
- Release script aggregates fragments into `CHANGELOG.md`; missing fragments block the release.

**Rollback procedure:**

- `npm dist-tag add framework@<previous> latest` reverts the default install.
- Yanking (`npm deprecate`) for security-critical regressions only.
- A patch release is preferred to yanking when feasible.

**Hotfix flow:**

1. Branch from the affected release tag, not from `main`.
2. Cherry-pick or write the fix.
3. Run the full pipeline.
4. Cut a patch release.
5. Forward-port to `main` immediately; do not let the branches diverge.

**Provenance and supply chain:**

- All publishes use `--provenance` (or ecosystem equivalent) to attest the build source.
- The release CI runs in a hardened environment with no developer SSH access.
- Signing keys stored in {{secret-store}}; rotated per {{rotation-cadence}}.

**Plugin compatibility:**

- Each release CI job builds + tests every first-party plugin against the new core.
- Plugin breakages block the release.
- For breaking core changes, plugins are updated in lockstep (see compatibility-strategy block).

**Public communication:**

- GitHub release notes: every release.
- Blog post: major + headline-feature minors.
- Migration guide: every major; written before code freeze.

**Common pitfalls:**

- Cutting a release with uncommitted changes — release script blocks this.
- Forgetting to forward-port a hotfix — main diverges and the fix gets lost.
- Publishing before the changelog merges — discrepancy between npm and GitHub.

**Cross-references:**

- See compatibility-strategy block for what counts as breaking.
- See build-and-packaging block for the build pipeline that the release process invokes.
