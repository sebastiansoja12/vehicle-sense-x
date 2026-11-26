[Polski](RELEASE.md) | [English](RELEASE.en.md) | [Deutsch](RELEASE.de.md)

# Veröffentlichung von VehicleSenseX 0.3.0

Quellversion 0.3.0/Build 4 ergänzt Besitzkosten mit Kategorie, genauem PLN-Betrag, Bearbeiten/Löschen, Monats-/Jahressummen und separatem CSV. Schema 3 migriert ältere Garagen und Sicherungen; ältere App-Versionen können Schema 3 nicht lesen. Der Sicherungsimport lehnt zukünftige Ausgabendaten ab, vorhandene Daten bleiben bei zurückgestellter Uhr lesbar. Ausgabendetails bleiben außerhalb von KI-Kontext und Verkaufsbericht. Der signierte Android-0.3.0-AAB und das iOS-Release-Simulatorpaket wurden mit dem Register gebaut und geprüft.

Aktuelle Quellprüfungen und Oberflächenergebnisse: [Überprüfung 0.3.0](../docs/verification/2026-11-26-ownership-expenses.de.md).

Quellversion 0.2.2/Build 3 korrigiert veraltete Benachrichtigungszeitpläne und die Vordergrundanzeige, prüft beim Zurückkehren erneut und liest die angezeigte Version aus der Expo-Konfiguration. Sieben neue Regressionstests bestanden; die vollständige Suite besteht mit 171/171, ebenso Typprüfung und Lint. Die nativen 0.2.2-Pakete wurden gebaut und geprüft; die Zustellung auf Hardware bleibt ungeprüft.

Die unabhängige Prüfung fand innerhalb dieses Umfangs keine notwendigen Korrekturen. Eine Zeitzonenänderung bei durchgehend geöffneter App wird bei der nächsten Rückkehr berücksichtigt; eine ständige Zeitzonenüberwachung gibt es nicht. Der Sicherungsimport deaktivierte wiederhergestellte Benachrichtigungen bereits bis zur erneuten ausdrücklichen Aktivierung.

Der signierte Android-0.2.2-AAB und das iOS-Release-Simulatorpaket wurden geprüft. [Aktuelle Überprüfung und verbleibende Aufgaben](../docs/verification/2026-11-26-reminder-builds.de.md).

Version 0.2.1/Build 2 aus Revision `63b273d` hat einen geprüften signierten Android-Produktions-AAB und ein iOS-Release-Simulatorpaket mit GPX-Export und NHTSA-Datenergänzung. Ergebnisse: [Buildbericht 0.2.1](../docs/verification/2026-11-26-vin-gpx-builds.de.md). Das frühere installierbare Validierungs-APK bleibt Version 0.2.0 und enthält diese Funktionen nicht.

Status: Implementierung mit echten BLE-/TCP-/Android-Classic-Transporten, ohne Demonstrationsmessungen. Der native iOS-Release-Build für den Simulator wurde am 2026-11-26 erfolgreich abgeschlossen; finale App-Datei, Berechtigungen und Vorhandensein der BLE-/TCP-Klassen wurden geprüft. Auch das Android-Release-APK wurde nach Behebung des Classic-BuildConfig-Fehlers durch ein CNG-Plugin erfolgreich gebaut; Manifest, Module, Testsignatur und Bibliotheksausrichtung wurden geprüft. Der Android-Produktions-AAB wurde nach ausdrücklicher Zustimmung des Benutzers mit einem neuen Schlüssel in Expo signiert und erfolgreich geprüft. Noch kein Store-IPA und keine bestätigte Hardwarematrix; keine Einreichung in den Stores. Aktuelle Ergebnisse: [Buildbericht](../docs/verification/2026-11-26-native-builds.de.md).

Konfigurationsprüfung 2026-11-25: `expo prebuild --no-install --platform all` wurde in einer separaten temporären Kopie erfolgreich abgeschlossen. Im Repository wurden weder `ios/` noch `android/` angelegt. Generierte Info.plist, AndroidManifest und helles Design geprüft. Kamera/Mikrofon/umfassender Fotozugriff/Overlays werden entfernt; keine Always-Ortung und keine Hintergrundaufzeichnung. Ergebnis: [Konfigurationsbericht](../docs/verification/2026-11-25-native-config.json). Dies ist die Projektkonfiguration vor Zusammenführung der Bibliotheksmanifeste und Kompilierung, kein Prüfergebnis des finalen APK/IPA.

