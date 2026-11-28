[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Marktanalyse und fehlende Funktionen

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Ziel: offiziell dokumentierte Funktionen von Car Scanner, OBDeleven, Carista, Carly, Fuelio, Drivvo, FIXD und Smartcar mit VehicleSenseX am 27. November 2026 vergleichen; prüfbare Lücken und einen Unterscheidungspunkt ohne erfundene Daten ergänzen.

Ansatz: Herstellerdokumentation ohne Hardwarekäufe oder private Konten. Preise und Werbung bestätigen keine konkrete Fahrzeugunterstützung. Fehlende Erwähnung beweist keine weltweite Einzigartigkeit.

Task 1: OBD-Bereitschaft. Vor Implementierung Parsing, Benzin/Diesel, nicht verfügbare Monitore, MIL, Zähler, fehlende Daten, falsche Frames, CAN und Löschschutz testen. Neue mobile/src/obd/readiness.ts; gemeinsamer Byteparser in protocol.ts; optionale validierte DiagnosticSnapshot-Bereitschaft; driver.ts liest nur angekündigte PID 01/30/31 im Vollscan. Keine zusätzlichen Live-Data-Anfragen oder unterdrückten Transportfehler. Speicherung/Backups erhalten, Bereich in UI/Berichten zeigen.

Task 2: Datenprüfung. Fahrzeugtrennung, Kilometerstände nach Datum ohne Tagesreihenfolge, Importe/ECU/Status und fehlende Messungen nach Wartung testen. mobile/src/vehicle-evidence.ts, VehicleEvidenceScreen.tsx und Route vehicle-evidence.tsx ergänzen. Bestehende Daten ohne neue Speicherung. Keine Zustandsnote oder Betrugsvorwürfe. Messungs-IDs zum Vorher-/Nachhervergleich verbinden, Tagesdatumsgrenzen erklären.

Task 3: Marktbericht und Dokumentation PL/EN/DE, alle Tests, Typen, Lint, Web/Hermes-Export und unabhängige Prüfung. Keine Hardware-Kompatibilitätsversprechen. Nutzer autorisierte Auswahl und Ausführung ohne Rückfragen; parallele Änderungen erhalten.
