[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Fahrzeugdaten aus der VIN — Schritte

> superpowers:executing-plans

**Ziel:** Das Fahrzeugformular nach gesonderter Zustimmung zur VIN-Übermittlung mit echten NHTSA-vPIC-Daten ergänzen.

**Architektur:** `vin-decoder.ts` + `vin-client.ts` → `VinLookup.tsx` / `EntryForm.tsx`; `domain.ts` / `features.ts` validieren optionale Quellenbelege.

**Spec:** [Spec](../specs/2026-11-26-vin-enrichment.de.md).

## Vorgaben

Nur vollständige VIN und Antwort mit ErrorCode=0 für dieselbe VIN. Felder: Marke, Modell, Modelljahr, Hubraum, Getriebe und Antrieb; keine Umrechnung von SAE HP in PS oder abgeleitete Ausstattung. Fehlende Daten bleiben leer; das gespeicherte Jahr als Fahrzeugjahr bezeichnen und ein Modelljahr der Quelle ausdrücklich kennzeichnen. Ausdrückliche Zustimmung, Vorschau und einzelne Feldauswahl; standardmäßig sind nur leere Felder ausgewählt. Geänderte VIN oder Zielfelder verhindern die Übernahme. Quellenbelege bleiben nur bei unveränderten Werten erhalten; manuelle VIN-Änderung entfernt die Zuordnung. Metadaten gelangen weder zur KI noch in Verkaufsberichte. Keine neue native Bibliothek. Nur HTTPS zur NHTSA, begrenzte Antwort und Wartezeit, Abbruch bei Schließen/VIN-Änderung, keine VIN-Protokolle oder automatischen Wiederholungen. Manuelle Eingabe und Offline-Katalog bleiben verfügbar.

## Prüfschwerpunkte

ErrorCode, falsche VIN, geänderte Felder, verspätete Antworten, widersprüchliche Quellenbelege in Sicherungen.

## Schritte

- [x] Parser und Feldauswahl: Tests für ungültige VIN, Warnungen, Lücken und veraltete Formulare, dann Implementierung.
- [x] HTTP: Tests für Zustimmung, Timeout, Abbruch, Größe und Dienstfehler, dann echter HTTPS-Client.
- [x] Quellenspeicherung und Sicherungen: Tests für Bearbeitung, VIN-Änderung und KI-Isolierung, dann Validierung.
- [x] Formular, Garagenquellen, Datenschutz und Dokumentation PL/EN/DE; Regressionstests, Typen/Lint und Exporte, unabhängige Prüfung, Commits/Push.
