[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Ownership expenses 0.3.0 verification

Source 0.3.0/build 4: five real expense categories, editing/deletion, totals, CSV and schema 3. All 188/188 tests passed, including 11 new expense tests, plus types, lint and web/Android/iOS Hermes exports. Tests cover grosz, limits, dates, relationships, ID uniqueness, schema 1/2 migration, backups, cascade deletion, vehicle/AI isolation and totals without double counting.

Review found a missing future-date guard during backup import. A failing regression test and fix were added; that test and the full suite passed. Reading existing storage remains tolerant of clock rollback. The actual form on a separate local origin confirmed adding, amount editing, category changes, zero rejection, home totals and persistence after reload. Category accessibility state was corrected using `aria-checked`; changing selection marks one option checked and the former option unchecked. No sample data was embedded in application packages.

Web export clears Metro cache by default because a cached Expo manifest displayed an earlier settings version. A clean export and reload confirmed 0.3.0. The CSV generator passed tests and the export control is available; browser file download was not confirmed. Native sharing, notifications and adapter connections require phone tests.

The [GitHub verification workflow](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/45883215536) passed for revision `9ee8c6b`. The root startup command now targets the mobile application, with the historical HTML reference behind a separate command; CLI forwarding was checked without starting another server.

Native 0.3.0/build 4 jobs from the same revision were submitted: [Android production AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0aa4a780-b4e7-4743-9827-abae8bc564fc) and [iOS Release simulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/55fc7088-12a2-4f33-8d8a-dee247b060ff). The inspected archive contains 110 files and 1554550 bytes; expense code and schema 3 are present, without test fixtures, environment files, keys or generated native directories. Both final artifacts have now been inspected. Previously verified 0.2.2 packages do not contain ownership expenses. The lack of active Apple Developer membership still blocks a store IPA; nothing was submitted to stores.

## iOS artifact

The simulator build finished at 19:34:39 UTC. [Artifact metadata](2026-11-26-ios-030-artifact.json) records the 28746451-byte archive and SHA-256. Inspection confirmed version 0.3.0/build 4, iOS 16.4 minimum, x86_64/arm64, BLE/TCP classes, the new expense JavaScript markers and an ad-hoc signature without an Apple team. Permission descriptions are unchanged; there are no background modes, camera, microphone or Always location declarations. All 15 privacy manifests have no tracking flag/domains. This is a simulator package, with no phone execution test.

## Android artifact

The production build finished at 19:40:46 UTC. [Artifact metadata](2026-11-26-android-030-artifact.json) records the 75741395-byte AAB and SHA-256. Official Bundletool 1.18.3 accepted the bundle; JDK 21 verified the JAR signature, without unsigned entries, and the certificate matches the existing Expo production key. The usual self-signed certificate, timestamp and ZIP-attribute warnings are retained.

The manifest confirms version 0.3.0/code 4, minSdk 24/targetSdk 36, disabled backup and no debug mode. Permissions match the earlier inspected APK. All three transport modules, four ABIs and new expense JavaScript markers are present. All 54 64-bit libraries passed ELF LOAD/RELRO checks for 16 KB pages, and BundleConfig requests `PAGE_ALIGNMENT_16K`. No device or 16 KB runtime test was performed. The live preview was also restarted and its 0.3.0 version label checked; its garage remains empty.
