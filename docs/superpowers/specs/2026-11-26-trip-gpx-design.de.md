[Polski](2026-11-26-trip-gpx-design.md) | [English](2026-11-26-trip-gpx-design.en.md) | [Deutsch](2026-11-26-trip-gpx-design.de.md)

# GPX-1.1-Export

Umfang `originalTrips`: gespeicherte GPS-Fahrt neben dem vorhandenen JSON exportieren. Keine neuen Abhängigkeiten, Karten, Dienste oder Demodaten.

`tripGpx` validiert den vollständigen Datensatz und verwendet die Segmente von `analyzeTrip`. Jede Lücke, verworfene Messung und Pause bleibt ein eigenes `trkseg`; einzelne Punkte bleiben erhalten. Insgesamt sind mindestens zwei akzeptierte Punkte erforderlich. Manuelle Einträge, ungültige Datensätze und unzureichende Spuren erzeugen einen sichtbaren Fehler.

GPX enthält den XML-kodierten Namen, tatsächliche WGS84-Koordinaten und die UTC-Zeit jeder Messung; Höhe, Geschwindigkeit und Kilometerstand werden nicht ergänzt. Koordinaten verwenden Dezimalschreibweise; +180° wird zum gleichwertigen −180°. Unzulässige XML-Zeichen im Namen erzeugen einen Fehler.

Die Schaltfläche teilt `vehiclesensex-przejazd.gpx` als `application/gpx+xml` über das vorhandene `shareTextFile`. Ein Hinweis informiert über genaue Standorte und Messzeiten.

Quelle: [offizielles GPX-1.1-Schema](https://www.topografix.com/GPX/1/1/) (`gpxType`, `trkType`, `trksegType`, `wptType`).
