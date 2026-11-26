[Polski](RELEASE.md) | [English](RELEASE.en.md) | [Deutsch](RELEASE.de.md)

# VehicleSenseX 0.4.0 release

Version 0.4.0 adds an automatic ECU scan, separate Live Data, connection-loss handling and a radio audio test through system Bluetooth. [0.4.0](../docs/verification/2026-11-26-obd-radio.en.md)

## 0.3.0

Source 0.3.0/build 4 adds ownership expenses with category, exact PLN amount, editing/deletion, monthly/yearly totals and a separate CSV. Schema 3 migrates older garages and backups; older app versions cannot read schema 3. Backup import rejects future expense dates, while existing storage remains readable after a clock rollback. Expense details remain outside the AI context and sale report. The signed Android 0.3.0 AAB and iOS Release simulator package have been built and inspected, including the ledger.

Current source checks and UI results: [0.3.0 verification](../docs/verification/2026-11-26-ownership-expenses.en.md).

Source 0.2.2/build 3 fixes stale reminder schedules and foreground display, rechecks on resume and derives the displayed version from Expo configuration. Seven new regression tests passed; the full suite is 171/171, with types and lint passing. The native 0.2.2 packages have been built and inspected; hardware notification delivery remains untested.

Independent review found no must-fix within this scope. A timezone change while continuously foregrounded is reconciled on the next resume; there is no continuous timezone watcher. Backup import already disables restored notifications until explicitly re-enabled.

The signed Android 0.2.2 AAB and iOS Release simulator bundle have been verified. [Current verification and remaining work](../docs/verification/2026-11-26-reminder-builds.en.md).

Version 0.2.1/build 2 from revision `63b273d` has a verified signed Android production AAB and iOS Release simulator bundle, including GPX export and NHTSA data completion. Results: [0.2.1 build report](../docs/verification/2026-11-26-vin-gpx-builds.en.md). The earlier installable validation APK remains version 0.2.0; it does not include these features.

Status: implementation with real BLE/TCP/Android Classic transports and no demo measurements. The native iOS Release simulator build succeeded on 2026-11-26; the final app bundle, permissions and presence of BLE/TCP classes were checked. The Android Release APK also built successfully after fixing the Classic BuildConfig error through a CNG plugin; its manifest, modules, test signature and library alignment were checked. The production Android AAB was signed with a new key in Expo after explicit user approval and passed artifact verification. There is no store IPA or verified hardware matrix; no store submission was performed. Current results: [build report](../docs/verification/2026-11-26-native-builds.en.md).

Configuration check on 2026-11-25: `expo prebuild --no-install --platform all` completed successfully in a separate temporary copy. No `ios/` or `android/` directories were created in the repository. Generated Info.plist, AndroidManifest and the light theme were checked. Camera/microphone/broad photo access/overlay permissions are removed, with no Always location or background recording. Result: [configuration report](../docs/verification/2026-11-25-native-config.json). This describes project configuration before library manifest merging and compilation, not an inspection result for a final APK/IPA.

Expo Doctor: 19/20 checks. The missing direct `expo-font` peer was added through Expo CLI; `expo-system-ui` provides the declared light Android style. The remaining Directory check reports `react-native-bluetooth-classic` and `react-native-tcp-socket` as “Untested on New Architecture”. The warning has not been suppressed. TCP compiled and was linked into iOS Release through RN 0.88 interop; Classic is Android-only. The compiler alone does not verify adapter connections or permission/event handling on a phone.

## Producing packages

The project is assigned to the existing Expo account `@rubisco4471/vehiclesensex`; `extra.eas.projectId` and `owner` are stored in `app.json`. A change of publisher requires transferring the project in Expo. Rights to the application identifier and Apple/Google signing credentials are still required. The `com.vehiclesensex.app` identifier has not been registered or checked for availability in stores. Do not add keys or signing files to the repository.

