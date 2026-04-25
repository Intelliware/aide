# Java Standards

## Purpose

These standards establish Java-specific coding conventions that supplement the common standards (error handling, naming, structure) with rules tailored to Java's type system, concurrency model, and modern language features. Where a common standard already covers a topic (e.g., error context, structured logging, boundary validation), these rules extend it with Java idioms rather than restating it.

## Applicability

All Java projects (Java 21+). Rules that require a specific Java version are tagged with a **Requires** annotation — the codebase analysis step extracts the project's Java version from `pom.xml`, `build.gradle`, or `build.gradle.kts` and applies only compatible rules. Projects on Java 17 can use most rules; see the Customization section for version-specific guidance.

## Rules

### JV-01: Prefer Interfaces over Inheritance

**Severity:** Warning
**Rule:** Use interfaces for polymorphism and behavior contracts; reserve class inheritance for true "is-a" relationships where subtypes share implementation — never extend a class solely to reuse code.
**Why:** Inheritance creates tight coupling between parent and child, making changes to the parent ripple unpredictably; interfaces allow flexible composition and are easier to mock in tests.

**Compliant:**

```java
public interface Discountable {
    BigDecimal applyDiscount(BigDecimal price);
}

public class SeasonalDiscount implements Discountable {
    private final double rate;

    public SeasonalDiscount(double rate) {
        this.rate = rate;
    }

    @Override
    public BigDecimal applyDiscount(BigDecimal price) {
        return price.multiply(BigDecimal.valueOf(1 - rate));
    }
}

public class LoyaltyDiscount implements Discountable {
    private final int tierPercentage;

    public LoyaltyDiscount(int tierPercentage) {
        this.tierPercentage = tierPercentage;
    }

    @Override
    public BigDecimal applyDiscount(BigDecimal price) {
        return price.multiply(BigDecimal.valueOf(1 - tierPercentage / 100.0));
    }
}
```

**Non-compliant:**

```java
public class BaseDiscount {
    protected double rate;

    public BigDecimal applyDiscount(BigDecimal price) {
        return price.multiply(BigDecimal.valueOf(1 - rate));
    }
}

// Extends just to reuse the applyDiscount method — not a true "is-a" relationship
public class LoyaltyDiscount extends BaseDiscount {
    public LoyaltyDiscount(int tierPercentage) {
        this.rate = tierPercentage / 100.0;
    }
}
```

---

### JV-02: Use Checked Exceptions for Recoverable Conditions Only

**Severity:** Error
**Rule:** Throw checked exceptions only for conditions the caller can reasonably recover from; use unchecked `RuntimeException` subclasses for programming errors like null arguments, illegal state, or violated preconditions.
**Why:** Checked exceptions for unrecoverable errors force callers to write meaningless catch blocks that either swallow or blindly rethrow, adding noise without value (see common error-handling standards ERR-03).

**Compliant:**

```java
// Checked: caller can retry with a different payment method
public class PaymentDeclinedException extends Exception {
    private final String orderId;
    private final String reason;

    public PaymentDeclinedException(String orderId, String reason) {
        super("Payment declined for order %s: %s".formatted(orderId, reason));
        this.orderId = orderId;
        this.reason = reason;
    }
}

// Unchecked: programming error — nothing the caller can do at runtime
public void setQuantity(int quantity) {
    if (quantity < 0) {
        throw new IllegalArgumentException(
            "Quantity must be non-negative, got: " + quantity);
    }
    this.quantity = quantity;
}
```

**Non-compliant:**

```java
// Checked exception for a programming error — callers can't "recover" from a null ID
public Order findOrder(String id) throws InvalidInputException {
    if (id == null) {
        throw new InvalidInputException("Order ID must not be null");
    }
    return repository.findById(id).orElseThrow();
}
```

---

### JV-03: Choose the Right Collection Type

**Severity:** Warning
**Rule:** Use `List` for ordered sequences, `Set` for unique elements, and `Map` for key-value associations; use `List.of()`, `Set.of()`, and `Map.of()` for immutable collections; never use raw types.
**Why:** The right collection type communicates intent to readers and prevents bugs — a `Set` enforces uniqueness structurally rather than relying on callers to deduplicate.

**Compliant:**

