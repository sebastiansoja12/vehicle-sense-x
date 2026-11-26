[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Überprüfung der VIN- und GPX 0.2.1-Implementierung

Quellversion 0.2.1/Build 2: echte NHTSA-Fahrzeugdaten nach Zustimmung und GPX-Export gespeicherter Fahrten. Tests: 161/161 vor Ergänzung der Backend-Shutdown-Tests; Typen, Lint, Web-Export und Android-/iOS-Hermes-Bundles bestanden. Anschließend waren beide nativen Builds erfolgreich; ihre finalen Artefakte wurden wie unten beschrieben geprüft.

Echter Client und Webformular verwendeten eine öffentliche Beispiel-VIN; Vorschau, Sperre geänderter Felder, Erhalt eines nicht ausgewählten Jahres und manuellen Motortexts sowie Zurücksetzen der Zustimmung bei VIN-Änderung wurden geprüft. Das Formular wurde ohne Speicherung eines Beispielfahrzeugs geschlossen.

Unabhängige GPX- und VIN-Prüfungen fanden keine wesentlichen Probleme. Entscheidung: Eine neue Übernahme behält nur ausgewählte Felder dieses Ergebnisses; ältere Belege erhalten keinen neuen Zeitstempel. Dabei können Quellenmetadaten früherer nicht ausgewählter Felder entfallen, nicht deren Werte.

Native 0.2.1-Builds wurden aus Revision `63b273d` eingereicht: [Android-AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) und [iOS-Simulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Geprüftes Archiv: 110 Dateien,1547848 Byte, neue Module vorhanden, keine Schlüssel oder lokalen Einstellungen. Frühere0.2.0-Artefakte enthalten die neuen Funktionen nicht. Vor Einreichung waren 4 von 30 freien Builds verbraucht, ohne Mehrkosten. Nach einer Git-Konfigurationskollision bei paralleler Archivierung wurde Android separat erneut eingereicht; der Fehler erzeugte keinen Buildauftrag.

## Backend

Begrenztes SIGTERM/SIGINT-Herunterfahren und Node 24.18.0-Container ohne Rootrechte ergänzt. Alle 13 Backendtests und 164 Tests insgesamt sowie die Codeprüfung bestanden. Das gebaute Image lief mit schreibgeschütztem Dateisystem und ausschließlich lokalem Port; der Healthcheck bestand ohne kostenpflichtige API-Konfiguration, der Container endete mit Exit0 und wurde entfernt. Der Codehash im Image entspricht der Quelle. Keine privaten Zugangsdaten im Image, öffentliche Bereitstellung oder kostenpflichtigen Aufrufe. [Container-Metadaten](2026-11-26-assistant-container.json).

Tests mit physischen Telefonen/Adaptern und nativer GPX-Freigabe stehen aus; ein Store-IPA erfordert ein aktives Apple-Developer-Konto. Keine Einreichung in den Stores erfolgt.

## iOS 0.2.1-Artefakt

Der iOS-Simulatorbuild war erfolgreich. Das finale0.2.1/Build 2-Paket hat die erwarteten Berechtigungen und iOS 16.4 als Minimum, ohne Hintergrundmodi, Kamera, Mikrofon oder Always-Standort. Das JS-Bundle enthält NHTSA- und GPX-Code; BLE-/TCP-Klassen, x86_64/arm64-Architekturen und eine Ad-hoc-Signatur ohne Apple-Team wurden bestätigt. [Artefaktmetadaten](2026-11-26-ios-021-artifact.json). Dies ist kein App-Store-IPA oder Gerätelaufzeittest.

## Android 0.2.1-Artefakt

Der signierte Produktions-AAB wurde um 13:48:47 UTC fertiggestellt. Lokale Datei: `artifacts/native/VehicleSenseX-0.2.1-android-production.aab`, 75737623 Byte, SHA-256 `ae3351c17e5a321f497db0796aa05f7e24c2278b5b7db2a5a828438f890b7192`. Das offizielle Bundletool 1.18.3 validierte das Paket; JDK 21 bestätigte die JAR-Signatur und das Zertifikat entspricht dem bestehenden Expo-Produktionsschlüssel. Der Bericht bewahrt Warnungen zu selbstsigniertem Zertifikat, Zeitstempel und ZIP-Attributen.

Das finale Manifest bestätigt Version 0.2.1/Code 2, Paket `com.vehiclesensex.app`, minSdk 24/targetSdk 36, deaktivierte Systemsicherung und keinen Debugmodus. Die Berechtigungen entsprechen dem zuvor geprüften APK. Alle drei Transportmodule, vier ABIs und die neuen VIN-/GPX-JavaScript-Marker sind vorhanden. Alle 54 64-Bit-Bibliotheken bestanden ELF-LOAD-Ausrichtungs- und RELRO-Prüfungen für 16-KB-Seiten; BundleConfig verlangt `PAGE_ALIGNMENT_16K`. [Artefaktmetadaten](2026-11-26-android-021-artifact.json). Die Prüfungen bedeuten weder Ausführung auf einem Telefon noch Store-Upload oder Erstellung eines neuen installierbaren APK.
