# Next.js Testing Standards

## Purpose

These standards define testing patterns specific to Next.js applications built with the App Router. They supplement the common testing standards (unit testing, integration testing, mocking strategy) and React testing standards — those rules still apply in full. This document addresses the unique challenges of testing Server Components, Route Handlers, middleware, Server Actions, and navigation in the Next.js runtime model.

## Applicability

All Next.js projects using the App Router (`app/` directory). Tests should use Vitest or Jest with React Testing Library unless otherwise specified.

## Rules

### NXT-01: Test Server Components as Async Functions

**Severity:** Error
**Rule:** Test Server Components by calling the component function directly and rendering the returned JSX with React Testing Library — do not attempt to render them as client components or mock the server runtime.
**Why:** Server Components are async functions that return JSX; treating them as such gives you fast, reliable unit tests without needing a running Next.js server.

**Compliant:**

```tsx
// app/orders/page.tsx
import { getOrders } from '@/lib/orders';

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>{order.name} — {order.status}</li>
      ))}
    </ul>
  );
}

// app/orders/page.test.tsx
import { render, screen } from '@testing-library/react';
import OrdersPage from './page';
import { getOrders } from '@/lib/orders';

vi.mock('@/lib/orders');

describe('OrdersPage', () => {
  it('renders a list of orders', async () => {
    vi.mocked(getOrders).mockResolvedValue([
      { id: '1', name: 'Widget', status: 'pending' },
      { id: '2', name: 'Gadget', status: 'completed' },
    ]);

    const jsx = await OrdersPage();
    render(jsx);

    expect(screen.getByText('Widget — pending')).toBeInTheDocument();
    expect(screen.getByText('Gadget — completed')).toBeInTheDocument();
  });

  it('renders an empty state when there are no orders', async () => {
    vi.mocked(getOrders).mockResolvedValue([]);

    const jsx = await OrdersPage();
    render(jsx);

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
```

**Non-compliant:**

```tsx
// Trying to render the server component directly — fails because
// Testing Library doesn't handle async components natively
import { render, screen } from '@testing-library/react';
import OrdersPage from './page';

it('renders orders', () => {
  render(<OrdersPage />); // Error: Objects are not valid as a React child (Promise)
  expect(screen.getByText('Widget')).toBeInTheDocument();
});
```

---

### NXT-02: Test Route Handlers as HTTP Endpoints

**Severity:** Error
**Rule:** Test Route Handlers by constructing a `NextRequest`, calling the exported handler function, and asserting on the `NextResponse` — test status codes, response headers, and body content.
**Why:** Route Handlers are plain functions that take a request and return a response; testing them directly is fast, deterministic, and doesn't require a running server.

**Compliant:**

```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.productId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'productId is required' } },
      { status: 400 },
    );
  }

  const order = await createOrder(body);
  return NextResponse.json(order, { status: 201 });
}

// app/api/orders/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from './route';
import { createOrder } from '@/lib/orders';

vi.mock('@/lib/orders');

describe('POST /api/orders', () => {
  it('creates an order and returns 201', async () => {
    const order = { id: '1', productId: 'abc', quantity: 2 };
    vi.mocked(createOrder).mockResolvedValue(order);

    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ productId: 'abc', quantity: 2 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(order);
    expect(createOrder).toHaveBeenCalledWith({ productId: 'abc', quantity: 2 });
  });

  it('returns 400 for missing productId', async () => {
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

**Non-compliant:**

```typescript
// Testing with a real HTTP server — slow, flaky, requires full app startup
import { createServer } from 'http';

