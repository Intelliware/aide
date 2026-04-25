# NestJS Standards

## Purpose

These standards define NestJS-specific coding rules that supplement the [common standards](../../common/) and [TypeScript standards](../../languages/typescript/). They cover module organization, dependency injection, validation, error handling, configuration, and API documentation conventions within the NestJS framework. Rules from common and TypeScript standards are not repeated here — they apply in full and are referenced where relevant.

## Applicability

All NestJS 10+ projects (TypeScript 5.0+, Node.js 18+). NestJS 9.x projects can follow most rules — check decorator and DI API differences in the NestJS migration guide.

## Rules

### NEST-01: Organize by Feature Module

**Severity:** Error
**Rule:** Create one module per domain feature — each module encapsulates its controllers, services, repositories, and DTOs; never dump unrelated providers into `AppModule`.
**Why:** Feature modules enforce separation of concerns, make dependency graphs explicit, and allow teams to work on features independently without merge conflicts in a monolithic module.

**Compliant:**

```typescript
// orders/orders.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}

// users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [OrdersModule, UsersModule, AuthModule, ConfigModule.forRoot()],
})
export class AppModule {}
```

**Non-compliant:**

```typescript
// Everything crammed into AppModule — no boundaries, no encapsulation
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product])],
  controllers: [
    OrdersController,
    UsersController,
    ProductsController,
    AuthController,
  ],
  providers: [
    OrdersService,
    UsersService,
    ProductsService,
    AuthService,
    OrdersRepository,
    UsersRepository,
    ProductsRepository,
  ],
})
export class AppModule {}
```

---

### NEST-02: Use Constructor Injection

**Severity:** Error
**Rule:** Inject dependencies via the constructor with TypeScript types — NestJS resolves them automatically from the IoC container; never use `ModuleRef.get()` for standard dependencies.
**Why:** Constructor injection makes dependencies explicit, enables compile-time type checking, and simplifies testing because every dependency is visible in the constructor signature.

**Compliant:**

```typescript
@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentsService: PaymentsService,
    private readonly logger: LoggerService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.save(dto);
    await this.paymentsService.initiate(order);
    this.logger.log('Order created', { orderId: order.id });
    return order;
  }
}
```

**Non-compliant:**

```typescript
@Injectable()
export class OrdersService {
  constructor(private readonly moduleRef: ModuleRef) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Service locator pattern — hides real dependencies, breaks static analysis
    const repo = this.moduleRef.get(OrdersRepository);
    const payments = this.moduleRef.get(PaymentsService);
    const logger = this.moduleRef.get(LoggerService);

    const order = await repo.save(dto);
    await payments.initiate(order);
    logger.log('Order created', { orderId: order.id });
    return order;
  }
}
```

---

### NEST-03: Use DTOs with class-validator

**Severity:** Error
**Rule:** Define request DTOs as classes decorated with `class-validator` decorators and apply `ValidationPipe` globally — never validate request bodies manually in controllers.
**Why:** Declarative validation on DTOs centralizes input rules, produces consistent error responses, and eliminates repetitive validation code scattered across controllers (see ERR-06 for boundary validation principles).

**Compliant:**

```typescript
// orders/dto/create-order.dto.ts
export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  items: OrderItemDto[];
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

// main.ts — apply once globally
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

**Non-compliant:**

```typescript
@Controller('orders')
export class OrdersController {
  @Post()
  async create(@Body() body: any) {
    // Manual validation in the controller — repetitive and inconsistent
    if (!body.customerId) {
      throw new BadRequestException('customerId is required');
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }
    for (const item of body.items) {
      if (!item.productId || typeof item.quantity !== 'number') {
        throw new BadRequestException('Invalid item');
      }
    }
    return this.ordersService.create(body);
  }
}
```

---

### NEST-04: Use Exception Filters for Error Handling

**Severity:** Error
**Rule:** Create custom exception filters or use NestJS built-in HTTP exceptions (`NotFoundException`, `ConflictException`, etc.) to handle errors — never try/catch in controllers to manually format error responses.
**Why:** Exception filters centralize error-to-HTTP-response mapping, ensuring a consistent error format across the entire API without repetitive boilerplate in every controller method (see ERR-01 for typed error classes, ERR-05 for user-facing message separation).

**Compliant:**

```typescript
// common/filters/app-error.filter.ts
@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception.message, {
      code: exception.code,
      context: exception.context,
      stack: exception.stack,
    });

    response.status(exception.httpStatus).json({
      error: {
        code: exception.code,
        message: exception.userMessage,
      },
    });
  }
}

