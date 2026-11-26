[Polski](2026-11-25-connected-modules.md) | [English](2026-11-25-connected-modules.en.md) | [Deutsch](2026-11-25-connected-modules.de.md)

# Implementierungsplan für vernetzte Fahrzeugmodule

> **Für agentische Bearbeiter:** ERFORDERLICHE UNTERFERTIGKEIT: superpowers:executing-plans für die Integration und superpowers:dispatching-parallel-agents für unabhängige, abgegrenzte Kernmodule verwenden. Schritte verwenden Kontrollkästchen (`- [ ]`).

**Ziel:** nicht funktionsfähige Bildschirme durch echte Module für Fahrten, Analyse, Diagnose, Zustand und Assistent ersetzen sowie Wartung/Export ausbauen.
**Architektur:** unabhängige, getestete GPS-/OBD-/KI-Kernmodule, Integration in den versionierten lokalen Zustand und die vorhandene Oberfläche. Die KI-API ist ein separater Node-Server mit einem Schlüssel außerhalb des Clients.
**Technologien:** Expo 58, React Native, TypeScript, Expo Location/FileSystem/Sharing, BLE, Node HTTP.
**Spezifikation:** `docs/superpowers/specs/2026-11-25-connected-modules-design.md`

## Allgemeine Vorgaben

- Den freigegebenen Stil beibehalten und Benutzerdaten nicht durch Demodaten ersetzen.
- Der Benutzer hat fortlaufende Arbeit ohne erneute Freigabe beauftragt; Routineentscheidungen werden selbstständig getroffen.
- Adapter-UUID und API-Schlüssel sind konfigurierbar; Zugriff auf Hardware/Dienste wird nicht vorgetäuscht.
- Zustimmung im Funktionskontext, minimaler KI-Kontext, Geheimnisse nur auf dem Server.
- Alle Schreibvorgänge über Validierung und Repository, Trennung der Fahrzeuge. Nach Präzisierung durch den Benutzer wurden der gesamte Demomodus und die Beispieldaten aus der mobilen App entfernt.

## Prüfschwerpunkte

- Fahrzeugwechsel, Wechsel in den Hintergrund und Neustart während der Aufzeichnung dürfen eine Fahrt keinem anderen Fahrzeug zuordnen und keinen Entwurf verlieren.
- GPS berechnet keine Strecke über Lücken und Sprünge; eine fehlende Messung bedeutet nicht null Ereignisse.
- Timeout/Trennung/unvollständiger OBD-Rahmen darf kein falsches „0 Fehler“ erzeugen.
- Die KI erhält weder VIN, Kennzeichen noch Standort; der Schlüssel liegt nicht im Client, und der Proxy ist keine offene kostenpflichtige API.
- Sicherungsimport und Löschen von Einträgen entfernen keine Daten ohne Bestätigung; Schemaversionen werden validiert.

### Aufgabe 1: Fahrten- und Analysekern
Dateien: `mobile/src/trips.ts`, `mobile/tests/trips.test.mjs`.
Schnittstellen: `TripPoint`, `TripRecord`, `analyzeTrip`, `validateTripRecord`; Felder vehicleId, id und source.
- [x] GPS-, Lücken-, Geschwindigkeits-, Ereignisheuristik- und manuelle Fahrtentests RED→GREEN.

### Aufgabe 2: OBD2 und Adapterclient
Dateien: `mobile/src/obd/*`, `mobile/tests/obd*.test.mjs`.
Schnittstellen: Snapshot mit id/vehicleId/time/source, asynchroner Befehlstransport, PID- und DTC-Parser, BLE-Plattformadapter.
- [x] Offizielle ELM327- und BLE-Dokumentation, Tests für Parser, Pufferung, Timeout und Löschverweigerung RED→GREEN. Echtes WLAN/TCP sowie Android Classic/SPP mit Streamtests hinzugefügt.

### Aufgabe 3: Assistenten-API
Dateien: `server/*`, `mobile/src/assistant-client.ts`, `mobile/tests/assistant*.test.mjs`.
Schnittstellen: POST `/assistant` `{question,context}` → `{answer}`, minimaler ausdrücklicher Kontext; keine identifizierenden Daten.
- [x] Offizielle API-Dokumentation, Tests für Validierung/Authentifizierung/Limits und Antwortfehler RED→GREEN. Kein kostenpflichtiger OpenAI-Aufruf ausgeführt.

### Aufgabe 4: Schema und lokale Module
Dateien: `mobile/src/domain.ts`, Funktionsdomänen, Berichte, Export/Import, Erinnerungsformulare, Medien und Tests.
- [x] Migration v1→v2, neue Sammlungen, Erinnerungen, Wertvergleiche, Bericht und Sicherung mit RED→GREEN-Tests. Migration des nativen Speichers zu SQLite, technische Daten und lokale Anhänge hinzugefügt.

### Aufgabe 5: Integration von Oberfläche und Hardware
Dateien: neue Modulbildschirme, AppProvider, Aufzeichnung, Formulare, Expo-Routen, SDK-Konfiguration.
- [x] GPS im Vordergrund + Entwurf, Verlauf/Spurschema/Analyse, OBD BLE/WLAN/Classic, KI-Zustimmung und Endpunkt, Berichte, Wartung und Anhänge. Eine Kartenunterlage wurde nicht implementiert.

### Aufgabe 6: Verifikation und Prüfung
- [x] 107 Tests (94 mobil, 9 Server, 4 Prototyp), TypeScript und Lint — letzter Lauf 2026-11-25, Status 0.
- [x] JS-/Hermes-Exporte für Web/iOS/Android nach den letzten Änderungen; Autolinking geprüft: Classic nur Android, BLE/TCP beide Plattformen. README und RELEASE beschreiben die tatsächlichen Einschränkungen.
- [x] Webvorschau im Telefonformat: leere Garage und Datenschutz; separate QA-Sitzung: eigenes Fahrzeug und technische Daten speichern. Keine Testeinträge in die Hauptgarage eingefügt.
- [ ] Unabhängige Abschlussprüfung der gesamten Integration: zusätzliche Agentenstarts scheiterten am verfügbaren Budget; der federführende Bearbeiter führte die Integrationsprüfung aus.
- [ ] Tests auf physischen Telefonen und Adaptern, Auswahl/Öffnen von Anhängen auf dem Gerät, signierte Builds und Distribution. Ein Bundle-Export ersetzt diese Schritte nicht.
