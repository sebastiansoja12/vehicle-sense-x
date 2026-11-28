[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Diagnostic comparison — implementation plan

> For agentic workers: use superpowers:executing-plans; user authorized continuous execution.

Goal: local saved-reading comparison and workshop report. Execute without questions under the user’s earlier instruction.

Architecture: pure comparison function, HTML/PDF through existing export, one Expo Router screen. No dependencies, migrations or new OBD commands.

Constraints: same car; A older than B; differences only for a confirmed identical ECU address and protocol. Unknown scope produces no differences. DTC statuses are separate; unread status means unknown. Null is never zero. Imports are marked. Reports exclude VIN/plates/GPS and include an explicitly entered symptom description.

Task 1: mobile/tests/diagnostic-comparison.test.mjs before mobile/src/obd/comparison.ts. Test ECU scope, order, different cars, common/missing statuses, zero/null, pair selection and corrupted data. Interfaces: compareDiagnostics(before, after), selectDiagnosticPair(history, vehicleId).

Task 2: report tests before diagnosticComparisonHtml in mobile/src/reports.ts. Preserve both raw code sets, scope, dates, parameters and uncertainty; escape HTML and whitelist fields. mobile/src/DiagnosticComparisonScreen.tsx and mobile/src/app/diagnostic-comparison.tsx: paginated selectors, symptoms, comparison, export, links from diagnostics and garage.

Task 3: PL/EN/DE docs, full repository tests, types, lint, web/Hermes export; independent review and UI check. Review Focus: no common statuses, same timestamp, removed selected report, car changes, same code in multiple statuses, malicious HTML. Keep changes in the current checkout and preserve concurrent work.
