[Polski](2026-11-26-reminder-builds.md) | [English](2026-11-26-reminder-builds.en.md) | [Deutsch](2026-11-26-reminder-builds.de.md)

# 0.2.2 and continuous checks verification

## Committed and pushed application code

Commit `6c8394d9933181f84b78478f6784b62abf392ca6` was pushed to GitHub. Version 0.2.2/build 3 replaces stale notification schedules, rechecks on resume, displays foreground notifications silently and reads the settings version from Expo configuration. All 171/171 tests, types, lint and web plus Android/iOS Hermes exports passed. Seven new notification tests cover dates, content, migration, idempotence, cancellation, permission denial and foreground visibility. Independent review found no required fixes within the stated scope; continuous timezone monitoring is not implemented.

## Submitted native builds

Both jobs use the same commit; the inspected archive contained 110 files and 1548545 bytes, including new reminder code, without secrets, tests or generated native directories.

| Profile | Job | Last confirmed state |
| --- | --- | --- |
| Android production AAB, existing Expo key | [940e4b0d-2f12-4224-b54c-7f2db3e3fb31](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/940e4b0d-2f12-4224-b54c-7f2db3e3fb31) | Finished 14:29:10 UTC |
| iOS Release simulator | [bdd4df2b-b15c-47ba-8b72-8615bba7e3b2](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/bdd4df2b-b15c-47ba-8b72-8615bba7e3b2) | Finished 14:12:07 UTC |

Both 0.2.2 builds finished successfully and their final artifacts were inspected. [Verified 0.2.1 artifacts](2026-11-26-vin-gpx-builds.en.md) remain separate, earlier packages.

## Final artifacts

The [Android metadata](2026-11-26-android-022-artifact.json) records the 75737794-byte AAB and its SHA-256. Official Bundletool 1.18.3 accepted it, JDK 21 verified the signature and its certificate matches the existing Expo production key. Version 0.2.2/code 3, permissions, three transport modules, four ABIs and the new reminder JavaScript markers were confirmed. All 54 64-bit libraries passed ELF LOAD/RELRO checks for 16 KB pages; packaging requests `PAGE_ALIGNMENT_16K`. Signature warnings about the self-signed certificate, absent timestamp and ZIP attributes are retained.

The [iOS metadata](2026-11-26-ios-022-artifact.json) records the 28741233-byte simulator archive and SHA-256. Version 0.2.2/build 3, iOS 16.4 minimum, expected permission descriptions, x86_64/arm64, BLE/TCP classes and an ad-hoc signature without an Apple team were confirmed. Its JavaScript includes the new reminder markers. All 15 privacy manifests have no tracking flag/domains. Neither artifact was executed on a phone; the simulator package is not an App Store IPA. No store submission was performed.

## Local CI changes

Prepared `.github/workflows/verify.yml`, `scripts/check-docs.py` and tests of the real CLI in temporary repositories. Six new validator tests and all ten root tests passed. The validator catches a missing language, orphan translation, wrong link/language, changed commands/identifiers and an empty document. YAML syntax was parsed locally; pinned official action revisions were checked on GitHub before the block. Independent review found no required fixes.

The combined regression suite passed 177/177 locally. The actual workflow awaits its first GitHub run. The validator supports the repository's current Markdown conventions; it does not check anchor fragments, reference-style links or translation quality. Notification tests isolate the native API boundary; they do not replace phone delivery tests.
