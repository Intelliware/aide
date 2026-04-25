---
slug: appendix-a-sample-projects
title: "Appendix A: Sample Projects"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 330
---

## 23. Appendix A: Sample Projects

### Android Sample

Located at: `github.com/example/framework-android-sample`

Build and run:
```bash
git clone https://github.com/example/framework-android-sample.git
cd framework-android-sample
./gradlew :app:installDebug
```

### iOS Sample

Located at: `github.com/example/framework-ios-sample`

Build and run:
```bash
git clone https://github.com/example/framework-ios-sample.git
cd framework-ios-sample
pod install
open MyApp.xcworkspace
# Run in Xcode: Product → Run
```

### React Native Sample

Located at: `github.com/example/framework-rn-sample`

Build and run:
```bash
git clone https://github.com/example/framework-rn-sample.git
cd framework-rn-sample
npm install
npx react-native run-ios
# or
npx react-native run-android
```
