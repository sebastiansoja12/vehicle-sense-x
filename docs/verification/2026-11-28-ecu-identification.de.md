[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# ECU-Identifikation · 0.6.0 / 8

Quellstand 0.6.0/Build 8 ergänzt einen separaten vollständigen CAN-Scan mit CALID, CVN und Steuergerätename. Cockpit, Emissionsbereitschaft, Öltemperatur und Werkstattvergleiche aus main bleiben erhalten.

## Prüfung

Nach Integration und Reviewkorrekturen bestanden 358 Tests des eingecheckten Quellstands. Der vollständige lokale main-Arbeitsbereich mit erhaltenen Oberflächenänderungen hat 371 bestandene Tests. Typen, Lint und PL/EN/DE-Dokumentation bestehen. Das Review korrigierte gemischte Pending-/NO-DATA-Antworten und fehlende Bereitschafts-/Öldaten in Basisexporten.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46112569036) · `dd64fcd`

## Pakete und Grenzen

Signierte Android-APK/AAB und iOS-Release-Simulatorpakete für 0.6.0/Build 8 aus Quelle `dd64fcd` wurden geprüft. Die Pakete enthalten ECU-Identifikation, Cockpit und das native Radiomodul aus main. Zusätzliche lokale, nicht eingecheckte Oberflächenänderungen sind nicht enthalten. Vorhandene Pakete 0.5.0 enthalten ECU-Identifikation und spätere main-Änderungen nicht.

APK und AAB verwenden dasselbe bestehende Expo-Zertifikat. Signaturen, 54 64-Bit-Bibliotheken, 16-KB-Ausrichtung und AAB-Validierung mit bundletool 1.18.3 bestanden. Berechtigungen entsprechen 0.4.0; APK/AAB-DEX-Dateien sind identisch. BLE, Android Classic, TCP, Speech, VehicleRadio und Diagnosepfade im Hermes-Bytecode wurden bestätigt.

iOS enthält arm64 und x86_64, eine Ad-hoc-Signatur ohne Apple-Team, BLE/TCP/Speech/VehicleRadio-Module und 15 Datenschutzmanifeste ohne Tracking-Domains. CarPlay ist deaktiviert: keine CarPlay-Szene oder Berechtigung. Das Paket wurde weder im Simulator noch auf einem Telefon gestartet.

Physische Adapter-/Telefonprüfungen, nativer PDF-Export und Radioprojektion wurden nicht durchgeführt. Kompilierung bestätigt weder Kompatibilität mit jedem Adapter noch Verbindungen unter New Architecture. Ein fehlendes aktives Apple-Developer-Konto verhindert weiterhin eine signierte App-Store-IPA; CarPlay erfordert eine separate Genehmigung. Es erfolgte keine Einreichung bei Stores.

| Paket | Bytes | Metadaten und SHA-256 |
| --- | ---: | --- |
| Android APK | 110185904 | [Ergebnis](2026-11-28-android-060-apk-artifact.json) |
| Android AAB | 75908145 | [Ergebnis](2026-11-28-android-060-aab-artifact.json) |
| iOS simulator | 29034337 | [Ergebnis](2026-11-28-ios-060-artifact.json) |

[Android APK](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/1870c254-e8fd-4b89-8929-626143ccc331) · [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/580d1765-c194-4a6b-a541-119d730e934c) · [iOS](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/c6988a9c-625f-4c50-818e-aabbff8bed0d)

[Anleitung und Umfang](../../mobile/ECU-IDENTIFICATION.de.md)
