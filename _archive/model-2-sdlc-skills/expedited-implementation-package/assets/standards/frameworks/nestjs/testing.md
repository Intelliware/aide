# NestJS Testing Standards

## Purpose

These standards define NestJS-specific testing rules that supplement the [common testing standards](../../common/testing/) and [TypeScript testing standards](../../languages/typescript/testing.md). They cover testing module setup, provider mocking, E2E testing with supertest, and strategies for testing NestJS primitives (guards, interceptors, filters, event handlers). General testing principles (test structure, naming, coverage thresholds, mock hygiene) are defined in the common standards and are not repeated here.

## Applicability

All NestJS 10+ projects (Jest 29+, TypeScript 5.0+). NestJS 9.x projects can follow most testing patterns — check `@nestjs/testing` API differences in the migration guide.

## Rules

### NSTT-01: Use `Test.createTestingModule()`

**Severity:** Error
**Rule:** Create a NestJS testing module for each test suite using `Test.createTestingModule()` — provide the class under test and mock its dependencies via the module's providers array.
**Why:** The testing module mirrors NestJS's dependency injection, ensuring the class under test is instantiated the same way it would be at runtime while keeping dependencies replaceable.

**Compliant:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let paymentsService: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            initiate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    ordersRepository = module.get(OrdersRepository);
    paymentsService = module.get(PaymentsService);
  });

  it('creates an order and initiates payment', async () => {
    const dto: CreateOrderDto = { customerId: 'c1', items: [{ productId: 'p1', quantity: 2 }] };
    const saved = { id: 'o1', ...dto, status: 'pending' };
    ordersRepository.save.mockResolvedValue(saved);
    paymentsService.initiate.mockResolvedValue(undefined);

    const result = await service.createOrder(dto);

    expect(result).toEqual(saved);
    expect(paymentsService.initiate).toHaveBeenCalledWith(saved);
  });
});
```

**Non-compliant:**

```typescript
describe('OrdersService', () => {
  it('creates an order', async () => {
    // Direct instantiation — bypasses DI, breaks if constructor changes
    const repo = { findById: jest.fn(), save: jest.fn() } as any;
    const payments = { initiate: jest.fn() } as any;
    const logger = { log: jest.fn() } as any;
    const service = new OrdersService(repo, payments, logger);

    await service.createOrder({ customerId: 'c1', items: [] });
    expect(repo.save).toHaveBeenCalled();
  });
});
```

---

### NSTT-02: Override Providers with Mocks

**Severity:** Error
**Rule:** Use `.overrideProvider(Token).useValue(mock)` to replace dependencies in the testing module — never modify the real module's provider list; provide typed mock objects that satisfy the dependency interface.
**Why:** `overrideProvider` lets you import the real module unchanged and surgically replace specific dependencies, keeping tests aligned with production wiring while isolating the unit under test.

**Compliant:**

```typescript
describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const mockOrdersService: Partial<jest.Mocked<OrdersService>> = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
    };

    const module = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(OrdersService)
      .useValue(mockOrdersService)
      .overrideProvider(OrdersRepository)
      .useValue({})
      .compile();

    controller = module.get(OrdersController);
    ordersService = module.get(OrdersService);
  });

  it('returns the created order', async () => {
    const expected = { id: 'o1', status: 'pending' } as Order;
    ordersService.create.mockResolvedValue(expected);

    const result = await controller.create({ customerId: 'c1', items: [] });

    expect(result).toEqual(expected);
  });
});
```

**Non-compliant:**

```typescript
describe('OrdersController', () => {
  beforeEach(async () => {
    // Modifying the real module's providers — tightly coupled to module internals
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        OrdersRepository,
        PaymentsService,
        LoggerService,
        // Forgot a provider? Runtime error with a cryptic DI message
      ],
    }).compile();
  });
});
```

---

### NSTT-03: Use Supertest for Controller and E2E Tests

**Severity:** Error
**Rule:** Create a NestJS application in `beforeAll`, use `request(app.getHttpServer())` from supertest to test HTTP endpoints — verify status codes, response bodies, and headers.
**Why:** Supertest exercises the full HTTP pipeline (middleware, guards, pipes, interceptors, filters) in-process without network overhead, catching integration issues that unit-testing a controller method alone would miss.

**Compliant:**

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentsService)
      .useValue({ initiate: jest.fn() })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /orders returns 201 with valid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({ customerId: '550e8400-e29b-41d4-a716-446655440000', items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1 }] })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('pending');
  });

  it('POST /orders returns 400 for invalid input', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ customerId: 'not-a-uuid', items: [] })
      .expect(400);
  });

  it('GET /orders/:id returns 404 for missing order', async () => {
    await request(app.getHttpServer())
      .get('/orders/550e8400-e29b-41d4-a716-446655440099')
      .expect(404);
  });
});
```

