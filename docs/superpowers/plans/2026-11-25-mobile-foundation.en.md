[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# VehicleSenseX Mobile Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** a runnable mobile client with a local garage, refueling and maintenance.

**Architecture:** an independent Expo project in `mobile/`. Pure TypeScript logic handles validation and statistics; a single versioned-state write is committed before the UI updates. The prototype remains the reference.

**Tech Stack:** Expo stable, React Native, TypeScript, AsyncStorage.

**Spec:** `docs/superpowers/specs/2026-11-25-mobile-foundation-design.md`

## Global Constraints

- Approved light interface, five tabs, Polish language, minimum 44 px touch targets.
- `mobile/` is the implementation; prototype files and data are neither migrated nor overwritten.
- Empty garage by default; demo separated from personal data.
- Amounts: integer grosz; fuel: integer milliliters; dates: local day `YYYY-MM-DD`.
- No real Bluetooth/GPS permissions or external secrets.

## Review Focus

- Corrupt or unknown stored data must not be overwritten with an empty garage.
- Rapid repeated saves and vehicle switching must not assign an entry to another vehicle.
- Partial refueling, fewer than two full tanks and equal mileage must not generate false consumption.
- Monthly summaries use the entry's month, not the current device's UTC time.
- A failed save leaves the entry in the form and allows retrying.

### Task 1: Data model and validation

**Files:** `mobile/src/domain.ts`, `mobile/tests/domain.test.mjs`.
**Interfaces:** `AppData`, `Vehicle`, `FuelEntry`, `ServiceEntry`; `emptyData()`, `addVehicle(state,input,id,today)`, `addFuel(state,input,id,today)`, `addService(state,input,id,today)`, `vehicleSummary(state,vehicleId,month)`, `parseStoredData(raw)`.

- [x] Define tests: two-vehicle isolation, decimal comma, actual dates, VIN, chronology, partial refueling, monthly costs, corrupt schema.
- [x] Run tests before implementation and confirm these functions are missing.
- [x] Write the minimal model and implementations without platform dependencies.
- [x] Run `node --test mobile/tests/domain.test.mjs`; all scenarios pass.

### Task 2: Persistence and mobile project

**Files:** `mobile/package.json`, `mobile/app.json`, `mobile/App.tsx`, `mobile/src/storage.ts`, Expo configuration.
**Interfaces:** `readData(): Promise<AppData>`, `writeData(state: AppData): Promise<void>`; atomic committed write in the App component.

- [x] Create the project with the official `blank-typescript` template and install Expo-compatible dependency versions.
- [x] Write save-error/concurrency state tests for `createRepository(storage)`; the test confirms unchanged state after rejection and write order.
- [x] Implement validated reads and writes without deleting corrupt state.
- [x] Run the suite and `tsc --noEmit`.

### Task 3: Screens and user flows

**Files:** `mobile/src/screens.tsx`, `mobile/src/EntryForm.tsx`, `mobile/src/ui.tsx`, `mobile/src/theme.ts`, `mobile/App.tsx`.
**Interfaces:** a screen receives state and save/navigation callbacks; the form captures `vehicleId` when opened and retains values on error.

- [x] Implement five tabs and four child screens, empty states and a separate demo.
- [x] Connect vehicle addition/selection, refueling, maintenance and current-month statistics to the model.
- [x] Check types and build web/iOS/Android bundles without signing or publishing.
- [x] Verify the first-run flow and entry persistence in the web preview at phone width.
- [x] Complete the running/limitations README; fresh code review and full final test.

## Implementation decisions

- The user's instruction “that works, start implementation” authorizes implementation of the approved design; do not add another approval gate for the same scope.
- The repository has no first commit, and all prototype files are untracked. Do not create artificial history or move the approved preview to a worktree. Work is isolated in `mobile/`; do not change the main prototype except for documentation.
- Implementation in the current session, with one independent review at the end. No code sent to a remote repository.
