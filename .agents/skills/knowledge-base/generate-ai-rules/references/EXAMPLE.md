# generate-ai-rules — Worked Example

## Scenario

Continuing from `capture-solution-context`'s ACME Checkout example. The
solution context layer is now in place (six leaves under
`<KB>/shared/solution-context/`). The team is about to start a feature
on `api-orders` and the engineering lead wants `project-context.md` in
place so the AI agents working the feature have explicit guardrails.

## Inputs (state on disk before running)

```
acme-kb/
├── source-docs/{api-orders,api-billing,web-portal}/{part-a/, part-b/}
├── components/                         # 14 components
├── shared/
│   ├── solution-context/                # 6 leaves
│   ├── entities/, cross-cutting/, adrs/
│   └── ai-rules/                        # empty
├── ARCHITECTURE.md, graph.json, glossary.md
```

`30-constraints-and-compliance.md` § 5 (Architectural prohibitions)
states:
- "Never log card data; PCI scope must remain narrow."
- "Never call the legacy mainframe-billing service directly; route via
  api-billing's published API."
- "Never use eval / Function constructor anywhere in api-orders or
  web-portal."

## Step-by-step trace

### Step 01 — Auto-derive from RE

For each repo:
- `api-orders` (Node/TypeScript/Nest): TypeScript 5.4.5, NestJS 10.3.7,
  Jest 29.7, ESLint airbnb-typescript, pnpm; build = `pnpm build`,
  test = `pnpm test`, dev = `pnpm dev`.
- `api-billing` (.NET 8): C# 12 / .NET 8.0.4, xUnit 2.7.1, FluentValidation
  11.9.1, dotnet CLI; build = `dotnet build`, test = `dotnet test`.
- `web-portal` (React/Vite): TypeScript 5.4.5, React 18.2.0, Vite 5.2.10,
  Vitest 1.6.0, ESLint airbnb; build = `pnpm build`, test = `pnpm test`.

Auto-fills § 1 (tech stack table). Notes pre-divergence flag: 2 repos
on TS+pnpm, 1 on C#+dotnet — divergence likely.

### Step 02 — Elicit unobvious rules

Engineering lead provides:
- "Always use Nest's `class-validator` for request DTOs in api-orders;
  never write hand-rolled validators."
- "Never use barrel `index.ts` re-exports — circular-import detection
  is slow and we've had 3 incidents."
- "All Jest test files live next to the source as `*.spec.ts`; never
  under a separate `tests/` tree."
- "All public api-orders endpoints must declare an `@ApiOperation`
  swagger decorator; the OpenAPI build fails otherwise."
- "Mocks: prefer real test fixtures over `jest.mock` for our own
  modules; reserve `jest.mock` for third-party packages."
- "Branch naming: `<initials>/<feature-id>-short-slug`. Commits follow
  conventional commits."
- "Errors: never throw `Error`; use `BusinessRuleViolation` from
  `@acme/core-errors`. Map at the controller layer to HTTP status."

### Step 03 — Emit (with divergence check)

Divergence check fires:
- Test framework: Jest vs Vitest vs xUnit — different families.
- Package manager: pnpm vs dotnet CLI — different.
- Public-API decorator rule: `@ApiOperation` is Nest-specific, does
  not apply to web-portal or api-billing.

Decision: emit one canonical doc with conditional sections ("In Node
repos, …; in .NET repos, …") AND one per-repo override for `api-billing`
covering the .NET-specific rules that do not fit cleanly in
conditionals (FluentValidation behaviour, async cancellation tokens).

### Step 04 — Cross-link

Adds § 9 with forward links:
- Operations: `<KB>/shared/operations/30-runbooks-and-oncall.md` — refers
  to checkout-oncall rotation captured in solution context.
- Solution context: `<KB>/shared/solution-context/30-constraints-and-
  compliance.md` § 5 — copies the must-nots into § 8 verbatim and
  back-links.
- ADRs: links to existing `<KB>/shared/adrs/` index.

## Output

```
<KB>/shared/ai-rules/
├── project-context.md          # 274 lines, 9 sections
└── per-repo/
    └── api-billing.md          # 38 lines; .NET-specific overrides
```

`project-context.md` frontmatter `divergence_overrides: [api-billing]`.

## Hand-off

Validation passes (length 274/300 lines, all sections present, all
auto-derived versions match lock-file evidence, § 8 mirrors solution-
context § 5). Hand-off to `document-operations`.
