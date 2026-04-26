# reverse-engineer-ui-framework — Worked Example

## Scenario

User has an Angular 17 design-system at `~/code/orderhub-ds` v4.2.0, used by 3 apps (web portal, admin tool, partner portal). Provides ~40 components, 8 services, 12 directives, 4 pipes, design tokens, and theming.

User says: *"Document the design system at ~/code/orderhub-ds."*

## Stage 1 — Discovery and Inventory

```
Host framework: Angular 17, TypeScript, SCSS
Components (public): 40 (Button, Input, Select, Modal, Toast, Table, ...)
Services (public): 8 (ThemeService, ToastService, ModalService, BreakpointService, ...)
Directives (public): 12 (FocusTrap, ClickOutside, Tooltip, Resize, ...)
Pipes (public): 4 (Currency, RelativeDate, FileSize, Truncate)
DI tokens (public): 6 (THEME, BREAKPOINTS, ICON_SET, LOCALE, NOTIFICATION_BUS, FEATURE_FLAGS)
Design tokens: 230 across colors, spacing, typography, motion, elevation, radius
Theming: CSS custom properties + ThemeService for runtime switch
Internal-only utilities: ~25 (omitted from Part B)
```

`steps/scaffold.md` proposes Part A as 12 files under `docs/ui-framework-internal/` and Part B as a single `ui-framework-consumer.md`. User approves.

## Stage 2 — Foundation

Documents:
- Philosophy: "Composition over configuration; tokens as contract; opt-in advanced behavior."
- Architecture: standalone components, no NgModules; barrel exports by category.
- Theming: `--ds-color-*`, `--ds-space-*`, runtime swap via `ThemeService.applyTheme(name)`.
- Shared types: `Size = 'sm' | 'md' | 'lg'`, `Variant = 'primary' | 'secondary' | 'ghost' | 'danger'`.

## Stage 3 — Component-by-Component Extraction

For each component, e.g. `Button`:

- **Source verification:** read `button.component.ts`, `.html`, `.scss`, `.spec.ts`.
- **Inputs documented:**
  - `variant: Variant` — default `'primary'` (verified from `@Input() variant: Variant = 'primary'`)
  - `size: Size` — default `'md'`
  - `disabled: boolean` — default `false`
  - `loading: boolean` — default `false`
  - `iconStart?: string` — default `undefined`
  - `iconEnd?: string` — default `undefined`
  - `fullWidth: boolean` — default `false`
- **Outputs documented:**
  - `clicked: EventEmitter<MouseEvent>` (verified from class)
- **Slots documented:** default content projection (rendered inside `<button>`)
- **Methods documented:** `focus()`, `blur()` — verified as public class methods

Subset rule check: every Part B fact (variant enum, default values, output type, slot, methods) is also in Part A. Pass.

Repeat for all 40 components.

## Stage 4 — Services, Directives, Patterns

- **ToastService:** `show({ message, type?, duration? })`. Default `type='info'`, default `duration=4000`. Verified.
- **FocusTrap directive:** `[dsFocusTrap]` boolean — when set, traps Tab cycle within element.
- **Recipe:** "Build a confirmation dialog" using `ModalService.open(ConfirmDialogComponent, { data })`.
- **Anti-pattern:** "Don't render Toast inside a Modal; the Modal portal removes it from the global toast outlet."

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: 40/40 components, 8/8 services, 12/12 directives, 4/4 pipes, 6/6 tokens. Pass.
- Accuracy: spot-checked 6 components. 2 failures: 
  - `Modal` documented `closeOnEscape: boolean` default `true`, but actual default is `false`. Corrected.
  - `Toast` documented `duration` in milliseconds — correct, but Part B example showed seconds. Corrected.
- Consistency / Subset: every Part B item in Part A. Pass.
- Domain checks: design tokens documented match exports; philosophy section in Part B; theming guide present. Pass.

Verification report: 2 failures, 0 warnings. GO after corrections.

## Outputs

```
~/code/orderhub-ds/docs/ui-framework-internal/      ← Part A
  ├── 01-framework-overview.md
  ├── 02-philosophy-and-design-intent.md
  ├── 03-architecture.md
  ├── 04-theming-internals.md
  ├── ... (8 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-ui-fw/
  └── ui-framework-consumer.md                      ← Part B
```

## Hand-off

> "Reverse-engineering of orderhub-ui-fw is complete. Next, run `build-knowledge-base` to aggregate Part B into the central KB index."
