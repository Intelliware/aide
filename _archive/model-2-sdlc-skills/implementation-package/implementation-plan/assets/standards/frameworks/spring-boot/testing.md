# Spring Boot Testing Standards

## Purpose

These standards define Spring Boot-specific testing rules that supplement the [common testing standards](../../common/testing/) and [Java](../../languages/java/) / [Kotlin](../../languages/kotlin/) testing standards. They cover test slicing, container-based database testing, MockMvc usage, bean mocking, test configuration, and integration test isolation. Rules from common and language-level testing standards are not repeated here — they apply in full and are referenced where relevant.

## Applicability

All Spring Boot 3.x+ projects (Java 17+, JUnit 5). Spring Boot 2.x projects can follow the testing patterns but must adapt for `javax` → `jakarta` namespace changes and Spring Security test support differences.

## Rules

### SBT-01: Use Test Slices, Not Full `@SpringBootTest`

**Severity:** Error
**Rule:** Use targeted test slice annotations (`@WebMvcTest`, `@DataJpaTest`, `@JsonTest`) to load only the relevant application layer — reserve `@SpringBootTest` for full integration tests that require the entire context.
**Why:** `@SpringBootTest` loads every bean, auto-configuration, and embedded server, making tests slow and brittle; test slices start in seconds and isolate failures to the layer under test.

**Compliant:**

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void getOrder_returnsOrder() throws Exception {
        when(orderService.findById("order-1"))
                .thenReturn(new OrderDetails("order-1", "PLACED", BigDecimal.TEN));

        mockMvc.perform(get("/api/orders/order-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("order-1"))
                .andExpect(jsonPath("$.status").value("PLACED"));
    }
}

@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByCustomerId_returnsMatchingOrders() {
        entityManager.persist(new Order("cust-1", BigDecimal.TEN));
        entityManager.persist(new Order("cust-1", BigDecimal.ONE));
        entityManager.persist(new Order("cust-2", BigDecimal.TEN));

        List<Order> orders = orderRepository.findByCustomerId("cust-1");

        assertThat(orders).hasSize(2);
    }
}

@JsonTest
class OrderResponseSerializationTest {

    @Autowired
    private JacksonTester<OrderResponse> json;

