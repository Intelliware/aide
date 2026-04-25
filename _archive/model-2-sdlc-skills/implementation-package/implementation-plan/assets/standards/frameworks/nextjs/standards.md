# Next.js Standards

## Purpose

These standards define Next.js-specific conventions for building applications with the App Router architecture. They supplement the React standards (RC-xx) and common standards (ERR-xx, API-xx, etc.) — those rules still apply in full and are not repeated here. This document adds rules for server/client component boundaries, data fetching, routing conventions, caching, and other Next.js primitives that have no equivalent in plain React.

## Applicability

All Next.js projects using the App Router (`app/` directory). Projects still on the Pages Router should migrate incrementally; new routes must follow these standards.

## Rules

### NX-01: Use the App Router

**Severity:** Error
**Rule:** Structure applications using the `app/` directory with file-based routing conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) — do not use the legacy `pages/` directory for new projects.
**Why:** The App Router unlocks Server Components, nested layouts, streaming, and the full Next.js feature set that the Pages Router cannot support.

**Compliant:**

```
app/
├── layout.tsx          # Root layout with <html> and <body>
├── page.tsx            # Home page (/)
├── loading.tsx         # Root loading UI
├── error.tsx           # Root error boundary
├── orders/
│   ├── layout.tsx      # Orders section layout
│   ├── page.tsx        # Orders list (/orders)
│   ├── loading.tsx
│   ├── error.tsx
│   └── [id]/
│       ├── page.tsx    # Order detail (/orders/:id)
│       └── loading.tsx
└── api/
    └── orders/
        └── route.ts    # API route handler (/api/orders)
```

**Non-compliant:**

```
pages/
├── _app.tsx
├── index.tsx
├── orders/
│   ├── index.tsx
│   └── [id].tsx
└── api/
    └── orders.ts
```

---

### NX-02: Default to Server Components

**Severity:** Error
**Rule:** Components are Server Components by default — only add `'use client'` when the component needs browser APIs, event handlers, or React hooks like `useState`/`useEffect`.
**Why:** Server Components eliminate client-side JavaScript for non-interactive UI, reduce bundle size, and enable direct access to server-side resources without API round-trips.

**Compliant:**

```tsx
// app/orders/page.tsx — Server Component (no directive needed)
import { getOrders } from '@/lib/orders';

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1>Orders</h1>
      <OrderList orders={orders} />
      <OrderFilter />  {/* Only this child needs 'use client' */}
    </div>
  );
}

// components/order-filter.tsx — Client Component (needs interactivity)
'use client';

import { useState } from 'react';

export function OrderFilter() {
  const [status, setStatus] = useState('all');

  return (
    <select value={status} onChange={(e) => setStatus(e.target.value)}>
      <option value="all">All</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>
  );
}
```

**Non-compliant:**

```tsx
// Entire page marked as client — loses all server component benefits
'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setOrders);
  }, []);

  return <OrderList orders={orders} />;
}
```

---

### NX-03: Fetch Data in Server Components

**Severity:** Error
**Rule:** Fetch data using `async` Server Components with direct database or API calls — do not use `useEffect` for data fetching in server-rendered pages; reserve client-side fetching for interactive or real-time data only.
**Why:** Server-side data fetching eliminates client-server waterfalls, prevents layout shift from loading states, and keeps credentials and queries off the client.

**Compliant:**

```tsx
// app/orders/[id]/page.tsx — data fetched on the server
import { getOrder } from '@/lib/orders';
import { notFound } from 'next/navigation';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <article>
      <h1>Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      <OrderTimeline events={order.events} />
      <LiveOrderTracker orderId={order.id} /> {/* Client-side: real-time updates */}
    </article>
  );
}
```

**Non-compliant:**

```tsx
// Server-rendered page using useEffect for its primary data — defeats SSR
'use client';

import { useEffect, useState } from 'react';

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  return <div>{order?.status}</div>;
}
```

---

### NX-04: Use Route Handlers for API Endpoints

**Severity:** Error
**Rule:** Define API endpoints as Route Handlers in `app/api/` using typed `NextRequest` and `NextResponse` — follow REST API design standards (see API-01 through API-12) for naming, status codes, and error formats.
**Why:** Route Handlers integrate with the App Router's caching, middleware, and typing system, and colocating them in `app/api/` keeps the API surface discoverable.

**Compliant:**

