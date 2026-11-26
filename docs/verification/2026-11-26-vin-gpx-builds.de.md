[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Überprüfung der VIN- und GPX0.2.1-Implementierung

Quellversion0.2.1/Build2: echte NHTSA-Fahrzeugdaten nach Zustimmung und GPX-Export gespeicherter Fahrten. Tests:161/161; Typen, Lint, Web-Export und Android-/iOS-Hermes-Bundles bestanden. Dies belegt noch keine neue native Kompilierung.

Echter Client und Webformular verwendeten eine öffentliche Beispiel-VIN; Vorschau, Sperre geänderter Felder, Erhalt eines nicht ausgewählten Jahres und manuellen Motortexts sowie Zurücksetzen der Zustimmung bei VIN-Änderung wurden geprüft. Das Formular wurde ohne Speicherung eines Beispielfahrzeugs geschlossen.

Unabhängige GPX- und VIN-Prüfungen fanden keine wesentlichen Probleme. Entscheidung: Eine neue Übernahme behält nur ausgewählte Felder dieses Ergebnisses; ältere Belege erhalten keinen neuen Zeitstempel. Dabei können Quellenmetadaten früherer nicht ausgewählter Felder entfallen, nicht deren Werte.

Native0.2.1-Builds wurden aus Revision `63b273d` eingereicht: [Android-AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) und [iOS-Simulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Geprüftes Archiv:110 Dateien,1547848 Byte, neue Module vorhanden, keine Schlüssel oder lokalen Einstellungen. Frühere0.2.0-Artefakte enthalten die neuen Funktionen nicht. Vor Einreichung waren4 von30 freien Builds verbraucht, ohne Mehrkosten. Nach einer Git-Konfigurationskollision bei paralleler Archivierung wurde Android separat erneut eingereicht; der Fehler erzeugte keinen Buildauftrag.

## Backend

Begrenztes SIGTERM/SIGINT-Herunterfahren und Node24.18.0-Container ohne Rootrechte ergänzt. Alle13 Backendtests und164 Tests insgesamt sowie die Codeprüfung bestanden. Das gebaute Image lief mit schreibgeschütztem Dateisystem und ausschließlich lokalem Port; der Healthcheck bestand ohne kostenpflichtige API-Konfiguration, der Container endete mit Exit0 und wurde entfernt. Der Codehash im Image entspricht der Quelle. Keine privaten Zugangsdaten im Image, öffentliche Bereitstellung oder kostenpflichtigen Aufrufe. [Container-Metadaten](2026-11-26-assistant-container.json).

Tests mit physischen Telefonen/Adaptern und nativer GPX-Freigabe stehen aus; ein Store-IPA erfordert ein aktives Apple-Developer-Konto. Keine Einreichung in den Stores erfolgt.