```java
// Immutable collection factories — clear intent, no accidental mutation
List<String> statuses = List.of("PENDING", "SHIPPED", "DELIVERED");
Set<String> allowedRoles = Set.of("ADMIN", "MANAGER", "VIEWER");
Map<String, Integer> defaults = Map.of("timeout", 30, "retries", 3);

// Mutable when mutation is needed
var orders = new ArrayList<Order>();
orders.add(newOrder);
```

**Non-compliant:**

```java
// Raw type — loses type safety, generates unchecked warnings
List statuses = new ArrayList();
statuses.add("PENDING");
statuses.add(42); // compiles, fails at runtime

// Wrong collection type — using List when uniqueness is required
List<String> roles = new ArrayList<>();
roles.add("ADMIN");
roles.add("ADMIN"); // duplicate silently accepted
```

---

### JV-04: Use Generics Properly

**Severity:** Error
**Rule:** Never use raw types; use bounded wildcards — `<? extends T>` for producers (reading) and `<? super T>` for consumers (writing) — following the PECS principle; never suppress unchecked warnings without a comment justifying safety.
**Why:** Raw types disable compile-time type checking, and incorrect generic usage causes `ClassCastException` at runtime in code that appears to compile cleanly.

**Compliant:**

```java
// PECS: source produces elements (extends), destination consumes them (super)
public static <T> void copy(List<? extends T> source, List<? super T> destination) {
    for (T item : source) {
        destination.add(item);
    }
}

// Bounded type parameter for comparable elements
public static <T extends Comparable<T>> T max(List<T> items) {
    return items.stream().max(Comparator.naturalOrder()).orElseThrow();
}
```

**Non-compliant:**

```java
// Raw types — type safety is completely lost
List items = new ArrayList();
items.add("text");
int value = (Integer) items.get(0); // ClassCastException at runtime

// Blanket suppression with no justification
@SuppressWarnings("unchecked")
public List<Order> getOrders() {
    return (List<Order>) cache.get("orders");
}
```

---

### JV-05: Use Concurrent Utilities over Synchronized

**Severity:** Warning
**Rule:** Prefer `java.util.concurrent` utilities — `ConcurrentHashMap`, `AtomicInteger`, `ExecutorService`, `ReentrantLock` — over `synchronized` blocks and raw `Thread` creation.
**Why:** `synchronized` blocks are error-prone at scale (deadlocks, missed notifications, non-interruptible waits), while `java.util.concurrent` provides higher-level abstractions that handle these edge cases correctly.

**Compliant:**

```java
private final ConcurrentHashMap<String, Order> cache = new ConcurrentHashMap<>();
private final AtomicInteger requestCount = new AtomicInteger(0);

public void handleRequest(Order order) {
    cache.put(order.id(), order);
    requestCount.incrementAndGet();
}

// Structured task submission instead of raw Thread
private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

public CompletableFuture<OrderResult> processAsync(Order order) {
    return CompletableFuture.supplyAsync(() -> process(order), executor);
}
```

**Non-compliant:**

```java
private final Map<String, Order> cache = new HashMap<>();
private int requestCount = 0;

// Manual synchronization — easy to miss a lock, deadlock, or forget to sync reads
public synchronized void handleRequest(Order order) {
    cache.put(order.id(), order);
    requestCount++;
}

// Raw Thread — no lifecycle management, no error handling
new Thread(() -> process(order)).start();
```

---

### JV-06: Use Try-with-Resources for All Closeable Resources

**Severity:** Error
**Rule:** Use try-with-resources for every object that implements `AutoCloseable` — streams, connections, readers, writers; implement `AutoCloseable` for custom resources that hold external handles.
**Why:** Manual `finally` blocks are verbose, error-prone (the close itself can throw and mask the original exception), and easy to forget.

**Compliant:**

```java
public List<Order> loadOrders(Path file) throws IOException {
    try (var reader = Files.newBufferedReader(file);
         var lines = reader.lines()) {
        return lines.map(this::parseOrder).toList();
    }
}

public OrderSummary queryDatabase(String customerId) throws SQLException {
    try (var conn = dataSource.getConnection();
         var stmt = conn.prepareStatement("SELECT * FROM orders WHERE customer_id = ?")) {
        stmt.setString(1, customerId);
        try (var rs = stmt.executeQuery()) {
            return mapResultSet(rs);
        }
    }
}
```

