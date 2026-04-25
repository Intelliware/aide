# React Standards

## Purpose

These standards define React-specific coding rules that supplement the [common standards](../../common/) and [TypeScript standards](../../languages/typescript/). They cover component design, hooks usage, performance patterns, and state management conventions. Rules from common and TypeScript standards are not repeated here — they apply in full and are referenced where relevant.

## Applicability

All React 18+ projects using function components, hooks, and TypeScript — including Next.js for applicable rules. React 17 projects can follow most rules but lack automatic batching and `useId`; React 16 projects need significant adaptation (no hooks in class components).

## Rules

### RC-01: Use Functional Components Only

**Severity:** Error
**Rule:** Write all new components as function components with hooks — never use class components except for error boundaries.
**Why:** Function components with hooks are simpler, more composable, and the direction of the React ecosystem; class components add unnecessary complexity and prevent use of hooks.

**Compliant:**

```tsx
function UserProfile({ userId }: { userId: string }) {
  const user = useUser(userId);
  return <div>{user.name}</div>;
}

// Error boundaries are the sole exception until React provides a hook equivalent
class ErrorBoundary extends React.Component<PropsWithChildren> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <FallbackUI />;
    return this.props.children;
  }
}
```

**Non-compliant:**

```tsx
class UserProfile extends React.Component<{ userId: string }> {
  componentDidMount() {
    this.fetchUser();
  }

  render() {
    return <div>{this.state.user?.name}</div>;
  }
}
```

---

### RC-02: Follow the Rules of Hooks

**Severity:** Error
**Rule:** Only call hooks at the top level of a function component or custom hook — never inside conditions, loops, or nested functions.
**Why:** React relies on call order to associate hook state with components; conditional or loop-based calls break this contract and cause unpredictable bugs.

**Compliant:**

```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<Item[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!debouncedQuery) return;
    fetchResults(debouncedQuery).then(setResults);
  }, [debouncedQuery]);

  return <ResultList items={results} />;
}
```

**Non-compliant:**

```tsx
function SearchResults({ query }: { query: string }) {
  if (query) {
    // Hook called conditionally — violates Rules of Hooks
    const [results, setResults] = useState<Item[]>([]);
    useEffect(() => {
      fetchResults(query).then(setResults);
    }, [query]);
  }

  return <ResultList items={results} />;
}
```

---

### RC-03: Memoize Expensive Computations

**Severity:** Convention
**Rule:** Use `useMemo` for expensive calculations and `useCallback` for callbacks passed to memoized child components — but do not memoize trivially cheap operations; measure before optimizing.
**Why:** Unnecessary memoization adds complexity and memory overhead; targeted memoization of proven bottlenecks delivers actual performance gains.

**Compliant:**

```tsx
function AnalyticsDashboard({ data }: { data: DataPoint[] }) {
  // Expensive aggregation — memoize
  const summary = useMemo(() => computeStatistics(data), [data]);

  // Callback passed to a memoized child — stabilize reference
  const handleExport = useCallback(
    (format: ExportFormat) => exportData(data, format),
    [data],
  );

  return (
    <>
      <StatsSummary stats={summary} />
      <ExportButton onExport={handleExport} />
    </>
  );
}
```

**Non-compliant:**

```tsx
function AnalyticsDashboard({ data }: { data: DataPoint[] }) {
  // Trivial operation — memoization adds overhead for no benefit
  const count = useMemo(() => data.length, [data]);

  // Callback not passed to a memoized child — useCallback is pointless
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return <div onClick={handleClick}>{count} points</div>;
}
```

---

### RC-04: Use Lazy Loading for Route-Level Components

**Severity:** Convention
**Rule:** Use `React.lazy()` with `Suspense` for code splitting at route boundaries — do not lazy-load small components or components above the fold.
**Why:** Route-level splitting keeps initial bundle size small without introducing loading flicker for content users see immediately.

**Compliant:**

```tsx
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

**Non-compliant:**

```tsx
// Lazy-loading a tiny UI element adds latency for negligible bundle savings
const Tooltip = lazy(() => import("./components/Tooltip"));

// Lazy-loading above-the-fold content causes visible loading flicker
const HeroBanner = lazy(() => import("./components/HeroBanner"));

function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeroBanner />
      <Tooltip text="info" />
    </Suspense>
  );
}
```

---

### RC-05: Use Controlled Components for Forms

**Severity:** Warning
**Rule:** Form inputs must get their value from state and update via `onChange` — do not use refs to read form values unless integrating with non-React libraries.
**Why:** Controlled components keep React as the single source of truth for form data, enabling validation, conditional rendering, and predictable behavior.

**Compliant:**

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
    </form>
  );
}
```

**Non-compliant:**

```tsx
function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Reading values from refs — React has no knowledge of form state
    login({
      email: emailRef.current!.value,
      password: passwordRef.current!.value,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} />
      <input type="password" ref={passwordRef} />
      <button type="submit">Log in</button>
    </form>
  );
}
```

---

### RC-06: Always Provide Stable Keys

