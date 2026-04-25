# Spring Boot Standards

## Purpose

These standards define Spring Boot-specific coding rules that supplement the [common standards](../../common/) and [Java](../../languages/java/) / [Kotlin](../../languages/kotlin/) standards. They cover dependency injection, configuration management, operational readiness, transaction handling, and framework-idiomatic patterns. Rules from common and language-level standards are not repeated here — they apply in full and are referenced where relevant.

## Applicability

All Spring Boot 3.x+ projects (Java 17+ or Kotlin 1.9+). Spring Boot 2.x projects can follow the architectural rules but must adapt for the `javax` → `jakarta` namespace change and the removal of `WebSecurityConfigurerAdapter` in Spring Security 6.0+.

## Rules

### SB-01: Use Constructor Injection

**Severity:** Error
**Rule:** Inject dependencies through constructors with `final` fields — never use field injection with `@Autowired`.
**Why:** Constructor injection makes dependencies explicit, enforces immutability, enables straightforward unit testing without a Spring context, and fails fast at startup when a dependency is missing.

**Compliant:**

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final EventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository,
                        PaymentGateway paymentGateway,
                        EventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
        this.eventPublisher = eventPublisher;
    }
}
```

**Non-compliant:**

```java
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentGateway paymentGateway;

    @Autowired
    private EventPublisher eventPublisher;
}
```

---

### SB-02: Use Profiles for Environment Configuration

**Severity:** Error
**Rule:** Use Spring profiles (`@Profile`, `application-{profile}.yml`) to separate environment-specific configuration — never hardcode environment-specific values in code or in the default `application.yml`.
**Why:** Hardcoded environment values cause deployments to break when moving between environments and risk leaking production credentials into lower environments. See [ERR-10](../../common/error-handling.md#err-10-fail-fast-on-unrecoverable-errors) for fail-fast validation of required configuration at startup.

**Compliant:**

```yaml
# application.yml — shared defaults
spring:
  application:
    name: order-service

# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orders_dev

# application-prod.yml
spring:
  datasource:
    url: ${DATABASE_URL}
```

```java
@Configuration
@Profile("dev")
public class DevDataSeeder {

    @Bean
    CommandLineRunner seedTestData(OrderRepository repository) {
        return args -> {
            repository.save(new Order("test-order-1", BigDecimal.TEN));
        };
    }
}
```

**Non-compliant:**

```java
@Service
public class PaymentService {

    public void processPayment(Order order) {
        String apiUrl = "https://api.stripe.com/v1/charges";
        // ...
    }
}
```

```yaml
# application.yml — production secrets in the default config
spring:
  datasource:
    url: jdbc:postgresql://prod-db:5432/orders
    password: s3cret_prod_pw
```

---

### SB-03: Use Spring Boot Actuator for Operations

**Severity:** Warning
**Rule:** Enable Spring Boot Actuator with at minimum `/actuator/health`, `/actuator/info`, and `/actuator/metrics` endpoints — implement custom health indicators for every critical external dependency.
**Why:** Actuator endpoints are the standard interface for load balancers, Kubernetes probes, and monitoring systems; without them, production issues are detected by user complaints instead of automated checks.

**Compliant:**

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  endpoint:
    health:
      show-details: when-authorized
```

```java
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentGateway paymentGateway;

    public PaymentGatewayHealthIndicator(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    @Override
    public Health health() {
        try {
            paymentGateway.ping();
            return Health.up()
                    .withDetail("provider", "stripe")
                    .build();
        } catch (Exception ex) {
            return Health.down(ex)
                    .withDetail("provider", "stripe")
                    .build();
        }
    }
}
```

**Non-compliant:**

```java
@RestController
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
```

---

### SB-04: Use Spring Boot Starters

**Severity:** Warning
**Rule:** Use official Spring Boot starters (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, etc.) — never manually assemble individual Spring module dependencies.
**Why:** Starters curate compatible dependency versions through the Spring Boot BOM; manually picking versions leads to classpath conflicts, missing transitive dependencies, and hours of debugging `NoSuchMethodError` at runtime.

**Compliant:**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

**Non-compliant:**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>6.1.4</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>6.1.3</version> <!-- version mismatch with spring-web -->
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.15.0</version>
    </dependency>
    <!-- missing embedded server, missing auto-configuration -->