**Non-compliant:**

```java
public List<Order> loadOrders(Path file) throws IOException {
    BufferedReader reader = Files.newBufferedReader(file);
    try {
        return reader.lines().map(this::parseOrder).toList();
    } finally {
        reader.close(); // if close() throws, the original exception is lost
    }
}
```

---

### JV-07: Use Records for Data Carriers

**Severity:** Convention
**Rule:** Use records for immutable data transfer objects and value types — `record OrderDto(String id, BigDecimal total)` — instead of mutable POJOs with getters and setters when the class exists purely to carry data.
**Why:** Records eliminate boilerplate (constructors, getters, `equals`, `hashCode`, `toString`) and make immutability the default, reducing the surface area for bugs.

**Compliant:**

```java
public record OrderDto(String id, String customerId, BigDecimal total, Instant createdAt) {}

public record Address(String street, String city, String postalCode, String country) {
    public Address {
        Objects.requireNonNull(street, "street must not be null");
        Objects.requireNonNull(city, "city must not be null");
    }
}

// Used directly — no builder, no setters, no mutable state
var order = new OrderDto("ord-123", "cust-456", BigDecimal.valueOf(99.99), Instant.now());
```

**Non-compliant:**

```java
// 40+ lines for what a one-line record does
public class OrderDto {
    private String id;
    private String customerId;
    private BigDecimal total;

    public OrderDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    // plus equals, hashCode, toString...
}
```

---

### JV-08: Use Sealed Interfaces for Closed Type Hierarchies

**Severity:** Convention
**Rule:** Use `sealed` interfaces or classes when the set of subtypes is fixed and known at compile time — the compiler enforces exhaustive handling in `switch` expressions.
**Why:** Sealed types turn "forgot to handle a new subtype" from a runtime bug into a compile-time error, making the code safer as the domain evolves.

**Compliant:**

```java
public sealed interface PaymentResult
        permits PaymentResult.Success, PaymentResult.Declined, PaymentResult.GatewayError {

    record Success(String transactionId, Instant processedAt) implements PaymentResult {}
    record Declined(String reason, String code) implements PaymentResult {}
    record GatewayError(String provider, Exception cause) implements PaymentResult {}
}

// Compiler enforces exhaustive handling — adding a new permit requires updating every switch
public String describe(PaymentResult result) {
    return switch (result) {
        case PaymentResult.Success s -> "Paid: " + s.transactionId();
        case PaymentResult.Declined d -> "Declined: " + d.reason();
        case PaymentResult.GatewayError e -> "Gateway error from " + e.provider();
    };
}
```

**Non-compliant:**

```java
// Open hierarchy — anyone can extend, compiler can't check exhaustiveness
public interface PaymentResult {}
public class Success implements PaymentResult { /* ... */ }
public class Declined implements PaymentResult { /* ... */ }

// Must use a default branch — new subtypes silently fall through
public String describe(PaymentResult result) {
    if (result instanceof Success s) return "Paid";
    if (result instanceof Declined d) return "Declined";
    return "Unknown"; // hides bugs when new subtypes are added
}
```

---

### JV-09: Use Pattern Matching

**Severity:** Convention
**Rule:** Use pattern matching in `instanceof` checks and `switch` expressions — `if (shape instanceof Circle c)` — instead of manual casting after type checks.
**Why:** Pattern matching eliminates redundant casts that can fall out of sync with the type check, reducing both boilerplate and `ClassCastException` risk.

**Compliant:**

```java
// Pattern matching instanceof — binds the variable in the same expression
public double area(Shape shape) {
    if (shape instanceof Circle c) {
        return Math.PI * c.radius() * c.radius();
    } else if (shape instanceof Rectangle r) {
        return r.width() * r.height();
    }
    throw new IllegalArgumentException("Unknown shape: " + shape.getClass().getName());
}

// Pattern matching switch — exhaustive, concise
public String format(Object value) {
    return switch (value) {
        case Integer i -> "int: %d".formatted(i);
        case String s -> "str: %s".formatted(s);
        case null -> "null";
        default -> value.toString();
    };
}
```

**Non-compliant:**

