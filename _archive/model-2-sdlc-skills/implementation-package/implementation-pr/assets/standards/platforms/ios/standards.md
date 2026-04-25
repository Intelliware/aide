# iOS Platform Standards

## Purpose

These standards establish iOS platform-specific patterns for building robust, user-friendly applications. They supplement the Swift language standards — which cover how to write Swift code — with rules governing app lifecycle, navigation, persistence, permissions, accessibility, and App Store compliance. Following these rules ensures iOS apps behave predictably, leverage platform capabilities correctly, and meet Apple's requirements for distribution.

## Applicability

All iOS applications targeting iOS 16+ with SwiftUI and Swift 5.9+. Projects using UIKit should adapt the architectural patterns while following UIKit-specific guidance in the Customization section. Projects targeting iOS 17+ can additionally use `@Observable` (replacing `ObservableObject`) and `SwiftData` (replacing Core Data).

## Rules

### IOS-01: Use SwiftUI App Lifecycle for New Apps

**Severity:** Convention
**Rule:** Define the app entry point using `@main struct MyApp: App` with a `WindowGroup` scene — use `UIApplicationDelegate` adapter via `@UIApplicationDelegateAdaptor` only when needed for push notifications, deep links, or third-party SDKs.
**Why:** The SwiftUI lifecycle eliminates boilerplate, integrates with SwiftUI's state management, and is the direction Apple invests in.

**Compliant:**

```swift
@main
struct ShopApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.viewContext)
        }
    }

    private let persistenceController = PersistenceController.shared
}

// UIApplicationDelegateAdaptor only when necessary (push notifications)
@main
struct ShopApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        PushService.shared.register(token: deviceToken)
    }
}
```

**Non-compliant:**

```swift
// Using UIKit lifecycle for a new SwiftUI app without justification
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = UIHostingController(rootView: ContentView())
        window?.makeKeyAndVisible()
        return true
    }
}
```

---

### IOS-02: Use NavigationStack for Navigation

**Severity:** Error
**Rule:** Use `NavigationStack` with typed `NavigationPath` and `navigationDestination` modifiers — never use the deprecated `NavigationView`; use `NavigationSplitView` for sidebar/detail layouts on iPad.
**Why:** `NavigationStack` supports programmatic navigation, type-safe routing, and deep linking — `NavigationView` has known bugs and is no longer maintained by Apple.

**Compliant:**

```swift
struct CatalogView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            ProductListView()
                .navigationDestination(for: Product.self) { product in
                    ProductDetailView(product: product)
                }
                .navigationDestination(for: Category.self) { category in
                    CategoryView(category: category)
                }
        }
    }

    func navigateToProduct(_ product: Product) {
        path.append(product)
    }
}

// iPad sidebar/detail layout
struct iPadCatalogView: View {
    @State private var selectedCategory: Category?
    @State private var selectedProduct: Product?

    var body: some View {
        NavigationSplitView {
            CategorySidebar(selection: $selectedCategory)
        } content: {
            if let category = selectedCategory {
                ProductListView(category: category, selection: $selectedProduct)
            }
        } detail: {
            if let product = selectedProduct {
                ProductDetailView(product: product)
            } else {
                Text("Select a product")
            }
        }
    }
}
```

**Non-compliant:**

```swift
// Deprecated NavigationView — has layout bugs on iPad and no programmatic navigation
struct CatalogView: View {
    var body: some View {
        NavigationView {
            List(products) { product in
                NavigationLink(destination: ProductDetailView(product: product)) {
                    ProductRow(product: product)
                }
            }
        }
    }
}
```

---

### IOS-03: Choose the Right Persistence Layer

**Severity:** Error
**Rule:** Use SwiftData for structured domain models, `UserDefaults` for simple preferences (booleans, small strings), Keychain for secrets and tokens, and the file system for documents and media — never store secrets in `UserDefaults`.
**Why:** Each persistence mechanism has different security, performance, and query characteristics; misuse leads to data leaks (secrets in plaintext), performance problems (large data in UserDefaults), or unnecessary complexity.

**Compliant:**

