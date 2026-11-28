[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

A mobile app for OBD2 diagnostics, vehicle records, trip recording and ownership costs. Current source version: 0.5.0. React Native 0.88.1, Expo SDK 58, React 19.3 and TypeScript 6. The garage starts empty; measurements come from the device or owner entries.

[PL/EN/DE documentation](docs/README.en.md) · [Application guide](mobile/README.en.md) · [Builds and release](mobile/RELEASE.en.md)

Version 0.5.0/build 7 expands diagnostics with a catalog of 54 standard measurements, emissions readiness, freeze frame 0, selectable Live Data, a 300-cycle chart, scan comparisons and JSON/CSV/PDF/HTML export. [Scope and verification](docs/verification/2026-11-27-advanced-diagnostics.en.md)

## Modules

| Module | Available features |
| --- | --- |
| OBD2 Diagnostics | ELM327 over BLE, Wi-Fi/TCP and Android Bluetooth Classic/SPP; CAN controller selection, PIDs, DTC statuses, VIN, history and reports |
| My Garage | Multiple vehicles, offline make/model catalog, full manual entry, photos and optional NHTSA data after separate consent |
| Drive Analytics | Distance, time, speed and acceleration/braking heuristics from valid GPS measurements |
| Maintenance | Service, costs, notes, invoices/photos, date/mileage reminders and separately enabled local notifications |
| Fuel & Expenses | Full/partial refueling, consumption, insurance, parking, fees, editing, month/year totals and CSV |
| AI Car Assistant | Local summary and real requests to a configured server after consent; the provider key stays on the server |
| Trips | Manual entries, foreground GPS, draft recovery, trace without map tiles and GPX/JSON/CSV export |
| Vehicle Health & Value | Evidence and missing data, owner offer comparisons and a PDF/HTML presale report |
| Recommended accessories | All 563 makes and manual entries, four categories, vehicle-specific offer searches, compatibility guidance and additional catalogues for 19 manufacturers |

Five main tabs: Home, Diagnostics, Trips, Costs and Garage. Maintenance, condition, driving analysis and the assistant are accessible from Garage. The light interface uses graphite and a red accent, with explicit units, sources and dates.

## Running

Node 24.18.0, npm and locked dependencies:

```sh
cd mobile
nvm use
npm ci
npm run web
```

After installing dependencies, root `npm start` launches the mobile project. Bluetooth and TCP run in compiled Android/iOS applications; the release guide describes EAS profiles. Assistant deployment instructions: [server](server/README.en.md).

## Data and evidence

The garage is stored locally; a full JSON backup also contains notes, VIN, photos and precise GPS routes. The app does not add database encryption. Schema 3 migrates older data; keep a backup before returning to an older app. CSV exports and reports describe which data they share.

Adapter compatibility requires checking the specific device and vehicle. Reading one controller does not establish whole-car condition. An Eco Driving score needs calibration; valuation uses explicitly added offers rather than automatic external pricing.

## Verification and release

GitHub Actions checks pushes and pull requests: app/transport/server tests, types, lint, PL/EN/DE documentation and web/Hermes exports. From the repository root, after installing mobile dependencies:

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
```

The documentation validator needs Python 3.9+ and Git. Code and form results: [0.3.0 verification](docs/verification/2026-11-26-ownership-expenses.en.md). Physical phone/adapter tests, a signed store IPA, publisher information and deployment of an owned AI server remain documented release requirements. No store submission was performed.

## Earlier HTML prototype

Interface design files remain at the repository root as historical material. Run them with `npm run prototype` at http://127.0.0.1:5173. The current app is in `mobile/`.

Version 0.4.0 adds an automatic ECU scan, separate Live Data, connection-loss handling and a radio audio test through system Bluetooth. [0.4.0](docs/verification/2026-11-26-obd-radio.en.md)

Added in-app OpenStreetMap workshops and eBay part offers. A private server must be configured; prices also require eBay Browse API access. [VehicleSenseX Services](mobile/SERVICES.en.md)