```java
// Manual instanceof + cast — the cast can diverge from the check during refactoring
public double area(Shape shape) {
    if (shape instanceof Circle) {
        Circle c = (Circle) shape;
        return Math.PI * c.radius() * c.radius();
    } else if (shape instanceof Rectangle) {
        Rectangle r = (Rectangle) shape;
        return r.width() * r.height();
    }
    throw new IllegalArgumentException("Unknown shape");
}
```

---

### JV-10: Use Optional for Return Types Only

**Severity:** Warning
**Rule:** Return `Optional<T>` when absence is a valid, expected outcome; never use `Optional` for fields, method parameters, or collection types; never call `get()` without first checking `isPresent()` or using `orElse`/`orElseThrow`.
**Why:** `Optional` as a return type signals "this might be absent" in the API contract; using it for fields or parameters adds indirection without benefit, and `get()` without a check defeats the purpose entirely.

**Compliant:**

```java
public Optional<Order> findOrder(String id) {
    return Optional.ofNullable(orderMap.get(id));
}

// Caller handles absence explicitly
Order order = orderService.findOrder(id)
    .orElseThrow(() -> new OrderNotFoundException(id));

// Or with a fallback
BigDecimal discount = discountService.findDiscount(customerId)
    .map(Discount::rate)
    .orElse(BigDecimal.ZERO);
```

**Non-compliant:**

```java
// Optional as a field — adds heap allocation on every instance for no benefit
public class Order {
    private Optional<String> notes; // should be @Nullable String
}

// Optional as a parameter — forces callers to wrap values
public void applyDiscount(Optional<BigDecimal> discount) { /* ... */ }

// get() without isPresent() — throws NoSuchElementException, defeating the purpose
Order order = findOrder(id).get();
```

---

### JV-11: Prefer Stream API for Data Transformation

**Severity:** Convention
**Rule:** Use the Stream API for filter/map/reduce operations over collections; avoid side effects in stream operations; use traditional loops when mutation of external state is needed.
**Why:** Streams express data transformations declaratively, making the intent (filter, transform, collect) immediately visible without interleaved loop mechanics.

**Compliant:**

```java
// Declarative transformation — intent is clear at each stage
List<OrderSummary> summaries = orders.stream()
    .filter(o -> o.status() == Status.SHIPPED)
    .map(o -> new OrderSummary(o.id(), o.total(), o.shippedAt()))
    .sorted(Comparator.comparing(OrderSummary::shippedAt).reversed())
    .toList();

// Aggregation
BigDecimal totalRevenue = orders.stream()
    .map(Order::total)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

**Non-compliant:**

```java
// Side effects inside a stream — unclear, hard to debug, order-dependent
orders.stream()
    .filter(o -> o.status() == Status.SHIPPED)
    .forEach(o -> {
        o.setNotified(true); // mutating the source
        emailService.send(o.customerEmail(), buildBody(o)); // I/O side effect
        auditLog.add(o.id()); // mutating external state
    });
```

---

### JV-12: Use `var` for Local Variables with Obvious Types

**Severity:** Convention
**Rule:** Use `var` for local variable declarations only when the type is obvious from the right-hand side of the assignment; never use `var` when the type is ambiguous or requires reading the called method's signature to understand.
**Why:** `var` reduces noise when the type is already visible (`var map = new HashMap<String, Order>()`) but harms readability when it hides the type (`var result = service.process()`).

**Compliant:**

```java
// Type is obvious from the constructor
var orders = new ArrayList<Order>();
var cache = new ConcurrentHashMap<String, List<Order>>();
var timestamp = Instant.now();

// Type is obvious from a literal or factory
var id = UUID.randomUUID();
var message = "Order %s confirmed".formatted(orderId);
```

**Non-compliant:**

```java
// Type is not obvious — reader must look up processOrder's return type
var result = orderService.processOrder(request);

// Unclear what resolveConfig returns — could be Map, Config object, Optional...
var config = resolveConfig(environment);

