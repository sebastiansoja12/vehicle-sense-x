[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live Data session reports

> superpowers:executing-plans · superpowers:test-driven-development

Goal: export the actual latest 300 cycles to JSON and a PDF/HTML summary for a workshop.

Spec: [spec](../specs/2026-11-28-live-session-reports.en.md)

## Constraints

main; schema 3; LIVE_HISTORY_LIMIT = 300; maximum 8 PIDs per cycle; no native dependency changes.

## Review focus

- Mixed vehicle/adapter/ECU scopes and invalid timestamps fail before export.
- Missing, not-recorded and zero observations stay distinct.
- Changing selected PIDs preserves per-cycle gaps and unweighted statistics.
- Unknown fields and malicious labels cannot expose data or execute HTML.
- Export freezes the selected buffer and cannot enable DTC clearing.

## Task 1: Model and formats

Files: mobile/src/obd/live-report.ts; mobile/tests/obd-live-report.test.mjs.

Interfaces: buildLiveSessionReport(history), liveSessionJson(history), liveSessionReportHtml(history).

- [x] RED: statistics, pauses, timestamps, voltage-only, scope/size/value validation, projection and escaping.
- [x] GREEN: implement bounded projection and report builders; run node --test mobile/tests/obd-live-report.test.mjs.
- [x] Commit verified report builders.

## Task 2: Interface and verification

Files: mobile/src/obd/LiveDataPanel.tsx; mobile/src/obd/DiagnosticsScreen.tsx; mobile/src/reports.ts; mobile/tests/obd-live-panel.test.mjs; mobile/src/obd/README.en.md.

Interfaces: onExport(format: LiveSessionExport), formats csv/json/report through existing shareTextFile/shareReport.

- [x] RED: render export controls, format routing, disabled state; wire real builders and pause before export.
- [x] GREEN: full tests, typecheck, lint, PL/EN/DE docs and web/iOS/Android Hermes exports.
- [x] Review, commit and push only main; existing native artifacts remain tied to dd64fcd.
