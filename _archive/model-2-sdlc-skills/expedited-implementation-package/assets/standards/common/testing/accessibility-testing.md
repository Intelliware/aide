# Accessibility Testing Standards

## Purpose

These standards establish consistent practices for verifying that user interfaces are accessible to all users, including those who rely on assistive technologies such as screen readers, keyboard navigation, and alternative input devices. Accessibility is not a feature — it is a quality attribute that must be tested continuously, just like performance or security. These rules ensure accessibility defects are caught during development and CI, not after users encounter barriers in production.

## Applicability

These standards apply to all frontend projects that render UI — including React, Next.js, and any web application with interactive elements. They cover both automated scanning (which catches approximately 30–50% of accessibility issues) and manual testing patterns that must be verified in integration or E2E tests. Teams building backend-only services or CLI tools may skip these standards, though CLI accessibility (e.g., screen reader compatibility with terminal output) is encouraged.

## Rules

### A11Y-01: Integrate Automated Accessibility Scanning

**Severity:** Error
**Rule:** Run automated accessibility scanning (axe-core, Lighthouse, or equivalent) in CI on every pull request — scans must cover all page templates and key interactive states.
**Why:** Automated scanners catch common violations — missing alt text, broken ARIA attributes, invalid heading hierarchies — at zero marginal cost per PR, preventing a class of issues that manual review consistently misses.

**Compliant:**