// Numeric type ambiguity — is this int, long, double?
var total = computeTotal(items);
```

---

### JV-13: Handle Nulls at Boundaries

**Severity:** Error
**Rule:** Validate nulls at public method entry points with `Objects.requireNonNull()`; annotate parameters and return types with `@Nullable`/`@NonNull`; never pass null to methods that do not explicitly document null acceptance.
**Why:** Null dereferencing is the most common runtime exception in Java; catching it at the boundary produces a clear error message instead of a `NullPointerException` three layers deep (see common standards ERR-06 on boundary validation).

**Compliant:**

```java
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = Objects.requireNonNull(repository, "repository must not be null");
    }

    public Order createOrder(@NonNull String customerId, @NonNull List<LineItem> items) {
        Objects.requireNonNull(customerId, "customerId must not be null");
        Objects.requireNonNull(items, "items must not be null");
        if (items.isEmpty()) {
            throw new IllegalArgumentException("items must not be empty");
        }
        return repository.save(new Order(customerId, items));
    }

    public @Nullable Order findOrder(String id) {
        return repository.findById(id).orElse(null);
    }
}
```

**Non-compliant:**

```java
// No null checks — NullPointerException surfaces deep in repository.save()
public Order createOrder(String customerId, List<LineItem> items) {
    return repository.save(new Order(customerId, items));
}

// No annotations — callers have no idea if this returns null
public Order findOrder(String id) {
    return repository.findById(id).orElse(null);
}
```

---

### JV-14: Prefer Immutability

**Severity:** Warning
**Rule:** Declare fields `final`, return unmodifiable collections from public APIs, and prefer immutable objects — use `List.copyOf()`, `Collections.unmodifiableList()`, or records to prevent mutation of shared state.
**Why:** Mutable shared state is the primary source of concurrency bugs; immutable objects are inherently thread-safe and eliminate entire categories of defensive-copy mistakes.

**Compliant:**

```java
public class OrderAggregate {
    private final String id;
    private final String customerId;
    private final List<LineItem> items;

    public OrderAggregate(String id, String customerId, List<LineItem> items) {
        this.id = Objects.requireNonNull(id);
        this.customerId = Objects.requireNonNull(customerId);
        this.items = List.copyOf(items); // defensive copy — caller can't mutate our state
    }

    public List<LineItem> items() {
        return items; // already unmodifiable — safe to return directly
    }
}
```

**Non-compliant:**

```java
public class OrderAggregate {
    public String id;
    public List<LineItem> items; // mutable, public field

    public List<LineItem> getItems() {
        return items; // caller can mutate internal state: getItems().clear()
    }
}
```

### JV-15: Use Virtual Threads for I/O-Bound Concurrency

**Severity:** Warning
**Requires:** Java 21+
**Rule:** Use virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`, `Thread.ofVirtual()`) for I/O-bound workloads — HTTP calls, database queries, file operations. Reserve platform threads for CPU-bound computation.
**Why:** Virtual threads are lightweight (millions can coexist), eliminate thread-pool sizing decisions for I/O-bound work, and allow simple blocking-style code to scale as well as reactive alternatives without the complexity of callback chains or reactive streams.

**Compliant:**

```java
// Virtual thread executor — each task gets its own virtual thread
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var profileFuture = executor.submit(() -> userService.fetchProfile(userId));
    var ordersFuture = executor.submit(() -> orderService.fetchRecent(userId));
    var notificationsFuture = executor.submit(() -> notificationService.fetchUnread(userId));

    return new Dashboard(
        profileFuture.get(),
        ordersFuture.get(),
        notificationsFuture.get()
    );
}

// Spring Boot 3.2+ — enable virtual threads globally
// application.yml: spring.threads.virtual.enabled: true
```

**Non-compliant:**

```java
// Fixed platform thread pool — requires tuning, wastes resources when threads block on I/O
private final ExecutorService executor = Executors.newFixedThreadPool(20);

// Each blocked I/O call ties up a platform thread (~1MB stack)
// Under load, the pool saturates and requests queue or time out
var profile = executor.submit(() -> userService.fetchProfile(userId));
var orders = executor.submit(() -> orderService.fetchRecent(userId));
```

---

### JV-16: Use Text Blocks for Multi-Line Strings

**Severity:** Convention
**Requires:** Java 15+
**Rule:** Use text blocks (`"""..."""`) for multi-line strings — SQL queries, JSON templates, HTML fragments, log messages — instead of string concatenation or `\n` escapes.
**Why:** Text blocks preserve formatting, eliminate escape-character noise, and make the actual content visible in the source code.

**Compliant:**