// orders/orders.service.ts — throw domain errors, filter handles the rest
@Injectable()
export class OrdersService {
  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError(id);
    }
    return order;
  }
}
```

**Non-compliant:**

```typescript
@Controller('orders')
export class OrdersController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw new NotFoundException(error.message);
      }
      // Repeated in every controller method
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
```

---

### NEST-05: Use Guards for Authentication and Authorization

**Severity:** Error
**Rule:** Implement `CanActivate` guards for authentication and authorization logic — apply via `@UseGuards()` at the controller or method level, or globally; never check auth credentials inside controller method bodies.
**Why:** Guards run before the route handler in the NestJS execution pipeline, providing a clean separation between access control and business logic; inlining auth checks creates duplication and risks inconsistent enforcement.

**Compliant:**

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) return false;

    try {
      request.user = this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}

// Usage
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }
}
```

**Non-compliant:**

```typescript
@Controller('admin')
export class AdminController {
  @Get('users')
  async findAllUsers(@Headers('authorization') auth: string) {
    // Auth logic mixed into the controller method — duplicated everywhere
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    const user = this.jwtService.verify(token);
    if (!user.roles.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.findAllUsers();
  }
}
```

---

### NEST-06: Use Interceptors for Cross-Cutting Concerns

**Severity:** Warning
**Rule:** Implement `NestInterceptor` for logging, response transformation, caching, and timeout logic — interceptors wrap the execution pipeline; never duplicate cross-cutting logic across controllers.
**Why:** Interceptors apply behavior uniformly before and after handler execution without polluting controller methods, making cross-cutting concerns composable and testable in isolation.

**Compliant:**

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log('Request completed', {
          method,
          url,
          durationMs: Date.now() - start,
        });
      }),
    );
  }
}

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        throw err;
      }),
    );
  }
}
```

**Non-compliant:**

```typescript
@Controller('orders')
export class OrdersController {
  @Get()
  async findAll() {
    const start = Date.now();
    try {
      const result = await this.ordersService.findAll();
      this.logger.log('Request completed', { durationMs: Date.now() - start });
      return result;
    } catch (error) {
      this.logger.error('Request failed', { durationMs: Date.now() - start });
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Same logging boilerplate duplicated in every method
    const start = Date.now();
    try {
      const result = await this.ordersService.findOne(id);
      this.logger.log('Request completed', { durationMs: Date.now() - start });
      return result;
    } catch (error) {
      this.logger.error('Request failed', { durationMs: Date.now() - start });
      throw error;
    }
  }
}
```

---

### NEST-07: Use ConfigModule for Configuration

**Severity:** Error
**Rule:** Use `@nestjs/config` with a validation schema to load and validate configuration at startup — never access `process.env` directly in services or controllers.
**Why:** Centralized, validated configuration ensures type-safe access, prevents typo-induced runtime failures, and makes it obvious what each module requires (see ERR-10 for fail-fast on missing config).

**Compliant:**

```typescript
// config/app.config.ts
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  redisUrl: process.env.REDIS_URL,
}));

// config/config.validation.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  REDIS_URL: Joi.string().uri().required(),
});

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: true },
    }),
  ],
})
export class AppModule {}

