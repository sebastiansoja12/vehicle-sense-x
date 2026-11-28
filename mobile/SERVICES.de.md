[Polski](SERVICES.md) | [English](SERVICES.en.md) | [Deutsch](SERVICES.de.md)

# Werkstätten und Teilepreise

Die neuen Seiten sind über Start, Garage und Wartung auch ohne Fahrzeug erreichbar. Ergebnisse erscheinen direkt in der App. Kauf, Navigation und Anrufe öffnen die gewählte Webseite oder System-App.

## Privaten Server einrichten

Der Server funktioniert unabhängig von KI. Falls noch keine Konfiguration existiert, eine lokale Umgebungsdatei aus dem Beispiel erstellen; keine vorhandene Datei ersetzen. Privaten Token nach dem Kommentar im Beispiel generieren. Für Werkstätten genügt der App-Token. Echte Preise benötigen ein eBay-Developer-Produktionskonto, Zugangsdaten und freigegebenen Browse-API-Zugriff; ausgefüllte Felder garantieren keinen Zugang. Anbieterschlüssel niemals in der App oder öffentlichen Variablen speichern.

```dotenv
APP_API_TOKEN=<private-generated-token>
EBAY_CLIENT_ID=<production-client-id>
EBAY_CLIENT_SECRET=<production-client-secret>
ALLOWED_ORIGINS=http://127.0.0.1:8083
OVERPASS_URL=https://overpass-api.de/api/interpreter
NOMINATIM_URL=https://nominatim.openstreetmap.org/search
```

Nach der Konfiguration den Server aus dem Projektverzeichnis starten:

```sh
npm start --prefix server
```

In Einstellungen oder auf der ersten Werkstatt-/Teile-Seite Server-Origin und App-Token eintragen und Verbindung übernehmen. Browser benötigen den exakt freigegebenen Origin. HTTP ist nur auf Loopback für lokale Tests erlaubt. Auf dem Telefon bezeichnet Loopback das Telefon selbst: privates HTTPS-Hosting mit gültigem Zertifikat verwenden. Die öffentliche Variable darf nur die Serveradresse enthalten. Der Token bleibt im Sitzungsspeicher und lässt sich in Einstellungen entfernen. Er ist nicht Teil der Garagenkopie.

## Werkstätten

Polnischen Ort oder Adresse eingeben, zustimmen, suchen und passenden Ort auswählen. Alternativ einmaligen GPS-Punkt anfordern: Systemfreigabe, höchstens zwei Minuten alter Punkt und gemeldete Genauigkeit bis 5 km sind erforderlich. Kategorie und Radius 5, 10 oder 25 km wählen. Filteränderungen löschen alte Ergebnisse und erfordern erneute Suche. Bis zu 50 Orte, nach Luftlinie sortiert, mit bekannten Adressen, Telefonnummern, Öffnungszeiten und Webseiten. Öffnungszeiten sind Quelltext, ohne „jetzt geöffnet“-Behauptung. Fehlende Einträge beweisen nicht, dass keine Werkstätten existieren. Angaben und Qualität selbst bestätigen.

OpenStreetMap-Daten stehen unter ODbL. Nominatim löst Adressen auf, Overpass sucht Orte. Serverlimits: eine Geocodierung je 1,1 Sekunden und eine Werkstattsuche je 2 Sekunden, Cache mit bis zu 100 Ergebnissen (Orte 24 Stunden, Werkstätten 5 Minuten), gemeinsam 20 authentifizierte Versuche pro Minute und zwei aktive Operationen. Limits gelten pro Prozess. Öffentliche Standardinstanzen sind für mäßige private Nutzung. Vor öffentlicher Freigabe dedizierte Anbieter, gemeinsames Gateway-Limit und Benutzerauthentifizierung nutzen. Anbieteradressen sind auf dem Server ohne App-Update änderbar. Kein Polling und keine Autovervollständigung.

## Teile

Teilename oder OEM-Nummer eingeben. Optionaler Fahrzeugtext ergänzt nur Marke, Modell, Jahr und Motor; Vorschau zeigt die genaue Anfrage. VIN, Kennzeichen, Kilometerstand und Historie werden ausgeschlossen. Textsuche bestätigt keine Passform. Der Server lädt bis zu 20 Festpreisangebote für den polnischen Markt und Lieferung nach Polen, in eBay-Reihenfolge. Angezeigt werden Preis, Originalwährung, bekannte Versandkosten, Verkäufer, Zustand, Quelle und Abrufzeit. Arbeitskosten sind ausgeschlossen; endgültiger Versand hängt von Adresse und Verkäuferoptionen ab.

Unbekannter Versand bleibt unbekannt. Preise in PLN/EUR/USD/GBP/CHF/CZK/SEK/DKK/NOK werden in 1/100-Einheiten gehalten; andere Währungen und ungültige Angebote mit Zähler übersprungen. Keine Umrechnung oder erfundenen Preise. Aktualisieren sendet eine neue Anfrage; der Server hält nur den OAuth-Token bis zum Ablauf. Fehlende Schlüssel, Berechtigungen oder Antworten liefern klare Fehler. Kein automatischer Kauf, keine Buchung, Zahlung oder OEM-Prüfung.

## Datenschutz und Prüfung

Anfragen erfordern Zustimmung und manuelle Aktion. Abbruch, Verlassen der Seite, Konfigurations- oder Fahrzeugwechsel dürfen keine verspäteten Ergebnisse im neuen Kontext anzeigen. Ergebnisse und Token nur im Speicher; der Servercache verknüpft Werkstätten nicht mit Nutzer oder Garage. Anbieter und Server sehen Verbindungs-IP-Adressen. Keine personenbezogenen Daten in Suchfelder schreiben. Protokollierung von Inhalt und Authentifizierungsheadern im Reverse Proxy deaktivieren.

Lokale Tests verwenden kontrollierten Anbietertransport ohne echte Schlüssel oder Kosten. Geprüft werden Validierung, Autorisierung unabhängig von KI, CORS, Fehler, Limits, Geldbeträge und unbekannter Versand, Abbruch und App-Kompilierung. OBD und Radio benötigen weiterhin Telefon und konkrete Hardwaretests. Die neue GPS-Freigabebeschreibung erfordert einen nativen Neubuild.

## Quellen

- [eBay Browse API](https://developer.ebay.com/develop/api/buy/browse_api)
- [eBay OAuth](https://developer.ebay.com/develop/guides/sell/authorization)
- [eBay marketplace support](https://developer.ebay.com/api-docs/buy/static/ref-marketplace-supported.html)
- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Overpass public instances](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)
- [OpenStreetMap ODbL](https://www.openstreetmap.org/copyright)
- [Expo SDK 58 Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
