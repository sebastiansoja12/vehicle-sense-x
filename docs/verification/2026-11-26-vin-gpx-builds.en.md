[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# VIN and GPX 0.2.1 implementation verification

Source 0.2.1/build 2: real NHTSA vehicle details after consent and GPX export of saved trips. Tests: 161/161 before the backend shutdown tests; types, lint, web export and Android/iOS Hermes bundles passed. Both native builds subsequently succeeded and their final artifacts were inspected below.

The real client and web form used a public example VIN; verified preview, changed-field blocking, preservation of an unselected year and manual engine text, and consent reset after VIN changes. The form was closed without saving a sample vehicle.

Independent GPX and VIN reviews found no important issues. Decision: a new application retains only selected fields from that result; earlier evidence is not given a new timestamp. This can remove provenance for earlier unselected fields, but not their values.

Native 0.2.1 builds were submitted from revision `63b273d`: [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) and [iOS simulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Inspected archive: 110 files,1547848 bytes, new modules included, no keys or local settings. Earlier0.2.0 artifacts lack these features. Before submission 4 of30 free builds were used, with no overage cost. Android was resubmitted separately after concurrent archiving collided on Git configuration; that failure created no build job.

## Backend

Added bounded SIGTERM/SIGINT shutdown and a nonroot Node 24.18.0 container. All 13 backend and 164 total tests passed, along with code review. The built image ran with a read-only filesystem and localhost-only port; its healthcheck passed without paid API configuration, and the container exited0 and was removed. The image code hash matches the source. No private credentials in the image, public deployment or paid calls. [Container metadata](2026-11-26-assistant-container.json).

Physical phone/adapter and native GPX sharing tests remain unperformed; a store IPA requires an active Apple Developer account. No store submission was performed.

## iOS 0.2.1 artifact

The iOS simulator build succeeded. The final0.2.1/build 2 bundle has the expected permissions and iOS 16.4 minimum, without background modes, camera, microphone or Always location. Its JS bundle contains NHTSA and GPX code; BLE/TCP classes, x86_64/arm64 architectures and an ad-hoc signature without an Apple team were confirmed. [Artifact metadata](2026-11-26-ios-021-artifact.json). This is not an App Store IPA or a device runtime test.

## Android 0.2.1 artifact

The signed production AAB completed at 13:48:47 UTC. Local file: `artifacts/native/VehicleSenseX-0.2.1-android-production.aab`, 75737623 bytes, SHA-256 `ae3351c17e5a321f497db0796aa05f7e24c2278b5b7db2a5a828438f890b7192`. Official Bundletool 1.18.3 validated the bundle; JDK 21 verified its JAR signature and the certificate matches the existing Expo production key. The report preserves the self-signed certificate, timestamp and ZIP-attribute warnings.

The final manifest confirms version 0.2.1/code 2, package `com.vehiclesensex.app`, minSdk 24/targetSdk 36, backup disabled and no debug mode. Permissions match the earlier inspected APK. All three transport modules, four ABIs and the new VIN/GPX JavaScript markers are present. All 54 64-bit libraries passed ELF LOAD alignment and RELRO checks for 16 KB pages; BundleConfig requests `PAGE_ALIGNMENT_16K`. [Artifact metadata](2026-11-26-android-021-artifact.json). No phone execution, store upload or new installable APK is implied by these checks.
