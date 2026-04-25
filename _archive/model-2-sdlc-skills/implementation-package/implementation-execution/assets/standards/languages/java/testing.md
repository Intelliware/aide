# Java Testing Standards

## Purpose

These standards define Java-specific testing conventions using JUnit 5, Mockito, and AssertJ. They supplement the common testing standards with Java tooling idioms — lifecycle management, assertion style, parameterized tests, and Spring Boot test slices. For general principles on test structure, naming, and coverage, see the common testing standards.

## Applicability

All Java projects (Java 17+).

## Rules

### JVT-01: Use JUnit 5 with Lifecycle Annotations

**Severity:** Error
**Rule:** Use JUnit 5 (`org.junit.jupiter`) lifecycle annotations — `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll` — and `@Nested` for grouping related tests; never use JUnit 4 annotations.
**Why:** JUnit 5's extension model is composable and supports `@Nested` classes for logical grouping, while JUnit 4's runner model only allows one runner per class and lacks nested support.

**Compliant:**

```java
class OrderServiceTest {

    private OrderService service;
    private OrderRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryOrderRepository();
        service = new OrderService(repository);
    }

    @Nested
    class WhenCreatingOrder {

        @Test
        void createsOrderWithPendingStatus() {
            var order = service.create("cust-1", List.of(new LineItem("prod-1", 2)));
            assertThat(order.status()).isEqualTo(Status.PENDING);
        }

        @Test
        void rejectsEmptyItemList() {
            assertThrows(IllegalArgumentException.class,
                () -> service.create("cust-1", List.of()));
        }
    }

    @Nested
    class WhenCancellingOrder {

        @Test
        void marksOrderAsCancelled() {
            var order = service.create("cust-1", List.of(new LineItem("prod-1", 1)));
            service.cancel(order.id());
            assertThat(repository.findById(order.id()).orElseThrow().status())
                .isEqualTo(Status.CANCELLED);
        }
    }
}
```

**Non-compliant:**

```java
// JUnit 4 annotations — incompatible with @Nested and JUnit 5 extensions
import org.junit.Before;
import org.junit.Test;

public class OrderServiceTest {

    @Before
    public void setUp() { /* ... */ }

    @Test
    public void testCreateOrder() { /* ... */ }

    @Test
    public void testCancelOrder() { /* ... */ }
}
```

---

### JVT-02: Use Mockito with Strict Stubs

**Severity:** Warning
**Rule:** Register Mockito via `@ExtendWith(MockitoExtension.class)` with strict stubbing enabled; use `@Mock` for dependencies and `@InjectMocks` for the class under test — unnecessary stubbings must fail the test.
**Why:** Strict stubs catch stale or incorrect stubbing that would otherwise silently return defaults, hiding bugs behind green tests.

**Compliant:**

```java
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentGateway gateway;

    @Mock
    private OrderRepository orders;

    @InjectMocks
    private PaymentService service;

    @Test
    void chargesGatewayAndUpdatesOrder() {
        var order = new Order("ord-1", BigDecimal.valueOf(50));
        when(orders.findById("ord-1")).thenReturn(Optional.of(order));
        when(gateway.charge(order)).thenReturn(new ChargeResult("txn-1", Status.SUCCESS));

        var result = service.processPayment("ord-1");

        assertThat(result.transactionId()).isEqualTo("txn-1");
        verify(orders).save(argThat(o -> o.status() == Status.PAID));
    }
}
```

**Non-compliant:**

```java
// Manual mock setup without strict stubs — unnecessary stubs go undetected
class PaymentServiceTest {

    @Test
    void chargesGateway() {
        var gateway = Mockito.mock(PaymentGateway.class);
        var orders = Mockito.mock(OrderRepository.class);
        var notifications = Mockito.mock(NotificationService.class);

        // This stub is never used — strict mode would catch it
        when(notifications.send(any())).thenReturn(true);

        when(orders.findById("ord-1")).thenReturn(Optional.of(new Order("ord-1")));
        when(gateway.charge(any())).thenReturn(new ChargeResult("txn-1"));

        var service = new PaymentService(gateway, orders, notifications);
        service.processPayment("ord-1");
    }
}
```

---

### JVT-03: Use AssertJ for Fluent Assertions

**Severity:** Convention
**Rule:** Use AssertJ's `assertThat()` for all assertions — fluent chaining provides readable assertions and produces detailed failure messages that include both expected and actual values with context.
**Why:** JUnit's `assertEquals(expected, actual)` swaps argument order easily and produces generic failure messages; AssertJ's fluent API reads naturally and produces messages like `expected: "SHIPPED" but was: "PENDING"`.

**Compliant:**

