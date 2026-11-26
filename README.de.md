[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

**Mobile Implementierung:** Das React-Native-/Expo-Projekt befindet sich unter [`mobile/`](mobile/README.de.md). Garage, Wartung, GPS-Fahrten und Diagnosemessungen werden lokal gespeichert. Hinzugekommen sind echte OBD-Verbindungen über Bluetooth BLE/WLAN, Berichte, Sicherungen und ein Assistentenserver. Den aktuellen Stand und die Voraussetzungen für die Veröffentlichung beschreibt `mobile/RELEASE.md`. Die folgende Beschreibung bezieht sich auf den erhaltenen HTML-Prototyp.

Interaktiver Produktentwurf für iOS und Android. Polnische Oberfläche, acht Module und ein responsives Layout zur Ansicht am Computer und auf dem Telefon. Dies ist ein funktionsfähiger Browserprototyp, keine zur Veröffentlichung in den Stores fertige App.

Die vollständige Dokumentationsübersicht steht unter [Dokumentation](docs/README.de.md).

## Starten

Voraussetzungen: Python 3 sowie Node.js 20+ für die Tests. Keine Installation von Abhängigkeiten erforderlich.

```sh
npm start
```

http://127.0.0.1:5173 öffnen. Logiktests: `npm test`.

## Ausrichtung von Produkt und Oberfläche

Versprechen: **Dein Auto. Das ganze Bild.** Die Startseite beantwortet drei Fragen: Was erfordert Aufmerksamkeit, was kostet das Fahren und was ist zuletzt passiert? Helle, flache Oberfläche: gebrochenes Weiß, Graphit und sparsame rote Akzente. Das Fahrzeugprofil zeigt den Modellnamen groß und eine zugeschnittene Illustration. Daten und Aktionen stehen in durch Linien getrennten Abschnitten, ohne dekorative Instrumente, Farbverläufe, Seitenleiste oder Raster abgerundeter Kacheln. Einheiten, Quellen und Datumsangaben bleiben sichtbar. Farben werden immer durch Beschriftungen ergänzt. Kein willkürlicher Prozentwert für den Fahrzeugzustand.

Auf dem Telefon gibt es fünf Hauptregister: **Start, Diagnose, Fahrten, Kosten, Garage**. Über die Garage gelangt man zu Wartung, Zustand, Fahrstil und Assistent. Die Startseite führt zur Diagnose, zur nächsten Wartung und zur letzten Fahrt. Am Computer stehen dieselben fünf Register in einer horizontalen Navigation. Die übrigen Module sind über die Garage erreichbar.

| Modul | Geplanter Ablauf | Stand des Prototyps |
| --- | --- | --- |
| OBD2 Diagnostics | Verbindung → Auslesen → Fehlercodes und Parameter → Bericht | Ausdrücklich simulierte Verbindung und Prüfung; statische Parameter |
| My Garage | Profil → technische Daten → Datenquelle → weitere Fahrzeuge | Demoprofil und lokale Speicherung zusätzlicher Entwürfe; kein Wechsel der Daten zwischen Fahrzeugen |
| Drive Analytics | Zeitraum → messbare Ereignisse → GPS-/OBD2-Kontext | Zwei Beispielzeiträume; kein ungeprüfter Eco Score |
| Maintenance | Termin → Eintrag → Verlauf | Funktionsfähige Speicherung von Wartungen; statische Erinnerungen; keine Anhänge oder Systembenachrichtigungen |
| Fuel & Expenses | Tankvorgang → Übersicht → Verbrauch → Export | Formular, lokale Speicherung, Volltankmethode, CSV; monatlicher Trend aus einem separaten Demodatensatz |
| AI Car Assistant | Frage → Quelldaten → Interpretation und Unsicherheit | Vorbereitete Antworten, ohne Modell oder externe API |
| Trips | Fahrt auswählen → Schema → Strecke/Zeit/Kosten → Export | Drei Beispielfahrten und CSV; schematische Karte, ohne GPS |
| Vehicle Health & Value | Verfügbare Nachweise → Datenlücken → Verlauf → Bericht | Ausdrückliche Quellen und Lücken; TXT-Export; keine erfundene Bewertung |

Benutzereingaben werden vor der Anzeige kodiert. Tankvorgänge erfordern eine positive Menge und einen positiven Preis sowie einen nicht rückläufigen Kilometerstand. Die Beispiele beziehen sich auf den 25. November 2026; Formulare für neue Einträge verwenden das aktuelle Gerätedatum. Demonstrationsdaten und eigene Daten lassen sich nach Bestätigung in den Einstellungen zurücksetzen.

## Umfang der ersten mobilen Veröffentlichung

1. **Zuerst ein Hardwaretest:** eine Matrix konkreter Adapter und Fahrzeuge auf iPhone und Android. Protokoll, Bluetooth-Transport, PID-Umfang, Verbindungsabbrüche und Einschränkungen im Hintergrund prüfen. Die Bezeichnung ELM327 allein bestimmt nicht, ob ein Adapter mit beiden Systemen kompatibel ist. Den Produktionsstack erst nach diesem Test auswählen.
2. **Grundlage:** lokale Garage, mehrere Fahrzeuge mit getrennten Datensätzen, Tankvorgänge, Wartung und Export. Konto optional; Synchronisierung als separate Funktion. Offlinedaten und ausdrücklich sichtbare Synchronisierungskonflikte.
3. **Diagnose:** unterstützte PIDs auslesen, Einheiten, Messzeit, DTC-Status, Verlauf und Bericht. Fehlende Daten sind von null zu unterscheiden. Fehlercodes erst nach Sicherung der Messung und separater Bestätigung löschen; nicht während der Fahrt.
4. **Fahrten:** manueller Start/Stopp, sichtbare Aufzeichnung und einfaches Löschen von Fahrten. Automatische Hintergrundaufzeichnung erst nach Tests zu Genauigkeit, Akkuverbrauch und Akzeptanz der Berechtigungen hinzufügen.
5. **Assistent:** ausschließlich freigegebener Kontext, nachvollziehbare Quellen für DTC-Beschreibungen, Trennung von Fakten und Hypothesen, Zustimmung zur Datenübertragung. Eine Modellantwort niemals als Nachweis für die Funktionsfähigkeit behandeln.
6. **Folgeveröffentlichung:** VIN-Anbieter, aktuelle Vergleichsdaten zur Bewertung, verifizierte Eco-Driving-Methode, PDF, Rechnungen und Fotos. Diese Integrationen erst nach Auswahl der Anbieter und Klärung der Datenrechte zusagen.

Langfristig nutzt ein separater mobiler Client native Bluetooth-/GPS-Funktionen, lokalen Speicher und eine optionale API für Synchronisierung, KI und externe Daten. Zugangsdaten der Anbieter bleiben auf dem Server. OBD2-Daten, GPS-Daten und manuelle Einträge müssen Quelle, Einheit und Datum behalten; fehlender Zugriff auf eine Quelle blockiert die anderen Module nicht.

## Vorbereitung für App Store und Google Play

Quellenstand geprüft am 25. November 2026. Die folgenden Anforderungen beeinflussen den Entwurf; der Prototyp setzt den Veröffentlichungsprozess nicht um und garantiert keine Zulassung.

- **Berechtigungen im Nutzungskontext:** Bluetooth beim Koppeln, GPS beim Start einer Fahrt, Benachrichtigungen beim Anlegen einer Erinnerung, Fotos beim Hinzufügen eines Anhangs. Auch nach einer Ablehnung funktionsfähig bleiben. Android unterscheidet Bluetooth-Berechtigungen nach Betriebssystemversion: [Bluetooth permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
- **Datenschutz:** Datenschutzerklärung in der App und in den Metadaten; Store-Angaben, die dem tatsächlichen SDK-Verhalten entsprechen. Fahrten, VIN, Fotos, Analysen und die Weitergabe von Daten an KI erfordern bewusste Entwurfsentscheidungen. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311).
- **Kontolöschung:** Wenn die App die Erstellung von Konten ermöglicht, muss der Entwurf das Löschen von Konto und Daten umfassen. Google Play verlangt außerdem einen funktionierenden Weg über das Web. [Apple](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion), [Google Play](https://support.google.com/googleplay/android-developer/answer/13327111).
- **App-Prüfung:** Prüfenden Zugang zu Funktionen und Demonstrationsdaten sowie die benötigten Ressourcen für Hardwarefunktionen bereitstellen; die Abhängigkeit vom Adapter klar erläutern. [Apple — Before You Submit](https://developer.apple.com/app-store/review/guidelines/).
- **Vor der Einreichung:** native Builds und Signaturen, Symbole und Screenshots, Barrierefreiheit, Gerätetests, Umgang mit fehlendem Netz und verweigerten Berechtigungen, Adapterfehlern und Akkubeschränkungen sowie vollständige Prüfung der aktuellen Store-Anforderungen für die gewählte Distribution und das Zahlungsmodell.

## Einschränkungen und Überprüfung

Die Unit-Tests decken Verbrauchsberechnung, Tankvalidierung und sichere CSV-Zellen ab. Der Prototyp enthält kein Backend, keine Konten, Zahlungen, echte Diagnose, Systembenachrichtigungen oder Store-Pakete. Schriftarten von Google Fonts erfordern eine Verbindung; eine Systemschrift dient als Ersatz. In der mobilen Veröffentlichung müssen Schriftarten mitgeliefert werden. Browserspeicher ist kein sicherer Speicher für Produktionsdaten.

## Automatische Prüfungen

Der GitHub-Actions-Workflow `.github/workflows/verify.yml` prüft Pushes und Pull Requests mit Node aus `mobile/.nvmrc`, festgelegten mobilen Abhängigkeiten, der vollständigen Testsuite, TypeScript, Lint, allen drei Dokumentationssprachen sowie Web-/Native-JavaScript-Exporten. Er verwendet festgelegte offizielle Actions und reine Leserechte für das Repository. Er signiert, verteilt oder veröffentlicht keine Apps, verwendet keine Anbieterzugangsdaten und ruft keine kostenpflichtigen APIs auf.

Im Hauptverzeichnis des Repositories nach Installation der mobilen Abhängigkeiten:

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
```

Die Dokumentationsprüfung benötigt Python 3.9+ und Git. Sie prüft vollständige Sprachvarianten, Sprachnavigation, lokale Ziele, Befehlsblöcke, Bezeichner sowie Überschriften-/Checkboxstruktur; sie beurteilt keine Übersetzungsqualität. Quellprüfungen ergänzen die nativen Builds und Gerätetests aus der [Releaseanleitung](mobile/RELEASE.de.md).
