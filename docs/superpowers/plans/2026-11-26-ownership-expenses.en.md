[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Ownership expenses implementation

> superpowers:executing-plans

**Goal:** Real ownership expenses with correct totals and safe migration. **Specification:** [Scope](../specs/2026-11-26-ownership-expenses.en.md).

**Files:** `records.ts` / `domain.ts` / `features.ts` own schema 3, validation and mutations; `expenses.ts` / `reports.ts` own totals and CSV; `EntryForm.tsx` / `RecordActions.tsx` / `screens.tsx` / `HealthSettingsScreens.tsx` own UI and export. Reuse existing components and AI privacy boundaries.

- [x] Tests for validation, schema 1/2 migration, backups, duplicate IDs/relationships, totals, editing/deletion and export; demonstrate missing behavior.
- [x] Implement the ledger, migration and totals, preserving AI scope and fuel-only estimates.
- [x] Connect the form, monthly history, editing/deletion, CSV and all three documentation languages.
- [ ] Tests, types/lint, exports, review and form check; commit/push, CI and new 0.3.0/build 4 native packages.