    @Test
    void serialize_includesAllFields() throws Exception {
        var response = new OrderResponse("order-1", "PLACED", BigDecimal.valueOf(99.99));

        assertThat(json.write(response))
                .extractingJsonPathStringValue("$.id").isEqualTo("order-1");
        assertThat(json.write(response))
                .extractingJsonPathStringValue("$.status").isEqualTo("PLACED");
    }
}
```

**Non-compliant:**

```java
@SpringBootTest
class OrderControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getOrder_returnsOrder() {
        // Loads the entire application context, starts an embedded server,
        // connects to a real database — all to test one controller method
        ResponseEntity<OrderDetails> response =
                restTemplate.getForEntity("/api/orders/order-1", OrderDetails.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

---

### SBT-02: Use Testcontainers for Database Tests

**Severity:** Error
**Rule:** Run database integration tests against real database engines using Testcontainers with `@Container` — never use H2 or other in-memory databases as stand-ins for the production database.
**Why:** H2 does not support the same SQL dialect, indexing behavior, constraint enforcement, or query execution plans as PostgreSQL, MySQL, or other production databases; tests that pass on H2 can fail in production due to these differences.

**Compliant:**

```java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void save_generatesId() {
        Order order = new Order("cust-1", BigDecimal.TEN);
        Order saved = orderRepository.save(order);

        assertThat(saved.getId()).isNotNull();
    }

    @Test
    void findByStatus_usesPostgresEnumCast() {
        orderRepository.save(new Order("cust-1", BigDecimal.TEN, OrderStatus.PLACED));
        orderRepository.save(new Order("cust-2", BigDecimal.ONE, OrderStatus.SHIPPED));

        List<Order> placed = orderRepository.findByStatus(OrderStatus.PLACED);

        assertThat(placed).hasSize(1);
    }
}
```

**Non-compliant:**

```java
@DataJpaTest
class OrderRepositoryTest {

    // H2 is the default — silently uses different SQL dialect,
    // missing Postgres-specific features like JSONB, array types, and partial indexes
    @Autowired
    private OrderRepository orderRepository;

    @Test
    void save_generatesId() {
        Order saved = orderRepository.save(new Order("cust-1", BigDecimal.TEN));
        assertThat(saved.getId()).isNotNull();
        // Passes on H2 but the native query in the repository uses Postgres-specific syntax
    }
}
```

---

### SBT-03: Use MockMvc for Controller Testing

**Severity:** Warning
**Rule:** Test Spring MVC controllers with `MockMvc` — verify HTTP status codes, response headers, and response body structure without starting an embedded server.
**Why:** MockMvc tests execute in-process without network overhead, run faster than `TestRestTemplate` or `WebTestClient` against a live server, and provide fine-grained assertions on the Spring MVC pipeline including filters, interceptors, and exception handlers.

**Compliant:**

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void createOrder_returnsCreatedWithLocation() throws Exception {
        var request = new CreateOrderRequest("cust-1", List.of(
                new OrderItem("prod-1", 2)));
        when(orderService.placeOrder(any()))
                .thenReturn(new Order("order-123", "PLACED"));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/orders/order-123"))
                .andExpect(jsonPath("$.id").value("order-123"))
                .andExpect(jsonPath("$.status").value("PLACED"));
    }

    @Test
    void getOrder_notFound_returns404() throws Exception {
        when(orderService.findById("missing"))
                .thenThrow(new OrderNotFoundException("missing"));

        mockMvc.perform(get("/api/orders/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }

    @Test
    void createOrder_invalidBody_returns400() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
```

**Non-compliant:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createOrder_returnsCreated() {
        // Starts a full embedded server, loads every bean, connects to the database
        ResponseEntity<Order> response = restTemplate.postForEntity(
                "/api/orders", request, Order.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

---

### SBT-04: Use `@MockBean` for Mocking Spring Beans

**Severity:** Warning
**Rule:** Use `@MockBean` to replace Spring beans with Mockito mocks in test slices — prefer `@MockBean` over `@SpyBean` unless partial mocking is specifically required.
**Why:** `@MockBean` replaces the bean in the Spring context with a fully controlled mock, giving tests complete control over dependencies; `@SpyBean` delegates to the real implementation by default, making tests dependent on real behavior and harder to reason about.

**Compliant:**

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private AuthorizationService authorizationService;

    @Test
    void getOrder_delegatesToService() throws Exception {
        when(authorizationService.hasAccess(any(), eq("order-1"))).thenReturn(true);
        when(orderService.findById("order-1"))
                .thenReturn(new OrderDetails("order-1", "PLACED"));

        mockMvc.perform(get("/api/orders/order-1"))
                .andExpect(status().isOk());

        verify(orderService).findById("order-1");
    }
}
```

**Non-compliant:**

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // No mock — test depends on the real OrderService and all its transitive dependencies
    @Autowired
    private OrderService orderService;

    @Test
    void getOrder_returnsOrder() throws Exception {
        // Fails because OrderService's dependencies aren't in the WebMvc slice
        mockMvc.perform(get("/api/orders/order-1"))
                .andExpect(status().isOk());
    }
}
```

---

### SBT-05: Use Test-Specific Profiles

**Severity:** Warning
**Rule:** Define an `application-test.yml` profile and activate it with `@ActiveProfiles("test")` — isolate test configuration from production settings.
**Why:** Tests that run against production configuration risk connecting to real external services, sending real emails, or using production credentials; a test profile ensures safe, repeatable, and fast test execution.

**Compliant:**

```yaml
# application-test.yml
spring:
  mail:
    host: localhost
    port: 1025  # MailHog or similar test SMTP
  cache:
    type: simple  # in-memory cache for tests

app:
  payment:
    base-url: http://localhost:8089  # WireMock
    api-key: test-api-key
  notifications:
    enabled: false
```

```java
@SpringBootTest
@ActiveProfiles("test")
class OrderIntegrationTest {

    @Test
    void placeOrder_sendsConfirmationToTestSmtp() {
        // Uses test SMTP, test payment URL, disabled real notifications
    }
}
```

**Non-compliant:**

```java
@SpringBootTest
class OrderIntegrationTest {

    // No test profile — uses application.yml which may point to production services
    @Test
    void placeOrder_sendsConfirmation() {
        // Might send a real email to a real customer
    }
}
```

---

### SBT-06: Use `@Transactional` for Test Data Rollback

**Severity:** Convention
**Rule:** Annotate data-layer test classes or methods with `@Transactional` to auto-rollback after each test — never write manual cleanup logic when rollback achieves the same isolation.
**Why:** Automatic rollback guarantees each test starts with a clean database state without the overhead and fragility of manual `DELETE` statements or schema recreation.

**Compliant:**

```java
@DataJpaTest
@Transactional
class OrderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void findByCustomerId_returnsMatchingOrders() {
        entityManager.persist(new Order("cust-1", BigDecimal.TEN));
        entityManager.persist(new Order("cust-1", BigDecimal.ONE));

        List<Order> orders = orderRepository.findByCustomerId("cust-1");

        assertThat(orders).hasSize(2);
        // Transaction rolls back — no data leaks to other tests
    }

    @Test
    void countByStatus_returnsZeroWithNoData() {
        // Guaranteed clean state because the previous test rolled back
        long count = orderRepository.countByStatus(OrderStatus.PLACED);
        assertThat(count).isZero();
    }
}
```

**Non-compliant:**

```java
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @AfterEach
    void cleanup() {
        orderRepository.deleteAll(); // fragile — misses related tables, FK constraints
    }

    @Test
    void findByCustomerId_returnsMatchingOrders() {
        orderRepository.save(new Order("cust-1", BigDecimal.TEN));
        List<Order> orders = orderRepository.findByCustomerId("cust-1");
        assertThat(orders).hasSize(1);
    }
}
```

---

### SBT-07: Isolate Integration Tests

**Severity:** Warning
**Rule:** Each integration test must be independent — no shared mutable state between tests, no reliance on test execution order, and no shared test data that persists across test methods.
**Why:** Interdependent tests produce non-deterministic failures that pass individually but fail when run together, wasting hours of debugging time on test infrastructure instead of application code.

**Compliant:**

```java
@SpringBootTest
@ActiveProfiles("test")
class OrderWorkflowIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    @Test
    void placeOrder_createsOrderWithPlacedStatus() {
        var request = new CreateOrderRequest("cust-1",
                List.of(new OrderItem("prod-1", 2)));

        Order order = orderService.placeOrder(request);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PLACED);
        assertThat(orderRepository.findById(order.getId())).isPresent();
    }

