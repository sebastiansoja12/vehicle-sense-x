# Native compilation evidence — 2026-11-26

Project: [@rubisco4471/vehiclesensex](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex), Expo58.0.26 / RN0.88.1, version0.2.0.

## First compiler runs

- Android Release APK validation: [4eaf540e-88e6-4b41-8cd4-5686b9dd56b7](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/4eaf540e-88e6-4b41-8cd4-5686b9dd56b7), **failed** in `:react-native-bluetooth-classic:compileReleaseJavaWithJavac` with six missing `kjd.reactnative.bluetooth.BuildConfig` references in `StateChangeReceiver` and `PairingReceiver`.
- iOS Release simulator: [ace81f64-663f-49e0-bb50-479e7752833c](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/ace81f64-663f-49e0-bb50-479e7752833c), **finished** at 07:48:42 UTC; final application linked successfully with TCP and BLE.

## Targeted Android fix

`mobile/plugins/withClassicBuildConfig.cjs` adds a project Gradle hook enabling `buildFeatures.buildConfig` for `react-native-bluetooth-classic` only, before that Android library is configured. This preserves CNG and avoids editing `node_modules` or committing native output. The actual failed compiler run is the regression reproduction; a new native build must confirm the fix.

An isolated `expo prebuild --platform android --no-install` generated exactly one targeted block; 135 regression tests, TypeScript and lint passed. These checks are not a substitute for the pending compiler rerun.

The independent code review found no actionable issues in the Gradle hook or archive. Repeated prebuild retained exactly one block; the updated archive contains 102 allowed files (1,497,183 bytes), including the plugin. Android rerun: [d99099b1-3458-497e-a496-ec3b449bdf16](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/d99099b1-3458-497e-a496-ec3b449bdf16), in progress when this entry was written.

No TCP patch: the installed RN0.88.1 Gradle plugin applies a namespace fallback to all Android libraries, including libraries without its own plugin (`ReactPlugin.kt`, `configureNamespaceForLibraries`); the first build passed configuration for TCP. Neither library has been converted to a TurboModule; both use RN's legacy module interop. The Directory warning remains visible.

## iOS artifact verification

Downloaded `artifacts/native/VehicleSenseX-0.2.0-ios-simulator.tar.gz` (28,727,631 bytes); SHA-256 `ac33a19140b0e0a73ac7f5b78c2c7ad0ce29064f289a23ee52213d6f0efa8ffb`. Binaries are excluded from Git.

Read final `VehicleSenseX.app/Info.plist` from the archive: bundle identifier `com.vehiclesensex.app`, version0.2.0/build1, iOS minimum16.4, simulator SDK27.1. Confirmed only Bluetooth, local network, foreground location and photo library usage descriptions; no camera, microphone, location Always descriptions or background modes. `file` verified x86_64/arm64 Mach-O, `nm -gU` verified linked `TcpSockets`, `TcpSocketClient` and `BlePlx` classes. `codesign -dv` reports an ad-hoc signature with no Apple team, as expected for simulator output. Selected metadata: [iOS artifact report](2026-11-26-ios-artifact.json).

The archive also contains 15 readable `PrivacyInfo.xcprivacy` files, including the main application's aggregate and file-system framework manifests; none enables tracking or declares tracking domains. Their actual API reason entries are retained in the artifact report. This inspects packaged metadata, not the future backend's privacy declarations or an App Store review outcome.

The production iOS credential preflight stopped before any build: `Credentials are not set up. Run this command again in interactive mode.` An Apple distribution certificate/provisioning profile and publisher's Apple account are still required; no Apple credentials were requested or read. Export-compliance information also remains to be confirmed by the publisher rather than guessed to silence the CLI warning.

The Android production flow reached a request to generate a new remote keystore. Automatic approval review rejected accepting this prompt because a production-build request did not explicitly authorize persistent signing-key creation. The flow was cancelled without generating a key; explicit approval was requested separately. Unsigned compilation continues independently.

## Scope and remaining gates

The root `.easignore` allows only the mobile application source, package lock, assets, config, plugins and patches; the archive was inspected before upload. Raw build metadata and signed log URLs remain outside the repository. EAS uses the existing account's free build allowance; no store submission was requested or run.

The validation APK is built without production signing credentials; the iOS simulator artifact cannot be uploaded to App Store. Release signing, hardware transport tests and store submission remain separate required checks, along with deployment of the real AI backend and publisher/privacy information listed in `mobile/RELEASE.md`.