**Non-compliant:**

```typescript
describe('OrdersController (e2e)', () => {
  it('creates an order', async () => {
    // Calling the controller method directly — skips pipes, guards, interceptors
    const controller = module.get(OrdersController);
    const result = await controller.create({
      customerId: 'c1',
      items: [{ productId: 'p1', quantity: 1 }],
    });
    expect(result).toBeDefined();
  });
});
```

---

### NSTT-04: Mock Repositories, Not the Database

**Severity:** Warning
**Rule:** Provide mock repository implementations in the testing module to test service logic in isolation — reserve real database operations for integration tests.
**Why:** Mocking at the repository boundary keeps unit tests fast and deterministic while still verifying all service logic; real database interactions are covered by dedicated integration tests (see IT-03 and IT-04 for container-based and real database testing standards).

**Compliant:**

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(service.getUser('nonexistent')).rejects.toThrow(UserNotFoundError);
  });

  it('returns the user when found', async () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com' };
    usersRepository.findById.mockResolvedValue(user);

    const result = await service.getUser('u1');

    expect(result).toEqual(user);
  });
});
```

**Non-compliant:**

```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    // Connecting to a real database in unit tests — slow, flaky, non-deterministic
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ type: 'postgres', url: 'postgresql://localhost/test' }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService, UsersRepository],
    }).compile();

    service = module.get(UsersService);
  });

  it('returns user', async () => {
    // Depends on database state — which seed data? what if another test modified it?
    const user = await service.getUser('u1');
    expect(user).toBeDefined();
  });
});
```

---

### NSTT-05: Test Guards Independently

**Severity:** Warning
**Rule:** Instantiate the guard directly, provide a mock `ExecutionContext`, and call `canActivate()` — test all auth scenarios including valid token, expired token, missing token, and wrong role.
**Why:** Guards are pure logic units that take a context and return a boolean; testing them in isolation is fast, comprehensive, and avoids the overhead of bootstrapping an HTTP server for every auth edge case.

**Compliant:**

```typescript
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    jwtService = module.get(JwtService);
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: authHeader },
          user: undefined,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('allows access with a valid token', () => {
    jwtService.verify.mockReturnValue({ sub: 'user-1', roles: ['user'] });
    const context = createMockContext('Bearer valid.jwt.token');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when no authorization header is present', () => {
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies access when the token is expired', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const context = createMockContext('Bearer expired.jwt.token');

    expect(guard.canActivate(context)).toBe(false);
  });
});
```

**Non-compliant:**

```typescript
describe('JwtAuthGuard', () => {
  it('protects the route', async () => {
    // Full E2E setup just to test guard logic — slow and overcomplicated
    const app = (await Test.createTestingModule({ imports: [AppModule] }).compile())
      .createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get('/admin/users')
      .expect(401);

    await app.close();
  });
});
```

---

### NSTT-06: Test Interceptors with Mock Call Handlers

**Severity:** Warning
**Rule:** Create a mock `CallHandler` that returns an `Observable`, pass it to `intercept()` with a mock `ExecutionContext` — verify that the interceptor transforms the response or applies side effects correctly.
**Why:** Interceptors are composable pipeline wrappers; testing them with a mock handler verifies their behavior in isolation without needing a running server or real route handlers.

**Compliant:**

```typescript
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: LoggerService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    interceptor = module.get(LoggingInterceptor);
    logger = module.get(LoggerService);
  });

  it('logs the request method, URL, and duration', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/orders' }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      complete: () => {
        expect(logger.log).toHaveBeenCalledWith(
          'Request completed',
          expect.objectContaining({ method: 'GET', url: '/orders' }),
        );
        done();
      },
    });
  });
});

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get(TransformInterceptor);
  });

  it('wraps the response in a data envelope', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockHandler: CallHandler = {
      handle: () => of({ id: '1', name: 'Order' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result).toEqual({ data: { id: '1', name: 'Order' } });
      done();
    });
  });
});
```

**Non-compliant:**

```typescript
describe('LoggingInterceptor', () => {
  it('logs requests', async () => {
    // Bootstrapping a full app to test an interceptor
    const app = (await Test.createTestingModule({ imports: [AppModule] }).compile())
      .createNestApplication();
    app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()));
    await app.init();

    await request(app.getHttpServer()).get('/orders').expect(200);
    // No assertion on what the interceptor actually logged
    await app.close();
  });
});
```

---

### NSTT-07: Test Exception Filters with Mock Contexts

**Severity:** Warning
**Rule:** Provide a mock `ArgumentsHost` with a mock response object, invoke the filter's `catch()` method with the exception, and verify the HTTP status code and response body.
**Why:** Exception filters are pure mappers from exception to HTTP response; testing them with a mock host verifies the mapping logic without any HTTP overhead.

**Compliant:**

```typescript
describe('AppErrorFilter', () => {
  let filter: AppErrorFilter;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AppErrorFilter,
        { provide: LoggerService, useValue: { error: jest.fn() } },
      ],
    }).compile();

    filter = module.get(AppErrorFilter);
    logger = module.get(LoggerService);
  });

  it('maps OrderNotFoundError to a 404 response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/orders/123' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new OrderNotFoundError('123');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'ORDER_NOT_FOUND',
        message: exception.userMessage,
      },
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('maps InsufficientStockError to a 409 response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/orders' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new InsufficientStockError('p1', 10, 3);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }),
      }),
    );
  });
});
```

**Non-compliant:**

```typescript
describe('AppErrorFilter', () => {
  it('handles errors', async () => {
    // No mock context — testing the filter by throwing inside a real controller
    const app = (await Test.createTestingModule({ imports: [AppModule] }).compile())
      .createNestApplication();
    await app.init();

    // Only tests the happy path; doesn't verify status, body, or logging
    await request(app.getHttpServer()).get('/orders/nonexistent').expect(404);
    await app.close();
  });
});
```

---

### NSTT-08: Test Events with Mock Event Emitters

**Severity:** Convention
**Rule:** When using `@nestjs/event-emitter`, mock `EventEmitter2` in the testing module — verify events are emitted with the correct event name and payload; test event handlers independently by invoking them directly with the event payload.
**Why:** Decoupling event emission tests from handler tests ensures each side can be verified in isolation; testing them together creates brittle tests that break when either side changes.

**Compliant:**

```typescript
describe('OrdersService (event emission)', () => {
  let service: OrdersService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: { save: jest.fn().mockResolvedValue({ id: 'o1', status: 'pending' }) } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(OrdersService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('emits order.created event after saving', async () => {
    await service.createOrder({ customerId: 'c1', items: [] });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'order.created',
      expect.objectContaining({ orderId: 'o1' }),
    );
  });
});