    @Test
    void cancelOrder_setsStatusToCancelled() {
        Order order = orderService.placeOrder(new CreateOrderRequest("cust-1",
                List.of(new OrderItem("prod-1", 1))));

        orderService.cancelOrder(order.getId());

        Order cancelled = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }
}
```

**Non-compliant:**

```java
@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OrderWorkflowIntegrationTest {

    static String sharedOrderId;

    @Test
    @org.junit.jupiter.api.Order(1)
    void step1_placeOrder() {
        Order order = orderService.placeOrder(request);
        sharedOrderId = order.getId(); // leaks state to subsequent tests
    }

    @Test
    @org.junit.jupiter.api.Order(2)
    void step2_cancelOrder() {
        // Depends on step1 running first — fails if run in isolation
        orderService.cancelOrder(sharedOrderId);
    }
}
```

---

### SBT-08: Use WireMock for External API Mocking

**Severity:** Warning
**Rule:** Use WireMock to stub external HTTP APIs in integration tests — verify request matching, simulate error responses and timeouts, and never call real external APIs in CI.
**Why:** Real external API calls in tests are slow, flaky, rate-limited, and may have side effects (charges, notifications); WireMock provides deterministic, fast, and controllable HTTP responses that test both happy paths and failure modes.

**Compliant:**

```java
@SpringBootTest
@ActiveProfiles("test")
@WireMockTest(httpPort = 8089)
class PaymentServiceIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Test
    void charge_successfulPayment_returnsConfirmation() {
        stubFor(post(urlPathEqualTo("/v1/charges"))
                .withHeader("Authorization", equalTo("Bearer test-api-key"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id": "ch_123", "status": "succeeded"}
                                """)));

        PaymentResult result = paymentService.charge("order-1", BigDecimal.TEN);

        assertThat(result.getStatus()).isEqualTo("succeeded");
        verify(postRequestedFor(urlPathEqualTo("/v1/charges"))
                .withRequestBody(containing("order-1")));
    }

    @Test
    void charge_timeout_throwsPaymentException() {
        stubFor(post(urlPathEqualTo("/v1/charges"))
                .willReturn(aResponse()
                        .withFixedDelay(15_000)));

        assertThatThrownBy(() -> paymentService.charge("order-1", BigDecimal.TEN))
                .isInstanceOf(PaymentTimeoutException.class);
    }

    @Test
    void charge_serverError_retriesAndThrows() {
        stubFor(post(urlPathEqualTo("/v1/charges"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withBody("""
                                {"error": "internal_error"}
                                """)));

        assertThatThrownBy(() -> paymentService.charge("order-1", BigDecimal.TEN))
                .isInstanceOf(PaymentGatewayException.class);

        verify(exactly(3), postRequestedFor(urlPathEqualTo("/v1/charges")));
    }
}
```

**Non-compliant:**

```java
@SpringBootTest
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Test
    void charge_successfulPayment() {
        // Calls the real Stripe API — slow, flaky, costs money, rate-limited
        PaymentResult result = paymentService.charge("order-1", BigDecimal.TEN);
        assertThat(result.getStatus()).isEqualTo("succeeded");
    }
}
```

## Customization

- **SBT-02 (Testcontainers)** some teams use embedded databases for unit-level repository tests where speed is critical and database-specific features are not exercised. This is acceptable for simple CRUD operations but Testcontainers should always be used for tests involving native queries, database-specific types, or migration scripts.

- **SBT-04 (`@MockBean`)** triggers a Spring context restart because it modifies the bean definition. In Spring Framework 6.2+ / Spring Boot 3.4+, `@MockitoBean` avoids context restarts by injecting mocks without altering bean definitions. Teams on newer Spring versions should prefer `@MockitoBean` for faster test suites.

- **SBT-06 (`@Transactional` rollback)** does not work when the code under test spawns new threads (e.g., `@Async` methods) or uses `Propagation.REQUIRES_NEW`, because those operations run in separate transactions outside the test's rollback scope. For these cases, use explicit cleanup in `@AfterEach` or dedicated test containers with per-test schema recreation.