it('creates an order', async () => {
  const server = createServer(app);
  server.listen(3001);

  const res = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    body: JSON.stringify({ productId: 'abc' }),
  });

  expect(res.status).toBe(201);
  server.close();
});
```

---

### NXT-03: Test Middleware with Request/Response Mocks

**Severity:** Warning
**Rule:** Test middleware by constructing a `NextRequest` with the URL and headers under test, calling the `middleware` function directly, and asserting on the response — check redirects, rewrites, and header modifications.
**Why:** Middleware runs at the edge before any page logic; testing it in isolation ensures auth guards and routing rules work without spinning up the full application.

**Compliant:**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await verifySession(request);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// middleware.test.ts
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { verifySession } from '@/lib/auth';

vi.mock('@/lib/auth');

describe('middleware', () => {
  it('redirects unauthenticated users to login', async () => {
    vi.mocked(verifySession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/orders');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
    expect(response.headers.get('location')).toContain('callbackUrl=%2Forders');
  });

  it('allows authenticated users through', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'user-1' });

    const request = new NextRequest('http://localhost/orders');
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('preserves custom headers for downstream handlers', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'user-1' });

    const request = new NextRequest('http://localhost/orders', {
      headers: { 'x-request-id': 'req-123' },
    });
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});
```

**Non-compliant:**

```typescript
// No middleware tests — auth bugs only discovered in production
// or through slow E2E tests

// Mocking internal Next.js runtime instead of using the public API
it('checks auth', () => {
  const mockReq = { cookies: { get: vi.fn() }, nextUrl: { pathname: '/orders' } };
  // Fragile: coupled to internal implementation details
  middleware(mockReq as any);
});
```

---

### NXT-04: Use MSW for External API Mocking

**Severity:** Warning
**Rule:** Use Mock Service Worker (MSW) to intercept `fetch` calls at the network level for both server and client component tests — do not mock the global `fetch` function directly.
**Why:** MSW intercepts requests at the network layer, providing realistic behavior regardless of whether `fetch` is called from a Server Component, Route Handler, or Client Component; direct `fetch` mocks break across runtime boundaries and miss request/response details.

**Compliant:**

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/orders', () => {
    return HttpResponse.json([
      { id: '1', name: 'Widget', status: 'pending' },
      { id: '2', name: 'Gadget', status: 'completed' },
    ]);
  }),

  http.post('https://api.example.com/orders', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: '3', ...body, status: 'pending' },
      { status: 201 },
    );
  }),

  http.get('https://api.example.com/orders/:id', ({ params }) => {
    if (params.id === 'not-found') {
      return HttpResponse.json(
        { error: 'Not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ id: params.id, name: 'Widget', status: 'pending' });
  }),
];

// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// test/setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Usage in a test — no manual fetch mocking needed
import { render, screen } from '@testing-library/react';
import OrdersPage from '@/app/orders/page';

it('renders orders from the API', async () => {
  const jsx = await OrdersPage();
  render(jsx);

  expect(screen.getByText('Widget — pending')).toBeInTheDocument();
});
```

**Non-compliant:**

```typescript
// Direct fetch mock — breaks if implementation switches to a library like ky or axios
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([{ id: '1', name: 'Widget' }]),
});

// Does not test request details (headers, method, body)
// Does not work across server/client component boundaries
```

---

### NXT-05: Test Navigation and Routing

**Severity:** Warning
**Rule:** Test that links render the correct `href` values and that navigation-dependent components respond to route parameters — mock `next/navigation` hooks (`useRouter`, `usePathname`, `useSearchParams`) for client components that depend on them.
**Why:** Routing is a core concern in Next.js applications; verifying link targets and route-parameter handling prevents broken navigation that users encounter at runtime.

**Compliant:**

```tsx
// components/order-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'All Orders', href: '/orders' },
  { label: 'Pending', href: '/orders?status=pending' },
  { label: 'Completed', href: '/orders?status=completed' },
];

export function OrderNav() {
  const pathname = usePathname();

  return (
    <nav>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={pathname === tab.href ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

// components/order-nav.test.tsx
import { render, screen } from '@testing-library/react';
import { OrderNav } from './order-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/orders',
  useSearchParams: () => new URLSearchParams(),
}));