</dependencies>
```

---

### SB-05: Use `@ControllerAdvice` for Exception Handling

**Severity:** Error
**Rule:** Centralize REST API exception handling in `@ControllerAdvice` classes with `@ExceptionHandler` methods — never put try/catch blocks in individual controller methods for error response formatting.
**Why:** Scattered try/catch in controllers duplicates error-to-response mapping logic, produces inconsistent error formats across endpoints, and makes it easy to miss error cases. See [ERR-04](../../common/error-handling.md#err-04-use-error-boundaries) for the general error boundary principle.

**Compliant:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(OrderNotFoundException ex) {
        var error = new ErrorResponse(ex.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        var error = new ErrorResponse("VALIDATION_ERROR", "Request validation failed", details);
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        var error = new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

**Non-compliant:**

```java
@RestController
public class OrderController {

    @GetMapping("/api/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            Order order = orderService.findById(id);
            return ResponseEntity.ok(order);
        } catch (OrderNotFoundException ex) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Something went wrong"));
        }
    }
}
```

---

### SB-06: Use `@Transactional` Correctly

**Severity:** Error
**Rule:** Annotate service-layer methods with `@Transactional` — never place it on repository interfaces or controller methods — and use `readOnly = true` for query-only operations.
**Why:** Transactions on controllers couple HTTP handling to transaction lifecycle; transactions on repositories are too granular for multi-step operations. The `readOnly` flag enables database optimizations like skipping dirty checks and routing to read replicas.

**Compliant:**

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public Order placeOrder(CreateOrderRequest request) {
        inventoryService.reserve(request.getItems());
        Order order = Order.create(request);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public OrderDetails getOrderDetails(String orderId) {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
    }
}
```

**Non-compliant:**

```java
@RestController
public class OrderController {

    @Transactional // wrong layer — transaction tied to HTTP lifecycle
    @PostMapping("/api/orders")
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.placeOrder(request);
    }
}

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @Transactional // too granular — can't span multiple repo calls
    Order findByCustomerId(String customerId);
}
```

---

### SB-07: Use Async Processing with `@Async` and `@EnableAsync`

**Severity:** Warning
**Rule:** Offload non-critical work using Spring's `@Async` with a configured `ThreadPoolTaskExecutor` — never create raw `Thread` instances or use `CompletableFuture.supplyAsync()` with the common fork-join pool.
**Why:** Spring-managed executors are observable (metrics, graceful shutdown), configurable, and integrated with the application context; raw threads bypass all of this and risk unbounded thread creation under load.

**Compliant:**

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("notification-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {

    @Async("notificationExecutor")
    public void sendOrderConfirmation(Order order) {
        emailService.send(order.getCustomerEmail(), buildConfirmationEmail(order));
    }
}
```

**Non-compliant:**

```java
@Service
public class NotificationService {

    public void sendOrderConfirmation(Order order) {
        new Thread(() -> {
            emailService.send(order.getCustomerEmail(), buildConfirmationEmail(order));
        }).start();
    }
}

@Service
public class ReportService {

    public CompletableFuture<Report> generateReport(String reportId) {
        return CompletableFuture.supplyAsync(() -> {
            // runs on ForkJoinPool.commonPool — shared, unbounded, no graceful shutdown
            return buildReport(reportId);
        });
    }
}
```

---

### SB-08: Use Spring Events for Decoupling

**Severity:** Convention
**Rule:** Decouple cross-cutting side effects using `ApplicationEventPublisher` and `@EventListener` or `@TransactionalEventListener` — never have a service method directly call multiple unrelated services for side effects.
**Why:** Direct service-to-service calls create tight coupling; adding a new side effect (audit log, notification, cache invalidation) requires modifying the original service. See [DP-08](../../common/design-patterns.md#dp-08-observer--event-emitter) for the general Observer pattern.

**Compliant:**

```java
public record OrderPlacedEvent(String orderId, String customerId, BigDecimal total) {}

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository,
                        ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Order placeOrder(CreateOrderRequest request) {
        Order order = Order.create(request);
        orderRepository.save(order);
        eventPublisher.publishEvent(
                new OrderPlacedEvent(order.getId(), order.getCustomerId(), order.getTotal()));
        return order;
    }
}

@Component
public class OrderNotificationListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        notificationService.sendConfirmation(event.orderId(), event.customerId());
    }
}

@Component
public class InventoryReservationListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        inventoryService.confirmReservation(event.orderId());
    }
}
```

**Non-compliant:**

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final AuditService auditService;
    private final AnalyticsService analyticsService;

    @Transactional
    public Order placeOrder(CreateOrderRequest request) {
        Order order = Order.create(request);
        orderRepository.save(order);

        notificationService.sendConfirmation(order);
        inventoryService.confirmReservation(order);
        auditService.logOrderPlaced(order);
        analyticsService.trackOrder(order);

        return order;
    }
}
```

