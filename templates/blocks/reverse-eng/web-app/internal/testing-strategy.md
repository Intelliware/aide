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

<!-- How the app is tested. -->

- **Unit Tests:** Services, utilities, reducers (80%+ coverage recommended)
- **Component Tests:** Presentational components with React Testing Library
- **Integration Tests:** Feature workflows (multiple components + API calls)
- **E2E Tests:** User workflows across entire app with Playwright

**Test Framework Stack:**
- Unit/Component: Jest + React Testing Library
- E2E: Playwright
- Coverage Threshold: 80% for business logic, 60% overall

### 18.2 Running Tests

```bash
# Run all tests in watch mode
npm test

# Run specific test file
npm test -- TicketCard.test.tsx

# Run with coverage report
npm test -- --coverage

# Run E2E tests
npm run e2e

# Run E2E in UI mode
npm run e2e -- --ui
```

### 18.3 Testing Examples

**Service Unit Test:**

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

**Component Test:**

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
