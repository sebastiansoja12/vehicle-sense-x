[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Ergebnisse der nativen Builds — 2026-11-26

Projekt: [@rubisco4471/vehiclesensex](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex), Expo58.0.26 / RN0.88.1, Version0.2.0. Transporte: BLE3.5.1, TCP6.4.3, Android Classic1.73.0-rc.17. Kompilierung, Signatur und Hardwarebetrieb sind getrennte Verifikationsschritte.

## Expo-Aufträge

| Plattform und Profil | Auftrag | Ergebnis |
| --- | --- | --- |
| Android Release APK, erster Versuch | [4eaf540e-88e6-4b41-8cd4-5686b9dd56b7](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/4eaf540e-88e6-4b41-8cd4-5686b9dd56b7) | Classic-Kompilierfehler: BuildConfig fehlt |
| Android Release APK, nach Korrektur | [d99099b1-3458-497e-a496-ec3b449bdf16](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/d99099b1-3458-497e-a496-ec3b449bdf16) | Erfolg, 08:10:22 UTC |
| iOS Release, Simulator | [ace81f64-663f-49e0-bb50-479e7752833c](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/ace81f64-663f-49e0-bb50-479e7752833c) | Erfolg, 07:48:42 UTC |
| Android-Produktions-AAB | [714a8afc-a7da-487b-9622-498bdb0103d4](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/714a8afc-a7da-487b-9622-498bdb0103d4) | Erfolg, 08:31:49 UTC; Revision 8056cf63e433894bad1ba6af6601dcade31cc8bb |

## Android-Classic-Korrektur und New Architecture

Der erste Compiler meldete sechs fehlende Verweise auf `kjd.reactnative.bluetooth.BuildConfig` in `StateChangeReceiver` und `PairingReceiver` während `:react-native-bluetooth-classic:compileReleaseJavaWithJavac`. AGP erzeugte diese Klasse standardmäßig nicht in der Bibliothek.

`mobile/plugins/withClassicBuildConfig.cjs` aktiviert `buildFeatures.buildConfig` ausschließlich für `react-native-bluetooth-classic`, bevor die Konfiguration der Android-Bibliothek endet. CNG bleibt erhalten; weder wird `node_modules` bearbeitet noch müssen generierte native Verzeichnisse dem Repository hinzugefügt werden. Isoliertes `expo prebuild --platform android --no-install` erzeugte auch beim erneuten Lauf genau einen Block. 135 Regressionstests, TypeScript und Lint bestanden; unabhängige Prüfung ergab keine Probleme mit Korrektur oder Archiv. Der nächste Build bestätigte die Erzeugung der Klasse und den Erfolg des gesamten APK.

TCP benötigt keinen Namespace-Patch: Das installierte RN0.88.1-Gradle-Plugin ergänzt Namespaces für alle Android-Bibliotheken (`ReactPlugin.kt`, `configureNamespaceForLibraries`). Classic und TCP nutzen weiterhin RN-Interop für ältere Module; sie wurden nicht auf TurboModules umgeschrieben. Die Directory-Warnung „Untested on New Architecture“ bleibt sichtbar. Erfolgreiche Kompilierung beweist weder Funkbetrieb noch Routing oder Ereignisse auf dem Gerät.

## APK-Überprüfung

Lokale Datei: `artifacts/native/VehicleSenseX-0.2.0-android-validation.apk`, 109822572 Bytes. SHA-256: `b77f4f5f6ca4c02ede18efdb7219cfb1d823250dbe930c48ce94c9b725535eac`. Der [APK-Bericht](2026-11-26-android-artifact.json) enthält ausgewählte Metadaten und die vollständige Berechtigungsliste.

Das finale Manifest bestätigt `com.vehiclesensex.app`, Version0.2.0/Code1, minSdk24/targetSdk36, `allowBackup=false` und keinen App-Debugmodus. Keine Kamera, kein Mikrofon, kein umfassender Medienzugriff, keine Overlays und keine Hintergrundortung/-aufzeichnung. Tatsächliche Bluetooth-, Netzwerk-, Vordergrundstandort- und Benachrichtigungsberechtigungen sind vorhanden; Bibliotheken ergänzen außerdem im Bericht aufgeführte Launcher-Badge-Berechtigungen.

Das APK enthält `RNBluetoothClassicModule`, `TcpSocketModule`, `BlePlxModule`, ein eigenständiges JS-Paket (3201928 Bytes) sowie Bibliotheken für arm64-v8a/armeabi-v7a/x86/x86_64. Für alle 54 64-Bit-Bibliotheken wurden ELF-LOAD-Segmentausrichtung auf mindestens 16384 Bytes, das Fehlen beschreibbarer Daten im aufgerundeten RELRO-Endbereich und auf 16384 Bytes ausgerichtete unkomprimierte ZIP-Einträge geprüft. Die Prüfung berücksichtigt RELRO-Padding; sie ersetzt keinen Start auf einem System mit 16-KB-Seiten. ELF-Header wurden außerdem mit dem Ergebnis von `llvm-objdump` verglichen.

Offizielles Google apksig9.5.3 verifizierte die APK-v2-Signatur ohne Fehler und Warnungen. Es handelt sich um das Zertifikat `CN=Android Debug`, keinen Produktionsschlüssel; der Zertifikatsfingerabdruck steht im Bericht. Das APK dient Tests. Die Installation einer späteren Version mit anderer Signatur kann Deinstallation der Testversion erfordern; vorher eigene Daten exportieren.

## Prüfung des Produktions-AAB

Lokale Datei: `artifacts/native/VehicleSenseX-0.2.0-android-production.aab`, 75726460 Byte. SHA-256: `c1be8e336ef4cb210388518c156cf3922f08428e917756a30faf30c0fbcaa554`. Der [Produktions-AAB-Bericht](2026-11-26-android-production-artifact.json) enthält ausgewählte Metadaten ohne privates Schlüsselmaterial.

Das offizielle Bundletool1.18.3 akzeptierte `bundletool validate`; Manifest, Berechtigungen, Transportmodule, JS-Bundle und vier ABIs entsprechen dem geprüften APK. Die Paketkonfiguration gibt `PAGE_ALIGNMENT_16K` vor; alle 54 64-Bit-Bibliotheken bestanden die ELF-LOAD-/RELRO-Prüfungen. JDK21 bestätigte die Signatur mit `jarsigner -verify`; der Fingerabdruck des Produktionszertifikats lautet `d07968eb9f05359209b5874ebf8137818e7db45b836a5564bf957320bba621a0` und unterscheidet sich von Android Debug. Der Bericht bewahrt JDK-Warnungen zum selbstsignierten Zertifikat ohne vertrauenswürdige CA-Kette, fehlenden Zeitstempel und ZIP-POSIX-/Symlink-Attribute außerhalb der JAR-Signatur auf. Das Zertifikat ist bis 2054-04-13 gültig.

Der AAB wurde nicht bei Google Play eingereicht. Für die Verteilung fehlen weiterhin Herausgeberkonto und Metadaten sowie Hardwaretests. Eine sichere Schlüsselsicherung gemäß dem Expo-Verfahren für Zugangsdaten aufbewahren; den Schlüssel nicht ins Repository aufnehmen.

## Überprüfung des iOS-Artefakts

Lokale Datei: `artifacts/native/VehicleSenseX-0.2.0-ios-simulator.tar.gz`, 28727631 Bytes. SHA-256: `ac33a19140b0e0a73ac7f5b78c2c7ad0ce29064f289a23ee52213d6f0efa8ffb`. Der [iOS-Bericht](2026-11-26-ios-artifact.json) enthält ausgewählte Metadaten.

Die finale `VehicleSenseX.app/Info.plist` bestätigt die Kennung `com.vehiclesensex.app`, Version0.2.0/Build1, mindestens iOS16.4 und Simulator-SDK27.1. Zustimmungstexte umfassen Bluetooth, lokales Netz, Standort während der Nutzung und Fotobibliothek; keine Kamera, kein Mikrofon, keine Always-Ortung und keine Hintergrundmodi. `file` bestätigte Mach-O x86_64/arm64, `nm -gU` das Vorhandensein der Klassen `TcpSockets`, `TcpSocketClient` und `BlePlx`; das Archiv enthält ein eigenständiges `main.jsbundle` (3824069 Bytes). `codesign -dv` zeigt eine Ad-hoc-Signatur ohne Apple-Team, passend für den Simulator.

15 Dateien `PrivacyInfo.xcprivacy` wurden gelesen, darunter das zusammengefasste App-Manifest und Manifeste des Dateisystemframeworks. Keine aktiviert Tracking oder deklariert Tracking-Domains; tatsächliche Einträge zu Gründen für die API-Nutzung sind im Bericht erhalten. Dies ist weder eine Erklärung zu einem künftigen Backend noch ein App-Store-Prüfergebnis.

## Signaturen, Quellen und weitere Anforderungen

Das Expo-Archiv wird durch `.easignore` im Hauptverzeichnis begrenzt: Nach der Classic-Korrektur enthielt es 102 erlaubte Dateien (1497183 Bytes), einschließlich CNG-Plugin. Vor dem Hochladen geprüft; keine Umgebungsdateien, lokalen Einstellungen, nativen Verzeichnisse, `node_modules` oder Schlüssel. Rohmetadaten mit signierten Logadressen liegen ebenso wie Binärdateien außerhalb des Repositorys. Bestehendes Konto und kostenloses Expo-Kontingent genutzt, keine Store-Einreichung.

Die automatische Berechtigungsprüfung lehnte die Erstellung eines dauerhaften Android-Schlüssels ohne ausdrückliche Zustimmung zunächst ab; der damalige Prozess wurde abgebrochen. Der Benutzer genehmigte anschließend ausdrücklich Erzeugung und Speicherung eines neuen Keystores in Expo. Der Schlüssel wurde erstellt; der signierte AAB wurde im oben genannten Auftrag erfolgreich gebaut und geprüft. Privates Schlüsselmaterial wurde weder gelesen noch ins Repository aufgenommen.

Der Produktions-iOS-Versuch stoppte vor dem Build: `Credentials are not set up. Run this command again in interactive mode.` Der Benutzer bestätigte, kein aktives Apple-Developer-Konto zu haben. Ein veröffentlichbares IPA erfordert Mitgliedschaft, Distributionszertifikat/-profil und Konfiguration der Verschlüsselungsexporterklärung durch den Herausgeber; keine Erklärung wurde geraten, um die CLI-Warnung zu entfernen. Die Simulatorversion ist kein App-Store-IPA.

Weiterhin erforderlich sind Transporttests auf physischen Telefonen und Adaptern, signierte iOS-Distribution, tatsächliche Bereitstellung des KI-Backends sowie Herausgeberdaten/Datenschutzerklärung gemäß `mobile/RELEASE.md`. Keine Hardwaretests und kein Starttest auf einem System mit 16-KB-Seiten durchgeführt.

Quelle der Ausrichtungskriterien: [Android-Dokumentation zu 16-KB-Seiten](https://developer.android.com/guide/practices/page-sizes). Technische Kennungen und JSON-Berichte behalten ihre Originalsyntax in allen Sprachversionen.