```swift
// SwiftData for domain models
@Model
class Order {
    var id: UUID
    var customerName: String
    var items: [OrderItem]
    var createdAt: Date
    var status: OrderStatus

    init(customerName: String, items: [OrderItem]) {
        self.id = UUID()
        self.customerName = customerName
        self.items = items
        self.createdAt = Date()
        self.status = .pending
    }
}

// UserDefaults for simple preferences
extension UserDefaults {
    var hasCompletedOnboarding: Bool {
        get { bool(forKey: "hasCompletedOnboarding") }
        set { set(newValue, forKey: "hasCompletedOnboarding") }
    }
}

// Keychain for secrets
func storeAuthToken(_ token: String) throws {
    let data = Data(token.utf8)
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "authToken",
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]
    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else {
        throw KeychainError.unableToStore(status)
    }
}
```

**Non-compliant:**

```swift
// Storing an auth token in UserDefaults — plaintext, no encryption, backed up to iCloud
UserDefaults.standard.set(authToken, forKey: "authToken")

// Storing large structured data in UserDefaults — not designed for this
let encoder = JSONEncoder()
let data = try encoder.encode(allOrders) // potentially megabytes
UserDefaults.standard.set(data, forKey: "orders")
```

---

### IOS-04: Request Permissions Progressively

**Severity:** Error
**Rule:** Request permissions in context when the feature needs them, preceded by a custom pre-prompt explaining why — never request all permissions at app launch; handle denial gracefully with degraded functionality.
**Why:** Users deny blanket permission requests they don't understand; contextual requests with clear explanations have significantly higher grant rates and build trust.

**Compliant:**

```swift
struct PhotoAttachmentButton: View {
    @State private var showingPermissionExplanation = false
    @State private var showingPhotoPicker = false

    var body: some View {
        Button("Add Photo") {
            let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
            switch status {
            case .authorized, .limited:
                showingPhotoPicker = true
            case .notDetermined:
                showingPermissionExplanation = true
            case .denied, .restricted:
                showingSettingsPrompt = true
            @unknown default:
                break
            }
        }
        .alert("Photo Access", isPresented: $showingPermissionExplanation) {
            Button("Allow Access") {
                PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
                    if status == .authorized || status == .limited {
                        showingPhotoPicker = true
                    }
                }
            }
            Button("Not Now", role: .cancel) {}
        } message: {
            Text("We need access to your photos so you can attach images to your order.")
        }
    }
}
```

**Non-compliant:**

```swift
// Requesting every permission at app launch with no context
func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    CLLocationManager().requestAlwaysAuthorization()
    AVCaptureDevice.requestAccess(for: .video) { _ in }
    PHPhotoLibrary.requestAuthorization { _ in }
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
    return true
}
```

---

### IOS-05: Use BGTaskScheduler for Background Work

**Severity:** Error
**Rule:** Register `BGAppRefreshTask` or `BGProcessingTask` with `BGTaskScheduler` for background work — never perform long-running work in `applicationDidEnterBackground`; respect battery and data constraints.
**Why:** iOS terminates apps that exceed background execution time limits; `BGTaskScheduler` integrates with the system's resource management to run tasks at optimal times.

**Compliant:**

```swift
// Register at launch
func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.shop.sync",
        using: nil
    ) { task in
        self.handleSync(task: task as! BGAppRefreshTask)
    }
    return true
}

func scheduleSync() {
    let request = BGAppRefreshTaskRequest(identifier: "com.shop.sync")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}

func handleSync(task: BGAppRefreshTask) {
    let syncOperation = SyncOperation()

    task.expirationHandler = {
        syncOperation.cancel()
    }

    syncOperation.completionBlock = {
        task.setTaskCompleted(success: !syncOperation.isCancelled)
        self.scheduleSync()
    }

    OperationQueue().addOperation(syncOperation)
}
```

**Non-compliant:**

```swift
// Long-running work in applicationDidEnterBackground — will be killed by iOS
func applicationDidEnterBackground(_ application: UIApplication) {
    let orders = try await fetchAllPendingOrders()
    for order in orders {
        try await syncOrder(order)
    }
}
```

---

### IOS-06: Implement Universal Links for Deep Linking

**Severity:** Warning
**Rule:** Use Associated Domains with an `apple-app-site-association` file for deep linking — handle links using the `onOpenURL` modifier or `application(_:continue:)` — fall back gracefully when content is unavailable.
**Why:** Universal Links provide a seamless transition from web to app without custom URL schemes, and they are validated by Apple to prevent spoofing.