```sh
cd mobile
nvm use
npm ci
npm run verify
npx eas-cli@latest login
npm run build:native-check
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Keep the existing profiles in `eas.json`. `native-check` compiles an Android Release APK without providing a production key and iOS Release for the simulator without an Apple account. These are not publication packages. Android preview creates an installable APK; Android production creates an AAB. The iOS store profile requires Apple credentials. Before the next release, increment `android.versionCode` and `ios.buildNumber` in `app.json`. `expo export` alone does not compile the native BLE/TCP/SQLite drivers.

The Expo archive is restricted by the root `.easignore` to `mobile/` sources, assets and configuration; do not end negated allowlist directories with a slash, because the copy stage checks paths without it. `plugins/withClassicBuildConfig.cjs` is a required CNG input and must be included in the archive. Before uploading a changed allowlist, check `eas build:inspect --platform android --profile native-check --stage archive --output /private/tmp/vehiclesensex-archive-check`; do not upload `.env`, keys or local tool settings.

The iOS production attempt stopped before building because no distribution certificate/profile was configured. The publisher must configure signing interactively and confirm the encryption export declaration for App Store Connect. The user approved creating a new Android signing key in Expo; the key was created and the signed AAB was built and verified. An inactive Apple Developer account blocks a store IPA. The test APK has an Android Debug signature; export personal data before uninstalling it to install a version with a different signature. Results and local files in `artifacts/` contain no private signing keys.

SDK 58 explicitly sets Android compileSdk 37 / targetSdk 36 and iOS 16.4. A future increase to targetSdk 37 requires adding and checking the new `ACCESS_LOCAL_NETWORK` permission; for targetSdk 36, Android documentation specifies access through INTERNET. iOS has a local-network usage description; there is no global ATS disablement or unnecessary “Always” location declaration.

## Device checks

Record results for the specific phone model, operating system, adapter and vehicle:

- BLE: permission denial, radio disabled, scanning, service discovery, initialization, PID/DTC, loss of range, reconnection.
- Classic/SPP on Android: bonded-device list, Bluetooth Connect denial, RFCOMM connection, raw fragments, timeout and disconnection. The Classic module is excluded from iOS autolinking.
- Wi-Fi: iOS local-network access denial, correct network/IP/port, a network without internet, concurrent Android mobile data, absent adapter, disconnection and timeout.
- OBD: CAN protocols 6/7/8/9, discovering one/multiple ECUs, selecting the actual address, physical headers/filter, ISO-TP replies and scope retained in history/reports/AI. Check filter-change refusal, unsupported PID/status, no codes in the statuses read, backup before clearing, a genuine 44 acknowledgement from the selected ECU and a new reading. Do not test clearing while driving.
- VIN: real 0902 reading from the selected CAN ECU, lack of support, incomplete/invalid number, comparison with documents, replacement confirmation, an old profile changed before saving, restart and backup with retained source. Do not equate reading with authenticity verification.
- GPS: permission denial, poor accuracy, pause/resume, vehicle-change lock, backgrounding, restart and draft recovery, storage exhaustion. Event heuristics require calibration.
- SQLite: upgrade from old storage, history exceeding 2 MB, saving/reading after restart, no free space, export and restoration of a personal backup.
- Media: selecting a real photo, compression, saving a PDF invoice, reopening, deleting and restoring attachments from a backup.
- Offline catalog: make/model search in airplane mode, selection with the on-screen keyboard and VoiceOver/TalkBack, changing make, manual entry of a missing vehicle and editing existing names. Sources and licenses must be accessible in the released version. Web preview does not replace phone keyboard and screen-reader checks.
- Notifications and PDF: actual notification at the due date, permission revocation, cancellation after completion/deletion of a reminder, opening a PDF outside the app.

These tests have not been replaced by desktop TCP tests or web preview.

## AI server

Instructions: `server/README.md`. The server requires an OpenAI key and a private token. The production address must use HTTPS. No domain, hosting or key is configured; no paid test with a real OpenAI account has been performed.

The current server is intended for a controlled deployment with private tokens. Before providing a public service at scale, implement per-user authentication and limits plus a shared gateway limit across instances. Do not embed a shared paid-access token in the binary or `EXPO_PUBLIC_*`.

## Publisher information and distribution

Before submission, provide actual publisher details, contact information, a public privacy-policy URL, processing disclosures matching deployed services and screenshots from the signed version on devices. The “Your data” screen describes app behavior but does not replace the specific operator's public policy.

The app icon is in `assets/brand/icon.png`; its vector source is in `icon.svg`. These are not store screenshots or evidence of trademark/name registration. Publication, service payments and automatic store submission have not been initiated.

Sources: [Expo EAS](https://docs.expo.dev/build/eas-json/), [Android Local Network](https://developer.android.com/privacy-and-security/local-network-permission), [Apple Local Network](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy).

## Changes in 0.2.1

GPX export retains actual GPS segments and UTC times without joining gaps. The optional NHTSA request sends the VIN to a US service only after consent tied to that VIN; field selection is required before saving. The source and retrieval time are retained for values that still match, including in JSON backups. They are excluded from AI and the sales report. Rules and limitations: [VIN data](VIN.en.md). Release privacy disclosures must account for this voluntary data flow and export of precise GPX routes.