```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/lib/schemas/order';
import { createOrder, listOrders } from '@/lib/orders';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');

  const orders = await listOrders({ status });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = CreateOrderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', details: result.error.issues } },
      { status: 400 },
    );
  }

  const order = await createOrder(result.data);

  return NextResponse.json(order, { status: 201 });
}
```

**Non-compliant:**

```typescript
// pages/api/orders.ts — Pages Router API route
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const order = createOrder(req.body); // no validation
    res.status(200).json(order);         // wrong status code for creation
  }
}
```

---

### NX-05: Implement Loading and Error Boundaries

**Severity:** Error
**Rule:** Every route segment should have a `loading.tsx` for pending states and an `error.tsx` for error recovery — users must never see a blank screen during data fetching or an unhandled error.
**Why:** Next.js uses these files as automatic Suspense and error boundaries; without them, slow fetches show nothing and errors crash the nearest parent boundary or the entire page.

**Compliant:**

```tsx
// app/orders/loading.tsx
export default function OrdersLoading() {
  return (
    <div role="status" aria-label="Loading orders">
      <OrderListSkeleton count={5} />
    </div>
  );
}

// app/orders/error.tsx
'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrdersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error('Orders page error', { digest: error.digest });
  }, [error]);

  return (
    <div role="alert">
      <h2>Failed to load orders</h2>
      <p>Something went wrong. Please try again.</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

**Non-compliant:**

```tsx
// No loading.tsx — user sees a blank page while data fetches
// No error.tsx — errors propagate to the root and crash the entire app

// Inline loading state that doesn't leverage Suspense
export default async function OrdersPage() {
  let orders;
  try {
    orders = await getOrders();
  } catch {
    return <p>Error</p>; // No retry, no logging, no error reporting
  }

  return orders ? <OrderList orders={orders} /> : <p>Loading...</p>;
}
```

---

### NX-06: Use Next.js Image Component

**Severity:** Warning
**Rule:** Use `next/image` with explicit `width`/`height` or `fill` for all images — never use raw `<img>` tags.
**Why:** `next/image` provides automatic format conversion, responsive sizing, lazy loading, and prevents Cumulative Layout Shift — raw `<img>` tags miss all these optimizations and harm Core Web Vitals.

**Compliant:**

```tsx
import Image from 'next/image';

// Fixed dimensions — known size
function ProductCard({ product }: { product: Product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={300}
      height={200}
      sizes="(max-width: 768px) 100vw, 300px"
      priority={false}
    />
  );
}

// Fill mode — parent determines size
function HeroBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[400px] w-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
        priority // Above the fold — disable lazy loading
      />
    </div>
  );
}
```

**Non-compliant:**

```tsx
// Raw <img> — no optimization, no lazy loading, causes layout shift
function ProductCard({ product }: { product: Product }) {
  return <img src={product.imageUrl} alt={product.name} />;
}

// next/image without width/height or fill — TypeScript will error,
// but dynamically bypassing it causes layout shift
function Avatar({ url }: { url: string }) {
  return <Image src={url} alt="avatar" width={0} height={0} />;
}
```

---

### NX-07: Use Metadata API for SEO

**Severity:** Warning
**Rule:** Define page metadata using `export const metadata` for static metadata or `generateMetadata()` for dynamic metadata in layouts and pages — never use manual `<head>` tags or `next/head`.
**Why:** The Metadata API is type-safe, composable across nested layouts, and automatically handles deduplication and streaming — manual `<head>` manipulation bypasses these guarantees.

**Compliant:**

```tsx
// app/layout.tsx — static metadata for the site
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Store',
    default: 'Acme Store',
  },
  description: 'The best store for widgets and gadgets.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
};

// app/orders/[id]/page.tsx — dynamic metadata per order
import type { Metadata } from 'next';
import { getOrder } from '@/lib/orders';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: OrderPageProps,
): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrder(id);

  return {
    title: `Order #${order.id}`,
    description: `Details for order #${order.id} — ${order.status}`,
  };
}
```

**Non-compliant:**

```tsx
// Manual <Head> from next/head — Pages Router pattern, not composable
import Head from 'next/head';