**Compliant:**

```swift
// Handle in SwiftUI with onOpenURL
@main
struct ShopApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    DeepLinkRouter.shared.handle(url)
                }
        }
    }
}

struct DeepLinkRouter {
    static let shared = DeepLinkRouter()

    func handle(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else {
            return
        }

        let pathComponents = components.path
            .split(separator: "/")
            .map(String.init)

        switch (host, pathComponents.first) {
        case ("shop.example.com", "products"):
            if let productID = pathComponents.dropFirst().first {
                navigateToProduct(id: productID)
            }
        case ("shop.example.com", "orders"):
            if let orderID = pathComponents.dropFirst().first {
                navigateToOrder(id: orderID)
            }
        default:
            navigateToHome()
        }
    }
}
```

**Non-compliant:**

```swift
// Custom URL scheme only — not validated, easily spoofed, doesn't work from Safari
// Info.plist: myapp://product/123
func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
    // No fallback when content isn't found
    let productID = url.pathComponents.last!
    showProduct(productID) // force-unwrap and no error handling
    return true
}
```

---

### IOS-07: Handle Push Notifications Properly

**Severity:** Error
**Rule:** Register with APNs, request authorization separately, and handle foreground, background, and terminated-launch notification states — implement `UNUserNotificationCenterDelegate`; never assume permission is granted.
**Why:** Notifications arrive in different app states with different handling requirements; failing to implement all paths causes missed notifications or crashes on launch.

**Compliant:**

```swift
class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()

    func setup() {
        UNUserNotificationCenter.current().delegate = self
    }

    func requestPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            if granted {
                await MainActor.run {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            return granted
        } catch {
            return false
        }
    }

    // Foreground notification display
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        let data = notification.request.content.userInfo
        await processNotificationPayload(data)
        return [.banner, .badge, .sound]
    }

    // User tapped a notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        let data = response.notification.request.content.userInfo
        await handleNotificationAction(data, actionIdentifier: response.actionIdentifier)
    }
}
```

**Non-compliant:**

```swift
// Registering for push without requesting authorization
func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    application.registerForRemoteNotifications()
    return true
}

// Assuming permission is always granted — no fallback
func enableNotifications() {
    UIApplication.shared.registerForRemoteNotifications()
    // No authorization check, no delegate, no foreground handling
}
```

---

### IOS-08: Support Dynamic Type and VoiceOver

**Severity:** Error
**Rule:** Use semantic fonts (`.body`, `.headline`, `.caption`) via `Font.TextStyle`, provide `accessibilityLabel` on all interactive elements, and maintain minimum 44pt touch targets — test with VoiceOver enabled.
**Why:** Approximately 25% of iOS users customize text size; VoiceOver support is both a legal requirement (accessibility laws) and essential for a significant user population.

**Compliant:**

```swift
struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: product.imageURL)
                .accessibilityLabel("Photo of \(product.name)")

            Text(product.name)
                .font(.headline)
            Text(product.formattedPrice)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Button {
                addToCart(product)
            } label: {
                Label("Add to Cart", systemImage: "cart.badge.plus")
                    .frame(minHeight: 44)
            }
            .accessibilityLabel("Add \(product.name) to cart")
            .accessibilityHint("Double-tap to add this item to your shopping cart")
        }
    }
}
```

**Non-compliant:**

```swift
struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack {
            Image(product.imageName)
                // No accessibility label — VoiceOver reads "Image"

            Text(product.name)
                .font(.system(size: 16)) // Fixed size — ignores Dynamic Type

            Button(action: { addToCart(product) }) {
                Image(systemName: "plus")
                    .frame(width: 24, height: 24) // Below 44pt minimum
                    // No accessibility label — VoiceOver reads "plus"
            }
        }
    }
}
```

---

### IOS-09: Follow Apple Human Interface Guidelines

**Severity:** Warning
**Rule:** Use SF Symbols for iconography, system controls for standard interactions, and platform idioms — tab bar at bottom, navigation bar at top, swipe-to-delete in lists; never replicate Android or web navigation patterns.
**Why:** Users expect consistent behavior across iOS apps; non-standard patterns increase cognitive load, feel foreign, and often trigger App Review rejection.

**Compliant:**

