# Native compilation evidence — 2026-11-26

Project: [@rubisco4471/vehiclesensex](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex), Expo58.0.26 / RN0.88.1, version0.2.0.

## First compiler runs

- Android Release APK validation: [4eaf540e-88e6-4b41-8cd4-5686b9dd56b7](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/4eaf540e-88e6-4b41-8cd4-5686b9dd56b7), **failed** in `:react-native-bluetooth-classic:compileReleaseJavaWithJavac` with six missing `kjd.reactnative.bluetooth.BuildConfig` references in `StateChangeReceiver` and `PairingReceiver`.
- iOS Release simulator: [ace81f64-663f-49e0-bb50-479e7752833c](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/ace81f64-663f-49e0-bb50-479e7752833c), still running when this entry was written; TCP Objective-C library compilation has completed, final application link is not yet confirmed.

## Targeted Android fix

`mobile/plugins/withClassicBuildConfig.cjs` adds a project Gradle hook enabling `buildFeatures.buildConfig` for `react-native-bluetooth-classic` only, before that Android library is configured. This preserves CNG and avoids editing `node_modules` or committing native output. The actual failed compiler run is the regression reproduction; a new native build must confirm the fix.

An isolated `expo prebuild --platform android --no-install` generated exactly one targeted block; 135 regression tests, TypeScript and lint passed. These checks are not a substitute for the pending compiler rerun.

No TCP patch: the installed RN0.88.1 Gradle plugin applies a namespace fallback to all Android libraries, including libraries without its own plugin (`ReactPlugin.kt`, `configureNamespaceForLibraries`); the first build passed configuration for TCP. Neither library has been converted to a TurboModule; both use RN's legacy module interop. The Directory warning remains visible.

## Scope and remaining gates

The root `.easignore` allows only the mobile application source, package lock, assets, config, plugins and patches; the archive was inspected before upload. Raw build metadata and signed log URLs remain outside the repository. EAS uses the existing account's free build allowance; no store submission was requested or run.

The validation APK is built without production signing credentials; the iOS simulator artifact cannot be uploaded to App Store. Release signing, hardware transport tests and store submission remain separate required checks, along with deployment of the real AI backend and publisher/privacy information listed in `mobile/RELEASE.md`.
