# React Testing Standards

## Purpose

These standards define React-specific testing rules that supplement the [common testing standards](../../common/testing/) and [TypeScript testing standards](../../languages/typescript/testing.md). They cover component testing with React Testing Library, hook testing, provider setup, and async rendering patterns. General testing principles (test structure, naming, coverage thresholds, mock hygiene) are defined in the common standards and are not repeated here.

## Applicability

All React projects, including Next.js for applicable rules.

## Rules

### RTT-01: Use React Testing Library

**Severity:** Error
**Rule:** Test components from the user's perspective — render, interact, and assert on visible output; never test implementation details like internal state values or lifecycle methods.
**Why:** Tests coupled to implementation break on refactors that don't change behavior, providing no safety net and high maintenance cost.

**Compliant:**

```tsx
test("displays user name after loading", async () => {
  render(<UserProfile userId="123" />);

  expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
});

test("shows error message on failed submission", async () => {
  server.use(
    http.post("/api/submit", () => HttpResponse.json(null, { status: 500 })),
  );

  render(<SubmitForm />);
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Something went wrong",
  );
});
```

**Non-compliant:**

```tsx
test("sets loading state", () => {
  const { result } = render(<UserProfile userId="123" />);

  // Testing internal state — not what the user sees
  expect(result.state.isLoading).toBe(true);
});

test("calls componentDidMount", () => {
  const spy = jest.spyOn(UserProfile.prototype, "componentDidMount");
  render(<UserProfile userId="123" />);

  // Testing lifecycle methods — implementation detail
  expect(spy).toHaveBeenCalled();
});
```

---

### RTT-02: Use `userEvent` over `fireEvent`

**Severity:** Warning
**Rule:** Use `@testing-library/user-event` to simulate user interactions — reserve `fireEvent` only for events that `userEvent` does not support.
**Why:** `userEvent` simulates real browser behavior (focus, keyboard navigation, input events in sequence) while `fireEvent` dispatches a single DOM event without the surrounding user-like behavior.

**Compliant:**

```tsx
import userEvent from "@testing-library/user-event";

test("filters results as user types", async () => {
  const user = userEvent.setup();
  render(<SearchPage />);

  await user.type(screen.getByRole("searchbox"), "react");

  expect(screen.getByText("React Testing Library")).toBeInTheDocument();
});

test("toggles checkbox on click", async () => {
  const user = userEvent.setup();
  render(<SettingsForm />);

  const checkbox = screen.getByRole("checkbox", { name: /dark mode/i });
  await user.click(checkbox);

  expect(checkbox).toBeChecked();
});
```

**Non-compliant:**

```tsx
test("filters results as user types", () => {
  render(<SearchPage />);

  // fireEvent.change sets value in one shot — skips focus, keydown, input events
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "react" },
  });

  expect(screen.getByText("React Testing Library")).toBeInTheDocument();
});
```

---

### RTT-03: Follow Query Priority

**Severity:** Convention
**Rule:** Prefer queries in this order: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId` — queries should reflect how users and assistive technology find elements.
**Why:** Role-based queries verify accessibility semantics; falling back to `data-testid` first hides missing ARIA roles and labels.

**Compliant:**

```tsx
// Best — queries by accessible role
screen.getByRole("button", { name: /save/i });
screen.getByRole("textbox", { name: /email/i });

// Good — queries by label (still accessible)
screen.getByLabelText(/password/i);

// Acceptable — when no role or label applies
screen.getByText(/no results found/i);

// Last resort — when element has no accessible name or visible text
screen.getByTestId("color-swatch-preview");
```

**Non-compliant:**

```tsx
// Jumping straight to testid when a role query would work
screen.getByTestId("save-button"); // button has role="button" and visible text "Save"
screen.getByTestId("email-input"); // input has an associated <label>
```

---

### RTT-04: Test Hooks with `renderHook`

**Severity:** Warning
**Rule:** Use `renderHook` from `@testing-library/react` to test custom hooks in isolation — never create throwaway wrapper components just to exercise a hook.
**Why:** `renderHook` provides a clean, standardized API for testing hooks with proper React lifecycle handling and reduces boilerplate.

**Compliant:**

```tsx
import { renderHook, act } from "@testing-library/react";

test("increments counter", () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

test("debounces value updates", async () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: "initial" } },
  );

  rerender({ value: "updated" });

  await waitFor(() => {
    expect(result.current).toBe("updated");
  });
});
```

**Non-compliant:**

```tsx
// Creating a wrapper component just to test a hook
function TestComponent() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

