[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Ownership expenses 0.3.0 verification

Source 0.3.0/build 4: five real expense categories, editing/deletion, totals, CSV and schema 3. All 188/188 tests passed, including 11 new expense tests, plus types, lint and web/Android/iOS Hermes exports. Tests cover grosz, limits, dates, relationships, ID uniqueness, schema 1/2 migration, backups, cascade deletion, vehicle/AI isolation and totals without double counting.

Review found a missing future-date guard during backup import. A failing regression test and fix were added; that test and the full suite passed. Reading existing storage remains tolerant of clock rollback. The actual form on a separate local origin confirmed adding, amount editing, category changes, zero rejection, home totals and persistence after reload. Category accessibility state was corrected using `aria-checked`; changing selection marks one option checked and the former option unchecked. No sample data was embedded in application packages.

Web export clears Metro cache by default because a cached Expo manifest displayed an earlier settings version. A clean export and reload confirmed 0.3.0. The CSV generator passed tests and the export control is available; browser file download was not confirmed. Native sharing, notifications and adapter connections require phone tests.

Fresh native builds and CI for this revision need separate confirmation. Previously verified 0.2.2 packages do not contain ownership expenses. The lack of active Apple Developer membership still blocks a store IPA; nothing was submitted to stores.
