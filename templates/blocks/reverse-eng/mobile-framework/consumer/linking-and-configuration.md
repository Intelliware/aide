---
slug: linking-and-configuration
title: "Linking and Configuration"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Linking and Configuration

### 16.1 Auto-Linking (React Native 0.60+)

No manual linking required! The framework is automatically linked when installed via npm.

### 16.2 Manual Linking (React Native < 0.60)

**Android:**
```bash
react-native link @example/framework
```

**iOS:**
```bash
react-native link @example/framework
cd ios && pod install
```

---

# Part 6 — Quality and Maintenance
