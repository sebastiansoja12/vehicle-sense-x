[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Erweiterte OBD-Diagnose · 0.5.0 / 7

Version 0.5.0/Build 7 erweitert die Diagnose um einen Katalog mit 54 Standardmesswerten, Emissionsbereitschaft, Freeze Frame 0, auswählbare Live Data, ein Diagramm mit 300 Zyklen, Scanvergleiche und JSON/CSV/PDF/HTML-Export.

Der Basisscan liest Drehzahl, Kühlmittel, Last, Adapterspannung und verfügbare Fehlerstatus. Ein separater erweiterter Scan fragt unterstützte Katalogeinträge, Bereitschaftsmonitore mit PID 01 und Freeze Frame 0 ab. Dies bestätigt keinen Zugriff auf alle Steuergeräte oder Herstellerdiagnosen. Fehlende Daten bleiben unbekannt.

Live Data unterstützt bis zu 8 gemeldete PIDs. Die Pause von 2/5/10 Sekunden beginnt nach Abschluss des vorherigen Zyklus; die tatsächliche Frequenz hängt vom Adapter ab. Das Diagramm hält die letzten 300 Zyklen im Sitzungsspeicher. Fehlende Messungen und Wiederaufnahmen erzeugen getrennte Abschnitte. CSV vor dem Verlassen des Bildschirms oder einem Fahrzeugwechsel exportieren; Sitzungen werden nicht automatisch in der Garage gespeichert.

Der vollständige Bericht behält während Live Data seinen Zeitstempel und seine Codes. Er lässt sich im Verlauf speichern, als JSON/CSV herunterladen oder in der nativen App als PDF und im Browser als HTML exportieren. Der Verlauf bietet Suche und Seiten mit 20 Einträgen. Vergleiche erfordern dasselbe Fahrzeug sowie ausdrücklich übereinstimmende CAN-ECU-Adresse und Protokoll; ältere Berichte ohne Bereich bleiben lesbar und exportierbar. Nur gemeinsame DTC-Status werden verglichen. Ein nicht erneut gemeldeter Code bestätigt keine Reparatur.

Zum Löschen werden der exakte aktuelle Bericht, eine gespeicherte Kopie, die Bestätigung ihrer Aufbewahrung und eine separate Befehlsbestätigung benötigt. PDF/CSV ersetzt keine vollständige JSON- oder Verlaufssicherung. Nach Live Data ist ein neuer vollständiger Scan erforderlich. Trennen kann einen bereits gesendeten Löschbefehl nicht zurücknehmen. Ein abgebrochener Scan ersetzt den vorherigen abgeschlossenen Bericht nicht.

## Prüfung

248/248 Tests bestanden nach den Reviewkorrekturen; Typprüfung, Lint und Web-/Android-/iOS-Hermes-Exporte waren erfolgreich. Tests steuern Antworten ausschließlich an der Hardwaregrenze; die App enthält keinen Messwertgenerator. Eine Vorschau mit 390 px öffnete leere Garage, Fahrzeugformular und Diagnose. Die native Dateiauswahl des Browsers ließ sich nicht automatisieren; Browserimport/-export und Hardwareprüfung wurden nicht als abgeschlossen gezählt.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

## Review und Korrekturen

Ein unabhängiges Review fand sieben Probleme, die mit Regressionstests behoben wurden: gleiche IDs unterschiedlicher Sicherungen, Vergleiche ohne bestätigten ECU-Bereich, Diagrammverbindungen über Pausen, Verlust des letzten Berichts beim Abbruch, widersprüchliche Importe, Verbindungsstart nach Abbruch während ausstehender Bereinigung und unnötige Skalierungsabfragen beim Basisscan. Ein vorläufiger Verdacht zusätzlicher KI-Felder wurde nach Prüfung der Auswahl von vier Feldern im Client zurückgezogen.

## Pakete und Grenzen

Signierte Android-APK/AAB und iOS-Release-Simulatorpakete für 0.5.0/Build 7 aus Quelle `35258e9` wurden geprüft. Frühere APK/AAB für 0.4.0/Build 6 enthalten die Erweiterungen von 0.5.0 nicht. Ein fehlendes aktives Apple-Developer-Konto verhindert weiterhin eine signierte App-Store-IPA. Es erfolgte keine Einreichung bei Stores.

Es wurde keine Verbindung mit physischem Telefon, Adapter oder Fahrzeug getestet. Vor Veröffentlichung jeden Transport und ausgewählte ECU, Berechtigungsverweigerung, Reichweitenverlust, Skalierung, Monitore, Rahmenwechsel während der Erfassung, Abbruch langer Scans, nativen Export und erneuten Scan nach dem Löschen prüfen. Gewöhnliche Bluetooth-Radios übertragen Systemaudio statt OBD-Daten. ECU-Codierung, Stellgliedtests und allgemeine ABS-/Airbag-Unterstützung wurden nicht hinzugefügt.

Expo Doctor: 19/20 Prüfungen. React Native Directory kennzeichnet `react-native-bluetooth-classic` und `react-native-tcp-socket` weiterhin als nicht mit New Architecture getestet. Die Warnung wurde nicht unterdrückt. Kompilierung ersetzt keine Transporttests auf einem physischen Telefon.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46007837184) · `35258e9`

APK und AAB verwenden dasselbe bisherige Expo-Zertifikat. Beide bestanden Prüfungen von 54 64-Bit-Bibliotheken und 16-KB-Ausrichtung; bundletool 1.18.3 akzeptierte das AAB. Berechtigungen entsprechen 0.4.0, die DEX-Dateien von APK/AAB sind identisch. BLE-, Classic-, TCP- und Speech-Module sowie neue Diagnosepfade im Hermes-Bytecode wurden bestätigt. Das iOS-Paket enthält arm64 und x86_64, eine Ad-hoc-Signatur ohne Apple-Team und 15 Datenschutzmanifeste ohne Tracking-Domains. Die Pakete wurden weder auf einem physischen Telefon noch im Simulator ausgeführt.

| Paket | Bytes | Metadaten und SHA-256 |
| --- | ---: | --- |
| Android APK | 109956116 | [Ergebnis](2026-11-27-android-050-apk-artifact.json) |
| Android AAB | 75809780 | [Ergebnis](2026-11-27-android-050-aab-artifact.json) |
| iOS-Simulator | 28854557 | [Ergebnis](2026-11-27-ios-050-artifact.json) |

[Android APK](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/375e55aa-934c-4439-bb4b-786952755484) · [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/999d0ca0-15ef-48e8-a135-3b5cbb30043e) · [iOS](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/53dc6f54-3426-4d0d-b228-f7612d3b5c32)
