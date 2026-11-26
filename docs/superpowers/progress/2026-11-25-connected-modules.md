# SDD ledger — plan: docs/superpowers/plans/2026-11-25-connected-modules.md

- Ruling: user explicitly requested continuous implementation without approval pauses. Keep approved UI/stack; proceed with documented defaults.
- Ruling: repository remains unborn with existing untracked work; retain current checkout and isolate agent edits by explicit file ownership. No merge/push requested.
- Pre-flight: trips and diagnostics expose independent record types; root owns shared domain/schema/Provider, package installation and all screens. Server agent owns independent server/client files. No agent edits shared files.
- Ruling: background tracking and hardware validation require devices; implement foreground recorder and real configurable transports, report physical validation as unperformed. User subsequently rejected demo entirely; mobile demo code, generated car image and sample records were removed.

## Implemented and integrated

- GPS domain, foreground recorder, serialized recoverable draft, owner lock, web recording lease, route history and honest GPS heuristics. Pauses and gaps split the path; missing measurements never become a score.
- ELM327 parser/driver and command queue, BLE discovery/manual profile, real Wi-Fi TCP and Android Classic/SPP. Read statuses distinguish unknown from a successful zero response. Clearing requires the current reading, a saved/shared backup and separate confirmation. No hardware compatibility claim covers every adapter: multi-ECU/segmented replies still fail explicitly.
- AI HTTP server with private authentication, limits and minimal whitelisted context; consent-based client. No VIN, plates, media or GPS sent. No live paid OpenAI request; public multi-user authentication/deployment remains outside the current private-token server.
- Schema v2, persistence failure handling, validated migration to SQLite on native, service reminders/notifications, reports, CSV and validated JSON restoration. Backup export and import share a 20 MB UTF-8 limit.
- Vehicle technical fields, actual user-selected car photos, service PDFs/images, bounded embedded local assets and archive preservation. Image preparation can be cancelled and stale picker results are discarded.
- Release profiles, icon, privacy information, permissions and package identifiers configured. No account linking, signing, native binary compilation or store submission performed.

## Latest verification — 2026-11-25

- Root test run: 107 passing, exit 0 (94 mobile, 9 HTTP server, 4 earlier prototype).
- Mobile TypeScript and Expo lint: exit 0.
- Expo exports: web and iOS/Android JS/Hermes, exit 0 after backup/media cancellation changes.
- Native autolinking JSON: BLE and TCP found on iOS/Android; Classic found only on Android, as intended.
- Dependency audit after targeted minimatch override: zero reported vulnerabilities at installation. Expo fingerprint glob helpers checked with the updated transitive dependency.
- Browser QA: empty main garage/privacy and isolated production-build form save with technical data. File chooser automation expired; media selection/upload was NOT verified. Do not reuse the old demo screenshot as the current app.
- Independent final agent review unavailable because follow-up runs reported a workspace credit limit. Integration review performed locally; external hardware/system dialogs and signed native builds remain unverified. See mobile/RELEASE.md.

## Vehicle catalog research

Latest user steering requests a public make/model database. Research is recorded in `docs/research/2026-11-25-vehicle-catalogs.md`. Candidate data were inspected only in /private/tmp; no new catalog dependency or dataset has been bundled. Source provenance, year semantics and mixed model/trim names must remain visible in the integration design.

## Subsequent implementation in this session

The research-only state above was superseded by the user's explicit integration request. See `2026-11-25-offline-catalog.md`: bundled offline selection, manual fallback, sources and independent review. Continued work added actual CAN ECU selection/ISO-TP and local confirmed VIN reading; see `2026-11-25-can-ecu.md` and `2026-11-25-obd-vin.md`, each with independent review. The CAN multi-ECU limitation above now applies to the legacy/non-CAN path; selected standard CAN controllers are supported in code.

Latest final verification is in `2026-11-25-release-preflight.md`: 135 tests passing, types/lint/three-platform JS exports successful; CNG generated both native configurations in a temporary copy. Doctor remains 19/20 because Classic/TCP are marked untested on New Architecture. No native compiled binaries, physical adapter tests, real AI call or store publication has occurred.