describe('OrderNotificationHandler', () => {
  let handler: OrderNotificationHandler;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderNotificationHandler,
        { provide: NotificationService, useValue: { send: jest.fn() } },
      ],
    }).compile();

    handler = module.get(OrderNotificationHandler);
    notificationService = module.get(NotificationService);
  });

  it('sends a notification when order.created event is received', async () => {
    const event = { orderId: 'o1', customerId: 'c1' };

    await handler.handleOrderCreated(event);

    expect(notificationService.send).toHaveBeenCalledWith(
      'c1',
      expect.stringContaining('o1'),
    );
  });
});
```

**Non-compliant:**

```typescript
describe('Order events', () => {
  it('sends notification on order creation', async () => {
    // Real EventEmitter2 wired up — test depends on timing and handler registration order
    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), OrdersModule, NotificationsModule],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const service = module.get(OrdersService);
    await service.createOrder({ customerId: 'c1', items: [] });

    // Race condition: notification may not have been sent yet
    // No way to assert without arbitrary delays
    await new Promise((resolve) => setTimeout(resolve, 500));
    // ...
  });
});
```

## Customization

- **NSTT-03 (Supertest E2E):** Some teams use `@nestjs/testing`'s built-in HTTP testing utilities or Pact for contract-based E2E tests. The principle is the same — exercise the full HTTP pipeline in-process — the specific HTTP client is secondary.

- **NSTT-04 (Mock repositories):** Integration tests that verify real database operations are covered by common integration testing standards IT-03 (container-based dependencies) and IT-04 (real database operations). This rule applies specifically to unit-level service tests where the repository is the isolation boundary.

- **NSTT-08 (Event testing):** The event testing approach depends on the event library in use. Teams using `@nestjs/cqrs` should apply the same principle — mock the `EventBus` and test command/event handlers independently. Teams using raw Node.js `EventEmitter` or third-party libraries like `bullmq` for job queues should adapt the mock pattern accordingly.
