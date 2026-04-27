---
slug: testing-strategy
title: "Testing Strategy"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 280
---

## 18. Testing Strategy

### 18.1 Testing Approach

<!-- How the app is tested. Capture the actual layers and tooling found in the
codebase — names below are illustrative across stacks. -->

- **Unit Tests:** Services, utilities, state reducers / stores (target coverage: [e.g., 80%+ for business logic]).
- **Component / View Tests:** Presentational components rendered with the framework's component-testing library (e.g., React Testing Library, Vue Test Utils, Angular TestBed, Svelte Testing Library, Solid Testing Library, Lit's `@open-wc/testing`).
- **Integration Tests:** Feature workflows spanning multiple components plus API calls (mocked or against a fixture server).
- **E2E Tests:** Full user workflows driven by a browser-automation runner (e.g., Playwright, Cypress, WebdriverIO, Selenium, TestCafe).

**Test Framework Stack (fill from the codebase):**

| Layer | Tool found in this codebase | Notes |
|---|---|---|
| Unit | [e.g., Vitest / Jest / Mocha / Jasmine / Karma / Bun test] | |
| Component | [e.g., React Testing Library / Vue Test Utils / Angular TestBed / Svelte Testing Library] | |
| E2E | [e.g., Playwright / Cypress / WebdriverIO / Selenium] | |
| Coverage threshold | [e.g., 80% business logic / 60% overall] | |

### 18.2 Running Tests

<!-- Replace `<pm>` below with the package manager actually used (npm, pnpm, yarn, bun) and the
script names with the actual scripts in package.json / equivalent manifest. -->

```bash
# Run all tests (watch mode, if configured)
<pm> test

# Run a specific test file
<pm> test -- [path-to-test-file]

# Run with coverage
<pm> test -- --coverage

# Run E2E suite
<pm> run e2e

# Run E2E in interactive / UI mode
<pm> run e2e -- --ui
```

### 18.3 Testing Examples

<!-- Show ONE concrete unit test and ONE concrete component test from this codebase, in the
language and framework actually in use. The examples below are illustrative for a
React + TypeScript + Jest stack — replace them with real samples from the repo. The
shape of a "good" test (Arrange-Act-Assert, single behaviour per test, descriptive
title) is universal; only the syntax changes. -->

**Service / Unit Test (illustrative — React + Jest + TypeScript):**

```typescript
// src/features/tickets/services/ticketService.test.ts
import { ticketService } from './ticketService';
import httpClient from '@/core/services/httpClient';

jest.mock('@/core/services/httpClient');

describe('ticketService', () => {
  it('should fetch tickets with pagination', async () => {
    const mockResponse = {
      data: [{ id: '1', title: 'Test' }],
      pagination: { page: 1, total: 1 },
    };
    httpClient.get.mockResolvedValue({ data: mockResponse });

    const result = await ticketService.getTickets({ page: 1, limit: 10 });

    expect(result).toEqual(mockResponse);
    expect(httpClient.get).toHaveBeenCalledWith('/tickets', {
      params: { page: 1, limit: 10 },
    });
  });
});
```

**Component / View Test (illustrative — React + Jest + React Testing Library):**

```typescript
// src/features/tickets/components/TicketCard/TicketCard.test.tsx
import { render, screen } from '@testing-library/react';
import TicketCard from './TicketCard';

describe('TicketCard', () => {
  it('should display ticket title and status', () => {
    const ticket = { id: '1', title: 'Test Ticket', status: 'open' };
    render(<TicketCard ticket={ticket} />);

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const ticket = { id: '1', title: 'Test Ticket', status: 'open' };
    const onEdit = jest.fn();
    render(<TicketCard ticket={ticket} onEdit={onEdit} />);

    screen.getByRole('button', { name: /edit/i }).click();

    expect(onEdit).toHaveBeenCalledWith(ticket.id);
  });
});
```

**Equivalent shapes in other stacks:**
- **Vue + Vitest + Vue Test Utils:** `mount(TicketCard, { props: { ticket } })` and assert via `wrapper.text()` / `wrapper.find()`.
- **Angular + Jasmine + TestBed:** `TestBed.createComponent(TicketCardComponent)` and assert via `fixture.nativeElement`.
- **Svelte + Vitest + Svelte Testing Library:** `render(TicketCard, { props: { ticket } })` and assert via `screen.getByText`.
- **Solid + Vitest + Solid Testing Library:** `render(() => <TicketCard ticket={ticket} />)` and assert via `screen.getByText`.

The Arrange-Act-Assert structure, single-behaviour-per-test rule, and descriptive titles are stack-agnostic.