```swift
struct MainTabView: View {
    var body: some View {
        TabView {
            CatalogView()
                .tabItem {
                    Label("Shop", systemImage: "storefront")
                }
            CartView()
                .tabItem {
                    Label("Cart", systemImage: "cart")
                }
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}

struct OrderListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var orders: [Order]

    var body: some View {
        List {
            ForEach(orders) { order in
                OrderRow(order: order)
            }
            .onDelete { indexSet in
                for index in indexSet {
                    modelContext.delete(orders[index])
                }
            }
        }
        .navigationTitle("Orders")
    }
}
```

**Non-compliant:**

```swift
// Hamburger menu for primary navigation — an Android/web pattern
struct MainView: View {
    @State private var showMenu = false

    var body: some View {
        ZStack {
            ContentView()
            if showMenu {
                SideMenuView() // Drawer menu — not an iOS idiom
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button(action: { showMenu.toggle() }) {
                    Image(systemName: "line.3.horizontal") // "Hamburger" icon
                }
            }
        }
    }
}

// Bottom navigation bar built from scratch instead of using TabView
struct CustomBottomBar: View {
    var body: some View {
        HStack {
            // Custom tab buttons — misses system tab bar behaviors
            // (badge support, long-press, scroll-to-top)
        }
    }
}
```

---

### IOS-10: Handle App Store Review Requirements

**Severity:** Error
**Rule:** Never use private APIs, never load executable code dynamically (except JavaScript in WebViews), provide accurate screenshots and privacy labels — test all flows in Release configuration before submission.
**Why:** Violating App Store Review Guidelines causes rejection and delays; some violations (private API usage, hot-code loading) result in app removal from the store.

**Compliant:**

```swift
// Privacy labels: declare data usage accurately in App Store Connect
// No private API usage — use only documented, public frameworks

// Test in Release configuration to catch issues hidden by DEBUG builds
#if DEBUG
struct DebugMenu: View {
    var body: some View {
        Section("Debug") {
            Button("Reset Onboarding") { UserDefaults.standard.resetOnboarding() }
            Button("Clear Cache") { ImageCache.shared.clear() }
        }
    }
}
#endif

// Ensure login, in-app purchase, and subscription flows all work end-to-end
// Test with a sandbox Apple ID in TestFlight before submission
```

**Non-compliant:**

```swift
// Using private API — will be flagged by automated review
let statusBar = UIApplication.shared.value(forKey: "statusBar") as? UIView
statusBar?.setValue(UIColor.red, forKey: "foregroundColor")

// Hot-code loading — explicitly banned by App Store guidelines
let scriptURL = URL(string: "https://example.com/update.js")!
let script = try String(contentsOf: scriptURL)
jsContext.evaluateScript(script)

// Shipping with test/debug code active in Release
func viewDidLoad() {
    super.viewDidLoad()
    UserDefaults.standard.set(true, forKey: "isPremiumUser") // bypasses IAP
}
```

---

### IOS-11: Use Coordinator Pattern for Navigation Logic

**Severity:** Convention
**Rule:** Separate navigation logic from views using coordinators that manage flow — views declare what navigation events they emit, coordinators decide where to go; this prevents deep view hierarchy coupling.
**Why:** Embedding navigation decisions in views makes them hard to reuse, test, and restructure; coordinators centralize flow logic so views remain composable.

**Compliant:**

```swift
// Coordinator owns the navigation path and flow decisions
@Observable
class OrderFlowCoordinator {
    var path = NavigationPath()

    enum Step: Hashable {
        case cart
        case shipping
        case payment
        case confirmation(orderID: String)
    }

    func goToShipping() {
        path.append(Step.shipping)
    }

    func goToPayment() {
        path.append(Step.payment)
    }

    func completeOrder(id: String) {
        path = NavigationPath()
        path.append(Step.confirmation(orderID: id))
    }

    func reset() {
        path = NavigationPath()
    }
}

// View is navigation-unaware — it calls coordinator methods
struct CartView: View {
    let coordinator: OrderFlowCoordinator

    var body: some View {
        VStack {
            CartItemsList()
            Button("Proceed to Shipping") {
                coordinator.goToShipping()
            }
        }
    }
}

// Host view wires coordinator to NavigationStack
struct OrderFlowView: View {
    @State private var coordinator = OrderFlowCoordinator()

    var body: some View {
        NavigationStack(path: $coordinator.path) {
            CartView(coordinator: coordinator)
                .navigationDestination(for: OrderFlowCoordinator.Step.self) { step in
                    switch step {
                    case .cart: CartView(coordinator: coordinator)
                    case .shipping: ShippingView(coordinator: coordinator)
                    case .payment: PaymentView(coordinator: coordinator)
                    case .confirmation(let id): ConfirmationView(orderID: id)
                    }
                }
        }
    }
}
```