export default function OrderPage({ order }) {
  return (
    <>
      <Head>
        <title>Order #{order.id}</title>
        <meta name="description" content={`Order ${order.id}`} />
      </Head>
      <div>{order.status}</div>
    </>
  );
}
```

---

### NX-08: Implement Middleware for Cross-Cutting Concerns

**Severity:** Convention
**Rule:** Use `middleware.ts` at the project root for cross-cutting concerns like authentication redirects, geolocation routing, and A/B testing — it runs at the edge before rendering, so do not duplicate these checks in every page or layout.
**Why:** Middleware provides a single enforcement point that runs before any page code executes, ensuring security and routing logic cannot be bypassed by adding new routes.

**Compliant:**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const publicPaths = ['/login', '/register', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = await verifySession(request);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const headers = new Headers(request.headers);
  headers.set('x-user-id', session.userId);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Non-compliant:**

```tsx
// Auth check duplicated in every page — easy to miss in new routes
export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const orders = await getOrders(session.userId);
  return <OrderList orders={orders} />;
}

// Same check copied in another page
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <Profile user={session.user} />;
}
```

---

### NX-09: Use Server Actions for Mutations

**Severity:** Convention
**Rule:** Use `'use server'` functions for form submissions and data mutations — they provide type-safe RPC, progressive enhancement, and eliminate the need for manual API routes for simple mutations.
**Why:** Server Actions reduce boilerplate by removing the API route + fetch + error handling layer, and forms work even before JavaScript loads on the client.

**Compliant:**

```tsx
// app/orders/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createOrder } from '@/lib/orders';

const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export async function createOrderAction(formData: FormData) {
  const result = CreateOrderSchema.safeParse({
    productId: formData.get('productId'),
    quantity: Number(formData.get('quantity')),
  });

  if (!result.success) {
    return { error: 'Invalid order data' };
  }

  await createOrder(result.data);
  revalidatePath('/orders');

  return { success: true };
}

// app/orders/new/page.tsx
import { createOrderAction } from '../actions';

export default function NewOrderPage() {
  return (
    <form action={createOrderAction}>
      <input type="hidden" name="productId" value="abc-123" />
      <label>
        Quantity
        <input type="number" name="quantity" min="1" required />
      </label>
      <button type="submit">Place Order</button>
    </form>
  );
}
```

**Non-compliant:**

```tsx
// Manual API route + client-side fetch for a simple form submission
'use client';

export default function NewOrderPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);

    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ productId: form.get('productId') }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) { /* manual error handling */ }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

### NX-10: Configure Caching Intentionally

**Severity:** Warning
**Rule:** Explicitly configure caching behavior per route segment using `revalidate`, `dynamic`, and `fetchCache` — do not rely on implicit default caching behavior.
**Why:** Next.js caching is multi-layered (request memoization, data cache, full route cache, router cache) and defaults can cause stale data bugs that are difficult to diagnose — explicit configuration makes caching behavior predictable and reviewable.

**Compliant:**

```tsx
// app/orders/page.tsx — revalidate every 60 seconds
import { getOrders } from '@/lib/orders';

export const revalidate = 60;

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}

// app/orders/[id]/page.tsx — always dynamic (user-specific data)
export const dynamic = 'force-dynamic';

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await getOrder(id);
  return <OrderDetail order={order} />;
}

// lib/orders.ts — per-fetch caching configuration
export async function getOrders(): Promise<Order[]> {
  const res = await fetch('https://api.example.com/orders', {
    next: { revalidate: 60, tags: ['orders'] },
  });
  return res.json();
}

// app/api/orders/route.ts — on-demand revalidation
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const order = await createOrder(await request.json());
  revalidateTag('orders');
  return NextResponse.json(order, { status: 201 });
}
```

**Non-compliant:**

```tsx
// No caching config — relies on opaque defaults; might be cached forever
// or never cached depending on Next.js version and deployment platform
export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}

// fetch without cache config — behavior varies by Next.js version
async function getOrders() {
  const res = await fetch('https://api.example.com/orders');
  return res.json();
}
```

## Customization

- **NX-02 (Server vs. Client Components)** — the server/client boundary is the biggest mental shift from traditional React. Some teams start with more `'use client'` directives and progressively move components to the server as they gain confidence. This is acceptable as a migration strategy, but the target state should be server-first with client boundaries pushed as far down the component tree as possible.

- **NX-09 (Server Actions)** — Server Actions are a newer pattern and some teams prefer explicit API routes for all mutations, especially when they need fine-grained control over HTTP semantics (custom status codes, headers, streaming responses). Either approach satisfies these standards as long as mutations are validated (see ERR-06) and errors are handled (see ERR-03).

- **NX-10 (Caching)** — caching is the most complex aspect of Next.js and strategies vary significantly by deployment target (Vercel, self-hosted, Docker). Teams should document their caching strategy per route segment and test cache invalidation paths. The specific `revalidate` values and `dynamic` settings depend entirely on the application's data freshness requirements.
