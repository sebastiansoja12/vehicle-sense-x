[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX — mobile App

React Native 0.88.1, Expo SDK 58, React 19.3 und TypeScript 6. Quellversion 0.6.0. Die eigene Garage startet leer; die App hat keinen Demonstrationsmodus, kein Beispielfahrzeug und keinen Messwertgenerator. Im übergeordneten Verzeichnis ist ein separater früherer HTML-Prototyp erhalten.

Quellstand 0.6.0/Build 8 ergänzt einen separaten vollständigen CAN-Scan mit CALID, CVN und Steuergerätename. Cockpit, Emissionsbereitschaft, Öltemperatur und Werkstattvergleiche aus main bleiben erhalten. [Anleitung und Umfang](ECU-IDENTIFICATION.de.md)

## Starten

Node 24.18.0 (`.nvmrc`), npm. Im Verzeichnis `mobile/`:

```sh
nvm use
npm ci
npm run web
```

Vorschau der aktuellen Sitzung: **http://127.0.0.1:8083/**. Bluetooth und direkte TCP-Verbindungen zum Adapter funktionieren ausschließlich in der kompilierten iOS-/Android-App. Expo Go und Browser enthalten diese Treiber nicht. Die lokale Vorschau ist von einem installierbaren APK/IPA zu unterscheiden.

## Implementierte Module

- Garage für mehrere Autos, Fahrzeugauswahl, Bearbeiten und Löschen samt zugeordneten Datensätzen. Das Formular bietet einen Offline-Katalog für Marken und Modelle mit Suche sowie eine vollständige manuelle Eingabe fehlender Autos. Die VIN kann manuell eingegeben oder aus einem unterstützenden CAN-Steuergerät gelesen werden; das Speichern der ausgelesenen Nummer erfordert Vorschau und Bestätigung. Optional sind Angaben zu Leistung, Drehmoment, Hubraum, Getriebe, Antrieb und Ausstattung sowie eigene Fotos vom Telefon möglich.
- Kraftstoff und Kosten: Voll- und Teilbetankungen, Groschen/Milliliter, Verbrauch nach der Volltankmethode, Monat/Jahr, gewichteter Durchschnittspreis und geschätzte Kosten für 100 km.
- Wartung: Verlauf, Notizen, Kosten, PDF-Rechnungen/Fotos, Bearbeiten, Löschen, Termine nach Datum oder Kilometerstand. Lokale Datumsbenachrichtigung separat mit Systemzustimmung aktivierbar.
- Fahrten: manuelle Fahrten und GPS-Aufzeichnung bei geöffneter App. Pause im Hintergrund, auf dem Gerät gespeicherter Entwurf, Wiederherstellung nach Neustart, markierte Spurlücken, Fahrzeugwechselsperre während eines Entwurfs. Web Locks schützen vor gleichzeitiger Aufzeichnung in mehreren Tabs.
- Analyse: Strecke, Zeit, Geschwindigkeit und Beschleunigungs-/Bremsheuristiken aus gültigen GPS-Messungen. Fehlende Daten bleiben fehlende Daten; kein erzeugter Eco Score.
- OBD2: echte ELM327-Transporte über **Bluetooth BLE**, **Bluetooth Classic/SPP unter Android** und **WLAN/TCP**, Auslesen unterstützter PIDs, Spannung und drei DTC-Status, Verlauf und Import/Export von Berichten. Löschen erfordert eine aktuelle echte Messung, eine erhaltene Sicherung und separate Bestätigung; während eines GPS-Entwurfs ist es gesperrt.
- Zustand und Wert: datierte Diagnosequellen und Eigentümereinträge, Termine, Spanne/Median aus mindestens zwei vom Eigentümer angegebenen Angeboten der letzten 90 Tage; PDF-Bericht auf dem Telefon oder HTML im Web.
- Assistent: lokale Faktenübersicht und echter Aufruf eines konfigurierten OpenAI-Proxys nach Zustimmung. Keine vorbereiteten Antworten, die KI vortäuschen. Den API-Start beschreibt der [Server](../server/README.de.md).

CSV-Export umfasst getrennt Kraftstoff, Wartung, Besitzkosten und Fahrten. Eine vollständige JSON-Sicherung erhält alle Daten, auch VIN, Kennzeichen, Notizen, Fotos, Rechnungen und GPS-Koordinaten. Dateien sind auf 1 MB sowie 5 Anhänge pro Fahrzeug oder Wartungseintrag begrenzt; Fahrzeugfotos werden auf 1200 px verkleinert. Die Wiederherstellung validiert zunächst das Format, zeigt den Inhalt und erfordert die Bestätigung des Ersetzens der Garage. Benachrichtigungen aus einer Sicherung müssen erneut aktiviert werden. Das Sicherungsimportlimit beträgt 20 MB.

GPX-1.1-Export steht bei gespeicherten GPS-Fahrten neben JSON zur Verfügung. Er enthält echte gültige Punkte und UTC-Zeiten; Lücken bleiben getrennte Segmente, ohne erfundene Höhe oder Geschwindigkeit. Manuelle Einträge oder weniger als zwei gültige Punkte ergeben keine GPX-Datei. Die Datei enthält genaue Standorte und Zeiten.

Version 0.2.2 korrigiert veraltete Daten und Inhalte lokaler Wartungsbenachrichtigungen, ersetzt alte Zeitpläne einmalig und prüft sie bei Rückkehr in den Vordergrund erneut, auch nach Zeitzonenänderungen. Vordergrundbenachrichtigungen erscheinen lautlos. Die Einstellungen lesen die Version aus der Expo-Konfiguration. Diese Änderungen sind im geprüften signierten Android-0.2.2-AAB und iOS-Simulatorpaket enthalten.

## Besitzkosten

Unter Kraftstoff und Kosten lassen sich Versicherung, Parken, Maut, Steuern/Gebühren und andere Fahrzeugkosten hinzufügen. Jeder Eintrag hat Datum, Kategorie, Bezeichnung, PLN-Betrag und optionale Notiz; Bearbeiten oder Löschen nach Bestätigung ist möglich. Der Kilometerstand bleibt unverändert. Monats-/Jahressummen, Startseite und Zustandsbericht zählen jeden Eintrag einmal. Kosten pro 100 km schätzen nur Kraftstoff.

Das Ausgaben-CSV enthält Bezeichnungen und Notizen — vor Freigabe prüfen. Vollständige Sicherungen erhalten Einträge und Fahrzeuglöschung entfernt zugehörige Ausgaben. Diese Ausgabendetails bleiben außerhalb des KI-Kontexts und Verkaufsberichts; der Bericht enthält nur die Summe. Manuelle Eingabe und Sicherungsimport lehnen zukünftige Ausgabendaten ab; Lesen vorhandener Daten toleriert eine zurückgestellte Uhr. Version 0.3.0/Build 4 hat geprüfte signierte Android-AAB- und iOS-Simulatorpakete mit dieser Funktion.

## Offline-Katalog

Das Formular zum Hinzufügen/Bearbeiten eines Autos ermöglicht erst die Wahl der Marke, dann ihres Modells. Markenwechsel löscht das vorherige Modell; manuelle Eingabe und Moduswechsel erhalten die übrigen Felder. Zuvor eingegebene, im Katalog unbekannte Autos öffnen sich als manuelle Eingabe. Gespeichert wird das bisherige Fahrzeugformat — keine Migration und kein automatischer Austausch von Namen.

Mitgeliefert wird ein reproduzierbarer Teildatensatz von MeterApp vehicle-db: 563 Marken und 17.966 Modell-/Variantennamen aus NHTSA, UK DfT, EEA und RDW (~289 KB). Bei der Suche werden keine Daten heruntergeladen. Der Katalog bestätigt weder Produktionsjahr, Generation, Motor noch Ausstattung; diese Angaben ergänzt der Eigentümer. Varianten und uneinheitliche Quellnamen bleiben durchsuchbar, fehlende Autos können selbst eingegeben werden.

Quellen/Lizenzen sind an den Formularfeldern und in den Einstellungen verfügbar. Festgelegter Commit, Hash, Quellenbedingungen und Aktualisierungsanleitung: [Katalog](assets/catalog/README.de.md). Die Daten werden mit `node scripts/build-vehicle-catalog.mjs` erzeugt; normaler Start/Build erfordern keinen Katalogdownload.

## Adapter

**Bluetooth BLE:** Geräte suchen, eigenen Adapter auswählen und verbinden. Der native Treiber erkennt einen eindeutigen benutzerdefinierten seriellen Dienst anhand der tatsächlichen Eigenschaften der Characteristics. Passen mehrere Dienste, wird nicht geraten: UUIDs können in den erweiterten Einstellungen angegeben werden. Die Aufschrift „ELM327 Bluetooth“ allein bedeutet nicht BLE; Bluetooth Classic/SPP ist eine separate Android-Option: Adapter in den Systemeinstellungen koppeln und aus der Liste gekoppelter Geräte auswählen. Unter iOS BLE oder WLAN verwenden; Classic-/MFi-Zubehör erfordert ein individuelles Herstellerprotokoll.

**WLAN:** Das Telefon in den Systemeinstellungen mit dem Adapternetz verbinden und lokale IPv4-Adresse sowie TCP-Port aus der Anleitung angeben. Die App öffnet einen echten TCP-Socket, ohne Internetvermittler, WebSockets oder Simulation. Sie nutzt das Systemrouting und erzwingt nicht global ein Netz für sämtliche App-Verbindungen. Unter Android erfordert das Verhalten eines Adapternetzes ohne Internet bei gleichzeitig aktiven mobilen Daten einen Test des konkreten Telefons.

Unterstützt wird ein ELM327-ASCII-Stream. Bei ISO 15765-4 CAN werden tatsächliche ECU-Adressen erkannt; Steuergeräteauswahl und Zusammensetzung ihrer ISO-TP-Antworten sind möglich. Messungen, Codes und Löschen betreffen die ausgewählte ECU; ihre Adresse und ihr Protokoll bleiben in Verlauf und Berichten erhalten. Ältere Protokolle erfordern weiterhin einzelne unsegmentierte Antworten. Keine Garantie für Kompatibilität jedes Adapters oder Zugriff auf alle Steuergeräte des Autos. Details: [OBD](src/obd/README.de.md).

## VIN auslesen

Nach Auswahl eines CAN-Steuergeräts in der Diagnose kann lokal Modus 09 PID 02 abgefragt werden. Nicht jedes Steuergerät unterstützt dies. Die Nummer wird auf Format und Vollständigkeit geprüft; fehlende Daten, unvollständige Antworten und leere Nummern aus lauter Nullen werden verworfen. Speicherung im Profil erfordert Bestätigung, ändert Marke/Modell/Motor nicht und schützt eine zwischenzeitlich geänderte VIN. Die Quelle (Zeit, Adapter, ECU) bleibt bei der VIN und in der JSON-Sicherung. Manuelle Änderung der Nummer entfernt die alte Quelle. Es handelt sich um ein ECU-Auslesen ohne Bestätigung der Echtheit oder technischen Fahrzeugdaten. VIN und Quelle werden weder an KI gesendet noch im Verkaufsbericht aufgeführt.

Optional lässt sich das Formular nach separater Zustimmung zur Übertragung ausschließlich der VIN mit echten Daten von NHTSA vPIC ergänzen. Das Ergebnis bietet eine Vorschau und eine gesonderte Feldauswahl; standardmäßig sind nur leere Felder ausgewählt. Für Marke, Modell, Modelljahr, ganzzahligen Hubraum in cm³, Getriebe und Antrieb werden Quelle und Abrufzeit gespeichert. Änderungen an Feldern und VIN machen veraltete Zuordnungen ungültig. NHTSA garantiert weder Vollständigkeit noch die Abdeckung europäischer Fahrzeuge. Einzelheiten, Grenzen und Datenschutz: [Fahrzeugdaten aus der VIN](VIN.de.md).

## Speicherung und Datenschutz

Auf dem Telefon wird `expo-sqlite/kv-store` verwendet, damit größere GPS-Verläufe nicht an das Limit eines einzelnen AsyncStorage-Datensatzes unter Android stoßen. Ältere Daten werden validiert und kopiert, bevor die Kopie im alten Speicher entfernt wird. Web verwendet AsyncStorage/localStorage und Web Locks. Das Repository bestätigt den Zustand erst nach dauerhafter Speicherung; beschädigte Daten werden nicht durch eine leere Garage ersetzt. Die Schemata 1 und 2 werden auf 3 migriert. Das neue Format erhält Besitzkosten; ältere Apps können es nicht öffnen. Vor Rückkehr zu einer älteren Version eine Sicherung behalten.

Die Datenbank wird durch die App nicht zusätzlich verschlüsselt. Android hat die automatische App-Sicherung deaktiviert; das Verhalten von iOS-Systemkopien hängt auch von der Plattform ab. Die App enthält einen Bildschirm zu Daten und freiwilliger Übertragung von KI-Kontext. Vor Veröffentlichung muss eine öffentliche Datenschutzerklärung für den tatsächlichen Betreiber erstellt werden.

`EXPO_PUBLIC_ASSISTANT_URL` darf ausschließlich die öffentliche Serveradresse enthalten. Der OpenAI-Schlüssel liegt ausschließlich in der Serverumgebung; den Zugriffstoken gibt der Benutzer auf dem Assistentenbildschirm ein. Er wird nicht gespeichert und verschwindet beim Verlassen des Bildschirms. Keine Geheimnisse in öffentlichen Expo-Variablen konfigurieren.

## Prüfung und Builds

```sh
npm run verify
npm run export:web
npm run export:native
```

Tests für Modell, Repository, Parser, Migrationen und API-Client laufen in Node 24. HTTP-/TCP-Tests öffnen ausschließlich lokale Testports und führen keine kostenpflichtigen KI-Verbindungen aus. Der native Export erzeugt JavaScript-/Hermes-Bundles, **keine signierten IPA/APK/AAB**.

`eas.json` enthält die Profile `development`, `preview` (installierbares APK), `production` (AAB / iOS store) und `native-check` (Android-Release-APK und iOS-Release-Build für den Simulator). Das Projekt ist mit `@rubisco4471/vehiclesensex` verknüpft. Das Android-Release-APK zur Validierung wurde nach einer gezielten CNG-Korrektur für Classic BuildConfig erfolgreich gebaut; auch der iOS-Release-Build für den Simulator war erfolgreich. Beide Artefakte wurden geprüft. Der signierte Android-Produktions-AAB wurde mit einem neuen, ausdrücklich vom Benutzer genehmigten Expo-Keystore gebaut und geprüft. Ohne aktives Apple-Developer-Konto bleibt ein Store-IPA blockiert. Tests mit physischen Telefonen und Adaptern wurden nicht durchgeführt. Lokal stehen nur Command Line Tools statt vollständigem Xcode zur Verfügung, ohne Android SDK oder konfigurierten Emulator; Expo führt die Cloud-Builds aus. Einzelheiten: [Release-Anleitung](RELEASE.de.md) und [Buildbericht](../docs/verification/2026-11-26-native-builds.de.md).

## Verbleibender Produktumfang

Vollständiges Dekodieren der Werksdaten für alle Marken, externe Bewertung, Kartenunterlage, Hintergrundaufzeichnung, Konten und Synchronisierung fehlen noch. Verfügbar ist ein begrenzter, ausdrücklich gekennzeichneter Abruf von NHTSA-Daten anhand der VIN. Die noch ausstehenden Funktionen werden nicht als funktionsfähig dargestellt. Vor Veröffentlichung sind außerdem echte Adapter-/Telefontests, Signaturen, Metadaten und Betreiber-Datenschutzerklärung sowie Bereitstellung und Konfiguration eines eigenen Servers erforderlich, sofern KI aktiv sein soll.

Version 0.2.1/Build 2 enthält GPX und NHTSA-Datenergänzung im geprüften signierten Android-AAB und iOS-Simulatorpaket; siehe [Buildbericht 0.2.1](../docs/verification/2026-11-26-vin-gpx-builds.de.md). Das aktuelle signierte Vorschau-APK hat Version 0.5.0/Build 7; das frühere 0.2.0-Validierungs-APK ist historisch. Tests auf physischen Geräten und ein signiertes Store-IPA stehen noch aus.

## API-Quellen

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/)
- [TCP Socket — offizielle API](https://github.com/Rapsssito/react-native-tcp-socket), [BLE](https://dotintent.github.io/react-native-ble-plx/)
- [Expo Build profiles](https://docs.expo.dev/build/eas-json/), [BuildProperties](https://docs.expo.dev/versions/v58.0.0/sdk/build-properties/)

Version 0.4.0 ergänzt automatischen ECU-Scan, separate Live Data, Behandlung von Verbindungsverlust und einen Radio-Audiotest über System-Bluetooth. [0.4.0](../docs/verification/2026-11-26-obd-radio.de.md)

## 0.5.0

Version 0.5.0/Build 7 erweitert die Diagnose um einen Katalog mit 54 Standardmesswerten, Emissionsbereitschaft, Freeze Frame 0, auswählbare Live Data, ein Diagramm mit 300 Zyklen, Scanvergleiche und JSON/CSV/PDF/HTML-Export.

Der Basisscan liest Drehzahl, Kühlmittel, Last, Adapterspannung und verfügbare Fehlerstatus. Ein separater erweiterter Scan fragt unterstützte Katalogeinträge, Bereitschaftsmonitore mit PID 01 und Freeze Frame 0 ab. Dies bestätigt keinen Zugriff auf alle Steuergeräte oder Herstellerdiagnosen. Fehlende Daten bleiben unbekannt.

Live Data unterstützt bis zu 8 gemeldete PIDs. Die Pause von 2/5/10 Sekunden beginnt nach Abschluss des vorherigen Zyklus; die tatsächliche Frequenz hängt vom Adapter ab. Das Diagramm hält die letzten 300 Zyklen im Sitzungsspeicher. Fehlende Messungen und Wiederaufnahmen erzeugen getrennte Abschnitte. CSV vor dem Verlassen des Bildschirms oder einem Fahrzeugwechsel exportieren; Sitzungen werden nicht automatisch in der Garage gespeichert.

Der vollständige Bericht behält während Live Data seinen Zeitstempel und seine Codes. Er lässt sich im Verlauf speichern, als JSON/CSV herunterladen oder in der nativen App als PDF und im Browser als HTML exportieren. Der Verlauf bietet Suche und Seiten mit 20 Einträgen. Vergleiche erfordern dasselbe Fahrzeug sowie ausdrücklich übereinstimmende CAN-ECU-Adresse und Protokoll; ältere Berichte ohne Bereich bleiben lesbar und exportierbar. Nur gemeinsame DTC-Status werden verglichen. Ein nicht erneut gemeldeter Code bestätigt keine Reparatur.

Zum Löschen werden der exakte aktuelle Bericht, eine gespeicherte Kopie, die Bestätigung ihrer Aufbewahrung und eine separate Befehlsbestätigung benötigt. PDF/CSV ersetzt keine vollständige JSON- oder Verlaufssicherung. Nach Live Data ist ein neuer vollständiger Scan erforderlich. Trennen kann einen bereits gesendeten Löschbefehl nicht zurücknehmen. Ein abgebrochener Scan ersetzt den vorherigen abgeschlossenen Bericht nicht.

[Umfang und Prüfung](../docs/verification/2026-11-27-advanced-diagnostics.de.md)

## Empfohlenes Zubehör

„Polecane akcesoria“ lässt sich über Start oder Garage öffnen. Das Modul verwendet die Marke des aktiven Fahrzeugs. Es bietet die Kategorien Schutz, Transport, Komfort und Pflege sowie eine Suche ohne Unterscheidung von Großschreibung und Akzenten. VW und Škoda werden ebenfalls erkannt. Ein Fahrzeugwechsel aktualisiert Vorschläge und setzt Filter zurück.

Das Modul umfasst alle 563 Marken des Garagenkatalogs und beliebige manuell eingegebene Marken. Jede bietet Vorschläge in allen vier Kategorien und Schaltflächen zur Allegro-Angebotssuche nach Marke, Modell, Modelljahr und Zubehörart. Geprüfte Herstellerkataloge sind zusätzlich für 19 Marken verfügbar, darunter Mercedes-Benz, Honda, Volvo, Nissan, Lexus, SEAT, Tesla, Peugeot und Opel. Für andere Marken sind sie keine Voraussetzung zur Nutzung des Moduls. Die Liste funktioniert offline; Kataloge und Angebotssuchen öffnen sich nach einem Klick und benötigen Internetzugang. Die Quellen wurden am 26.–27. November 2026 geprüft. Jeder Vorschlag beschreibt Zweck und Prüfungen vor dem Kauf; BMW Travel & Comfort und Dacia YouClip erscheinen nur bei der jeweiligen Marke.

Dies sind Empfehlungen für Zubehörarten ohne Bestätigung, dass ein bestimmtes Teil zur Generation, Karosserie oder zum Modelljahr passt. Preise und Verfügbarkeit beim Verkäufer prüfen. Nach dem Drücken von „Szukaj ofert“ erhält Allegro ausschließlich Marke, Modell, Modelljahr und Zubehörart. VIN, Kennzeichen, Historie und Notizen werden nicht übermittelt. Herstellerkataloge erhalten keine Fahrzeugdaten von der App. Angebote werden nicht im Hintergrund abgerufen; Suchanfragen garantieren weder Ergebnisse noch Teilekompatibilität, besonders bei historischen und seltenen Marken.

Werkstätten aus OpenStreetMap und Teileangebote von eBay erscheinen direkt in der App. Privaten Server konfigurieren; Preise benötigen zusätzlich eBay-Browse-API-Zugang. [VehicleSenseX Services](SERVICES.de.md)

[Diagnosevergleich und Werkstattbericht](DIAGNOSTIC-COMPARISON.de.md)

## Radio ohne Adapter, CarPlay und Android Auto

Verbindungen unterstützt Radio-Audio unabhängig von OBD2: Bluetooth-Einstellungen, Klangtest, manuelles Vorlesen der lokalen Fahrzeugübersicht und Audioausgänge des Telefons. Die Übersicht enthält Marke/Modell, gespeicherten Kilometerstand, Verbrauch aus Tankdaten und Anzahl erreichter Servicetermine. VIN, Kennzeichen, Termintitel und Notizen bleiben ausgenommen. Die Systemsprachausgabe verarbeitet den Text; Offline-Stimmen hängen von der Telefonkonfiguration ab. Vorlesen stoppt beim Verlassen der Ansicht oder im Hintergrund.

Ein lokales Expo-Modul liest den aktuellen Audioweg der iOS-Sitzung und verfügbare Android-Audioausgänge. Die Android-Liste bestätigt keinen aktiven Ausgang; auch Car Audio unter iOS bestätigt keine App-Projektion. Gerätenamen werden weder gespeichert noch an Server gesendet. Aktualisierung erfolgt manuell und bei Rückkehr zur App. Ältere Builds oder Expo Go erklären, dass das Modul neu kompiliert werden muss; Pairing und Sprachausgabe bleiben verfügbar.

CarPlay/Android Auto können mit kompatiblem Radio ohne OBD2-Adapter funktionieren — über USB mit Datenübertragung oder unterstützten drahtlosen Modus mit WLAN. Gewöhnliches Bluetooth-Radio erhält diese Systeme nicht durch ein App-Update. Das animierte Cockpit bleibt eine App-Ansicht; optionaler CarPlay-Listencode ist standardmäßig deaktiviert und erfordert Apple-Genehmigung. CarPlay benötigt Apple-Entitlement, Profil und native Vorlagen; Android Auto benötigt eine unterstützte Kategorie und gesonderte Oberfläche. Ausgewählte Android-Car-Hardware-API-Daten hängen von Host und Berechtigungen ab; vollständiges DTC-Lesen/-Löschen dieser App nutzt weiterhin OBD2.

[CarPlay einrichten](https://support.apple.com/guide/iphone/connect-to-carplay-iph6860e6b53/ios) · [Android Auto einrichten](https://support.google.com/androidauto/answer/6348019) · [Apple-Anforderungen](https://developer.apple.com/documentation/carplay/preparing-your-ios-app-for-carplay-development) · [Android Car Hardware API](https://developer.android.com/training/cars/apps/library/car-hardware-api)

[Datenprüfung und OBD-Bereitschaft](VEHICLE-EVIDENCE.de.md)

[Cockpit, eigenes Fahrzeugfoto und CarPlay-/Android-Auto-Grenzen](COCKPIT.de.md)

[Verbrauchsdiagramme, Bauteilpläne und Öl](CONSUMPTION-MAINTENANCE.de.md)
