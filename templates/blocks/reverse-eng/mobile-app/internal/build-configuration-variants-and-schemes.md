---
slug: build-configuration-variants-and-schemes
title: "Build Configuration, Variants, and Schemes"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 140
---

## 4. Build Configuration, Variants, and Schemes

### 4.1 Build Variants/Flavors/Schemes

<!-- What build types exist and when to use them? -->

| Variant/Scheme | Purpose | API Base URL | Features | When to Use |
|---|---|---|---|---|
| Debug | Local development | `http://localhost:8000` | All features enabled, logging verbose | During development |
| Staging | Testing before production | `https://staging.api.example.com` | All features enabled, analytics mocked | QA testing, pre-release |
| Release/Production | Production deployment | `https://api.example.com` | Feature flags controlled | App store release |

### 4.2 Android Build Configuration

```gradle
// build.gradle (Module: app)

android {
    namespace "com.example.appname"
    compileSdk 34

    defaultConfig {
        applicationId "com.example.appname"
        minSdk 26
        targetSdk 34
        versionCode 24                    // Increment on every release
        versionName "2.4.5"               // Match version in version files
    }

    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
            applicationIdSuffix ".debug"
            signingConfig signingConfigs.debug
            buildConfigField "String", "API_BASE_URL", "\"http://localhost:8000\""
        }

        release {
            debuggable false
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
            buildConfigField "String", "API_BASE_URL", "\"https://api.example.com\""
        }
    }

    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            buildConfigField "String", "API_BASE_URL", "\"http://localhost:8000\""
        }

        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            buildConfigField "String", "API_BASE_URL", "\"https://staging.api.example.com\""
        }

        prod {
            dimension "environment"
            buildConfigField "String", "API_BASE_URL", "\"https://api.example.com\""
        }
    }
}
```

**Building variants:**
```bash
# Debug variant
./gradlew assembleDebug

# Staging release
./gradlew assembleStagingRelease

# Production release
./gradlew assembleProdRelease
```

### 4.3 iOS Build Configuration

```swift
// Build Settings in Xcode

// Configurations
├── Debug
│   └── API_BASE_URL = http://localhost:8000
├── Staging
│   └── API_BASE_URL = https://staging.api.example.com
└── Release
    └── API_BASE_URL = https://api.example.com

// Schemes
├── [AppName] (Debug)      → Debug configuration
├── [AppName] (Staging)    → Staging configuration
└── [AppName] (Release)    → Release configuration
```

**Building from command line:**
```bash
# Debug
xcodebuild -scheme "[AppName]" -configuration Debug -derivedDataPath build

# Staging
xcodebuild -scheme "[AppName] (Staging)" -configuration Staging -derivedDataPath build

# Release
xcodebuild -scheme "[AppName]" -configuration Release -derivedDataPath build
```

### 4.4 React Native Build Configuration

```json
// app.json
{
  "name": "[AppName]",
  "displayName": "[App Name]",
  "version": "2.4.5",
  "expo": {
    "name": "[App Name]",
    "slug": "appname",
    "platforms": ["android", "ios"],
    "version": "2.4.5",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "bundleIdentifier": "com.example.appname",
      "deploymentTarget": "13.0"
    },
    "android": {
      "package": "com.example.appname",
      "minSdkVersion": 26
    }
  }
}

// .env files for configuration
.env.development    → http://localhost:8000
.env.staging        → https://staging.api.example.com
.env.production     → https://api.example.com
```
