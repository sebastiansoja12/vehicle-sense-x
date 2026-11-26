[Polski](2026-11-25-connected-modules.md) | [English](2026-11-25-connected-modules.en.md) | [Deutsch](2026-11-25-connected-modules.de.md)

# Connected Vehicle Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for integration and superpowers:dispatching-parallel-agents for independent bounded cores. Steps use checkbox (`- [ ]`) syntax.

**Goal:** replace nonfunctional screens with proper trip, analytics, diagnostics, condition and assistant modules, and extend maintenance/export.
**Architecture:** independent tested GPS/OBD/AI cores, integrated with versioned local state and the existing UI. The AI API is a separate Node server with its key kept outside the client.
**Tech Stack:** Expo 58, React Native, TypeScript, Expo Location/FileSystem/Sharing, BLE, Node HTTP.
**Spec:** `docs/superpowers/specs/2026-11-25-connected-modules-design.md`

## Global Constraints

- Preserve the approved style and never replace user data with demo data.
- The user requested continuous work without renewed approval; resolve routine decisions independently.
- Adapter UUIDs and the API key are configurable; do not pretend to have hardware/service access.
- Consent in the context of each feature, minimal AI context, secrets only on the server.
- All writes go through validation and the repository, with vehicle isolation. Following user clarification, the entire demo mode and sample data were removed from the mobile app.

## Review Focus

- Changing vehicles, backgrounding and restarting during recording must not assign a trip to another vehicle or lose its draft.
- GPS must not count distance across gaps and jumps, and a missing measurement is not zero events.
- OBD timeouts/disconnections/incomplete frames must not produce a false “0 faults”.
- AI receives no VIN, plates or location, and no key resides in the client; the proxy must not be an open paid API.
- Backup import and entry deletion must not erase data without confirmation; schema versions are validated.

### Task 1: Trip and analytics core
Files: `mobile/src/trips.ts`, `mobile/tests/trips.test.mjs`.
Interfaces: `TripPoint`, `TripRecord`, `analyzeTrip`, `validateTripRecord`; vehicleId, id and source fields.
- [x] GPS, gap, speed, event-heuristic and manual-trip tests RED→GREEN.

### Task 2: OBD2 and adapter client
Files: `mobile/src/obd/*`, `mobile/tests/obd*.test.mjs`.
Interfaces: snapshot with id/vehicleId/time/source, asynchronous command transport, PID and DTC parser, BLE platform adapter.
- [x] Official ELM327 and BLE documentation, parser, buffering, timeout and clear-refusal tests RED→GREEN. Added real Wi-Fi/TCP and Android Classic/SPP with stream tests.

### Task 3: Assistant API
Files: `server/*`, `mobile/src/assistant-client.ts`, `mobile/tests/assistant*.test.mjs`.
Interfaces: POST `/assistant` `{question,context}` → `{answer}`, minimal explicit context; no identifying data.
- [x] Official API docs, validation/authentication/limit and response-error tests RED→GREEN. No paid OpenAI call was made.

### Task 4: Schema and local modules
Files: `mobile/src/domain.ts`, feature domain, reports, export/import, reminder forms, media and tests.
- [x] v1→v2 migration, new collections, reminders, value comparisons, report and backup with RED→GREEN tests. Added native storage migration to SQLite, technical data and local attachments.

### Task 5: UI and hardware integration
Files: new module screens, AppProvider, recorder, forms, Expo routes, SDK config.
- [x] Foreground GPS + draft, history/trace diagram/analytics, OBD BLE/Wi-Fi/Classic, AI consent and endpoint, reports, maintenance and attachments. No map basemap was implemented.

### Task 6: Verification and review
- [x] 107 tests (94 mobile, 9 server, 4 prototype), TypeScript and lint — last run 2026-11-25, status 0.
- [x] Web/iOS/Android JS/Hermes exports after the latest changes; autolinking checked: Classic Android-only, BLE/TCP on both platforms. README and RELEASE describe actual limitations.
- [x] Phone-size web preview: empty garage and privacy; a separate QA session saved a personal vehicle and technical data. No test entries added to the main garage.
- [ ] Independent final review of the entire integration: additional agent runs failed because of the available budget; the lead performed an integration review.
- [ ] Tests on physical phones and adapters, selecting/opening attachments on a device, signed builds and distribution. Bundle export does not replace these activities.
