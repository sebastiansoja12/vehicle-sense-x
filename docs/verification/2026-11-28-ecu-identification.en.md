[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# ECU identification · 0.6.0 / 8

Source 0.6.0/build 8 adds a separate full CAN scan with CALID, CVN and controller name. Cockpit, emissions readiness, oil temperature and workshop comparisons from main are preserved.

## Verification

After integration and review fixes, 358 committed source tests passed. The complete local main workspace with preserved interface edits has 371 passing tests. Types, lint and PL/EN/DE documentation pass. Review fixed mixed pending/NO DATA responses and missing readiness/oil data in basic exports.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46112569036) · `dd64fcd`

## Packages and limits

Signed Android APK/AAB and iOS Release simulator packages for 0.6.0/build 8 from source `dd64fcd` have been verified. Packages include ECU identification, cockpit and the native radio module from main. Additional uncommitted local interface edits are excluded. Existing 0.5.0 packages do not contain ECU identification or later main changes.

APK and AAB use the same existing Expo certificate. Signatures, 54 64-bit libraries, 16 KB alignment and AAB validation with bundletool 1.18.3 passed. Permissions match 0.4.0; APK/AAB DEX files are identical. BLE, Android Classic, TCP, Speech and VehicleRadio and diagnostic paths in Hermes bytecode were confirmed.

iOS contains arm64 and x86_64, an ad-hoc signature without an Apple team, BLE/TCP/Speech/VehicleRadio modules and 15 privacy manifests without tracking domains. CarPlay is disabled: no CarPlay scene or entitlement. The package has not been launched on a simulator or phone.

Physical adapter/phone, native PDF and radio projection tests have not been performed. Compilation does not establish compatibility with every adapter or connections on New Architecture. An active Apple Developer account is still required for a signed App Store IPA; CarPlay requires separate approval. No app was submitted to stores.

| Package | Bytes | Metadata and SHA-256 |
| --- | ---: | --- |
| Android APK | 110185904 | [Result](2026-11-28-android-060-apk-artifact.json) |
| Android AAB | 75908145 | [Result](2026-11-28-android-060-aab-artifact.json) |
| iOS simulator | 29034337 | [Result](2026-11-28-ios-060-artifact.json) |

[Android APK](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/1870c254-e8fd-4b89-8929-626143ccc331) · [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/580d1765-c194-4a6b-a541-119d730e934c) · [iOS](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/c6988a9c-625f-4c50-818e-aabbff8bed0d)

[Guide and scope](../../mobile/ECU-IDENTIFICATION.en.md)