Expo Doctor: 19/20 Prüfungen. Fehlende direkte Peer-Abhängigkeit `expo-font` über Expo CLI ergänzt; `expo-system-ui` stellt den deklarierten hellen Android-Stil sicher. Verbleibende Directory-Prüfung: `react-native-bluetooth-classic` und `react-native-tcp-socket` haben den Status „Untested on New Architecture“. Die Warnung wurde nicht unterdrückt. TCP wurde über RN 0.88-Interop kompiliert und in iOS Release eingebunden; Classic ist nur für Android. Der Compiler allein bestätigt weder Adapterverbindung noch Verarbeitung von Zustimmungen und Ereignissen auf dem Telefon.

## Pakete erzeugen

Das Projekt ist dem bestehenden Expo-Konto `@rubisco4471/vehiclesensex` zugeordnet; `extra.eas.projectId` und `owner` sind in `app.json` gespeichert. Bei Wechsel des Herausgebers muss das Projekt in Expo übertragen werden. Rechte an App-Kennung und Apple-/Google-Signaturen sind weiterhin erforderlich. Die Kennung `com.vehiclesensex.app` wurde weder registriert noch auf Verfügbarkeit in den Stores geprüft. Keine Schlüssel oder Signierungsdateien in das Repository aufnehmen.

