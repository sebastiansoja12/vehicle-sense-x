[Polski](2026-11-26-reminder-builds.md) | [English](2026-11-26-reminder-builds.en.md) | [Deutsch](2026-11-26-reminder-builds.de.md)

# Überprüfung von 0.2.2 und automatischen Prüfungen

## Committeter und gepushter Anwendungscode

Commit `6c8394d9933181f84b78478f6784b62abf392ca6` wurde zu GitHub gepusht. Version 0.2.2/Build 3 ersetzt veraltete Benachrichtigungszeitpläne, prüft bei Rückkehr erneut, zeigt Vordergrundbenachrichtigungen lautlos und liest die Version der Einstellungen aus der Expo-Konfiguration. Alle 171/171 Tests, Typprüfung, Lint sowie Web- und Android-/iOS-Hermes-Exporte bestanden. Sieben neue Benachrichtigungstests decken Datum, Inhalt, Migration, Idempotenz, Abbruch, verweigerte Berechtigung und Vordergrundanzeige ab. Die unabhängige Prüfung fand im festgelegten Umfang keine notwendigen Korrekturen; eine ständige Zeitzonenüberwachung ist nicht implementiert.

## Eingereichte native Builds

Beide Aufträge verwenden denselben Commit; das geprüfte Archiv enthielt 110 Dateien und 1548545 Byte mit neuem Benachrichtigungscode, ohne Geheimnisse, Tests oder generierte native Verzeichnisse.

| Profil | Auftrag | Letzter bestätigter Stand |
| --- | --- | --- |
| Android-Produktions-AAB, bestehender Expo-Schlüssel | [940e4b0d-2f12-4224-b54c-7f2db3e3fb31](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/940e4b0d-2f12-4224-b54c-7f2db3e3fb31) | Fertig 14:29:10 UTC |
| iOS-Release-Simulator | [bdd4df2b-b15c-47ba-8b72-8615bba7e3b2](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/bdd4df2b-b15c-47ba-8b72-8615bba7e3b2) | Fertig 14:12:07 UTC |

Beide 0.2.2-Builds waren erfolgreich und ihre finalen Artefakte wurden geprüft. [Geprüfte 0.2.1-Artefakte](2026-11-26-vin-gpx-builds.de.md) bleiben separate frühere Pakete.

## Finale Artefakte

Die [Android-Metadaten](2026-11-26-android-022-artifact.json) enthalten den 75737794 Byte großen AAB und seinen SHA-256. Das offizielle Bundletool 1.18.3 akzeptierte ihn, JDK 21 bestätigte die Signatur und das Zertifikat entspricht dem bestehenden Expo-Produktionsschlüssel. Version 0.2.2/Code 3, Berechtigungen, drei Transportmodule, vier ABIs und neue JavaScript-Benachrichtigungsmarker wurden bestätigt. Alle 54 64-Bit-Bibliotheken bestanden ELF-LOAD-/RELRO-Prüfungen für 16-KB-Seiten; die Paketierung verlangt `PAGE_ALIGNMENT_16K`. Signaturwarnungen zu selbstsigniertem Zertifikat, fehlendem Zeitstempel und ZIP-Attributen bleiben dokumentiert.

Die [iOS-Metadaten](2026-11-26-ios-022-artifact.json) enthalten das 28741233 Byte große Simulatorarchiv und SHA-256. Version 0.2.2/Build 3, mindestens iOS 16.4, erwartete Berechtigungstexte, x86_64/arm64, BLE-/TCP-Klassen und Ad-hoc-Signatur ohne Apple-Team wurden bestätigt. JavaScript enthält die neuen Benachrichtigungsmarker. Keines der 15 Datenschutzmanifeste deklariert Tracking oder Trackingdomains. Die Artefakte wurden nicht auf einem Telefon ausgeführt; das Simulatorpaket ist kein Store-IPA. Keine Einreichung in den Stores erfolgte.

## Lokale CI-Änderungen

Vorbereitet wurden `.github/workflows/verify.yml`, `scripts/check-docs.py` und Tests des echten CLI in temporären Repositories. Sechs neue Validatortests und alle zehn Haupttests bestanden. Der Validator erkennt fehlende Sprache, verwaiste Übersetzung, falschen Link/Sprache, geänderte Befehle/Bezeichner und leeres Dokument. Die YAML-Syntax wurde lokal eingelesen; festgelegte offizielle Action-Revisionen wurden vor der Sperre auf GitHub geprüft. Die unabhängige Prüfung fand keine notwendigen Korrekturen.

Die kombinierte Regressionssuite bestand lokal mit 177/177. Der [erste tatsächliche GitHub-Lauf](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/45879258043) bestand für Revision `35285a5`, einschließlich Tests, Typen, Lint, Dokumentation und Web-/Hermes-Exporten. Der Validator unterstützt die aktuellen Markdown-Konventionen des Repositories; Ankerfragmente, Referenzlinks oder Übersetzungsqualität werden nicht geprüft. Benachrichtigungstests isolieren die native API-Grenze; sie ersetzen keine Zustellungstests auf Telefonen.