---

### SB-09: Use `@ConfigurationProperties` for Typed Config

**Severity:** Warning
**Rule:** Bind configuration to typed POJOs using `@ConfigurationProperties` with `@Validated` and JSR-303 annotations — never scatter `@Value` annotations throughout the codebase.
**Why:** Typed config objects are validated at startup, discoverable via IDE navigation, testable as units, and self-documenting; `@Value` strings are stringly-typed, fail at first use rather than startup, and are invisible to refactoring tools.

**Compliant:**

```java
@Validated
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    @NotBlank
    private String apiKey;

    @NotNull
    private URI baseUrl;

    @Min(1)
    @Max(30)
    private int timeoutSeconds = 10;

    @Min(0)
    @Max(5)
    private int maxRetries = 3;

    // getters and setters
}

@Service
public class PaymentGateway {

    private final PaymentProperties config;

    public PaymentGateway(PaymentProperties config) {
        this.config = config;
    }

    public PaymentResult charge(Order order) {
        return httpClient.post(config.getBaseUrl() + "/charges")
                .header("Authorization", "Bearer " + config.getApiKey())
                .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                .body(order)
                .execute();
    }
}
```

**Non-compliant:**

```java
@Service
public class PaymentGateway {

    @Value("${app.payment.api-key}")
    private String apiKey;

    @Value("${app.payment.base-url}")
    private String baseUrl;

    @Value("${app.payment.timeout-seconds:10}")
    private int timeoutSeconds;

    @Value("${app.payment.max-retries:3}")
    private int maxRetries;
}
```

---

### SB-10: Use Custom Health Indicators

**Severity:** Warning
**Rule:** Implement `HealthIndicator` for each critical external dependency (database, message broker, cache, external API) — return `UP` or `DOWN` with diagnostic details.
**Why:** Generic health checks only confirm the JVM is running; custom health indicators reveal whether the service can actually do its job, enabling Kubernetes readiness probes and alerting to distinguish between "the pod is alive" and "the pod can serve traffic."

**Compliant:**

```java
@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisTemplate<String, String> redisTemplate;

    public RedisHealthIndicator(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Health health() {
        try {
            String result = redisTemplate.getConnectionFactory()
                    .getConnection().ping();
            return Health.up()
                    .withDetail("response", result)
                    .build();
        } catch (Exception ex) {
            return Health.down(ex)
                    .withDetail("error", ex.getMessage())
                    .build();
        }
    }
}

@Component
public class MessageBrokerHealthIndicator implements HealthIndicator {

    private final RabbitTemplate rabbitTemplate;

    public MessageBrokerHealthIndicator(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public Health health() {
        try {
            rabbitTemplate.execute(channel -> {
                channel.queueDeclarePassive("health-check-queue");
                return null;
            });
            return Health.up()
                    .withDetail("broker", "rabbitmq")
                    .build();
        } catch (Exception ex) {
            return Health.down(ex)
                    .withDetail("broker", "rabbitmq")
                    .build();
        }
    }
}
```

**Non-compliant:**

```java
@RestController
public class HealthController {

    @GetMapping("/custom-health")
    public Map<String, String> checkHealth() {
        Map<String, String> status = new HashMap<>();
        try {
            redisTemplate.opsForValue().get("ping");
            status.put("redis", "ok");
        } catch (Exception e) {
            status.put("redis", "error");
        }
        return status;
    }
}
```

## Customization

- **SB-02 (Profiles)** profile naming conventions vary by organization. Common schemes include `dev`/`staging`/`prod` and `local`/`test`/`prod`. The rule requires profile-based separation, not a specific naming convention. Teams should document their chosen scheme and apply it consistently.

- **SB-06 (Transactions)** propagation behavior depends on use case. The default `REQUIRED` is correct for most service methods. `REQUIRES_NEW` is appropriate for operations that must commit independently (e.g., audit logging that should persist even if the outer transaction rolls back). Teams should document any non-default propagation choices in code comments.

- **SB-07 (Async)** thread pool sizing is workload-dependent. The example values (core=4, max=8, queue=100) are illustrative — production values should be determined by load testing. CPU-bound tasks benefit from thread counts near the number of cores; I/O-bound tasks can support higher concurrency. Monitor queue depth and rejected task counts in production.