```java
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Test
void returnsShippedOrdersForCustomer() {
    var orders = service.findByCustomer("cust-1");

    assertThat(orders)
        .hasSize(3)
        .extracting(Order::status)
        .containsOnly(Status.SHIPPED);

    assertThat(orders)
        .extracting(Order::total)
        .allMatch(t -> t.compareTo(BigDecimal.ZERO) > 0);
}

@Test
void throwsWhenOrderNotFound() {
    assertThatThrownBy(() -> service.findOrFail("missing-id"))
        .isInstanceOf(OrderNotFoundException.class)
        .hasMessageContaining("missing-id");
}
```

**Non-compliant:**

```java
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Test
void returnsShippedOrders() {
    var orders = service.findByCustomer("cust-1");

    // Argument order confusion — is 3 expected or actual?
    assertEquals(3, orders.size());

    // assertTrue with no message — failure says "expected true but was false"
    assertTrue(orders.stream().allMatch(o -> o.status() == Status.SHIPPED));
}
```

---

### JVT-04: Use `@ParameterizedTest` for Data-Driven Tests

**Severity:** Warning
**Rule:** Use `@ParameterizedTest` with `@MethodSource`, `@CsvSource`, or `@EnumSource` to test the same assertion against multiple inputs; never duplicate test methods that differ only in input data.
**Why:** Duplicated tests that vary only by input obscure the common assertion, inflate test count without adding coverage, and make updates error-prone.

**Compliant:**

```java
@ParameterizedTest
@CsvSource({
    "100.00, 10, 90.00",
    "50.00, 25, 37.50",
    "200.00, 0, 200.00",
})
void appliesPercentageDiscount(BigDecimal price, int percentage, BigDecimal expected) {
    var result = discountService.applyPercentage(price, percentage);
    assertThat(result).isEqualByComparingTo(expected);
}

@ParameterizedTest
@EnumSource(value = Status.class, names = {"CANCELLED", "REFUNDED", "EXPIRED"})
void rejectsShipmentForTerminalStatuses(Status status) {
    var order = OrderFixtures.withStatus(status);
    assertThatThrownBy(() -> shipmentService.ship(order))
        .isInstanceOf(InvalidOrderStateException.class);
}

@ParameterizedTest
@MethodSource("invalidEmails")
void rejectsInvalidEmailFormats(String email) {
    assertThatThrownBy(() -> new EmailAddress(email))
        .isInstanceOf(IllegalArgumentException.class);
}

static Stream<String> invalidEmails() {
    return Stream.of("", "no-at-sign", "@no-local", "spaces in@email.com", "a@.com");
}
```

**Non-compliant:**

```java
// Copy-paste tests differing only in input
@Test
void rejectsShipmentForCancelledOrder() {
    var order = OrderFixtures.withStatus(Status.CANCELLED);
    assertThatThrownBy(() -> shipmentService.ship(order))
        .isInstanceOf(InvalidOrderStateException.class);
}

@Test
void rejectsShipmentForRefundedOrder() {
    var order = OrderFixtures.withStatus(Status.REFUNDED);
    assertThatThrownBy(() -> shipmentService.ship(order))
        .isInstanceOf(InvalidOrderStateException.class);
}

@Test
void rejectsShipmentForExpiredOrder() {
    var order = OrderFixtures.withStatus(Status.EXPIRED);
    assertThatThrownBy(() -> shipmentService.ship(order))
        .isInstanceOf(InvalidOrderStateException.class);
}
```

---

### JVT-05: Use Testcontainers for Database and Infrastructure Tests

**Severity:** Warning
**Rule:** Use Testcontainers to spin up real database and infrastructure instances (Postgres, Redis, Kafka) in Docker containers for integration tests; use `@Container` with the JUnit 5 extension; never use H2 or other in-memory databases to approximate production behavior.
**Why:** H2 has different SQL dialect, transaction behavior, and type handling than Postgres — tests pass on H2 and fail in production; Testcontainers tests the actual database engine.

**Compliant:**

```java
@Testcontainers
@SpringBootTest
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("orders_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository repository;

    @Test
    void persistsAndRetrievesOrder() {
        var order = new Order("cust-1", List.of(new LineItem("prod-1", 2)));
        repository.save(order);

        var found = repository.findById(order.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getCustomerId()).isEqualTo("cust-1");
    }
}
```

**Non-compliant:**

```java
// H2 in-memory — different SQL dialect, JSON support, and locking behavior
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class OrderRepositoryTest {

    @Autowired
    private OrderRepository repository;

    @Test
    void savesOrder() {
        // Passes with H2, fails with Postgres due to jsonb column, window functions,
        // or advisory locks that H2 doesn't support
        repository.save(new Order("cust-1", Map.of("key", "value")));
    }
}
```

---

### JVT-06: Name Tests Descriptively

**Severity:** Convention
**Rule:** Name tests using `@DisplayName` with a sentence describing the behavior, or use method names in `shouldDoXWhenY` format — test names must describe what the system does under what condition, not what method is being called.
**Why:** Descriptive names make test failure reports self-explanatory; `testCreate` failing tells you nothing, but `rejects order when inventory is insufficient` tells you exactly what broke.

