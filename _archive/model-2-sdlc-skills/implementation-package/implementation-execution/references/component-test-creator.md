# Component Test Creator

## Purpose

Generate component tests for UI elements — render validation, user interaction simulation, state changes, and accessibility checks.

## What This Does

Produces component tests for UI elements — verifying that components render correctly, respond to user interactions, manage state properly, and meet accessibility requirements. These tests exercise a component's behavior from the user's perspective without requiring a full browser or end-to-end setup.

This skill sits between unit tests (which test logic in isolation) and E2E tests (which test full user flows). Component tests verify that a UI component works correctly as a self-contained unit of user interface.

## When to Use

- When the implementation plan includes frontend/UI phases
- For any component that has user interaction (forms, buttons, toggles, modals)
- For components with conditional rendering (loading states, error states, empty states)
- For components that manage local state or consume shared state
- When accessibility standards require verification at the component level

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Component under test | The UI component to test | Yes |
| Component behavior spec | From the implementation plan — expected rendering, interactions, states | Yes |
| Accessibility testing standards | `../assets/standards/common/testing/accessibility-testing.md` | Yes |
| Framework testing standards | `../assets/standards/frameworks/{framework}/testing.md` (React, Angular, Next.js) | Yes |
| Testing stack versions | From codebase analysis (Section 0 + Section 5) — exact versions of test runner (Jest/Vitest), Testing Library, user-event library, and any component test infrastructure | Yes |
| Existing component test files | The codebase's current component test patterns | Yes |
| Project context | `project-context.md` — UI framework, testing library | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPONENT TEST CREATOR — SEQUENCE                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANALYZE — Understand the component's behavior                │
│     What does it render? How does a user interact with it?       │
│                                                                  │
│  2. SCENARIOS — Map the test scenarios                           │
│     Render states, interactions, accessibility, error states     │
│                                                                  │
│  3. PATTERN — Match the project's component testing conventions  │
│     Testing Library, enzyme, framework-specific patterns         │
│                                                                  │
│  4. GENERATE — Write the tests                                   │
│     Query by role/label, simulate user actions, assert visible   │
│     outcomes                                                     │
│                                                                  │
│  5. VALIDATE — Check component test quality                      │
│     Tests user behavior, not implementation details              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Analyze the Component

Understand the component's interface with the user:

| Element | Question |
|---------|----------|
| **Props/Inputs** | What data does the component receive? Required vs optional? |
| **Rendered output** | What does the user see? Text, images, form fields, lists? |
| **User interactions** | What can the user do? Click, type, select, drag, scroll? |
| **State changes** | What changes in response to interaction? Visual changes, form validation, loading states? |
| **Conditional rendering** | When is content shown/hidden? Loading, error, empty, authenticated/unauthenticated? |
| **Accessibility** | What roles, labels, and keyboard interactions does the component need? |
| **Side effects** | Does the component make API calls, navigate, or emit events? |

### Step 2 — Map Test Scenarios

| Category | What to Test | Examples |
|----------|-------------|---------|
| **Initial render** | Component renders with required props | Form shows all fields with correct labels; List shows items; Empty state shows placeholder |
| **User interaction** | User actions produce expected outcomes | Click button → action fires; Type in field → value updates; Select dropdown → selection displays |
| **State transitions** | Component responds to state changes | Loading → Data loaded → Content renders; Error → Retry button appears; Valid → Submit enabled |
| **Conditional rendering** | Different states render different content | Loading spinner during fetch; Error message on failure; Empty state when no items; Feature flag shows/hides |
| **Form behavior** | Form inputs, validation, and submission | Required field shows error on blur; Invalid email shows validation; Submit disabled until valid |
| **Accessibility** | Keyboard navigation, ARIA, screen reader | Tab order is correct; Focus is managed on modal open/close; Roles and labels are present |
| **Edge cases** | Boundary conditions in the UI | Very long text truncates; Empty arrays show empty state; Maximum items handled |

### Step 3 — Match Project Conventions

| Convention | What to Match |
|-----------|--------------|
| Testing library + version | React Testing Library 14/15/16, Angular Testing Library 15/16/17, Vue Test Utils 2.x — API differs between versions |
| Test runner + version | Jest 29 vs Vitest 2.x — `jest.fn()` vs `vi.fn()`, config format, module mocking API |
| User event library + version | `@testing-library/user-event` 14.x (async by default) vs 13.x (sync) — changes test structure |
| Query strategy | `getByRole`, `getByLabelText`, `getByText` (preferred) vs `getByTestId` (last resort) |
| Async patterns | `waitFor`, `findBy` queries for async state changes |
| Mock patterns | How the project mocks API calls (MSW 2.x vs 1.x, jest.mock, vi.mock, component-level stubs) |
| Render patterns | Custom render wrapper (providers, theme, router context) |
| File location | Co-located, `__tests__` directory, or separate test directory |

**Version-critical differences for component testing:**

| Library Transition | API Change | Impact on Tests |
|-------------------|-----------|-----------------|
| `user-event` 13 → 14 | All methods become async (`await userEvent.click()`) | Every interaction call needs `await`; missing it causes subtle test failures |
| RTL 14 → 15/16 | `render` return changes, auto-cleanup behavior | Wrapper setup may differ |
| Jest → Vitest | `jest.fn()` → `vi.fn()`, `jest.mock()` → `vi.mock()`, `jest.spyOn()` → `vi.spyOn()` | All mock/spy calls need updating |
| MSW 1.x → 2.x | `rest.get()` → `http.get()`, `setupServer` import path changes | Request handler API is completely different |

