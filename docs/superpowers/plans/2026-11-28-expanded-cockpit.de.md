[Polski](2026-11-28-expanded-cockpit.md) | [English](2026-11-28-expanded-cockpit.en.md) | [Deutsch](2026-11-28-expanded-cockpit.de.md)

# Erweitertes Diagnosecockpit

Ziel: animiertes Fahrzeugschema, Messanzeigen, VIN-Identifikation und auswählbare Beispielfotos des Modells.

Architektur: vorhandenes Expo SDK 58, React Native Animated und react-native-svg. Keine neuen Abhängigkeiten. Messwerte und Fahrzeugidentität haben getrennte Quellen.

Messanimation nur bei frischen Live-Daten; fehlende Werte, Historie und Importe bleiben statisch. Bewegungsreduktion, Fokusverlust und Hintergrund beachten.

Eigentümerfoto hat Vorrang. Commons-Suche erst nach ausdrücklichem Start; nur Marke/Modell/Jahr, keine VIN oder Kennzeichen. Nutzer wählen Fotos mit Autor/Lizenznachweis.

Route /cockpit verwendet den vorhandenen OBD-Verbindungsablauf; VIN-Auslesen behält die Bestätigung vor dem Speichern.

Zuerst Tests für Datenumfang und Fotoclient; danach Implementierung, TypeScript/lint, vollständige Tests, Exporte und Browserprüfung bei 320/390/1440 px.

OBD-Hardware, physische Geräte und Übereinstimmung der Fotogeneration benötigen eine gesonderte Prüfung.

`mobile/src/DiagnosticCockpit.tsx`, `mobile/src/CockpitVehicle.tsx`, `mobile/src/CockpitIdentity.tsx`, `mobile/src/vehicle-images.ts`, `mobile/src/cockpit.ts`, `mobile/src/obd/DiagnosticsScreen.tsx`, `mobile/src/app/cockpit.tsx`.

Prüfung: Tests erfassen VIN-Bestätigung im direkten Cockpit, Fotoaustausch nach Fehler, Berichtsumfang und Commons-Client (Abbruch, Grenzen, Quellen und aktuelles CDN). Commons-Auswahl gilt für diese Sitzung; dauerhafte Eigentümerfotos werden in Garage hinzugefügt.

`mobile/src/CockpitDetails.tsx`, `mobile/tests/cockpit.test.mjs`, `mobile/tests/cockpit-ui.test.mjs`, `mobile/tests/vehicle-images.test.mjs`, `mobile/tests/obd-screen.test.mjs`.

Endergebnis: 383 Tests bestanden; TypeScript, Lint und Dokumentationsprüfung bestanden. JavaScript-Exporte für web/iOS/Android wurden mit geleertem Bundler-Cache neu erstellt. Browserprüfungen erfassten 320/390/1440 px, Start/Stopp der Animationsvorschau, Systemauswahl und OBD-Verbindungen ausschließlich in der nativen App. Der echte Commons-Client lieferte Modellfotos mit Autoren und Lizenzen.
