[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# Implementierungsplan für die mobile Grundlage von VehicleSenseX

> **Für agentische Bearbeiter:** ERFORDERLICHE UNTERFERTIGKEIT: superpowers:executing-plans verwenden, um diesen Plan Aufgabe für Aufgabe umzusetzen. Zur Nachverfolgung verwenden Schritte Kontrollkästchen (`- [x]`).

**Ziel:** startfähiger mobiler Client mit lokaler Garage, Tankvorgängen und Wartung.

**Architektur:** eigenständiges Expo-Projekt unter `mobile/`. Reine TypeScript-Logik übernimmt Validierung und Statistik; ein einzelner Schreibvorgang des versionierten Zustands wird vor der Oberflächenaktualisierung bestätigt. Der Prototyp bleibt die Vorlage.

**Technologien:** Expo stable, React Native, TypeScript, AsyncStorage.

**Spezifikation:** `docs/superpowers/specs/2026-11-25-mobile-foundation-design.md`

## Allgemeine Vorgaben

- Freigegebene helle Oberfläche, fünf Register, polnische Sprache, mindestens 44 px für Berührungsflächen.
- `mobile/` ist die Implementierung; Prototypdateien und deren Daten werden weder migriert noch überschrieben.
- Standardmäßig leere Garage; Demo von eigenen Daten getrennt.
- Beträge: ganzzahlige Groschen; Kraftstoff: ganzzahlige Milliliter; Datum: lokaler Tag `YYYY-MM-DD`.
- Keine tatsächlichen Bluetooth-/GPS-Berechtigungen oder externen Geheimnisse.

## Prüfschwerpunkte

- Beschädigte oder unbekannte gespeicherte Daten dürfen nicht mit einer leeren Garage überschrieben werden.
- Schnelle mehrfache Speichervorgänge und Fahrzeugwechsel dürfen einen Eintrag keinem anderen Fahrzeug zuordnen.
- Teilbetankungen, weniger als zwei Vollbetankungen und identische Kilometerstände dürfen keinen falschen Verbrauch erzeugen.
- Die Monatsübersicht verwendet den Monat des Eintrags statt der UTC-Zeit des aktuellen Geräts.
- Ein abgelehnter Speichervorgang lässt den Eintrag im Formular und ermöglicht einen erneuten Versuch.

### Aufgabe 1: Datenmodell und Validierung

**Dateien:** `mobile/src/domain.ts`, `mobile/tests/domain.test.mjs`.
**Schnittstellen:** `AppData`, `Vehicle`, `FuelEntry`, `ServiceEntry`; `emptyData()`, `addVehicle(state,input,id,today)`, `addFuel(state,input,id,today)`, `addService(state,input,id,today)`, `vehicleSummary(state,vehicleId,month)`, `parseStoredData(raw)`.

- [x] Tests definieren: Trennung zweier Autos, Dezimalkomma, gültige Datumswerte, VIN, Chronologie, Teilbetankungen, Monatskosten, beschädigtes Schema.
- [x] Tests vor der Implementierung ausführen und das Fehlen dieser Funktionen bestätigen.
- [x] Minimales Modell und Implementierungen ohne Plattformabhängigkeiten schreiben.
- [x] `node --test mobile/tests/domain.test.mjs` ausführen; alle Szenarien bestehen.

### Aufgabe 2: Dauerhafte Speicherung und Mobilprojekt

**Dateien:** `mobile/package.json`, `mobile/app.json`, `mobile/App.tsx`, `mobile/src/storage.ts`, Expo-Konfiguration.
**Schnittstellen:** `readData(): Promise<AppData>`, `writeData(state: AppData): Promise<void>`; atomarer bestätigter Schreibvorgang in der App-Komponente.

- [x] Projekt mit dem offiziellen Template `blank-typescript` erstellen, zu Expo passende Abhängigkeitsversionen installieren.
- [x] Zustandstests bei Schreibfehlern/-konkurrenz für `createRepository(storage)` schreiben; der Test bestätigt unveränderten Zustand nach Ablehnung und die Reihenfolge der Schreibvorgänge.
- [x] Validiertes Lesen und Schreiben ohne Löschen beschädigter Zustände umsetzen.
- [x] Testsuite und `tsc --noEmit` ausführen.

### Aufgabe 3: Bildschirme und Benutzerabläufe

**Dateien:** `mobile/src/screens.tsx`, `mobile/src/EntryForm.tsx`, `mobile/src/ui.tsx`, `mobile/src/theme.ts`, `mobile/App.tsx`.
**Schnittstellen:** Der Bildschirm erhält Zustand und Speicher-/Navigationscallbacks; das Formular übernimmt `vehicleId` beim Öffnen und behält die Werte bei Fehlern.

- [x] Fünf Register sowie vier untergeordnete Bildschirme, Leerzustände und getrennte Demo umsetzen.
- [x] Fahrzeug hinzufügen/auswählen, Tankvorgänge, Wartung und Statistik des aktuellen Monats an das Modell anbinden.
- [x] Typen prüfen und Web-/iOS-/Android-Bundle bauen, ohne Signieren oder Veröffentlichen.
- [x] Erststart und dauerhafte Speicherung der Einträge in der Webvorschau mit Telefonbreite überprüfen.
- [x] README um Startanleitung und Einschränkungen ergänzen; erneute Codeprüfung und vollständiger Abschlusstest.

## Umsetzungsentscheidungen

- Die Benutzeranweisung „passt, beginne mit der Implementierung“ autorisiert die Umsetzung des freigegebenen Entwurfs; für denselben Umfang wird keine weitere Freigabe verlangt.
- Das Repository hat noch keinen ersten Commit; alle Prototypdateien sind unversioniert. Es wird weder eine fiktive Historie erstellt noch die freigegebene Vorschau in einen Worktree verschoben. Die Arbeiten sind durch das Verzeichnis `mobile/` isoliert; der Hauptprototyp wird abgesehen von der Dokumentation nicht verändert.
- Implementierung in der aktuellen Sitzung, eine unabhängige Abschlussprüfung. Kein Hochladen des Codes in ein entferntes Repository.