```sh
cd mobile
nvm use
npm ci
npm run verify
npx eas-cli@latest login
npm run build:native-check
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Bestehende Profile in `eas.json` beibehalten. `native-check` kompiliert ein Android-Release-APK ohne Übergabe eines Produktionsschlüssels sowie iOS Release für den Simulator ohne Apple-Konto. Dies sind keine Veröffentlichungspakete. Android preview erzeugt ein installierbares APK; Android production erzeugt ein AAB. Das iOS-store-Profil erfordert Apple-Zugangsdaten. Vor der nächsten Veröffentlichung `android.versionCode` und `ios.buildNumber` in `app.json` erhöhen. `expo export` allein kompiliert keine nativen BLE-/TCP-/SQLite-Treiber.

Das Expo-Archiv ist durch die `.easignore` im Hauptverzeichnis auf `mobile/`-Quellen, Ressourcen und Konfiguration begrenzt; negierte Verzeichnisse in der Erlaubnisliste nicht mit Schrägstrich abschließen, da die Kopierphase Pfade ohne diesen prüft. `plugins/withClassicBuildConfig.cjs` ist eine erforderliche CNG-Eingabe und muss ins Archiv gelangen. Vor dem Hochladen einer geänderten Erlaubnisliste `eas build:inspect --platform android --profile native-check --stage archive --output /private/tmp/vehiclesensex-archive-check` prüfen; keine `.env`, Schlüssel oder lokalen Werkzeugeinstellungen hochladen.

Der Produktions-iOS-Versuch stoppte vor dem Build wegen fehlendem Distributionszertifikat/-profil. Der Herausgeber muss die Signierung interaktiv konfigurieren und die Verschlüsselungsexporterklärung für App Store Connect bestätigen. Der Benutzer hat die Erstellung eines neuen Android-Signierschlüssels in Expo genehmigt; der Schlüssel wurde erstellt und der signierte AAB erfolgreich gebaut und geprüft. Ein inaktives Apple-Developer-Konto blockiert Store-IPA. Das Test-APK ist mit Android Debug signiert; vor Deinstallation zur Installation einer Version mit anderer Signatur eigene Daten exportieren. Ergebnisse und lokale Dateien unter `artifacts/` enthalten keine privaten Signierschlüssel.

SDK 58 hat Android compileSdk 37 / targetSdk 36 sowie iOS 16.4 ausdrücklich festgelegt. Bei einer künftigen Erhöhung von targetSdk auf 37 muss die neue Berechtigung `ACCESS_LOCAL_NETWORK` ergänzt und geprüft werden; für targetSdk 36 nennt die Android-Dokumentation Zugriff über INTERNET. iOS hat einen Nutzungstext für das lokale Netz; keine globale ATS-Deaktivierung und keine unnötigen „Always“-Standortdeklarationen.

## Prüfungen auf Geräten

Für konkretes Telefonmodell, Betriebssystem, Adapter und Auto jeweils das Ergebnis erfassen:

- BLE: verweigerte Zustimmung, deaktivierter Funk, Suche, Diensterkennung, Initialisierung, PID/DTC, Reichweitenverlust, erneute Verbindung.
- Classic/SPP unter Android: Liste gekoppelter Geräte, verweigertes Bluetooth Connect, RFCOMM-Verbindung, rohe Fragmente, Timeout und Verbindungsabbruch. Das Classic-Modul ist vom iOS-Autolinking ausgeschlossen.
- WLAN: verweigerter lokaler Netzwerkzugriff unter iOS, korrektes Netz/IP/Port, Netz ohne Internet, parallele mobile Daten unter Android, fehlender Adapter, Verbindungsabbruch und Timeout.
- OBD: CAN-Protokolle 6/7/8/9, Erkennung einer/mehrerer ECUs, Auswahl einer tatsächlichen Adresse, physische Header/Filter, ISO-TP-Antworten und erhaltener Geltungsbereich in Verlauf/Bericht/KI. Verweigerte Filteränderung, nicht unterstützte PID/Status, keine Codes in ausgelesenen Status, Sicherung vor Löschen, tatsächliche 44-Bestätigung der ausgewählten ECU und erneutes Auslesen prüfen. Löschen nicht während der Fahrt testen.
- VIN: tatsächliches 0902-Auslesen der ausgewählten CAN-ECU, fehlende Unterstützung, unvollständige/falsche Nummer, Vergleich mit Dokumenten, Bestätigung des Ersetzens, vor dem Speichern geändertes altes Profil, Neustart und Sicherung mit erhaltener Quelle. Auslesen nicht mit Echtheitsbestätigung gleichsetzen.
- GPS: verweigerte Zustimmung, schlechtere Genauigkeit, Pause/Fortsetzen, Fahrzeugwechselsperre, Wechsel in den Hintergrund, Neustart und Entwurfswiederherstellung, voller Speicher. Ereignisheuristiken erfordern Kalibrierung.
- SQLite: Aktualisierung aus altem Speicherstand, Verlauf über 2 MB, Schreiben/Lesen nach Neustart, voller Speicher, Export und Wiederherstellung eigener Sicherung.
- Medien: echtes Foto auswählen, Komprimierung, PDF-Rechnung speichern, erneut öffnen, Anhänge löschen und aus Sicherung wiederherstellen.
- Offline-Katalog: Marken-/Modellsuche im Flugmodus, Auswahl mit Bildschirmtastatur und VoiceOver/TalkBack, Markenwechsel, manuelles fehlendes Auto und Bearbeiten bestehender Namen. Quellen und Lizenzen müssen in der veröffentlichten Version zugänglich sein. Webvorschau ersetzt keine Prüfung von Tastatur und Screenreader auf dem Telefon.
- Benachrichtigungen und PDF: tatsächliche Anzeige zum Termin, Widerruf der Zustimmung, Stornierung nach Erledigen/Löschen des Termins, PDF-Datei außerhalb der App öffnen.

Diese Tests wurden weder durch TCP-Tests auf dem Computer noch durch die Webvorschau ersetzt.

## KI-Server

Anleitung: `server/README.md`. Der Server erfordert einen OpenAI-Schlüssel und privaten Token. Die Produktionsadresse muss HTTPS verwenden. Keine Domain, kein Hosting und kein Schlüssel konfiguriert; kein kostenpflichtiger Test mit echtem OpenAI-Konto durchgeführt.

Der aktuelle Server ist für kontrollierte Bereitstellung mit privaten Tokens gedacht. Vor einem öffentlichen Massendienst sind Authentifizierung und Limits für einzelne Benutzer sowie ein gemeinsames Gateway-Limit über mehrere Instanzen umzusetzen. Ein gemeinsamer kostenpflichtiger Token darf weder in die Binärdatei noch in `EXPO_PUBLIC_*` gelangen.

## Herausgeberinformationen und Distribution

Vor Einreichung echte Herausgeberdaten, Kontakt, öffentliche Datenschutzerklärungsadresse, zu den aktiven Diensten passende Verarbeitungserklärungen und Screenshots der signierten Version auf Geräten ergänzen. Der Bildschirm „Twoje dane“ beschreibt das App-Verhalten, ersetzt aber keine öffentliche Datenschutzerklärung des konkreten Betreibers.

Das App-Symbol liegt unter `assets/brand/icon.png`; die Vektorquelle unter `icon.svg`. Dies sind weder Store-Screenshots noch eine Bestätigung der Marken-/Namensregistrierung. Keine Veröffentlichung, Dienstzahlung oder automatische Store-Einreichung gestartet.

Quellen: [Expo EAS](https://docs.expo.dev/build/eas-json/), [Android Local Network](https://developer.android.com/privacy-and-security/local-network-permission), [Apple Local Network](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy).

## Änderungen 0.2.1

Der GPX-Export erhält tatsächliche GPS-Segmente und UTC-Zeiten, ohne Lücken zu verbinden. Die optionale NHTSA-Abfrage sendet die VIN erst nach einer an diese VIN gebundenen Zustimmung an den Dienst in den USA; vor dem Speichern ist eine Feldauswahl erforderlich. Quelle und Abrufzeit bleiben bei weiterhin übereinstimmenden Werten erhalten, auch in der JSON-Sicherung. Sie gelangen weder an die KI noch in den Verkaufsbericht. Regeln und Grenzen: [Fahrzeugdaten aus der VIN](VIN.de.md). Die Datenschutzerklärungen der Veröffentlichung müssen diesen freiwilligen Datenfluss und den Export genauer GPX-Fahrten berücksichtigen.