// orders/orders.service.ts — inject typed config
@Injectable()
export class OrdersService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}
}
```

**Non-compliant:**

```typescript
@Injectable()
export class OrdersService {
  async processOrder(orderId: string): Promise<void> {
    // Direct process.env access — no validation, no type safety, easy to typo
    const apiKey = process.env.PAYMENT_API_KEY;
    const timeout = parseInt(process.env.PAYMENT_TIMEOUT || '');

    await fetch(`${process.env.PAYMENT_URL}/charge`, {
      headers: { Authorization: apiKey! },
      signal: AbortSignal.timeout(timeout || 5000),
    });
  }
}
```

---

### NEST-08: Use Pipes for Transformation

**Severity:** Warning
**Rule:** Use built-in pipes (`ParseIntPipe`, `ParseUUIDPipe`, `DefaultValuePipe`) and custom pipes to transform and validate route and query parameters — never manually parse or coerce path/query params in controllers.
**Why:** Pipes run before the handler and produce clear 400 errors with consistent formatting; manual parsing scatters coercion logic across handlers and produces inconsistent error messages.

**Compliant:**

```typescript
@Controller('orders')
export class OrdersController {
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.findAll({ page, limit });
  }

  @Get('status/:status')
  findByStatus(@Param('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus) {
    return this.ordersService.findByStatus(status);
  }
}
```

**Non-compliant:**

```typescript
@Controller('orders')
export class OrdersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    // Manual UUID validation — repeated in every method that takes a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.ordersService.findOne(id);
  }

  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    // Manual parsing — no error if page is "abc"
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    return this.ordersService.findAll({ page: pageNum, limit: limitNum });
  }
}
```

---

### NEST-09: Expose Health Checks

**Severity:** Error
**Rule:** Use `@nestjs/terminus` with health indicators for every external dependency (database, Redis, external APIs) — every service must expose a `/health` endpoint for orchestration readiness probes.
**Why:** Without health checks, workflows (Kubernetes, ECS) cannot distinguish a healthy service from a zombie process that has lost its database connection, leading to traffic routed to broken instances.

**Compliant:**

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.redis.pingCheck('redis', {
          transport: Transport.REDIS,
          options: { host: 'localhost', port: 6379 },
        }),
    ]);
  }
}

// health.module.ts
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

**Non-compliant:**

```typescript
// No health endpoint — workflow has no way to check readiness
@Module({
  imports: [OrdersModule, UsersModule],
})
export class AppModule {}

// Or a fake health check that always returns OK
@Get('health')
health() {
  return { status: 'ok' };
}
```

---

### NEST-10: Use OpenAPI Decorators

**Severity:** Convention
**Rule:** Decorate controllers and DTOs with `@nestjs/swagger` decorators — `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty` — so API documentation is generated from code, not maintained separately.
**Why:** Code-generated OpenAPI specs stay in sync with the implementation by definition; separately maintained docs drift and become misleading as the API evolves.

**Compliant:**

```typescript
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }
}

// DTOs with ApiProperty for schema generation
export class OrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.Pending })
  status: OrderStatus;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: string;
}
```

**Non-compliant:**

```typescript
// No decorators — Swagger UI shows empty schemas and no descriptions
@Controller('orders')
export class OrdersController {
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}

// DTO without ApiProperty — generated schema has no field descriptions or types
export class OrderResponseDto {
  id: string;
  status: OrderStatus;
  items: OrderItemResponseDto[];
}
```

## Customization

- **NEST-02 (Constructor injection):** Some advanced patterns legitimately require `ModuleRef` — for example, resolving request-scoped providers in a non-request context, lazy-loading heavy services, or creating instances dynamically from a factory. The rule targets the common anti-pattern of using `ModuleRef.get()` as a universal service locator instead of declaring dependencies explicitly.

- **NEST-03 (class-validator DTOs):** Some teams prefer `zod` with a custom `ZodValidationPipe` over `class-validator` decorators. Either approach satisfies the underlying principle (declarative schema-based validation at the boundary); choose one and apply it consistently across the project. The `class-validator` approach is the NestJS ecosystem default and has the deepest integration with `@nestjs/swagger` for automatic schema generation.

- **NEST-10 (OpenAPI decoration depth):** The level of detail in OpenAPI decorators varies by project needs. Public-facing APIs typically require comprehensive `@ApiProperty` descriptions, examples, and response schemas. Internal services may use minimal decorators (`@ApiTags`, `@ApiOperation`) with auto-inferred schemas from DTOs. Teams should agree on a minimum decoration level and enforce it via code review.
