[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Native build results — 2026-11-26

Project: [@rubisco4471/vehiclesensex](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex), Expo 58.0.26 / RN 0.88.1, version 0.2.0. Transports: BLE 3.5.1, TCP 6.4.3, Android Classic 1.73.0-rc.17. Compilation, signing and hardware operation are separate verification stages.

## Expo jobs

| Platform and profile | Job | Result |
| --- | --- | --- |
| Android Release APK, first attempt | [4eaf540e-88e6-4b41-8cd4-5686b9dd56b7](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/4eaf540e-88e6-4b41-8cd4-5686b9dd56b7) | Classic compilation error: missing BuildConfig |
| Android Release APK, after fix | [d99099b1-3458-497e-a496-ec3b449bdf16](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/d99099b1-3458-497e-a496-ec3b449bdf16) | Success, 08:10:22 UTC |
| iOS Release, simulator | [ace81f64-663f-49e0-bb50-479e7752833c](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/ace81f64-663f-49e0-bb50-479e7752833c) | Success, 07:48:42 UTC |
| Android production AAB | [714a8afc-a7da-487b-9622-498bdb0103d4](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/714a8afc-a7da-487b-9622-498bdb0103d4) | In progress; revision 8056cf63e433894bad1ba6af6601dcade31cc8bb |

## Android Classic and New Architecture fix

The first compiler reported six missing references to `kjd.reactnative.bluetooth.BuildConfig` in `StateChangeReceiver` and `PairingReceiver`, during `:react-native-bluetooth-classic:compileReleaseJavaWithJavac`. By default, AGP did not generate this class in the library.

`mobile/plugins/withClassicBuildConfig.cjs` enables `buildFeatures.buildConfig` only for `react-native-bluetooth-classic`, before Android library configuration finishes. It preserves CNG; it neither edits `node_modules` nor requires checking generated native directories into the repository. Isolated `expo prebuild --platform android --no-install`, also run a second time, generated exactly one block. The 135 regression tests, TypeScript and lint passed; independent review found no issues with the fix or archive. The next build confirmed class generation and success of the entire APK.

TCP needs no namespace patch: the installed RN0.88.1 Gradle plugin applies namespace fallback to all Android libraries (`ReactPlugin.kt`, `configureNamespaceForLibraries`). Classic and TCP still use RN legacy-module interop; they have not been rewritten as TurboModules. The Directory “Untested on New Architecture” warning remains visible. Successful compilation does not prove radio, routing or event behavior on a device.

## APK verification

Local file: `artifacts/native/VehicleSenseX-0.2.0-android-validation.apk`, 109822572 bytes. SHA-256: `b77f4f5f6ca4c02ede18efdb7219cfb1d823250dbe930c48ce94c9b725535eac`. The [APK report](2026-11-26-android-artifact.json) contains selected metadata and the full permission list.

The final manifest confirms `com.vehiclesensex.app`, version 0.2.0/code 1, minSdk 24/targetSdk 36, `allowBackup=false` and no application debug mode. No camera, microphone, broad media access, overlays or background location/recording. Actual Bluetooth, network, foreground-location and notification permissions are present; libraries also add launcher badge permissions, listed in the report.

The APK contains `RNBluetoothClassicModule`, `TcpSocketModule`, `BlePlxModule`, a standalone JS bundle (3201928 bytes) and arm64-v8a/armeabi-v7a/x86/x86_64 libraries. All 54 64-bit libraries were checked for ELF LOAD segment alignment to at least 16384 bytes, no writable data in the rounded RELRO end, and uncompressed ZIP entries aligned to 16384 bytes. The check accounts for RELRO padding; it does not replace execution on a system with a 16 KB page size. ELF headers were also compared with `llvm-objdump` output.

Official Google apksig 9.5.3 verified the APK v2 signature without errors or warnings. This is a `CN=Android Debug` certificate, not a production key; the certificate fingerprint is in the report. The APK is for testing. Installing a later version with a different signature may require uninstalling the test version; export personal data first.

## iOS artifact verification

Local file: `artifacts/native/VehicleSenseX-0.2.0-ios-simulator.tar.gz`, 28727631 bytes. SHA-256: `ac33a19140b0e0a73ac7f5b78c2c7ad0ce29064f289a23ee52213d6f0efa8ffb`. The [iOS report](2026-11-26-ios-artifact.json) contains selected metadata.

The final `VehicleSenseX.app/Info.plist` confirms the `com.vehiclesensex.app` identifier, version 0.2.0/build 1, minimum iOS 16.4 and simulator SDK 27.1. Permission descriptions cover Bluetooth, local network, location while in use and the photo library; no camera, microphone, Always location or background modes. `file` confirmed Mach-O x86_64/arm64, `nm -gU` the presence of `TcpSockets`, `TcpSocketClient` and `BlePlx` classes, and the archive contains a standalone `main.jsbundle` (3824069 bytes). `codesign -dv` indicates an ad-hoc signature without an Apple team, appropriate for the simulator.

15 `PrivacyInfo.xcprivacy` files were read, including the aggregated app manifest and filesystem framework manifests. None enables tracking or declares tracking domains; actual API-use reason entries are preserved in the report. This is neither a declaration about a future backend nor an App Store review result.

## Signing, sources and remaining requirements

The root `.easignore` restricts the Expo archive: after the Classic fix, it contained 102 allowed files (1497183 bytes), including the CNG plugin. It was inspected before upload; no environment files, local settings, native directories, `node_modules` or keys. Raw metadata with signed log URLs remains outside the repository, as do the binaries. The existing account and free Expo allowance were used, without store submission.

The automatic approval check initially rejected creating a persistent Android key without explicit consent; that process was canceled. The user subsequently explicitly approved generating and storing a new keystore in Expo. The key was created and a signed AAB is being built in the job listed above. Private key material was neither read nor added to the repository.

The iOS production attempt stopped before building: `Credentials are not set up. Run this command again in interactive mode.` The user confirmed having no active Apple Developer account. A publishable IPA requires membership, a distribution certificate/profile and publisher configuration of the encryption export declaration; no declaration was guessed to remove the CLI warning. The simulator version is not an App Store IPA.

Transport tests on physical phones and adapters, signed iOS distribution, actual AI backend deployment and the publisher details/privacy policy described in `mobile/RELEASE.md` are still required. No hardware tests or execution test on a system with 16 KB pages has been performed.

Alignment criteria source: [Android 16 KB page-size documentation](https://developer.android.com/guide/practices/page-sizes). Technical identifiers and JSON reports retain their original syntax in every language version.
