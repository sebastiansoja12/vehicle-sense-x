[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Raporty sesji Live Data

> superpowers:executing-plans · superpowers:test-driven-development

Cel: eksport rzeczywistych ostatnich 300 cykli do JSON oraz podsumowania PDF/HTML dla warsztatu.

Spec: [spec](../specs/2026-11-28-live-session-reports.md)

## Ograniczenia

main; schema 3; LIVE_HISTORY_LIMIT = 300; maximum 8 PIDs per cycle; no native dependency changes.

## Punkty przeglądu

- Mixed vehicle/adapter/ECU scopes and invalid timestamps fail before export.
- Missing, not-recorded and zero observations stay distinct.
- Changing selected PIDs preserves per-cycle gaps and unweighted statistics.
- Unknown fields and malicious labels cannot expose data or execute HTML.
- Export freezes the selected buffer and cannot enable DTC clearing.

## Task 1: Model i formaty

Files: mobile/src/obd/live-report.ts; mobile/tests/obd-live-report.test.mjs.

Interfaces: buildLiveSessionReport(history), liveSessionJson(history), liveSessionReportHtml(history).

- [x] RED: statistics, pauses, timestamps, voltage-only, scope/size/value validation, projection and escaping.
- [x] GREEN: implement bounded projection and report builders; run node --test mobile/tests/obd-live-report.test.mjs.
- [x] Commit verified report builders.

## Task 2: Interfejs i weryfikacja

Files: mobile/src/obd/LiveDataPanel.tsx; mobile/src/obd/DiagnosticsScreen.tsx; mobile/tests/obd-live-panel.test.mjs; mobile/src/obd/README.md.

Interfaces: onExport(format: LiveSessionExport), formats csv/json/report through existing shareTextFile/shareReport.

- [ ] RED: render export controls, format routing, disabled state; wire real builders and pause before export.
- [ ] GREEN: full tests, typecheck, lint, PL/EN/DE docs and web/iOS/Android Hermes exports.
- [ ] Review, commit and push only main; existing native artifacts remain tied to dd64fcd.
