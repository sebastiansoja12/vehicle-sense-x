[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX — mobile app

React Native 0.88.1, Expo SDK 58, React 19.3 and TypeScript 6. Source version 0.3.0. The personal garage starts empty; the app has no demo mode, sample vehicle or measurement generator. A separate earlier HTML prototype is retained in the parent directory.

## Running

Node 24.18.0 (`.nvmrc`), npm. In `mobile/`:

```sh
nvm use
npm ci
npm run web
```

Current-session preview: **http://127.0.0.1:8083/**. Bluetooth and raw TCP to an adapter work only in a compiled iOS/Android app. Expo Go and browsers do not contain these drivers. Do not confuse the local preview with an installable APK/IPA.

## Implemented modules

- Multiple-vehicle garage, vehicle selection, editing and deletion together with associated records. The form has an offline make/model catalog with search and full manual entry for missing vehicles. VIN can be entered manually or read from a CAN controller that supports it; saving a read VIN requires preview and confirmation. Optional power, torque, displacement, transmission, drivetrain and equipment data, plus personal photos from the phone.
- Fuel and costs: full and partial refueling, grosz/milliliters, full-to-full consumption, month/year, weighted average price and estimated cost per 100 km.
- Maintenance: history, notes, costs, PDF invoices/photos, editing, deletion, due dates by date or mileage. Local date notifications are enabled separately with system consent.
- Trips: manual trips and a GPS recorder while the app is open. Background pause, an on-device saved draft, restart recovery, marked trace gaps and a lock on vehicle changes while a draft exists. Web Locks prevent simultaneous recording in multiple tabs.
- Analytics: distance, time, speed and acceleration/braking heuristics from valid GPS measurements. Missing data remains missing; no Eco Score is generated.
- OBD2: real ELM327 **Bluetooth BLE**, **Bluetooth Classic/SPP on Android** and **Wi-Fi/TCP** transports, supported PID readings, voltage and three DTC statuses, history and report import/export. Clearing requires a current real reading, a retained backup and separate confirmation; it is blocked while a GPS draft exists.
- Condition and value: dated diagnostic sources and owner entries, due dates, a range/median of at least two owner-provided offers from the last 90 days; a PDF report on phones or HTML on the web.
- Assistant: a local factual summary and a real call to a configured OpenAI proxy after consent. No prewritten answers pretending to be AI. API setup is described in the [server documentation](../server/README.en.md).

CSV export covers fuel, maintenance, ownership expenses and trips separately. A full JSON backup retains all data, including VIN, plates, notes, photos, invoices and GPS coordinates. Files have a 1 MB limit, with up to 5 attachments per vehicle or service entry; vehicle photos are resized to 1200 px. Restoration first validates the format, displays the contents and requires confirmation before replacing the garage. Notifications from a backup must be re-enabled. The backup import limit is 20 MB.

GPX 1.1 export is available beside JSON for saved GPS trips. It contains real accepted points and UTC times; gaps remain separate segments, without invented elevation or speed. Manual entries or fewer than two valid points cannot produce GPX. The file exposes precise location and time.

Version 0.2.2 corrects stale local reminder dates/content, migrates old schedules once and rechecks them when returning to the foreground, including timezone changes. Foreground reminders are displayed silently. Settings read the app version from Expo configuration. These changes are included in the verified signed Android 0.2.2 AAB and iOS simulator bundle.

## Ownership expenses

In fuel and costs, add insurance, parking, tolls, taxes/fees and other vehicle costs. Each entry has a date, category, title, PLN amount and optional note; edit it or delete after confirmation. Mileage remains unchanged. Month/year totals, home and the condition report count each entry once. Cost per 100 km estimates fuel alone.

The expense CSV includes titles and notes — review them before sharing. Full backups retain entries and vehicle deletion cascades to its expenses. These expense details remain outside AI context and the sales report; the report includes only the total. Manual entry and backup import reject future expense dates; reading existing storage tolerates clock rollback. Version 0.3.0/build 4 has verified signed Android AAB and iOS simulator packages containing this feature.

## Offline catalog

The add/edit vehicle form lets users choose a make and then its model. Changing the make clears the previous model; manual entry and mode switching preserve other fields. Previously entered vehicles unknown to the catalog open in manual mode. The existing vehicle format is saved — no migration or automatic name replacement.

The app bundles a reproducible MeterApp vehicle-db subset: 563 makes and 17,966 model/variant names from NHTSA, UK DfT, EEA and RDW (~289 KB). Search downloads no data. The catalog does not establish production year, generation, engine or equipment; the owner supplies those details. Variants and inconsistent source names remain searchable, and missing vehicles can be entered manually.

Sources/licenses are accessible beside the form fields and in settings. Pinned commit, hash, source terms and update instructions: [catalog](assets/catalog/README.en.md). Generate data with `node scripts/build-vehicle-catalog.mjs`; normal startup/build does not require downloading the catalog.

## Adapter

**Bluetooth BLE:** scan for devices, select your adapter and connect. The native driver discovers an unambiguous custom serial service based on actual characteristic properties. If several services match, it does not guess: UUIDs can be entered in advanced settings. An “ELM327 Bluetooth” label alone does not mean BLE; Bluetooth Classic/SPP is a separate Android option: pair the adapter in system settings and select it from bonded devices. On iOS, use BLE or Wi-Fi; Classic/MFi accessories require a vendor-specific protocol.

**Wi-Fi:** connect the phone to the adapter's network in system settings and enter its local IPv4 address and TCP port from its instructions. The app opens a real TCP socket, without an internet intermediary, WebSockets or simulation. It uses system routing and does not globally force a network for every app connection. On Android, the behavior of an adapter network without internet alongside mobile data requires testing on the specific phone.

An ELM327 ASCII stream is supported. For ISO 15765-4 CAN, it discovers actual ECU addresses, permits controller selection and reassembles that controller's ISO-TP replies. Measurements, codes and clearing apply to the selected ECU; its address and protocol are retained in history and reports. Legacy protocols still require single unsegmented replies. Compatibility with every adapter or access to every vehicle controller is not guaranteed. Details: [OBD](src/obd/README.en.md).

## Reading VIN

After selecting a CAN controller in diagnostics, a local mode 09 PID 02 query is available. Not every controller supports it. The number is checked for format and completeness; missing data, incomplete replies and an empty all-zero number are rejected. Saving to the profile requires confirmation, does not change make/model/engine and protects a VIN changed in the meantime. The source (time, adapter, ECU) remains attached to the VIN and in JSON backups. Manually changing the number removes the old source. This is an ECU reading, without confirmation of vehicle authenticity or specifications. VIN and its source are neither sent to AI nor included in the sales report.

Optional form completion uses the real NHTSA vPIC service after separate consent to send only the VIN. The result provides a preview and individual field selection; only empty fields are selected by default. Make, model, model year, whole-number displacement in cm³, transmission and drivetrain retain their source and retrieval time. Changes to fields or VIN invalidate outdated associations. NHTSA does not guarantee completeness or coverage of European vehicles. Details, limitations and privacy: [VIN data](VIN.en.md).

## Persistence and privacy

On phones, `expo-sqlite/kv-store` prevents larger GPS histories from hitting Android's single-record AsyncStorage limit. Older stored data is validated and copied before its copy in the old store is removed. Web uses AsyncStorage/localStorage and Web Locks. The repository commits state only after durable storage; it does not replace corrupt data with an empty garage. Schemas 1 and 2 migrate to 3. The new format retains ownership expenses; older apps cannot open it. Keep a backup before returning to an older version.

The database is not additionally encrypted by the app. Android automatic app backup is disabled; iOS system-backup behavior also depends on the platform. The app has a screen describing its data and voluntary AI context transmission. A public operator privacy policy must be prepared for the actual publisher before publication.

`EXPO_PUBLIC_ASSISTANT_URL` may contain only a public server address. The OpenAI key exists only in the server environment; the user enters an access token on the assistant screen. The token is not persisted and disappears on leaving the screen. Do not configure secrets in public Expo variables.

## Checks and builds

```sh
npm run verify
npm run export:web
npm run export:native
```

Model, repository, parser, migration and API-client tests run in Node 24. HTTP/TCP tests open local test ports only and make no paid AI connections. Native export creates JavaScript/Hermes bundles, **not signed IPA/APK/AAB files**.

`eas.json` contains `development`, `preview` (installable APK), `production` (AAB / iOS store) and `native-check` (Android Release APK and iOS Release simulator) profiles. The project is linked to `@rubisco4471/vehiclesensex`. The validation Android Release APK built successfully after a targeted CNG fix for Classic BuildConfig; the iOS Release simulator build also succeeded. Both artifacts were inspected. The signed production Android AAB was built and verified with a new Expo keystore explicitly approved by the user. The absence of an active Apple Developer account blocks a store IPA. Physical phone and adapter tests have not been performed. Locally, only Command Line Tools are available instead of full Xcode, without an Android SDK or configured emulator; Expo performs the cloud builds. Details: [release guide](RELEASE.en.md) and [build report](../docs/verification/2026-11-26-native-builds.en.md).

## Remaining product scope

Complete factory-specification decoding for every make, external valuation, a map basemap, background recording, accounts and synchronization are not yet implemented. A limited, explicit NHTSA VIN lookup is available. The remaining features are not presented as working. Publication also requires real adapter/phone tests, signing, metadata and an operator policy, plus deployment and configuration of a personal server if AI is to be active.

Version 0.2.1/build 2 includes GPX and NHTSA data completion in the verified signed Android AAB and iOS simulator bundle; see the [0.2.1 build report](../docs/verification/2026-11-26-vin-gpx-builds.en.md). The installable validation APK is still 0.2.0. Physical device tests and a signed store IPA remain outstanding.

## API sources

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/)
- [TCP Socket — official API](https://github.com/Rapsssito/react-native-tcp-socket), [BLE](https://dotintent.github.io/react-native-ble-plx/)
- [Expo Build profiles](https://docs.expo.dev/build/eas-json/), [BuildProperties](https://docs.expo.dev/versions/v58.0.0/sdk/build-properties/)
