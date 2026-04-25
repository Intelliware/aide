---
slug: api-integration-and-networking
title: "API Integration and Networking"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
---

## 11. API Integration and Networking

### 11.1 API Base Configuration

| Environment | Base URL | Timeout | Retry Policy |
|---|---|---|---|
| Debug | `http://localhost:8000` | 30s | 3 retries, exponential backoff |
| Staging | `https://staging.api.example.com` | 30s | 3 retries, exponential backoff |
| Production | `https://api.example.com` | 30s | 3 retries, exponential backoff |

### 11.2 HTTP Client Setup

**Android with Retrofit + OkHttp:**
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(AuthInterceptor())
        .addInterceptor(LoggingInterceptor())
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .client(okHttpClient)
        .build()
}
```

**iOS with URLSession:**
```swift
class ApiClient {
    static let shared = ApiClient()

    private let session: URLSession
    private let baseURL: URL

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        self.baseURL = URL(string: Config.apiBaseURL)!
    }
}
```

**React Native with Axios:**
```typescript
const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 11.3 API Endpoints Consumed

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ token, user: User }` |
| POST | `/api/auth/signup` | User registration | `{ email, password, name }` | `{ token, user: User }` |
| GET | `/api/users/:id` | Get user profile | — | `User` |
| GET | `/api/items` | List items | Query: `?page=1&limit=20` | `{ items: Item[], total: number }` |
| POST | `/api/items` | Create item | `{ title, description }` | `Item` |

### 11.4 Error Handling

<!-- How are API errors handled? What's the retry strategy? -->

[Document error types, retry logic, fallback behaviors, etc.]