test("increments counter", async () => {
  render(<TestComponent />);
  await userEvent.click(screen.getByText("+"));
  expect(screen.getByTestId("count")).toHaveTextContent("1");
});
```

---

### RTT-05: Wrap Providers in Test Utilities

**Severity:** Convention
**Rule:** Create a shared `renderWithProviders` utility that wraps components with required context providers — do not duplicate provider setup across test files.
**Why:** Duplicated provider wrappers drift out of sync and make adding a new global provider a shotgun edit across every test file.

**Compliant:**

```tsx
// test/utils.tsx
function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { preloadedState?: Partial<RootState> },
) {
  const { preloadedState, ...renderOptions } = options ?? {};

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <ThemeProvider theme={testTheme}>
          <MemoryRouter>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// In tests
test("renders dashboard", () => {
  renderWithProviders(<Dashboard />);
  expect(screen.getByRole("heading")).toHaveTextContent("Dashboard");
});
```

**Non-compliant:**

```tsx
// Provider setup copy-pasted into every test file
test("renders dashboard", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Dashboard");
});
```

---

### RTT-06: Don't Test Implementation Details

**Severity:** Error
**Rule:** Never assert on component state, internal methods, or component instances — test only what the user sees and what changes when they interact.
**Why:** Implementation-detail tests break on harmless refactors and give false confidence; behavior tests verify actual user-facing correctness.

**Compliant:**

```tsx
test("expands accordion section on click", async () => {
  const user = userEvent.setup();
  render(<Accordion sections={sections} />);

  await user.click(screen.getByRole("button", { name: /billing/i }));

  expect(screen.getByText("Your current plan is Pro.")).toBeVisible();
});
```

**Non-compliant:**

```tsx
test("expands accordion section on click", () => {
  const wrapper = shallow(<Accordion sections={sections} />);

  wrapper.find(".accordion-toggle").at(0).simulate("click");

  // Asserting on internal state instead of visible output
  expect(wrapper.state("expandedIndex")).toBe(0);

  // Asserting on component instance methods
  expect(wrapper.instance().isExpanded(0)).toBe(true);
});
```

---

### RTT-07: Use Snapshot Testing Judiciously

**Severity:** Convention
**Rule:** Use snapshot tests only for stable, presentational components with no dynamic content — never for components with dates, IDs, or frequently changing markup; review every snapshot update deliberately.
**Why:** Large or volatile snapshots get rubber-stamped on update, providing false confidence; targeted snapshots of stable structures catch genuine regressions.

**Compliant:**

```tsx
test("renders icon set correctly", () => {
  const { container } = render(<IconSet icons={["home", "settings", "user"]} />);
  expect(container.firstChild).toMatchSnapshot();
});
```

**Non-compliant:**

```tsx
test("renders entire page", () => {
  // Full-page snapshot with dynamic timestamps, user data, and generated IDs
  const { container } = render(<DashboardPage />);
  expect(container).toMatchSnapshot();
});

test("renders notification", () => {
  // Contains Date.now() and random ID — snapshot changes every run
  const { container } = render(
    <Notification message="Hello" timestamp={Date.now()} id={generateId()} />,
  );
  expect(container).toMatchSnapshot();
});
```

---

### RTT-08: Handle Async Rendering Correctly

**Severity:** Error
**Rule:** Use `findBy*` queries, `waitFor`, or `act()` for components with async state updates — never use `setTimeout`, manual delays, or arbitrary sleeps to wait for renders.
**Why:** Timer-based waits are flaky (too short = false failures, too long = slow suite); Testing Library's async utilities poll the DOM and resolve as soon as the condition is met.

**Compliant:**

```tsx
test("loads and displays users", async () => {
  render(<UserList />);

  // findBy* waits for the element to appear
  const items = await screen.findAllByRole("listitem");
  expect(items).toHaveLength(3);
});

test("shows validation error after async check", async () => {
  const user = userEvent.setup();
  render(<RegistrationForm />);

  await user.type(screen.getByRole("textbox", { name: /username/i }), "taken");
  await user.click(screen.getByRole("button", { name: /check/i }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("Username is taken");
  });
});
```

**Non-compliant:**

```tsx
test("loads and displays users", async () => {
  render(<UserList />);

  // Arbitrary delay — flaky and slow
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(3);
});
```

## Customization

- **RTT-01:** Teams migrating from Enzyme may still have legacy tests using `shallow` or `mount` — wrap migration status in a tracking issue and convert incrementally.
- **RTT-03:** Some teams standardize on `data-testid` for all selectors to decouple tests from copy and accessibility markup. This is a valid alternative when the team has separate accessibility auditing in place.
- **RTT-07:** Some teams ban snapshot testing entirely due to the rubber-stamp risk. If your team has made this decision, mark RTT-07 as not applicable in your project configuration.