### Step 4 — Generate the Tests

**Core principles:**

| Principle | Implementation |
|-----------|---------------|
| Test user behavior, not implementation | Query by role/label, not by component internals or CSS class |
| Simulate real user actions | Use `userEvent.click()`, `userEvent.type()`, not `fireEvent` or direct state manipulation |
| Assert on visible outcomes | Assert on screen text, visibility, ARIA state — not component state variables |
| One behavior per test | Each test verifies one interaction or rendering concern |

**Query priority (from Testing Library):**

| Priority | Query | When to Use |
|----------|-------|-------------|
| 1 | `getByRole` | Elements with implicit or explicit ARIA roles (buttons, headings, form fields) |
| 2 | `getByLabelText` | Form elements associated with a label |
| 3 | `getByPlaceholderText` | Form elements with placeholder text |
| 4 | `getByText` | Non-interactive elements identified by their text content |
| 5 | `getByDisplayValue` | Form elements with a current displayed value |
| 6 | `getByAltText` | Images or areas with alt text |
| 7 | `getByTitle` | Elements with a title attribute |
| 8 | `getByTestId` | Last resort — when no semantic query applies |

**Accessibility assertions to include:**
- Elements have appropriate roles (`role="button"`, `role="dialog"`, `role="alert"`)
- Form inputs have associated labels (`aria-label` or `<label>`)
- Focus is managed correctly (modal traps focus, returns focus on close)
- Interactive elements are keyboard-accessible

### Step 5 — Validate Component Test Quality

| Check | Pass | Fail — fix |
|-------|------|-----------|
| Does the test query by role or label, not by test ID or class? | Yes — `getByRole('button', { name: 'Submit' })` | No — `getByTestId('submit-btn')` or `querySelector('.btn')` |
| Does the test simulate user actions, not programmatic state changes? | Yes — `userEvent.click(submitButton)` | No — `component.setState({ submitted: true })` |
| Does the test assert on visible outcomes? | Yes — `expect(screen.getByText('Success')).toBeVisible()` | No — `expect(component.state.success).toBe(true)` |
| Is the test independent of component internals? | Yes — would survive a refactoring that doesn't change user behavior | No — references internal method names, state keys, or CSS classes |
| Does the test cover accessibility? | Yes — checks roles, labels, or keyboard interaction | No — only tests visual rendering |
| Does the test handle async correctly? | Yes — uses `waitFor` or `findBy` for async state changes | No — uses `setTimeout` or no waiting |

---

## Anti-Patterns to Avoid

| Anti-Pattern | What It Looks Like | What to Do Instead |
|---|---|---|
| **Snapshot testing as the only test** | `expect(component).toMatchSnapshot()` with no behavioral tests | Snapshots supplement behavioral tests — they do not replace them |
| **Testing implementation details** | Asserting on state variables, internal method calls, or CSS classes | Assert on what the user sees and can do |
| **Testing the framework** | Asserting that React renders a component (it does — that's React's job) | Test your component's specific behavior |
| **Ignoring async** | Test passes but only because it asserts before the async operation completes | Use `waitFor`, `findBy`, or `act` for async behavior |
| **Over-mocking providers** | Every context provider is mocked, component behavior differs from production | Use a custom render wrapper with real providers where feasible |
| **No accessibility testing** | Tests cover clicks and rendering but no roles, labels, or keyboard | Add accessibility assertions — they catch real user-facing bugs |

---

## Completion Criteria

- [ ] All rendering states are tested (initial, loading, error, empty, populated)
- [ ] User interactions produce expected visible outcomes
- [ ] Form behavior is tested (validation, submit, error display)
- [ ] Conditional rendering is tested for each condition
- [ ] Accessibility is verified (roles, labels, keyboard navigation as applicable)
- [ ] Tests query by role/label, not by test ID or implementation detail
- [ ] Tests simulate real user actions, not programmatic state changes
- [ ] Tests are independent — no shared state between tests
- [ ] Tests handle async behavior correctly (no race conditions)
- [ ] Tests follow the project's component testing conventions

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Component tests only assert on snapshots — behavior changes go undetected | Step 2 scenario mapping and anti-pattern rules require behavioral assertions |
| Tests query by `data-testid` or CSS class — refactoring breaks all tests | Step 4 query priority enforces semantic queries (role, label, text) |
| Tests manipulate component state directly — real user actions are not tested | Step 4 principles require `userEvent` for interactions, not state manipulation |
| Accessibility issues are only caught in production by screen reader users | Step 2 accessibility scenarios and Step 4 assertions catch role/label issues early |
| Async state changes are not tested — loading and error states are invisible | Step 5 async validation catches missing `waitFor` / `findBy` patterns |
| Tests pass but component fails in production because all providers are mocked | Step 5 and anti-pattern rules catch over-mocked providers |
| Agent uses `jest.fn()` on a Vitest project or `rest.get()` on MSW 2.x | Step 3 requires matching detected testing stack versions; version-critical differences table catches common mismatches |
| Agent uses sync `userEvent.click()` on `user-event` v14+ (where all methods are async) | Step 3 version-critical differences table flags the sync→async change |
