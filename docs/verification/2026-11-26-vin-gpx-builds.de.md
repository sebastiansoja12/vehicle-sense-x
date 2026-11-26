[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Überprüfung der VIN- und GPX0.2.1-Implementierung

Quellversion0.2.1/Build2: echte NHTSA-Fahrzeugdaten nach Zustimmung und GPX-Export gespeicherter Fahrten. Tests:161/161; Typen, Lint, Web-Export und Android-/iOS-Hermes-Bundles bestanden. Dies belegt noch keine neue native Kompilierung.

Echter Client und Webformular verwendeten eine öffentliche Beispiel-VIN; Vorschau, Sperre geänderter Felder, Erhalt eines nicht ausgewählten Jahres und manuellen Motortexts sowie Zurücksetzen der Zustimmung bei VIN-Änderung wurden geprüft. Das Formular wurde ohne Speicherung eines Beispielfahrzeugs geschlossen.

Unabhängige GPX- und VIN-Prüfungen fanden keine wesentlichen Probleme. Entscheidung: Eine neue Übernahme behält nur ausgewählte Felder dieses Ergebnisses; ältere Belege erhalten keinen neuen Zeitstempel. Dabei können Quellenmetadaten früherer nicht ausgewählter Felder entfallen, nicht deren Werte.

Native0.2.1-Builds: noch nicht eingereicht. Frühere0.2.0-Artefakte enthalten die neuen Funktionen nicht. Das freie Expo-Kontingent wurde vor neuen Aufträgen geprüft:4 von30 Builds verbraucht, keine Mehrkosten.

Tests mit physischen Telefonen/Adaptern und nativer GPX-Freigabe stehen aus; ein Store-IPA erfordert ein aktives Apple-Developer-Konto. Keine Einreichung in den Stores erfolgt.
