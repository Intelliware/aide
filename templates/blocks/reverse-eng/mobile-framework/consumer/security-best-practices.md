---
slug: security-best-practices
title: "Security Best Practices"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 240
---

## 14. Security Best Practices

### 14.1 [Best Practice, e.g., "Storing Sensitive Data"]

**Android:**
```kotlin
// Use Android Keystore System
val keyGenParameterSpec = KeyGenParameterSpec.Builder(
    "myKeyAlias",
    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
).setBlockModes(KeyProperties.BLOCK_MODE_GCM).build()

val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES)
keyGenerator.init(keyGenParameterSpec)
val secretKey = keyGenerator.generateKey()
```

**iOS:**
```swift
// Use Keychain
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "myAccount",
    kSecValueData as String: data.data(using: .utf8)!
]
SecItemAdd(query as CFDictionary, nil)
```

**React Native:**
```typescript
// Use react-native-keychain
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('account', 'password');
const credentials = await Keychain.getGenericPassword();
```

---

# Part 5 — React Native Specific