```java
String query = """
        SELECT o.id, o.customer_id, o.total, o.status
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = ?
        ORDER BY o.created_at DESC
        LIMIT ?
        """;

String errorResponse = """
        {
            "error": {
                "code": "%s",
                "message": "%s"
            }
        }
        """.formatted(errorCode, errorMessage);
```

**Non-compliant:**

```java
// Concatenation — noisy, hard to read, error-prone indentation
String query = "SELECT o.id, o.customer_id, o.total, o.status " +
               "FROM orders o " +
               "JOIN order_items oi ON o.id = oi.order_id " +
               "WHERE o.status = ? " +
               "ORDER BY o.created_at DESC " +
               "LIMIT ?";

// \n escapes — the SQL structure is invisible
String query = "SELECT o.id\nFROM orders o\nWHERE o.status = ?\nORDER BY o.created_at DESC";
```

---

### JV-17: Use Sequenced Collections

**Severity:** Convention
**Requires:** Java 21+
**Rule:** Use `SequencedCollection`, `SequencedSet`, and `SequencedMap` interfaces and their `getFirst()`, `getLast()`, `reversed()` methods instead of index-based access or iterator-based workarounds for ordered collection operations.
**Why:** Before Java 21, getting the last element of a `List` required `list.get(list.size() - 1)`, and `SortedSet` had `first()` but no `last()`. Sequenced collections provide a uniform API for first/last access and reverse iteration across all ordered collection types.

**Compliant:**

```java
List<Order> orders = repository.findRecentOrders();
Order mostRecent = orders.getFirst();
Order oldest = orders.getLast();

// Reverse iteration without creating a copy
for (Order order : orders.reversed()) {
    process(order);
}

// Works uniformly across List, SortedSet, LinkedHashMap
SortedSet<String> sortedNames = new TreeSet<>(names);
String firstName = sortedNames.getFirst();
String lastName = sortedNames.getLast();

LinkedHashMap<String, Order> orderMap = buildOrderMap();
Map.Entry<String, Order> newest = orderMap.sequencedEntrySet().getLast();
```

**Non-compliant:**

```java
// Index arithmetic — error-prone, off-by-one risk
Order oldest = orders.get(orders.size() - 1);

// Different APIs for the same concept across collection types
SortedSet<String> names = new TreeSet<>(allNames);
String first = names.first();    // SortedSet has first()
String last = names.last();      // but List doesn't have last()

// Reverse iteration requires a copy or manual index
Collections.reverse(new ArrayList<>(orders)).forEach(this::process);
```

---

## Customization

- **JV-15 (Virtual threads)** requires Java 21+. On Java 17–20, continue using platform thread pools or reactive frameworks (Project Reactor, RxJava). Note that virtual threads work best with blocking I/O; code using `synchronized` blocks or thread-local variables may need adjustment. Spring Boot 3.2+ provides a configuration flag (`spring.threads.virtual.enabled: true`) to use virtual threads globally.

- **JV-16 (Text blocks)** requires Java 15+. Available in all supported Java versions (15+). Projects on Java 11 should continue using string concatenation.

- **JV-17 (Sequenced collections)** requires Java 21+. On older Java versions, use index-based access for lists and `first()`/`last()` for `SortedSet`. The methods are on existing collection interfaces (`List`, `SortedSet`, `LinkedHashMap`) so no code changes are needed beyond using the new API.

- **JV-07 (Records)** requires Java 16+. Projects on older JDKs should use immutable classes with `final` fields and manual `equals`/`hashCode` implementations, or Lombok's `@Value`.

- **JV-08 / JV-09 (Sealed types and pattern matching)** require Java 17+. On older JDKs, use the visitor pattern or exhaustive `if-else` chains with test coverage to catch missing subtypes.

- **JV-12 (`var` usage)** is the most style-debated rule. Some teams ban `var` entirely for consistency; others permit it universally for brevity. The rule above takes the middle ground — restrict to cases where the type is visually obvious — but teams should pick a stance and enforce it via code review or linter rules.

- **JV-02 (Checked vs. unchecked exceptions)** is philosophically divisive. The Spring ecosystem and most modern frameworks favor unchecked exceptions almost exclusively. The rule above takes the position that checked exceptions still have value for recoverable conditions (e.g., payment declined, file not found) where the compiler can remind callers to handle the case, but teams that prefer an all-unchecked approach should document that decision and rely on Javadoc `@throws` instead.
