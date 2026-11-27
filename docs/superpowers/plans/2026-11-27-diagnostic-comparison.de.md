[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Diagnosevergleich — Ausführungsplan

> For agentic workers: use superpowers:executing-plans; user authorized continuous execution.

Ziel: lokale gespeicherte Messungen vergleichen und Werkstattbericht. Nach früherer Anweisung ohne weitere Fragen ausführen.

Architektur: reine Vergleichsfunktion, HTML/PDF über bestehenden Export, eine Expo-Router-Seite. Keine Abhängigkeiten, Migrationen oder neuen OBD-Befehle.

Grenzen: gleiches Auto; A älter als B; Differenzen nur für bestätigte gleiche ECU-Adresse und gleiches Protokoll. Unbekannter Bereich erzeugt keine Differenzen. DTC-Status getrennt; nicht gelesener Status bedeutet unbekannt. Null niemals als Nullmessung behandeln. Importe kennzeichnen. Bericht ohne VIN/Kennzeichen/GPS, mit ausdrücklich eingegebenen Symptomen.

Task 1: mobile/tests/diagnostic-comparison.test.mjs vor mobile/src/obd/comparison.ts. ECU-Bereich, Reihenfolge, andere Fahrzeuge, gemeinsame/fehlende Status, Null und null, Auswahl und beschädigte Daten prüfen. Schnittstellen: compareDiagnostics(before, after), selectDiagnosticPair(history, vehicleId).

Task 2: Berichtstests vor diagnosticComparisonHtml in mobile/src/reports.ts. Beide Rohcodelisten, Bereiche, Daten, Parameter und Unsicherheit erhalten; HTML maskieren und Felder begrenzen. mobile/src/DiagnosticComparisonScreen.tsx und mobile/src/app/diagnostic-comparison.tsx: seitenweise Auswahl, Symptome, Vergleich, Export, Links aus Diagnose und Garage.

Task 3: PL/EN/DE-Dokumentation, alle Tests, Typen, Lint, Web/Hermes-Export; unabhängige Prüfung und UI-Test. Review Focus: keine gemeinsamen Status, gleiche Zeit, gelöschter Bericht, Fahrzeugwechsel, Code in mehreren Status, schädliches HTML. Änderungen im aktuellen Verzeichnis, parallele Arbeiten erhalten.
