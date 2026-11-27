[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Erweiterte OBD-Diagnose — Implementierungsplan

> superpowers:executing-plans

Ziel: erweiterte Scans echter Daten, Emissionsmonitore, Freeze Frame, Parameterauswahl, Diagramme und Exporte.

Den vorhandenen ELM327-Treiber erweitern. Basisscans bleiben schnell; erweiterte Scans lesen unterstützte Standard-PIDs, PID-01-Bereitschaft und Service-02-Rahmen 0. Daten gehören immer zur gewählten ECU. Fehlende Werte bleiben unbekannt.

[Spec](../specs/2026-11-27-advanced-diagnostics.de.md)

## Prüffälle

Eine optionale Erweiterung der Version 1 erhält alte Berichte und Garagenschema 3. Alle neuen Daten werden beim Import validiert. Die KI erhält weiterhin nur die bisherigen Basisfelder. Löschen erfordert eine genaue Sicherung des aktuellen Berichts und Bestätigung. Keine erfundenen Sensoren, Zustandsnoten, universelle ABS-/Airbag-Abdeckung, ECU-Codierung oder Aktoraktivierung ergänzen. Hardware bleibt bis zu Tests mit Telefon und Fahrzeug ungeprüft.

## Aufgaben

- [x] Decoder-, Bereitschaftsbit- und Service-02-Tests schreiben; Fehler beobachten, Parser und Erweiterungsvalidierung implementieren.
- [x] PID-Seiten, erweiterten Scan, gewählte Live Data, Rahmen 0 und Löschschutz testen und implementieren.
- [x] Berichte, CSV, Verlauf von 300 Zyklen und ECU-Vergleich testen; Bildschirme und Exporte anschließen.
- [x] Alle Tests, Typprüfung, Lint, Dokumentation und Exporte ausführen; Prüfung anfordern, Befunde beheben, Commits erstellen und hochladen.

`mobile/src/obd/parameters.ts` · `mobile/src/obd/readiness.ts` · `mobile/src/obd/types.ts` · `mobile/src/obd/driver.ts` · `mobile/src/obd/DiagnosticDetails.tsx` · `mobile/src/obd/live-history.ts` · `mobile/src/reports.ts` · `mobile/tests/obd-advanced.test.mjs`
