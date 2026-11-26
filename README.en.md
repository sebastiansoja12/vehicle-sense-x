[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

[Documentation](docs/README.en.md)

**Mobile implementation:** the React Native / Expo project is in [`mobile/`](mobile/README.en.md). The garage, maintenance, GPS trips and diagnostic readings use local persistence. Real OBD Bluetooth BLE/Wi-Fi transports, reports, backups and an assistant server have been added. The current status and release requirements are documented in `mobile/RELEASE.md`. The description below refers to the retained HTML prototype.

An interactive product design for iOS and Android. A Polish interface, eight modules and a responsive layout for review on desktop and phone. This is a working browser prototype, not an application ready for publication in stores.

## Running

Requirements: Python 3 and Node.js 20+ for tests. No dependency installation required.

```sh
npm start
```

Open http://127.0.0.1:5173. Logic tests: `npm test`.

## Product and interface direction

Promise: **Your car. The full picture.** Home answers three questions: what needs attention, how much driving costs and what happened recently. A light, flat interface: off-white, graphite and a restrained red accent. The vehicle profile uses a large model name and a cropped illustration. Data and actions are arranged in sections separated by lines, without decorative gauges, gradients, a sidebar or a grid of rounded tiles. Units, sources and dates remain explicit. Color always accompanies a label. No arbitrary vehicle health percentage.

On phones, five main tabs: **Home, Diagnostics, Trips, Costs, Garage**. Garage leads to Maintenance, Condition, Driving Style and Assistant. Home leads to diagnostics, the next service and the latest trip. On desktop, the same five tabs appear in horizontal navigation. The remaining modules are accessible through Garage.

| Module | Intended flow | Prototype status |
| --- | --- | --- |
| OBD2 Diagnostics | Connect → read → codes and parameters → report | Explicit connection and scan simulation; static parameters |
| My Garage | Profile → specifications → data source → more vehicles | Demo profile and locally saved additional drafts; no data switching between vehicles |
| Drive Analytics | Period → measurable events → GPS/OBD2 context | Two sample periods; no unverified Eco Score |
| Maintenance | Due date → entry → history | Working service persistence; static reminders; no attachments or system notifications |
| Fuel & Expenses | Refueling → summary → consumption → export | Form, local persistence, full-to-full calculations, CSV; monthly trend as a separate demo dataset |
| AI Car Assistant | Question → source data → interpretation and uncertainty | Prewritten answers, no model or external API |
| Trips | Select trip → diagram → distance/time/cost → export | Three sample trips and CSV; schematic map, no GPS |
| Vehicle Health & Value | Available evidence → missing data → history → report | Explicit sources and gaps; TXT export; no fabricated valuation |

User entries are encoded before display. Refueling requires a positive quantity and price and nondecreasing mileage. Examples refer to November 25, 2026; new-entry forms use the device's current date. Demo and personal data can be reset in settings after confirmation.

## Scope of the first mobile release

1. **Hardware testing first:** a matrix of specific adapters and vehicles on iPhone and Android. Check the protocol, Bluetooth transport, PID set, disconnections and background restrictions. The ELM327 label alone does not establish adapter compatibility with both systems. Do not select the production stack before this trial.
2. **Foundation:** a local garage, multiple vehicles with separate records, refueling, maintenance and export. Optional account; synchronization as a separate feature. Offline data and explicit synchronization conflicts.
3. **Diagnostics:** reading supported PIDs, units, measurement time, DTC status, history and a report. Missing data differs from zero. Clear codes only after saving the reading and obtaining separate confirmation; never while driving.
4. **Trips:** manual start/stop, visible recording and easy route deletion. Add automatic background recording after testing accuracy, battery use and permission acceptance.
5. **Assistant:** only shared context, identifiable DTC-description sources, facts separated from hypotheses, consent to transmit data. Never treat a model response as proof of vehicle condition.
6. **Next release:** VIN provider, current comparison data for valuation, a verified Eco Driving method, PDF, invoices and photos. Do not promise these integrations before choosing providers and establishing data rights.

The intended separate mobile client uses native Bluetooth/GPS capabilities, local storage and an optional API for synchronization, AI and external data. Provider secrets remain on the server. OBD2, GPS and manual entries must retain their source, unit and date; lack of access to one source must not block other modules.

## Preparing for App Store and Google Play

Sources checked on November 25, 2026. The requirements below affect the design; the prototype does not implement publication workflows or guarantee acceptance.

- **Permissions in context:** Bluetooth when pairing, GPS when starting a trip, notifications when creating a reminder, photos when adding an attachment. Remain usable after denial. Android distinguishes Bluetooth permissions by OS version: [Bluetooth permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
- **Privacy:** a privacy policy accessible in the app and metadata; store disclosures consistent with actual SDK behavior. Routes, VIN, photos, analytics and sending data to AI require informed design decisions. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311).
- **Account deletion:** if the app supports account creation, the design must include account and data deletion. Google Play also requires a working web route. [Apple](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion), [Google Play](https://support.google.com/googleplay/android-developer/answer/13327111).
- **App review:** give reviewers access to features, demo data and the resources required for hardware features; clearly explain the adapter dependency. [Apple — Before You Submit](https://developer.apple.com/app-store/review/guidelines/).
- **Before submission:** native builds and signing, icons and screenshots, accessibility, device testing, handling unavailable networks and denied permissions, adapter failures, battery restrictions and a complete check of current store requirements for the chosen distribution and payment model.

## Limitations and verification

Unit tests cover fuel-consumption calculations, refueling validation and safe CSV cells. The prototype has no backend, accounts, payments, real diagnostics, system notifications or store packages. Google Fonts require a connection; a system font provides the fallback. Fonts should be bundled in the mobile release. Browser persistence is not secure storage for production data.

## Continuous checks

The GitHub Actions workflow `.github/workflows/verify.yml` checks pushes and pull requests with Node from `mobile/.nvmrc`, locked mobile dependencies, the full test suite, TypeScript, lint, all three documentation languages and web/native JavaScript exports. It uses pinned official actions and read-only repository permissions. It does not sign, deploy or submit applications, use provider credentials or call paid APIs.

From the repository root, after installing mobile dependencies:

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
```

The documentation checker requires Python 3.9+ and Git. It checks complete language variants, language navigation, local targets, command blocks, identifiers and heading/checkbox structure; it does not assess translation quality. Source checks complement the native builds and device checks in the [release guide](mobile/RELEASE.en.md).