describe('OrderNav', () => {
  it('renders navigation links with correct hrefs', () => {
    render(<OrderNav />);

    expect(screen.getByText('All Orders')).toHaveAttribute('href', '/orders');
    expect(screen.getByText('Pending')).toHaveAttribute('href', '/orders?status=pending');
    expect(screen.getByText('Completed')).toHaveAttribute('href', '/orders?status=completed');
  });

  it('marks the current page link as active', () => {
    render(<OrderNav />);

    expect(screen.getByText('All Orders')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Pending')).not.toHaveAttribute('aria-current');
  });
});
```

**Non-compliant:**

```tsx
// No navigation tests — broken links discovered by users in production

// Testing navigation by clicking and asserting on URL changes
// with a full Next.js server — slow and flaky
it('navigates to pending orders', async () => {
  // Requires full app startup, real routing, wait for hydration...
});
```

---

### NXT-06: Test Server Actions as Functions

**Severity:** Warning
**Rule:** Test Server Actions by importing the function, calling it with the expected input, and asserting on the return value and side effects — test validation, authorization checks, and data mutations.
**Why:** Server Actions are regular async functions despite the `'use server'` directive; testing them directly is fast and verifies business logic without requiring form rendering or HTTP transport.

**Compliant:**

```typescript
// app/orders/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createOrder } from '@/lib/orders';

export async function createOrderAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const quantity = Number(formData.get('quantity'));

  if (!productId || isNaN(quantity) || quantity < 1) {
    return { error: 'Invalid order data' };
  }

  await createOrder({ productId, quantity });
  revalidatePath('/orders');

  return { success: true };
}

// app/orders/actions.test.ts
import { createOrderAction } from './actions';
import { createOrder } from '@/lib/orders';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/orders');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('createOrderAction', () => {
  it('creates an order and revalidates the orders page', async () => {
    vi.mocked(createOrder).mockResolvedValue({ id: '1' });

    const formData = new FormData();
    formData.set('productId', 'abc-123');
    formData.set('quantity', '3');

    const result = await createOrderAction(formData);

    expect(result).toEqual({ success: true });
    expect(createOrder).toHaveBeenCalledWith({ productId: 'abc-123', quantity: 3 });
    expect(revalidatePath).toHaveBeenCalledWith('/orders');
  });

  it('returns an error for missing productId', async () => {
    const formData = new FormData();
    formData.set('quantity', '3');

    const result = await createOrderAction(formData);

    expect(result).toEqual({ error: 'Invalid order data' });
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('returns an error for invalid quantity', async () => {
    const formData = new FormData();
    formData.set('productId', 'abc-123');
    formData.set('quantity', '-1');

    const result = await createOrderAction(formData);

    expect(result).toEqual({ error: 'Invalid order data' });
    expect(createOrder).not.toHaveBeenCalled();
  });
});
```

**Non-compliant:**

```typescript
// Testing server actions through the UI only — slow, brittle, and
// doesn't isolate the action's logic from rendering
it('submits the form', async () => {
  render(<NewOrderPage />);
  await userEvent.click(screen.getByText('Place Order'));
  // How do you assert the server action was called?
  // How do you test validation without rendering the form?
});

// No server action tests at all — mutations are only tested via E2E
```

## Customization

- **NXT-01 (Server Component testing)** — server component testing patterns are still evolving in the React ecosystem. Some teams prefer integration tests that render full page trees (including nested server and client components) over unit-testing individual server components. Both approaches are valid; the key requirement is that server-side data fetching and rendering logic is covered by automated tests.

- **NXT-04 (MSW)** — MSW setup in Next.js requires configuration for the Node.js server environment (not the browser service worker). Ensure `setupServer` from `msw/node` is used in test setup files. Some Next.js features like `fetch` extensions (`next.revalidate`, `next.tags`) may need additional handling in MSW handlers.

- **NXT-06 (Server Action testing)** — Server Actions that perform database mutations may need the same test infrastructure as integration tests (test database, seeding, cleanup). For actions with complex data dependencies, consider testing through the database layer rather than mocking it, following the integration testing standards.
