[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live-Data-Sitzungsberichte

> superpowers:executing-plans · superpowers:test-driven-development

Ziel: die tatsächlich vorhandenen letzten 300 Zyklen als JSON und eine PDF/HTML-Zusammenfassung für die Werkstatt exportieren.

Spec: [spec](../specs/2026-11-28-live-session-reports.de.md)

## Grenzen

main; schema 3; LIVE_HISTORY_LIMIT = 300; höchstens 8 PIDs pro Zyklus; keine Änderungen nativer Abhängigkeiten.

## Prüfschwerpunkte

- Gemischte Fahrzeug-/Adapter-/ECU-Bereiche und ungültige Zeitstempel verhindern den Export.
- Fehlende, nicht gespeicherte und Nullmesswerte bleiben unterscheidbar.
- Geänderte PID-Auswahl erhält Lücken je Zyklus und ungewichtete Statistik.
- Unbekannte Felder und bösartige Bezeichnungen dürfen keine Daten offenlegen oder HTML ausführen.
- Der Export hält den gewählten Puffer fest und kann DTC-Löschen nicht freigeben.

## Task 1: Modell und Formate

Dateien: mobile/src/obd/live-report.ts; mobile/tests/obd-live-report.test.mjs.

Schnittstellen: buildLiveSessionReport(history), liveSessionJson(history), liveSessionReportHtml(history).

- [x] RED: Statistik, Pausen, Zeitstempel, nur Spannung, Bereichs-/Größen-/Wertprüfung, Projektion und Escaping.
- [x] GREEN: begrenzte Projektion und Berichtsgeneratoren implementieren; ausführen node --test mobile/tests/obd-live-report.test.mjs.
- [x] Geprüfte Berichtsgeneratoren committen.

## Task 2: Oberfläche und Prüfung

Dateien: mobile/src/obd/LiveDataPanel.tsx; mobile/src/obd/DiagnosticsScreen.tsx; mobile/src/reports.ts; mobile/tests/obd-live-panel.test.mjs; mobile/src/obd/README.de.md.

Schnittstellen: onExport(format: LiveSessionExport), Formate csv/json/report über bestehende shareTextFile/shareReport.

- [x] RED: Exportsteuerung, Formatwahl und Sperrstatus rendern; echte Generatoren und Pause vor Export verbinden.
- [x] GREEN: vollständige Tests, typecheck, lint, PL/EN/DE-Dokumentation und Hermes-Exporte für web/iOS/Android.
- [x] Prüfen, committen und ausschließlich main pushen; bestehende native Artefakte bleiben an dd64fcd gebunden.