```typescript
// Component test with axe-core integration
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('CheckoutForm accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<CheckoutForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in error state', async () => {
    const { container } = render(
      <CheckoutForm errors={{ email: 'Email is required' }} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

```typescript
// Playwright E2E test with axe scanning
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('checkout page passes axe scan', async ({ page }) => {
  await page.goto('/checkout');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

**Non-compliant:**

```typescript
// No automated scanning — accessibility relies on manual review
describe('CheckoutForm', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CheckoutForm />);
    expect(getByText('Submit')).toBeInTheDocument();
    // No axe scan — ARIA violations, missing labels go undetected
  });
});

// Accessibility scan runs only in a nightly job, not on PRs
// Violations accumulate for days before anyone notices
```

---

### A11Y-02: Test Keyboard Navigation

**Severity:** Error
**Rule:** Every interactive element must be reachable and operable via keyboard alone — test Tab order, Enter/Space activation, Escape dismissal, and Arrow key navigation explicitly.
**Why:** Users who cannot use a mouse — due to motor impairments, repetitive strain injuries, or preference — rely entirely on keyboard navigation; untested keyboard paths are broken paths.

**Compliant:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Dropdown keyboard navigation', () => {
  it('opens with Enter and navigates with Arrow keys', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={['Option A', 'Option B', 'Option C']} />);

    const trigger = screen.getByRole('combobox');

    // Tab to the dropdown trigger
    await user.tab();
    expect(trigger).toHaveFocus();

    // Enter opens the listbox
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeVisible();

    // Arrow keys navigate options
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute(
      'aria-selected', 'true',
    );

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute(
      'aria-selected', 'true',
    );

    // Enter selects the option
    await user.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Option B');

    // Escape closes without selecting
    await user.keyboard('{Enter}');  // reopen
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
```

**Non-compliant:**

```typescript
// Only mouse interactions are tested — keyboard users are ignored
describe('Dropdown', () => {
  it('opens on click', async () => {
    render(<Dropdown options={['A', 'B', 'C']} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeVisible();
    // No Tab, Enter, Arrow, or Escape tests
    // Keyboard users cannot operate this component
  });
});
```

---

### A11Y-03: Verify Screen Reader Compatibility

**Severity:** Warning
**Rule:** Use semantic HTML elements, ARIA labels, ARIA live regions, and proper role attributes — verify these programmatically with axe-core rules or testing-library queries that target accessible roles and names.
**Why:** Screen readers interpret the accessibility tree, not the visual layout — without proper semantics and ARIA attributes, screen reader users perceive a meaningless jumble of text.

**Compliant:**

```typescript
// Component with proper ARIA attributes for screen readers
function SearchResults({ results, isLoading }: SearchResultsProps) {
  return (
    <section aria-label="Search results">
      {/* Live region announces dynamic content changes to screen readers */}
      <div aria-live="polite" aria-atomic="true">
        {isLoading
          ? 'Loading results...'
          : `${results.length} results found`}
      </div>

      <ul role="list">
        {results.map((result) => (
          <li key={result.id}>
            <a href={result.url} aria-label={`${result.title} — ${result.summary}`}>
              {result.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Test verifies screen reader experience, not visual rendering
describe('SearchResults accessibility', () => {
  it('announces result count to screen readers', async () => {
    render(<SearchResults results={mockResults} isLoading={false} />);

    const liveRegion = screen.getByText('3 results found');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('provides accessible names for result links', () => {
    render(<SearchResults results={mockResults} isLoading={false} />);

    const link = screen.getByRole('link', {
      name: 'TypeScript Guide — Learn TypeScript fundamentals',
    });
    expect(link).toBeInTheDocument();
  });
});
```

**Non-compliant:**

```typescript
// No ARIA attributes — screen reader users have no context
function SearchResults({ results, isLoading }: SearchResultsProps) {
  return (
    <div>
      {/* No live region — screen readers don't know results changed */}
      {isLoading && <div className="spinner" />}

      <div>
        {results.map((result) => (
          <div key={result.id} onClick={() => navigate(result.url)}>
            {/* div with onClick — not a link, not focusable, not announced */}
            <span className="title">{result.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### A11Y-04: Meet WCAG 2.1 AA as Minimum

**Severity:** Error
**Rule:** All new UI must conform to WCAG 2.1 Level AA success criteria — perceivable, operable, understandable, and robust — and Level AAA for high-traffic public-facing pages.
**Why:** WCAG AA is the legal baseline in most jurisdictions and the widely accepted standard for usable accessibility; failing to meet it exposes the organization to both legal risk and user exclusion.

**Compliant:**

```typescript
// axe-core configured to enforce WCAG 2.1 AA
import AxeBuilder from '@axe-core/playwright';

test('dashboard meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/dashboard');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

// For high-traffic public pages, also check AAA criteria
test('homepage meets WCAG 2.1 AAA', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag2aaa', 'wcag21aaa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

**Non-compliant:**

```typescript
// No WCAG compliance level specified — only checks "best practice" rules
const results = await new AxeBuilder({ page }).analyze();
// Default axe tags include best-practices but don't guarantee WCAG AA coverage

// Or: no automated WCAG checks at all — compliance is "someone will review it"
test('page renders', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toHaveText('Dashboard');
  // No accessibility assertions — WCAG violations ship unchecked
});
```

---

### A11Y-05: Test Color Contrast Ratios

**Severity:** Error
**Rule:** Normal text must have a minimum contrast ratio of 4.5:1 against its background, and large text (18px+ or 14px+ bold) must have a minimum of 3:1 — verify with automated tools, not visual inspection.
**Why:** Low-contrast text is unreadable for users with low vision, color blindness, or in bright environments — visual inspection is unreliable because developers unconsciously compensate on high-quality monitors.

**Compliant:**

```typescript
// Design tokens enforce contrast ratios at the system level
const colors = {
  text: {
    primary: '#1a1a2e',    // contrast 14.5:1 against white
    secondary: '#4a4a68',  // contrast 7.2:1 against white
    disabled: '#717186',   // contrast 4.6:1 against white (meets AA)
  },
  background: {
    primary: '#ffffff',
  },
};

// Automated contrast check in component tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button contrast', () => {
  it('meets WCAG AA contrast requirements', async () => {
    const { container } = render(
      <Button variant="secondary">Cancel</Button>,
    );

    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: true } },
    });

    expect(results).toHaveNoViolations();
  });
});
```

```typescript
// Playwright visual regression with contrast verification
test('form labels have sufficient contrast', async ({ page }) => {
  await page.goto('/signup');

  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

**Non-compliant:**

```typescript
// Light gray text on white background — fails contrast requirements
const styles = {
  label: {
    color: '#cccccc',     // contrast 1.6:1 against white — unreadable
    fontSize: '14px',
  },
  helperText: {
    color: '#bbbbbb',     // contrast 1.9:1 against white — fails AA
    fontSize: '12px',
  },
};

// No automated contrast check — relies on designer "eyeballing it"
// Developer's retina display hides the problem; user's budget monitor doesn't
```

---

### A11Y-06: Use Semantic HTML Elements

**Severity:** Error
**Rule:** Use native HTML elements for their intended purpose — `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<form>` for structure — never use `<div>` or `<span>` with click handlers for interactive elements.
**Why:** Native HTML elements provide built-in keyboard handling, focus management, and screen reader announcements for free; a `<div onClick>` has none of these and requires manual reimplementation of every accessibility behavior.

**Compliant:**

```typescript
// Semantic elements with built-in accessibility behavior
function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul role="list">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  );
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article aria-label={product.name}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <img src={product.imageUrl} alt={product.name} />
      <button type="button" onClick={() => onAddToCart(product.id)}>
        Add to cart
      </button>
    </article>
  );
}

function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} aria-label="Login">
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" required autoComplete="email" />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" required autoComplete="current-password" />

      <button type="submit">Sign in</button>
    </form>
  );
}
```

**Non-compliant:**

```typescript
// div and span used as interactive elements — inaccessible
function Navigation() {
  return (
    <div className="nav">
      <div className="nav-item" onClick={() => navigate('/dashboard')}>
        Dashboard
      </div>
      <div className="nav-item" onClick={() => navigate('/settings')}>
        Settings
      </div>
    </div>
    // Not focusable, not announced as links, no keyboard activation
  );
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="card">
      <span className="title">{product.name}</span>
      <div className="image"><img src={product.imageUrl} /></div>
      {/* img missing alt — screen readers say "image" with no context */}
      <span className="btn" onClick={() => onAddToCart(product.id)}>
        Add to cart
      </span>
      {/* span is not a button — not focusable, Enter key doesn't work */}
    </div>
  );
}
```

## Customization

- **A11Y-04 (Compliance level)** depends on regulatory requirements and audience. Government projects in the US must meet Section 508, which maps to WCAG 2.0 AA. EU projects must meet EN 301 549, which references WCAG 2.1 AA. Private-sector applications typically target WCAG 2.1 AA as a practical baseline. Level AAA is aspirational for most applications and should be targeted selectively for high-traffic or public-facing pages rather than as a blanket requirement.

- **A11Y-01 (Tool choice)** varies by test framework. `jest-axe` integrates axe-core into Jest/Vitest component tests. `@axe-core/playwright` provides axe scanning in Playwright E2E tests. Lighthouse includes accessibility audits as part of its broader performance and quality scoring. Some teams use Pa11y or Tenon for additional coverage. The rule requires automated scanning — the specific tool should match the team's existing test infrastructure.

- **A11Y-03 (Screen reader testing depth)** varies by project risk. Automated ARIA validation (via axe-core) catches structural issues — missing labels, invalid roles, orphaned ARIA attributes. Manual screen reader testing (VoiceOver, NVDA, JAWS) catches experiential issues — confusing announcement order, missing context, awkward navigation patterns. Teams should run automated ARIA checks on every PR and conduct manual screen reader testing at least quarterly or before major releases.
