---
slug: state-management
title: "State Management"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. State Management

### 8.1 State Management Pattern

**Pattern:** [e.g., "Redux with async thunks for side effects"]

**Why:** [Reasoning for this choice]

### 8.2 Global State Structure

<!-- Show the complete state tree -->

```typescript
// Redux example
{
  auth: {
    isAuthenticated: boolean,
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null,
  },

  home: {
    items: Item[],
    selectedId: string | null,
    loading: boolean,
    error: string | null,
  },

  ui: {
    darkMode: boolean,
    selectedTab: 'home' | 'explore' | 'profile',
  },
}
```

### 8.3 State Mutation Pattern

<!-- How does state change? What actions/methods exist? -->

**Android MVVM with LiveData:**
```kotlin
class AuthViewModel(private val authUseCase: AuthUseCase) : ViewModel() {
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authUseCase.login(email, password)
            _authState.value = when {
                result.isSuccess -> AuthState.Success(result.getOrNull()!!)
                else -> AuthState.Error(result.exceptionOrNull()!!.message ?: "Unknown error")
            }
        }
    }
}

sealed class AuthState {
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

**iOS with Combine:**
```swift
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let authService: AuthService
    private var cancellables = Set<AnyCancellable>()

    func login(email: String, password: String) {
        isLoading = true
        authService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] user in
                self?.user = user
                self?.isAuthenticated = true
            }
            .store(in: &cancellables)
    }
}
```

**React Native with Redux:**
```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => { state.loading = true; },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Async thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginParams) => {
    const response = await authApi.login(email, password);
    return response.data;
  }
);
```

### 8.4 Side Effects and Async Operations

<!-- How are API calls, timers, and other side effects handled? -->

[Document how side effects are triggered and handled in your state management pattern]
