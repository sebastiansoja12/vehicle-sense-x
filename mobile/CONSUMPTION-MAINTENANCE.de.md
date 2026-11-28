[Polski](CONSUMPTION-MAINTENANCE.md) | [English](CONSUMPTION-MAINTENANCE.en.md) | [Deutsch](CONSUMPTION-MAINTENANCE.de.md)

# Verbrauch, Bauteilpläne und Öl

Verbrauch und Wartung aus Garage, Kosten oder Service öffnen. Lokale Analyse des gewählten Autos ohne neues Konto/Abhängigkeiten. Fahrzeugwechsel setzt Formulare zurück. Keine Beispieldaten in der Garage.

## Kraftstoffdiagramme und Berechnung

6 oder 12 Monate bis zum Analysetag wählen. Geschlossene Voll-zu-voll-Zyklen umfassen Teilbetankungen zwischen Volltanks. Der erste Volltank ist Basis, seine Menge kein gemessener Verbrauch. Offene Zyklen zählen nicht zur Durchschnittsbildung. Mittelwert: gemessene Liter durch gemessene Kilometer mal 100, nach Distanz gewichtet statt arithmetischem Punktmittel.

Der ganze Zyklus gehört zum Abschlussdatum; echte Daten, Kilometerstände, Liter und Distanz sind sichtbar. Diagramm mit letzten 24 Zyklen im Bereich, Mittelwert über alle. Horizontale Achse: aufeinanderfolgende Zyklen, keine proportionale Zeit. Schaltflächen wählen Punkte, Textliste zeigt Werte. Zweites Diagramm: monatlich gekaufte Liter/Kosten. Monatskäufe sind nicht im Monat verbrannter Kraftstoff; fehlende Einträge belegen keine Fahrpause.

Zukünftige Tankungen ausgeschlossen. Doppelte/sinkende Kilometerstände unterbrechen Messungen mit Warnung. Danach sind neue gültige Basis und weiterer Volltank nötig. Garage, Diagramm und Bericht nutzen denselben Algorithmus. Genauigkeit hängt von vollständigen Einträgen und einheitlichem Tanken ab.

## Bauteil- und Flüssigkeitstermine

Bauteil, Kontrolle/Austausch, Basisdatum/-kilometer, km-/Monatsintervall und Quelle wählen. Basis aus letzten 10 Serviceeinträgen übernehmen oder manuell erfassen; Titel werden nicht automatisch zugeordnet. Keine universellen Zahlenintervalle. Handbuch der konkreten Motorversion und Nutzung beachten. Manche gelisteten Teile existieren im Auto nicht.

Bei beiden Intervallen gilt die erste erreichte Grenze. Monatsende auf letzten gültigen Tag begrenzt. Resttage/km und Intervallfortschritt sind Planung, kein gemessener Verschleiß. Kilometer basieren auf manueller Garage ohne Hintergrundüberwachung oder Datumsprognose aus Fahrleistung.

Service speichern erzeugt tatsächlichen Service/Kosten und Folgetermin atomar, schließt alten Termin und berechnet ab tatsächlicher Wartung. Vorhandene Reparaturen nicht doppelt speichern, sondern Basis anhand bestehendem Eintrag bearbeiten. Planänderung beweist keine Reparatur. Datumsbenachrichtigungen separat im Service aktivieren; aktivierte Planmeldung geht mit neuer ID auf Folgezyklus über, abhängig von Systemberechtigung. Manuelle Erinnerungen bleiben.

## Öl und OBD-Möglichkeiten

Vollscan fragt unterstützte PID-Seite 40 nur nach Ankündigung, PID 5C nur bei Unterstützung ab. Öltemperatur ist weder Stand, Druck noch Restlebensdauer. Quelle/Zeit/ECU sichtbar, Importe gekennzeichnet. Null bleibt Null, fehlend bleibt unbekannt; ungültige Frames/Timeouts brechen ab. Keine neue Live-Data-Abfrage. Ältere Berichte können den Wert nicht enthalten.

Protokoll erfasst/korrigiert manuelle Standkontrolle, echte Nachfüllmenge und optional abgeschriebene Restlebensdauer aus Fahrzeuganzeige. Kein OBD-Nachweis. In Service/Kosten, ohne Wechselintervall oder Fahrzeuganzeige zurückzusetzen; verdrängt keine Reparatur als Diagnosevergleichsbasis. Temperatur/Prozent bestimmen weder Nachfüllmenge noch Wechseltermin. Stand außerhalb Bereich nach Fahrzeughandbuch aktuell prüfen.

## Daten, Export und Grenzen

Optionale Felder bestehender Einträge/Erinnerungen ohne Garagenschemawechsel. JSON-Sicherungen erhalten Pläne, Beobachtungen und Temperatur. Berichte enthalten Intervallquellen; Service-CSV ergänzt Ölspalten. Titel/Quellen/Notizen werden exportiert, vor Weitergabe prüfen. Simulierte Transporttests und Exporte ersetzen keine physische Adapterprüfung.

Technische Quellen: [Expo 58 SVG](https://docs.expo.dev/versions/v58.0.0/sdk/svg/), [python-OBD Öltemperatur-PID](https://github.com/brendan-w/python-OBD/blob/master/obd/commands.py). Kein Bibliothekscode kopiert/keine Abhängigkeit ergänzt. Trennung Standkontrolle/Wechselanzeige: [Ford Standkontrolle](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G1612710&Uid=G1724246&buildtype=web%2F1000&countryCode=USA&div=f&languageCode=en&moidRef=G539653&userMarket=USA&vFilteringEnabled=False&variantid=4163), [Rücksetzung nach Wechsel](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G2254282&Uid=G2245241&buildtype=web&countryCode=USA&div=f&languageCode=en&userMarket=ZAF&vFilteringEnabled=False&variantid=8921). Keine universellen Intervalle für andere Fahrzeuge.