**Non-compliant:**

```swift
// Navigation decisions embedded directly in views — tightly coupled
struct CartView: View {
    @State private var showShipping = false
    @State private var showPayment = false
    @State private var showConfirmation = false
    @State private var orderID: String?

    var body: some View {
        VStack {
            CartItemsList()
            NavigationLink("Checkout", isActive: $showShipping) {
                ShippingView(onComplete: {
                    showShipping = false
                    showPayment = true
                })
            }
        }
        // Deep nesting of NavigationLinks makes the flow impossible to follow
    }
}
```

---

### IOS-12: Use Asset Catalogs and Localization

**Severity:** Warning
**Rule:** Store images in Asset Catalogs with 1x/2x/3x variants; store user-facing strings in `Localizable.xcstrings` — never hardcode user-facing strings; use `String(localized:)` for all display text.
**Why:** Asset Catalogs enable automatic resolution selection, dark mode variants, and App Thinning; localization files allow translation without code changes and are required for international markets.

**Compliant:**

```swift
// Images from Asset Catalog — automatic resolution and dark/light variants
struct ProductView: View {
    var body: some View {
        Image("product-placeholder") // defined in Assets.xcassets with 1x/2x/3x
            .resizable()
            .aspectRatio(contentMode: .fit)

        Image(.productPlaceholder) // type-safe with Xcode-generated constants
            .resizable()
            .aspectRatio(contentMode: .fit)
    }
}

// Localized strings
struct EmptyCartView: View {
    var body: some View {
        VStack {
            Text(String(localized: "cart.empty.title"))
            Text(String(localized: "cart.empty.message"))
            Button(String(localized: "cart.empty.browseCTA")) {
                navigateToCatalog()
            }
        }
    }
}

// Pluralization via String(localized:) with string interpolation
func itemCountLabel(_ count: Int) -> String {
    String(localized: "\(count) items in cart")
}
```

**Non-compliant:**

```swift
// Hardcoded user-facing strings — impossible to localize
struct EmptyCartView: View {
    var body: some View {
        VStack {
            Text("Your cart is empty")
            Text("Browse our catalog to find something you love")
            Button("Start Shopping") {
                navigateToCatalog()
            }
        }
    }
}

// Loading images from bundle by name without Asset Catalog
let image = UIImage(named: "product_photo_2x.png")

// Concatenating strings for pluralization — breaks in other languages
let label = "You have " + String(count) + " items"
```

## Customization

- **IOS-01 (SwiftUI lifecycle)** may need relaxation for apps with complex `UIApplicationDelegate` requirements — e.g., apps integrating multiple third-party SDKs that require delegate method callbacks not yet available through SwiftUI's lifecycle modifiers. Teams maintaining existing UIKit apps should adopt the SwiftUI lifecycle incrementally during major rewrites rather than migrating all at once.

- **IOS-02 (NavigationStack)** navigation patterns depend on app complexity. Simple utility apps may use direct `NavigationLink` without `NavigationPath`, while multi-flow apps (e-commerce, banking) benefit from the full typed-path approach. `NavigationSplitView` is primarily relevant for iPad-optimized or universal apps.

- **IOS-03 (Persistence layer)** choice depends on the data model. Apps with simple key-value needs may not require SwiftData. Core Data remains appropriate for existing projects that haven't migrated. Some teams use SQLite directly (via GRDB or similar) for performance-critical or cross-platform data layers.

- **IOS-11 (Coordinator pattern)** is actively debated in the SwiftUI community. SwiftUI's declarative navigation model (`NavigationStack` with `NavigationPath`) already centralizes navigation state, which reduces — but doesn't eliminate — the need for coordinators. Teams with simple navigation flows may find coordinators add unnecessary indirection. The pattern is most valuable in apps with complex, multi-step flows (onboarding, checkout, authentication) where flow logic benefits from being separate from view rendering.
