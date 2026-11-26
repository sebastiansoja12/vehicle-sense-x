[Polski](2026-11-25-offline-catalog.md) | [English](2026-11-25-offline-catalog.en.md) | [Deutsch](2026-11-25-offline-catalog.de.md)

# Implementierungsplan für den Offline-Fahrzeugkatalog

> **Für agentische Bearbeiter:** superpowers:executing-plans für die Implementierung direkt in dieser Sitzung verwenden. Die bestehende Autorisierung zur fortlaufenden Ausführung gilt.

**Ziel:** Offline-Auswahl von Marke/Modell mit manueller Alternative im vorhandenen Fahrzeugformular ergänzen.
**Architektur:** reproduzierbar generierter Namenssnapshot, reine Such-/Auswahlfunktionen, eine Formularkomponente, gemeinsame Quellenhinweise.
**Technologien:** Expo 58, React Native 0.88.1, TypeScript, Node-24-Skripte/-Tests; keine neue Abhängigkeit.
**Spezifikation:** `docs/superpowers/specs/2026-11-25-offline-catalog-design.md`.

## Allgemeine Vorgaben
- Bestehende Fahrzeugdatensätze und Schema erhalten; keine Beispiel-Garageneinträge.
- Nur ausgewählte öffentliche Quellen aufnehmen, Inhalts-SHA-256 und Upstream-Commit festlegen.
- Suchtext von ausgewählter Marke/Modell trennen; manuelle Eingabe und alle anderen Felder erhalten.
- Keine abgeleiteten Produktionsjahre, Motoren oder Ausstattungen.

## Prüfschwerpunkte
- Modelle der vorherigen Marke dürfen nach Auswahl einer anderen Marke nicht ausgewählt bleiben.
- Diakritika/Groß-/Kleinschreibung stimmen bei der Suche überein, bedeutungstragende Interpunktion bleibt jedoch getrennt.
- Unbekannte bestehende Autos und manuelle Eingaben bleiben bei Moduswechseln und beim Speichern erhalten.
- Datensätze ausgeschlossener Quellen dürfen nicht in den verteilbaren Teildatensatz gelangen.
- Lange Namen, ungültige Tupel oder beschädigte Eingaben lassen die Generierung fehlschlagen, statt unbemerkt unbrauchbare Einträge zu erzeugen.

## Aufgabe 1: Datensatz und Domäne (RED → GREEN)
- [x] Tests: `mobile/tests/vehicle-catalog.test.mjs`, `mobile/tests/catalog-build.test.mjs` — sieben Tests mit beobachtetem RED → GREEN.
- [x] `mobile/scripts/build-vehicle-catalog.mjs` implementieren: typisierte Paketdatei aus geprüftem, festgelegtem Inhalt extrahieren und generieren; lokales `--check` reproduziert beide Dateien.
- [x] `mobile/src/vehicle-catalog.ts` implementieren: Suche, Auflösung und unveränderliche Markenauswahl; manuelle Werte erhalten.
- [x] `mobile/src/vehicle-catalog-data.ts` generieren; Quellenhinweise in `mobile/src/CatalogNotices.tsx` und `mobile/assets/catalog/README.md`.

## Aufgabe 2: Formular und Überprüfung
- [x] `mobile/src/VehicleIdentityFields.tsx` implementieren, `mobile/src/EntryForm.tsx` integrieren; Quellenhinweise über Formular/Einstellungen erreichbar.
- [x] Browser-QA im Telefonformat: Škoda/Octavia, auf die Marke begrenzte Modellsuche, Wechsel zu Dacia löscht das Modell, manuelle Werte bleiben bei beiden Moduswechseln erhalten, korrektes Schließen/erneutes Öffnen. Die Hauptgarage bleibt leer.
- [x] 114 Tests bestanden, TypeScript und Lint ohne Fehler, Web-/iOS-/Android-JS-/Hermes-Exporte nach der letzten Barrierefreiheitskorrektur erfolgreich, 2026-11-25.
- [x] Unabhängige Prüfung ohne Änderungen abgeschlossen. P2: nicht zugängliche Beschriftungen ausgewählter Werte im echten Browser reproduziert (RED), durch Aufnahme des ausgewählten Werts in jede Beschriftung behoben und anschließend für Dacia/Duster bestätigt (GREEN). Keine weitere bestätigte Regression; native VoiceOver-/TalkBack-/Tastaturtests bleiben in RELEASE.md aufgeführt.