**Severity:** Error
**Rule:** Use unique domain identifiers as list keys — never use array indices unless the list is static and never reordered, and never generate keys during render.
**Why:** Unstable keys cause React to destroy and recreate DOM nodes unnecessarily, losing component state and degrading performance.

**Compliant:**

```tsx
function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
```

**Non-compliant:**

```tsx
function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {/* Array index — breaks when list is reordered or filtered */}
      {tasks.map((task, index) => (
        <TaskItem key={index} task={task} />
      ))}

      {/* Generated key — creates a new key every render, destroying state */}
      {tasks.map((task) => (
        <TaskItem key={crypto.randomUUID()} task={task} />
      ))}
    </ul>
  );
}
```

---

### RC-07: Colocate State with Its Consumers

**Severity:** Warning
**Rule:** Place state in the lowest common ancestor of the components that read or write it — do not hoist all state to the application root; use composition to avoid prop drilling.
**Why:** Colocated state reduces unnecessary re-renders, makes data flow easier to trace, and keeps components independently testable.

**Compliant:**

```tsx
function ProductPage() {
  return (
    <div>
      <ProductDetails />
      <ReviewSection />
    </div>
  );
}

function ReviewSection() {
  // State lives where it's used — ProductDetails doesn't re-render on review changes
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  return (
    <>
      <SortControls order={sortOrder} onChange={setSortOrder} />
      <ReviewList reviews={reviews} sortOrder={sortOrder} />
    </>
  );
}
```

**Non-compliant:**

```tsx
function ProductPage() {
  // All state hoisted to the top — every child re-renders on any change
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedTab, setSelectedTab] = useState("details");

  return (
    <div>
      <ProductDetails
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      <ReviewSection
        reviews={reviews}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onReviewsChange={setReviews}
      />
    </div>
  );
}
```

---

### RC-08: Extract Custom Hooks for Reusable Logic

**Severity:** Convention
**Rule:** When two or more components share stateful logic, extract it into a `use*` custom hook — prefer hooks over HOCs or render props for composition.
**Why:** Custom hooks are the idiomatic composition primitive in React; they are simpler to type, test, and compose than HOCs or render props.

**Compliant:**

```tsx
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  // ...
}
```

**Non-compliant:**

```tsx
// HOC adds wrapper nesting and makes types harder to follow
function withDebounce<P extends { value: string }>(
  Component: React.ComponentType<P & { debouncedValue: string }>,
) {
  return function Wrapper(props: P) {
    const [debounced, setDebounced] = useState(props.value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(props.value), 300);
      return () => clearTimeout(timer);
    }, [props.value]);

    return <Component {...props} debouncedValue={debounced} />;
  };
}
```

---

### RC-09: Use Composition over Prop Sprawl

**Severity:** Convention
**Rule:** Prefer `children` and render slots over components with 10+ configuration props — split large components into composed sub-components.
**Why:** Prop sprawl makes components hard to understand, test, and maintain; composition gives consumers flexibility without combinatorial API surfaces.

**Compliant:**

```tsx
function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}

// Consumer composes what they need
<Card>
  <CardHeader>
    <h2>{title}</h2>
  </CardHeader>
  <CardBody>
    <p>{description}</p>
  </CardBody>
</Card>
```

**Non-compliant:**

```tsx
// Monolithic prop API — hard to extend, hard to test
<Card
  title={title}
  subtitle={subtitle}
  description={description}
  headerIcon={icon}
  headerAction={action}
  footerLeft={footerLeft}
  footerRight={footerRight}
  bordered
  elevated
  collapsible
  defaultCollapsed={false}
  onCollapse={handleCollapse}
/>
```

---

### RC-10: Manage Side Effects Properly

**Severity:** Error
**Rule:** Use `useEffect` with correct dependency arrays, clean up subscriptions and timers in the cleanup function, and never fire-and-forget async operations without cancellation logic.
**Why:** Missing cleanup causes memory leaks and state-update-on-unmounted-component warnings; incorrect dependencies cause stale closures or infinite loops.

**Compliant:**

```tsx
function useUserStatus(userId: string) {
  const [status, setStatus] = useState<Status>("offline");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/users/${userId}/status`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        if (!controller.signal.aborted) throw err;
      }
    }

    fetchStatus();
    return () => controller.abort();
  }, [userId]);

  return status;
}
```

**Non-compliant:**

```tsx
function useUserStatus(userId: string) {
  const [status, setStatus] = useState<Status>("offline");

  useEffect(() => {
    // No cancellation — may set state after unmount
    fetch(`/api/users/${userId}/status`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status));
  }); // Missing dependency array — runs on every render

  return status;
}
```

## Customization

- **RC-03:** The threshold for "expensive" is judgment-based. Profile with React DevTools before adding memoization; a good heuristic is >1ms per render cycle.
- **RC-04:** Lazy loading boundaries should be informed by bundle analysis (e.g., webpack-bundle-analyzer). Route-level is the default; split further only when a route's bundle is disproportionately large.
- **RC-05:** Uncontrolled components are acceptable for file inputs (`<input type="file" />`) and integration with non-React libraries that manage their own DOM.
