[Polski](2026-11-27-consumption-maintenance.md) | [English](2026-11-27-consumption-maintenance.en.md) | [Deutsch](2026-11-27-consumption-maintenance.de.md)

# Verbrauch und Wartung — Implementierungsplan

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Ziel: Verbrauchsdiagramme, Bauteilwartung und Öldaten auf vorhandenem Expo 58, React Native 0.88 und react-native-svg 15.16. Keine neuen Abhängigkeiten oder erfundenen Herstellerintervalle. Umsetzung ohne weitere Fragen wurde delegiert.

## Architektur und Grenzen

Voll-zu-voll in fuel-analytics.ts zählt Teilbetankungen bis zum nächsten Volltank und gewichtet nach Distanz. Erster Volltank ist Basis; offene Zyklen sind kein Verbrauch, Monatskäufe keine Nutzung. Nur gewähltes Auto und Daten bis zum Analysetag. Doppelte/sinkende Kilometerstände unterbrechen Messungen mit Warnung. 6/12-Monatsbereiche ordnen vollständige Zyklen dem Abschlussdatum zu und zeigen echte Daten.

Optionales schedule in bestehendem Reminder, geprüft durch maintenance-model.ts: Basisdatum/-kilometer, km/Monate, Bauteil, Prüfung/Austausch und Quelle. Erste erreichte Grenze ist fällig. Resttage/km und Fortschritt sind Planung, kein Verschleiß. Abschluss speichert tatsächlichen Service und nächsten Termin atomar. Manuelle Termine/Benachrichtigungen bleiben. Kein Garagenschemawechsel. Optionales oilObservation und maintenanceComponent in ServiceEntry bleiben bei Bearbeitung/Sicherung erhalten. Ölwerte manuell, keine erfundene Diagnose/Nachfüllmenge.

Vollscan liest angekündigte Seite 40 und PID 5C. Optionales oilTemperatureC in DiagnosticSnapshot; NO DATA ist null, Transport-/ECU-Fehler brechen ab. Keine zusätzliche Live-Data-Abfrage. Temperatur ist weder Ölstand noch Lebensdauer. Zeit/Quelle/ECU in Diagnose, Analyse und Berichten. Keine ECU-Schreibvorgänge.

## Aufgaben und Prüfungen

- [ ] Tests fuel-analytics.test.mjs: Voll-/Teilbetankungen, Distanzgewichtung, offener Zyklus, Zukunft, anderes Auto, doppelte/sinkende Kilometer und Monatskäufe. Rot, fuelAnalytics(state, vehicleId, today) implementieren, grün.
- [ ] Tests maintenance.test.mjs: Monatsende, km ODER Datum, Quellen-/Grenzprüfung, alte Sicherungen, neue Felder, atomarer Abschluss/Folgetermin. maintenance-model.ts, maintenance.ts und gezielte records.ts/domain.ts/features.ts-Erweiterungen.
- [ ] Tests oil-obd.test.mjs: angekündigte PID, Null, fehlend, Frame-/Timeout-Fehler, CAN-Bereich und Löschschutz. protocol.ts, types.ts und driver.ts erweitern; Historie/Berichte erhalten Daten.
- [ ] insights.tsx, FuelCharts.tsx, MaintenancePlanner.tsx und OilLog.tsx mit Zugang aus Garage/Kosten/Service. SVG plus Textwerte; Planbearbeitung und tatsächlicher Service mit Prüfung. Fahrzeugwechsel setzt Formulare zurück. Keine Beispieldaten im Nutzerspeicher.
- [ ] PL/EN/DE-Dokumentation, Repotests, typecheck/lint, Web-/Hermes-Exporte, synthetische Oberfläche mit 390 px und unabhängige Prüfung. Keine Hardware-, OBD-Ölstand-/Lebensdauer- oder OEM-Zusagen.