**Compliant:**

```java
@Nested
@DisplayName("Order cancellation")
class OrderCancellation {

    @Test
    @DisplayName("refunds payment when order is cancelled within 24 hours")
    void refundsPaymentWhenCancelledWithin24Hours() {
        var order = createOrder(Instant.now().minus(Duration.ofHours(12)));
        service.cancel(order.id());
        assertThat(paymentGateway.getRefunds()).hasSize(1);
    }

    @Test
    @DisplayName("rejects cancellation after order has shipped")
    void rejectsCancellationAfterShipment() {
        var order = createShippedOrder();
        assertThatThrownBy(() -> service.cancel(order.id()))
            .isInstanceOf(OrderAlreadyShippedException.class);
    }
}
```

**Non-compliant:**

```java
@Test
void test1() { /* ... */ }

@Test
void testCancel() { /* ... */ }

@Test
void testCancelOrderCancelsOrder() { /* tautological — says nothing about conditions */ }
```

---

### JVT-07: Test Exceptions with `assertThrows`

**Severity:** Error
**Rule:** Use `assertThrows` or AssertJ's `assertThatThrownBy` to verify both the exception type and its message or properties; never use try/catch with `fail()` to test expected exceptions.
**Why:** `assertThrows` is concise, clearly communicates intent, and automatically fails if no exception is thrown; try/catch with `fail()` is verbose and the `fail()` call is easy to forget.

**Compliant:**

```java
@Test
void throwsWhenOrderNotFound() {
    var exception = assertThrows(OrderNotFoundException.class,
        () -> service.findOrFail("missing-id"));

    assertThat(exception.getMessage()).contains("missing-id");
    assertThat(exception.getOrderId()).isEqualTo("missing-id");
}

// Or with AssertJ's fluent API
@Test
void throwsWhenQuantityIsNegative() {
    assertThatThrownBy(() -> new LineItem("prod-1", -1))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("negative");
}
```

**Non-compliant:**

```java
@Test
void throwsWhenOrderNotFound() {
    try {
        service.findOrFail("missing-id");
        fail("Expected OrderNotFoundException"); // easy to forget this line
    } catch (OrderNotFoundException e) {
        assertEquals("missing-id", e.getOrderId());
    }
}
```

---

### JVT-08: Use Test Slices for Spring Applications

**Severity:** Warning
**Rule:** Use Spring Boot test slices — `@WebMvcTest`, `@DataJpaTest`, `@JsonTest`, `@WebFluxTest` — to load only the application layer relevant to the test; reserve `@SpringBootTest` for full integration tests that require the complete application context.
**Why:** `@SpringBootTest` loads every bean, auto-configuration, and connection pool — a single controller test should not wait for Kafka consumers, scheduled tasks, and cache warmers to initialize.

**Compliant:**

```java
// Tests only the web layer — no repository, no service implementation loaded
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void returns404WhenOrderNotFound() throws Exception {
        when(orderService.findOrFail("missing"))
            .thenThrow(new OrderNotFoundException("missing"));

        mockMvc.perform(get("/api/orders/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
    }
}

// Tests only JPA layer — no web server, no controllers loaded
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrderRepositoryTest {

    @Autowired
    private OrderRepository repository;

    @Test
    void findsOrdersByCustomerId() {
        var orders = repository.findByCustomerId("cust-1");
        assertThat(orders).isNotEmpty();
    }
}

// Full integration test — only when you need the entire context
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderFlowIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createsAndRetrievesOrder() {
        var response = restTemplate.postForEntity("/api/orders", createRequest(), OrderDto.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

**Non-compliant:**

```java
// Full context for a single controller test — slow, brittle, tests too much
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returns404WhenOrderNotFound() throws Exception {
        // Loads database, message queues, schedulers, caches...
        // just to test one controller endpoint
        mockMvc.perform(get("/api/orders/missing"))
            .andExpect(status().isNotFound());
    }
}
```

## Customization

- **JVT-03 (AssertJ)** — some teams prefer Hamcrest matchers, which ship with Spring Boot's test starter. Either library satisfies the intent of readable, fluent assertions, but the team should standardize on one to avoid mixing styles.

- **JVT-05 (Testcontainers)** requires Docker to be available in CI. Teams running CI without Docker access (some restricted environments) may need to use embedded databases as a fallback, but should document the dialect differences that may cause false-passing tests.

- **JVT-08 (Test slices)** — the correct slice depends on what is being tested. Use `@WebMvcTest` for controllers, `@DataJpaTest` for repositories, `@JsonTest` for serialization, and `@SpringBootTest` only for end-to-end flows that cross multiple layers. See Spring Boot testing documentation for the full list of available slices.
