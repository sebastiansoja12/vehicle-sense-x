[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Advanced OBD diagnostics · 0.5.0 / 7

Version 0.5.0/build 7 expands diagnostics with a catalog of 54 standard measurements, emissions readiness, freeze frame 0, selectable Live Data, a 300-cycle chart, scan comparisons and JSON/CSV/PDF/HTML export.

The basic scan reads RPM, coolant, load, adapter voltage and available fault statuses. A separate extended scan requests supported catalog entries, PID 01 readiness monitors and freeze frame 0. This does not establish access to all controllers or manufacturer diagnostics. Missing data stays unknown.

Live Data supports up to 8 advertised PIDs. The 2/5/10-second pause starts after the previous cycle completes, so actual cadence depends on the adapter. The chart holds the latest 300 cycles in session memory. Missing readings and resumptions create separate segments. Export CSV before leaving the screen or changing vehicles; sessions are not automatically saved in the garage.

The full report retains its timestamp and codes during Live Data. Save it in history, download JSON/CSV or export PDF in the native app and HTML in the browser. History offers search and pages of 20 records. Comparison requires the same vehicle and explicit matching CAN ECU address and protocol; older unscoped reports remain readable and exportable. Only common DTC statuses are compared. A code not reported again does not establish repair.

Clearing requires the exact current report, a saved copy, acknowledgement that the copy was retained and a separate command confirmation. PDF/CSV does not replace a complete JSON or history backup. Run a new full scan after Live Data. Disconnecting cannot undo a clearing command already sent. A cancelled scan does not replace the previous completed report.

## Verification

248/248 tests passed after review fixes; types, lint and web/Android/iOS Hermes exports succeeded. Tests control responses only at the hardware boundary; the app contains no measurement generator. A 390 px preview opened the empty garage, vehicle form and diagnostics. The browser native file chooser could not be automated; browser import/export and hardware testing were not counted as completed.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

## Review and fixes

Independent review found seven issues, all fixed with regression tests: colliding IDs for different backups, comparisons without confirmed ECU scope, charts bridging a pause, loss of the last report on cancellation, contradictory imports, a connection starting after cancellation during pending cleanup, and unnecessary scaling queries during a basic scan. A preliminary concern about additional AI fields was withdrawn after checking the client's four-field projection.

## Packages and limits

Signed Android APK/AAB and iOS Release simulator packages for 0.5.0/build 7 from source `35258e9` have been verified. Earlier 0.4.0/build 6 APK/AAB packages do not contain the 0.5.0 extensions. No active Apple Developer account still prevents a signed App Store IPA. No app was submitted to stores.

No physical phone, adapter or vehicle connection has been tested. Before publication, verify each transport and selected ECU, permission denial, range loss, scaling, monitors, frame changes during collection, cancellation of long scans, native export and a new scan after clearing. Ordinary Bluetooth radios carry system audio rather than OBD data. ECU coding, actuator tests and universal ABS/airbag support were not added.

Expo Doctor: 19/20 checks. React Native Directory still marks `react-native-bluetooth-classic` and `react-native-tcp-socket` as untested on New Architecture. The warning was not suppressed. Compilation does not replace transport tests on a physical phone.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46007837184) · `35258e9`

APK and AAB use the same existing Expo certificate. Both passed checks for 54 64-bit libraries and 16 KB alignment; bundletool 1.18.3 accepted the AAB. Permissions match 0.4.0 and APK/AAB DEX files are identical. BLE, Classic, TCP and Speech modules and the new diagnostic paths in Hermes bytecode were confirmed. The iOS package contains arm64 and x86_64, an ad-hoc signature without an Apple team, and 15 privacy manifests without tracking domains. Packages have not been run on a physical phone or simulator.

| Package | Bytes | Metadata and SHA-256 |
| --- | ---: | --- |
| Android APK | 109956116 | [Result](2026-11-27-android-050-apk-artifact.json) |
| Android AAB | 75809780 | [Result](2026-11-27-android-050-aab-artifact.json) |
| iOS simulator | 28854557 | [Result](2026-11-27-ios-050-artifact.json) |

[Android APK](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/375e55aa-934c-4439-bb4b-786952755484) · [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/999d0ca0-15ef-48e8-a135-3b5cbb30043e) · [iOS](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/53dc6f54-3426-4d0d-b228-f7612d3b5c32)
